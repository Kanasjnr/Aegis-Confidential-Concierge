// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ISelfAgentRegistry.sol";

contract MockSelfAgentRegistry is ISelfAgentRegistry {
    mapping(bytes32 => bool) public verified;

    function setVerified(address account, bool isVerified) external {
        verified[bytes32(uint256(uint160(account)))] = isVerified;
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
}
