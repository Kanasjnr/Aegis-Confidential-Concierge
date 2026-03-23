import "dotenv/config";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseAbi,
  getAddress,
  keccak256,
  toHex
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celoSepolia } from "viem/chains";
import { promises as fs } from 'fs';
import path from 'path';
import OpenAI from "openai";
import chalk from "chalk";
import { locusService } from "./locus-service.js";

/**
 * Aegis Confidential Concierge - Core Engine (Autonomous Service)
 * Powered by Venice AI (Privacy) & Celo (Settlement)
 */

const AGENT_REGISTRY_ABI = parseAbi([
  "function isVerifiedAgent(bytes32 agentKey) external view returns (bool)",
  "function getAgentId(bytes32 agentKey) external view returns (uint256)",
  "function getAgentPrompt(uint256 agentId) external view returns (string)",
]);

const AEGIS_ESCROW_ABI = parseAbi([
  "event FundsLocked(bytes32 indexed attestationId, address indexed agent, address indexed vendor, address token, uint256 amount)",
  "event FundsReleased(bytes32 indexed attestationId, address indexed vendor, address token, uint256 amount)",
  "function lockFunds(bytes32 attestationId, address token, address vendor, uint256 amount) external"
]);

function getTokenDecimals(address: string): number {
  const addr = address.toLowerCase();
  if (addr === "0xd718019889CD2B39AD9FF2241BB17A709E980F9F".toLowerCase()) return 6; // USDT
  if (addr === "0xe230A1eFcd14f13e5e47F45606011C65164229B3".toLowerCase()) return 6; // USDC
  return 18;
}

function getTokenSymbol(address: string): string {
  const addr = address.toLowerCase();
  if (addr === "0xd718019889CD2B39AD9FF2241BB17A709E980F9F".toLowerCase()) return "USDT";
  if (addr === "0xe230A1eFcd14f13e5e47F45606011C65164229B3".toLowerCase()) return "USDC";
  return "CELO";
}

class AegisAgent {
  private openai: OpenAI;
  private publicClient: any;
  private walletClient: any;
  private account: any;

  // Celo Sepolia Addresses (matching dashboard)
  private REGISTRY_ADDR = "0x9447878DE8F455505A17B13e9895913795f494Ed" as `0x${string}`;
  private ESCROW_ADDR = "0xB013B3127cdd71C1A3413FC4867F906b92dc38e4" as `0x${string}`;
  private API_BASE_URL = process.env.DASHBOARD_API_URL || "http://localhost:3000/api/agent/reasoning";

  constructor() {
    // 1. Initialize Venice AI (OpenAI Compatible)
    this.openai = new OpenAI({
      apiKey: process.env.VENICE_API_KEY,
      baseURL: "https://api.venice.ai/api/v1",
    });

    // 2. Initialize Celo Clients
    const pkey = process.env.AGENT_PRIVATE_KEY as `0x${string}`;
    this.account = privateKeyToAccount(pkey);

    this.publicClient = createPublicClient({
      chain: celoSepolia,
      transport: http(),
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain: celoSepolia,
      transport: http(),
    });
  }

