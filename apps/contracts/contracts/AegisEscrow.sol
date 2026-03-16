// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./ISelfAgentRegistry.sol";

/**
 * @title AegisEscrow
 * @dev Handles intent-verified settlement for the Aegis Confidential Concierge on Celo.
 * Funds are locked against an EAS attestation and released upon verification.
 * Support for Pattern 4 (Meta-Transactions) for gasless agent execution.
 */
contract AegisEscrow is Ownable, ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;

    bytes32 public constant LOCK_FUNDS_TYPEHASH =
        keccak256(
            "LockFunds(bytes32 attestationId,address token,address vendor,uint256 amount,uint256 nonce,uint256 deadline)"
        );

    struct EscrowItem {
        address agent;
        address vendor;
        address token;
        uint256 amount;
        bool released;
        bool refunded;
    }

    // Mapping from attestationId to EscrowItem
    mapping(bytes32 => EscrowItem) public escrows;
    mapping(address => uint256) public nonces;

    // Address of the AegisAgentRegistry (which implements ISelfAgentRegistry)
    address public agentRegistry;

    event FundsLocked(
        bytes32 indexed attestationId,
        address indexed agent,
        address indexed vendor,
        address token,
        uint256 amount
    );
    event FundsReleased(
        bytes32 indexed attestationId,
        address indexed vendor,
        address token,
        uint256 amount
    );
    event FundsRefunded(
        bytes32 indexed attestationId,
        address indexed agent,
        address token,
        uint256 amount
    );

    constructor(
        address _agentRegistry
    ) Ownable(msg.sender) EIP712("AegisEscrow", "1") {
        agentRegistry = _agentRegistry;
    }

    /**
     * @dev Sets the Agent Registry address.
     */
    function setAgentRegistry(address _agentRegistry) external onlyOwner {
        agentRegistry = _agentRegistry;
    }

    /**
     * @dev Internal function to handle fund locking.
     */
    function _lock(
        bytes32 attestationId,
        address agent,
        address token,
        address vendor,
        uint256 amount
    ) internal {
        require(
            escrows[attestationId].agent == address(0),
            "Escrow already exists"
        );
        require(amount > 0, "Amount must be greater than zero");
        require(token != address(0), "Invalid token address");

        escrows[attestationId] = EscrowItem({
            agent: agent,
            vendor: vendor,
            token: token,
            amount: amount,
            released: false,
            refunded: false
        });

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        emit FundsLocked(attestationId, agent, vendor, token, amount);
    }

    /**
     * @dev Direct fund locking (Pattern 3: Agent-to-Chain).
     */
    function lockFunds(
        bytes32 attestationId,
        address token,
        address vendor,
        uint256 amount
    ) external nonReentrant {
        // Verify agent identity
        if (agentRegistry != address(0)) {
            bytes32 agentKey = bytes32(uint256(uint160(msg.sender)));
            require(
                ISelfAgentRegistry(agentRegistry).isVerifiedAgent(agentKey),
                "AegisEscrow: msg.sender is not a verified agent"
            );
        }

        _lock(attestationId, msg.sender, token, vendor, amount);
    }

    /**
     * @dev Gasless fund locking (Pattern 4: Meta-Transaction).
     */
    function lockFundsWithSignature(
        bytes32 attestationId,
        address agent,
        address token,
        address vendor,
        uint256 amount,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant {
        require(block.timestamp <= deadline, "AegisEscrow: Signature expired");

        // Verify agent identity in registry
        if (agentRegistry != address(0)) {
            bytes32 agentKey = bytes32(uint256(uint160(agent)));
            require(
                ISelfAgentRegistry(agentRegistry).isVerifiedAgent(agentKey),
                "AegisEscrow: Agent is not human-verified"
            );
        }

        bytes32 structHash = keccak256(
            abi.encode(
                LOCK_FUNDS_TYPEHASH,
                attestationId,
                token,
                vendor,
                amount,
                nonces[agent],
                deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        require(signer == agent, "AegisEscrow: Invalid signature");

        nonces[agent]++;

        // The caller (CFO/Relayer) provides the funds
        _lock(attestationId, agent, token, vendor, amount);
    }

    /**
     * @dev Releases funds to the vendor. Only the owner (CFO Master ID) can authorize.
     */
    function releaseFunds(
        bytes32 attestationId
    ) external onlyOwner nonReentrant {
        EscrowItem storage item = escrows[attestationId];
        require(item.amount > 0, "Escrow does not exist");
        require(!item.released, "Already released");
        require(!item.refunded, "Already refunded");

        item.released = true;
        IERC20(item.token).safeTransfer(item.vendor, item.amount);

        emit FundsReleased(attestationId, item.vendor, item.token, item.amount);
    }

    /**
     * @dev Refunds funds back to the agent. Only the owner (CFO Master ID) can authorize.
     */
    function refund(bytes32 attestationId) external onlyOwner nonReentrant {
        EscrowItem storage item = escrows[attestationId];
        require(item.amount > 0, "Escrow does not exist");
        require(!item.released, "Already released");
        require(!item.refunded, "Already refunded");

        item.refunded = true;
        IERC20(item.token).safeTransfer(item.agent, item.amount);

        emit FundsRefunded(attestationId, item.agent, item.token, item.amount);
    }
}
