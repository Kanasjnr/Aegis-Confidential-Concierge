"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { 
  CUSD_ADDRESS, 
  USDT_ADDRESS, 
  USDC_ADDRESS, 
  ERC20Abi 
} from "@/lib/contracts";

/**
 * Hook to fetch the connected user's wallet balances for supported tokens.
 */
export function usePortfolioBalance() {
  const { address } = useAccount();

  // 1. Fetch balances for all supported tokens for the user
  const { data: usdmBalance, isLoading: isLoadingUsdm } = useReadContract({
    address: CUSD_ADDRESS,
    abi: ERC20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
        enabled: !!address
    }
  });

  const { data: usdtBalance, isLoading: isLoadingUsdt } = useReadContract({
    address: USDT_ADDRESS,
    abi: ERC20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
        enabled: !!address
    }
  });

  const { data: usdcBalance, isLoading: isLoadingUsdc } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
        enabled: !!address
    }
  });

  const isLoading = isLoadingUsdm || isLoadingUsdt || isLoadingUsdc;

  const totalBalance = useMemo(() => {
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

  const allocation = useMemo(() => {
    const total = (usdmBalance ? parseFloat(formatUnits(usdmBalance as bigint, 18)) : 0) +
                  (usdtBalance ? parseFloat(formatUnits(usdtBalance as bigint, 6)) : 0) +
                  (usdcBalance ? parseFloat(formatUnits(usdcBalance as bigint, 6)) : 0);
    
    if (total === 0) return [
        { label: "USDm", value: 100, color: "#00E5FF" },
        { label: "USDT", value: 0, color: "#10B981" },
        { label: "USDC", value: 0, color: "#F59E0B" },
    ];

    return [
      { 
        label: "USDm", 
        value: Math.round(((usdmBalance ? parseFloat(formatUnits(usdmBalance as bigint, 18)) : 0) / total) * 100), 
        color: "#00E5FF" 
      },
      { 
        label: "USDT", 
        value: Math.round(((usdtBalance ? parseFloat(formatUnits(usdtBalance as bigint, 6)) : 0) / total) * 100), 
        color: "#10B981" 
      },
      { 
        label: "USDC", 
        value: Math.round(((usdcBalance ? parseFloat(formatUnits(usdcBalance as bigint, 6)) : 0) / total) * 100), 
        color: "#F59E0B" 
      },
    ];
  }, [usdmBalance, usdtBalance, usdcBalance]);

  return {
    totalBalance,
    allocation,
    isLoading,
  };
}
