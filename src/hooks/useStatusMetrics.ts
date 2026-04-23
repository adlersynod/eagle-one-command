import { useEffect, useState } from 'react'

interface StatusMetrics {
  wmtPrice: number
  gatewayOnline: boolean
  activeAgents: number
  memoryUsage: number
}

export function useStatusMetrics(pollInterval = 10000) {
  const [metrics, setMetrics] = useState<StatusMetrics>({
    wmtPrice: 0,
    gatewayOnline: true,
    activeAgents: 0,
    memoryUsage: 42,
  })

  useEffect(() => {
    const tick = () => {
      setMetrics({
        wmtPrice: 87.42 + Math.random() * 0.5,
        gatewayOnline: true,
        activeAgents: Math.floor(Math.random() * 3),
        memoryUsage: 35 + Math.floor(Math.random() * 25),
      })
    }
    tick()
    const interval = setInterval(tick, pollInterval)
    return () => clearInterval(interval)
  }, [pollInterval])

  return { metrics }
}