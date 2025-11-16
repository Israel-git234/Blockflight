import React, { useState, useEffect } from 'react'

interface WalletConnectProps {
  account: string | null
  setAccount: (account: string | null) => void
  chainId?: string | null
  setChainId?: (chainId: string | null) => void
}

export default function WalletConnect({ account, setAccount, chainId, setChainId }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<'correct' | 'wrong' | 'unknown'>('unknown')

  // BlockDAG Network Configuration
  const BLOCKDAG_NETWORK = {
    chainId: '0x413', // 1043 in hex
    chainName: 'BlockDAG Network',
    nativeCurrency: {
      name: 'BlockDAG',
      symbol: 'BDAG',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.blockdag.network', 'https://rpc-testnet.blockdag.network'],
    blockExplorerUrls: ['https://explorer.blockdag.network'],
    iconUrls: ['https://blockdag.network/favicon.ico']
  }

  // Check network status
  useEffect(() => {
    if (chainId) {
      setNetworkStatus(chainId === '0x413' ? 'correct' : 'wrong')
    } else {
      setNetworkStatus('unknown')
    }
  }, [chainId])

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert(`🚫 MetaMask Required\n\nBlockDAG Network requires MetaMask to connect.\n\nPlease:\n1. Install MetaMask extension\n2. Create or import a wallet\n3. Refresh this page\n\nGet MetaMask: https://metamask.io`)
      return
    }

    setIsConnecting(true)
    try {
      // prefer the MetaMask provider when multiple are injected
      const eth: any = (window as any).ethereum?.providers
        ? (window as any).ethereum.providers.find((p: any) => p.isMetaMask) || (window as any).ethereum
        : (window as any).ethereum

      // if locked, prompt unlock via permissions first
      try {
        // this helps when site access is disabled (4100) or locked
        await eth.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        })
      } catch (_) {
        // ignore; continue to eth_requestAccounts
      }

      // request accounts; handle MM "DApp interaction is disabled" (code 4100)
      const accounts = await eth.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
      
      // Get current chain
      const currentChainId = await eth.request({ method: 'eth_chainId' })
      if (setChainId) setChainId(currentChainId)
      
      // Switch to BlockDAG network if needed
      await switchToBlockDAG()
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      if (error?.code === 4100) {
        alert(`🔒 DApp Connection Disabled (Code 4100)\n\nBlockDAG Network needs permission to connect.\n\nFix this by:\n1. Open MetaMask\n2. Go to Settings → Security & Privacy → Connected sites\n3. Remove localhost:5173 (if listed)\n4. Ensure "Allow websites to connect" is enabled\n5. Make sure your wallet is unlocked\n6. Try connecting again\n\nThis is a demo app - connection should work!`)
      } else if (error?.code === 4001) {
        alert(`❌ Connection Rejected\n\nYou declined the connection request in MetaMask.\n\nTo use BlockDAG Network features:\n1. Click "Connect Wallet" again\n2. Approve the connection in MetaMask\n3. Approve adding/switching to BlockDAG Network`)
      } else {
        const msg = error?.message || 'Unknown error'
        alert(`🚫 Connection Failed\n\nBlockDAG Network couldn't connect to your wallet.\n\nError: ${msg}\n\nTry:\n1. Refreshing the page\n2. Restarting MetaMask\n3. Using a different browser`)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const switchToBlockDAG = async () => {
    try {
      const result = await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BLOCKDAG_NETWORK.chainId }],
      })
      
      // Update chain ID after successful switch
      if (setChainId) setChainId(BLOCKDAG_NETWORK.chainId)
      
      alert(`✅ Connected to BlockDAG Network!\n\n🔗 Network: ${BLOCKDAG_NETWORK.chainName}\n💰 Currency: ${BLOCKDAG_NETWORK.nativeCurrency.symbol}\n🌐 Chain ID: ${parseInt(BLOCKDAG_NETWORK.chainId, 16)}\n\nYou're ready to use BlockDAG features!`)
      
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BLOCKDAG_NETWORK],
          })
          
          // Update chain ID after successful addition
          if (setChainId) setChainId(BLOCKDAG_NETWORK.chainId)
          
          alert(`🎉 BlockDAG Network Added!\n\n✅ Successfully added BlockDAG Network to MetaMask\n🔗 Network: ${BLOCKDAG_NETWORK.chainName}\n💰 Currency: ${BLOCKDAG_NETWORK.nativeCurrency.symbol}\n🌐 RPC: ${BLOCKDAG_NETWORK.rpcUrls[0]}\n📊 Explorer: ${BLOCKDAG_NETWORK.blockExplorerUrls[0]}\n\nYou can now use all BlockDAG features!`)
          
        } catch (addError: any) {
          console.error('Failed to add BlockDAG network:', addError)
          const msg = addError?.message || 'Unknown error'
          alert(`❌ Failed to Add BlockDAG Network\n\nCouldn't add BlockDAG Network to MetaMask.\n\nError: ${msg}\n\nYou can manually add it:\n• Network Name: ${BLOCKDAG_NETWORK.chainName}\n• RPC URL: ${BLOCKDAG_NETWORK.rpcUrls[0]}\n• Chain ID: ${parseInt(BLOCKDAG_NETWORK.chainId, 16)}\n• Symbol: ${BLOCKDAG_NETWORK.nativeCurrency.symbol}`)
        }
      } else if (switchError.code === 4001) {
        alert(`⚠️ Network Switch Cancelled\n\nYou declined switching to BlockDAG Network.\n\nSome features may not work on other networks.\n\nTo switch later:\n1. Open MetaMask\n2. Click the network dropdown\n3. Select "BlockDAG Network"`)
      } else {
        const msg = switchError?.message || 'Unknown error'
        alert(`⚠️ Network Switch Failed\n\nCouldn't switch to BlockDAG Network.\n\nError: ${msg}\n\nTry:\n1. Refreshing the page\n2. Switching networks manually in MetaMask\n3. Re-connecting your wallet`)
      }
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const styles = {
    connectButton: {
      background: 'linear-gradient(45deg, #0891b2, #0e7490)',
      border: 'none',
      borderRadius: '0.75rem',
      padding: '0.75rem 1.5rem',
      color: 'white',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)'
    },
    connectedContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      background: 'rgba(8, 145, 178, 0.1)',
      borderRadius: '0.75rem',
      padding: '0.5rem 1rem',
      border: '1px solid rgba(8, 145, 178, 0.3)'
    },
    addressDisplay: {
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      color: '#0891b2',
      fontWeight: 'bold'
    },
    networkDisplay: {
      fontSize: '0.75rem',
      marginTop: '0.125rem'
    },
    networkCorrect: {
      color: '#10b981',
      fontWeight: '600'
    },
    networkWrong: {
      color: '#f59e0b',
      fontWeight: '600'
    },
    networkUnknown: {
      color: '#6b7280',
      fontWeight: '500'
    },
    switchButton: {
      background: 'rgba(245, 158, 11, 0.2)',
      border: '1px solid rgba(245, 158, 11, 0.4)',
      borderRadius: '0.5rem',
      padding: '0.25rem 0.75rem',
      color: '#f59e0b',
      cursor: 'pointer',
      fontSize: '0.75rem',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    },
    disconnectButton: {
      background: 'rgba(239, 68, 68, 0.2)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '0.5rem',
      padding: '0.25rem 0.75rem',
      color: '#ef4444',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease'
    },
    walletIcon: {
      fontSize: '1.25rem'
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#10b981',
      animation: 'pulse 2s infinite'
    }
  }

  if (account) {
    return (
      <div style={styles.connectedContainer}>
        <div style={styles.statusDot}></div>
        <div style={styles.walletIcon}>🔗</div>
        <div>
          <div style={styles.addressDisplay}>
            {shortenAddress(account)}
          </div>
          <div style={styles.networkDisplay}>
            {networkStatus === 'correct' ? (
              <span style={styles.networkCorrect}>✅ BlockDAG Network</span>
            ) : networkStatus === 'wrong' ? (
              <span style={styles.networkWrong}>⚠️ Wrong Network</span>
            ) : (
              <span style={styles.networkUnknown}>🔍 Checking...</span>
            )}
          </div>
        </div>
        {networkStatus === 'wrong' && (
          <button 
            onClick={switchToBlockDAG}
            style={styles.switchButton}
          >
            Switch to BlockDAG
          </button>
        )}
        <button 
          onClick={disconnectWallet}
          style={styles.disconnectButton}
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button 
      onClick={connectWallet}
      disabled={isConnecting}
      style={{
        ...styles.connectButton,
        opacity: isConnecting ? 0.7 : 1,
        cursor: isConnecting ? 'not-allowed' : 'pointer'
      }}
    >
      <div style={styles.walletIcon}>🔗</div>
      {isConnecting ? 'Connecting to BlockDAG...' : 'Connect to BlockDAG Network'}
    </button>
  )
}

