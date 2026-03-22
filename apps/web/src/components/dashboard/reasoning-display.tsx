import { useState, useEffect } from 'react';
import { Terminal, Shield, CheckCircle, Search, Zap, Loader2, ArrowRight } from 'lucide-react';
import { useWalletClient } from 'wagmi';
import { arkhaiService } from '@/lib/arkhai-service';
import { motion, AnimatePresence } from 'framer-motion';

interface ReasoningData {
  status: string;
  logs: string[];
  reasoning?: {
    plan?: string;
    signature?: string;
    commitment?: any;
  };
  lastUpdated: string;
}

export function ReasoningDisplay({ mandateId }: { mandateId: string }) {
  const [data, setData] = useState<ReasoningData | null>(null);
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
    const interval = setInterval(fetchReasoning, 3000); // Polling every 3s for "live" feel
    return () => clearInterval(interval);
  }, [mandateId]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#0A0A0B]/50 rounded-3xl border border-white/5 backdrop-blur-xl space-y-4">
        <div className="relative">
          <Loader2 className="h-10 w-10 text-primary animate-spin opacity-40" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 font-mono">Syncing Aegis Node...</span>
      </div>
    );
  }

  const logs = data?.logs || [];
  const status = data?.status || 'idle';
  const plan = data?.reasoning?.plan;
  const error = (data as any)?.error; // Catch any server-side errors

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
           <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
           <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary opacity-80">Aegis Live Intel</span>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-3 py-1 rounded-full border border-white/5">
           <div className={`h-1.5 w-1.5 rounded-full ${status === 'active' ? 'bg-primary' : status === 'secured' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`} />
           <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{status}</span>
        </div>
      </div>

      <div className="group relative">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/0 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
        
        <div className="relative bg-[#050505] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-500/20" />
              <div className="h-2 w-2 rounded-full bg-yellow-500/20" />
              <div className="h-2 w-2 rounded-full bg-green-500/20" />
            </div>
            <span className="text-[8px] font-mono text-muted-foreground/40">arkhai-nla-session.log</span>
          </div>

          <div className="p-4 flex gap-4 overflow-x-auto bg-black/40 border-b border-white/5 scrollbar-hide">
             <StatusStep icon={<Search />} label="Discovery" active={status === 'analyzing'} complete={['active', 'securing', 'secured'].includes(status)} />
             <StatusStep icon={<Shield />} label="Arbiter" active={status === 'active'} complete={['securing', 'secured'].includes(status)} />
             <StatusStep icon={<Zap />} label="Secured" active={status === 'securing'} complete={status === 'secured'} />
          </div>

          <div className="p-6 font-mono text-[11px] h-[280px] overflow-y-auto space-y-2 scrollbar-hide bg-black/60 relative">
             {/* Scan line effect */}
             <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/10 animate-scan pointer-events-none" />
             
             {logs.map((log, i) => (
               <div key={i} className={`flex gap-3 ${i === logs.length - 1 ? 'text-white' : 'text-white/40'} transition-all duration-500`}>
                  <span className="text-primary/60 shrink-0 font-bold">[{i.toString().padStart(2, '0')}]</span>
                  <span className="leading-relaxed break-all">{log}</span>
               </div>
             ))}
             {status === 'idle' && (
               <div className="text-muted-foreground/20 italic animate-pulse">Establishing secure link via Celo...</div>
             )}
             <div id="logs-end" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {plan && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 px-2">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">Tactical Blueprint</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="p-6 bg-primary/[0.03] border border-primary/20 rounded-[2rem] relative overflow-hidden group backdrop-blur-md">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500">
                  <Shield className="h-16 w-16 text-primary" />
               </div>
               
               <p className="text-xs text-white/90 leading-relaxed font-medium whitespace-pre-wrap break-all relative z-10 selection:bg-primary/30">
                 {plan}
               </p>

               {data?.reasoning?.signature && (
                 <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500/80">Identity Seal: Signed</span>
                     </div>
                     <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                        <span className="text-[8px] font-mono text-muted-foreground">EIP-712</span>
                     </div>
                   </div>

                   <div className="p-3 bg-black/40 rounded-xl font-mono text-[9px] text-muted-foreground/60 border border-white/5 break-all">
                      {data.reasoning.signature}
                   </div>
                   
                   {!settledHash ? (
                     <div className="space-y-3">
                       <button
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
                         className="group relative w-full h-14 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl flex items-center justify-center gap-3 overflow-hidden transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                       >
                         {isSettling ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                         ) : (
                           <>
                             <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /> 
                             Approve & Finalize Settlement
                           </>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:animate-shimmer" />
                       </button>
                       <p className="text-[9px] text-center text-muted-foreground/50 font-bold uppercase tracking-widest">Only authorized CFO Wallet can release funds</p>
                     </div>
                   ) : (
                     <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mt-2 p-6 bg-green-500/10 border border-green-500/30 rounded-3xl flex flex-col items-center gap-3 text-center shadow-[0_0_40px_rgba(34,197,94,0.1)]"
                     >
                        <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce shadow-inner">
                           <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-white uppercase tracking-tighter">Mission Accomplished</h4>
                          <p className="text-[10px] text-green-500/80 font-bold uppercase tracking-widest">Settlement Finalized on Celo</p>
                        </div>
                        <a 
                          href={`https://celo-sepolia.blockscout.com/tx/${settledHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-500 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors border border-green-500/20"
                        >
                          View Receipt
                        </a>
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
    <div className={`flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-full border transition-all ${
      active ? 'bg-primary/20 border-primary text-primary' : 
      complete ? 'bg-green-500/10 border-green-500/50 text-green-500' : 
      'bg-transparent border-white/5 text-muted-foreground opacity-40'
    }`}>
      <div className="h-3 w-3 shrink-0">
        {complete ? <CheckCircle className="h-3 w-3" /> : icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </div>
  );
}
