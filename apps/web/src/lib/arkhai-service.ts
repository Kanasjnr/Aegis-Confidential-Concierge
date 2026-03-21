import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  parseAbiParameters, 
  encodeAbiParameters, 
  keccak256, 
  toHex,
  parseEventLogs
} from 'viem';
import { celoSepolia } from 'viem/chains';
import { 
  ARKHAI_TRUSTED_ORACLE_ARBITER, 
  ARKHAI_ERC20_ESCROW_OBLIGATION,
} from './contracts';

// NLA Demand structure: (string arbitrationProvider, string arbitrationModel, string arbitrationPrompt, string demand)
const NLA_DEMAND_ABI = parseAbiParameters('string arbitrationProvider, string arbitrationModel, string arbitrationPrompt, string demand');

// Minimal ABIs for interaction
const ERC20_ESCROW_ABI = [
  {
    name: 'buy',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'arbiter', type: 'address' },
      { name: 'demand', type: 'bytes' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: 'escrowId', type: 'uint256' }]
  },
  {
    name: 'fulfill',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'escrowId', type: 'uint256' },
      { name: 'fulfillment', type: 'bytes32' }
    ],
    outputs: []
  },
  {
    name: 'settle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'escrowId', type: 'uint256' }],
    outputs: []
  }
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
      'OpenAI',
      'gpt-4o',
      `You are an impartial arbitrator for the Aegis Confidential Concierge. 
      The goal of this mission was: {{demand}}.
      The agent has provided the following proof of completion: {{obligation}}.
      
      Determine if the proof of completion satisfies the mission goal.
      Answer ONLY 'true' or 'false'.`,
      missionGoal
    ]);
  }

  async createMissionEscrow(
    walletClient: any, 
    missionGoal: string, 
    tokenAddress: `0x${string}`, 
    amount: bigint
  ) {
    const encodedNLADemand = this.encodeNLADemand(missionGoal);

    // Wrap for Trusted Oracle Arbiter: (address oracle, bytes data)
    const encodedOracleDemand = encodeAbiParameters(
      parseAbiParameters('address oracle, bytes data'),
      [walletClient.account.address, encodedNLADemand]
    );

    // Call 'buy' on the Escrow Obligation contract
    // Note: User must have approved the token first
    const hash = await walletClient.writeContract({
      address: ARKHAI_ERC20_ESCROW_OBLIGATION,
      abi: ERC20_ESCROW_ABI,
      functionName: 'buy',
      args: [ARKHAI_TRUSTED_ORACLE_ARBITER, encodedOracleDemand, tokenAddress, amount]
    });

    return { hash, arbiter: ARKHAI_TRUSTED_ORACLE_ARBITER };
  }

  async submitMissionFulfillment(
    walletClient: any,
    escrowId: bigint,
    fulfillmentText: string
  ) {
    // Arkhai uses keccak256 hash of the fulfillment text as the on-chain proof
    const fulfillmentHash = keccak256(toHex(fulfillmentText));

    const hash = await walletClient.writeContract({
      address: ARKHAI_ERC20_ESCROW_OBLIGATION,
      abi: ERC20_ESCROW_ABI,
      functionName: 'fulfill',
      args: [escrowId, fulfillmentHash]
    });

    return hash;
  }

  async claimSettlement(walletClient: any, escrowId: bigint) {
    const hash = await walletClient.writeContract({
      address: ARKHAI_ERC20_ESCROW_OBLIGATION,
      abi: ERC20_ESCROW_ABI,
      functionName: 'settle',
      args: [escrowId]
    });

    return hash;
  }

  /**
   * Helper to parse the Buy event and return the escrowId
   */
  async getEscrowIdFromLogs(publicClient: any, txHash: `0x${string}`) {
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    const logs = parseEventLogs({
      abi: ERC20_ESCROW_ABI,
      logs: receipt.logs,
      eventName: 'Buy'
    });
    
    // @ts-ignore
    return logs[0]?.args?.escrowId as bigint | undefined;
  }
}

export const arkhaiService = ArkhaiService.getInstance();
