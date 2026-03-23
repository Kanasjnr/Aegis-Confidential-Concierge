/**
 * Locus Service - Agent Payment & Discovery Infrastructure
 * Base URL: https://beta-api.paywithlocus.com
 */

const BASE_URL = "https://beta-api.paywithlocus.com";

export class LocusService {
    private static instance: LocusService;
    private apiKey: string | null = null;

    constructor(apiKey?: string) {
        if (apiKey) this.apiKey = apiKey;
        else if (process.env.LOCUS_API_KEY) {
            this.apiKey = process.env.LOCUS_API_KEY;
        }
    }

    static getInstance(apiKey?: string): LocusService {
        if (!LocusService.instance) {
            LocusService.instance = new LocusService(apiKey);
        }
        return LocusService.instance;
    }

    setApiKey(key: string) {
        this.apiKey = key;
    }

    async registerAgent(name: string, email: string) {
        const response = await fetch(`${BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });
        
        if (!response.ok) throw new Error(`Locus Registration Failed: ${response.statusText}`);
        return await response.json() as any;
    }

    async getBalance() {
        if (!this.apiKey) throw new Error("Locus API Key not set");
        const response = await fetch(`${BASE_URL}/api/pay/balance`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${this.apiKey}` }
        });
        return await response.json();
    }

    async callWrappedApi(provider: string, endpoint: string, data: any) {
        if (!this.apiKey) throw new Error("Locus API Key not set");
        const response = await fetch(`${BASE_URL}/api/wrapped/${provider}/${endpoint}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(`Locus API Error (${provider}): ${(err as any).message || response.statusText}`);
        }
        return await response.json();
    }

    async requestCredits(email: string, reason: string, amountUsdc: number = 5) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
        
        const response = await fetch(`${BASE_URL}/api/gift-code-requests`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ email, reason, requestedAmountUsdc: amountUsdc })
        });
        
        if (!response.ok) throw new Error(`Locus Credit Request Failed: ${response.statusText}`);
        return await response.json();
    }

    async createCheckout(amount: number, currency: string = "USDC", description: string = "Aegis Service Settlement") {
        if (!this.apiKey) throw new Error("Locus API Key not set");
        const response = await fetch(`${BASE_URL}/api/pay/checkout`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({ amount, currency, description })
        });
        
        if (!response.ok) throw new Error(`Locus Checkout Failed: ${response.statusText}`);
        return await response.json();
    }

    async postIntent(attestationId: string, intent: string) {
        if (!this.apiKey) throw new Error("Locus API Key not set");
        // Log the intent to the Locus audit trail (using the metadata/intent pattern)
        const response = await fetch(`${BASE_URL}/api/audit/intent`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({ 
                externalId: attestationId, 
                intent,
                timestamp: new Date().toISOString()
            })
        });
        return response.ok;
    }

    async discoverVendor(query: string) {
        console.log(`[Locus] Executing discovery for: "${query}"`);
        return await this.callWrappedApi("exa", "search", {
            query,
            useAutoprompt: true,
            numResults: 5
        });
    }
}

export const locusService = LocusService.getInstance();
