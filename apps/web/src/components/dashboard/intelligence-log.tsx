"use client";

import { Card } from "@/components/ui/card";
import { Terminal, Shield, Lock, Fingerprint } from "lucide-react";

interface IntelligenceLogProps {
    timestamp: string;
    id: string;
    content: string;
    type: 'reasoning' | 'security' | 'settlement' | 'identity';
}

const TYPE_CONFIG = {
    reasoning: { icon: Terminal, label: 'Reasoning Node', color: 'text-primary' },
    security: { icon: Shield, label: 'Security Guard', color: 'text-amber-500' },
    settlement: { icon: Lock, label: 'Settlement Node', color: 'text-green-500' },
    identity: { icon: Fingerprint, label: 'Humanity Proof', color: 'text-purple-500' },
};

export function IntelligenceLog({ timestamp, id, content, type }: IntelligenceLogProps) {
    const config = TYPE_CONFIG[type];
    const Icon = config.icon;

    return (
        <Card className="glass-panel p-5 space-y-3 glow-border group hover:bg-white/[0.02] transition-colors">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.15em]">
                <div className="flex items-center gap-2">
                    <Icon className={`h-3 w-3 ${config.color}`} />
                    <span className="font-mono tracking-tighter opacity-80">{id}</span>
                    <div className="h-1 w-1 rounded-full bg-white/20" />
                    <span className="text-muted-foreground font-medium">{timestamp}</span>
                </div>
                <span className={`${config.color}`}>{config.label}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground font-medium italic">
                "{content}"
            </p>
            <div className="flex gap-2">
                <div className="px-2 py-0.5 rounded bg-primary/5 border border-primary/10 text-[9px] font-bold text-primary/80 uppercase tracking-widest">
                    Privacy Encrypted
                </div>
                <div className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    Celo Block Anchored
                </div>
            </div>
        </Card>
    );
}
