/**
 * StatusBar — Fixed top-right glassmorphism panel with live metrics
 */

import { useState, useEffect } from 'react'

export interface StatusMetrics {
  wmtPrice?: number
  gatewayOnline?: boolean
  activeAgents?: number
  totalAgents?: number
  memoryPct?: number
}

interface StatusBarProps {
  wmtPrice?: number
  gatewayOnline?: boolean
  activeAgents?: number
  totalAgents?: number
  memoryUsage?: number
  className?: string
}

function UptimeCounter() {
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setUptime((u) => u + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const h = Math.floor(uptime / 3600)
  const m = Math.floor((uptime % 3600) / 60)
  const s = uptime % 60
  return (
    <span className="font-mono text-xs text-[var(--text-secondary)]">
      {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  )
}

export function StatusBar({
  wmtPrice,
  gatewayOnline = false,
  activeAgents = 0,
  totalAgents = 6,
  memoryUsage = 0,
  className = '',
}: StatusBarProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const statusColor = gatewayOnline ? 'var(--success)' : 'var(--error)'
  const statusLabel = gatewayOnline ? 'ONLINE' : 'OFFLINE'

  return (
    <div className={`glass-panel p-4 min-w-[260px] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--amber-border)]">
        <span className="font-display text-[var(--amber-primary)] text-xs tracking-wider">SYSTEM STATUS</span>
        <span className="text-xs font-mono" style={{ color: statusColor }}>{statusLabel}</span>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)] text-xs font-mono">WMT</span>
          <span className="font-mono text-[var(--amber-primary)] font-medium">
            {wmtPrice ? `$${wmtPrice.toFixed(2)}` : '---'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)] text-xs font-mono">GATEWAY</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full status-dot" style={{ background: statusColor }} />
            <span className="font-mono text-xs" style={{ color: statusColor }}>{statusLabel}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)] text-xs font-mono">AGENTS</span>
          <span className="font-mono text-xs">
            <span style={{ color: activeAgents > 0 ? 'var(--amber-primary)' : 'var(--text-secondary)' }}>{activeAgents}</span>
            /{totalAgents}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)] text-xs font-mono">UPTIME</span>
          <UptimeCounter />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)] text-xs font-mono">MEMORY</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-[var(--bg-deep)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${memoryUsage}%`,
                  background: memoryUsage > 85 ? 'var(--error)' : 'var(--amber-primary)',
                }}
              />
            </div>
            <span className="font-mono text-xs text-[var(--text-secondary)]">{memoryUsage}%</span>
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="mt-3 pt-2 border-t border-[var(--amber-border)] text-center">
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>
    </div>
  )
}

export default StatusBar