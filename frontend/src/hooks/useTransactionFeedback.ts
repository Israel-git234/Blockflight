import { useState, useCallback } from 'react'
import { useNotifications } from '../components/NotificationsProvider'

export interface TransactionStatus {
  hash: string
  description: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  blockNumber?: number
}

/**
 * Hook for tracking and providing feedback on blockchain transactions
 */
export function useTransactionFeedback() {
  const { addNotification } = useNotifications()
  const [pendingTransactions, setPendingTransactions] = useState<TransactionStatus[]>([])
  const [completedTransactions, setCompletedTransactions] = useState<TransactionStatus[]>([])
  const [failedTransactions, setFailedTransactions] = useState<TransactionStatus[]>([])

  const trackTransaction = useCallback(async (
    txPromise: Promise<{ hash: string; wait: () => Promise<any> }>,
    description: string
  ) => {
    try {
      // Show pending notification
      const tx = await txPromise
      const status: TransactionStatus = {
        hash: tx.hash,
        description,
        status: 'pending',
        timestamp: Date.now()
      }

      setPendingTransactions(prev => [...prev, status])
      
      addNotification({
        title: 'Transaction Pending',
        message: `${description} - Waiting for confirmation...`,
        tag: 'transaction'
      })

      // Wait for confirmation
      const receipt = await tx.wait()
      
      // Move to completed
      setPendingTransactions(prev => prev.filter(t => t.hash !== tx.hash))
      const completed: TransactionStatus = {
        ...status,
        status: 'confirmed',
        blockNumber: receipt.blockNumber
      }
      setCompletedTransactions(prev => [...prev, completed])

      addNotification({
        title: 'Transaction Confirmed',
        message: `${description} - Success! Block: ${receipt.blockNumber}`,
        tag: 'success'
      })

      return receipt
    } catch (error: any) {
      // Handle error
      const failed: TransactionStatus = {
        hash: error.transactionHash || 'unknown',
        description,
        status: 'failed',
        timestamp: Date.now()
      }

      setPendingTransactions(prev => prev.filter(t => t.hash !== failed.hash))
      setFailedTransactions(prev => [...prev, failed])

      const errorMessage = error.reason || error.message || 'Transaction failed'
      addNotification({
        title: 'Transaction Failed',
        message: `${description} - ${errorMessage}`,
        tag: 'error'
      })

      throw error
    }
  }, [addNotification])

  const clearHistory = useCallback(() => {
    setCompletedTransactions([])
    setFailedTransactions([])
  }, [])

  return {
    trackTransaction,
    pendingTransactions,
    completedTransactions,
    failedTransactions,
    clearHistory,
    hasPendingTransactions: pendingTransactions.length > 0
  }
}


