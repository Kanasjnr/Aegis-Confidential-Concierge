"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Shield } from "lucide-react"
import { 
  OverviewView, 
  RegistryView, 
  MandatesView, 
  ActivityView, 
  SettingsView 
} from "./dashboard-views"
import { CreateMandateModal } from "./create-mandate-modal"

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

  const getHeaderTitle = () => {
    switch (activeTab) {
      case "overview": return "Dashboard Overview"
      case "registry": return "Registry Highlights"
      case "mandates": return "Active Mandates"
      case "activity": return "Intelligence Stream"
      case "settings": return "Workspace Settings"
      default: return "Dashboard Overview"
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onNewMandate={() => setIsCreateModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-border flex items-center justify-between px-10 bg-background/50 backdrop-blur-md sticky top-0 z-10 font-bold">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold tracking-tight text-white">{getHeaderTitle()}</h2>
             <div className="px-2 py-0.5 rounded-sm bg-green-500/10 border border-green-500/20 flex items-center gap-1.5 leading-none">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest leading-none">Active System</span>
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 group cursor-pointer">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors">Identity Verified</span>
             </div>
             <div className="h-8 w-[0.5px] bg-border" />
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">Celo Mainnet</span>
                <span className="text-[10px] text-muted-foreground font-mono leading-none mt-1">Block: 12,451,328</span>
             </div>
          </div>
        </header>

        <div className="p-10 max-w-[1400px] mx-auto space-y-10 pb-20">
          {renderContent()}
        </div>
      </main>

      <CreateMandateModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  )
}
