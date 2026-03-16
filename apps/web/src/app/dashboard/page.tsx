import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, LayoutDashboard, Send, Activity, Wallet } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="min-h-screen p-8 space-y-8 bg-background">
            {/* Header */}
            <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-primary glow-cyan" />
                    <h1 className="text-3xl font-bold tracking-tight">AEGIS <span className="text-primary font-mono font-light">CONCIERGE</span></h1>
                </div>
                <Button variant="outline" className="glass gap-2 border-primary/40 hover:bg-primary/10">
                    <Wallet className="h-4 w-4" /> Connect CFO ID
                </Button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Agent Status</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                        <p className="text-xs text-muted-foreground mt-1">Verified on Celo Mainnet</p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Open Mandates</CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground mt-1">Total Procurement Assets</p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Locked Volume</CardTitle>
                        <Send className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$1,240.00</div>
                        <p className="text-xs text-muted-foreground mt-1">Native Celo Escrow</p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Compliance</CardTitle>
                        <Shield className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">100%</div>
                        <p className="text-xs text-muted-foreground mt-1">ZK-OFAC Verified</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Deal Feed */}
                <Card className="lg:col-span-2 glass border-white/5">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Agent Reasoning Loop</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border border-white/5 rounded-lg bg-black/40 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-primary font-mono uppercase">Thought #128</span>
                                <span className="text-muted-foreground">3m ago</span>
                            </div>
                            <p className="text-sm italic text-muted-foreground">
                                "Securing a 10% discount on monthly cloud hosting. Volume commitment strategy drafted via Venice AI."
                            </p>
                            <div className="pt-2 flex gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary border border-primary/30 font-mono">EIP-712 SIGNED</span>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-500 border border-green-500/30 font-mono">VERIFIED</span>
                            </div>
                        </div>

                        <div className="p-4 border border-white/5 rounded-lg bg-black/40 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-primary font-mono uppercase">Registration Event</span>
                                <span className="text-muted-foreground">1h ago</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Agent ID 0 successfully linked to CFO <span className="font-mono text-primary/80">0x2834...50b3</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Center */}
                <Card className="glass border-white/5">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">CFO Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full bg-primary hover:bg-primary/80 text-background font-bold tracking-tight py-6">
                            DEPLOY NEW CONCIERGE
                        </Button>
                        <Button variant="outline" className="w-full glass border-white/10 py-6">
                            UPDATE MANDATE (ZK-PROOF)
                        </Button>
                        <div className="pt-12 text-center">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Celo Mainnet Core V1.0</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
