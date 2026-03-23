"use client";

import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, ArrowRight, Loader2, CheckCircle2, Fingerprint, AlertCircle } from "lucide-react";
import { useWalletClient, usePublicClient, useAccount } from "wagmi";
import { arkhaiService } from "@/lib/arkhai-service";
import { selfService } from "@/lib/self-service";
import { SelfQRcode } from "@selfxyz/qrcode";
import {
    CUSD_ADDRESS,
    CELO_ADDRESS,
    USDT_ADDRESS,
    USDC_ADDRESS,
    AEGIS_AGENT_REGISTRY_ADDRESS,
    AEGIS_ESCROW_ADDRESS,
    AegisAgentRegistryAbi,
    ARKHAI_ERC20_ESCROW_OBLIGATION
} from "@/lib/contracts";
import { parseUnits } from "viem";
import {
    requestMandatePermissions,
    setupAegisSessionAccount,
    isAccountUpgraded
} from "@/lib/metamask-service";
import { cn } from "@/lib/utils";

const AEGIS_SESSION_SEED = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Demo Key

export const AEGIS_LOGO = "https://aegis.xyz/logo.png";

interface CreateMandateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const TOKENS = [
    { symbol: "USDm", address: CUSD_ADDRESS, decimals: 18 },
    { symbol: "USDT", address: USDT_ADDRESS, decimals: 6 },
    { symbol: "USDC", address: USDC_ADDRESS, decimals: 6 },
];

