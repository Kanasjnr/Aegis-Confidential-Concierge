import { useState, useEffect } from "react"
import { StatCard } from "./stat-card"
import { PortfolioSummary } from "./portfolio-summary"
import { MandateTable } from "./mandate-table"
import { Shield, Activity, TrendingUp, AlertCircle, Clock, Settings as SettingsIcon, Info, Plus, Zap, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ViewProps {
  allocation?: { label: string; value: number; color: string }[]
}

import { useEscrowMetrics } from "@/hooks/use-escrow-metrics"
import { usePortfolioBalance } from "@/hooks/use-portfolio-balance"

import { useMandates } from "@/hooks/use-mandates"
import { MissionCard } from "./mission-card"

export function OverviewView() {
  const { totalValueLocked, isLoading: isEscrowLoading } = useEscrowMetrics();
  const { totalBalance, allocation, isLoading: isPortfolioLoading } = usePortfolioBalance();
  const { mandates, isLoading: isMandatesLoading } = useMandates();

  // Combine reasoning data into mandates if available
  const [reasoningData, setReasoningData] = useState<Record<string, any>>({})
  useEffect(() => {
    fetch("/api/agent/reasoning").then(res => res.json()).then(setReasoningData)
  }, [])

  const enrichedMandates = mandates.map((m: any) => ({
    ...m,
    reasoning: reasoningData[m.id.toLowerCase()]?.reasoning?.plan || reasoningData[m.id]?.reasoning?.plan
  }))

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* 1. Tactical Intelligence Summary */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="h-1.5 w-8 bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
          <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-slate-200">Intelligence Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard 
             label="SOVEREIGN ASSETS" 
             value={isPortfolioLoading ? "..." : totalBalance} 
             trend={{ value: "2.4%", positive: true }}
             icon={<TrendingUp className="h-6 w-6" />}
           />
           <StatCard 
             label="ESCROW_PROTOCOL_TVL" 
             value={isEscrowLoading ? "..." : `$${totalValueLocked}`} 
             trend={{ value: "4.2%", positive: true }}
             icon={<Activity className="h-6 w-6" />}
           />
           <StatCard 
             label="ACTIVE_DIRECTIVES" 
             value={mandates.length} 
             trend={{ value: "OPTIMIZING", positive: true }}
             icon={<Shield className="h-6 w-6" />}
           />
        </div>
      </div>

      {/* 2. Mission Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
           <div className="flex items-center gap-4">
              <Cpu strokeWidth={2.5} className="h-5 w-5 text-slate-500" />
              <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-slate-200">Active Missions</h2>
           </div>
           <Badge variant="outline" className="border-white/10 text-slate-400 font-black px-3 py-0.5 tracking-wider text-[9px] uppercase bg-white/5">Deep Sync Active</Badge>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 pb-24">
          {isMandatesLoading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-[380px] rounded-2xl bg-[#161B22] border border-white/5 border-dashed animate-pulse flex items-center justify-center">
                 <span className="text-slate-600 font-bold tracking-[0.2em] text-[10px] uppercase">Initializing Node {i}</span>
              </div>
            ))
          ) : enrichedMandates.length === 0 ? (
            <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-3xl bg-[#161B22]/40">
               <Shield className="h-12 w-12 text-slate-800 mx-auto mb-4" />
               <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-600">No primary mandates detected.</p>
            </div>
          ) : (
            enrichedMandates.map((mandate) => (
              <MissionCard key={mandate.id} mandate={mandate} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export function RegistryView() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
         <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-primary/60" />
            <h2 className="text-[15px] font-bold uppercase tracking-[0.3em] text-slate-200">Protocol Registry</h2>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div className="p-8 bg-[#161B22] border border-white/5 rounded-2xl space-y-6 hover:border-[#35D07F]/20 transition-all group shadow-2xl">
          <div className="h-14 w-14 rounded-xl bg-[#121821] flex items-center justify-center border border-white/10 group-hover:bg-[#35D07F] transition-colors duration-500 shadow-xl">
            <Shield strokeWidth={2.5} className="h-8 w-8 text-slate-500 group-hover:text-black transition-colors" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-[#35D07F] transition-colors">Security Module</h3>
            <p className="text-[13px] text-slate-400 font-black leading-relaxed opacity-60">
              Institutional grade zk-proof authorization for cross-protocol settlement.
            </p>
          </div>
          <Button className="w-full h-12 bg-white/5 border border-white/5 text-slate-200 font-bold uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/10 transition-all rounded-xl">
            Access Protocol
          </Button>
        </div>
        
        {/* Placeholder for more registry items */}
        {[1, 2].map((i) => (
          <div key={i} className="p-10 bg-transparent border-4 border-dashed border-border/20 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 opacity-30 group hover:opacity-100 transition-opacity">
            <div className="h-14 w-14 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center group-hover:border-[#35D07F] transition-colors">
              <Plus strokeWidth={2.5} className="h-8 w-8 text-muted-foreground group-hover:text-[#35D07F]" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground group-hover:text-[#35D07F] transition-colors whitespace-nowrap">DEPLOY_MODULE</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MandatesView() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
       <div className="flex items-center gap-3 mb-2">
          <div className="h-1 w-8 bg-white/40" />
          <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-slate-200">Management Console</h2>
       </div>
      <div className="p-8 bg-[#161B22] border border-white/10 rounded-2xl shadow-2xl">
        <MandateTable />
      </div>
    </div>
  )
}

export function ActivityView() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-[#161B22] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-[#121821] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Activity strokeWidth={2.5} className="h-5 w-5 text-slate-500" />
            <span className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-200">System Telemetry</span>
          </div>
          <Badge className="bg-white/10 text-white border border-white/10 font-black tracking-widest px-3 py-1 text-[9px] uppercase">Live</Badge>
        </div>
        <div className="p-8 space-y-6 font-mono">
           {[
             { time: "23:14:02", msg: "ZK_PROOF_VERIFIED_IDENTITY: ALEX DUBOIS", type: "success" },
             { time: "23:12:45", msg: "MARKET_SCAN: ARB/CUSD POOL_DETECTED", type: "info" },
             { time: "22:45:10", msg: "SETTLEMENT_FINALIZED: ESCROW_ID_112", type: "success" },
             { time: "21:30:00", msg: "DAILY_TREASURY_REBALANCE_COMPLETED", type: "info" },
             { time: "20:15:22", msg: "SENTINEL_SCAN: NO_THREAT_DETECTED", type: "info" },
           ].map((log, i) => (
             <div key={i} className="flex gap-8 items-center group border-l-2 border-transparent hover:border-primary/40 pl-4 transition-all">
                <span className="text-[11px] font-black text-slate-600 group-hover:text-white transition-colors w-20">{log.time}</span>
                <span className="text-[12px] font-black text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight">{log.msg}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}

export function SettingsView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed border-white/5 bg-[#161B22]/30 rounded-3xl space-y-10 animate-in fade-in duration-700">
      <div className="h-20 w-20 rounded-2xl bg-[#121821] border border-white/5 flex items-center justify-center shadow-2xl">
        <SettingsIcon strokeWidth={2.5} className="h-10 w-10 text-slate-700 animate-spin-slow" />
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold text-white uppercase tracking-tight">System Configuration</h3>
        <p className="text-[13px] text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
          The Aegis sovereign infrastructure is currently operating at peak efficiency. Parameters are immutable during active sessions.
        </p>
      </div>
      <div className="flex gap-6">
        <div className="px-5 py-2.5 bg-[#121821] border border-white/5 rounded-xl flex items-center gap-3 shadow-xl">
           <div className="h-2 w-2 rounded-full bg-slate-400 shadow-[0_0_10px_rgba(255,255,255,0.1)] animate-pulse" />
           <span className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">Secure Link Active</span>
        </div>
        <div className="px-5 py-2.5 bg-[#121821] border border-white/5 rounded-xl flex items-center gap-3 shadow-xl">
           <Info strokeWidth={2.5} className="h-4 w-4 text-slate-500" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">v.1.0.4 Sovereign</span>
        </div>
      </div>
    </div>
  )
}
