// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title IERC8004
 * @dev Interface for the ERC-8004 Trustless Agents standard.
 * Focused on the Identity Registry component.
 */
interface IERC8004 is IERC721 {
    event AgentRegistered(uint256 indexed agentId, string agentURI);

    /**
     * @dev Returns the metadata URI for a given agent.
     */
    function agentURI(uint256 agentId) external view returns (string memory);
}
