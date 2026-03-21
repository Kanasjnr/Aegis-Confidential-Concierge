"use client"

import { Shield, Cloud, CreditCard } from "lucide-react"

export function IdentityRibbon() {
  return (
    <div className="flex h-12 w-full items-center justify-between border-b-[0.5px] border-border bg-background px-8">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-label text-primary">Celo Mainnet</span>
          <span className="text-[10px] text-muted-foreground font-mono opacity-50">0x12,451,328</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Shield className="h-3 w-3 text-primary/80" />
          <span className="text-label">ZK-Identity Verified</span>
          <span className="text-[10px] text-muted-foreground font-mono opacity-50">ID: AG-411-CFO</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-sm bg-white/5 border border-white/5">
          <CreditCard className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">Institutional Hub</span>
        </div>
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-[9px] font-black">AS</span>
        </div>
      </div>
    </div>
  )
}
