/**
 * Error handling utilities for contract interactions
 */

export interface TransactionError {
  code?: string | number
  message: string
  reason?: string
  userRejected?: boolean
  contractError?: boolean
  networkError?: boolean
}

/**
 * Parse and categorize contract interaction errors
 */
export function parseContractError(error: any): TransactionError {
  const parsed: TransactionError = {
    message: 'An unknown error occurred'
  }

  // User rejection
  if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
    parsed.userRejected = true
    parsed.message = 'Transaction was rejected by user'
    parsed.code = error.code
    return parsed
  }

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
    parsed.networkError = true
    parsed.message = 'Network error. Please check your connection.'
    parsed.code = error.code
    return parsed
  }

  // Contract revert errors
  if (error.reason || error.data || error.code === -32603) {
    parsed.contractError = true
    parsed.reason = error.reason
    parsed.message = error.reason || 'Contract execution failed'
    parsed.code = error.code
    return parsed
  }

  // Insufficient funds
  if (error.message?.includes('insufficient funds') || error.message?.includes('balance')) {
    parsed.contractError = true
    parsed.message = 'Insufficient funds for this transaction'
    return parsed
  }

  // Generic error
  parsed.message = error.message || error.toString() || 'An unknown error occurred'
  parsed.code = error.code

  return parsed
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: TransactionError): string {
  if (error.userRejected) {
    return 'Transaction cancelled'
  }

  if (error.networkError) {
    return 'Network error. Please check your connection and try again.'
  }

  if (error.contractError) {
    return error.message || 'Transaction failed. Please check the details and try again.'
  }

  return error.message || 'An error occurred. Please try again.'
}

/**
 * Check if error is recoverable (user can retry)
 */
export function isRecoverableError(error: TransactionError): boolean {
  return !error.userRejected && (error.networkError || !error.contractError)
}


