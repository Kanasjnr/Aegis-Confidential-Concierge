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
    const [step, setStep] = useState(0); // Step 0: Identity, 1: Mandate, 2: Goal
    const [isIdentityVerified, setIsIdentityVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const [isCheckingVerification, setIsCheckingVerification] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        budget: "",
        token: "USDm",
        strategy: "balanced",
        goal: ""
    });

    // Check if player is already verified on mount
    useEffect(() => {
        const checkVerification = async () => {
            // Wait for address to be available before making a decision
            if (!address) {
                // If after 2 seconds we still have no address, stop loading so player can connect
                const timer = setTimeout(() => setIsCheckingVerification(false), 2000);
                return () => clearTimeout(timer);
            }

            if (!publicClient) return;

            setIsCheckingVerification(true);
            const userAddr = address.toLowerCase();
            
            // Priority 1: Check session storage
            const sessionVerified = localStorage.getItem(`aegis_verified_${userAddr}`);
            if (sessionVerified === 'true') {
                setIsIdentityVerified(true);
                setStep(1);
                setIsCheckingVerification(false);
                return;
            }

            // Priority 2: Check on-chain registry
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
                    setStep(1); // Skip to Mandate selection
                }
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
        if (step === 1) return formData.name.length > 0 && formData.budget.length > 0;
        if (step === 2) return formData.goal.length > 10;
        return true;
    };

    const handleAuthorize = async () => {
        if (!walletClient || !address) return;

        setIsLoading(true);
        setError(null);
        try {
            const selectedToken = TOKENS.find(t => t.symbol === formData.token);
            if (!selectedToken) throw new Error("Token not found");

            const amount = parseUnits(formData.budget, selectedToken.decimals);
            
            // Step 1: Token Approval (MockA or USDm)
            await arkhaiService.checkAndApproveToken(
                publicClient,
                walletClient,
                selectedToken.address as `0x${string}`,
                AEGIS_ESCROW_ADDRESS,
                amount
            );

            // Step 2: Create Mission Escrow
            const missionGoal = `Mandate: ${formData.name}. Strategy: ${formData.strategy}. Goal: ${formData.goal}`;

            const result = await arkhaiService.createMissionEscrow(
                walletClient,
                missionGoal,
                selectedToken.address as `0x${string}`,
                amount
            );

            setTxHash(result.hash);
            setIsSuccess(true);
            setIsLoading(false);
            console.log(`${result.type === 'arkhai' ? 'Arkhai' : 'Aegis'} Authorization Successful:`, result.hash);

            // Keep success state longer so user can see it
            setTimeout(() => {
                onOpenChange(false);
                setIsSuccess(false);
                setTxHash(null);
            }, 4000);

        } catch (err: any) {
            console.error("Authorization failed:", err);
            setError(err.message || "Transaction failed. Please check your balance and try again.");
            setIsLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-xl bg-black/95 border-white/5 backdrop-blur-2xl p-0 flex flex-col overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-50" />

                <SheetHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div className="h-px w-8 bg-white/10" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">CFO Protocol</span>
                    </div>
                    <SheetTitle className="text-3xl font-black tracking-tighter text-white">
                        {isSuccess ? "Mandate Authorized" : step === 0 ? "Identity Verification" : step === 1 ? "Define New Mandate" : "Set Intelligence Goal"}
                    </SheetTitle>
                    <SheetDescription className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                        {isSuccess ? `Transaction hash: ${txHash?.slice(0, 10)}...` : step === 0 ? "Prove authority via Self Protocol ZK-Proof." : "Authorized by Celo Mainnet Identity."}
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 min-height-[400px] flex flex-col">
                    {isCheckingVerification ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-12 h-12 text-primary animate-spin opacity-50" />
                            <p className="text-muted-foreground animate-pulse">Syncing identity with Celo...</p>
                        </div>
                    ) : isSuccess ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in zoom-in duration-500">
                            <div className="h-24 w-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="h-12 w-12 text-green-500" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-semibold">Mandate Authorized!</h3>
                                <p className="text-muted-foreground">Your funds are now secured in the Aegis Escrow.</p>
                                {txHash && (
                                    <a 
                                        href={`https://explorer.celo.org/sepolia/tx/${txHash}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline text-sm block mt-2"
                                    >
                                        View on Explorer
                                    </a>
                                )}
                            </div>
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-4">
                                Done
                            </Button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            {error && (
                                <div className="mx-8 mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start space-x-3 text-destructive animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-semibold">Authorization Failed</p>
                                        <p className="opacity-90">{error}</p>
                                    </div>
                                </div>
                            )}
                            
                            {step === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-8 py-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center space-y-4 max-w-sm">
                                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Fingerprint className="h-8 w-8 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">Confidential Scan</h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Scanning the Self QR ensures only authorized human operators can supply mandates to your autonomous agent.
                                </p>
                            </div>

                            <div className="p-6 bg-white rounded-3xl shadow-2xl shadow-primary/10">
                                {(() => {
                                    const config = selfService.getQRConfig(address || '');
                                    console.log("Self QR Config Payload:", config);
                                    return (
                                        <SelfQRcode
                                            selfApp={config as any}
                                            onError={(error) => console.error("Self Verification Error:", error)}
                                            onSuccess={() => {
                                                setIsIdentityVerified(true);
                                                if (address) localStorage.setItem(`aegis_verified_${address}`, 'true');
                                                setTimeout(() => setStep(1), 1500);
                                            }}
                                        />
                                    );
                                })()}
                            </div>

                            {isIdentityVerified && (
                                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px] animate-pulse">
                                    <CheckCircle2 className="h-4 w-4" /> Identity Verified
                                </div>
                            )}
                        </div>
                    ) : step === 1 ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-primary/80">Mandate Identifier</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-lg font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-white/20"
                                    placeholder="e.g. Q2 Cloud Strategy"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-primary/80">Asset & Budget</label>
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {TOKENS.map((t) => (
                                        <button
                                            key={t.symbol}
                                            onClick={() => setFormData({ ...formData, token: t.symbol })}
                                            className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${formData.token === t.symbol
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-white/5 border-white/5 text-muted-foreground'
                                                }`}
                                        >
                                            {t.symbol}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl font-black tracking-tighter focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-white/20"
                                        placeholder="0.00"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground uppercase">{formData.token}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-primary/80">Risk Strategy</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <StrategyOption
                                        label="Aggressive"
                                        active={formData.strategy === "aggressive"}
                                        onClick={() => setFormData({ ...formData, strategy: "aggressive" })}
                                    />
                                    <StrategyOption
                                        label="Balanced"
                                        active={formData.strategy === "balanced"}
                                        onClick={() => setFormData({ ...formData, strategy: "balanced" })}
                                    />
                                    <StrategyOption
                                        label="Secure"
                                        active={formData.strategy === "secure"}
                                        onClick={() => setFormData({ ...formData, strategy: "secure" })}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-primary/80">Agent Objective</label>
                                <textarea
                                    className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-lg font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-white/20 resize-none"
                                    placeholder="Describe what the agent should achieve with this budget..."
                                    value={formData.goal}
                                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                />
                            </div>

                            <div className="glass-panel p-6 rounded-[2rem] border-primary/20 bg-primary/5">
                                <div className="flex items-start gap-4">
                                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-1" />
                                    <p className="text-xs text-primary/80 leading-relaxed font-medium">
                                        Arkhai NLA will analyze this goal and autonomously negotiate with vendors on your behalf. Funds are secured in an on-chain escrow obligation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

                <SheetFooter className="p-8 pt-0 border-t border-white/5 bg-black/40 text-left">
                    <div className="w-full flex items-center justify-between gap-4">
                        {!isSuccess && step > 0 && (
                            <Button
                                variant="ghost"
                                className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]"
                                onClick={() => setStep(step - 1)}
                                disabled={isLoading}
                            >
                                Back
                            </Button>
                        )}
                        {!isSuccess && (
                            <Button
                                className={`flex-1 h-14 bg-primary hover:bg-primary/90 text-background font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 disabled:opacity-30 transition-all active:scale-[0.98] ${step === 0 ? 'hidden' : ''}`}
                                disabled={!isStepValid() || isLoading}
                                onClick={() => {
                                    if (step === 1) setStep(2);
                                    else handleAuthorize();
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authorizing...
                                    </>
                                ) : (
                                    <>
                                        {step === 1 ? "Next Analysis" : "Authorize Mandate"}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        )}
                        {step === 0 && !isIdentityVerified && (
                            <div className="w-full h-14 flex items-center justify-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Awaiting ZK-Proof...</span>
                            </div>
                        )}
                        {isSuccess && (
                            <div className="w-full h-14 border border-primary/20 rounded-xl flex items-center justify-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Session Synchronized</span>
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
                ? 'bg-primary/10 border-primary shadow-inner shadow-primary/10 text-primary'
                : 'bg-white/5 border-white/5 text-muted-foreground hover:border-white/20'
                }`}
            onClick={onClick}
        >
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    );
}
