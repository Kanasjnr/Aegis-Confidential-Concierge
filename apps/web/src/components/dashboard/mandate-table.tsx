import { FileText, TrendingUp, Clock, AlertCircle, ExternalLink, X, Shield, Coins, Terminal, Info } from "lucide-react"
import { useAccount, usePublicClient } from "wagmi"
import { useState, useEffect } from "react"
import { formatUnits } from "viem"
import { AEGIS_ESCROW_ADDRESS, AegisEscrowAbi, getTokenDecimals, getTokenSymbol } from "@/lib/contracts"
import { motion, AnimatePresence } from "framer-motion"
import { ReasoningDisplay } from "./reasoning-display"

interface Mandate {
  id: string
  name: string
  type: string
  status: "active" | "executed" | "pending" | "secured"
  value: string
  fullGoal: string
  token: string
  amount: string
  lastUpdated: string
}

// Support for "Legacy" mandates created before the caching was implemented
const LEGACY_MANDATES_METADATA: Record<string, string> = {
  "0x42f7723ac24cf2706cc3a4092f54ac6f8c767fa798e881d04a3349d389d69b6d": "Mandate: Lisbon Workspace Residency. Strategy: Balanced. Goal: Find a high-end co-living space in Lisbon for the month of May. It must have high-speed fiber internet, a private balcony, and be within walking distance of the Barrio Alto district.",
  ["0x42f7723ac24cf2706cc3a4092f54ac6f8c767fa798e881d04a3349d389d69b6d".toLowerCase()]: "Mandate: Lisbon Workspace Residency. Strategy: Balanced. Goal: Find a high-end co-living space in Lisbon for the month of May. It must have high-speed fiber internet, a private balcony, and be within walking distance of the Barrio Alto district."
}

