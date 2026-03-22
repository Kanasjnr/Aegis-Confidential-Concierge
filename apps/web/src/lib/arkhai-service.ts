import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbiParameters,
  encodeAbiParameters,
  keccak256,
  toHex,
  parseEventLogs,
} from "viem";
import { celoSepolia } from "viem/chains";
import {
  ARKHAI_TRUSTED_ORACLE_ARBITER,
  ARKHAI_ERC20_ESCROW_OBLIGATION,
  ERC20Abi,
} from "./contracts";

// NLA Demand structure: (string arbitrationProvider, string arbitrationModel, string arbitrationPrompt, string demand)
const NLA_DEMAND_ABI = parseAbiParameters(
  "string arbitrationProvider, string arbitrationModel, string arbitrationPrompt, string demand",
);

// Minimal ABIs for interaction
const ERC20_ESCROW_ABI = [
  {
    name: "buy",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "arbiter", type: "address" },
      { name: "demand", type: "bytes" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "escrowId", type: "uint256" }],
  },
  {
    name: "fulfill",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "escrowId", type: "uint256" },
      { name: "fulfillment", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    name: "settle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "escrowId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "Buy",
    type: "event",
    inputs: [
      { indexed: true, name: "escrowId", type: "uint256" },
      { indexed: true, name: "buyer", type: "address" },
      { indexed: false, name: "arbiter", type: "address" },
      { indexed: false, name: "token", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
  {
    name: "Fulfill",
    type: "event",
    inputs: [
      { indexed: true, name: "escrowId", type: "uint256" },
      { indexed: false, name: "fulfillment", type: "bytes32" },
    ],
  },
] as const;

export class ArkhaiService {
  private static instance: ArkhaiService;

  private constructor() {}

  static getInstance(): ArkhaiService {
    if (!ArkhaiService.instance) {
      ArkhaiService.instance = new ArkhaiService();
    }
    return ArkhaiService.instance;
  }

  encodeNLADemand(missionGoal: string) {
    return encodeAbiParameters(NLA_DEMAND_ABI, [
      "OpenAI",
      "gpt-4o",
      "Determine if the proof of completion satisfies the mission goal: {{demand}}. Proof: {{obligation}}. Answer ONLY true or false.",
      missionGoal,
    ]);
  }

  async createMissionEscrow(
    walletClient: any,
    missionGoal: string,
    tokenAddress: `0x${string}`,
    amount: bigint,
    vendorAddress?: `0x${string}`,
    delegation?: any
  ) {
    // We'll use AegisEscrow as the primary method for the demo
    // since Arkhai staging has persistent revert issues on Celo Sepolia
    return this.createAegisMissionEscrow(
      walletClient,
      missionGoal,
      tokenAddress,
      amount,
      vendorAddress,
      delegation
    );
  }

  async createAegisMissionEscrow(
    walletClient: any,
    missionGoal: string,
    tokenAddress: `0x${string}`,
    amount: bigint,
    vendorAddress?: `0x${string}`,
    delegation?: any
  ) {
    const { AEGIS_ESCROW_ADDRESS, AegisEscrowAbi } = await import(
      "./contracts"
    );

    // Generate a unique attestationId from the mission goal and timestamp
    const attestationId = keccak256(toHex(missionGoal + Date.now().toString()));

    const finalVendor =
      vendorAddress ||
      ("0x817c19bD1Ba4eD47e180a3219d12d1462C8fABDC" as `0x${string}`);

    // Store the goal in localStorage associated with the attestationId so the dashboard can show it
    try {
      localStorage.setItem(
        `aegis_mandate_${attestationId.toLowerCase()}`,
        JSON.stringify({
          goal: missionGoal,
          delegation: vendorAddress ? delegation : null, // Store delegation context
          timestamp: Date.now()
        })
      );
    } catch (e) {
      console.warn("Failed to save mandate to localStorage:", e);
    }

    console.log("AegisEscrow: Initiating lockFunds transaction...", {
      address: AEGIS_ESCROW_ADDRESS,
      attestationId,
      tokenAddress,
      vendor: finalVendor,
      amount: amount.toString()
    });

    const hash = await walletClient.writeContract({
      address: AEGIS_ESCROW_ADDRESS,
      abi: AegisEscrowAbi,
      functionName: "lockFunds",
      args: [attestationId, tokenAddress, finalVendor, amount],
    });

    console.log("AegisEscrow: lockFunds transaction sent", hash);

    return { hash, type: "aegis", attestationId };
  }

  async submitMissionFulfillment(
    walletClient: any,
    escrowId: bigint,
    fulfillmentText: string,
  ) {
    // Arkhai uses keccak256 hash of the fulfillment text as the on-chain proof
    const fulfillmentHash = keccak256(toHex(fulfillmentText));

    const hash = await walletClient.writeContract({
      address: ARKHAI_ERC20_ESCROW_OBLIGATION,
      abi: ERC20_ESCROW_ABI,
      functionName: "fulfill",
      args: [escrowId, fulfillmentHash],
    });

    return hash;
  }

  async claimSettlement(walletClient: any, escrowId: bigint) {
    const hash = await walletClient.writeContract({
      address: ARKHAI_ERC20_ESCROW_OBLIGATION,
      abi: ERC20_ESCROW_ABI,
      functionName: "settle",
      args: [escrowId],
    });

    return hash;
  }

  async releaseAegisFunds(walletClient: any, attestationId: `0x${string}`) {
    const { AEGIS_ESCROW_ADDRESS, AegisEscrowAbi } = await import("./contracts");
    
    const hash = await walletClient.writeContract({
      address: AEGIS_ESCROW_ADDRESS,
      abi: AegisEscrowAbi,
      functionName: "releaseFunds",
      args: [attestationId],
    });

    return hash;
  }

  /**
   * Helper to parse the Buy event and return the escrowId
   */
  async getEscrowIdFromLogs(publicClient: any, txHash: `0x${string}`) {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    const logs = parseEventLogs({
      abi: ERC20_ESCROW_ABI,
      logs: receipt.logs,
      eventName: "Buy",
    });

    return logs[0]?.args?.escrowId as bigint | undefined;
  }

  /**
   * Watches for the Fulfill event for a specific escrowId
   */
  watchFulfillment(
    publicClient: any,
    escrowId: bigint,
    onFulfill: (fulfillment: `0x${string}`) => void,
  ) {
    return publicClient.watchEvent({
      address: ARKHAI_ERC20_ESCROW_OBLIGATION,
      abi: ERC20_ESCROW_ABI,
      eventName: "Fulfill",
      args: { escrowId },
      onLogs: (logs: any) => {
        const fulfillment = logs[0]?.args?.fulfillment;
        if (fulfillment) {
          onFulfill(fulfillment);
        }
      },
    });
  }

  /**
   * Checks if the user has enough allowance for the Arkhai Escrow contract
   * and triggers an approval transaction if necessary.
   */
  async checkAndApproveToken(
    publicClient: any,
    walletClient: any,
    tokenAddress: `0x${string}`,
    spender: `0x${string}`,
    amount: bigint,
  ) {
    const account = walletClient.account.address;

    // Check current allowance
    const allowance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20Abi,
      functionName: "allowance",
      args: [account, spender],
    });

    if (allowance < amount) {
      console.log(`Insufficient allowance. Requesting approval for ${amount}...`);
      const hash = await walletClient.writeContract({
        account,
        address: tokenAddress,
        abi: ERC20Abi,
        functionName: "approve",
        args: [spender, amount],
      });

      console.log(`Approval transaction sent: ${hash}. Waiting for receipt...`);
      // Wait for approval transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash });
      console.log("Approval successful");
      return true;
    }

    return false;
  }
}

export const arkhaiService = ArkhaiService.getInstance();