export function CreateMandateModal({ open, onOpenChange }: CreateMandateModalProps) {
    const [step, setStep] = useState(0); // 0: Identity, 1: Mandate, 2: Goal, 3: Delegation
    const [grantedPermissions, setGrantedPermissions] = useState<any>(null);
    const [isIdentityVerified, setIsIdentityVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const [isCheckingVerification, setIsCheckingVerification] = useState(true);
    const [isAccountSmart, setIsAccountSmart] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        budget: "",
        token: "USDm",
        strategy: "balanced",
        goal: "",
        vendor: ""
    });

    // Check if player is already verified on mount
    useEffect(() => {
        const checkVerification = async () => {
            if (!address) {
                const timer = setTimeout(() => setIsCheckingVerification(false), 2000);
                return () => clearTimeout(timer);
            }
            if (!publicClient) return;

            setIsCheckingVerification(true);
            const userAddr = address.toLowerCase();
            const sessionVerified = localStorage.getItem(`aegis_verified_${userAddr}`);
            if (sessionVerified === 'true') {
                setIsIdentityVerified(true);
                setStep(1);
                setIsCheckingVerification(false);
                return;
            }

            try {
                const balance = await publicClient.readContract({
                    address: AEGIS_AGENT_REGISTRY_ADDRESS,
                    abi: AegisAgentRegistryAbi,
                    functionName: 'balanceOf',
                    args: [address]
                });

                if (Number(balance) > 0) {
                    setIsIdentityVerified(true);
                    localStorage.setItem(`aegis_verified_${userAddr}`, 'true');
                    setStep(1);
                }

                // EIP-7702 Check
                const upgraded = await isAccountUpgraded(address);
                setIsAccountSmart(upgraded);
            } catch (err) {
                console.error("Error checking verification:", err);
            } finally {
                setIsCheckingVerification(false);
            }
        };
        checkVerification();
    }, [address, publicClient]);

    const isStepValid = () => {
        if (step === 0) return isIdentityVerified;
        if (step === 1) return formData.name.length > 0 && formData.budget.length > 0 && (formData.vendor.startsWith('0x') || formData.vendor.length === 0);
        if (step === 2) return formData.goal.length > 1;
        if (step === 3) return !!grantedPermissions || !isLoading;
        return true;
    };

    const handleDelegate = async () => {
        setIsLoading(true);
        setError(null);
        try {

            console.log("Setting up Agent Session Account...");
            const sessionAccount = await setupAegisSessionAccount(AEGIS_SESSION_SEED as `0x${string}`);

            const selectedToken = TOKENS.find(t => t.symbol === formData.token);
            if (!selectedToken) throw new Error("Token not found");

            console.log("Requesting Advanced Permissions (ERC-7715)...");
            const permissions = await requestMandatePermissions(
                address!,
                sessionAccount.address,
                selectedToken.address as `0x${string}`,
                formData.budget,
                selectedToken.decimals,
                `Budget delegation for mandate: ${formData.name}`
            );

            console.log("Permissions granted:", permissions);
            setGrantedPermissions(permissions);
            // No automatic step move here, button will handle it
        } catch (err: any) {
            console.error("Delegation failed:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthorize = async () => {
        console.log("handleAuthorize triggered", { step, formData, address, hasWallet: !!walletClient });
        if (!walletClient || !address) {
            setError("Wallet not connected. Please connect your wallet.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const selectedToken = TOKENS.find(t => t.symbol === formData.token);
            if (!selectedToken) throw new Error("Token not found");
            const amount = parseUnits(formData.budget, selectedToken.decimals);

            console.log("Checking token approval...");
            await arkhaiService.checkAndApproveToken(
                publicClient,
                walletClient,
                selectedToken.address as `0x${string}`,
                AEGIS_ESCROW_ADDRESS,
                amount
            );

            const missionGoal = `Mandate: ${formData.name}. Strategy: ${formData.strategy}. Goal: ${formData.goal}`;
            console.log("Creating mission escrow...", { missionGoal, amount, vendor: formData.vendor });

            const result = await arkhaiService.createMissionEscrow(
                walletClient,
                missionGoal,
                selectedToken.address as `0x${string}`,
                amount,
                formData.vendor as `0x${string}`,
                grantedPermissions
            );

            console.log("Mission escrow created successfully", result);
            setTxHash(result.hash);
            setIsSuccess(true);
            setIsLoading(false);

            // Sync goal to agent reasoning API
            try {
                await fetch('/api/agent/reasoning', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mandateId: result.attestationId,
                        missionGoal: formData.goal,
                        status: 'initializing',
                        log: 'Mission directive received from secure terminal.'
                    })
                });
            } catch (apiErr) {
                console.warn("Failed to sync directive to agent:", apiErr);
            }
            setTimeout(() => {
                onOpenChange(false);
                setIsSuccess(false);
                setTxHash(null);
                setStep(1);
            }, 4000);
        } catch (err: any) {
            console.error("Authorization failed detail:", err);
            setError(err.message || "Transaction failed. Please check your balance.");
            setIsLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-2xl bg-[#161B22]/95 border-white/5 backdrop-blur-3xl p-0 flex flex-col overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-30" />

                <SheetHeader className="p-10 pb-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Shield strokeWidth={2.5} className="h-5 w-5 text-slate-500" />
                        </div>
                        <div className="h-px w-8 bg-white/10" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Protocol</span>
                    </div>
                    <div>
                        <SheetTitle className={cn("text-3xl font-black tracking-tight text-white uppercase leading-none", step === 3 && "text-[#F97316]")}>
                            {isSuccess ? "Mission Authorized" : step === 0 ? "Identity Verification" : step === 1 ? "Define Mandate" : step === 2 ? "Set Objectives" : "Secure & Delegate"}
                        </SheetTitle>
                        <SheetDescription className={cn("text-slate-400 font-black uppercase tracking-widest text-[9px] mt-2", step === 3 && "text-[#F97316]/60")}>
                            {isSuccess ? `Receipt: ${txHash?.slice(0, 20)}...` : step === 0 ? "Verify authority via ZK-Proof." : step === 3 ? "Advanced Permission Protocol (ERC-7715)" : "Deploying autonomous asset management."}
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <div className="flex-1 px-12 py-8 overflow-y-auto scrollbar-hide">
                    {isCheckingVerification ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                                <Loader2 strokeWidth={2.5} className="w-16 h-16 text-slate-400 animate-spin opacity-20" />
                                <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full animate-pulse" />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse font-mono text-center">Interrogating Registry...</p>
                        </div>
                    ) : isSuccess ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500 text-center">
                            <motion.div
                                initial={{ scale: 0.5, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="h-32 w-32 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)]"
                            >
                                <CheckCircle2 strokeWidth={2.5} className="h-16 w-16 text-white" />
                            </motion.div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Authorized</h3>
                                <p className="text-muted-foreground text-sm font-medium px-8">Funds secured in Aegis Escrow. Deployment sequence initiated.</p>
                                {txHash && (
                                    <a
                                        href={`https://explorer.celo.org/sepolia/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-white hover:underline text-[10px] font-black uppercase tracking-widest mt-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10"
                                    >
                                        View On-Chain Receipt <ArrowRight strokeWidth={2.5} className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {error && (
                                <div className="p-5 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start space-x-3 text-destructive animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-bold uppercase tracking-widest text-[9px] mb-1">Protocol Rejection</p>
                                        <p className="font-medium opacity-80">{error}</p>
                                    </div>
                                </div>
                            )}

                            {!isAccountSmart && step === 0 && !isCheckingVerification && (
                                <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl flex items-start space-x-4 text-yellow-500 animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-black uppercase tracking-widest text-[10px] mb-1">Upgrade Required</p>
                                        <p className="font-medium opacity-90">MetaMask Smart Account (EIP-7702) is required for Agent Delegation. Please switch to a Smart Account in MetaMask.</p>
                                    </div>
                                </div>
                            )}

                            {step === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-10 py-4 animate-in fade-in slide-in-from-right-8 duration-700">
                                    <div className="text-center space-y-4 max-w-sm">
                                        <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                            <Fingerprint strokeWidth={2.5} className="h-8 w-8 text-slate-500" />
                                        </div>
                                        <h2 className="text-xl font-black text-white tracking-tight uppercase">Identity Auth</h2>
                                        <p className="text-slate-400 text-xs leading-relaxed font-black uppercase tracking-tight opacity-60">
                                            Verified operators only. Scan via Self Protocol to provide your ZK-Proof.
                                        </p>
                                    </div>

                                    <div className="p-8 bg-white rounded-3xl shadow-2xl transform transition-transform hover:scale-[1.01]">
                                        {(() => {
                                            const config = selfService.getQRConfig(address || '');
                                            return (
                                                <SelfQRcode
                                                    selfApp={config as any}
                                                    onError={(error) => console.error("Self Verification Error:", error)}
                                                    onSuccess={async () => {
                                                        console.log("Self Scan Successful. Auto-verifying on-chain (Mock Mode)...");
                                                        setIsIdentityVerified(true);
                                                        if (address) {
                                                            localStorage.setItem(`aegis_verified_${address.toLowerCase()}`, 'true');
                                                            // PROACTIVE: Ensure the CFO is verified in the Mock Registry so lockFunds doesn't revert
                                                            try {
                                                                const { MOCK_SELF_REGISTRY_ADDRESS, AegisAgentRegistryAbi } = await import("@/lib/contracts");
                                                                if (walletClient) {
                                                                    await walletClient.writeContract({
                                                                        address: MOCK_SELF_REGISTRY_ADDRESS,
                                                                        abi: AegisAgentRegistryAbi,
                                                                        functionName: 'setVerified',
                                                                        args: [address, true]
                                                                    });
                                                                    console.log("On-chain mock verification synced.");
                                                                }
                                                            } catch (e) {
                                                                console.warn("Silent failure on mock verification - might already be verified or contract missing.", e);
                                                            }
                                                        }
                                                        setTimeout(() => setStep(1), 1500);
                                                    }}
                                                />
                                            );
                                        })()}
                                    </div>

                                    {isIdentityVerified && (
                                        <div className="flex items-center gap-3 text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
                                            <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_white]" /> Authority Confirmed
                                        </div>
                                    )}
                                </div>
                            ) : step === 1 ? (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Mission Identifier</label>
                                        <input
                                            className="w-full bg-[#121821] border border-white/10 rounded-xl p-4 text-lg font-black tracking-tight text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/10"
                                            placeholder="e.g. Q4 CLOUD PROCUREMENT"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Target Vendor (Optional)</label>
                                        <input
                                            className="w-full bg-[#121821] border border-white/10 rounded-xl p-4 text-[11px] font-mono text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/10"
                                            placeholder="0x..."
                                            value={formData.vendor}
                                            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Allocated Budget</label>
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            {TOKENS.map((t) => (
                                                <button
                                                    key={t.symbol}
                                                    onClick={() => setFormData({ ...formData, token: t.symbol })}
                                                    className={`py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${formData.token === t.symbol
                                                        ? 'bg-white/10 border-white/20 text-white shadow-lg'
                                                        : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {t.symbol}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full bg-[#121821] border border-white/10 rounded-xl p-6 text-3xl font-black tracking-tighter text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/10"
                                                placeholder="0.00"
                                                value={formData.budget}
                                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-600 text-lg tracking-widest">{formData.token}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : step === 2 ? (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Execution Directive</label>
                                        <textarea
                                            className="w-full h-40 bg-[#121821] border border-white/10 rounded-xl p-5 text-base font-black leading-relaxed tracking-tight text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/10 resize-none"
                                            placeholder="Specify mission goals for capital deployment..."
                                            value={formData.goal}
                                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                        />
                                    </div>

                                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden">
                                        <p className="text-[10px] text-slate-400 font-black leading-relaxed uppercase tracking-widest">
                                            Autonomous coordination with oracle arbiters will be established to verify fulfillment before settlement.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                                    <div className="p-6 bg-white/5 border border-[#F97316]/20 rounded-2xl space-y-5 shadow-[0_0_30px_rgba(249,115,22,0.05)]">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center">
                                                <Shield strokeWidth={2.5} className="h-5 w-5 text-[#F97316]" />
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-black text-white uppercase tracking-tight">Agent Authorization</h4>
                                                <p className="text-[10px] text-[#F97316] font-black opacity-60">Session permissions protocol.</p>
                                            </div>
                                        </div>

                                        {grantedPermissions ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 bg-[#35D07F]/10 border border-[#35D07F]/20 rounded-xl flex items-center gap-3"
                                            >
                                                <CheckCircle2 strokeWidth={2.5} className="h-4 w-4 text-[#35D07F]" />
                                                <p className="text-[10px] font-black text-[#35D07F] uppercase tracking-widest">Permissions Signed</p>
                                            </motion.div>
                                        ) : (
                                            <div className="space-y-4">
                                                <p className="text-[11px] text-slate-400 leading-relaxed font-black uppercase tracking-tight opacity-60">
                                                    Establishing a secure session for autonomous mission execution.
                                                </p>
                                                <Button
                                                    className="w-full h-11 rounded-lg bg-[#F97316] hover:bg-[#F97316]/80 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl"
                                                    onClick={handleDelegate}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "Sign Session Mandate"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-[9px] text-[#F97316]/80 font-black font-mono text-center uppercase tracking-[0.2em] mt-4">
                                        Powered by MetaMask Smart Accounts Kit & ERC-7710
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <SheetFooter className="p-10 border-t border-white/5 bg-black/40">
                    <div className="w-full flex items-center justify-between gap-6">
                        {!isSuccess && step > 0 && (
                            <Button
                                variant="ghost"
                                className="h-12 px-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400 hover:text-white transition-colors"
                                onClick={() => setStep(step - 1)}
                                disabled={isLoading}
                            >
                                Back
                            </Button>
                        )}
                        {!isSuccess && (
                            <Button
                                className={cn(
                                    "flex-1 h-12 bg-white hover:bg-slate-200 text-black font-bold uppercase tracking-[0.2em] text-[11px] rounded-xl shadow-xl transition-all active:scale-[0.98]",
                                    step === 0 && !isIdentityVerified && "hidden"
                                )}
                                disabled={!isStepValid() || isLoading}
                                onClick={() => {
                                    if (step === 0) setStep(1);
                                    else if (step === 1) setStep(2);
                                    else if (step === 2) setStep(3);
                                    else handleAuthorize();
                                }}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        {step === 1 ? "Mission Objectives" : step === 2 ? "Final Security" : "Broadcast Mandate"}
                                    </>
                                )}
                            </Button>
                        )}
                        {step === 0 && !isIdentityVerified && (
                            <div className="flex-1 h-12 border border-white/5 bg-white/5 rounded-xl flex items-center justify-center">
                                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-600 animate-pulse">Awaiting Proof Signature</span>
                            </div>
                        )}
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

function StrategyOption({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <div
            className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${active
                ? 'bg-white/10 border-white/20 shadow-inner shadow-white/5 text-white'
                : 'bg-white/5 border-white/5 text-muted-foreground hover:border-white/20'
                }`}
            onClick={onClick}
        >
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    );
}
