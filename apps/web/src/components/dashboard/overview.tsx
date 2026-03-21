"use client";

import { Button } from "@/components/ui/button";
import { MetricCard } from "./metric-card";
import { IntelligenceLog } from "./intelligence-log";
import { MandateItem } from "./mandate-item";
import { Card } from "@/components/ui/card";
import { useEscrowMetrics } from "@/hooks/use-escrow-metrics";
import { useIntelligenceLogs } from "@/hooks/use-intelligence-logs";
import { CreateMandateModal } from "./create-mandate-modal";
import { useState } from "react";
import {
    Lock,
    Cpu,
    Fingerprint,
    Plus,
    Shield,
    ExternalLink,
    ChevronRight,
    ChevronLeft,
    Loader2
} from "lucide-react";

export function DashboardOverview() {
    const { totalValueLocked, isLoading: isEscrowLoading } = useEscrowMetrics();
    const { logs, isLoading: isLogsLoading } = useIntelligenceLogs();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Escrow Value"
                    value={isEscrowLoading ? "..." : totalValueLocked}
                    unit="cUSD"
                    trend="+12% Vol"
                    icon={isEscrowLoading ? Loader2 : Lock}
                    description="Native Celo Escrow"
                    className={isEscrowLoading ? "animate-pulse" : ""}
                />
                <MetricCard
                    title="Active Autonomous Nodes"
                    value="02"
                    trend="Live"
                    icon={Cpu}
                    description="Venice AI Backend"
                />
                <MetricCard
                    title="Identity Proofs"
                    value="100%"
                    trend="Verified"
                    icon={Fingerprint}
                    description="Self Protocol ZK-Proof"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Intelligence Stream */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            Live Intelligence Stream
                        </h2>
                        <Button variant="link" className="text-[10px] uppercase font-bold tracking-widest text-primary/60 hover:text-primary">
                            View Full Logs
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {logs.map((log) => (
                            <IntelligenceLog
                                key={log.id}
                                id={log.id}
                                timestamp={log.timestamp}
                                type={log.type}
                                content={log.content}
                            />
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-4">
                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-white/5 border-white/10 opacity-30 cursor-not-allowed">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Page 1 of 42</div>
                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-white/5 border-white/10 hover:border-primary/40 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Action Sidebar */}
                <div className="lg:col-span-2 space-y-10">
                    <section className="space-y-6">
                        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-muted-foreground px-2">Active Mandates</h2>
                        <Card className="glass-panel p-4 space-y-4 border-white/5 shadow-none">
                            <div className="space-y-1">
                                <MandateItem title="Cloud Ops 2026" budget="5,000 cUSD" status="Negotiating" />
                                <div className="separator !my-2 opacity-30" />
                                <MandateItem title="Global SaaS Reserve" budget="1,200 cUSD" status="Optimizing" />
                                <div className="separator !my-2 opacity-30" />
                                <MandateItem title="Agent Compute Pool" budget="500 cUSD" status="Locked" />
                            </div>

                            <Button 
                                className="w-full h-12 glass-panel hover:bg-white/5 border-white/10 mt-4 text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                <Plus className="h-3.5 w-3.5" /> Define New Mandate
                            </Button>
                        </Card>
                    </section>

                    <CreateMandateModal 
                        open={isCreateModalOpen} 
                        onOpenChange={setIsCreateModalOpen} 
                    />

                    <section className="space-y-6">
                        <Card className="bg-primary/5 border border-primary/20 p-8 rounded-[2rem] relative overflow-hidden group">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 p-8 rotate-12 opacity-5 group-hover:rotate-0 transition-transform duration-700">
                                <Shield className="h-40 w-40 text-primary" />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-primary mb-3">Protocol Health</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                                    Your autonomous identity is currently anchored to Celo Mainnet. Audit logs are being generated privately via Venice Nodes.
                                </p>
                                <div className="flex items-center gap-6">
                                    <Button variant="link" className="p-0 h-auto text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                                        View Audit Log <ExternalLink className="h-3 w-3" />
                                    </Button>
                                    <div className="h-4 w-[1px] bg-primary/20" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-500/80">Mainnet Status</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </section>
                </div>
            </div>
        </div>
    );
}
