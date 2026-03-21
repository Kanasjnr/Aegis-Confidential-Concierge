"use client"

import { motion } from "framer-motion"

interface PortfolioSummaryProps {
  balance: string
  change: string
  allocation: { label: string; value: number; color: string }[]
}

export function PortfolioSummary({ balance, change, allocation }: PortfolioSummaryProps) {
  return (
    <div className="p-8 border border-border bg-card/5 rounded-2xl space-y-8">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Portfolio Balance</span>
        <div className="flex items-baseline gap-4">
           <h1 className="text-4xl font-bold tracking-tight text-white">{balance} <span className="text-muted-foreground text-2xl font-light ml-1">USD</span></h1>
           <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm">{change} Today</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
           <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Asset Allocation</span>
           <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Total Committed: $3.45M</span>
        </div>
        
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
          {allocation.map((item, i) => (
            <div 
              key={i} 
              style={{ width: `${item.value}%`, backgroundColor: item.color }} 
              className="h-full border-r border-background/20 last:border-none"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allocation.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground">{item.value}%</span>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