export function MandateTable() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [mandates, setMandates] = useState<Mandate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMandate, setSelectedMandate] = useState<Mandate | null>(null)

  useEffect(() => {
    const fetchMandates = async () => {
      if (!address || !publicClient) return
      setIsLoading(true)

      try {
        const logs = await publicClient.getLogs({
          address: AEGIS_ESCROW_ADDRESS,
          event: {
            type: 'event',
            name: 'FundsLocked',
            inputs: [
              { indexed: true, name: 'attestationId', type: 'bytes32' },
              { indexed: true, name: 'agent', type: 'address' },
              { indexed: true, name: 'vendor', type: 'address' },
              { indexed: false, name: 'token', type: 'address' },
              { indexed: false, name: 'amount', type: 'uint256' }
            ]
          },
          args: {
            agent: address
          },
          fromBlock: 20850000n
        })

        const mappedMandates: Mandate[] = await Promise.all(logs.map(async (log: any) => {
          const { attestationId, token, amount } = log.args
          const idLower = attestationId.toLowerCase()

          // Try to recover goal from localStorage or Legacy map
          const savedGoal = localStorage.getItem(`aegis_mandate_${idLower}`) || LEGACY_MANDATES_METADATA[idLower]

          // Fetch reasoning status from API
          let currentStatus: Mandate['status'] = "active"
          try {
            const resp = await fetch(`/api/agent/reasoning?mandateId=${attestationId}`)
            const data = await resp.json()
            if (data.status === 'secured') currentStatus = "secured"
            if (data.status === 'success') currentStatus = "executed"
          } catch (e) {
             console.log("Status check failed for", attestationId)
          }

          let name = `Mandate ${attestationId.slice(0, 6)}`
          if (savedGoal) {
            const cleaned = savedGoal.replace('Mandate: ', '').replace('Determine if ', '')
            name = cleaned.includes('Strategy:') ? cleaned.split('Strategy:')[0].trim().replace('.', '') : cleaned.split('.')[0]
            name = name.slice(0, 40)
          }

          const type = savedGoal?.toLowerCase().includes('strategy') ? 'AI Optimization' : 'Service Escrow'
          const decimals = getTokenDecimals(token)
          const symbol = getTokenSymbol(token)

          return {
            id: attestationId,
            name: name,
            type: type,
            status: currentStatus,
            value: `${formatUnits(amount, decimals)} ${symbol}`,
            fullGoal: savedGoal || `Aegis Escrow Auth: ${attestationId.slice(0, 12)}...`,
            token: token,
            amount: formatUnits(amount, decimals),
            lastUpdated: "Active Now"
          }
        }))

        setMandates(mappedMandates.reverse())
      } catch (error) {
        console.error("Error fetching mandates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMandates()
  }, [address, publicClient])

  if (isLoading) {
    return (
      <div className="w-full h-40 flex items-center justify-center border border-dashed border-border rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-5 w-5 text-primary animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Syncing Mandates...</span>
        </div>
      </div>
    )
  }

  if (mandates.length === 0) {
    return (
      <div className="w-full h-40 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">No Active Mandates</span>
        <p className="text-xs text-muted-foreground/60 font-medium">Create your first mandate to see it here.</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Active Mandates</span>
        </div>
      </div>

      <div className="border border-border bg-card/5 rounded-2xl overflow-hidden text-left">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-white/5">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Name</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Value</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {mandates.map((m) => (
              <tr
                key={m.id}
                onClick={() => setSelectedMandate(m)}
                className="hover:bg-white/5 transition-all group cursor-pointer"
              >
                <td className="px-6 py-5">
                  <span className="text-sm font-bold text-white group-hover:text-primary transition-colors max-w-[200px] truncate block">{m.name}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs text-muted-foreground font-medium">{m.type}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{m.value}</span>
                    {m.status === 'active' && <TrendingUp className="h-3 w-3 text-primary" />}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    {m.status === "secured" && (
                      <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-1.5 ring-1 ring-yellow-500/30 animate-pulse">
                        <Shield className="h-3 w-3 text-yellow-500" />
                        <span className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">Secured</span>
                      </div>
                    )}
                    <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      m.status === "active" ? "bg-primary/10 border border-primary/20 text-primary" :
                      m.status === "secured" ? "bg-white/5 border border-white/10 text-white" :
                      "bg-green-500/10 border border-green-500/20 text-green-500"
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        m.status === "active" ? "bg-primary animate-pulse" :
                        m.status === "secured" ? "bg-white" :
                        "bg-green-500"
                      }`} />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                        {m.status === "secured" ? "Review Pending" : m.status}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground font-bold uppercase">
                    <Clock className="h-3 w-3" />
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-2xl bg-[#050505]/80 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
      >
        {/* Institutional Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-50" />
        
        <div className="p-10 space-y-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                 <Shield className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-white tracking-tighter">Mission Mandate</h3>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 font-mono">ID: {mandate.id.slice(0, 16)}</span>
                   <div className="h-1 w-1 rounded-full bg-white/20" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 font-mono">SEPOLIA-V1</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="h-10 w-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all active:scale-95 group"
            >
              <X className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
            </button>
          </div>

          <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
             <button 
               onClick={() => setActiveTab('intent')}
               className={`flex-1 flex items-center justify-center gap-3 py-3 text-[10px] uppercase font-black tracking-[0.2em] rounded-xl transition-all duration-300 ${activeTab === 'intent' ? 'bg-white/10 text-white shadow-[0_4px_12px_rgba(255,255,255,0.05)]' : 'text-muted-foreground hover:text-white/60'}`}
             >
                <Info className="h-3.5 w-3.5" />
                Mission Intent
             </button>
             <button 
               onClick={() => setActiveTab('agent')}
               className={`flex-1 flex items-center justify-center gap-3 py-3 text-[10px] uppercase font-black tracking-[0.2em] rounded-xl transition-all duration-300 ${activeTab === 'agent' ? 'bg-primary/20 text-primary shadow-lg' : 'text-muted-foreground hover:text-primary/60'}`}
             >
                <Terminal className="h-3.5 w-3.5" />
                Agent Reasoning
             </button>
          </div>

          <div className="min-height-[420px]">
            {activeTab === 'intent' ? (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">CFO Master Directive</span>
                     <div className="h-px flex-1 bg-white/5" />
                   </div>
                   <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] shadow-inner">
                      <p className="text-xl text-white/90 leading-tight font-black tracking-tight italic">
                        "{mandate.fullGoal}"
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[1.5rem] flex flex-col gap-2 relative group hover:border-primary/30 transition-colors">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Procurement Budget</span>
                      <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-black text-white tracking-tighter group-hover:text-primary transition-colors">{mandate.value}</span>
                         <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{mandate.token}</span>
                      </div>
                      <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                         <Coins className="h-4 w-4 text-white/20" />
                      </div>
                   </div>
                   <div className="p-6 bg-primary/[0.02] border border-primary/20 rounded-[1.5rem] flex flex-col gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Authorization Status</span>
                      <div className="flex items-center gap-3">
                         <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                         <span className="text-lg font-black text-white uppercase tracking-tighter">{mandate.status}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Immutable Record</span>
                     <div className="h-px flex-1 bg-white/5" />
                   </div>
                   <div className="grid grid-cols-2 gap-4 font-mono text-[9px] p-5 bg-black/40 rounded-2xl border border-white/5">
                      <div className="space-y-1">
                        <span className="text-muted-foreground/40 block">ATTESTATION</span>
                        <span className="text-white/60 truncate block">{mandate.id}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground/40 block">TOKEN-PAIR</span>
                        <span className="text-white/60 truncate block">{mandate.token}/CELO-SEP</span>
                      </div>
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full"
              >
                <ReasoningDisplay mandateId={mandate.id} />
              </motion.div>
            )}
          </div>

          <div className="pt-4">
             <a 
                href={`https://celo-sepolia.blockscout.com/address/${AEGIS_ESCROW_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/5 rounded-2xl transition-all group"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Check On-Chain Vault Status</span>
                <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
