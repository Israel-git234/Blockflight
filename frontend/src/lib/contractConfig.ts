/**
 * Contract configuration and utilities
 */

export const CONTRACT_ADDRESSES = {
  AVIATOR: import.meta.env.VITE_AVIATOR_CONTRACT || '',
  CRUISE: import.meta.env.VITE_CRUISE_CONTRACT || '',
  COMMUNITY_MARKET: import.meta.env.VITE_COMMUNITY_MARKET_CONTRACT || ''
}

export const isContractConfigured = (contractName: keyof typeof CONTRACT_ADDRESSES): boolean => {
  return !!CONTRACT_ADDRESSES[contractName]
}

export const areContractsConfigured = (): boolean => {
  return Object.values(CONTRACT_ADDRESSES).some(addr => !!addr)
}

/**
 * Get contract address or return null with warning
 */
export function getContractAddress(contractName: keyof typeof CONTRACT_ADDRESSES): string | null {
  const address = CONTRACT_ADDRESSES[contractName]
  if (!address) {
    console.warn(`${contractName} contract address not configured. Set VITE_${contractName}_CONTRACT in .env`)
    return null
  }
  return address
}


