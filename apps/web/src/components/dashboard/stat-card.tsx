"use client"

import { ReactNode } from "react"

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  trend?: { value: string; positive: boolean }
  icon?: ReactNode
}

export function StatCard({ label, value, subValue, trend, icon }: StatCardProps) {
  return (
    <div className="p-6 border border-border bg-card/10 rounded-xl hover:bg-card/20 transition-all flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{label}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>

      <div className="space-y-1">
        <div className="flex flex-col items-baseline justify-between gap-1">
          <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
          {trend && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${trend.positive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
               {trend.positive ? '+' : ''}{trend.value}
            </span>
          )}
        </div>
        {subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
      </div>
    </div>
  )
}
