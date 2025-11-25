import { useMemo, useCallback } from 'react'
import { ethers } from 'ethers'
import { getContract } from './ethersClient'
import { CRUISE_ABI } from './cruiseAbi'

/**
 * Hook for interacting with the CruiseMode contract
 */
export function useCruiseModeContract(account: string | null) {
  const contractAddress = import.meta.env.VITE_CRUISE_CONTRACT

  const contract = useMemo(() => {
    if (!contractAddress) {
      console.warn('VITE_CRUISE_CONTRACT not set in environment variables')
      return null
    }
    return getContract(contractAddress, CRUISE_ABI, true)
  }, [contractAddress])

  const stake = useCallback(async (amountEth: string, lockSeconds: number) => {
    if (!contract || !account) {
      throw new Error('Contract not initialized or wallet not connected')
    }

    try {
      const amountWei = ethers.parseEther(amountEth)
      const tx = await contract.stake(lockSeconds, { value: amountWei })
      // Return transaction object with hash for tracking
      return { hash: tx.hash, wait: () => tx.wait() }
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user')
      } else if (error.reason) {
        throw new Error(error.reason)
      } else {
        throw new Error('Failed to stake: ' + (error.message || 'Unknown error'))
      }
    }
  }, [contract, account])

  const unstake = useCallback(async () => {
    if (!contract || !account) {
      throw new Error('Contract not initialized or wallet not connected')
    }

    try {
      const tx = await contract.unstake()
      // Return transaction object with hash for tracking
      return { hash: tx.hash, wait: () => tx.wait() }
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user')
      } else if (error.reason) {
        throw new Error(error.reason)
      } else {
        throw new Error('Failed to unstake: ' + (error.message || 'Unknown error'))
      }
    }
  }, [contract, account])

  const canUnstake = useCallback(async (userAddress: string) => {
    if (!contract) {
      throw new Error('Contract not initialized')
    }

    try {
      return await contract.canUnstake(userAddress)
    } catch (error: any) {
      throw new Error('Failed to check unstake status: ' + (error.message || 'Unknown error'))
    }
  }, [contract])

  const previewPayout = useCallback(async (userAddress: string) => {
    if (!contract) {
      throw new Error('Contract not initialized')
    }

    try {
      const [payoutWei, appliedX100] = await contract.previewPayout(userAddress)
      return {
        payoutWei: payoutWei.toString(),
        appliedX100: Number(appliedX100) / 100,
        payoutEth: ethers.formatEther(payoutWei)
      }
    } catch (error: any) {
      throw new Error('Failed to preview payout: ' + (error.message || 'Unknown error'))
    }
  }, [contract])

  const getStake = useCallback(async (userAddress: string) => {
    if (!contract) {
      throw new Error('Contract not initialized')
    }

    try {
      const stake = await contract.stakes(userAddress)
      return {
        amountWei: stake.amountWei.toString(),
        amountEth: ethers.formatEther(stake.amountWei),
        startTs: Number(stake.startTs),
        lockSeconds: Number(stake.lockSeconds),
        active: stake.active
      }
    } catch (error: any) {
      throw new Error('Failed to get stake: ' + (error.message || 'Unknown error'))
    }
  }, [contract])

  const getTrend = useCallback(async () => {
    if (!contract) {
      throw new Error('Contract not initialized')
    }

    try {
      const trendX100 = await contract.trendX100()
      return Number(trendX100) / 100
    } catch (error: any) {
      throw new Error('Failed to get trend: ' + (error.message || 'Unknown error'))
    }
  }, [contract])

  return {
    contract,
    contractAddress,
    stake,
    unstake,
    canUnstake,
    previewPayout,
    getStake,
    getTrend,
    isReady: !!contract && !!contractAddress
  }
}


