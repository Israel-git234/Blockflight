import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMarketData } from '../lib/useMarketData'

type MarketAviatorProps = {
  account: string | null
  chainId: string | null
}

const MarketAviator: React.FC<MarketAviatorProps> = ({ account, chainId }) => {
  const [multiplier, setMultiplier] = useState<number>(1.0)
  const [isFlying, setIsFlying] = useState<boolean>(false)
  const [crashed, setCrashed] = useState<boolean>(false)
  const [bet, setBet] = useState<string>('0.05')
  const [autoCash, setAutoCash] = useState<string>('')
  const [cashedOut, setCashedOut] = useState<boolean>(false)
  const [balance, setBalance] = useState<number>(1.0)
  const [roundId, setRoundId] = useState<number>(1)
  const [seedCommit, setSeedCommit] = useState<string>('')
  const [seedReveal, setSeedReveal] = useState<string>('')
  const [countdown, setCountdown] = useState<number>(10)
  const [spectators, setSpectators] = useState<number>(128)
  const [flightPoints, setFlightPoints] = useState<number[]>([])
  const [marketImpact, setMarketImpact] = useState<number>(0)
  const [volatilityHistory, setVolatilityHistory] = useState<number[]>([])
  const [liveTraders, setLiveTraders] = useState<Array<{name: string, bet: number, multiplier: number}>>([])

  const { priceUsd, emaShort, emaLong, volatility, health } = useMarketData(15000)
  const startTimeRef = useRef<number | null>(null)

  // Enhanced crash probability that rewards market knowledge
  const crashProbability = useCallback(() => {
    if (!startTimeRef.current) return 0.01
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    
    // Base probability - much lower to allow for longer flights
    const base = 0.005
    
    // Market trend analysis - this is where knowledge matters!
    const trendStrength = Math.abs(emaShort - emaLong) / Math.max(1, emaLong)
    const isBullish = emaShort > emaLong
    const isBearish = emaShort < emaLong
    
    // Volatility impact - higher volatility = more predictable crashes
    const volFactor = 1 + Math.min(2.0, volatility * 30) // Reduced from 60 to 30
    
    // Trend-based crash probability - this rewards market knowledge
    let trendCrashChance = 1.0
    if (isBullish && trendStrength > 0.01) {
      // Strong bullish trend = lower crash chance (reward for recognizing uptrend)
      trendCrashChance = 0.6
    } else if (isBearish && trendStrength > 0.01) {
      // Strong bearish trend = higher crash chance (reward for recognizing downtrend)
      trendCrashChance = 1.8
    } else if (trendStrength < 0.005) {
      // Sideways market = moderate crash chance
      trendCrashChance = 1.2
    }
    
    // Multiplier risk - exponential increase but more gradual
    const multRisk = Math.pow(Math.max(0, multiplier - 1), 1.8) / 40 // Reduced from 25 to 40
    
    // Time factor - more gradual increase
    const timeFactor = 1 + elapsed / 120 // Increased from 60 to 120
    
    // Market impact - reduced influence
    const marketImpactFactor = 1 + (marketImpact * 0.2) // Reduced from 0.5 to 0.2
    
    // Calculate final probability
    const finalProb = base * volFactor * trendCrashChance * timeFactor * marketImpactFactor + multRisk
    
    // Cap the probability to allow for longer flights
    return Math.min(0.25, finalProb) // Reduced from 0.35 to 0.25
  }, [emaLong, emaShort, multiplier, volatility, marketImpact])

  // Real-time market impact tracking
  useEffect(() => {
      const interval = setInterval(() => {
      const priceChange = Math.abs((priceUsd - (priceUsd * 0.999)) / priceUsd)
      const volChange = Math.abs(volatility - (volatility * 0.95))
      const newImpact = Math.min(2, priceChange * 100 + volChange * 50)
      setMarketImpact(newImpact)
      
      // Update volatility history
      setVolatilityHistory(prev => [...prev.slice(-19), volatility])
      
      // Simulate live traders
      if (Math.random() < 0.3) {
        const traderNames = ['CryptoWhale', 'DiamondHands', 'MoonWalker', 'BlockMaster', 'RocketRider', 'ChainLink', 'DataNode', 'TokenKing']
        const newTrader = {
          name: traderNames[Math.floor(Math.random() * traderNames.length)],
          bet: Math.random() * 0.5 + 0.1,
          multiplier: multiplier
        }
        setLiveTraders(prev => [...prev.slice(-9), newTrader])
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [priceUsd, volatility, multiplier])

  useEffect(() => {
    if (!isFlying || crashed) return
    const id = setInterval(() => {
      setMultiplier(prev => {
        // Enhanced multiplier calculation that rewards market knowledge
        const trend = (emaShort - emaLong) / Math.max(1, emaLong)
        const trendStrength = Math.abs(trend)
        
        // Base increment - more conservative
        let baseInc = 0.0025
        
        // Market knowledge rewards:
        let knowledgeBonus = 1.0
        if (trend > 0.01) {
          // Strong bullish trend - reward traders who recognize this
          knowledgeBonus = 1.4 // 40% bonus for recognizing uptrend
        } else if (trend < -0.01) {
          // Strong bearish trend - slower growth (crash more likely)
          knowledgeBonus = 0.7 // 30% penalty for not recognizing downtrend
        } else if (trendStrength < 0.005) {
          // Sideways market - moderate growth
          knowledgeBonus = 1.1 // 10% bonus for recognizing sideways
        }
        
        // Volatility impact - higher volatility = more opportunity for skilled traders
        const volBonus = 1 + (volatility * 0.3) // Reduced from 0.4 to 0.3
        
        // Calculate increment with market knowledge rewards
        const inc = baseInc * knowledgeBonus * volBonus
        
        // Reduced random jitter to make it more predictable for skilled traders
        const jitter = (Math.random() - 0.5) * 0.001 // Reduced from 0.002 to 0.001
        
        const next = Math.max(1, prev + inc + jitter)
        
        // Check for crash with enhanced probability calculation
        if (next > 1.05 && Math.random() < crashProbability()) {
          setCrashed(true)
          setIsFlying(false)
          setFlightPoints(arr => {
            const a = [...arr, +next.toFixed(4)]
            return a.length > 180 ? a.slice(a.length - 180) : a
          })
          return +next.toFixed(4)
        }
        if (autoCash && parseFloat(autoCash) > 1 && next >= parseFloat(autoCash)) {
          handleCashout(next)
          setFlightPoints(arr => {
            const a = [...arr, +next.toFixed(4)]
            return a.length > 180 ? a.slice(a.length - 180) : a
          })
          return +next.toFixed(4)
        }
        const nn = +next.toFixed(4)
        setFlightPoints(arr => {
          const a = [...arr, nn]
          return a.length > 180 ? a.slice(a.length - 180) : a
        })
        return nn
      })
      }, 120)
    return () => clearInterval(id)
  }, [autoCash, crashProbability, crashed, emaLong, emaShort, isFlying, volatility])

  const newSeed = () => Math.random().toString(36).slice(2) + Date.now().toString(36)
  const start = () => {
    setMultiplier(1.0)
    setCrashed(false)
    setCashedOut(false)
    setIsFlying(true)
    startTimeRef.current = Date.now()
    setRoundId(r => r + 1)
    const seed = newSeed()
    setSeedReveal(seed)
    // simple commit = sha-like placeholder
    setSeedCommit(btoa(seed).slice(0, 16) + '…')
    setFlightPoints([1.0])
  }

  const stop = () => { setIsFlying(false) }

  const penaltyPct = useMemo(() => (multiplier < 1.2 ? 0.01 : 0), [multiplier])
  const handleCashout = (at?: number) => {
    if (!isFlying) return
    const m = at ?? multiplier
    const amount = parseFloat(bet) || 0
    const payout = amount * m * (1 - penaltyPct)
    setBalance(b => b + Math.max(0, payout - amount))
    setIsFlying(false)
    setCashedOut(true)
  }

  // Spectator mode: automatic rounds with 10s countdown if nobody starts
  useEffect(() => {
    if (isFlying) return
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [isFlying])

  useEffect(() => {
    if (!isFlying && countdown === 0) {
      // if user hasn't started, auto-start spectator round
      start()
    }
  }, [countdown, isFlying])

  // When a round ends (isFlying false), reset countdown to 10s and clear path
  useEffect(() => {
    if (!isFlying) { setCountdown(10); setFlightPoints([]) }
  }, [isFlying])

  const svgPaths = useMemo(() => {
    if (flightPoints.length === 0) return { areaPath: '', linePath: '', planeX: 60, planeY: 165 }
    const maxSamples = Math.max(2, flightPoints.length)
    const stepX = 940 / (maxSamples - 1) // leave 60px left margin
    const baseY = 165
    const scaleY = 50
    const clamp = (y: number) => Math.max(25, Math.min(baseY, y))
    let dArea = `M 60 ${baseY}`
    let dLine = ''
    let x = 60
    for (let i = 0; i < flightPoints.length; i++) {
      x = 60 + i * stepX
      const m = flightPoints[i]
      const y = clamp(baseY - Math.min((m - 1) * scaleY, 140))
      dArea += ` L ${x} ${y}`
      dLine += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`)
    }
    dArea += ` L ${x} ${baseY} L 60 ${baseY} Z`
    const planeX = x
    const planeY = (() => {
      const m = flightPoints[flightPoints.length - 1]
      return clamp(baseY - Math.min((m - 1) * scaleY, 140))
    })()
    return { areaPath: dArea, linePath: dLine, planeX, planeY }
  }, [flightPoints])

  // Random spectators join/leave for ambience
  useEffect(() => {
    const t = setInterval(() => setSpectators(s => Math.max(50, s + Math.floor((Math.random() - 0.5) * 10))), 2000)
    return () => clearInterval(t)
  }, [])

  return (
            <div style={{
      background: 'rgba(0,0,0,0.4)',
      border: '1px solid rgba(124,58,237,0.3)',
      borderRadius: 12,
      padding: 24
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>Account: {account ? `${account.slice(0, 6)}…${account.slice(-4)}` : 'Not connected'}</div>
        <div>Network: {chainId ?? 'Unknown'}</div>
        <div>Balance: {balance.toFixed(4)} ETH</div>
      </div>
      {/* Enhanced Market Data Display */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.1) 0%, rgba(14, 116, 144, 0.1) 100%)',
        border: '1px solid rgba(8, 145, 178, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>ETH Price</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0891b2' }}>${priceUsd.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Volatility</div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: volatility > 0.02 ? '#ef4444' : volatility > 0.01 ? '#f59e0b' : '#22c55e',
              animation: volatility > 0.02 ? 'pulse 1s infinite' : 'none'
            }}>
              {(volatility * 100).toFixed(2)}%
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Market Impact</div>
            <div style={{
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: marketImpact > 1 ? '#ef4444' : marketImpact > 0.5 ? '#f59e0b' : '#22c55e'
            }}>
              {marketImpact.toFixed(2)}x
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Health</div>
            <div style={{
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: health.healthy ? '#22c55e' : '#f59e0b' 
            }}>
              {health.source}
            </div>
          </div>
        </div>
        
        {/* Volatility Chart */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Volatility Trend (Last 20 Updates)</div>
            <div style={{
            height: '40px', 
            background: 'rgba(0, 0, 0, 0.3)', 
            borderRadius: '6px', 
            position: 'relative',
            overflow: 'hidden'
          }}>
            {volatilityHistory.length > 1 && (
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                <polyline
                  points={volatilityHistory.map((vol, i) => 
                    `${(i / (volatilityHistory.length - 1)) * 100}%,${100 - (vol * 2000)}`
                  ).join(' ')}
                  fill="none"
                  stroke={volatility > 0.02 ? '#ef4444' : '#0891b2'}
                  strokeWidth="2"
                />
              </svg>
            )}
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
          EMA Short: {emaShort.toFixed(2)} • EMA Long: {emaLong.toFixed(2)} • 
          Trend: {emaShort > emaLong ? '📈 Bullish' : '📉 Bearish'}
        </div>

        {/* Market Data for Analysis - No Advice Given */}
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(8, 145, 178, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '12px'
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            color: '#0891b2',
            marginBottom: '8px'
          }}>
            📊 Market Data
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.4' }}>
            {(() => {
              const trend = (emaShort - emaLong) / Math.max(1, emaLong)
              const trendStrength = Math.abs(trend)
              
              return (
                <div>
                  <div>Trend Strength: <span style={{ 
                    color: trendStrength > 0.01 ? '#22c55e' : trendStrength > 0.005 ? '#f59e0b' : '#6b7280',
                    fontWeight: 'bold'
                  }}>
                    {(trendStrength * 100).toFixed(2)}%
                  </span></div>
                  <div>EMA Divergence: <span style={{ 
                    color: trend > 0 ? '#22c55e' : '#ef4444',
                    fontWeight: 'bold'
                  }}>
                    {trend > 0 ? '+' : ''}{(trend * 100).toFixed(2)}%
                  </span></div>
                  <div>Volatility Impact: <span style={{ 
                    color: volatility > 0.02 ? '#ef4444' : volatility > 0.01 ? '#f59e0b' : '#22c55e',
                    fontWeight: 'bold'
                  }}>
                    {(volatility * 100).toFixed(2)}%
            </span></div>
                  <div style={{ marginTop: '8px', fontSize: '10px', color: '#6b7280' }}>
                    Study the patterns. Market conditions affect flight behavior.
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
      {/* Plane canvas with trajectory area and line */}
      <div style={{ position: 'relative', height: 200, marginBottom: 12, borderRadius: 12, border: '1px solid rgba(124,58,237,0.25)', background: 'rgba(2,6,23,0.6)' }}>
        <svg viewBox="0 0 1000 200" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="1" />
            </pattern>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(220,38,38,0.45)" />
              <stop offset="100%" stopColor="rgba(220,38,38,0.12)" />
            </linearGradient>
            <filter id="planeGlow">
              <feGaussianBlur stdDeviation="2" result="colored" />
              <feMerge>
                <feMergeNode in="colored" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* altitude bands */}
          <g opacity="0.35">
            <line x1="0" y1="165" x2="1000" y2="165" stroke="rgba(16,185,129,0.5)" strokeDasharray="6,4" />
            <line x1="0" y1="125" x2="1000" y2="125" stroke="rgba(234,179,8,0.5)" strokeDasharray="6,4" />
            <line x1="0" y1="85" x2="1000" y2="85" stroke="rgba(239,68,68,0.5)" strokeDasharray="6,4" />
          </g>
          {/* trajectory area */}
          {svgPaths.areaPath && (
            <path d={svgPaths.areaPath} fill="url(#area)" stroke="none" />
          )}
          {/* trajectory line */}
          {svgPaths.linePath && (
            <path d={svgPaths.linePath} fill="none" stroke="rgba(220,38,38,0.95)" strokeWidth="3" />
          )}
        </svg>
        <div style={{ position: 'absolute', left: `${(svgPaths as any).planeX ?? 60}px`, top: `${(svgPaths as any).planeY ?? 165}px`, transform: 'translate(-50%, -50%)' }}>
          <span style={{ fontSize: 28, filter: 'url(#planeGlow)' }}>{crashed ? '💥' : '✈️'}</span>
        </div>
        {!isFlying && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd', fontFamily: 'monospace', fontSize: 48, fontWeight: 700 }}>
            {countdown}
        </div>
        )}
        {crashed && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontFamily: 'monospace', fontSize: 28, fontWeight: 700 }}>
            CRASH @{multiplier.toFixed(2)}x
        </div>
            )}
          </div>
      <div style={{
        fontFamily: 'monospace',
        fontSize: 48,
        fontWeight: 700,
        color: crashed ? '#f87171' : cashedOut ? '#fde047' : '#34d399',
        textAlign: 'center',
        marginBottom: 16
      }}>
        {multiplier.toFixed(2)}x {crashed ? '💥' : cashedOut ? '🪂' : '🚀'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>Bet Amount (ETH)</div>
          <input value={bet} onChange={e => setBet(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid rgba(124,58,237,0.4)', background: 'rgba(0,0,0,0.5)', color: '#fff' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>Auto Cash‑out (×)</div>
          <input value={autoCash} onChange={e => setAutoCash(e.target.value)} placeholder="e.g. 2.00" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid rgba(124,58,237,0.4)', background: 'rgba(0,0,0,0.5)', color: '#fff' }} />
        </div>
            <div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>Risk</div>
          <div style={{ fontWeight: 700, color: crashProbability() < 0.04 ? '#22c55e' : crashProbability() < 0.08 ? '#f59e0b' : '#ef4444' }}>{(crashProbability() * 100).toFixed(1)}%</div>
            </div>
          </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
        <button onClick={start} disabled={isFlying} style={{ padding: '10px 16px', borderRadius: 8, background: '#7c3aed', color: '#fff', border: 'none' }}>
          Start
        </button>
        {isFlying && !crashed && !cashedOut && (
          <button onClick={() => handleCashout()} style={{ padding: '10px 16px', borderRadius: 8, background: '#f59e0b', color: '#111827', border: 'none' }}>
            Cash‑out {penaltyPct > 0 ? '(1% fee)' : ''}
          </button>
        )}
        <button onClick={stop} disabled={!isFlying} style={{ padding: '10px 16px', borderRadius: 8, background: '#6b7280', color: '#fff', border: 'none' }}>
          Stop
        </button>
      </div>
      {/* Live Traders Section */}
      <div style={{ 
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(8, 145, 178, 0.2)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '12px' 
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#0891b2',
            margin: 0
          }}>
            🚀 Live Traders
          </h3>
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#22c55e',
              animation: 'pulse 2s infinite'
            }}></div>
            {liveTraders.length} Active
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '8px',
          maxHeight: '120px',
          overflowY: 'auto'
        }}>
          {liveTraders.map((trader, index) => (
            <div key={index} style={{
              background: 'rgba(8, 145, 178, 0.1)',
              border: '1px solid rgba(8, 145, 178, 0.2)',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  color: '#ffffff' 
                }}>
                  {trader.name}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: '#6b7280' 
                }}>
                  {trader.bet.toFixed(3)} ETH
                </div>
              </div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#0891b2' 
              }}>
                {trader.multiplier.toFixed(2)}x
              </div>
            </div>
              ))}
            </div>
        
        {liveTraders.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#6b7280', 
            fontSize: '12px',
            padding: '20px'
          }}>
            No active traders yet. Be the first to join! 🎯
          </div>
        )}
      </div>

      <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 8 }}>
        👥 {spectators.toLocaleString()} watching • Round #{roundId.toString()} • Commit: {seedCommit || '—'} • Reveal: {seedReveal ? seedReveal.slice(0, 8) + '…' : '—'}
      </div>
      {!isFlying && (
        <div style={{ textAlign: 'center', color: '#a78bfa', marginBottom: 8 }}>Next launch in {countdown}s</div>
      )}
      {!health.healthy && <div style={{ fontSize: 12, color: '#f59e0b', textAlign: 'center' }}>Price source degraded ({health.source}); gameplay continues with fallback</div>}
    </div>
  )
}

export default MarketAviator


