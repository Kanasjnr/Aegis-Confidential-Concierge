"use client"

import { motion } from "framer-motion"

interface PortfolioSummaryProps {
  balance: string
  change: string
  allocation: { label: string; value: number; color: string }[]
}

export function PortfolioSummary({ balance, change, allocation }: PortfolioSummaryProps) {
  return (
    <div className="p-8 border border-white/5 bg-[#121821] rounded-2xl space-y-8 shadow-2xl group hover:border-white/10 transition-all">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Portfolio Balance</span>
        <div className="flex items-baseline gap-4">
           <h1 className="text-4xl font-black tracking-tight text-white uppercase">{balance} <span className="text-slate-500 text-2xl font-black ml-1 uppercase">USD</span></h1>
           <span className="text-[10px] font-black text-white bg-white/10 px-3 py-1 rounded-md border border-white/10 uppercase tracking-widest">{change} Today</span>
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
              style={{ width: `${item.value}%`, backgroundColor: i === 0 ? 'white' : i === 1 ? '#64748b' : i === 2 ? '#334155' : '#1e293b' }} 
              className="h-full border-r border-[#0F1216]/20 last:border-none"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allocation.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full" style={{ backgroundColor: i === 0 ? 'white' : i === 1 ? '#64748b' : i === 2 ? '#334155' : '#1e293b' }} />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">{item.label}</span>
                  <span className="text-[10px] text-slate-500 font-black uppercase">{item.value}%</span>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
