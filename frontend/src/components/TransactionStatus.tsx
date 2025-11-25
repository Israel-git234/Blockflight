import React from 'react'
import { useTransactionFeedback } from '../lib/useTransactionFeedback'
import LoadingSpinner from './LoadingSpinner'

export function TransactionStatus() {
  const { pending, hasPending } = useTransactionFeedback()

  if (!hasPending) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'rgba(0,0,0,0.9)',
      border: '1px solid rgba(124,58,237,0.5)',
      borderRadius: 12,
      padding: 16,
      minWidth: 280,
      maxWidth: 400,
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12
      }}>
        <LoadingSpinner size="small" />
        <div style={{ flex: 1 }}>
          <div style={{
            color: '#fff',
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: 4
          }}>
            {pending.length} Transaction{pending.length > 1 ? 's' : ''} Pending
          </div>
          <div style={{
            color: '#9ca3af',
            fontSize: 12
          }}>
            Waiting for confirmation...
          </div>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxHeight: 200,
        overflowY: 'auto'
      }}>
        {pending.map((tx) => (
          <div
            key={tx.hash}
            style={{
              background: 'rgba(124,58,237,0.1)',
              borderRadius: 6,
              padding: 8,
              fontSize: 11,
              color: '#d1d5db'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {tx.description}
            </div>
            <div style={{
              fontFamily: 'monospace',
              color: '#6b7280',
              wordBreak: 'break-all'
            }}>
              {tx.hash.slice(0, 20)}...
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
