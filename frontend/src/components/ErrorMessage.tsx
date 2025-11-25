import React from 'react'
import { parseContractError, getErrorMessage, isRecoverableError } from '../lib/errorHandler'

interface ErrorMessageProps {
  error: any
  onRetry?: () => void
  onDismiss?: () => void
}

export default function ErrorMessage({ error, onRetry, onDismiss }: ErrorMessageProps) {
  const parsed = parseContractError(error)
  const message = getErrorMessage(parsed)
  const recoverable = isRecoverableError(parsed)

  const getRecoverySteps = () => {
    if (parsed.userRejected) {
      return []
    }

    if (parsed.networkError) {
      return [
        'Check your internet connection',
        'Verify you are connected to BlockDAG network',
        'Try refreshing the page',
        'Check if MetaMask is unlocked'
      ]
    }

    if (parsed.contractError) {
      if (parsed.message?.includes('insufficient funds')) {
        return [
          'Ensure you have enough BDAG tokens',
          'Check your wallet balance',
          'Reduce the transaction amount'
        ]
      }
      return [
        'Verify the transaction details are correct',
        'Check if you have sufficient balance',
        'Ensure you are on the correct network',
        'Try again in a few moments'
      ]
    }

    return [
      'Refresh the page and try again',
      'Check your network connection',
      'Verify your wallet is connected'
    ]
  }

  const recoverySteps = getRecoverySteps()

  return (
    <div style={{
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: 12,
      padding: 20,
      margin: '16px 0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16
      }}>
        <div style={{ fontSize: 24 }}>⚠️</div>
        <div>
          <h3 style={{
            margin: 0,
            color: '#ef4444',
            fontSize: 18,
            fontWeight: 'bold'
          }}>
            Something went wrong
          </h3>
          <p style={{
            margin: '4px 0 0 0',
            color: '#fca5a5',
            fontSize: 14
          }}>
            {message}
          </p>
        </div>
      </div>

      {recoverySteps.length > 0 && (
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16
        }}>
          <div style={{
            color: '#fff',
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: 8
          }}>
            Try these steps:
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: 20,
            color: '#d1d5db',
            fontSize: 13,
            lineHeight: 1.8
          }}>
            {recoverySteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'flex-end'
      }}>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              background: 'rgba(107,114,128,0.2)',
              border: '1px solid rgba(107,114,128,0.3)',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Dismiss
          </button>
        )}
        {recoverable && onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              background: 'rgba(124,58,237,0.2)',
              border: '1px solid rgba(124,58,237,0.3)',
              color: '#a78bfa',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 'bold'
            }}
          >
            Retry
          </button>
        )}
      </div>

      {parsed.reason && (
        <details style={{
          marginTop: 12,
          fontSize: 11,
          color: '#6b7280'
        }}>
          <summary style={{ cursor: 'pointer' }}>Technical Details</summary>
          <pre style={{
            marginTop: 8,
            padding: 8,
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 4,
            overflow: 'auto',
            fontSize: 11
          }}>
            {parsed.reason}
          </pre>
        </details>
      )}
    </div>
  )
}
