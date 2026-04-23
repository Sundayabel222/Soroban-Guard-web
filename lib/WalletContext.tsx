'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { connectFreighter, isFreighterInstalled, getFreighterNetwork } from '@/lib/wallet'
import { checkNetworkHealth } from '@/lib/stellar'
import type { StellarNetwork } from '@/types/stellar'
import { NETWORKS } from '@/types/stellar'

interface WalletContextType {
  publicKey: string | null
  network: StellarNetwork
  networkHealthy: boolean
  loading: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [network, setNetwork] = useState<StellarNetwork>(NETWORKS.testnet)
  const [networkHealthy, setNetworkHealthy] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check network health when network changes
  useEffect(() => {
    if (publicKey) {
      checkNetworkHealth(network).then(healthy => {
        setNetworkHealthy(healthy)
      })
    }
  }, [network, publicKey])

  const connect = async () => {
    if (!isFreighterInstalled()) {
      setError('Freighter wallet is not installed')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const key = await connectFreighter()
      if (!key) {
        setError('Could not retrieve public key. Make sure Freighter is unlocked.')
        return
      }
      
      const net = await getFreighterNetwork()
      if (!net) {
        setError('Could not retrieve network from Freighter.')
        return
      }
      
      setPublicKey(key)
      setNetwork(net)
      setNetworkHealthy(true)
    } catch (err) {
      setError('Failed to connect to Freighter.')
    } finally {
      setLoading(false)
    }
  }

  const disconnect = () => {
    setPublicKey(null)
    setNetwork(NETWORKS.testnet)
    setNetworkHealthy(true)
    setError(null)
  }

  const value: WalletContextType = {
    publicKey,
    network,
    networkHealthy,
    loading,
    error,
    connect,
    disconnect,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}