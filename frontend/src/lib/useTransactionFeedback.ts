import { useState, useCallback, useEffect } from 'react'
import { useNotifications } from '../components/NotificationsProvider'

export interface TransactionStatus {
  hash: string
  description: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  blockNumber?: number
  error?: string
}

/**
 * Hook for tracking and managing transaction feedback
 */
export function useTransactionFeedback() {
  const { addNotification } = useNotifications()
  const [pending, setPending] = useState<TransactionStatus[]>([])
  const [completed, setCompleted] = useState<TransactionStatus[]>([])
  const [failed, setFailed] = useState<TransactionStatus[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bf_transaction_history')
      if (saved) {
        const history = JSON.parse(saved)
        setCompleted(history.completed || [])
        setFailed(history.failed || [])
      }
    } catch (e) {
      console.error('Failed to load transaction history', e)
    }
  }, [])

  // Save to localStorage when transactions update
  useEffect(() => {
    try {
      localStorage.setItem('bf_transaction_history', JSON.stringify({
        completed: completed.slice(-50), // Keep last 50
        failed: failed.slice(-50)
      }))
    } catch (e) {
      console.error('Failed to save transaction history', e)
    }
  }, [completed, failed])

  const trackTransaction = useCallback(async (
    txHash: string,
    description: string,
    waitForConfirmation?: (hash: string) => Promise<any>
  ) => {
    const transaction: TransactionStatus = {
      hash: txHash,
      description,
      status: 'pending',
      timestamp: Date.now()
    }

    setPending(prev => [...prev, transaction])
    
    // Show loading notification
    addNotification({
      title: 'Transaction Pending',
      message: `${description} - Processing...`,
      tag: 'transaction'
    })

    // If wait function provided, wait for confirmation
    if (waitForConfirmation) {
      try {
        const receipt = await waitForConfirmation(txHash)
        
        // Update to confirmed
        const confirmed: TransactionStatus = {
          ...transaction,
          status: 'confirmed',
          blockNumber: receipt.blockNumber
        }

        setPending(prev => prev.filter(t => t.hash !== txHash))
        setCompleted(prev => [confirmed, ...prev])

        addNotification({
          title: 'Transaction Confirmed',
          message: `${description} - Success!`,
          tag: 'success'
        })
      } catch (error: any) {
        // Update to failed
        const failedTx: TransactionStatus = {
          ...transaction,
          status: 'failed',
          error: error.message || 'Transaction failed'
        }

        setPending(prev => prev.filter(t => t.hash !== txHash))
        setFailed(prev => [failedTx, ...prev])

        addNotification({
          title: 'Transaction Failed',
          message: `${description} - ${error.message || 'Failed'}`,
          tag: 'error'
        })
      }
    }
  }, [addNotification])

  const clearHistory = useCallback(() => {
    setCompleted([])
    setFailed([])
    try {
      localStorage.removeItem('bf_transaction_history')
    } catch (e) {
      console.error('Failed to clear transaction history', e)
    }
  }, [])

  const getTransactionHistory = useCallback(() => {
    return {
      pending,
      completed,
      failed,
      all: [...pending, ...completed, ...failed].sort((a, b) => b.timestamp - a.timestamp)
    }
  }, [pending, completed, failed])

  return {
    trackTransaction,
    pending,
    completed,
    failed,
    clearHistory,
    getTransactionHistory,
    hasPending: pending.length > 0
  }
}

