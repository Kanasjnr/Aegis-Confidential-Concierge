"use client"

import { useState } from "react"
import { IdentityRibbon } from "./identity-ribbon"
import { WealthMatrix } from "./wealth-matrix"
import { AgentServiceStatus } from "./agent-service-status"
import { MissionStepper } from "./mission-stepper"
import { motion, AnimatePresence } from "framer-motion"

export function MissionDashboard() {
  const [currentStep, setCurrentStep] = useState(3) // Default to Mandate Entry for Demo

  const steps: any = [
    { label: "Identity Verification", description: "Secured via Self Protocol ZK-Proof", status: "complete" },
    { label: "Agent Discovery", description: "Registry Sync: Agent Nova Authorized", status: "complete" },
    { label: "Mandate Definition", description: "Input Natural Language Instructions", status: "active" },
    { label: "Terminal Oversight", description: "Awaiting Execution Authorization", status: "pending" },
    { label: "On-Chain Settlement", description: "Proof-Based Fund Release", status: "pending" },
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
                <div className="flex flex-col gap-8 max-w-3xl">
                   <div className="space-y-2">
                      <span className="text-label">Active Workspace — Step 3: Mandate Definition</span>
                      <h2 className="text-2xl font-light">Supply autonomous instructions to your agent.</h2>
                   </div>
                   
                   <textarea 
                     className="w-full h-48 bg-transparent border-none focus:ring-0 text-xl font-light text-white/90 placeholder:text-muted-foreground/30 resize-none leading-relaxed"
                     placeholder="Type your strategic intent in plain English... e.g., Allocate 500 cUSD to negotiate cloud storage renewal with a focus on uptime."
                   />

                   <div className="pt-8 flex justify-between items-center border-t-[0.5px] border-border">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                         Context: Institutional Treasury Management
                      </p>
                      <button 
                        className="px-10 py-3 border border-primary text-primary hover:bg-primary/5 text-[11px] font-bold uppercase tracking-widest transition-all"
                        onClick={() => setCurrentStep(4)}
                      >
                         Propose Mandate
                      </button>
                   </div>
                </div>
             </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
