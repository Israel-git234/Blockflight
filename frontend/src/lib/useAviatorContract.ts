import { useMemo, useCallback, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getContract } from './ethersClient'
import { AVIATOR_ABI } from './aviatorAbi'

/**
 * Hook for interacting with the AviatorGame contract
 */
export function useAviatorContract(account: string | null) {
  const contractAddress = import.meta.env.VITE_AVIATOR_CONTRACT
  const [contract, setContract] = useState<ethers.Contract | null>(null)

  useEffect(() => {
    if (!contractAddress) {
      console.warn('VITE_AVIATOR_CONTRACT not set in environment variables')
      setContract(null)
      return
    }

    let cancelled = false

    const initContract = async () => {
      try {
        const contractInstance = await getContract(contractAddress, AVIATOR_ABI, true)
        if (cancelled) return
        
        // Verify contract has expected methods
        if (contractInstance && typeof contractInstance.currentRoundId === 'function') {
          setContract(contractInstance)
        } else {
          console.error('Contract ABI mismatch: currentRoundId method not found')
          setContract(null)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to initialize contract:', error)
          setContract(null)
        }
      }
    }

    initContract()

    return () => {
      cancelled = true
    }
  }, [contractAddress, account])

  const placeBet = useCallback(async (amountEth: string) => {
    if (!contract || !account) {
      throw new Error('Contract not initialized or wallet not connected')
    }

    try {
      const amountWei = ethers.parseEther(amountEth)
      const tx = await contract.placeBet({ value: amountWei })
      // Return transaction object with hash for tracking
      return { hash: tx.hash, wait: () => tx.wait() }
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user')
      } else if (error.reason) {
        throw new Error(error.reason)
      } else {
        throw new Error('Failed to place bet: ' + (error.message || 'Unknown error'))
      }
    }
  }, [contract, account])

  const cashOut = useCallback(async (targetX100: number) => {
    if (!contract || !account) {
      throw new Error('Contract not initialized or wallet not connected')
    }

    try {
      const tx = await contract.cashOut(Math.floor(targetX100))
      // Return transaction object with hash for tracking
      return { hash: tx.hash, wait: () => tx.wait() }
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user')
      } else if (error.reason) {
        throw new Error(error.reason)
      } else {
        throw new Error('Failed to cash out: ' + (error.message || 'Unknown error'))
      }
    }
  }, [contract, account])

  const forfeitOnCrash = useCallback(async () => {
    if (!contract || !account) {
      throw new Error('Contract not initialized or wallet not connected')
    }

    try {
      const tx = await contract.forfeitOnCrash()
      return await tx.wait()
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user')
      } else if (error.reason) {
        throw new Error(error.reason)
      } else {
        throw new Error('Failed to forfeit: ' + (error.message || 'Unknown error'))
      }
    }
  }, [contract, account])

  const getBet = useCallback(async (userAddress: string) => {
    if (!contract) {
      throw new Error('Contract not initialized')
    }

    try {
      return await contract.bets(userAddress)
    } catch (error: any) {
      throw new Error('Failed to get bet: ' + (error.message || 'Unknown error'))
    }
  }, [contract])

  const getRoundInfo = useCallback(async () => {
    if (!contract) {
      throw new Error('Contract not initialized')
    }

    try {
      // Check if contract has the function before calling
      if (typeof contract.currentRoundId !== 'function') {
        throw new Error('Contract ABI mismatch: currentRoundId is not a function')
      }

      const [currentRoundId, crashMultiplierX100, bettingOpen, roundStartTs] = await Promise.all([
        contract.currentRoundId(),
        contract.crashMultiplierX100(),
        contract.bettingOpen(),
        contract.roundStartTs()
      ])

      return {
        currentRoundId: Number(currentRoundId),
        crashMultiplierX100: Number(crashMultiplierX100) / 100,
        bettingOpen,
        roundStartTs: Number(roundStartTs)
      }
    } catch (error: any) {
      throw new Error('Failed to get round info: ' + (error.message || 'Unknown error'))
    }
  }, [contract])

  return {
    contract,
    contractAddress,
    placeBet,
    cashOut,
    forfeitOnCrash,
    getBet,
    getRoundInfo,
    isReady: !!contract && !!contractAddress
  }
}


