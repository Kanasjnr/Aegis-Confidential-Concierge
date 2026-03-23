"use client"

import { Home, Shield, FileText, Activity, Settings, Plus, LogOut, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onNewMandate?: () => void
}

export function Sidebar({ activeTab, setActiveTab, onNewMandate }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "MONITOR", icon: Home },
    { id: "mandates", label: "DIRECTIVES", icon: FileText },
    { id: "activity", label: "TELEMETRY", icon: Activity },
    { id: "settings", label: "SYSTEM", icon: Settings },
  ]

  return (
    <div className="flex flex-col h-full bg-[#252B32] border-r border-white/5 w-[280px] flex-shrink-0 z-30 shadow-[10px_0_50px_rgba(0,0,0,0.3)]">
      {/* 2.1 Top Section: Logo Block */}
      <div className="p-10 mb-2">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="h-12 w-12 rounded-xl bg-white border border-white/10 flex items-center justify-center shadow-2xl transition-all group-hover:scale-110 overflow-hidden">
            <img src="/ACC.png" alt="ACC Logo" className="h-8 w-8 object-contain" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-black tracking-tight text-white uppercase leading-none">Aegis</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1.5 opacity-80">Sovereign</span>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-6 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-6 px-8 py-5 rounded-2xl transition-all duration-300 group relative",
                activeTab === item.id
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 w-1.5 h-10 bg-white rounded-r-full shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
              )}
              <item.icon
                strokeWidth={activeTab === item.id ? 3 : 2.5}
                className={cn(
                  "h-7 w-7 transition-all duration-300",
                  activeTab === item.id ? "text-white scale-110" : "text-slate-600 group-hover:text-slate-400 group-hover:scale-110"
                )}
              />
              <span className="text-[13px] font-black uppercase tracking-[0.3em]">{item.label}</span>
            </Button>
          )
        })}
      </nav>

      {/* 2.2 Bottom Section */}
      <div className="p-8 mt-auto space-y-10 bg-[#0D1117] border-t border-white/5">
        <Button
          onClick={onNewMandate}
          className="w-full h-20 bg-black hover:bg-white hover:text-black text-white rounded-2xl flex items-center justify-center gap-4 shadow-2xl group border-2 border-white"
        >
          <Plus strokeWidth={4} className="h-8 w-8 group-hover:rotate-90 transition-transform" />
          <span className="text-[16px] font-black uppercase tracking-[0.2em]">New Directive</span>
        </Button>

        <div className="flex items-center gap-4 group px-2 cursor-pointer">
          <div className="h-12 w-12 rounded-xl bg-[#121821] border-2 border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-white/20 shadow-lg">
            <div className="h-full w-full bg-white/5 flex items-center justify-center">
              <span className="text-sm font-black text-slate-300 group-hover:text-white uppercase">AD</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] font-black text-slate-200 group-hover:text-white transition-colors truncate tracking-wide uppercase">Alex Dubois</p>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] truncate mt-1">CFO Controller</p>
          </div>
          <LogOut strokeWidth={2.5} className="h-5 w-5 text-slate-600 hover:text-white transition-all hover:scale-110 focus:outline-none" />
        </div>
      </div>
    </div>
  )
}
