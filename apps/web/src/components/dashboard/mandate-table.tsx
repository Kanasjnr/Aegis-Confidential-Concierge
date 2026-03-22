import { FileText, TrendingUp, Clock, AlertCircle, ExternalLink, X, Shield, Coins } from "lucide-react"
import { useAccount, usePublicClient } from "wagmi"
import { useState, useEffect } from "react"
import { formatUnits } from "viem"
import { AEGIS_ESCROW_ADDRESS, AegisEscrowAbi } from "@/lib/contracts"
import { motion, AnimatePresence } from "framer-motion"

interface Mandate {
  id: string
  name: string
  type: string
  status: "active" | "executed" | "pending"
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

        const mappedMandates: Mandate[] = logs.map((log: any) => {
          const { attestationId, token, amount } = log.args
          const idLower = attestationId.toLowerCase()

          // Try to recover goal from localStorage or Legacy map
          const savedGoal = localStorage.getItem(`aegis_mandate_${idLower}`) || LEGACY_MANDATES_METADATA[idLower]

          let name = `Mandate ${attestationId.slice(0, 6)}`
          if (savedGoal) {
            const cleaned = savedGoal.replace('Mandate: ', '').replace('Determine if ', '')
            // Prefer the Mandate Identifier if it exists
            name = cleaned.includes('Strategy:') ? cleaned.split('Strategy:')[0].trim().replace('.', '') : cleaned.split('.')[0]
            name = name.slice(0, 40)
          }

          const type = savedGoal?.toLowerCase().includes('strategy') ? 'AI Optimization' : 'Service Escrow'

          return {
            id: attestationId,
            name: name,
            type: type,
            status: "active",
            value: `${formatUnits(amount, 18)} USDm`,
            fullGoal: savedGoal || `Aegis Escrow Auth: ${attestationId.slice(0, 12)}...`,
            token: token,
            amount: formatUnits(amount, 18),
            lastUpdated: "Active Now"
          }
        })

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
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${m.status === 'active' ? 'bg-primary' : m.status === 'pending' ? 'bg-yellow-500' : 'bg-muted-foreground'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{m.status}</span>
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
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-[#0A0A0B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Mandate Details</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Zk-Authorized Escrow</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mission Intent</span>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                <p className="text-sm text-white/90 leading-relaxed italic">
                  "{mandate.fullGoal}"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Value Locked</span>
                <div className="flex items-center gap-2">
                  <Coins className="h-3 w-3 text-primary" />
                  <span className="text-lg font-bold text-white">{mandate.value}</span>
                </div>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{mandate.status}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">On-Chain Metadata</span>
              <div className="space-y-3 font-mono text-[10px]">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Attestation ID</span>
                  <span className="text-white/60 truncate max-w-[200px]">{mandate.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Escrow Contract</span>
                  <span className="text-white/60 truncate max-w-[200px]">{AEGIS_ESCROW_ADDRESS}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Settlement Token</span>
                  <span className="text-white/60 truncate max-w-[200px]">{mandate.token}</span>
                </div>
              </div>
            </div>
          </div>

          <a
            href={`https://celo-sepolia.blockscout.com/address/${AEGIS_ESCROW_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-all group"
          >
            Verify on Blockscout
            <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </motion.div>
    </div>
  )
}
