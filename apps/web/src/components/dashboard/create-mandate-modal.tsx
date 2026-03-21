"use client";

import { useState } from "react";
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, Target, Landmark, ArrowRight } from "lucide-react";

interface CreateMandateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateMandateModal({ open, onOpenChange }: CreateMandateModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        budget: "",
        strategy: "balanced",
        goal: ""
    });

    const isStepValid = () => {
        if (step === 1) return formData.name.length > 0 && formData.budget.length > 0;
        if (step === 2) return formData.goal.length > 10;
        return true;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-xl bg-black/95 border-white/5 backdrop-blur-2xl p-0 flex flex-col overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-50" />
                
                <SheetHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div className="h-px w-8 bg-white/10" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">CFO Protocol</span>
                    </div>
                    <SheetTitle className="text-3xl font-black tracking-tighter text-white">
                        {step === 1 ? "Define New Mandate" : "Set Intelligence Goal"}
                    </SheetTitle>
                    <SheetDescription className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                        Authorized by Celo Mainnet Identity.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-10">
                    {step === 1 ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-primary/80">Mandate Identifier</label>
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-lg font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-white/20"
                                    placeholder="e.g. Q2 Cloud Strategy"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-primary/80">Operational Budget (cUSD)</label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl font-black tracking-tighter focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-white/20"
                                        placeholder="0.00"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">cUSD</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-primary/80">Risk Strategy</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <StrategyOption 
                                        label="Aggressive" 
                                        active={formData.strategy === "aggressive"} 
                                        onClick={() => setFormData({ ...formData, strategy: "aggressive" })}
                                    />
                                    <StrategyOption 
                                        label="Balanced" 
                                        active={formData.strategy === "balanced"} 
                                        onClick={() => setFormData({ ...formData, strategy: "balanced" })}
                                    />
                                    <StrategyOption 
                                        label="Secure" 
                                        active={formData.strategy === "secure"} 
                                        onClick={() => setFormData({ ...formData, strategy: "secure" })}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-primary/80">Agent Objective</label>
                                <textarea 
                                    className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-lg font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-white/20 resize-none"
                                    placeholder="Describe what the agent should achieve with this budget..."
                                    value={formData.goal}
                                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                />
                            </div>

                            <div className="glass-panel p-6 rounded-[2rem] border-primary/20 bg-primary/5">
                                <div className="flex items-start gap-4">
                                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-1" />
                                    <p className="text-xs text-primary/80 leading-relaxed font-medium">
                                        Venice AI will analyze this goal and autonomously negotiate with vendors on your behalf. All deals require your final signature.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <SheetFooter className="p-8 pt-0 border-t border-white/5 bg-black/40">
                    <div className="w-full flex items-center justify-between gap-4">
                        {step === 2 && (
                            <Button 
                                variant="ghost" 
                                className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </Button>
                        )}
                        <Button 
                            className="flex-1 h-14 bg-primary hover:bg-primary/90 text-background font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 disabled:opacity-30 transition-all active:scale-[0.98]"
                            disabled={!isStepValid()}
                            onClick={() => {
                                if (step === 1) setStep(2);
                                else {
                                    // Submit Mandate logic
                                    console.log("Submitting mandate", formData);
                                    onOpenChange(false);
                                }
                            }}
                        >
                            {step === 1 ? "Next Analysis" : "Authorize Mandate"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

function StrategyOption({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <div 
            className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                active 
                ? 'bg-primary/10 border-primary shadow-inner shadow-primary/10 text-primary' 
                : 'bg-white/5 border-white/5 text-muted-foreground hover:border-white/20'
            }`}
            onClick={onClick}
        >
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    );
}
