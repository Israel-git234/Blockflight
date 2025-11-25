import { useEffect, useMemo, useState } from 'react'
import { useNotifications } from '../components/NotificationsProvider'
import { useCommunityMarketContract } from '../lib/useCommunityMarketContract'
import { useTransactionFeedback } from '../lib/useTransactionFeedback'
import { parseContractError, getErrorMessage } from '../lib/errorHandler'
import { getProvider } from '../lib/ethersClient'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import TransactionHistory from '../components/TransactionHistory'

interface CommunityMarketProps {
  account: string | null
}

interface CommunityBet {
  id: string
  title: string
  description: string
  category: string
  creator: string
  endsAt: Date
  yesOdds: number // payout multiplier for YES
  noOdds: number  // payout multiplier for NO
  totalYes: number
  totalNo: number
  followers: number
  resolved?: 'YES' | 'NO'
  privateGroupId?: string // optional group id for private bets
}

export default function CommunityMarket({ account }: CommunityMarketProps) {
  const { addNotification } = useNotifications()
  const { trackTransaction, hasPending } = useTransactionFeedback()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [useOnChain, setUseOnChain] = useState(true)
  
  // Wave 2: Contract integration
  const {
    createMarket: contractCreateMarket,
    bet: contractBet,
    claim: contractClaim,
    getMarket,
    getMarketCount,
    isReady: contractReady
  } = useCommunityMarketContract(account)
  const [communityStats, setCommunityStats] = useState({
    totalMarkets: 1247,
    activeUsers: 2847,
    totalVolume: 89.3,
    topCreator: 'CryptoOracle'
  })
  const [bets, setBets] = useState<CommunityBet[]>([
    {
      id: 'b1',
      title: 'Will it rain in Johannesburg tomorrow?',
      description: 'Based on SAWS forecasts and current humidity trends.',
      category: 'Weather',
      creator: '0x1a2b...3c4d',
      endsAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
      yesOdds: 1.8,
      noOdds: 2.1,
      totalYes: 1.45,
      totalNo: 0.95,
      followers: 124
    },
    {
      id: 'b2',
      title: 'BTC > $70k by Friday?',
      description: 'Market momentum looks strong; CPI data incoming.',
      category: 'Crypto',
      creator: '0x5e6f...7g8h',
      endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      yesOdds: 2.6,
      noOdds: 1.4,
      totalYes: 3.2,
      totalNo: 5.8,
      followers: 342
    }
  ])

  const [following, setFollowing] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<string>('All')
  const [groupId, setGroupId] = useState<string>('')
  const [isPrivate, setIsPrivate] = useState<boolean>(false)

  // Create form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [durationHours, setDurationHours] = useState(24)
  const [yesOdds, setYesOdds] = useState('2.0')
  const [noOdds, setNoOdds] = useState('2.0')
  const [notifyFollowers, setNotifyFollowers] = useState<boolean>(true)

  // Place bet form (inline)
  const [wager, setWager] = useState('0.05')

  const visibleBets = useMemo(() => {
    if (filter === 'All') return bets
    return bets.filter(b => b.category === filter)
  }, [bets, filter])

  const totalPool = (b: CommunityBet) => b.totalYes + b.totalNo
  const timeLeft = (d: Date) => {
    const ms = d.getTime() - Date.now()
    if (ms <= 0) return 'Ended'
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    return `${h}h ${m}m`
  }

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bf_community_bets')
      if (saved) {
        const parsed = JSON.parse(saved)
        // revive dates
        const revived: CommunityBet[] = parsed.map((b: any) => ({ ...b, endsAt: new Date(b.endsAt) }))
        setBets(revived)
      }
      const savedFollows = localStorage.getItem('bf_community_follows')
      if (savedFollows) setFollowing(JSON.parse(savedFollows))
    } catch {}
  }, [])

  // Persist to localStorage
  useEffect(() => {
    try { localStorage.setItem('bf_community_bets', JSON.stringify(bets)) } catch {}
  }, [bets])
  useEffect(() => {
    try { localStorage.setItem('bf_community_follows', JSON.stringify(following)) } catch {}
  }, [following])

  // Wave 2: Enhanced createBet with contract integration
  const createBet = async () => {
    if (!account) {
      addNotification({ title: 'Wallet Required', message: 'Please connect your wallet to create a market', tag: 'error' })
      return
    }
    if (!title.trim() || !description.trim()) {
      addNotification({ title: 'Invalid Input', message: 'Please add a title and description', tag: 'error' })
      return
    }

    setError(null)
    setLoading(true)

    try {
      const endsAt = Math.floor((Date.now() + durationHours * 3600000) / 1000)
      const yesX100 = Math.floor((parseFloat(yesOdds) || 2.0) * 100)
      const noX100 = Math.floor((parseFloat(noOdds) || 2.0) * 100)
      const privateGroupId = (isPrivate && groupId.trim()) ? groupId.trim() : ''

      let marketId: number | null = null
      if (useOnChain && contractReady) {
        // Create market on-chain
        const receipt = await contractCreateMarket(
          title.trim(),
          description.trim(),
          category,
          privateGroupId,
          endsAt,
          yesX100,
          noX100
        )

        // Track transaction
        const provider = getProvider()
        await trackTransaction(
          receipt.hash,
          `Creating market: ${title.trim()}`,
          async (hash) => {
            const txReceipt = await provider.waitForTransaction(hash)
            // Try to extract market ID from events
            if (txReceipt && txReceipt.logs) {
              // Market ID extraction would happen here if needed
            }
            return txReceipt
          }
        )

        addNotification({
          title: 'Market Created!',
          message: `Market created successfully. Transaction: ${receipt.hash.slice(0, 10)}...`,
          tag: 'success'
        })
      }

      // Update local state
      const id = marketId ? `market-${marketId}` : `b${Date.now()}`
      const newBet: CommunityBet = {
        id,
        title: title.trim(),
        description: description.trim(),
        category,
        creator: account.slice(0, 6) + '...' + account.slice(-4),
        endsAt: new Date(Date.now() + durationHours * 3600000),
        yesOdds: parseFloat(yesOdds) || 2.0,
        noOdds: parseFloat(noOdds) || 2.0,
        totalYes: 0,
        totalNo: 0,
        followers: 0,
        privateGroupId: isPrivate && groupId.trim() ? groupId.trim() : undefined
      }
      setBets(prev => [newBet, ...prev])
      
      if (notifyFollowers) {
        addNotification({
          title: 'New Community Prediction',
          message: `${newBet.title} • YES ${newBet.yesOdds.toFixed(2)}× / NO ${newBet.noOdds.toFixed(2)}×${newBet.privateGroupId ? ' • Private' : ''}`,
          tag: 'community'
        })
      }

      // Reset form
      setTitle('')
      setDescription('')
      setCategory('General')
      setDurationHours(24)
      setYesOdds('2.0')
      setNoOdds('2.0')
    } catch (err: any) {
      const parsed = parseContractError(err)
      setError(err)
      addNotification({
        title: 'Failed to Create Market',
        message: getErrorMessage(parsed),
        tag: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const followCreator = (creator: string) => {
    setFollowing(prev => ({ ...prev, [creator]: !prev[creator] }))
    // Simple follower count update on visible bets by this creator
    setBets(prev => prev.map(b => b.creator === creator ? { ...b, followers: (following[creator] ? Math.max(0, b.followers - 1) : b.followers + 1) } : b))
  }

  // Wave 2: Enhanced placeBet with contract integration
  const placeBet = async (betId: string, side: 'YES' | 'NO') => {
    if (!account) {
      addNotification({ title: 'Wallet Required', message: 'Please connect your wallet to place a bet', tag: 'error' })
      return
    }

    const amount = parseFloat(wager) || 0.01
    setError(null)
    setLoading(true)

    try {
      // Extract market ID from betId (format: "market-123" or "b123456")
      const marketIdMatch = betId.match(/market-(\d+)|b(\d+)/)
      const marketId = marketIdMatch ? parseInt(marketIdMatch[1] || marketIdMatch[2]) : 1

      if (useOnChain && contractReady) {
        // Place bet on-chain
        const receipt = await contractBet(marketId, side === 'YES', wager)
        
        // Track transaction
        const provider = getProvider()
        await trackTransaction(
          receipt.hash,
          `Placing ${side} bet on "${bets.find(b => b.id === betId)?.title || 'market'}"`,
          async (hash) => {
            const txReceipt = await provider.waitForTransaction(hash)
            return txReceipt
          }
        )

        addNotification({
          title: 'Bet Placed!',
          message: `Successfully placed ${side} bet of ${wager} ETH`,
          tag: 'success'
        })
      }

      // Update local state
      setBets(prev => prev.map(b => {
        if (b.id !== betId) return b
        if (side === 'YES') {
          return { ...b, totalYes: b.totalYes + amount }
        } else {
          return { ...b, totalNo: b.totalNo + amount }
        }
      }))
    } catch (err: any) {
      const parsed = parseContractError(err)
      setError(err)
      addNotification({
        title: 'Bet Failed',
        message: getErrorMessage(parsed),
        tag: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 2fr',
      gap: '2rem'
    },
    card: {
      background: 'rgba(0,0,0,0.4)',
      border: '1px solid rgba(124,58,237,0.3)',
      borderRadius: '1rem',
      padding: '1rem',
      backdropFilter: 'blur(8px)'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      background: 'linear-gradient(45deg,#f59e0b,#a855f7,#ec4899)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    label: {
      fontSize: '0.875rem',
      color: '#d1d5db',
      marginTop: '0.75rem',
      display: 'block' as const
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      background: 'rgba(0,0,0,0.5)',
      border: '1px solid rgba(124,58,237,0.4)',
      borderRadius: '0.5rem',
      color: 'white',
      marginTop: '0.25rem'
    },
    selectRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem'
    },
    button: {
      background: 'linear-gradient(45deg,#10b981,#059669)',
      border: 'none',
      borderRadius: '0.5rem',
      padding: '0.75rem 1.25rem',
      color: 'white',
      fontWeight: 'bold',
      marginTop: '0.75rem',
      cursor: 'pointer'
    },
    betRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '0.75rem',
      alignItems: 'center',
      padding: '0.75rem',
      borderBottom: '1px solid rgba(124,58,237,0.2)'
    },
    small: {
      fontSize: '0.75rem',
      color: '#9ca3af'
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Wave 2: Contract Status */}
      {contractReady && useOnChain && (
        <div style={{
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span>✅</span>
          <span style={{ color: '#22c55e', fontSize: 14, fontWeight: 'bold' }}>
            Connected to Smart Contract
          </span>
        </div>
      )}

      {/* Wave 2: Error Display */}
      {error && (
        <ErrorMessage 
          error={error} 
          onRetry={() => setError(null)}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Wave 2: Loading Overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <LoadingSpinner message="Processing transaction..." />
        </div>
      )}

      {/* Community Statistics */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.1) 0%, rgba(14, 116, 144, 0.1) 100%)',
        border: '1px solid rgba(8, 145, 178, 0.3)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #0891b2, #0e7490)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          🧠 Community Prediction Market
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0891b2', marginBottom: '4px' }}>
              {communityStats.totalMarkets.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Markets</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e', marginBottom: '4px' }}>
              {communityStats.activeUsers.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Active Users</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
              ${communityStats.totalVolume.toFixed(1)}M
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Volume</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '4px' }}>
              {communityStats.topCreator}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Top Creator</div>
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.3)', 
          borderRadius: '8px', 
          padding: '12px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#9ca3af'
        }}>
          🎯 Create custom predictions • 👥 Follow top predictors • 🏆 Earn reputation • 💰 Share in rewards
        </div>
      </div>

      <div style={styles.grid}>
        {/* Create Bet */}
        <div style={styles.card}>
          <div style={styles.title}>🧠 Create Custom Prediction</div>
        <label style={styles.label}>Title</label>
        <input style={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Will it rain tomorrow in Johannesburg?" />
        <label style={styles.label}>Description / Analysis</label>
        <textarea style={{...styles.input, minHeight: 100 as any}} value={description} onChange={e => setDescription(e.target.value)} placeholder="Why you think this will happen; sources, reasoning, etc." />
        <div style={styles.selectRow}>
          <div>
            <label style={styles.label}>Category</label>
            <select style={styles.input as any} value={category} onChange={e => setCategory(e.target.value)}>
              {['General','Weather','Crypto','Sports','Politics','Tech'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Ends In (hours)</label>
            <input style={styles.input} type="number" min={1} max={24*14} value={durationHours} onChange={e => setDurationHours(parseInt(e.target.value||'24'))} />
          </div>
        </div>
        <div style={styles.selectRow}>
          <div>
            <label style={styles.label}>Private Group ID (optional)</label>
            <input style={styles.input} placeholder="e.g. friends-123" value={groupId} onChange={e => setGroupId(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>Private Bet?</label>
            <select style={styles.input as any} value={isPrivate? 'yes' : 'no'} onChange={e => setIsPrivate(e.target.value==='yes')}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>
        <div style={styles.selectRow}>
          <div>
            <label style={styles.label}>YES Odds (×)</label>
            <input style={styles.input} value={yesOdds} onChange={e => setYesOdds(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>NO Odds (×)</label>
            <input style={styles.input} value={noOdds} onChange={e => setNoOdds(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            style={{
              ...styles.button,
              opacity: loading || hasPending ? 0.6 : 1,
              cursor: loading || hasPending ? 'not-allowed' : 'pointer'
            }} 
            onClick={createBet}
            disabled={loading || hasPending}
          >
            {loading ? 'Creating...' : hasPending ? 'Transaction Pending...' : 'Create Prediction'}
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa' }}>
            <input type="checkbox" checked={notifyFollowers} onChange={e => setNotifyFollowers(e.target.checked)} />
            Notify followers
          </label>
        </div>
        {!account && <div style={styles.small}>Connect wallet to publish your prediction.</div>}
      </div>

      {/* Browse Bets */}
      <div style={styles.card}>
        <div style={styles.title}>📚 Community Predictions</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {['All','Weather','Crypto','Sports','Politics','Tech','General'].map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{...styles.button, background: filter===c?'linear-gradient(45deg,#f59e0b,#a855f7)':'rgba(124,58,237,0.2)'}}>
              {c}
            </button>
          ))}
        </div>

        <div>
          <div style={{...styles.betRow, fontWeight: 'bold'}}>
            <div>Prediction</div>
            <div>Pool</div>
            <div>Odds</div>
            <div>Actions</div>
          </div>
          {visibleBets
            .filter(b => !b.privateGroupId || (groupId && b.privateGroupId === groupId))
            .map(b => (
            <div key={b.id} style={styles.betRow}>
              <div>
                <div style={{fontWeight:'bold'}}>{b.title}</div>
                <div style={styles.small}>{b.description}</div>
                <div style={styles.small}>By {b.creator} • Ends in {timeLeft(b.endsAt)}{b.privateGroupId? ` • Private(${b.privateGroupId})` : ''}</div>
              </div>
              <div>
                <div>{totalPool(b).toFixed(2)} ETH</div>
                <div style={styles.small}>YES {b.totalYes.toFixed(2)} • NO {b.totalNo.toFixed(2)}</div>
              </div>
              <div>
                <div>YES {b.yesOdds.toFixed(2)}×</div>
                <div>NO {b.noOdds.toFixed(2)}×</div>
              </div>
              <div>
                <div style={{display:'flex', gap:'0.5rem'}}>
                  <input style={{...styles.input, width: 100}} value={wager} onChange={e=>setWager(e.target.value)} />
                  <button 
                    style={{
                      ...styles.button,
                      opacity: loading || hasPending ? 0.6 : 1,
                      cursor: loading || hasPending ? 'not-allowed' : 'pointer'
                    }} 
                    onClick={() => placeBet(b.id, 'YES')}
                    disabled={loading || hasPending}
                  >
                    {loading ? 'Placing...' : 'Bet YES'}
                  </button>
                  <button 
                    style={{
                      ...styles.button, 
                      background:'linear-gradient(45deg,#ef4444,#b91c1c)',
                      opacity: loading || hasPending ? 0.6 : 1,
                      cursor: loading || hasPending ? 'not-allowed' : 'pointer'
                    }} 
                    onClick={() => placeBet(b.id, 'NO')}
                    disabled={loading || hasPending}
                  >
                    {loading ? 'Placing...' : 'Bet NO'}
                  </button>
                </div>
                <div style={{display:'flex', gap:'0.5rem', marginTop:'0.5rem'}}>
                  <button style={{...styles.button, background: following[b.creator]?'linear-gradient(45deg,#10b981,#059669)':'rgba(124,58,237,0.2)'}} onClick={() => followCreator(b.creator)}>
                    {following[b.creator]? 'Following' : 'Follow Creator'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wave 2: Transaction History */}
      {account && (
        <div style={{ marginTop: 24 }}>
          <TransactionHistory />
        </div>
      )}
      </div>
    </div>
  )
}
