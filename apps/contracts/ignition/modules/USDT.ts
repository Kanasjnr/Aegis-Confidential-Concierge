import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDTModule = buildModule("USDTModule", (m) => {
  const usdt = m.contract("MockToken", ["USDT", "USDT", 6], {
    id: "USDT"
  });

  return { usdt };
});

export default USDTModule;
