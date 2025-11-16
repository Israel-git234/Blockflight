import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useMarketData } from '../lib/useMarketData'

interface CruiseModeProps {
  account: string | null
  chainId: string | null
}

interface Stake {
  id: number
  amount: number
  startTime: Date
  duration: number // days
  startPrice: number
  currentValue: number
  trend: 'up' | 'down' | 'neutral'
  status: 'active' | 'completed' | 'claimed'
}

export default function CruiseMode({ account, chainId }: CruiseModeProps) {
  // Staking state
  const [stakeAmount, setStakeAmount] = useState('1.0')
  const [stakeDuration, setStakeDuration] = useState(3) // days
  const [balance, setBalance] = useState(5.2847)
  const [activeStakes, setActiveStakes] = useState<Stake[]>([
    {
      id: 1,
      amount: 2.5,
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      duration: 7,
      startPrice: 2400,
      currentValue: 2.8,
      trend: 'up',
      status: 'active'
    },
    {
      id: 2,
      amount: 1.0,
      startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      duration: 3,
      startPrice: 2450,
      currentValue: 0.95,
      trend: 'down',
      status: 'active'
    }
  ])

  // Market data
  const { priceUsd: ethPrice, emaShort, emaLong, volatility, health } = useMarketData(15000)
  const [priceHistory, setPriceHistory] = useState<number[]>([2400, 2420, 2445, 2456.78])
  const [totalStaked, setTotalStaked] = useState(1247.5)
  const [totalRewards, setTotalRewards] = useState(89.3)
  const [apy, setApy] = useState(12.5)
  const [stakers, setStakers] = useState(2847)
  const globalTrend = useMemo<'bullish' | 'bearish' | 'sideways'>(() => {
    if (emaShort > emaLong * 1.01) return 'bullish'
    if (emaShort < emaLong * 0.99) return 'bearish'
    return 'sideways'
  }, [emaShort, emaLong])

  // Dynamic APY calculation based on market conditions
  const dynamicApy = useMemo(() => {
    const baseApy = 8.0
    const volatilityBonus = volatility * 20 // Higher volatility = higher APY
    const trendBonus = globalTrend === 'bullish' ? 3.0 : globalTrend === 'bearish' ? 1.5 : 2.0
    const stakingBonus = Math.min(5.0, (totalStaked / 1000) * 2) // More staked = higher APY
    return Math.min(25.0, baseApy + volatilityBonus + trendBonus + stakingBonus)
  }, [volatility, globalTrend, totalStaked])

  // Update APY in real-time
  useEffect(() => {
    setApy(dynamicApy)
  }, [dynamicApy])

  // Visual flight position for cruise plane: starts near mid, drifts with trend/return
  const cruiseAltitude = useMemo(() => {
    // Normalize relative price to EMA long to a band [-1, +1]
    const rel = (ethPrice - emaLong) / Math.max(1, emaLong)
    // dampened by volatility so it moves slower
    const scaled = Math.max(-1, Math.min(1, rel / Math.max(0.15, (volatility * 6))))
    // map to 0..100 where 50 is breakeven
    return 50 + scaled * 45
  }, [ethPrice, emaLong, volatility])

  // Slow forward-moving trajectory points (0..100 altitude scale)
  const [cruisePoints, setCruisePoints] = useState<number[]>([])
  const lastAltRef = useRef<number>(50)

  useEffect(() => {
    const id = setInterval(() => {
      const target = cruiseAltitude
      const prev = lastAltRef.current
      const next = prev + (target - prev) * 0.08 // ease toward target slowly
      lastAltRef.current = next
      setCruisePoints(arr => {
        const a = [...arr, Math.max(0, Math.min(100, next))]
        return a.length > 220 ? a.slice(a.length - 220) : a
      })
    }, 600)
    return () => clearInterval(id)
  }, [cruiseAltitude])

  const cruiseSvg = useMemo(() => {
    if (cruisePoints.length === 0) return { line: '', x: 60, y: 80 }
    const maxSamples = Math.max(2, cruisePoints.length)
    const stepX = 900 / (maxSamples - 1) // leave 100px margins total
    let d = ''
    let x = 60
    for (let i = 0; i < cruisePoints.length; i++) {
      x = 60 + i * stepX
      const alt = cruisePoints[i] // 0..100
      const y = 160 - alt * 1.6 // map to 0..160
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
    }
    const lastAlt = cruisePoints[cruisePoints.length - 1]
    const planeY = 160 - lastAlt * 1.6
    return { line: d, x, y: planeY }
  }, [cruisePoints])

  // Track price history for UI context
  useEffect(() => {
    setPriceHistory(history => [...history.slice(-23), ethPrice])
  }, [ethPrice])

  // Update stake values based on market movement
  useEffect(() => {
    setActiveStakes(stakes => stakes.map(stake => {
      if (stake.status !== 'active') return stake
      
      const priceChange = (ethPrice - stake.startPrice) / stake.startPrice
      const timeElapsed = (Date.now() - stake.startTime.getTime()) / (1000 * 60 * 60 * 24) // days
      const timeProgress = Math.min(timeElapsed / stake.duration, 1)
      
      // Market trend affects value growth/decay
      let trendMultiplier = 1
      if (priceChange > 0.05) { // Strong uptrend
        trendMultiplier = 1 + (priceChange * 2) // Amplified gains
        stake.trend = 'up'
      } else if (priceChange < -0.05) { // Strong downtrend
        trendMultiplier = 1 + (priceChange * 1.5) // Amplified losses
        stake.trend = 'down'
      } else {
        trendMultiplier = 1 + (priceChange * 0.5) // Muted movement
        stake.trend = 'neutral'
      }
      
      // Time decay factor - longer stakes have higher potential but more risk
      const timeBonus = 1 + (stake.duration / 30) * 0.1 // +10% per month potential
      
      // Calculate current value
      const baseValue = stake.amount * trendMultiplier * timeBonus
      const volAdj = Math.min(0.15, volatility * 5)
      const volatilityRisk = (Math.random() * volAdj) - (volAdj / 2)
      
      stake.currentValue = Math.max(0.1, baseValue * (1 + volatilityRisk))
      
      return stake
    }))
  }, [ethPrice])

  const startCruise = async () => {
    if (!account) {
      alert('Please connect your wallet first!')
      return
    }
    
    const amount = parseFloat(stakeAmount)
    if (amount > balance) {
      alert('Insufficient balance!')
      return
    }
    
    // Create new stake
    const newStake: Stake = {
      id: Date.now(),
      amount,
      startTime: new Date(),
      duration: stakeDuration,
      startPrice: ethPrice,
      currentValue: amount,
      trend: 'neutral',
      status: 'active'
    }
    
    setActiveStakes(prev => [...prev, newStake])
    setBalance(prev => prev - amount)
    setStakeAmount('')
  }

  const claimStake = (stakeId: number) => {
    setActiveStakes(stakes => stakes.map(stake => {
      if (stake.id === stakeId && stake.status === 'active') {
        setBalance(prev => prev + stake.currentValue)
        return { ...stake, status: 'claimed' as const }
      }
      return stake
    }))
  }

  const calculateProjectedReturn = () => {
    const amount = parseFloat(stakeAmount) || 0
    const duration = stakeDuration
    
    // Base return calculation
    const baseReturn = amount * (1 + (duration / 30) * 0.15) // 15% per month base
    
    // Market trend adjustment
    let trendMultiplier = 1
    if (globalTrend === 'bullish') trendMultiplier = 1.2
    else if (globalTrend === 'bearish') trendMultiplier = 0.8
    
    return baseReturn * trendMultiplier
  }

  const getTimeRemaining = (stake: Stake) => {
    const endTime = new Date(stake.startTime.getTime() + stake.duration * 24 * 60 * 60 * 1000)
    const remaining = endTime.getTime() - Date.now()
    
    if (remaining <= 0) return 'Completed'
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    return `${days}d ${hours}h remaining`
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      default: return '📊'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#22c55e'
      case 'down': return '#ef4444'
      default: return '#f59e0b'
    }
  }

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    stakingPanel: {
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1.5rem',
      padding: '2rem',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      height: 'fit-content'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      background: 'linear-gradient(45deg, #3b82f6, #06b6d4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textAlign: 'center' as const
    },
    subtitle: {
      fontSize: '1rem',
      color: '#d1d5db',
      textAlign: 'center' as const,
      marginBottom: '2rem'
    },
    section: {
      marginBottom: '2rem'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#3b82f6',
      marginBottom: '1rem'
    },
    input: {
      background: 'rgba(0, 0, 0, 0.5)',
      border: '1px solid rgba(59, 130, 246, 0.5)',
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      color: 'white',
      fontSize: '1rem',
      width: '100%',
      marginBottom: '1rem'
    },
    select: {
      background: 'rgba(0, 0, 0, 0.5)',
      border: '1px solid rgba(59, 130, 246, 0.5)',
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      color: 'white',
      fontSize: '1rem',
      width: '100%',
      marginBottom: '1rem'
    },
    durationButtons: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    durationButton: {
      flex: 1,
      background: 'rgba(59, 130, 246, 0.3)',
      border: '1px solid rgba(59, 130, 246, 0.5)',
      borderRadius: '0.5rem',
      padding: '0.75rem',
      color: 'white',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease'
    },
    selectedDuration: {
      background: 'rgba(59, 130, 246, 0.6)',
      borderColor: '#3b82f6'
    },
    projectedReturn: {
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '1rem'
    },
    marketTrend: {
      background: 'rgba(124, 58, 237, 0.1)',
      border: '1px solid rgba(124, 58, 237, 0.3)',
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '2rem'
    },
    primaryButton: {
      background: 'linear-gradient(45deg, #3b82f6, #06b6d4)',
      border: 'none',
      borderRadius: '0.75rem',
      padding: '1rem 2rem',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '1rem',
      width: '100%',
      transition: 'all 0.2s ease'
    },
    disabledButton: {
      background: 'rgba(107, 114, 128, 0.5)',
      cursor: 'not-allowed',
      opacity: 0.5
    },
    stakesPanel: {
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1.5rem',
      padding: '2rem',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    stakeCard: {
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1rem',
      border: '1px solid rgba(59, 130, 246, 0.2)'
    },
    stakeHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    stakeAmount: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white'
    },
    stakeValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    profitValue: {
      color: '#22c55e'
    },
    lossValue: {
      color: '#ef4444'
    },
    stakeDetails: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      fontSize: '0.875rem',
      color: '#d1d5db',
      marginBottom: '1rem'
    },
    claimButton: {
      background: 'linear-gradient(45deg, #10b981, #059669)',
      border: 'none',
      borderRadius: '0.5rem',
      padding: '0.75rem 1.5rem',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease'
    },
    completedBadge: {
      background: 'rgba(34, 197, 94, 0.2)',
      color: '#22c55e',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      fontWeight: 'bold'
    }
  }

  return (
    <div style={styles.container}>
      {/* Staking Panel */}
      <div style={styles.stakingPanel}>
        <h2 style={styles.title}>🚢 Cruise Mode</h2>
        <p style={styles.subtitle}>
          Long-term prediction staking. Ride the market waves and amplify your gains over time.
        </p>

        {/* Impressive Staking Statistics */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.1) 0%, rgba(14, 116, 144, 0.1) 100%)',
          border: '1px solid rgba(8, 145, 178, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0891b2', marginBottom: '4px' }}>
                {apy.toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Dynamic APY</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e', marginBottom: '4px' }}>
                ${totalStaked.toFixed(1)}M
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Staked</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
                ${totalRewards.toFixed(1)}M
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Rewards Paid</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '4px' }}>
                {stakers.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Active Stakers</div>
            </div>
          </div>
          
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.3)', 
            borderRadius: '8px', 
            padding: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Market Trend: <span style={{ 
                color: globalTrend === 'bullish' ? '#22c55e' : globalTrend === 'bearish' ? '#ef4444' : '#f59e0b',
                fontWeight: 'bold'
              }}>
                {globalTrend === 'bullish' ? '📈 Bullish' : globalTrend === 'bearish' ? '📉 Bearish' : '📊 Sideways'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Volatility: <span style={{ 
                color: volatility > 0.02 ? '#ef4444' : volatility > 0.01 ? '#f59e0b' : '#22c55e',
                fontWeight: 'bold'
              }}>
                {(volatility * 100).toFixed(2)}%
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              ETH: <span style={{ color: '#0891b2', fontWeight: 'bold' }}>${ethPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Cruise plane visual */}
        <div style={{ position: 'relative', height: 160, marginBottom: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(2,6,23,0.5)' }}>
          <svg viewBox="0 0 1000 160" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
            <defs>
              <pattern id="cg" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="1" />
              </pattern>
              <linearGradient id="cruiseLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(34,197,94,0.9)" />
                <stop offset="100%" stopColor="rgba(234,179,8,0.9)" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#cg)" />
            {/* mid breakeven line */}
            <line x1="0" y1="80" x2="1000" y2="80" stroke="rgba(148,163,184,0.6)" strokeDasharray="6,4" />
            {/* profit band */}
            <rect x="0" y="0" width="1000" height="80" fill="rgba(34,197,94,0.07)" />
            {/* loss band */}
            <rect x="0" y="80" width="1000" height="80" fill="rgba(239,68,68,0.07)" />
            {/* forward-moving line */}
            {cruiseSvg.line && (
              <path d={cruiseSvg.line} fill="none" stroke="url(#cruiseLine)" strokeWidth="2.5" />
            )}
          </svg>
          <div style={{ position: 'absolute', left: `${cruiseSvg.x}px`, top: `${cruiseSvg.y}px`, transform: 'translate(-50%, -50%)' }}>
            <span style={{ fontSize: 22 }}>{cruiseAltitude >= 50 ? '✈️' : '🛬'}</span>
          </div>
          <div style={{ position: 'absolute', right: 8, top: 8, fontSize: 12, color: '#9ca3af' }}>
            {cruiseAltitude >= 50 ? 'Profit zone' : 'Loss zone'}
          </div>
        </div>

        {/* Slow plane visualization (trend flight) */}
        <div style={{
          marginBottom: '1.5rem',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '0.75rem',
          overflow: 'hidden'
        }}>
          <svg viewBox="0 0 600 160" width="100%" height="160">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4"/>
                <stop offset="100%" stopColor="#7c3aed"/>
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="600" height="160" fill="rgba(2,6,23,0.4)"/>
            <g opacity="0.2">
              {[1,2,3].map((i) => (
                <line key={i} x1="0" y1={160 - i*40} x2="600" y2={160 - i*40} stroke="#334155" strokeDasharray="4 4" />
              ))}
            </g>
            {/* Trend path */}
            <path d={`M 20 ${120 - Math.min(40, Math.max(-40, (emaShort-emaLong))) } L 580 ${120 - Math.min(40, Math.max(-40, (emaShort-emaLong))) }`} stroke="url(#g)" strokeWidth="2" fill="none" />
            {/* Plane icon */}
            <text x="560" y={124 - Math.min(40, Math.max(-40, (emaShort-emaLong))) } fontSize="18">✈️</text>
          </svg>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 1rem', fontSize:12, color:'#9ca3af' }}>
            <div>EMA Short {emaShort.toFixed(2)}</div>
            <div>EMA Long {emaLong.toFixed(2)}</div>
            <div>Volatility {(volatility*100).toFixed(2)}%</div>
          </div>
        </div>

        {/* Market Trend Indicator */}
        <div style={styles.marketTrend}>
          <div style={styles.sectionTitle}>📊 Market Analysis</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span>ETH Price:</span>
            <span style={{ fontWeight: 'bold' }}>${ethPrice.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span>Trend (EMA):</span>
            <span style={{ fontWeight: 'bold', color: globalTrend === 'bullish' ? '#22c55e' : globalTrend === 'bearish' ? '#ef4444' : '#f59e0b' }}>
              {emaShort.toFixed(2)} / {emaLong.toFixed(2)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span>Volatility:</span>
            <span style={{ fontWeight: 'bold' }}>{(volatility * 100).toFixed(2)}%</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: health.healthy ? '#22c55e' : '#f59e0b' }}>
            Source: {health.source}{!health.healthy ? ' (fallback)' : ''}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span>Global Trend:</span>
            <span style={{ 
              fontWeight: 'bold',
              color: globalTrend === 'bullish' ? '#22c55e' : globalTrend === 'bearish' ? '#ef4444' : '#f59e0b'
            }}>
              {globalTrend === 'bullish' ? '🚀 Bullish' : globalTrend === 'bearish' ? '📉 Bearish' : '📊 Sideways'}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '1rem' }}>
            💡 Bullish trends amplify gains, bearish trends increase risk but offer recovery potential
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>💰 Stake Amount</div>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Enter amount to stake"
            step="0.1"
            min="0.1"
            max={balance}
            style={styles.input}
          />
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            Balance: {balance.toFixed(4)} ETH
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>⏰ Cruise Duration</div>
          <div style={styles.durationButtons}>
            {[1, 3, 7, 14].map(days => (
              <button
                key={days}
                onClick={() => setStakeDuration(days)}
                style={{
                  ...styles.durationButton,
                  ...(stakeDuration === days ? styles.selectedDuration : {})
                }}
              >
                {days}d
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            Longer cruises = higher potential returns but more market risk
          </div>
        </div>

        {/* Projected Return */}
        <div style={styles.projectedReturn}>
          <div style={{ fontSize: '0.875rem', color: '#10b981', marginBottom: '0.5rem' }}>
            📈 Projected Return
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#22c55e' }}>
            {calculateProjectedReturn().toFixed(4)} ETH
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
            Based on current market trend and duration
          </div>
        </div>

        <button
          onClick={startCruise}
          disabled={!stakeAmount || parseFloat(stakeAmount) > balance || !account}
          style={{
            ...styles.primaryButton,
            ...((!stakeAmount || parseFloat(stakeAmount) > balance || !account) ? styles.disabledButton : {})
          }}
        >
          {!account ? 'Connect Wallet' : 'Start Cruise 🚢'}
        </button>
      </div>

      {/* Active Stakes Panel */}
      <div style={styles.stakesPanel}>
        <h3 style={styles.sectionTitle}>🎯 Your Active Cruises</h3>
        
        {activeStakes.length === 0 ? (
          <div style={{ 
            textAlign: 'center' as const, 
            color: '#9ca3af', 
            padding: '3rem 0',
            fontSize: '1.125rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌊</div>
            No active cruises yet. Start your first cruise to ride the market waves!
          </div>
        ) : (
          activeStakes.map(stake => (
            <div key={stake.id} style={styles.stakeCard}>
              <div style={styles.stakeHeader}>
                <div>
                  <div style={styles.stakeAmount}>
                    {stake.amount.toFixed(2)} ETH Staked
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    {stake.duration} day cruise
                  </div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{
                    ...styles.stakeValue,
                    ...(stake.currentValue > stake.amount ? styles.profitValue : styles.lossValue)
                  }}>
                    {stake.currentValue.toFixed(4)} ETH
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem',
                    color: stake.currentValue > stake.amount ? '#22c55e' : '#ef4444'
                  }}>
                    {stake.currentValue > stake.amount ? '+' : ''}{((stake.currentValue - stake.amount) / stake.amount * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div style={styles.stakeDetails}>
                <div>
                  <div style={{ color: '#9ca3af' }}>Started:</div>
                  <div>{stake.startPrice.toFixed(2)} ETH</div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af' }}>Current:</div>
                  <div>${ethPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af' }}>Trend:</div>
                  <div style={{ color: getTrendColor(stake.trend) }}>
                    {getTrendIcon(stake.trend)} {stake.trend.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af' }}>Status:</div>
                  <div>{getTimeRemaining(stake)}</div>
                </div>
              </div>

              {stake.status === 'active' && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => claimStake(stake.id)}
                    style={styles.claimButton}
                  >
                    Claim Now 💰
                  </button>
                  <div style={{ 
                    flex: 1, 
                    fontSize: '0.75rem', 
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    ⚠️ Early claiming available anytime, but longer holds may yield better returns
                  </div>
                </div>
              )}

              {stake.status === 'claimed' && (
                <div style={styles.completedBadge}>
                  ✅ Claimed
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}