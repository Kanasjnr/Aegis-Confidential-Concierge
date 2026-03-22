import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDmModule = buildModule("USDmModule", (m) => {
  const usdm = m.contract("USDm");

  return { usdm };
});

export default USDmModule;
