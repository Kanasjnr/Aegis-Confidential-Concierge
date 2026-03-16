import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Self Protocol Addresses for Celo
 */
const SELF_AGENT_REGISTRY_ADDR = "0xaC3DF9ABf80d0F5c020C06B04Cced27763355944"; // Celo Mainnet

const AegisModule = buildModule("AegisModule", (m) => {
  // 1. Deploy AegisAgentRegistry
  const selfVerifier = m.getParameter("selfVerifier", SELF_AGENT_REGISTRY_ADDR);
  const registry = m.contract("AegisAgentRegistry", [selfVerifier]);

  // 2. Deploy AegisEscrow
  const escrow = m.contract("AegisEscrow", [registry]);

  return { registry, escrow };
});

export default AegisModule;
