import React, { useState } from 'react'
import { useTransactionFeedback } from '../lib/useTransactionFeedback'

export default function TransactionHistory() {
  const { getTransactionHistory, clearHistory } = useTransactionFeedback()
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all')
  const { pending, completed, failed, all } = getTransactionHistory()

  const displayTransactions = filter === 'all' ? all :
    filter === 'pending' ? pending :
    filter === 'completed' ? completed : failed

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'confirmed':
        return '✅'
      case 'failed':
        return '❌'
      default:
        return '📝'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b'
      case 'confirmed':
        return '#22c55e'
      case 'failed':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  if (all.length === 0) {
    return (
      <div style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: 12,
        padding: 24,
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
        <div style={{ fontSize: 18, marginBottom: 8 }}>No Transactions Yet</div>
        <div style={{ fontSize: 14 }}>Your transaction history will appear here</div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(0,0,0,0.4)',
      border: '1px solid rgba(124,58,237,0.3)',
      borderRadius: 12,
      padding: 24
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: 20 }}>Transaction History</h2>
        <button
          onClick={clearHistory}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            background: 'rgba(239,68,68,0.2)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: 12
          }}
        >
          Clear History
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 16,
        borderBottom: '1px solid rgba(124,58,237,0.2)',
        paddingBottom: 12
      }}>
        {(['all', 'pending', 'completed', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              background: filter === f ? 'rgba(124,58,237,0.3)' : 'transparent',
              border: 'none',
              color: filter === f ? '#a78bfa' : '#9ca3af',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: filter === f ? 'bold' : 'normal',
              textTransform: 'capitalize'
            }}
          >
            {f} {f === 'all' ? `(${all.length})` : f === 'pending' ? `(${pending.length})` : f === 'completed' ? `(${completed.length})` : `(${failed.length})`}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {displayTransactions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: '#6b7280'
          }}>
            No {filter === 'all' ? '' : filter} transactions
          </div>
        ) : (
          displayTransactions.map((tx) => (
            <div
              key={tx.hash}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${getStatusColor(tx.status)}40`,
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8
                }}>
                  <span style={{ fontSize: 20 }}>{getStatusIcon(tx.status)}</span>
                  <span style={{
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 14
                  }}>
                    {tx.description}
                  </span>
                  <span style={{
                    background: getStatusColor(tx.status) + '20',
                    color: getStatusColor(tx.status),
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}>
                    {tx.status}
                  </span>
                </div>
                <div style={{
                  fontSize: 12,
                  color: '#6b7280',
                  fontFamily: 'monospace',
                  marginBottom: 4
                }}>
                  {formatHash(tx.hash)}
                </div>
                <div style={{
                  fontSize: 11,
                  color: '#6b7280'
                }}>
                  {formatTime(tx.timestamp)}
                  {tx.blockNumber && ` • Block #${tx.blockNumber}`}
                </div>
                {tx.error && (
                  <div style={{
                    fontSize: 12,
                    color: '#ef4444',
                    marginTop: 8,
                    padding: 8,
                    background: 'rgba(239,68,68,0.1)',
                    borderRadius: 4
                  }}>
                    Error: {tx.error}
                  </div>
                )}
              </div>
              <a
                href={`https://explorer.blockdag.network/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: 'rgba(124,58,237,0.2)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: '#a78bfa',
                  textDecoration: 'none',
                  fontSize: 12,
                  marginLeft: 12
                }}
              >
                View
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

