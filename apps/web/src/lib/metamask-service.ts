import { createWalletClient, custom, createPublicClient, http, stringToHex, getAddress } from "viem";
import { celoSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { 
  toMetaMaskSmartAccount, 
  Implementation,
  getSmartAccountsEnvironment
} from "@metamask/smart-accounts-kit";
import { 
  erc7715ProviderActions
} from "@metamask/smart-accounts-kit/actions";

// The chain we are working on
const chain = celoSepolia;

/**
 * Get a Wallet Client extended with MetaMask ERC-7715 actions
 */
export const getMetaMaskClient = () => {
  if (typeof window === "undefined" || !window.ethereum) return null;
  
  return createWalletClient({
    chain,
    transport: custom(window.ethereum),
  }).extend(erc7715ProviderActions());
};

/**
 * Get a Public Client for chain state queries
 */
export const getPublicClient = () => {
  return createPublicClient({
    chain,
    transport: http(),
  });
};

/**
 * Setup a session account for the Aegis Agent.
 * This account will be granted permissions to act on the CFO's behalf.
 */
export const setupAegisSessionAccount = async (agentPrivateKey: `0x${string}`) => {
  const publicClient = getPublicClient();
  const account = privateKeyToAccount(agentPrivateKey);

  try {
    return await toMetaMaskSmartAccount({
      client: publicClient as any,
      implementation: Implementation.Hybrid,
      deployParams: [account.address, [], [], []],
      deploySalt: "0x",
      signer: { account },
    });
  } catch (err: any) {
    if (err.message.includes("No contracts found") || err.message.includes("chain")) {
      console.warn(`[MetaMask] Smart Account SDK does not support chain ${chain.id} yet. Falling back to session-key mode.`);
      // Return a compatible minimal account object for 7715 requests
      return {
        address: account.address,
        publicKey: account.address, // Placeholder
        type: 'local',
        source: 'local',
        client: publicClient,
        signMessage: ({ message }: { message: any }) => account.signMessage({ message }),
        signTypedData: (params: any) => account.signTypedData(params),
      } as any;
    }
    throw err;
  }
};

/**
 * Request Advanced Permissions for a specific mandate.
 * Uses requestExecutionPermissions as documented in Step 5 of the guide.
 */
export const requestMandatePermissions = async (
  userAddress: string,
  sessionAccountAddress: string,
  amount: string,
  justification: string = "Budget delegation for Aegis Mission"
) => {
  const walletClient = getMetaMaskClient();
  if (!walletClient) throw new Error("MetaMask not found");

  const currentTime = Math.floor(Date.now() / 1000);
  const expiry = currentTime + 604800; // 1 week

  /**
   * FALLBACK STRATEGY: 
   * Celo Sepolia and the current SDK version (1.3.0) have an internal conflict for 
   * wallet_requestExecutionPermissions (EIP-7715). 
   * 
   * For the "Power 7" demo, we are using the "Aegis Intent Protocol": 
   * A human-readable EIP-191 signature that authorizes the Agent Session Account.
   */
  try {
    const delegationStatement = `Aegis Confidential Concierge Authorization:\n\nI hereby delegate budget control for the mandate "${justification}" to the Aegis Agent Session Account (${sessionAccountAddress}).\n\nLimit: ${amount} ${tokenAddress}\nChain: ${chain.id}\nExpiry: ${new Date(expiry * 1000).toISOString()}\n\nThis signature serves as a cryptographically verifiable intent for the Aegis NLA Protocol.`;

    const address = getAddress(userAddress);
    if (!address) throw new Error("No connected account found in MetaMask.");
    
    // Use the most direct provider request for maximum compatibility
    const signature = await (window as any).ethereum.request({
      method: 'personal_sign',
      params: [stringToHex(delegationStatement), address],
    });

    return {
      type: 'simulated-delegation',
      statement: delegationStatement,
      signature,
      sessionAddress: sessionAccountAddress,
    };
  } catch (err: any) {
    console.error("[MetaMask] Intent Signature failed:", err.message);
    throw err;
  }
};
/**
 * Check if the user's account is upgraded to a MetaMask Smart Account (EIP-7702).
 */
export const isAccountUpgraded = async (address: `0x${string}`) => {
  const publicClient = getPublicClient();
  
  try {
    const code = await publicClient.getCode({ address });
    if (!code || code === "0x") return false;

    // EIP-7702: 0xef0100 || address
    if (!code.startsWith("0xef0100")) return false;

    const delegatorAddress = `0x${code.substring(8)}`;
    const env = getSmartAccountsEnvironment(chain.id);
    const statelessAddress = env.implementations.EIP7702StatelessDeleGatorImpl;

    return delegatorAddress.toLowerCase() === statelessAddress.toLowerCase();
  } catch (err) {
    console.warn("[MetaMask] Failed to check code for upgrade status:", err);
    return false;
  }
};
