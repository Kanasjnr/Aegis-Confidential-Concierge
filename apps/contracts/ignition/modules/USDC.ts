import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDCModule = buildModule("USDCModule", (m) => {
  const usdc = m.contract("MockToken", ["USDC", "USDC", 6], {
    id: "USDC"
  });

  return { usdc };
});

export default USDCModule;
