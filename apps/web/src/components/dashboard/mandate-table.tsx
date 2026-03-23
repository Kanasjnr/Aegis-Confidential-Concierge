"use client"

import { FileText, TrendingUp, Clock, AlertCircle, ExternalLink, X, Shield, Coins, Terminal, Info, Zap } from "lucide-react"
import { useAccount } from "wagmi"
import { useState } from "react"
import { AEGIS_ESCROW_ADDRESS } from "@/lib/contracts"
import { motion, AnimatePresence } from "framer-motion"
import { ReasoningDisplay } from "./reasoning-display"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { useMandates, Mandate } from "@/hooks/use-mandates"

export function MandateTable() {
  const { mandates, isLoading } = useMandates()
  const [selectedMandate, setSelectedMandate] = useState<Mandate | null>(null)

  if (isLoading) {
    return (
      <div className="w-full h-60 flex items-center justify-center border-4 border-dashed border-white/5 rounded-3xl bg-[#121821]/50">
        <div className="flex flex-col items-center gap-4">
          <Clock strokeWidth={2.5} className="h-8 w-8 text-slate-400 animate-spin" />
          <span className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">CALIBRATING_DIRECTIVES...</span>
        </div>
      </div>
    )
  }

  if (mandates.length === 0) {
    return (
      <div className="w-full h-60 flex flex-col items-center justify-center border-4 border-dashed border-white/5 rounded-3xl space-y-4 bg-[#121821]/50">
        <Shield className="h-10 w-10 text-muted-foreground/10" />
        <span className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground/20">NO_ACTIVE_DIRECTIVES_DETECTED</span>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <FileText strokeWidth={2.5} className="h-5 w-5 text-slate-500" />
          <span className="text-[13px] font-black uppercase tracking-[0.3em] text-slate-200">Infrastructure State</span>
        </div>
        <Badge className="bg-[#161B22] text-slate-400 border border-white/10 font-black tracking-widest px-3 py-1 uppercase text-[10px]">Verified Ledger</Badge>
      </div>

      <div className="border border-white/10 bg-[#161B22] rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Designation</th>
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Protocol</th>
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Value Sync</th>
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Execution</th>
              <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Heartbeat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mandates.map((m) => (
              <tr
                key={m.id}
                onClick={() => setSelectedMandate(m)}
                className="hover:bg-white/5 transition-all group cursor-pointer"
              >
                <td className="px-8 py-6">
                  <span className="text-base font-black text-slate-200 group-hover:text-white transition-colors tracking-tight uppercase">{m.name}</span>
                </td>
                <td className="px-8 py-6">
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider border-white/5 text-slate-500">{m.type}</Badge>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-slate-200 group-hover:text-white transition-colors tracking-tighter">{m.value}</span>
                    {m.status === 'active' && <TrendingUp strokeWidth={2.5} className="h-3.5 w-3.5 text-white/40 animate-pulse" />}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "px-3 py-1 rounded-lg flex items-center gap-2 border transition-all",
                      m.status === "active" ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]" :
                        m.status === "executed" ? "bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/30 shadow-[0_0_15px_rgba(53,208,127,0.1)]" :
                          "bg-white/5 text-slate-400 border-white/5"
                    )}>
                      <div className={cn(
                        "h-2 w-2 animate-pulse",
                        m.status === "active" ? "bg-[#F97316] shadow-[0_0_10px_#F97316]" :
                          m.status === "executed" ? "bg-[#35D07F] shadow-[0_0_10px_#35D07F]" :
                            "bg-slate-600"
                      )} />
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none">
                        {m.status}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 text-[10px] text-slate-600 font-black uppercase tracking-wider">
                    <Clock strokeWidth={2.5} className="h-3.5 w-3.5" />
                    {m.lastUpdated}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedMandate && (
          <MandateDetailModal
            mandate={selectedMandate}
            onClose={() => setSelectedMandate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function MandateDetailModal({ mandate, onClose }: { mandate: Mandate, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'intent' | 'agent'>('agent');

  let parsedMetadata: any = null;
  try {
    if (mandate.fullGoal.startsWith('{')) {
      parsedMetadata = JSON.parse(mandate.fullGoal);
    }
  } catch (e) {
    console.log("Metadata not JSON");
  }

  const displayGoal = parsedMetadata?.goal || mandate.fullGoal;
  const delegation = parsedMetadata?.delegation;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0F1216]/95 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 50 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#161B22] border-2 border-white/10 rounded-[2rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] scrollbar-hide"
      >
        {/* Institutional Header Bar */}
        <div className="h-1.5 w-full bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]" />

        <div className="p-12 space-y-12">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-xl bg-[#121821] border border-white/10 flex items-center justify-center shadow-xl">
                <Shield strokeWidth={2.5} className="h-8 w-8 text-slate-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Mission Control</h3>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 border-white/5 bg-white/5 px-2 py-0.5">ID: {mandate.id.toUpperCase()}</Badge>
                  <Badge className="text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 text-slate-400 border-none px-2 py-0.5">Verified Node</Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-14 w-14 flex items-center justify-center bg-[#121821] hover:bg-destructive hover:text-white border-2 border-white/10 rounded-2xl transition-all active:scale-90 group"
            >
              <X strokeWidth={2.5} className="h-8 w-8 text-muted-foreground/40 group-hover:text-white transition-colors" />
            </Button>
          </div>

          <div className="flex p-1.5 bg-[#121821] rounded-xl border border-white/5 shadow-inner">
            <button
              onClick={() => setActiveTab('intent')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 text-[11px] uppercase font-black tracking-[0.2em] rounded-lg transition-all duration-300 ${activeTab === 'intent' ? 'bg-[#1F242C] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Info strokeWidth={2.5} className="h-4 w-4" />
              Intent Spec
            </button>
            <button
              onClick={() => setActiveTab('agent')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 text-[11px] uppercase font-black tracking-[0.2em] rounded-lg transition-all duration-300 ${activeTab === 'agent' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-white/60'}`}
            >
              <Terminal strokeWidth={2.5} className="h-4 w-4" />
              Agent Reasoning
            </button>
          </div>

          <div className="min-h-[500px]">
            {activeTab === 'intent' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12"
              >
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 text-nowrap">CFO MASTER DIRECTIVE STREAM</span>
                    <div className="h-0.5 flex-1 bg-border/20" />
                  </div>
                  <div className="p-8 bg-[#121821] border border-white/5 rounded-2xl shadow-xl relative overflow-hidden group">
                    <p className="text-xl text-slate-200 leading-tight font-black tracking-tight relative z-10 uppercase italic">
                      "{displayGoal}"
                    </p>
                  </div>
                </div>

                {delegation && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white/20 text-nowrap">CRYPTOGRAPHIC DELEGATION EIP 191</span>
                      <div className="h-0.5 flex-1 bg-white/5" />
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-4 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Shield strokeWidth={2.5} className="h-5 w-5 text-[#35D07F]" />
                            <span className="text-[12px] font-black text-white uppercase tracking-widest">Verified Signature</span>
                          </div>
                          <Badge className="bg-[#35D07F]/20 text-[#35D07F] font-black tracking-[0.2em] px-3 py-1 uppercase text-[9px]">Authorized</Badge>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[12px] text-white font-black leading-relaxed uppercase tracking-tight italic">
                            {delegation.statement}
                          </p>
                          <div className="p-4 bg-black/40 border border-white/5 rounded-lg font-mono text-[10px] text-white break-all select-all shadow-inner uppercase tracking-tighter opacity-80">
                            {delegation.signature}
                          </div>
                        </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-[#121821] border border-white/5 rounded-xl flex flex-col gap-2 relative group hover:border-white/20 transition-all shadow-xl max-w-full overflow-hidden">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Procurement Budget</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black text-slate-200 tracking-tight group-hover:text-white transition-colors duration-500">{mandate.value}</span>
                      <span className="text-[12px] font-black text-slate-600 uppercase tracking-[0.2em]">{mandate.token}</span>
                    </div>
                  </div>
                  <div className="p-6 bg-[#121821] border border-white/5 rounded-xl flex flex-col gap-2 shadow-xl group transition-all hover:bg-white/5">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Authorization State</span>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-3 w-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(53,208,127,0.4)]",
                        mandate.status === 'executed' ? 'bg-[#35D07F]' : 'bg-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                      )} />
                      <span className={cn(
                        "text-xl font-black uppercase tracking-tighter",
                        mandate.status === 'executed' ? 'text-[#35D07F]' : 'text-[#F97316]'
                      )}>{mandate.status}</span>
                    </div>
                  </div>
                </div>

                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <span className="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 text-nowrap">IMMUTABLE ONCHAIN RECORD</span>
                      <div className="h-0.5 flex-1 bg-border/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-6 font-mono text-[11px] p-8 bg-[#0F1216] rounded-3xl border-2 border-white/5 shadow-inner overflow-hidden">
                      <div className="space-y-2 min-w-0">
                        <span className="text-muted-foreground/20 block font-black uppercase tracking-widest text-nowrap">ATTESTATION ID</span>
                        <span className="text-white/40 truncate block uppercase tracking-tighter">{mandate.id}</span>
                      </div>
                      <div className="space-y-2 min-w-0">
                        <span className="text-muted-foreground/20 block font-black uppercase tracking-widest text-nowrap">ASSET IDENTITY</span>
                        <span className="text-white/40 truncate block uppercase tracking-tighter">{mandate.token}/CELO-SOVEREIGN</span>
                      </div>
                    </div>
                  </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full bg-black rounded-[3rem] p-1 border-2 border-border/20"
              >
                <ReasoningDisplay mandateId={mandate.id} />
              </motion.div>
            )}
          </div>

          <div className="pt-10">
            <Button
              className="w-full h-20 bg-[#0F1216] hover:bg-white hover:text-black text-slate-400 border-2 border-white/5 rounded-3xl transition-all group shadow-2xl"
              onClick={() => window.open(`https://celo-sepolia.blockscout.com/address/${AEGIS_ESCROW_ADDRESS}`, '_blank')}
            >
              <span className="text-[14px] font-black uppercase tracking-[0.5em]">CHECK_ONCHAIN_VAULT_DEEP_STATE</span>
              <ExternalLink strokeWidth={2.5} className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}