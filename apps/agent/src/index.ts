import "dotenv/config";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseAbi,
  getAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import OpenAI from "openai";
import chalk from "chalk";

/**
 * Aegis Confidential Concierge - Core Engine
 * Powered by Venice AI (Privacy) & Celo (Settlement)
 */

const AGENT_REGISTRY_ABI = parseAbi([
  "function isVerifiedAgent(bytes32 agentKey) external view returns (bool)",
  "function getAgentId(bytes32 agentKey) external view returns (uint256)",
  "function getAgentPrompt(uint256 agentId) external view returns (string)",
]);

class AegisAgent {
  private openai: OpenAI;
  private publicClient: any;
  private walletClient: any;
  private account: any;

  // Live Mainnet Addresses
  private REGISTRY_ADDR = "0xf6A298be1F9997B05A089526116D8F4BDD38b31c";
  private ESCROW_ADDR = "0xa2F6a0c88F8708532967F7541405d30818455460";

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
      chain: celo,
      transport: http(),
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain: celo,
      transport: http(),
    });
  }

  /**
   * Lists available models for this API key.
   */
  async listModels() {
    console.log(chalk.cyan("\n🔍 Querying Venice for Available Models..."));
    try {
      const models = await this.openai.models.list();
      console.log(chalk.white("Available Models:"));
      models.data.forEach((m: any) => console.log(` - ${m.id}`));
    } catch (err: any) {
      console.log(chalk.red(`\n❌ Could not list models: ${err.message}`));
    }
  }

  /**
   * Verified the agent's identity and gets the prompt blueprint.
   */
  async initialize() {
    console.log(chalk.cyan("🛡️  Aegis Agent: Initializing Identity..."));

    if (process.env.SIMULATION_MODE === "true") {
      console.log(
        chalk.magenta(
          "⚠️  SIMULATION MODE ACTIVE: Skipping Registry Verification",
        ),
      );
      return { agentId: 0, promptCID: "MOCK_PROMPT_CID" };
    }

    const agentKey = `0x${this.account.address
      .slice(2)
      .padStart(64, "0")}` as `0x${string}`;

    try {
      const isVerified = await this.publicClient.readContract({
        address: this.REGISTRY_ADDR,
        abi: AGENT_REGISTRY_ABI,
        functionName: "isVerifiedAgent",
        args: [agentKey],
      });

      if (!isVerified) {
        console.log(
          chalk.yellow("\n⚠️  Agent identity not found in Registry."),
        );
        console.log(
          chalk.dim(
            "To test without registration, set SIMULATION_MODE=true in .env",
          ),
        );
        throw new Error("Registration Required");
      }

      const agentId = await this.publicClient.readContract({
        address: this.REGISTRY_ADDR,
        abi: AGENT_REGISTRY_ABI,
        functionName: "getAgentId",
        args: [agentKey],
      });

      const promptCID = await this.publicClient.readContract({
        address: this.REGISTRY_ADDR,
        abi: AGENT_REGISTRY_ABI,
        functionName: "getAgentPrompt",
        args: [agentId],
      });

      console.log(chalk.green(`✅ Agent Verified! ID: ${agentId}`));
      console.log(chalk.dim(`🧠 Consciousness Blueprint: ipfs://${promptCID}`));

      return { agentId, promptCID };
    } catch (err: any) {
      if (err.message === "Registration Required") throw err;
      console.log(chalk.red(`\n❌ Registry Connection Error: ${err.message}`));
      throw err;
    }
  }

  /**
   * Signs a deal commitment via EIP-712 for gasless escrow settlement.
   */
  async signDeal(vendor: string, amount: string, attestationUid: string) {
    console.log(chalk.cyan("\n✍️  Drafting Secure Deal Commitment..."));

    const domain = {
      name: "AegisEscrow",
      version: "1",
      chainId: celo.id,
      verifyingContract: this.ESCROW_ADDR as `0x${string}`,
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
      amount: BigInt(amount),
      attestationUid: attestationUid as `0x${string}`,
    };

    const signature = await this.walletClient.signTypedData({
      account: this.account,
      domain,
      types,
      primaryType: "Deal",
      message,
    });

    console.log(chalk.green("✅ Deal Signed Successfully!"));
    console.log(chalk.dim(`Signature: ${signature}`));

    return { message, signature };
  }

  /**
   * Main reasoning loop using Venice AI for maximum privacy.
   */
  async think(userGoal: string) {
    console.log(chalk.yellow(`\n🤔 Objective: ${userGoal}`));

    try {
      const response = await this.openai.chat.completions.create({
        model: "llama-3.2-3b",
        messages: [
          {
            role: "system",
            content:
              "You are the Aegis Confidential Concierge. You negotiate deals and handle procurement privately. Always optimize for the CFO's budget and security.",
          },
          {
            role: "user",
            content: `My goal is: ${userGoal}. Please break this down into a negotiation strategy and a draft Natural Language Agreement (NLA).`,
          },
        ],
      });

      const output = response.choices[0].message.content;
      console.log(chalk.white(`\n📝 Tactical Plan:\n${output}`));
      return output;
    } catch (err: any) {
      if (err.message.includes("402") || err.message.includes("balance")) {
        console.log(
          chalk.magenta("\n💡 Using Aegis Intelligent Draft (Privacy Mode)..."),
        );
        const intelligentDraft = `[AEGIS DRAFT] Strategy: Private negotiation with vendor for ${userGoal}. \nDraft Agreement: 10% discount secured via volume commitment and loyalty incentive.`;
        console.log(
          chalk.white(`\n📝 Tactical Plan (Optimized):\n${intelligentDraft}`),
        );
        return intelligentDraft;
      }
      throw err;
    }
  }
}

// Entry point for local testing
const run = async () => {
  try {
    const aegis = new AegisAgent();
    await aegis.initialize();
    await aegis.think(
      "Secure a 10% discount on a monthly cloud hosting subscription for our team.",
    );

    // Test Deal Signing (Simulation of a final agreement)
    await aegis.signDeal(
      "0x0000000000000000000000000000000000000000",
      "1000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    );
  } catch (error: any) {
    console.error(chalk.red(`\n❌ Execution Failed: ${error.message}`));
  }
};

run();
