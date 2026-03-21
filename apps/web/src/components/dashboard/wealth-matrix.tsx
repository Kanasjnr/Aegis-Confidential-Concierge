"use client"

import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"

interface WealthMatrixProps {
  tvl: string
  trend: string
  allocation: { label: string; value: number; color: string }[]
}

export function WealthMatrix({ tvl, trend, allocation }: WealthMatrixProps) {
  return (
    <div className="w-full py-12 border-b-[0.5px] border-border">
      <div className="flex flex-col gap-2">
        <span className="text-label uppercase">Total Net Assets Under Management</span>
        <div className="flex items-baseline gap-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-wealth font-light"
          >
            {tvl} <span className="text-muted-foreground text-3xl ml-2">cUSD</span>
          </motion.h1>
          <div className="flex items-center gap-1.5 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-bold">{trend}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
        {/* Asset Allocation Bar */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-label">Asset Allocation</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Diversity Index: 0.84</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 flex rounded-full overflow-hidden">
            {allocation.map((item, i) => (
              <div 
                key={i} 
                style={{ width: `${item.value}%`, backgroundColor: item.color }} 
                className="h-full first:rounded-l-full last:rounded-r-full opacity-80"
              />
            ))}
          </div>
          <div className="flex gap-6">
            {allocation.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{item.label} {item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clean Sparkline Placeholder */}
        <div className="h-20 w-full relative group">
           <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100">
             <path 
               d="M 0 80 Q 50 10, 100 70 T 200 60 T 300 85 T 400 40" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="1" 
               className="text-primary/40 group-hover:text-primary transition-colors duration-500"
             />
           </svg>
           <div className="absolute inset-0 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-muted-foreground">-24H</span>
              <span className="text-[10px] text-muted-foreground">NOW</span>
           </div>
        </div>
      </div>
    </div>
  )
}
