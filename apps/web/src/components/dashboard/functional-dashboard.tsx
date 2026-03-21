"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { StatCard } from "./stat-card"
import { PortfolioSummary } from "./portfolio-summary"
import { MandateTable } from "./mandate-table"
import { Shield, Activity, TrendingUp, AlertCircle } from "lucide-react"

export function FunctionalDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const allocation = [
    { label: "Private Equity", value: 48, color: "#00E5FF" },
    { label: "Real Estate", value: 25, color: "#10B981" },
    { label: "Fine Art", value: 15, color: "#F59E0B" },
    { label: "Digital Assets", value: 12, color: "#F97316" },
  ]

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-border flex items-center justify-between px-10 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold tracking-tight text-white">Dashboard Overview</h2>
             <div className="px-2 py-0.5 rounded-sm bg-green-500/10 border border-green-500/20 flex items-center gap-1.5 leading-none">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active System</span>
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 group cursor-pointer">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors">Identity Verified</span>
             </div>
             <div className="h-8 w-[0.5px] bg-border" />
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">Celo Mainnet</span>
                <span className="text-[10px] text-muted-foreground font-mono leading-none mt-1">Block: 12,451,328</span>
             </div>
          </div>
        </header>

        <div className="p-10 max-w-[1400px] mx-auto space-y-10 pb-20">
          
          {/* Top Row: Hero Summary & Key Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PortfolioSummary 
                balance="$3,450,210.88" 
                change="+0.72%" 
                allocation={allocation} 
              />
            </div>
            <div className="space-y-6">
               <StatCard 
                 label="Total Committed Capital" 
                 value="$5,120,000.00" 
                 subValue="Institutional Threshold: $10M"
                 trend={{ value: "4.2%", positive: true }}
                 icon={<Activity className="h-4 w-4" />}
               />
               <StatCard 
                 label="Agent Performance" 
                 value="99.8%" 
                 subValue="Agent Nova: Analyzing 47 Markets"
                 trend={{ value: "Optimizing", positive: true }}
                 icon={<TrendingUp className="h-4 w-4" />}
               />
               <div className="p-4 rounded-xl border border-destructive/10 bg-destructive/5 flex gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-destructive">System Alert</p>
                     <p className="text-[10px] text-muted-foreground/80 leading-relaxed">Mandate #24 requires human re-authorization for transaction above $200k threshold.</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Middle Row: Active Mandates Table */}
          <div className="pt-4">
             <MandateTable />
          </div>

          {/* Bottom Row: Registry Highlights & Activity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
             <div className="p-6 border border-border bg-card/10 rounded-2xl flex flex-col gap-6">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Registry Highlights</span>
                   <button className="text-[10px] uppercase font-bold text-primary hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                   {[
                      { l: "High-yield Treasury", v: "$1.2M", s: "Staked" },
                      { l: "Art Fund ALPHA", v: "$450k", s: "Escrow" },
                      { l: "Venture Debt", v: "$2.1M", s: "Committed" },
                   ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-none">
                         <span className="text-xs text-white/80">{item.l}</span>
                         <div className="text-right">
                            <p className="text-xs font-bold text-white leading-none">{item.v}</p>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold leading-none mt-1">{item.s}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="lg:col-span-2 p-6 border border-border bg-card/10 rounded-2xl flex flex-col gap-6">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Intelligence Stream</span>
                   <Activity className="h-3 w-3 text-primary animate-pulse" />
                </div>
                <div className="space-y-4 font-mono text-[10px] text-muted-foreground/80 lowercase">
                   <p className="flex items-start gap-4 hover:text-white transition-colors cursor-default">
                      <span className="text-primary/50 text-right w-16">13:42:01</span>
                      <span>- agent [nova] starting market analysis for celo liquidity pools... success.</span>
                   </p>
                   <p className="flex items-start gap-4 hover:text-white transition-colors cursor-default">
                      <span className="text-primary/50 text-right w-16">13:42:05</span>
                      <span>- identifying opportunity in [moola_market] for cusd supply optimization.</span>
                   </p>
                   <p className="flex items-start gap-4 hover:text-white transition-colors cursor-default">
                      <span className="text-primary/50 text-right w-16">13:42:18</span>
                      <span>- [zk_identity] verified for session [ag-411]. authorized for mandates up to $...</span>
                   </p>
                   <p className="flex items-start gap-4 hover:text-white transition-colors cursor-default">
                      <span className="text-primary/50 text-right w-16">13:43:45</span>
                      <span>- mandate #1 initialized. awaiting final on-chain settlement proof...</span>
                   </p>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
