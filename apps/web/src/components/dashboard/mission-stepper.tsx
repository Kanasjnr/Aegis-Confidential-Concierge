"use client"

import { CheckCircle2, Circle, Clock } from "lucide-react"

interface MissionStepperProps {
  currentStep: number
  steps: { label: string; description: string; status: "complete" | "active" | "pending" }[]
}

export function MissionStepper({ currentStep, steps }: MissionStepperProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <span className="text-label text-white">Mission Lifecycle</span>
        <span className="text-[10px] text-muted-foreground font-mono">Q3-2024</span>
      </div>

      <div className="space-y-6">
        {steps.map((step, i) => (
          <div key={i} className={`group relative flex gap-4 transition-all duration-300 ${i + 1 > currentStep ? 'opacity-30' : 'opacity-100'}`}>
            {/* Step Line */}
            {i !== steps.length - 1 && (
               <div className={`absolute left-[7px] top-6 w-[0.5px] h-10 ${i + 1 < currentStep ? 'bg-primary' : 'bg-border'}`} />
            )}

            {/* Icon/Circle */}
            <div className="z-10 mt-1">
              {step.status === "complete" ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : step.status === "active" ? (
                <div className="h-4 w-4 flex items-center justify-center">
                   <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                </div>
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            <div className="flex flex-col gap-1">
               <span className={`text-[12px] font-bold uppercase tracking-widest ${step.status === "active" ? 'text-primary' : 'text-white/80 group-hover:text-white'}`}>
                 {step.label}
               </span>
               <span className="text-[10px] text-muted-foreground leading-tight">
                 {step.description}
               </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-4 border border-white/5 bg-white/5 rounded-sm">
         <div className="flex items-center gap-2 mb-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-label">Session Guard</span>
         </div>
         <p className="text-[10px] text-muted-foreground">Self Protocol Identity Token valid for 11:42min. High-security mode enabled.</p>
      </div>
    </div>
  )
}
