"use client";

import { ArrowUpRight } from "lucide-react";

interface MandateItemProps {
    title: string;
    budget: string;
    status: string;
    compliance?: string;
}

export function MandateItem({ title, budget, status, compliance = "100%" }: MandateItemProps) {
    return (
        <div className="flex items-center justify-between group cursor-pointer p-4 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/5">
            <div className="space-y-1">
                <p className="text-sm font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors">{title}</p>
                <div className="flex items-center gap-3">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{budget} Mandate</p>
                    <div className="h-1 w-1 rounded-full bg-white/20" />
                    <p className="text-[10px] text-green-500/80 font-bold uppercase tracking-widest">{compliance} Compliance</p>
                </div>
            </div>
            <div className="flex items-center gap-4 text-right">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest group-hover:text-foreground transition-colors">{status}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
        </div>
    );
}
