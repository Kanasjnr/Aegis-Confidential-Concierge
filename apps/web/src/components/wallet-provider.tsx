"use client"

import { useMemo } from 'react'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider, http } from 'wagmi'
import { celo, celoSepolia } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const config = useMemo(() => getDefaultConfig({
    appName: 'Aegis Confidential Concierge',
    projectId: '85c94294d13e2f5b9d368e7d8f56247c',
    chains: [celoSepolia],
    transports: {
      [celo.id]: http(),
      [celoSepolia.id]: http(),
    },
    ssr: true,
  }), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
