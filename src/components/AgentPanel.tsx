/**
 * AgentPanel — Glassmorphism card for displaying agent status + last response
 */

export type AgentStatus = 'idle' | 'active' | 'error' | 'loading'

export interface StreamingState {
  state?: 'idle' | 'streaming' | 'done' | 'error'
}

interface AgentPanelProps {
  agentId: string
  agentName: string
  status: AgentStatus
  lastResponse?: string
  specialty?: string
  onClick?: () => void
  className?: string
}

const agentColors: Record<string, string> = {
  EagleApex: 'var(--amber-primary)',
  EagleScout: 'var(--amber-secondary)',
  EagleTek: 'var(--amber-accent)',
  EagleSearch: '#D4850A',
  EagleDev: 'var(--success)',
  EagleForge: 'var(--amber-primary)',
}

const agentIcons: Record<string, JSX.Element> = {
  EagleApex: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L2 7l8 5 8-5-8-5z" /></svg>,
  EagleScout: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" /><circle cx="10" cy="10" r="3.5" /></svg>,
  EagleTek: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3z" /><path fillRule="evenodd" d="M13 8V5a1 1 0 00-1-1H4a1 1 0 00-1 1v3a1 1 0 001 1h1v2a1 1 0 002 0V9h4v2a1 1 0 002 0V9h1a1 1 0 001-1V8h-1z" clipRule="evenodd" /></svg>,
  EagleSearch: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" /></svg>,
  EagleDev: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5z" clipRule="evenodd" /></svg>,
  EagleForge: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616.293.434A1 1 0 0115 10.32V12h1v2.32a1 1 0 01-1.008.957L9 13l-.616.821A1 1 0 017 15H5a1 1 0 01-.892-1.375l.615-.821L4.992 13H4v-2.68a1 1 0 01-.554-.896L3 10.323V12H2V8a1 1 0 011-1z" /></svg>,
}

export function AgentPanel({
  agentId,
  agentName,
  status,
  lastResponse,
  specialty,
  onClick,
  className = '',
}: AgentPanelProps) {
  const accentColor = agentColors[agentName] || 'var(--amber-primary)'
  const icon = agentIcons[agentName]

  const statusConfig = {
    idle: { dot: 'var(--text-secondary)', label: 'IDLE' },
    active: { dot: 'var(--amber-primary)', label: 'ACTIVE' },
    error: { dot: 'var(--error)', label: 'ERROR' },
    loading: { dot: 'var(--amber-secondary)', label: 'LOADING' },
  }

  const currentStatus = statusConfig[status]

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-4 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 relative overflow-hidden ${className}`}
      style={{
        borderColor: status === 'active' ? accentColor : 'var(--amber-border)',
        borderWidth: status === 'active' ? '1.5px' : '1px',
      }}
    >
      {/* Accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: accentColor }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span style={{ color: accentColor }}>{icon}</span>
          <span className="font-display text-sm tracking-wide">{agentName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full status-dot" style={{ background: currentStatus.dot }} />
          <span className="text-xs font-mono" style={{ color: currentStatus.dot }}>{currentStatus.label}</span>
        </div>
      </div>

      {/* Specialty */}
      {specialty && (
        <div className="text-xs font-mono text-[var(--text-secondary)] mb-2 truncate">{specialty}</div>
      )}

      {/* Last Response Preview */}
      <div className="text-xs font-mono text-[var(--text-secondary)] line-clamp-2 leading-relaxed min-h-[2.5rem]">
        {lastResponse || 'Awaiting task assignment...'}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-[var(--amber-border)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[var(--text-secondary)]">AGENT-{agentId}</span>
          {status === 'loading' && (
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--amber-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--amber-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--amber-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgentPanel