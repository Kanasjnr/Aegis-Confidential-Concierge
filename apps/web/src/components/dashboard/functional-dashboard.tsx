"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Shield, Cpu, Lock, Globe } from "lucide-react"
import {
  OverviewView,
  RegistryView,
  MandatesView,
  ActivityView,
  SettingsView
} from "./dashboard-views"
import { CreateMandateModal } from "./create-mandate-modal"
import { ActivityPanel } from "./activity-panel"
import { Badge } from "@/components/ui/badge"

export function FunctionalDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewView />
      case "registry":
        return <RegistryView />
      case "mandates":
        return <MandatesView />
      case "activity":
        return <ActivityView />
      case "settings":
        return <SettingsView />
      default:
        return <OverviewView />
    }
  }

  return (
    <div className="flex h-screen bg-[#121821] overflow-hidden font-sans text-white selection:bg-white/10 selection:text-white">
      {/* 1. Sidebar (Fixed 240px) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewMandate={() => setIsCreateModalOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[#161B22] overflow-hidden relative">
        {/* Top Bar (Fixed 80px) - Refined Hierarchy */}
        <header className="h-[80px] border-b border-white/5 flex items-center justify-between px-10 bg-[#252B32] flex-shrink-0 z-20 shadow-2xl">
          <div className="flex items-center gap-8">
            <nav className="flex items-center gap-4 text-[12px] font-black uppercase tracking-[0.3em] text-slate-500">
              <span className="hover:text-white transition-colors cursor-pointer tracking-[0.2em]">Institutional Shell</span>
              <span className="text-white/10">/</span>
              <span className="text-white bg-white/5 px-3 py-1 rounded-md border-l-2 border-white/40 tracking-widest">{activeTab.toUpperCase()}</span>
            </nav>
            <div className="h-4 w-px bg-white/5 mx-2" />
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-slate-400 shadow-[0_0_10px_rgba(255,255,255,0.1)] animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Established</span>
              </div>
              <div className="flex items-center gap-3 opacity-30">
                <Lock className="h-3.5 w-3.5" strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[12px] font-black text-slate-200 uppercase tracking-[0.1em] leading-none">Celo Sepolia</span>
                <span className="text-[9px] font-black text-slate-600 leading-none mt-1.5 uppercase tracking-widest">v.1.0.4 - Sovereign</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[#161B22] border border-white/5 flex items-center justify-center shadow-lg group hover:border-white/10 transition-all">
                <Cpu strokeWidth={2.5} className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#121821] scroll-smooth custom-scrollbar">
          <div className="p-16 max-w-[1700px] mx-auto flex flex-col gap-12">
            {renderContent()}
          </div>
        </div>

        {/* System Alert Overlay (Fixed Bottom) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Badge className="bg-[#1A212C] border border-white/10 text-slate-200 font-black tracking-[0.3em] px-6 py-2 uppercase text-[9px] shadow-2xl transition-all hover:bg-white/5 hover:scale-105">
            Infrastructure Nominal // Optimized
          </Badge>
        </div>
      </main>

      <CreateMandateModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  )
}
