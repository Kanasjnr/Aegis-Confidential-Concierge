"use client"

import { ArrowUpRight, Clock, CreditCard, Shield, ChevronDown, ChevronUp, Target, Zap } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface MissionCardProps {
  mandate: {
    id: string
    name: string
    status: string
    value: string
    updated: string
    reasoning?: string
  }
}

export function MissionCard({ mandate }: MissionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20"
      case 'active': return 'bg-white/10 text-white border-white/20'
      case 'securing': return 'bg-white/5 text-slate-400 border-white/10'
      case 'secured': return 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/30 shadow-[0_0_15px_rgba(53,208,127,0.1)]'
      default: return 'bg-white/5 text-slate-500 border-white/5'
    }
  }

  const getProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return 65
      case "executed": return 100
      case "pending": return 15
      default: return 0
    }
  }

  return (
    <Card className={cn(
      "relative flex flex-col bg-[#161B22] border-2 border-border/10 hover:border-white/20 transition-all duration-500 overflow-hidden group shadow-2xl",
      mandate.status.toLowerCase() === "active" && "border-white/10"
    )}>

      <CardHeader className="p-10 pb-6 relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Badge className={cn("font-bold tracking-[0.2em] text-[10px] px-3 py-1 uppercase rounded-md border-none shadow-md", getStatusColor(mandate.status))}>
                {mandate.status.toUpperCase()}
              </Badge>
              <span className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase">REF: {mandate.id.slice(0, 10).toUpperCase()}</span>
            </div>
            <CardTitle className="text-xl font-bold text-white tracking-tight leading-none group-hover:text-primary transition-colors duration-500 uppercase">
              {mandate.name}
            </CardTitle>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-[#121821] border-2 border-white/5 flex items-center justify-center group-hover:bg-white group-hover:scale-105 transition-all duration-500 shadow-xl">
            <ArrowUpRight strokeWidth={2.5} className="h-8 w-8 text-slate-400 group-hover:text-black transition-colors" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 space-y-8 relative z-10">
        {/* Intelligence Context Block */}
        <div className="p-6 rounded-2xl bg-[#121821] border-2 border-white/5 flex items-start gap-4 shadow-xl">
          <Target strokeWidth={2.5} className="h-5 w-5 text-white/40 shrink-0 mt-0.5" />
          <p className="text-[13px] text-slate-300 font-medium leading-relaxed tracking-tight">
            {typeof mandate.reasoning === 'string' ?
              (mandate.reasoning.split(".")[0] + "...") :
              "INTELLIGENCE SERVICES MONITORING REAL-TIME MARKET STATE AND OPTIMIZING EXECUTION PATHS FOR SETTLEMENT."}
          </p>
        </div>

        {/* Tactical Metrics Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#121821] p-6 rounded-2xl border border-white/5 flex flex-col gap-2 shadow-lg transition-colors group-hover:border-white/10">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Capital Allocation</p>
            <div className="flex items-center gap-3">
              <CreditCard strokeWidth={2.5} className="h-5 w-5 text-white/20" />
              <p className="text-xl font-black text-white tracking-tighter uppercase">{mandate.value}</p>
            </div>
          </div>
          <div className="bg-[#121821] p-6 rounded-2xl border border-white/5 flex flex-col gap-2 shadow-lg transition-colors group-hover:border-white/10">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Temporal Sync</p>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-slate-600" />
              <p className="text-xl font-bold text-slate-300 tracking-tighter uppercase">{mandate.updated}</p>
            </div>
          </div>
        </div>

        {/* Progress System */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Mission Progress</span>
            <span className="text-sm font-black text-white tracking-tight">{getProgress(mandate.status)}%</span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-[#35D07F] transition-all duration-1000 shadow-[0_0_10px_rgba(53,208,127,0.3)]"
              style={{ width: `${getProgress(mandate.status)}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 pt-0 border-t border-white/5 flex justify-between items-center relative z-10 mt-auto bg-black/20">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white hover:bg-transparent transition-all group/btn px-0"
        >
          {isExpanded ? "Collapse Intel" : "Access Intel Stream"}
          {isExpanded ?
            <ChevronUp className="h-5 w-5 group-hover/btn:-translate-y-0.5 transition-transform" /> :
            <ChevronDown className="h-5 w-5 group-hover/btn:translate-y-0.5 transition-transform" />
          }
        </Button>
        {mandate.status.toLowerCase() === "active" && (
          <div className="flex items-center gap-3 px-5 py-2 rounded-xl bg-white/5 border border-white/10">
            <Zap strokeWidth={2.5} className="h-4 w-4 text-white fill-current animate-pulse opacity-60" />
            <span className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">Monitoring</span>
          </div>
        )}
      </CardFooter>

      {/* Advanced Reasoning Interface */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-10 pb-10 relative z-10 overflow-hidden"
          >
            <div className="rounded-2xl bg-[#080B10] border-2 border-white/5 shadow-2xl relative overflow-hidden h-[250px] flex flex-col">
              {/* Terminal CRT Effects */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10" />
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(53,208,127,0.05)_0%,transparent_100%)] pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-[2px] bg-[#35D07F]/20 animate-scan pointer-events-none z-20" />
              
              <div className="flex justify-between items-center px-6 py-3 bg-black/40 border-b border-white/5 relative z-30">
                 <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 text-nowrap">Reasoning Core v4.0</span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#35D07F] animate-pulse shadow-[0_0_10px_rgba(53,208,127,0.4)]" />
                    <span className="text-[8px] font-black text-[#35D07F] uppercase tracking-widest leading-none">Active Link</span>
                  </div>
              </div>
              
              <div className="p-8 font-mono text-[13px] overflow-y-auto scrollbar-hide flex-1 relative z-30 space-y-3">
                {mandate.reasoning ? mandate.reasoning.split('\n').map((line, i) => (
                  <div key={i} className="flex gap-4 text-[#35D07F] drop-shadow-[0_0_5px_rgba(53,208,127,0.3)]">
                    <span className="opacity-20">[{i.toString().padStart(2, '0')}]</span>
                    <span className="leading-relaxed uppercase font-black uppercase tracking-tight">
                      <span className="mr-2 opacity-50">{">"}</span>
                      {line}
                      {i === mandate.reasoning!.split('\n').length - 1 && <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#35D07F] animate-pulse align-middle" />}
                    </span>
                  </div>
                )) : (
                  <div className="flex gap-4 text-[#35D07F]/40 animate-pulse">
                    <span className="opacity-20">[00]</span>
                    <span className="leading-relaxed uppercase font-black uppercase tracking-tight">
                      <span className="mr-2 opacity-50">{">"}</span>
                      ANALYZING SEQUENCE NODES... CALIBRATING EXECUTION PARAMETERS...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
