"use client"

import { useEffect, useState } from "react"
import { Activity, Clock, Shield, Terminal, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface LogEntry {
  id: string
  mandateId: string
  timestamp: string
  message: string
  type?: "info" | "success" | "warning" | "error"
}

export function ActivityPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/agent/reasoning")
        const data = await res.json()
        
        const allLogs: LogEntry[] = []
        Object.keys(data).forEach(mandateId => {
          const entry = data[mandateId]
          if (entry.logs && Array.isArray(entry.logs)) {
            entry.logs.forEach((line: string, index: number) => {
              const tsMatch = line.match(/\[(.*?)\]/)
              allLogs.push({
                id: `${mandateId}-${index}`,
                mandateId,
                timestamp: tsMatch ? tsMatch[1] : "just now",
                message: line.replace(/\[.*?\]/, "").trim(),
                type: line.toLowerCase().includes("success") || line.toLowerCase().includes("completed") ? "success" : 
                      line.toLowerCase().includes("failed") || line.toLowerCase().includes("error") ? "error" : "info"
              })
            })
          }
        })
        
        setLogs(allLogs.slice(-100).reverse())
      } catch (err) {
        console.error("Failed to fetch logs:", err)
      }
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <aside className="w-[380px] bg-[#161B22] border-l border-white/10 flex flex-col flex-shrink-0 h-screen overflow-hidden shadow-2xl z-30">
      <div className="h-[80px] flex items-center justify-between px-8 border-b border-white/5 bg-[#121821]">
        <div className="flex items-center gap-3">
          <Terminal strokeWidth={2.5} className="h-5 w-5 text-slate-500" />
          <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-slate-200 leading-none">Intelligence Feed</h2>
        </div>
        <Badge className="bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/20 font-black tracking-widest px-3 py-1 uppercase text-[9px] animate-pulse">Live Sync</Badge>
      </div>

      <ScrollArea className="flex-1 px-8 py-10">
        <div className="space-y-8 pb-20">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 opacity-20 space-y-6">
               <Shield className="h-16 w-16 text-muted-foreground/20" />
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-center max-w-[200px]">SCANNING_DEEP_CHANNELS...</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="relative group pl-8">
                {/* Visual Connector */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/5 group-hover:bg-[#35D07F]/40 transition-colors" />
                <div className="absolute left-[-4px] top-1.5 h-3 w-3 rounded-full bg-[#121821] border-2 border-white/10 group-hover:border-[#35D07F] transition-colors" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#35D07F] transition-colors">{log.timestamp}</span>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tight text-slate-600 border-white/5 py-0 px-2">{log.mandateId.slice(0, 12)}</Badge>
                  </div>
                  <div className="p-4 bg-[#121821] border border-white/5 rounded-xl group-hover:border-white/10 transition-all shadow-lg">
                    <p className="text-[12px] leading-relaxed font-black uppercase tracking-tight text-slate-400 group-hover:text-slate-200 transition-colors opacity-60 group-hover:opacity-100">
                      {log.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Decorative Footer */}
      <div className="h-14 border-t border-white/5 bg-[#121821] flex items-center px-8 gap-4">
         <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-[#35D07F]/40 animate-pulse" />
         </div>
         <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Sovereign Link</span>
      </div>
    </aside>
  )
}
