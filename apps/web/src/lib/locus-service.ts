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
        // In the agent core, we'll use an environment variable
        else if (typeof process !== 'undefined' && process.env.LOCUS_API_KEY) {
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

    /**
     * Step 1: Register your agent
     */
    async registerAgent(name: string, email: string) {
        const response = await fetch(`${BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });
        
        if (!response.ok) throw new Error(`Locus Registration Failed: ${response.statusText}`);
        return await response.json(); // { apiKey, ownerPrivateKey, walletAddress }
    }

    /**
     * Check wallet balance (USDC on Base)
     */
    async getBalance() {
        if (!this.apiKey) throw new Error("Locus API Key not set");
        const response = await fetch(`${BASE_URL}/api/pay/balance`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${this.apiKey}` }
        });
        return await response.json();
    }

    /**
     * Call Wrapped APIs (Discovery / Search)
     * e.g. provider="firecrawl", endpoint="scrape"
     */
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
            throw new Error(`Locus API Error (${provider}): ${err.message || response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Perform deep discovery via Locus-wrapped Firecrawl/Exa
     */
    async discoverVendor(query: string) {
        // This is a higher-level abstraction for the agent
        console.log(`[Locus] Executing discovery for: "${query}"`);
        
        // Example: Using Exa for specialized search
        return await this.callWrappedApi("exa", "search", {
            query,
            useAutoprompt: true,
            numResults: 5
        });
    }
}

export const locusService = LocusService.getInstance();
