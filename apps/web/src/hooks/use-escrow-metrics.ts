"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { 
  AEGIS_ESCROW_ADDRESS, 
  CUSD_ADDRESS, 
  USDT_ADDRESS,
  USDC_ADDRESS,
  ERC20Abi 
} from "@/lib/contracts";

/**
 * Hook to fetch total value locked (TVL) in the Aegis Escrow across all supported tokens.
 */
export function useEscrowMetrics() {
  const { address } = useAccount();

  // 1. Fetch balances for all supported tokens in the Escrow contract
  const { data: usdmBalance, isLoading: isLoadingUsdm } = useReadContract({
    address: CUSD_ADDRESS,
    abi: ERC20Abi,
    functionName: "balanceOf",
    args: [AEGIS_ESCROW_ADDRESS],
  });

  const { data: usdtBalance, isLoading: isLoadingUsdt } = useReadContract({
    address: USDT_ADDRESS,
    abi: ERC20Abi,
    functionName: "balanceOf",
    args: [AEGIS_ESCROW_ADDRESS],
  });

  const { data: usdcBalance, isLoading: isLoadingUsdc } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20Abi,
    functionName: "balanceOf",
    args: [AEGIS_ESCROW_ADDRESS],
  });

  const isLoading = isLoadingUsdm || isLoadingUsdt || isLoadingUsdc;

  const totalValueLocked = useMemo(() => {
    let total = 0;
    
    // USDm (18 decimals)
    if (usdmBalance) {
      total += parseFloat(formatUnits(usdmBalance as bigint, 18));
    }
    
    // USDT (6 decimals)
    if (usdtBalance) {
      total += parseFloat(formatUnits(usdtBalance as bigint, 6));
    }
    
    // USDC (6 decimals)
    if (usdcBalance) {
      total += parseFloat(formatUnits(usdcBalance as bigint, 6));
    }

    return total.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [usdmBalance, usdtBalance, usdcBalance]);

  return {
    totalValueLocked,
    isLoading,
  };
}
