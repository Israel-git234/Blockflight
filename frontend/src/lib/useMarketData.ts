import { useEffect, useMemo, useRef, useState } from 'react'

export type MarketHealth = {
  source: 'coingecko' | 'proxy' | 'simulated'
  healthy: boolean
  lastUpdated: number | null
  error?: string
}

export type MarketSnapshot = {
  priceUsd: number
  emaShort: number
  emaLong: number
  volatility: number // rolling std-dev of returns (approx)
  history: { t: number; p: number }[]
  health: MarketHealth
}

const COINGECKO_URL = '/api/coingecko/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
const CRYPTOCOMPARE_URL = '/api/cryptocompare/data/price?fsym=ETH&tsyms=USD'

async function fetchCoingecko(): Promise<number> {
  const res = await fetch(COINGECKO_URL, { cache: 'no-store' })
  if (!res.ok) throw new Error(`coingecko ${res.status}`)
  const data = await res.json()
  const v = data?.ethereum?.usd
  if (typeof v !== 'number') throw new Error('coingecko bad payload')
  return v
}

async function fetchViaProxy(): Promise<number> { throw new Error('proxy disabled') }

function computeEMA(prev: number | null, price: number, k: number) {
  if (prev === null) return price
  return prev + k * (price - prev)
}

export function useMarketData(pollMs = 15000): MarketSnapshot {
  const [priceUsd, setPriceUsd] = useState<number>(2400)
  const [emaShort, setEmaShort] = useState<number | null>(null)
  const [emaLong, setEmaLong] = useState<number | null>(null)
  const [health, setHealth] = useState<MarketHealth>({ source: 'simulated', healthy: true, lastUpdated: null })
  const historyRef = useRef<{ t: number; p: number }[]>([])
  const nextDelayRef = useRef<number>(pollMs)
  const failCountRef = useRef<number>(0)

  // Poll market price with fallbacks
  useEffect(() => {
    let mounted = true
    let timer: any
    const poll = async () => {
      try {
        const res = await fetch(COINGECKO_URL, { cache: 'no-store' })
        if (res.status === 429) throw new Error('rate_limited')
        if (!res.ok) throw new Error(`coingecko ${res.status}`)
        const data = await res.json()
        const p = data?.ethereum?.usd
        if (typeof p !== 'number') throw new Error('coingecko bad payload')
        if (!mounted) return
        setPriceUsd(p)
        setHealth({ source: 'coingecko', healthy: true, lastUpdated: Date.now() })
        nextDelayRef.current = pollMs
        failCountRef.current = 0
      } catch (e: any) {
        try {
          const r2 = await fetch(CRYPTOCOMPARE_URL, { cache: 'no-store' })
          if (!r2.ok) throw new Error(`cc ${r2.status}`)
          const d2 = await r2.json()
          const p2 = d2?.USD
          if (typeof p2 !== 'number') throw new Error('cc bad payload')
          setPriceUsd(p2)
          setHealth({ source: 'proxy', healthy: true, lastUpdated: Date.now() })
          nextDelayRef.current = pollMs
        } catch (e2: any) {
          // backoff on errors/429, simulate locally
          failCountRef.current += 1
          const backoff = Math.min(60000, pollMs * Math.pow(2, Math.min(3, failCountRef.current - 1)))
          nextDelayRef.current = backoff
          setPriceUsd(prev => Math.max(1000, prev * (1 + (Math.random() - 0.5) * 0.002)))
          setHealth({ source: 'simulated', healthy: false, lastUpdated: Date.now(), error: e?.message || e2?.message || 'simulated' })
        }
      }
      timer = setTimeout(poll, nextDelayRef.current)
    }
    poll()
    return () => { mounted = false; if (timer) clearTimeout(timer) }
  }, [pollMs])

  // Maintain history, EMA and volatility
  useEffect(() => {
    const now = Date.now()
    const h = historyRef.current
    h.push({ t: now, p: priceUsd })
    while (h.length > 200) h.shift()
    // EMAs: short ~ 12 samples, long ~ 26 samples assuming ~15s
    setEmaShort(prev => computeEMA(prev, priceUsd, 2 / (12 + 1)))
    setEmaLong(prev => computeEMA(prev, priceUsd, 2 / (26 + 1)))
  }, [priceUsd])

  const volatility = useMemo(() => {
    const h = historyRef.current
    if (h.length < 10) return 0.02
    const returns: number[] = []
    for (let i = 1; i < h.length; i++) {
      returns.push((h[i].p - h[i - 1].p) / h[i - 1].p)
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((a, b) => a + (b - mean) * (b - mean), 0) / returns.length
    return Math.sqrt(variance)
  }, [priceUsd])

  return {
    priceUsd,
    emaShort: emaShort ?? priceUsd,
    emaLong: emaLong ?? priceUsd,
    volatility,
    history: historyRef.current,
    health
  }
}


