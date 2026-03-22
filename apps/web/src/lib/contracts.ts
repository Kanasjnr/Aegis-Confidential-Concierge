import AegisAgentRegistryAbi from './abis/AegisAgentRegistry.json';
import AegisEscrowAbi from './abis/AegisEscrow.json';
import ERC20Abi from './abis/ERC20.json';

export const AEGIS_AGENT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_AGENT_REGISTRY_ADDRESS as `0x${string}`;
export const MOCK_SELF_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_MOCK_SELF_REGISTRY_ADDRESS as `0x${string}`;
export const SELF_HUB_ADDRESS = (process.env.NEXT_PUBLIC_SELF_HUB_ADDRESS || "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74") as `0x${string}`;
export const AEGIS_ESCROW_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_ESCROW_ADDRESS as `0x${string}`;
export const CUSD_ADDRESS = process.env.NEXT_PUBLIC_CUSD_ADDRESS as `0x${string}`;
export const CELO_ADDRESS = process.env.NEXT_PUBLIC_CELO_ADDRESS as `0x${string}`;
export const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS as `0x${string}`;
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

// Arkhai NLA Addresses (Celo Sepolia)
export const ARKHAI_EAS_SCHEMA_REGISTRY = process.env.NEXT_PUBLIC_ARKHAI_EAS_SCHEMA_REGISTRY as `0x${string}`;
export const ARKHAI_EAS = process.env.NEXT_PUBLIC_ARKHAI_EAS as `0x${string}`;
export const ARKHAI_TRUSTED_ORACLE_ARBITER = process.env.NEXT_PUBLIC_ARKHAI_TRUSTED_ORACLE_ARBITER as `0x${string}`;
export const ARKHAI_ERC20_ESCROW_OBLIGATION = process.env.NEXT_PUBLIC_ARKHAI_ERC20_ESCROW_OBLIGATION as `0x${string}`;
export const ARKHAI_ERC20_PAYMENT_OBLIGATION = process.env.NEXT_PUBLIC_ARKHAI_ERC20_PAYMENT_OBLIGATION as `0x${string}`;
export const ARKHAI_ERC20_BARTER_UTILS = process.env.NEXT_PUBLIC_ARKHAI_ERC20_BARTER_UTILS as `0x${string}`;

export {
  AegisAgentRegistryAbi,
  AegisEscrowAbi,
  ERC20Abi
};
