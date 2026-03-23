import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  trend?: { value: string; positive: boolean }
  icon?: ReactNode
}

export function StatCard({ label, value, subValue, trend, icon }: StatCardProps) {
  return (
    <Card className="flex-1 bg-[#161B22] border-2 border-border/10 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all duration-500 group cursor-default shadow-2xl overflow-hidden p-0">
      <CardContent className="p-8 flex flex-col justify-between h-full space-y-8">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 group-hover:text-white transition-colors">{label}</span>
          {icon && <div className="text-white/10 group-hover:text-[#35D07F] group-hover:scale-110 transition-all duration-500">{icon}</div>}
        </div>

        <div className="flex items-end justify-between gap-4">
          <span className="text-5xl font-black text-white tracking-tighter group-hover:text-white transition-colors duration-500 uppercase">{value}</span>
          {trend && (
            <div className="flex flex-col items-end pb-1">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-md border",
                trend.positive 
                  ? "bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20" 
                  : "bg-destructive/20 text-destructive border-destructive/20"
              )}>
                 {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-3 group-hover:text-slate-400 transition-colors">SYNCED</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
