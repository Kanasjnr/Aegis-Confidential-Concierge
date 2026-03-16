// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISelfAgentRegistry
 * @dev Interface for the Self Protocol Agent Registry on Celo.
 */
interface ISelfAgentRegistry {
    struct AgentCredentials {
        string issuingState;
        string[] name;
        string idNumber;
        string nationality;
        string dateOfBirth;
        string gender;
        string expiryDate;
        uint256 olderThan;
        bool[3] ofac; // [isSanctioned, isHighRisk, isPoliticallyExposed] - usually [false, false, false] is clean
    }

    function isVerifiedAgent(bytes32 agentKey) external view returns (bool);
    function getAgentId(bytes32 agentKey) external view returns (uint256);
    function isProofFresh(uint256 agentId) external view returns (bool);
    function getAgentCredentials(
        uint256 agentId
    ) external view returns (AgentCredentials memory);
}
