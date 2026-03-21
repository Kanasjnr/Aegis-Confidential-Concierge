"use client"

import { motion } from "framer-motion"
import { Cpu, CheckCircle2, Activity } from "lucide-react"

interface AgentServiceStatusProps {
  name: string
  status: "active" | "idle" | "optimizing"
  task: string
  metrics: { label: string; value: string }[]
}

export function AgentServiceStatus({ name, status, task, metrics }: AgentServiceStatusProps) {
  return (
    <div className="w-full py-12 border-b-[0.5px] border-border bg-card/10 px-8 rounded-sm">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
        
        {/* Left: AI Service Identity */}
        <div className="flex items-center gap-8">
          <div className="relative flex items-center justify-center h-16 w-16">
            <motion.div 
               animate={{ scale: [1, 1.2, 1] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute inset-0 rounded-full bg-primary/5 border border-primary/10"
            />
            <Cpu className="h-8 w-8 text-primary shadow-sm" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-light tracking-tight">{name}</span>
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            </div>
            <p className="text-label uppercase opacity-60">Authorized Autonomous Agent</p>
          </div>
        </div>

        {/* Center: Current Service Task */}
        <div className="flex-1 max-w-xl space-y-4">
          <span className="text-label">Current Strategic Execution</span>
          <p className="text-lg font-light text-white leading-relaxed">
            {task}
          </p>
        </div>

        {/* Right: Operational Metrics */}
        <div className="flex gap-12 border-l-[0.5px] border-border pl-12 lg:min-w-[300px]">
          {metrics.map((metric, i) => (
            <div key={i} className="space-y-1">
              <span className="text-label text-muted-foreground">{metric.label}</span>
              <p className="text-xl font-light">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
