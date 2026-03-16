# Aegis Confidential Concierge (ACC)

A privacy-first, autonomous procurement agent for businesses. Built on **Celo** and powered by the **Power 7** integration stack, Aegis ensures maximum product impact and engineering defensibility for automated agentic commerce.

## Vision

Aegis enables businesses to delegate complex procurement and search tasks to a trusted autonomous agent. By combining ZK-identity, verifiable commitments, and private reasoning, Aegis creates a secure bridge between natural language negotiations and on-chain settlement.

## The Power 7 Stack

- **Venice AI**: Private reasoning and confidential negotiation strategy.
- **Celo Mainnet**: High-speed, low-cost settlement layer.
- **Self Protocol**: ZK-Humanity and OFAC compliance gating via ZK-ID.
- **EAS (Ethereum Attestation Service)**: Transparent, on-chain deal anchoring.
- **MetaMask (ERC-7715)**: Secure budget delegation and CFO master control.
- **Protocol Labs (ERC-8004)**: Standardized Trustless Agent Identity.
- **Locus & AgentCash**: Autonomous vendor discovery and search tools.

## Live Implementation (Celo Mainnet)

The core infrastructure is live on Celo:

| Contract               | Address                                      |
| ---------------------- | -------------------------------------------- |
| **AegisAgentRegistry** | `0xf6A298be1F9997B05A089526116D8F4BDD38b31c` |
| **AegisEscrow**        | `0xa2F6a0c88F8708532967F7541405d30818455460` |

---

## Getting Started

### 1. Prerequisites

- **Node.js** (v18+)
- **pnpm** (v8+)
- **Celo Mainnet Account** (with cUSD/USDC)

### 2. Setup

```bash
# Install dependencies
pnpm install

# Build the system
pnpm build
```

### 3. Smart Contract Management

```bash
# Navigate to contracts
cd apps/contracts

# Run tests
pnpm test

# Deploy to Celo Mainnet (Ignition)
pnpm deploy:celo
```

## Project Structure

- `apps/agent` - Node.js Agent Core (Venice AI & Reasoning)
- `apps/contracts` - Aegis Smart Contracts (Security Audited)
- `apps/web` - CFO Management Dashboard (React)

## Governance

Aegis is owned by the **CFO Master ID**. The CFO must verify their humanity via Self Protocol to activate the agent. All funds are held in the `AegisEscrow` and only released upon successful deal verification.

---

_Built for the Celo "Power 7" Hackathon._
