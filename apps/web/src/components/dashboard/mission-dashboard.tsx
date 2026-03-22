"use client"

import { useState, useEffect } from "react"
import { IdentityRibbon } from "./identity-ribbon"
import { WealthMatrix } from "./wealth-matrix"
import { AgentServiceStatus } from "./agent-service-status"
import { MissionStepper } from "./mission-stepper"
import { motion, AnimatePresence } from "framer-motion"
import { SelfQRcode } from "@selfxyz/qrcode"
import { selfService } from "@/lib/self-service"
import { arkhaiService } from "@/lib/arkhai-service"
import { useWalletClient, useAccount, usePublicClient } from 'wagmi'
import { Check, Shield, Lock, Fingerprint } from "lucide-react"
import { ARKHAI_ERC20_ESCROW_OBLIGATION, ARKHAI_TRUSTED_ORACLE_ARBITER } from "@/lib/contracts"

export function MissionDashboard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isVerified, setIsVerified] = useState(false)
  const [mandateText, setMandateText] = useState("")
  const [isDeploying, setIsDeploying] = useState(false)
  const [escrowInfo, setEscrowInfo] = useState<any>(null)
  const [escrowId, setEscrowId] = useState<bigint | null>(null)
  
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const publicClient = usePublicClient()

  useEffect(() => {
    if (currentStep === 4 && escrowId && publicClient) {
      console.log("Listening for Arkhai agent fulfillment for escrow:", escrowId.toString());
      const unwatch = arkhaiService.watchFulfillment(
        publicClient,
        escrowId,
        (fulfillment) => {
          console.log("Arkhai Fulfillment detected:", fulfillment);
          setCurrentStep(5);
        }
      );
      return () => unwatch();
    }
  }, [currentStep, escrowId, publicClient]);

  const steps: any = [
    { label: "Identity Verification", description: "Secured via Self Protocol ZK-Proof", status: isVerified ? "complete" : (currentStep === 1 ? "active" : "pending") },
    { label: "Agent Discovery", description: "Registry Sync: Agent Nova Authorized", status: currentStep > 2 ? "complete" : (currentStep === 2 ? "active" : "pending") },
    { label: "Mandate Definition", description: "Input Natural Language Instructions", status: currentStep > 3 ? "complete" : (currentStep === 3 ? "active" : "pending") },
    { label: "Terminal Oversight", description: "Awaiting Execution Authorization", status: currentStep > 4 ? "complete" : (currentStep === 4 ? "active" : "pending") },
    { label: "On-Chain Settlement", description: "Proof-Based Fund Release", status: currentStep === 5 ? "active" : "pending" },
  ]

  const allocation = [
    { label: "cUSD", value: 70, color: "#00E5FF" },
    { label: "CELO", value: 20, color: "#9CA3AF" },
    { label: "ETH", value: 10, color: "#2D3035" },
  ]

  const agentMetrics = [
    { label: "Uptime", value: "99.9%" },
    { label: "Active Tasks", value: "47" },
    { label: "Risk Profile", value: "Institutional" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <IdentityRibbon />
      
      <div className="flex-1 ledger-grid p-12 max-w-[1800px] mx-auto w-full">
        {/* Left Sidebar: Mission Control Stepper */}
        <aside className="col-span-3 border-r-[0.5px] border-border pr-12">
          <MissionStepper currentStep={currentStep} steps={steps} />
        </aside>

        {/* Center/Right: Main Insight Area */}
        <main className="col-span-9 pl-12 space-y-12">
          <WealthMatrix 
            tvl="$124,785,340.50" 
            trend="+1.8%" 
            allocation={allocation} 
          />
          
          <AgentServiceStatus 
            name="Agent Nova" 
            status="active" 
            task="Analyzing Market Liquidity on Celo for cUSD/CELO pool rebalancing. Initializing autonomous mandate definition for treasury optimization."
            metrics={agentMetrics}
          />

          {/* Active Workspace: Step 3 Mandate Input */}
          <AnimatePresence mode="wait">
             <motion.div 
               key={currentStep}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="p-12 border-[0.5px] border-border bg-card/5 min-h-[400px]"
             >
                {currentStep === 1 && (
                   <div className="flex flex-col items-center justify-center gap-8 py-10">
                      <div className="text-center space-y-4 max-w-md">
                         <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Fingerprint className="h-8 w-8 text-primary" />
                         </div>
                         <h2 className="text-2xl font-light">Human Verification Required</h2>
                         <p className="text-muted-foreground text-sm font-light">
                            Scan to provide a ZK-Proof of identity via Self Protocol. This ensures only authorized human operators can supply mandates.
                         </p>
                      </div>
                      
                      <div className="p-8 bg-white rounded-3xl shadow-2xl shadow-primary/10">
                         <SelfQRcode 
                            selfApp={selfService.getQRConfig() as any}
                            onError={(error) => console.error("Self Verification Error:", error)}
                            onSuccess={() => {
                               console.log("Self Verification Success");
                               setIsVerified(true);
                               setTimeout(() => setCurrentStep(2), 2000);
                            }}
                         />
                      </div>

                      {isVerified && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2 text-primary font-bold uppercase tracking-tighter"
                        >
                           <Check className="h-4 w-4" /> Identity Verified
                        </motion.div>
                      )}
                   </div>
                )}

                {currentStep === 2 && (
                   <div className="flex flex-col gap-8 max-w-3xl">
                      <div className="space-y-2">
                         <span className="text-label">Active Workspace — Step 2: Agent Discovery</span>
                         <h2 className="text-3xl font-light">Synchronizing with registry...</h2>
                      </div>
                      <div className="flex items-center gap-4 p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                         <Shield className="h-10 w-10 text-primary" />
                         <div>
                            <h3 className="font-bold text-lg">Agent Nova Found</h3>
                            <p className="text-sm text-muted-foreground">Authorized for Institutional Treasury Mangement on Celo Sepolia.</p>
                         </div>
                      </div>
                      <button 
                         className="w-fit px-10 py-3 bg-primary text-background font-black uppercase tracking-widest text-[11px]"
                         onClick={() => setCurrentStep(3)}
                      >
                         Continue to Mandate
                      </button>
                   </div>
                )}

                {currentStep === 3 && (
                   <div className="flex flex-col gap-8 max-w-3xl">
                      <div className="space-y-2">
                         <span className="text-label">Active Workspace — Step 3: Mandate Definition</span>
                         <h2 className="text-2xl font-light">Supply autonomous instructions to your agent.</h2>
                      </div>
                      
                      <textarea 
                        className="w-full h-48 bg-transparent border-none focus:ring-0 text-xl font-light text-white/90 placeholder:text-muted-foreground/30 resize-none leading-relaxed"
                        placeholder="Type your strategic intent in plain English... e.g., Allocate 500 cUSD to negotiate cloud storage renewal with a focus on uptime."
                        value={mandateText}
                        onChange={(e) => setMandateText(e.target.value)}
                      />

                      <div className="pt-8 flex justify-between items-center border-t-[0.5px] border-border">
                         <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                            Context: Institutional Treasury Management
                         </p>
                         <button 
                           className="px-10 py-3 border border-primary text-primary hover:bg-primary/5 text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-20"
                           disabled={!mandateText || isDeploying}
                           onClick={async () => {
                              if (!walletClient) return;
                              setIsDeploying(true);
                              try {
                                 // Create Arkhai Escrow
                                 const info = await arkhaiService.createMissionEscrow(
                                    walletClient,
                                    mandateText,
                                    '0x7c6c02b9c7588451e03e357dfd8c8724a22669c9' as `0x${string}`, // Mock Token A
                                    BigInt(100) * BigInt(10**18) // 100 Tokens
                                 );
                                 setEscrowInfo(info);
                                 
                                 // Fetch escrowId from logs
                                 if (publicClient) {
                                   try {
                                      const id = await arkhaiService.getEscrowIdFromLogs(publicClient, info.hash);
                                      if (id) {
                                         console.log("Escrow ID retrieved:", id.toString());
                                         setEscrowId(id);
                                      }
                                   } catch (logErr) {
                                      console.error("Failed to retrieve escrowId:", logErr);
                                   }
                                 }
                                 
                                 setCurrentStep(4);
                              } catch (e) {
                                 console.error("Escrow creation error:", e);
                              } finally {
                                 setIsDeploying(false);
                              }
                           }}
                         >
                            {isDeploying ? "Deploying Escrow..." : "Authorize Arkhai Escrow"}
                         </button>
                      </div>
                   </div>
                )}

                {currentStep === 4 && (
                   <div className="flex flex-col gap-8 max-w-3xl">
                      <div className="space-y-2">
                         <span className="text-label">Active Workspace — Step 4: Terminal Oversight</span>
                         <h2 className="text-3xl font-light">Escrow Deployed & Arkhai Listener Active</h2>
                      </div>
                      <div className="p-8 border border-white/10 bg-white/5 rounded-3xl space-y-4 font-mono text-sm">
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Escrow Contract:</span>
                            <span className="text-primary truncate ml-8">{ARKHAI_ERC20_ESCROW_OBLIGATION}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Arkhai Arbiter:</span>
                            <span className="text-primary">{ARKHAI_TRUSTED_ORACLE_ARBITER}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="text-amber-500 flex items-center gap-2 animate-pulse">
                               <Lock className="h-3 w-3" /> Awaiting Agent Fulfillment
                            </span>
                         </div>
                      </div>
                   </div>
                )}

                {currentStep === 5 && (
                   <div className="flex flex-col gap-8 max-w-3xl">
                      <div className="space-y-2">
                         <span className="text-label">Active Workspace — Step 5: On-Chain Settlement</span>
                         <h2 className="text-3xl font-light">Arbitration Result: Success</h2>
                      </div>
                      <div className="p-10 bg-primary/10 border border-primary/30 rounded-[3rem] text-center space-y-6">
                         <div className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                            <Shield className="h-10 w-10 text-primary" />
                         </div>
                         <div className="space-y-2">
                            <h3 className="text-2xl font-bold">Funds Ready for Settlement</h3>
                            <p className="text-muted-foreground font-light max-w-sm mx-auto">
                               Arkhai AI confirmed the agent's fulfillment satisfies the mission goals. You can now release the escrowed tokens to the counterparty.
                            </p>
                         </div>
                         <button 
                           className="w-full h-16 bg-primary text-background font-black uppercase tracking-[0.3em] text-xs rounded-2xl shadow-2xl shadow-primary/20"
                           onClick={() => window.location.reload()}
                         >
                            Finalize & Release Tokens
                         </button>
                      </div>
                   </div>
                )}
             </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
