import { PropsWithChildren } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const chain = bscTestnet // BSC Testnet (Chain ID 97) - FREE for testing
const rpc = import.meta.env.VITE_RPC_URL || 'https://bsc-testnet-dataseed.bnbchain.org'

const config = createConfig({
  chains: [chain],
  connectors: [
    injected({ 
      shimDisconnect: true,
    }),
    metaMask({ 
      shimDisconnect: true,
    })
  ],
  transports: { 
    [chain.id]: http(rpc)
  },
  ssr: false,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1_000,
    },
  },
})

export default function Providers({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}