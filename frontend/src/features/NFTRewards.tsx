import React from 'react'

interface NFTRewardsProps {
  account: string | null
  chainId: string | null
}

export default function NFTRewards({ account, chainId }: NFTRewardsProps) {
  const isEligible = !!account
  const sampleBadges = [
    { id: 'pilot-1', name: 'First Flight', cond: 'Cash out above 1.50×', owned: false },
    { id: 'ace-5x', name: 'Ace 5×', cond: 'Reach 5.00× in a round', owned: false },
    { id: 'legend-10x', name: 'Legend 10×', cond: 'Reach 10.00× in a round', owned: false }
  ]
  const styles = {
    container: {
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1.5rem',
      padding: '3rem',
      textAlign: 'center' as const,
      border: '1px solid rgba(168, 85, 247, 0.3)'
    },
    icon: {
      fontSize: '4rem',
      marginBottom: '1rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      background: 'linear-gradient(45deg, #a855f7, #ec4899)',
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
      background: 'linear-gradient(45deg, #a855f7, #ec4899)',
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
      <div style={styles.icon}>🏆</div>
      <h2 style={styles.title}>NFT Rewards</h2>
      <p style={styles.description}>
        Earn unique, evolving NFTs for achieving high multipliers and big wins. 
        Collect rare pilot badges, plane designs, and exclusive rewards that showcase your BlockFlight achievements.
      </p>
      {!isEligible && (
        <div style={{ color: '#f59e0b', marginBottom: '1rem' }}>Connect wallet to preview reward eligibility.</div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', margin: '0 auto', maxWidth: 900 }}>
        {sampleBadges.map(b => (
          <div key={b.id} style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(0,0,0,0.35)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎖️</div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{b.name}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{b.cond}</div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#a78bfa' }}>{isEligible ? 'Eligible (demo)' : 'Unknown (connect)'} </div>
            <button disabled style={{ marginTop: 10, padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(168,85,247,0.35)', background: 'rgba(168,85,247,0.15)', color: 'white' }}>Mint (soon)</button>
          </div>
        ))}
      </div>
    </div>
  )
}

