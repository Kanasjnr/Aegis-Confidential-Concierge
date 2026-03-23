"use client";

import { useState, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import { AEGIS_ESCROW_ADDRESS, AegisEscrowAbi, getTokenDecimals, getTokenSymbol } from "@/lib/contracts";

export interface Mandate {
  id: string;
  name: string;
  type: string;
  status: "active" | "executed" | "pending" | "secured";
  value: string;
  fullGoal: string;
  token: string;
  amount: string;
  lastUpdated: string;
  updated: string; // Alias for lastUpdated used by MissionCard
}

// Support for "Legacy" mandates created before the caching was implemented
const LEGACY_MANDATES_METADATA: Record<string, string> = {
  "0x42f7723ac24cf2706cc3a4092f54ac6f8c767fa798e881d04a3349d389d69b6d": "Mandate: Lisbon Workspace Residency. Strategy: Balanced. Goal: Find a high-end co-living space in Lisbon for the month of May. It must have high-speed fiber internet, a private balcony, and be within walking distance of the Barrio Alto district.",
  ["0x42f7723ac24cf2706cc3a4092f54ac6f8c767fa798e881d04a3349d389d69b6d".toLowerCase()]: "Mandate: Lisbon Workspace Residency. Strategy: Balanced. Goal: Find a high-end co-living space in Lisbon for the month of May. It must have high-speed fiber internet, a private balcony, and be within walking distance of the Barrio Alto district."
};

/**
 * Hook to fetch and manage mandates (escrow logs) for the connected account.
 */
export function useMandates() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMandates = async () => {
      if (!address || !publicClient) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      try {
        const logs = await publicClient.getLogs({
          address: AEGIS_ESCROW_ADDRESS,
          event: {
            type: 'event',
            name: 'FundsLocked',
            inputs: [
              { indexed: true, name: 'attestationId', type: 'bytes32' },
              { indexed: true, name: 'agent', type: 'address' },
              { indexed: true, name: 'vendor', type: 'address' },
              { indexed: false, name: 'token', type: 'address' },
              { indexed: false, name: 'amount', type: 'uint256' }
            ]
          },
          args: {
            agent: address
          },
          fromBlock: 20850000n
        });

        const mappedMandates: Mandate[] = await Promise.all(logs.map(async (log: any) => {
          const { attestationId, token, amount } = log.args;
          const idLower = attestationId.toLowerCase();

          // Try to recover goal from localStorage or Legacy map
          const savedGoal = localStorage.getItem(`aegis_mandate_${idLower}`) || LEGACY_MANDATES_METADATA[idLower];

          // Fetch reasoning status from API
          let currentStatus: Mandate['status'] = "active";
          try {
            const resp = await fetch(`/api/agent/reasoning?mandateId=${attestationId}`);
            const data = await resp.json();
            if (data.status === 'secured') currentStatus = "secured";
            if (data.status === 'success') currentStatus = "executed";
          } catch (e) {
            console.log("Status check failed for", attestationId);
          }

          let name = `Mandate ${attestationId.slice(0, 6)}`;
          if (savedGoal) {
            let processedGoal = savedGoal;
            try {
              if (savedGoal.startsWith('{')) {
                const parsed = JSON.parse(savedGoal);
                processedGoal = parsed.goal || savedGoal;
              }
            } catch (e) {
              // Not JSON
            }

            const cleaned = processedGoal.replace('Mandate: ', '').replace('Determine if ', '');
            name = cleaned.includes('Strategy:') ? cleaned.split('Strategy:')[0].trim().replace('.', '') : cleaned.split('.')[0];
            name = name.slice(0, 40);
          }

          const type = savedGoal?.toLowerCase().includes('strategy') ? 'AI Optimization' : 'Service Escrow';
          const decimals = getTokenDecimals(token);
          const symbol = getTokenSymbol(token);
          const formattedValue = `${formatUnits(amount, decimals)} ${symbol}`;
          const lastUpdated = "Active Now";

          return {
            id: attestationId,
            name: name,
            type: type,
            status: currentStatus,
            value: formattedValue,
            fullGoal: savedGoal || `Aegis Escrow Auth: ${attestationId.slice(0, 12)}...`,
            token: token,
            amount: formatUnits(amount, decimals),
            lastUpdated: lastUpdated,
            updated: lastUpdated
          };
        }));

        setMandates(mappedMandates.reverse());
      } catch (err) {
        console.error("Error fetching mandates:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch mandates"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMandates();
  }, [address, publicClient]);

  return {
    mandates,
    isLoading,
    error
  };
}
