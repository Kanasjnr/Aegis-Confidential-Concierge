import { createWalletClient, custom, parseUnits, createPublicClient, http } from "viem";
import { celoSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { 
  toMetaMaskSmartAccount, 
  Implementation
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

  return await toMetaMaskSmartAccount({
    client: publicClient as any,
    implementation: Implementation.Hybrid,
    deployParams: [account.address, [], [], []],
    deploySalt: "0x",
    signer: { account },
  });
};

/**
 * Request Advanced Permissions for a specific mandate.
 * Uses requestExecutionPermissions as documented in Step 5 of the guide.
 */
export const requestMandatePermissions = async (
  sessionAccountAddress: string,
  tokenAddress: string,
  amount: string,
  decimals: number = 18,
  justification: string = "Budget delegation for Aegis Mission"
) => {
  const walletClient = getMetaMaskClient();
  if (!walletClient) throw new Error("MetaMask not found");

  const currentTime = Math.floor(Date.now() / 1000);
  const expiry = currentTime + 604800; // 1 week

  console.log("Requesting permissions for session account:", sessionAccountAddress);

  return await (walletClient as any).requestExecutionPermissions([{
    chainId: chain.id,
    expiry,
    signer: {
      type: "account",
      data: { address: sessionAccountAddress as `0x${string}` },
    },
    permission: {
      type: "erc20-token-periodic",
      data: {
        tokenAddress: tokenAddress as `0x${string}`,
        // periodAmount: amount formatted with decimals
        periodAmount: parseUnits(amount, decimals),
        // 1 day in seconds
        periodDuration: 86400,
        justification,
      },
    },
    isAdjustmentAllowed: true,
  }]);
};