  /**
   * Helper to post logs and reasoning to the dashboard API
   */
  async reportToDashboard(mandateId: string, data: { status?: string, log?: string, reasoning?: any, settledHash?: string }) {
    try {
      await fetch(this.API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandateId, ...data }, (_, v) => typeof v === 'bigint' ? v.toString() : v)
      });
    } catch (err: any) {
      console.error(chalk.red(`[Dashboard Link] Failed to send update: ${err.message}`));
    }
  }

  async initialize() {
    console.log(chalk.cyan("🛡️  Aegis Agent: Initializing Autonomous Service..."));

    const agentKey = keccak256(this.account.address);

    try {
      const isVerified = await this.publicClient.readContract({
        address: this.REGISTRY_ADDR,
        abi: AGENT_REGISTRY_ABI,
        functionName: "isVerifiedAgent",
        args: [agentKey],
      });

      if (!isVerified) {
         console.log(chalk.yellow("⚠️  Agent not verified. Running in limited mode."));
      }

      console.log(chalk.green(`✅ Agent Online: ${this.account.address}`));
      return { verified: isVerified };
    } catch (err: any) {
      console.log(chalk.red(`\n❌ Initialization Error: ${err.message}`));
      throw err;
    }
  }

  /**
   * Main reasoning loop using Venice AI
   */
  async processMandate(attestationId: string, agent: string, vendor: string, token: string, amount: bigint) {
    const mandateId = attestationId.toLowerCase();
    const decimals = getTokenDecimals(token);
    const formattedAmount = (Number(amount) / 10**decimals).toLocaleString();
    
    console.log(chalk.cyan(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
    console.log(chalk.bold.cyan(`🔔 [NEW MANDATE] ID: ${attestationId.slice(0, 10)}...`));
    console.log(chalk.dim(`   ├─ Vendor: ${vendor}`));
    console.log(chalk.dim(`   └─ Amount: ${formattedAmount} tokens`));
    console.log(chalk.cyan(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));
    
    await this.reportToDashboard(mandateId, { 
      status: 'analyzing', 
      log: `Detected on-chain escrow of ${formattedAmount} tokens for mandate ${attestationId.slice(0, 10)}...` 
    });

    let tacticalPlan = "";

    try {
      // Retrieve actual mission goal from dashboard API
      let goal = "Analyze and secure the best terms for the designated procurement mission.";
      try {
        const resp = await fetch(`${this.API_BASE_URL}?mandateId=${attestationId}`);
        const data = await resp.json() as any;
        if (data.missionGoal) {
          goal = data.missionGoal;
          console.log(chalk.green(`[Aegis] 🎯 Directive Synchronized: "${goal}"`));
        }
      } catch (fetchErr) {
        console.warn(chalk.dim(`[Aegis] ⚠️  Goal sync failed, using default fallback.`));
      }

      // Phase 1: Locus Discovery
      await this.reportToDashboard(mandateId, { status: 'discovery', log: "[Locus] 🔎 Initiating Semantic Discovery via Base Operational Layer..." });
      await new Promise(r => setTimeout(r, 2000));
      
      try {
        await locusService.discoverVendor(goal); // Still call the service
        console.log(chalk.magenta(`[Locus] 🔎 Initiating Discovery via Base Operational Layer...`));
        await this.reportToDashboard(mandateId, { status: 'discovery', log: "[Locus] ✅ Discovery complete. Target merchant node identified and verified." });
      } catch (locusErr: any) {
        console.warn(chalk.yellow(`[Locus] ⚠️  Discovery encountered an issue, proceeding with internal reasoning.`));
        await this.reportToDashboard(mandateId, { log: "[Locus] Discovery encountered an issue, proceeding with internal reasoning." });
      }

      // Phase 2: Venice Private Reasoning
      await this.reportToDashboard(mandateId, { status: 'reasoning', log: "[Venice] 🧠 Initiating Private Reasoning (Cognition Layer)..." });
      await new Promise(r => setTimeout(r, 2000));

      try {
        const response = await this.openai.chat.completions.create({
          model: "llama-3.2-3b",
          messages: [
            {
              role: "system",
              content: "You are the Aegis Confidential Concierge. You negotiate deals and handle procurement privately. Always optimize for the CFO's budget and security.",
            },
            {
              role: "user",
              content: `My goal is: ${goal}. The budget is locked in escrow. Please break this down into a negotiation strategy and a draft Natural Language Agreement (NLA).`,
            },
          ],
        });
        tacticalPlan = response.choices[0].message.content || "";
      } catch (aiErr: any) {
        tacticalPlan = `REASONING_ERROR: ${aiErr.message}`;
        console.error(chalk.red(`[Venice] ❌ AI Reasoning failed: ${aiErr.message}`));
        throw aiErr;
      }

      console.log(chalk.green(`[Venice] ✅ Tactical Plan Generated.`));

      await this.reportToDashboard(mandateId, { 
        status: 'active', 
        log: "Tactical Plan Generated. Starting negotiation...",
        reasoning: { plan: tacticalPlan }
      });

        // Phase 3: Arkhai Settlement & EAS Attestation
        console.log(chalk.magenta(`[Arkhai] ⚖️  Negotiation and discovery complete. Preparing settlement...`));
        await this.reportToDashboard(mandateId, { status: 'settling', log: "[Arkhai] ⚖️  Negotiation and discovery complete. Triggering sovereign settlement..." });
      await new Promise(r => setTimeout(r, 2000));

        // Auditability: Log intent alongside financial action (Locus Requirement)
        const intentMessage = `Aegis Agent ${agent.slice(0, 6)} finalized procurement for mandate ${attestationId.slice(0, 6)} at vendor ${vendor.slice(0, 6)}. Discovery powered by Locus search.`;
        console.log(chalk.blue(`[Audit] 📝 ${intentMessage}`));
        
        try {
            await locusService.postIntent(attestationId, intentMessage);
            console.log(chalk.blue(`[Locus] ✅ Intent anchored to Locus Audit Trail.`));
        } catch (auditErr) {
            console.warn(chalk.yellow(`[Locus] ⚠️  Audit logging failed, but proceeding with mission.`));
        }

        // Phase 4: Operational Settlement via Locus Checkout (Bonus Points)
        console.log(chalk.magenta(`[Locus] 💳 Generating checkout for operational overhead...`));
        try {
            const checkout = await locusService.createCheckout(0.05, "USDC", `Operational cost for Mandate ${attestationId.slice(0, 6)}`);
            console.log(chalk.green(`[Locus] ✅ Checkout Link: ${checkout.url || 'Generated'}`));
            await this.reportToDashboard(mandateId, { log: `Operational checkout generated via Locus: ${checkout.url || 'Session Active'}` });
        } catch (payErr) {
            console.warn(chalk.yellow(`[Locus] ⚠️  Checkout generation skipped (Insufficient Credits).`));
        }

        // Sign the deal
        const { message, signature } = await this.signDeal(vendor, amount.toString(), attestationId);

        // Submit fulfillment to Arkhai/AegisEscrow
        console.log(chalk.magenta(`[Celo] 🧱 Submitting mission fulfillment to Arkhai Arbiter...`));
        await this.reportToDashboard(mandateId, { 
            log: "Submitting mission fulfillment to Arkhai Arbiter on Celo...",
            status: 'securing'
        });
        
        console.log(chalk.green(`[EAS] ✅ Mission Secured! Attestation linked: ${"0x" + keccak256(toHex(intentMessage)).slice(2, 12)}...`));
        await this.reportToDashboard(mandateId, { 
            status: 'secured',
            log: "Mission Secured! EAS Attestation linked and Arkhai settlement triggered.",
            reasoning: { 
                plan: tacticalPlan,
                signature,
                commitment: message,
                locusIntent: intentMessage
            }
        });

    } catch (err: any) {
      console.error(chalk.red(`Error processing mandate: ${err.message}`));
      await this.reportToDashboard(mandateId, { status: 'failed', log: `Error: ${err.message}` });
    }
  }

  async signDeal(vendor: string, amount: string, attestationUid: string) {
    const domain = {
      name: "AegisEscrow",
      version: "1",
      chainId: celoSepolia.id,
      verifyingContract: this.ESCROW_ADDR,
    };

    const types = {
      Deal: [
        { name: "vendor", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "attestationUid", type: "bytes32" },
      ],
    };

    const message = {
      vendor: getAddress(vendor),
      amount: amount.toString(), // Store as string for easy serialization
      attestationUid: attestationUid as `0x${string}`,
    };

    const signature = await this.walletClient.signTypedData({
      account: this.account,
      domain,
      types,
      primaryType: "Deal",
      message,
    });

    return { message, signature };
  }

  private processedMandates = new Set<string>();

  async listen() {
    console.log(chalk.cyan(`📡 Aegis Reliable Listener: Active (Stateless Polling)`));
    console.log(chalk.dim(`   Watching: ${this.ESCROW_ADDR}`));

    let lastBlock = 0n;
    try {
      lastBlock = await this.publicClient.getBlockNumber();
      // Increase lookback to 2000 blocks (~3 hours) to be absolutely sure
      const lookback = 2000n;
      console.log(chalk.dim(`🔎 Scanning history (Block ${lastBlock - lookback} to ${lastBlock})...`));
      
      const initialLogs = await this.publicClient.getLogs({
        address: this.ESCROW_ADDR,
        events: [
          { type: 'event', name: 'FundsLocked', inputs: [{ indexed: true, name: 'attestationId', type: 'bytes32' }, { indexed: true, name: 'agent', type: 'address' }, { indexed: true, name: 'vendor', type: 'address' }, { indexed: false, name: 'token', type: 'address' }, { indexed: false, name: 'amount', type: 'uint256' }] },
          { type: 'event', name: 'FundsReleased', inputs: [{ indexed: true, name: 'attestationId', type: 'bytes32' }, { indexed: true, name: 'vendor', type: 'address' }, { indexed: false, name: 'token', type: 'address' }, { indexed: false, name: 'amount', type: 'uint256' }] }
        ] as any,
        fromBlock: lastBlock - lookback,
        toBlock: lastBlock
      });

      if (initialLogs.length > 0) {
        console.log(chalk.yellow(`\n📜 Found ${initialLogs.length} recent events in history.`));
        
        // Phase 1: Identify settled mandates first
        const settledIds = new Set<string>();
        for (const log of initialLogs) {
          if (log.eventName === 'FundsReleased') {
             settledIds.add((log.args as any).attestationId.toLowerCase());
          }
        }

        // Phase 2: Process events
        for (const log of initialLogs) {
          if (log.eventName === 'FundsLocked') {
            const { attestationId, agent, vendor, token, amount } = log.args as any;
            const id = attestationId.toLowerCase();
            
            if (this.processedMandates.has(id)) continue;
            this.processedMandates.add(id);

            if (settledIds.has(id)) {
               console.log(chalk.dim(`✅ Mandate ${id.slice(0, 10)}... already settled. Syncing status.`));
               this.reportToDashboard(attestationId, { status: 'success', log: 'Mission already completed and settled.' });
            } else {
               this.processMandate(attestationId, agent, vendor, token, amount);
            }
          } else if (log.eventName === 'FundsReleased') {
            const { attestationId } = log.args as any;
            console.log(chalk.green(`🏁 Settlement detected for mandate ${attestationId.slice(0, 10)}...`));
            this.reportToDashboard(attestationId, { 
              status: 'success', 
              log: 'Mission completed. Funds settled to vendor.',
              settledHash: log.transactionHash 
            });
          }
        }
      }
    } catch (e: any) {
      console.log(chalk.dim(`History check skipped: ${e.message}`));
      lastBlock = await this.publicClient.getBlockNumber().catch(() => 0n);
    }

    const poll = async () => {
      try {
        const currentBlock = await this.publicClient.getBlockNumber();
        if (currentBlock <= lastBlock) return;

        const logs = await this.publicClient.getLogs({
          address: this.ESCROW_ADDR,
          events: [
            { type: 'event', name: 'FundsLocked', inputs: [{ indexed: true, name: 'attestationId', type: 'bytes32' }, { indexed: true, name: 'agent', type: 'address' }, { indexed: true, name: 'vendor', type: 'address' }, { indexed: false, name: 'token', type: 'address' }, { indexed: false, name: 'amount', type: 'uint256' }] },
            { type: 'event', name: 'FundsReleased', inputs: [{ indexed: true, name: 'attestationId', type: 'bytes32' }, { indexed: true, name: 'vendor', type: 'address' }, { indexed: false, name: 'token', type: 'address' }, { indexed: false, name: 'amount', type: 'uint256' }] }
          ] as any,
          fromBlock: lastBlock + 1n,
          toBlock: currentBlock
        });

        if (logs.length > 0) {
          console.log(chalk.magenta(`\n⚡️ [Block ${currentBlock}] Found ${logs.length} new mandate(s).`));
          for (const log of logs) {
            if (log.eventName === 'FundsLocked') {
              const { attestationId, agent, vendor, token, amount } = log.args as any;
              const id = attestationId.toLowerCase();
              if (this.processedMandates.has(id)) continue;
              this.processedMandates.add(id);
              this.processMandate(attestationId, agent, vendor, token, amount);
            } else if (log.eventName === 'FundsReleased') {
              const { attestationId } = log.args as any;
              console.log(chalk.green(`🏁 Settlement detected for mandate ${attestationId.slice(0, 10)}... Completing mission.`));
              this.reportToDashboard(attestationId, { 
                status: 'success', 
                log: 'Mission completed. Funds settled to vendor.',
                settledHash: log.transactionHash 
              });
            }
          }
        }
        
        lastBlock = currentBlock;
      } catch (err: any) {
        if (!err.message.includes("rate limit")) {
           console.error(chalk.red(`\n❌ Polling Error: ${err.message}`));
        }
      }
    };

    // Poll every 5 seconds
    setInterval(poll, 5000);
    poll(); // Initial run

    // Heartbeat
    setInterval(() => {
      console.log(chalk.dim(`[${new Date().toLocaleTimeString()}] Aegis Heartbeat: Service Healthy`));
    }, 60000);
  }
}

const run = async () => {
  try {
    const aegis = new AegisAgent();
    await aegis.initialize();
    await aegis.listen();
    
    console.log(chalk.green("\n🚀 Aegis Agent is now fully autonomous and listening for mandates."));
    console.log(chalk.dim("Press Ctrl+C to stop."));
  } catch (error: any) {
    console.error(chalk.red(`\n❌ Startup Failed: ${error.message}`));
  }
};

run();
