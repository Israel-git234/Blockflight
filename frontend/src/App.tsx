import React, { useState, useEffect, lazy, Suspense } from 'react'

// Wave 2: Code splitting for scalability
const MarketAviator = lazy(() => import('./features/MarketAviator'))
const CruiseMode = lazy(() => import('./features/CruiseMode'))
const TradingPools = lazy(() => import('./features/TradingPools'))
const NFTRewards = lazy(() => import('./features/NFTRewards'))
const CommunityMarket = lazy(() => import('./features/CommunityMarket'))
const AIOracle = lazy(() => import('./features/AIOracle'))
const ValueProposition = lazy(() => import('./pages/ValueProposition'))

// Components
import WalletConnect from './components/WalletConnect'
import FeatureSelector from './components/FeatureSelector'
import { NotificationsProvider } from './components/NotificationsProvider'
import NotificationBell from './components/NotificationBell'
import LoadingSpinner from './components/LoadingSpinner'

// Wave 2: UX Improvements
import { OnboardingTutorial } from './components/OnboardingTutorial'
import { TransactionStatus } from './components/TransactionStatus'

function App() {
  const [selectedFeature, setSelectedFeature] = useState<string>('')
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)

  // MetaMask connection handler with cleanup
  useEffect(() => {
    const eth = (window as any).ethereum
    if (!eth) return

    eth.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => { if (accounts.length > 0) setAccount(accounts[0]) })
      .catch(() => {})

    const onAccountsChanged = (accounts: string[]) => setAccount(accounts[0] || null)
    const onChainChanged = (cid: string) => setChainId(cid)

    eth.on?.('accountsChanged', onAccountsChanged)
    eth.on?.('chainChanged', onChainChanged)

    eth.request({ method: 'eth_chainId' })
      .then((cid: string) => setChainId(cid))
      .catch(() => {})

    return () => {
      try {
        eth.removeListener?.('accountsChanged', onAccountsChanged)
        eth.removeListener?.('chainChanged', onChainChanged)
      } catch {}
    }
  }, [])

  const features: Array<{ id: string; name: string; description: string; icon: string; status: 'Live' | 'Coming Soon'; color: string }> = [
    {
      id: 'market-aviator',
      name: 'Market Aviator',
      description: 'Predict market volatility in this crash game',
      icon: '✈️',
      status: 'Live',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'ai-oracle',
      name: 'AI Oracle',
      description: 'AI-powered market analysis and cross-chain predictions',
      icon: '🔮',
      status: 'Live',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'community-market',
      name: 'Community Market',
      description: 'Create and bet on custom real‑world predictions',
      icon: '🧠',
      status: 'Live',
      color: 'from-amber-500 to-fuchsia-500'
    },
    {
      id: 'cruise-mode',
      name: 'Cruise Mode',
      description: 'Long-term staking based on market trends',
      icon: '🚢',
      status: 'Live',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'trading-pools',
      name: 'Trading Pools',
      description: 'Collaborative prediction pools',
      icon: '🏊',
      status: 'Coming Soon',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'nft-rewards',
      name: 'NFT Rewards',
      description: 'Earn unique NFTs for big wins',
      icon: '🏆',
      status: 'Coming Soon',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'value-proposition',
      name: 'Why BlockFlight?',
      description: 'Learn about our unique value proposition',
      icon: '💡',
      status: 'Live',
      color: 'from-yellow-500 to-orange-500'
    }
  ]


  const renderFeature = () => {
    switch (selectedFeature) {
      case 'market-aviator':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MarketAviator account={account} chainId={chainId} />
          </Suspense>
        )
      case 'ai-oracle':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AIOracle />
          </Suspense>
        )
      case 'cruise-mode':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CruiseMode account={account} chainId={chainId} />
          </Suspense>
        )
      case 'community-market':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CommunityMarket account={account} />
          </Suspense>
        )
      case 'trading-pools':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <TradingPools account={account} chainId={chainId} />
          </Suspense>
        )
      case 'nft-rewards':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <NFTRewards account={account} chainId={chainId} />
          </Suspense>
        )
      case 'value-proposition':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ValueProposition />
          </Suspense>
        )
      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MarketAviator account={account} chainId={chainId} />
          </Suspense>
        )
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0e7490 50%, #1e293b 75%, #0f172a 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(8, 145, 178, 0.3)',
      padding: '1.5rem 0',
      position: 'sticky' as const,
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
    },
    headerContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem'
    },
    logoIcon: {
      fontSize: '3rem',
      animation: 'float 3s ease-in-out infinite',
      filter: 'drop-shadow(0 0 10px rgba(8, 145, 178, 0.5))'
    },
    logoText: {
      fontSize: '2.75rem',
      fontWeight: 'bold',
      background: 'linear-gradient(45deg, #0891b2, #0e7490, #0891b2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 30px rgba(8, 145, 178, 0.3)'
    },
    subtitle: {
      fontSize: '1rem',
      color: '#0891b2',
      fontWeight: '500',
      marginTop: '0.25rem'
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem'
    },
    networkBadge: {
      padding: '0.75rem 1.25rem',
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      background: chainId === '0x413' ? 'linear-gradient(45deg, #10b981, #059669)' : 
                  'linear-gradient(45deg, #f59e0b, #d97706)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    main: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '3rem 2rem'
    },
    featureSelectorWrapper: {
      marginBottom: '2rem'
    },
    hero: {
      textAlign: 'center' as const,
      marginBottom: '4rem',
      padding: '2rem 0'
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(45deg, #ffffff, #0891b2, #ffffff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem',
      lineHeight: '1.1'
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      color: '#9ca3af',
      maxWidth: '600px',
      margin: '0 auto 2rem',
      lineHeight: '1.6'
    },
    stats: {
      display: 'flex',
      justifyContent: 'center',
      gap: '3rem',
      marginBottom: '3rem',
      flexWrap: 'wrap' as const
    },
    stat: {
      textAlign: 'center' as const
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#0891b2',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em'
    }
  }

  return (
    <NotificationsProvider>
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>🚀</div>
            <div>
              <div style={styles.logoText}>BlockFlight</div>
              <div style={styles.subtitle}>Market-Driven Prediction Platform</div>
            </div>
          </div>
          
          {
            <div style={styles.headerRight}>
              <div style={styles.networkBadge}>
                {chainId === '0x413' ? '✅ BlockDAG' : '⚠️ Switch Network'}
              </div>
              <NotificationBell />
              <WalletConnect account={account} setAccount={setAccount} chainId={chainId} setChainId={setChainId} />
            </div>
          }
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Hero Section */}
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Advanced Trading Platform</h1>
          <p style={styles.heroSubtitle}>
            Experience the future of decentralized prediction markets with BlockDAG technology. 
            Fast, secure, and transparent trading for everyone.
          </p>
          
          <div style={styles.stats}>
            <div style={styles.stat}>
              <div style={styles.statValue}>$2.4M</div>
              <div style={styles.statLabel}>24h Volume</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>1,847</div>
              <div style={styles.statLabel}>Active Traders</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>&lt;100ms</div>
              <div style={styles.statLabel}>Transaction Speed</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>$50M+</div>
              <div style={styles.statLabel}>TVL Secured</div>
            </div>
          </div>
        </div>

        {/* Feature Selector */}
        <div style={styles.featureSelectorWrapper}>
          <FeatureSelector 
            features={features}
            selectedFeature={selectedFeature}
            onSelectFeature={setSelectedFeature}
          />
        </div>

        {/* Selected Feature */}
        {selectedFeature && renderFeature()}
      </main>


      {/* Global Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.3); }
          50% { box-shadow: 0 0 30px rgba(124, 58, 237, 0.6); }
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          overflow-x: hidden;
        }

        button:hover {
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
    </NotificationsProvider>
  )
}

export default App