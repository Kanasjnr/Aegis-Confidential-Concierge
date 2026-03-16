// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC8004.sol";
import "./ISelfAgentRegistry.sol";

/**
 * @title AegisAgentRegistry
 * @dev Implementation of the ERC-8004 Identity Registry for Aegis Confidential Concierge.
 * Each concierge instance is represented as an NFT.
 */
contract AegisAgentRegistry is ERC721, ERC721URIStorage, Ownable, IERC8004 {
    uint256 private _nextTokenId;

    // Mapping from agent ID to specialized metadata
    mapping(uint256 => string) private _agentPrompts;

    // Mapping from owner address to their primary Agent ID
    mapping(address => uint256) private _addressToAgentId;

    // Address of the Self Protocol verifier on Celo
    address public selfVerifier;

    constructor(
        address _selfVerifier
    ) ERC721("Aegis Confidential Concierge", "ACC") Ownable(msg.sender) {
        selfVerifier = _selfVerifier;
    }

    /**
     * @dev Sets the Self Protocol verifier address.
     */
    function setSelfVerifier(address _selfVerifier) public onlyOwner {
        selfVerifier = _selfVerifier;
    }

    /**
     * @dev Registers a new agent.
     * @param to The owner of the agent identity (must be a Self-verified human).
     * @param uri The metadata URI for the agent (ERC-8004 agentURI).
     * @param promptCID The IPFS CID for the agent's private reasoning blueprint.
     */
    function registerAgent(
        address to,
        string memory uri,
        string memory promptCID
    ) public onlyOwner returns (uint256) {
        // Enforce ZK-Humanity and OFAC check from Self Protocol
        if (selfVerifier != address(0)) {
            bytes32 agentKey = bytes32(uint256(uint160(to)));
            ISelfAgentRegistry registry = ISelfAgentRegistry(selfVerifier);
            require(
                registry.isVerifiedAgent(agentKey),
                "Aegis: Owner must be a verified human (Self Protocol)"
            );

            // Fetch credentials and verify OFAC status
            uint256 selfAgentId = registry.getAgentId(agentKey);
            ISelfAgentRegistry.AgentCredentials memory creds = registry
                .getAgentCredentials(selfAgentId);
            require(!creds.ofac[0], "Aegis: Owner is on OFAC sanctions list");
        }

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _agentPrompts[tokenId] = promptCID;

        emit AgentRegistered(tokenId, uri);
        return tokenId;
    }

    /**
     * @dev Implementation of IERC8004.agentURI.
     */
    function agentURI(
        uint256 agentId
    ) external view override returns (string memory) {
        return tokenURI(agentId);
    }

    /**
     * @dev Returns the system prompt CID for an agent.
     */
    function getAgentPrompt(
        uint256 agentId
    ) external view returns (string memory) {
        _requireOwned(agentId);
        return _agentPrompts[agentId];
    }

    /**
     * @dev Implementation of isVerifiedAgent for our system.
     * Returns true if the address owns an Agent ID NFT.
     */
    function isVerifiedAgent(bytes32 agentKey) external view returns (bool) {
        address agent = address(uint160(uint256(agentKey)));
        return balanceOf(agent) > 0;
    }

    /**
     * @dev Implementation of getAgentId.
     * Returns the tokenId associated with the agentKey (derived from address).
     */
    function getAgentId(bytes32 agentKey) external view returns (uint256) {
        address agent = address(uint160(uint256(agentKey)));
        require(balanceOf(agent) > 0, "Aegis: Not a verified agent");
        return _addressToAgentId[agent];
    }

    // Overrides required by Solidity

    /**
     * @dev Overriding _update to ensure _addressToAgentId mapping stays in sync.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        address previousOwner = super._update(to, tokenId, auth);

        // Update the owner mapping
        if (to != address(0)) {
            _addressToAgentId[to] = tokenId;
        }

        // Clean up previous owner mapping if they no longer own any agent
        // (For simplicity, we assume one agent per human as perACC mandate)
        if (previousOwner != address(0) && previousOwner != to) {
            // Only delete if the previous owner doesn't own this specific tokenId anymore
            // (Which they don't, because it just moved to 'to')
            // If they own other tokens, this logic might need refinement for multi-agent support
            // but for Aegis MVA, one human = one agent is the standard.
            delete _addressToAgentId[previousOwner];
        }

        return previousOwner;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage, IERC165) returns (bool) {
        return
            interfaceId == type(IERC8004).interfaceId ||
            interfaceId == type(ISelfAgentRegistry).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
