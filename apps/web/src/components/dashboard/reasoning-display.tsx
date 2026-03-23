"use client"

import { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, CheckCircle, Search, Zap, Loader2, ArrowRight, Activity, Cpu } from 'lucide-react';
import { useWalletClient } from 'wagmi';
import { arkhaiService } from '@/lib/arkhai-service';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ReasoningData {
  status: string;
  logs: string[];
  reasoning?: {
    plan?: string;
    signature?: string;
    commitment?: any;
  };
  lastUpdated: string;
  settledHash?: string;
}

export function ReasoningDisplay({ mandateId }: { mandateId: string }) {
  const [data, setData] = useState<ReasoningData | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [isSettling, setIsSettling] = useState(false);
  const [settledHash, setSettledHash] = useState<string | null>(null);
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const fetchReasoning = async () => {
      try {
        const res = await fetch(`/api/agent/reasoning?mandateId=${mandateId}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch reasoning:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReasoning();
    const interval = setInterval(fetchReasoning, 3000);
    return () => clearInterval(interval);
  }, [mandateId]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [data?.logs]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-[#0B0F14]/40 rounded-3xl border border-white/5 space-y-6">
        <div className="relative">
          <Loader2 className="h-10 w-10 text-slate-400 animate-spin" />
        </div>
        <span className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500 text-center uppercase">Initializing Intelligence Engine</span>
      </div>
    );
  }

  const logs = data?.logs || [];
  const status = data?.status || 'idle';
  const plan = data?.reasoning?.plan;
  const error = (data as any)?.error;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
           <div className="h-2 w-2 rounded-full bg-slate-400 shadow-[0_0_10px_rgba(255,255,255,0.1)] animate-pulse" />
           <span className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-200">Intelligence Stream</span>
        </div>
        <Badge className={cn(
            "font-black tracking-widest px-3 py-1 uppercase text-[9px]",
            status === 'active' ? 'bg-white/10 text-white border border-white/10' : 
            status === 'secured' ? 'bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30 shadow-[0_0_10px_rgba(53,208,127,0.2)]' : 
            'bg-slate-800/40 text-slate-400 border border-slate-800'
        )}>
            {status}
        </Badge>
      </div>

      <div className="space-y-8">
        <div className="bg-[#050505] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-black/40 border-b border-white/5">
            <div className="flex gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
              <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
              <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
            </div>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Session: {mandateId.slice(0, 12)}</span>
          </div>

          <div className="p-4 flex gap-4 overflow-x-auto bg-[#0B0F14]/60 border-b border-white/5 scrollbar-hide">
             <StatusStep icon={<Search className="h-4 w-4" />} label="Discovery" active={status === 'analyzing'} complete={['active', 'securing', 'secured'].includes(status)} />
             <StatusStep icon={<Shield className="h-4 w-4" />} label="Arbiter" active={status === 'active'} complete={['securing', 'secured'].includes(status)} />
             <StatusStep icon={<Zap className="h-4 w-4" />} label="Secured" active={status === 'securing'} complete={status === 'secured'} />
          </div>

          <div ref={scrollContainerRef} className="px-8 py-10 font-mono text-[13px] h-[350px] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 bg-[#080B10] relative">
             <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10" />
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(53,208,127,0.05)_0%,transparent_100%)] pointer-events-none" />
             <div className="absolute top-0 left-0 w-full h-[2px] bg-[#35D07F]/20 animate-scan pointer-events-none z-20" />
             
             {logs.map((log, i) => {
               const isCheckout = log.includes('locus-checkout') || log.includes('checkout-session') || log.includes('checkout.paywithlocus.com');
               const checkoutLink = log.match(/https?:\/\/[^\s]+/)?.[0];

               return (
                <div key={i} className={cn(
                    "flex gap-4 transition-all duration-700 items-start group",
                    i === logs.length - 1 ? 'text-[#35D07F] drop-shadow-[0_0_8px_rgba(53,208,127,0.5)]' : 'text-[#35D07F]/40'
                )}>
                   <span className="shrink-0 font-black opacity-20 group-hover:opacity-40 transition-opacity">[{i.toString().padStart(2, '0')}]</span>
                   <div className="flex flex-col gap-6 w-full">
                     <span className="leading-relaxed break-all uppercase tracking-tight font-black font-mono">
                       <span className="mr-2 opacity-50">{">"}</span>
                       {log}
                       {i === logs.length - 1 && <span className="inline-block w-2 h-4 ml-1 bg-[#35D07F] animate-pulse align-middle" />}
                     </span>
                     {isCheckout && checkoutLink && (
                        <Button 
                          className="w-fit h-12 bg-white text-black font-black uppercase tracking-[0.3em] px-6 rounded-xl animate-in fade-in slide-in-from-left-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-slate-200 transition-all"
                          onClick={() => window.open(checkoutLink, '_blank')}
                        >
                          <Shield strokeWidth={2.5} className="h-4 w-4 mr-3" />
                          AUTHORIZE_SETTLEMENT_VIA_LOCUS
                          <ArrowRight strokeWidth={2.5} className="h-4 w-4 ml-3" />
                        </Button>
                     )}
                   </div>
                </div>
               );
             })}
             {status === 'idle' && (
               <div className="text-white/10 italic animate-pulse font-black uppercase tracking-widest px-10">SYNCHRONIZING_SECURE_TUNNEL...</div>
             )}
             <div id="logs-end" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {plan && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 px-2">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-600">Tactical Blueprint</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="p-8 bg-[#161B22] border border-white/10 rounded-2xl relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-700">
                  <Cpu strokeWidth={2.5} className="h-16 w-16 text-slate-500" />
               </div>
               
               <p className="text-xl text-slate-200 leading-relaxed font-bold tracking-tight relative z-10 italic">
                 "{plan}"
               </p>

               {data?.reasoning?.signature && (
                 <div className="mt-10 pt-10 border-t-2 border-border/20 flex flex-col gap-8">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="relative flex flex-col h-full bg-[#0F1216] overflow-hidden">
            {/* 1. Matrix Background Layer */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#35D07F_1px,transparent_1px)] bg-[size:30px_30px] animate-pulse" />
            </div>
                        </div>
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-lg bg-[#35D07F]/10 border border-[#35D07F]/20 flex items-center justify-center shadow-lg">
                           <CheckCircle strokeWidth={2.5} className="h-4 w-4 text-[#35D07F]" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#35D07F]">Identity Seal Verified</span>
                      </div>
                     </div>
                     <Badge variant="outline" className="text-[9px] font-black text-[#35D07F]/60 border-[#35D07F]/20 bg-[#35D07F]/5 px-2 py-0.5 uppercase tracking-widest">EIP-712</Badge>
                   </div>

                   <div className="p-6 bg-[#0D1117] rounded-2xl font-mono text-[11px] text-white border-2 border-white/5 break-all shadow-inner uppercase tracking-widest leading-relaxed opacity-80">
                      {data.reasoning.signature}
                   </div>
                   
                   {(!settledHash && status !== 'success' && status !== 'executed') ? (
                     <div className="space-y-4">
                       <Button
                         disabled={isSettling}
                         onClick={async () => {
                           if (!walletClient) return;
                           setIsSettling(true);
                           try {
                             const hash = await arkhaiService.releaseAegisFunds(walletClient, mandateId as `0x${string}`);
                             setSettledHash(hash);
                           } catch (err: any) {
                             console.error("Settlement failed:", err);
                             alert(`Settlement Failed: ${err.message || 'Unknown error'}`);
                           } finally {
                             setIsSettling(false);
                           }
                         }}
                         className="w-full h-20 bg-white hover:bg-slate-200 text-black font-black uppercase tracking-[0.4em] text-[14px] rounded-3xl flex items-center justify-center gap-6 transition-all active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.05)] group"
                       >
                         {isSettling ? (
                           <Loader2 strokeWidth={2.5} className="h-6 w-6 animate-spin" />
                         ) : (
                           <>
                             <ArrowRight strokeWidth={2.5} className="h-6 w-6 group-hover:translate-x-2 transition-transform" /> 
                             APPROVE_&_RELEASE_SETTLEMENT
                           </>
                         )}
                       </Button>
                       <p className="text-[10px] text-center text-muted-foreground/30 font-black uppercase tracking-[0.3em]">CFO_WALLET_RESTRICTED_PROTOCOL</p>
                     </div>
                   ) : (
                     <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mt-6 p-12 bg-[#35D07F] rounded-[4rem] flex flex-col items-center gap-8 text-center shadow-[0_30px_100px_rgba(53,208,127,0.3)] relative overflow-hidden"
                     >
                        <div className="h-24 w-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] relative z-10 animate-bounce">
                           <CheckCircle strokeWidth={2.5} className="h-12 w-12 text-white" />
                        </div>
                        <div className="space-y-4 relative z-10">
                           <h4 className="text-4xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-lg">MISSION ACCOMPLISHED</h4>
                           <p className="text-[13px] text-white/80 font-black uppercase tracking-[0.4em]">SETTLEMENT FINALIZED ON LEDGER</p>
                        </div>
                        {(settledHash || data?.settledHash) && (
                          <Button 
                            className="bg-white hover:bg-slate-200 text-black font-black uppercase tracking-[0.3em] h-14 px-10 rounded-2xl relative z-10 shadow-2xl"
                            onClick={() => window.open(`https://celo-sepolia.blockscout.com/tx/${settledHash || data?.settledHash}`, '_blank')}
                          >
                                VIEW_ON_BLOCKSCOUT
                          </Button>
                        )}
                     </motion.div>
                   )}
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusStep({ icon, label, active, complete }: { icon: any, label: string, active: boolean, complete: boolean }) {
  return (
    <div className={cn(
        "flex items-center gap-3 whitespace-nowrap px-4 py-2 rounded-lg border transition-all duration-300",
        active ? "bg-white/10 text-white border-white/20 shadow-lg" : 
        complete ? "bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20" : 
        "bg-black/40 border-white/5 text-slate-600"
    )}>
      <div className="h-3.5 w-3.5 shrink-0">
        {complete ? <CheckCircle strokeWidth={2.5} className="h-3.5 w-3.5" /> : icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.1em]">{label}</span>
    </div>
  );
}
