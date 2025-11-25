import { useMemo, useCallback } from 'react'
import { ethers } from 'ethers'
import { getContract } from './ethersClient'
import { COMMUNITY_MARKET_ABI } from './communityMarketAbi'

/**
 * Hook for interacting with the CommunityMarket contract
 */
export function useCommunityMarketContract(account: string | null) {
  const contractAddress = import.meta.env.VITE_COMMUNITY_MARKET_CONTRACT

  const contract = useMemo(() => {
    if (!contractAddress) {
      console.warn('VITE_COMMUNITY_MARKET_CONTRACT not set in environment variables')
      return null
    }
    return getContract(contractAddress, COMMUNITY_MARKET_ABI, true)
  }, [contractAddress])

  const createMarket = useCallback(async (
    title: string,
    description: string,
    category: string,
    privateGroupId: string,
    endsAt: number,
    yesOddsX100: number,
    noOddsX100: number
  ) => {
    if (!contract || !account) {
      throw new Error('Contract not initialized or wallet not connected')
    }

    try {
      const tx = await contract.createMarket(
        title,
        description,
        category,
        privateGroupId,
        endsAt,
        Math.floor(yesOddsX100),
        Math.floor(noOddsX100)
      )
      // Return transaction object with hash for tracking
      // Market ID will be extracted from events after confirmation
      return { hash: tx.hash, wait: () => tx.wait() }
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user')
      } else if (error.reason) {
        throw new Error(error.reason)
      } else {
        throw new Error('Failed to create market: ' + (error.message || 'Unknown error'))
      }
    }
  }, [contract, account])

  const bet = useCallback(async (marketId: number, yes: boolean, amountEth: string) => {
    if (!contract || !account) {
      throw new Error('Contract not initialized or wallet not connected')
    }

    try {
      const amountWei = ethers.parseEther(amountEth)
      const tx = await contract.bet(marketId, yes, { value: amountWei })
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

  const claim = useCallback(async (marketId: number) => {
    if (!contract || !account) {
      throw new Error('Contract not initialized or wallet not connected')
    }

    try {
      const tx = await contract.claim(marketId)
      return await tx.wait()
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user')
      } else if (error.reason) {
        throw new Error(error.reason)
      } else {
        throw new Error('Failed to claim: ' + (error.message || 'Unknown error'))
      }
    }
  }, [contract, account])

  const previewClaim = useCallback(async (marketId: number, userAddress: string) => {
    if (!contract) {
      throw new Error('Contract not initialized')
    }

    try {
      const [payoutWei, feeWei] = await contract.previewClaim(marketId, userAddress)
      return {
        payoutWei: payoutWei.toString(),
        feeWei: feeWei.toString(),
        payoutEth: ethers.formatEther(payoutWei),
        feeEth: ethers.formatEther(feeWei)
      }
    } catch (error: any) {
      throw new Error('Failed to preview claim: ' + (error.message || 'Unknown error'))
    }
  }, [contract])

  const getMarket = useCallback(async (marketId: number) => {
    if (!contract) {
      throw new Error('Contract not initialized')
    }

    try {
      const market = await contract.markets(marketId)
      return {
        creator: market.creator,
        title: market.title,
        description: market.description,
        category: market.category,
        privateGroupId: market.privateGroupId,
        endsAt: Number(market.endsAt),
        yesOddsX100: Number(market.yesOddsX100) / 100,
        noOddsX100: Number(market.noOddsX100) / 100,
        totalYesWei: market.totalYesWei.toString(),
        totalNoWei: market.totalNoWei.toString(),
        resolved: market.resolved,
        outcomeYes: market.outcomeYes
      }
    } catch (error: any) {
      throw new Error('Failed to get market: ' + (error.message || 'Unknown error'))
    }
  }, [contract])

  const getMarketCount = useCallback(async () => {
    if (!contract) {
      throw new Error('Contract not initialized')
    }

    try {
      const count = await contract.marketCount()
      return Number(count)
    } catch (error: any) {
      throw new Error('Failed to get market count: ' + (error.message || 'Unknown error'))
    }
  }, [contract])

  return {
    contract,
    contractAddress,
    createMarket,
    bet,
    claim,
    previewClaim,
    getMarket,
    getMarketCount,
    isReady: !!contract && !!contractAddress
  }
}


