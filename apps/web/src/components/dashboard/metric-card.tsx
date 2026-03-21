"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string;
    unit?: string;
    trend: string;
    icon: LucideIcon;
    description?: string;
    className?: string;
}

export function MetricCard({ title, value, unit, trend, icon: Icon, description, className }: MetricCardProps) {
    return (
        <Card className={cn("glass-panel p-6 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300", className)}>
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-500">
                    <Icon className="h-5 w-5 text-primary glow-text" />
                </div>
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tighter leading-none">{value}</span>
                {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
            </div>
            <div className="mt-4 flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold uppercase tracking-wider">
                    {trend}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest truncate">
                    {description || "Autonomous Index"}
                </span>
            </div>
        </Card>
    );
}
