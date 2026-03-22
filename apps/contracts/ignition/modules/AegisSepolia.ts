import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Aegis Core Deployment for Celo Sepolia
 * This module deploys:
 * 1. MockSelfAgentRegistry (to simulate Self Protocol on testnet)
 * 2. AegisAgentRegistry (linked to the mock)
 * 3. AegisEscrow (linked to the registry)
 */
const AegisSepoliaModule = buildModule("AegisSepoliaModule", (m) => {
  // 1. Deploy MockSelfAgentRegistry
  const mockSelf = m.contract("MockSelfAgentRegistry");

  // 2. Deploy AegisAgentRegistry linked to the mock
  const registry = m.contract("AegisAgentRegistry", [mockSelf]);

  // 3. Deploy AegisEscrow linked to the registry
  const escrow = m.contract("AegisEscrow", [registry]);

  return { mockSelf, registry, escrow };
});

export default AegisSepoliaModule;
