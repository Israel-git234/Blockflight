import { ethers } from 'ethers'

export function getProvider() {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum as any)
  }
  // fallback read-only provider (adjust to BlockDAG if available)
  return new ethers.JsonRpcProvider('https://relay.awakening.bdagscan.com')
}

export async function getSigner() {
  const provider = getProvider()
  // Only BrowserProvider has getSigner
  if ('getSigner' in provider) {
    return await (provider as ethers.BrowserProvider).getSigner()
  }
  throw new Error('No wallet available')
}

export async function getContract(address: string, abi: any, withSigner = false) {
  const provider = getProvider()
  if (withSigner && 'getSigner' in provider) {
    try {
      const signer = await (provider as ethers.BrowserProvider).getSigner()
      return new ethers.Contract(address, abi, signer)
    } catch (error) {
      // If signer fails, fall back to read-only provider
      console.warn('Failed to get signer, using read-only provider:', error)
      return new ethers.Contract(address, abi, provider)
    }
  }
  return new ethers.Contract(address, abi, provider)
}


