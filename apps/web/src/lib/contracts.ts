import AegisAgentRegistryAbi from './abis/AegisAgentRegistry.json';
import AegisEscrowAbi from './abis/AegisEscrow.json';
import ERC20Abi from './abis/ERC20.json';

export const AEGIS_AGENT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_AGENT_REGISTRY_ADDRESS as `0x${string}`;
export const AEGIS_ESCROW_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_ESCROW_ADDRESS as `0x${string}`;
export const CUSD_ADDRESS = process.env.NEXT_PUBLIC_CUSD_ADDRESS as `0x${string}`;

export {
  AegisAgentRegistryAbi,
  AegisEscrowAbi,
  ERC20Abi
};
