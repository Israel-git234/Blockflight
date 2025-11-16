import React from 'react'

interface TradingPoolsProps {
  account: string | null
  chainId: string | null
}

export default function TradingPools({ account, chainId }: TradingPoolsProps) {
  const styles = {
    container: {
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1.5rem',
      padding: '3rem',
      textAlign: 'center' as const,
      border: '1px solid rgba(16, 185, 129, 0.3)'
    },
    icon: {
      fontSize: '4rem',
      marginBottom: '1rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      background: 'linear-gradient(45deg, #10b981, #059669)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    description: {
      fontSize: '1.125rem',
      color: '#d1d5db',
      marginBottom: '2rem',
      maxWidth: '600px',
      margin: '0 auto 2rem auto'
    },
    comingSoon: {
      background: 'linear-gradient(45deg, #10b981, #059669)',
      color: 'white',
      padding: '1rem 2rem',
      borderRadius: '1rem',
      fontSize: '1.25rem',
      fontWeight: 'bold',
      border: 'none',
      cursor: 'default'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.icon}>🏊</div>
      <h2 style={styles.title}>Trading Pools</h2>
      <p style={styles.description}>
        Join collaborative prediction pools where multiple players combine their predictions and share rewards. 
        Pool your knowledge and resources for better market insights and reduced individual risk.
      </p>
      <div style={styles.comingSoon}>Coming Soon</div>
    </div>
  )
}

