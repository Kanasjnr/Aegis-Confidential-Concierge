// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ISelfAgentRegistry.sol";

contract MockSelfAgentRegistry is ISelfAgentRegistry {
    mapping(bytes32 => bool) public verified;

    function setVerified(address account, bool _isVerified) external {
        verified[bytes32(uint256(uint160(account)))] = _isVerified;
    }

    function isVerifiedAgent(
        bytes32 agentKey
    ) external view override returns (bool) {
        return verified[agentKey];
    }

    function getAgentId(
        bytes32 agentKey
    ) external view override returns (uint256) {
        return uint256(agentKey);
    }

    function isProofFresh(uint256) external view override returns (bool) {
        return true;
    }

    function getAgentCredentials(
        uint256
    ) external view override returns (AgentCredentials memory) {
        string[] memory names = new string[](1);
        names[0] = "Verified Human";
        bool[3] memory ofac = [false, false, false]; // Clean by default
        return
            AgentCredentials({
                issuingState: "US",
                name: names,
                idNumber: "12345",
                nationality: "US",
                dateOfBirth: "1990-01-01",
                gender: "M",
                expiryDate: "2030-01-01",
                olderThan: 18,
                ofac: ofac
            });
    }

    /**
     * @dev Added to support Self Protocol v2 simulation and submission.
     * The mobile app calls this method automatically in onchain mode.
     */
    function submitProof(
        uint256, // attestationId
        bytes calldata, // proof
        uint256[] calldata // publicSignals
    ) external returns (bool) {
        // Automatically verify the sender for this mock implementation
        verified[bytes32(uint256(uint160(msg.sender)))] = true;
        return true;
    }

    // ALIASES for different SDK versions
    function isAgentVerified(bytes32 agentKey) external view returns (bool) {
        return verified[agentKey];
    }

    function isVerified(bytes32 agentKey) external view returns (bool) {
        return verified[agentKey];
    }

    /**
     * @dev Universal fallback to prevent ANY 0x revert during mobile app simulation.
     * If the app calls a function name we don't know, it will still succeed.
     */
    fallback() external {
        // Return nothing, effectively success for most simulations
    }

    receive() external payable {}
}
