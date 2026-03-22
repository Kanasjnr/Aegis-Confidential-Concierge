"use client"

import { StatCard } from "./stat-card"
import { PortfolioSummary } from "./portfolio-summary"
import { MandateTable } from "./mandate-table"
import { Shield, Activity, TrendingUp, AlertCircle, Clock, Settings as SettingsIcon, Info } from "lucide-react"

interface ViewProps {
  allocation?: { label: string; value: number; color: string }[]
}

import { useEscrowMetrics } from "@/hooks/use-escrow-metrics"
import { usePortfolioBalance } from "@/hooks/use-portfolio-balance"

interface ViewProps {
  allocation?: { label: string; value: number; color: string }[]
}

export function OverviewView() {
  const { totalValueLocked, isLoading: isEscrowLoading } = useEscrowMetrics();
  const { totalBalance, allocation, isLoading: isPortfolioLoading } = usePortfolioBalance();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Top Row: Hero Summary & Key Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PortfolioSummary 
            balance={isPortfolioLoading ? "..." : totalBalance} 
            change="+0.00%" 
            allocation={allocation} 
          />
        </div>
        <div className="space-y-6">
           <StatCard 
             label="Total Escrow Value" 
             value={isEscrowLoading ? "..." : `$${totalValueLocked}`} 
             subValue="Active Strategic Mandates"
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
                  { l: "Aegis Agent #0", v: "Verified", s: "Registry" },
                  { l: "USDM Reserve", v: "Active", s: "Escrow" },
                  { l: "Nova Intelligence", v: "99.8%", s: "Agent" },
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
                   <span className="text-primary/50 text-right w-16">Active</span>
                   <span>- agent [nova] monitoring celo sepolia liquidity... [system_ready]</span>
                </p>
                <p className="flex items-start gap-4 hover:text-white transition-colors cursor-default">
                   <span className="text-primary/50 text-right w-16">Sync</span>
                   <span>- identifying opportunity in [usdm/usdt] pool for autonomous rebalancing.</span>
                </p>
                <p className="flex items-start gap-4 hover:text-white transition-colors cursor-default">
                   <span className="text-primary/50 text-right w-16">Verify</span>
                   <span>- [aegis_identity] verified via [self_protocol]. session keys rotated.</span>
                </p>
                <p className="flex items-start gap-4 hover:text-white transition-colors cursor-default">
                   <span className="text-primary/50 text-right w-16">Action</span>
                   <span>- mandate initialized. awaiting final on-chain settlement proof...</span>
                </p>
            </div>
         </div>
      </div>
    </div>
  )
}

export function RegistryView() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="p-8 border border-border bg-card/5 rounded-[2rem] space-y-6">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Protocol Registry</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Manage authorized agents and protocols within your confidential workspace.
            </p>
          </div>
          <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
            Browse Registry
          </button>
        </div>
        
        {/* Placeholder for more registry items */}
        {[1, 2].map((i) => (
          <div key={i} className="p-8 border border-border border-dashed bg-transparent rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Connect New Module</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

export function MandatesView() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="p-8 border border-border bg-card/5 rounded-[2rem]">
        <MandateTable />
      </div>
    </div>
  )
}

export function ActivityView() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="border border-border bg-card/5 rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-border bg-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Global Activity Log</span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Real-time Sync</span>
        </div>
        <div className="p-8 space-y-6 font-mono text-xs">
           {[
             { time: "23:14:02", msg: "Self Protocol [zk_proof] verified for Alex Dubois." },
             { time: "23:12:45", msg: "Agent Nova initialized market scanning for ARB/cUSD pool." },
             { time: "22:45:10", msg: "Arkhai Escrow #112 finalized. Settlement release authorized." },
             { time: "21:30:00", msg: "Daily treasury rebalance completed. +0.02% optimization." },
           ].map((log, i) => (
             <div key={i} className="flex gap-6 items-start group">
                <span className="text-primary/40 group-hover:text-primary transition-colors">{log.time}</span>
                <span className="text-muted-foreground group-hover:text-white transition-colors">{log.msg}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}

export function SettingsView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] border border-border border-dashed rounded-[3rem] space-y-6 animate-in fade-in duration-500">
      <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
        <SettingsIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold">Workspace Settings</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Configuration options for your institutional Aegis workspace will appear here.
        </p>
      </div>
      <div className="flex gap-4">
        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
           <div className="h-2 w-2 rounded-full bg-green-500" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Identity Linked</span>
        </div>
        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
           <Info className="h-3 w-3 text-primary" />
           <span className="text-[10px] font-bold uppercase tracking-widest">v0.1.0-alpha</span>
        </div>
      </div>
    </div>
  )
}
