"use client"

import { FileText, MoreVertical, TrendingUp, Clock } from "lucide-react"

interface Mandate {
  id: string
  name: string
  type: string
  status: "active" | "executed" | "pending"
  value: string
  lastUpdated: string
}

const mandates: Mandate[] = [
  { id: "1", name: "Treasury Rebalance", type: "Portfolio Optimization", status: "active", value: "$3.45M", lastUpdated: "13m ago" },
  { id: "2", name: "Cloud Renewal", type: "Service Escrow", status: "pending", value: "$230k", lastUpdated: "2h ago" },
  { id: "3", name: "Marketing Budget", type: "Ad Distribution", status: "executed", value: "$60k", lastUpdated: "1d ago" },
]

export function MandateTable() {
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
              <tr key={m.id} className="hover:bg-white/5 transition-all group">
                <td className="px-6 py-5">
                   <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{m.name}</span>
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
    </div>
  )
}
