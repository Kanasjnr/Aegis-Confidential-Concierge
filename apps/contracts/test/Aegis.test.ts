import { expect } from "chai";
import { viem } from "hardhat";
import { parseEther, encodePacked, keccak256 } from "viem";

describe("Aegis Project Contracts", function () {
  async function deployContractsFixture() {
    const [owner, otherAccount, vendor] = await viem.getWalletClients();

    const publicClient = await viem.getPublicClient();

    const mockCUSD = await viem.deployContract("MockCUSD");
    const mockUSDC = await viem.deployContract("MockCUSD"); // Using same mock for USDC
    const mockSelf = await viem.deployContract("MockSelfAgentRegistry");

    const registry = await viem.deployContract("AegisAgentRegistry", [
      mockSelf.address,
    ]);
    const escrow = await viem.deployContract("AegisEscrow", [registry.address]);

    // Verify owner as human and register them as an agent for general tests
    await mockSelf.write.setVerified([owner.account.address, true]);
    await registry.write.registerAgent([
      owner.account.address,
      "ipfs://cfo",
      "ipfs://cfo-prompt",
    ]);

    return {
      registry,
      escrow,
      mockCUSD,
      mockUSDC,
      mockSelf,
      owner,
      otherAccount,
      vendor,
      publicClient,
    };
  }

  describe("AegisAgentRegistry", function () {
    it("Should register a new agent identity only by owner with human proof", async function () {
      const { registry, otherAccount, owner, mockSelf } =
        await deployContractsFixture();

      const agentURI = "ipfs://QmAgentMetadata";
      const promptCID = "ipfs://QmSystemPrompt";

      // Mark otherAccount as verified human
      await mockSelf.write.setVerified([otherAccount.account.address, true]);

      // Should succeed when called by owner and 'to' is verified
      await registry.write.registerAgent([
        otherAccount.account.address,
        agentURI,
        promptCID,
      ]);

      // owner is token 0, otherAccount is token 1
      expect((await registry.read.ownerOf([1n])).toLowerCase()).to.equal(
        otherAccount.account.address.toLowerCase(),
      );
    });

    it("Should fail if the owner is not a verified human", async function () {
      const { registry, otherAccount, mockSelf } =
        await deployContractsFixture();

      const agentURI = "ipfs://QmAgentMetadata";
      const promptCID = "ipfs://QmSystemPrompt";

      // otherAccount NOT verified human
      await mockSelf.write.setVerified([otherAccount.account.address, false]);
    });
  });

  describe("AegisEscrow", function () {
    it("Should lock funds successfully (cUSD)", async function () {
      const { escrow, mockCUSD, vendor } = await deployContractsFixture();

      const amount = parseEther("100");
      const attestationId = keccak256(encodePacked(["string"], ["deal-1"]));

      await mockCUSD.write.approve([escrow.address, amount]);

      await escrow.write.lockFunds([
        attestationId,
        mockCUSD.address,
        vendor.account.address,
        amount,
      ]);

      const item = await escrow.read.escrows([attestationId]);
      expect(item[3]).to.equal(amount); // amount index changed to 3 (agent, vendor, token, amount)
      expect(item[2].toLowerCase()).to.equal(mockCUSD.address.toLowerCase()); // token
    });

    it("Should lock funds successfully (USDC)", async function () {
      const { escrow, mockUSDC, vendor } = await deployContractsFixture();

      const amount = parseEther("50");
      const attestationId = keccak256(encodePacked(["string"], ["deal-2"]));

      await mockUSDC.write.approve([escrow.address, amount]);

      await escrow.write.lockFunds([
        attestationId,
        mockUSDC.address,
        vendor.account.address,
        amount,
      ]);

      const item = await escrow.read.escrows([attestationId]);
      expect(item[3]).to.equal(amount);
      expect(item[2].toLowerCase()).to.equal(mockUSDC.address.toLowerCase());
    });

    it("Should release funds only by owner", async function () {
      const { escrow, mockCUSD, vendor } = await deployContractsFixture();

      const amount = parseEther("100");
      const attestationId = keccak256(encodePacked(["string"], ["deal-1"]));

      await mockCUSD.write.approve([escrow.address, amount]);
      await escrow.write.lockFunds([
        attestationId,
        mockCUSD.address,
        vendor.account.address,
        amount,
      ]);

      await escrow.write.releaseFunds([attestationId]);

      const item = await escrow.read.escrows([attestationId]);
      expect(item[4]).to.be.true; // released is index 4

      const vendorBalance = await mockCUSD.read.balanceOf([
        vendor.account.address,
      ]);
      expect(vendorBalance).to.equal(amount);
    });

    it("Should lock funds with EIP-712 signature (Pattern 4: Meta-Transaction)", async function () {
      const { escrow, mockCUSD, vendor, otherAccount, mockSelf, registry } =
        await deployContractsFixture();

      const amount = parseEther("200");
      const attestationId = keccak256(
        encodePacked(["string"], ["deal-meta-1"]),
      );
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const nonce = 0n;

      // Ensure otherAccount is a verified human agent
      await mockSelf.write.setVerified([otherAccount.account.address, true]);

      // Register the agent NFT
      await registry.write.registerAgent([
        otherAccount.account.address,
        "ipfs://agent",
        "ipfs://prompt",
      ]);

      // CFO (owner) provides funds to the faucet/relayer (owner is already faucet in tests)
      await mockCUSD.write.approve([escrow.address, amount]);

      const domain = {
        name: "AegisEscrow",
        version: "1",
        chainId: 31337, // Hardhat local chain ID
        verifyingContract: escrow.address,
      };

      const types = {
        LockFunds: [
          { name: "attestationId", type: "bytes32" },
          { name: "token", type: "address" },
          { name: "vendor", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const message = {
        attestationId,
        token: mockCUSD.address,
        vendor: vendor.account.address,
        amount,
        nonce,
        deadline,
      };

      // Agent (otherAccount) signs the deal
      const signature = await otherAccount.signTypedData({
        domain,
        types,
        primaryType: "LockFunds",
        message,
      });

      // Relayer (owner) submits the transaction gaslessly for the agent
      await escrow.write.lockFundsWithSignature([
        attestationId,
        otherAccount.account.address,
        mockCUSD.address,
        vendor.account.address,
        amount,
        deadline,
        signature,
      ]);

      const item = await escrow.read.escrows([attestationId]);
      expect(item[0].toLowerCase()).to.equal(
        otherAccount.account.address.toLowerCase(),
      ); // Agent
      expect(item[3]).to.equal(amount);
    });
  });
});
