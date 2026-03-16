# Aegis Smart Contracts

Core on-chain infrastructure for the Aegis Confidential Concierge, optimized for Celo Mainnet.

## Contracts

- **AegisAgentRegistry.sol**: ERC-8004 Identity Registry gated by ZK-Humanity (Self Protocol) and OFAC compliance.
- **AegisEscrow.sol**: Intent-verified settlement with EIP-712 Meta-Transaction support for gasless agent deals.

## Development

```bash
# Install dependencies
pnpm install

# Compile contracts
pnpm compile

# Run Hardhat tests
pnpm test
```

## Live Mainnet Addresses

| Contract               | Address                                      |
| ---------------------- | -------------------------------------------- |
| **AegisAgentRegistry** | `0xf6A298be1F9997B05A089526116D8F4BDD38b31c` |
| **AegisEscrow**        | `0xa2F6a0c88F8708532967F7541405d30818455460` |

---

## Deployment Configuration

### 1. Environment

Create a `.env` file in this directory based on `.env.example`:

```env
PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=...
```

### 2. Execution (Ignition)

```bash
# Deploy to Celo Mainnet
pnpm deploy:celo
```

## 📁 Project Structure

```
contracts/
├── AegisAgentRegistry.sol
├── AegisEscrow.sol
├── IERC8004.sol
└── ISelfAgentRegistry.sol

test/
└── Aegis.test.ts

ignition/modules/
└── Aegis.ts

hardhat.config.ts
```

## License

MIT
