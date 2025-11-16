import React from 'react'

interface Feature {
  id: string
  name: string
  description: string
  icon: string
  status: 'Live' | 'Coming Soon'
  color: string // gradient tail e.g. from-red-500 to-orange-500
}

interface FeatureSelectorProps {
  features: Feature[]
  selectedFeature: string
  onSelectFeature: (id: string) => void
}

export default function FeatureSelector({ features, selectedFeature, onSelectFeature }: FeatureSelectorProps) {
  const styles = {
    container: {
      background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.05) 0%, rgba(14, 116, 144, 0.05) 100%)',
      borderRadius: '1.5rem',
      padding: '2rem',
      border: '1px solid rgba(8, 145, 178, 0.2)',
      backdropFilter: 'blur(10px)'
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      background: 'linear-gradient(45deg, #0891b2, #0e7490)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem',
      textAlign: 'center' as const
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1rem',
      textAlign: 'center' as const,
      marginBottom: '2rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: {
      padding: '1.5rem',
      borderRadius: '1rem',
      border: '1px solid rgba(8, 145, 178, 0.2)',
      background: 'rgba(0, 0, 0, 0.4)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    cardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 20px 40px rgba(8, 145, 178, 0.15)',
      border: '1px solid rgba(8, 145, 178, 0.4)'
    },
    selected: {
      border: '2px solid rgba(8, 145, 178, 0.8)',
      boxShadow: '0 0 30px rgba(8, 145, 178, 0.3)',
      background: 'rgba(8, 145, 178, 0.1)'
    },
    cardGradient: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, #0891b2, #0e7490, #0891b2)',
      opacity: 0.8
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem'
    },
    icon: {
      fontSize: '2rem',
      width: '3rem',
      height: '3rem',
      borderRadius: '0.75rem',
      background: 'rgba(8, 145, 178, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(8, 145, 178, 0.2)'
    },
    name: {
      fontWeight: 'bold' as const,
      fontSize: '1.25rem',
      color: '#ffffff',
      margin: 0
    },
    description: {
      color: '#9ca3af',
      fontSize: '0.95rem',
      lineHeight: '1.5',
      marginBottom: '1rem'
    },
    status: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '2rem',
      fontSize: '0.875rem',
      fontWeight: '600' as const,
      background: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      color: '#10b981'
    },
    soon: {
      background: 'rgba(245, 158, 11, 0.15)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      color: '#f59e0b'
    },
    statusDot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: 'currentColor'
    },
    features: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
      marginTop: '1rem'
    },
    featureTag: {
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      background: 'rgba(8, 145, 178, 0.1)',
      border: '1px solid rgba(8, 145, 178, 0.2)',
      color: '#0891b2'
    }
  }

  // Feature tags for each feature
  const getFeatureTags = (featureId: string) => {
    const tags: { [key: string]: string[] } = {
      'market-aviator': ['Crash Game', 'Real-time', 'Volatility'],
      'community-market': ['Custom Events', 'Social', 'Governance'],
      'cruise-mode': ['Staking', 'Long-term', 'Passive'],
      'trading-pools': ['Collaborative', 'Shared Risk', 'Community'],
      'nft-rewards': ['Gamification', 'Achievements', 'Collectibles']
    }
    return tags[featureId] || []
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚀 BlockDAG Trading Platform</h2>
      <p style={styles.subtitle}>
        Advanced prediction markets powered by BlockDAG technology
      </p>
      
      <div style={styles.grid}>
        {features.map((f) => (
          <div
            key={f.id}
            className="feature-card"
            onClick={() => onSelectFeature(f.id)}
        style={{
              ...styles.card,
              ...(selectedFeature === f.id ? styles.selected : {}),
            }}
            onMouseEnter={(e) => {
              if (selectedFeature !== f.id) {
                Object.assign(e.currentTarget.style, styles.cardHover)
              }
            }}
            onMouseLeave={(e) => {
              if (selectedFeature !== f.id) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.border = '1px solid rgba(8, 145, 178, 0.2)'
              }
            }}
          >
            <div style={styles.cardGradient} />
            
            <div style={styles.header}>
              <div style={styles.icon}>{f.icon}</div>
              <div>
                <div style={styles.name}>{f.name}</div>
                      </div>
                    </div>

            <div style={styles.description}>{f.description}</div>
            
            <div style={styles.features}>
              {getFeatureTags(f.id).map((tag, index) => (
                <span key={index} style={styles.featureTag}>
                  {tag}
                </span>
              ))}
                    </div>

            <div style={{
              ...styles.status,
              ...(f.status === 'Coming Soon' ? styles.soon : {})
            }}>
              <div style={styles.statusDot} />
              {f.status}
                      </div>
                    </div>
        ))}
      </div>
    </div>
  )
}


