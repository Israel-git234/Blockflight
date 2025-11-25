import React from 'react'

export default function ValueProposition() {
  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: 60
      }}>
        <h1 style={{
          fontSize: 48,
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 16
        }}>
          Why BlockFlight?
        </h1>
        <p style={{
          fontSize: 20,
          color: '#9ca3af',
          maxWidth: 600,
          margin: '0 auto'
        }}>
          The first prediction platform that combines real market data, AI insights, and blockchain technology
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        marginBottom: 60
      }}>
        {/* Value Card 1 */}
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <h3 style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 12
          }}>
            Market-Driven Predictions
          </h3>
          <p style={{
            color: '#9ca3af',
            fontSize: 16,
            lineHeight: 1.6,
            margin: 0
          }}>
            First prediction platform that uses real market data to drive game mechanics. Your market knowledge gives you an edge.
          </p>
        </div>

        {/* Value Card 2 */}
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <h3 style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 12
          }}>
            BlockDAG Speed
          </h3>
          <p style={{
            color: '#9ca3af',
            fontSize: 16,
            lineHeight: 1.6,
            margin: 0
          }}>
            Leverage BlockDAG's superior transaction speed for real-time trading. Fast confirmations, low fees, instant settlements.
          </p>
        </div>

        {/* Value Card 3 */}
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
          <h3 style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 12
          }}>
            AI-Powered Insights
          </h3>
          <p style={{
            color: '#9ca3af',
            fontSize: 16,
            lineHeight: 1.6,
            margin: 0
          }}>
            Get AI predictions across multiple blockchains. Sentiment analysis, trend detection, and cross-chain market insights.
          </p>
        </div>

        {/* Value Card 4 */}
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h3 style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 12
          }}>
            Community-Driven
          </h3>
          <p style={{
            color: '#9ca3af',
            fontSize: 16,
            lineHeight: 1.6,
            margin: 0
          }}>
            Create and bet on custom prediction markets. Build reputation, follow creators, and participate in community governance.
          </p>
        </div>
      </div>

      {/* Use Cases Section */}
      <div style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: 16,
        padding: 40,
        marginBottom: 60
      }}>
        <h2 style={{
          color: '#fff',
          fontSize: 32,
          fontWeight: 'bold',
          marginBottom: 32,
          textAlign: 'center'
        }}>
          Who is BlockFlight For?
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 24
        }}>
          <div>
            <h3 style={{
              color: '#a78bfa',
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 12
            }}>
              📈 Market Traders
            </h3>
            <ul style={{
              color: '#9ca3af',
              fontSize: 14,
              lineHeight: 2,
              paddingLeft: 20,
              margin: 0
            }}>
              <li>Use market knowledge to win</li>
              <li>Leverage volatility for returns</li>
              <li>Real-time market data</li>
              <li>Risk management tools</li>
            </ul>
          </div>
          <div>
            <h3 style={{
              color: '#a78bfa',
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 12
            }}>
              🎯 Prediction Creators
            </h3>
            <ul style={{
              color: '#9ca3af',
              fontSize: 14,
              lineHeight: 2,
              paddingLeft: 20,
              margin: 0
            }}>
              <li>Create custom markets</li>
              <li>Build reputation</li>
              <li>Earn from predictions</li>
              <li>Community following</li>
            </ul>
          </div>
          <div>
            <h3 style={{
              color: '#a78bfa',
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 12
            }}>
              💎 Long-term Investors
            </h3>
            <ul style={{
              color: '#9ca3af',
              fontSize: 14,
              lineHeight: 2,
              paddingLeft: 20,
              margin: 0
            }}>
              <li>Cruise Mode staking</li>
              <li>Market trend returns</li>
              <li>Low-risk steady gains</li>
              <li>Compound interest</li>
            </ul>
          </div>
          <div>
            <h3 style={{
              color: '#a78bfa',
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 12
            }}>
              ⚡ DeFi Enthusiasts
            </h3>
            <ul style={{
              color: '#9ca3af',
              fontSize: 14,
              lineHeight: 2,
              paddingLeft: 20,
              margin: 0
            }}>
              <li>BlockDAG network benefits</li>
              <li>Fast transactions</li>
              <li>Low fees</li>
              <li>Cross-chain insights</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Problem-Solution Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(139,92,246,0.1) 100%)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: 16,
        padding: 40
      }}>
        <h2 style={{
          color: '#fff',
          fontSize: 32,
          fontWeight: 'bold',
          marginBottom: 24,
          textAlign: 'center'
        }}>
          The Problem We Solve
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 32
        }}>
          <div>
            <h3 style={{
              color: '#ef4444',
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 16
            }}>
              ❌ Traditional Prediction Markets
            </h3>
            <ul style={{
              color: '#9ca3af',
              fontSize: 14,
              lineHeight: 2,
              paddingLeft: 20,
              margin: 0
            }}>
              <li>Slow transaction times</li>
              <li>High gas fees</li>
              <li>No market data integration</li>
              <li>Limited to simple YES/NO bets</li>
              <li>No skill-based mechanics</li>
            </ul>
          </div>
          <div>
            <h3 style={{
              color: '#22c55e',
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 16
            }}>
              ✅ BlockFlight Solution
            </h3>
            <ul style={{
              color: '#9ca3af',
              fontSize: 14,
              lineHeight: 2,
              paddingLeft: 20,
              margin: 0
            }}>
              <li>BlockDAG speed (instant confirmations)</li>
              <li>Low fees on BlockDAG network</li>
              <li>Real-time market data integration</li>
              <li>Multiple game modes and mechanics</li>
              <li>Market knowledge gives you an edge</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
