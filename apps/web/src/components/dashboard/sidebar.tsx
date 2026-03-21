"use client"

import { Home, Shield, FileText, Activity, Settings, Plus, LogOut } from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Home", icon: Home },
    { id: "registry", label: "Registry", icon: Shield },
    { id: "mandates", label: "Mandates", icon: FileText },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex flex-col h-full bg-background border-r border-border w-64 p-6">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-black" fill="currentColor" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Aegis</span>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === item.id 
                ? "bg-white/5 text-primary" 
                : "text-muted-foreground hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Create New Flow Entry */}
      <div className="mt-auto pt-6 space-y-4">
        <button className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold text-xs uppercase tracking-widest py-3 rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/10">
          <Plus className="h-3 w-3" />
          New Mandate
        </button>

        <div className="pt-6 border-t border-border">
          <div className="flex items-center gap-3 px-2">
             <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-[10px] font-bold">AS</span>
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate text-left">Alex Dubois</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">CFO Manager</p>
             </div>
             <LogOut className="h-3 w-3 text-muted-foreground hover:text-destructive cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  )
}
