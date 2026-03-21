"use client";

import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { 
  AEGIS_ESCROW_ADDRESS, 
  CUSD_ADDRESS, 
  ERC20Abi 
} from "@/lib/contracts";

/**
 * Hook to fetch escrow-related metrics from the chain.
 */
export function useEscrowMetrics() {
  const { data: balance, isLoading, isError, refetch } = useReadContract({
    address: CUSD_ADDRESS,
    abi: ERC20Abi,
    functionName: "balanceOf",
    args: [AEGIS_ESCROW_ADDRESS],
  });

  const formattedBalance = useMemo(() => {
    if (!balance) return "0.00";
    return parseFloat(formatUnits(balance as bigint, 18)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [balance]);

  return {
    totalValueLocked: formattedBalance,
    isLoading,
    isError,
    refetch,
  };
}
