import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background px-8">
      <div className="max-w-4xl w-full space-y-24 text-center lg:text-left">
        
        {/* Institutional Branding */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 opacity-60">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Celo Network Architecture</span>
            <div className="h-[0.5px] w-12 bg-border" />
          </div>
          <h1 className="text-wealth font-light tracking-tighter sm:text-7xl lg:text-8xl">
            The Intelligent Ledger<span className="text-primary/50">.</span>
          </h1>
        </div>

        {/* Value Proposition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <p className="text-xl font-light text-muted-foreground leading-relaxed lg:max-w-md">
            Decentralized portfolio management for institutional CFOs. Guided by autonomous agents. Secured by ZK-Identity.
          </p>
          
          <div className="flex flex-col gap-4 items-center lg:items-end">
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="w-full lg:w-64 h-14 border-border hover:bg-white/5 transition-all text-label"
              >
                Access Dashboard
              </Button>
            </Link>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              Secured Session Required
            </p>
          </div>
        </div>

        {/* Minimalist Grid Footer */}
        <div className="pt-24 border-t border-border flex flex-col md:flex-row justify-between gap-8 opacity-40">
           <div className="flex flex-col gap-1">
              <span className="text-label">Architecture</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Self Protocol ZK-Hook</span>
           </div>
           <div className="flex flex-col gap-1 text-right md:text-left">
              <span className="text-label">Settlement</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Arkhai NLA Integration</span>
           </div>
           <div className="flex flex-col gap-1 text-right">
              <span className="text-label">Identity</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">EAS Attestations</span>
           </div>
        </div>
      </div>
    </main>
  );
}
