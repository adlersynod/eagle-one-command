/**
 * EagleOne Command — Gateway Client
 * WebSocket + REST client for OpenClaw gateway
 * Phase 1: demo mode; Phase 2: real OpenClaw streaming
 */

export type GatewayStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface GatewayMessage {
  token?: string
  done?: boolean
  error?: string
}

type MessageHandler = (msg: GatewayMessage) => void
type StatusHandler = (status: GatewayStatus) => void

const GATEWAY_WS_URL =
  import.meta.env.VITE_GS_URL || 'ws://127.0.0.1:56565/api/v1/chat/stream'
const GATEWAY_REST_URL =
  import.meta.env.VITE_REST_URL || 'http://127.0.0.1:56565/api/v1/chat'

export class GatewayClient {
  private ws: WebSocket | null = null
  private status: GatewayStatus = 'disconnected'
  private messageHandlers: Set<MessageHandler> = new Set()
  private statusHandlers: Set<StatusHandler> = new Set()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private demoMode = false

  constructor() {
    // Detect if gateway is reachable — if not, fall back to demo mode
    this.checkGatewayReachability()
  }

  private async checkGatewayReachability(): Promise<void> {
    try {
      const res = await fetch(GATEWAY_REST_URL.replace('/api/v1/chat', '/health'), {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      })
      if (!res.ok) throw new Error('Gateway unreachable')
    } catch {
      this.demoMode = true
      console.warn('[GatewayClient] OpenClaw gateway unreachable — demo mode active')
    }
  }

  /** Establish WebSocket connection to OpenClaw gateway */
  connect(): void {
    if (this.demoMode) {
      this.setStatus('connected')
      return
    }

    if (this.ws?.readyState === WebSocket.OPEN) return

    this.setStatus('connecting')

    try {
      this.ws = new WebSocket(GATEWAY_WS_URL)

      this.ws.onopen = () => {
        this.setStatus('connected')
        this.startPing()
      }

      this.ws.onmessage = (event: MessageEvent) => {
        // SSE format: "data: {\"token\":\"word \"}\n\n"
        const raw = event.data as string
        const lines = raw.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6)) as GatewayMessage
            this.messageHandlers.forEach(h => h(data))
          } catch {
            // ignore parse errors
          }
        }
      }

      this.ws.onerror = () => {
        this.setStatus('error')
      }

      this.ws.onclose = () => {
        this.setStatus('disconnected')
        this.stopPing()
        this.scheduleReconnect()
      }
    } catch {
      this.demoMode = true
      this.setStatus('connected')
    }
  }

  /** Send a message and stream the response */
  async sendMessage(
    message: string,
    onChunk?: (token: string) => void,
    onDone?: () => void,
    onError?: (err: string) => void
  ): Promise<void> {
    if (this.demoMode) {
      await this.demoStream(message, onChunk, onDone)
      return
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect()
      // Wait briefly for connect
      await new Promise(r => setTimeout(r, 500))
    }

    try {
      // Send via REST with SSE — more reliable than raw WS for streaming
      const res = await fetch(GATEWAY_REST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ message, stream: true }),
        signal: AbortSignal.timeout(30000),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as GatewayMessage
              if (data.token) onChunk?.(data.token)
              if (data.done) onDone?.()
              if (data.error) onError?.(data.error)
            } catch {
              // ignore
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.slice(6)) as GatewayMessage
          if (data.token) onChunk?.(data.token)
          if (data.done) onDone?.()
        } catch {
          // ignore
        }
      }

      onDone?.()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Unknown error')
      // Fallback to demo on error
      await this.demoStream(message, onChunk, onDone)
    }
  }

  /** Heartbeat ping to keep WebSocket alive */
  ping(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping' }))
    }
  }

  /** Register a handler for incoming messages */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  /** Register a handler for connection status changes */
  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler)
    return () => this.statusHandlers.delete(handler)
  }

  /** Current connection status */
  isConnected(): boolean {
    return this.status === 'connected'
  }

  getStatus(): GatewayStatus {
    return this.status
  }

  /** Disconnect and clean up */
  disconnect(): void {
    this.stopPing()
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
    this.setStatus('disconnected')
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private setStatus(status: GatewayStatus): void {
    this.status = status
    this.statusHandlers.forEach(h => h(status))
  }

  private startPing(): void {
    this.pingTimer = setInterval(() => this.ping(), 25000)
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, 5000)
  }

  /** Demo mode streaming for Phase 1 when gateway is unreachable */
  private async demoStream(
    message: string,
    onChunk?: (token: string) => void,
    onDone?: () => void
  ): Promise<void> {
    const responses: Record<string, string> = {
      default: "EagleOne Command online. Gateway in demo mode — connect to OpenClaw for full streaming responses.",
      status: "All systems nominal. Gateway: connected, Agents: 6/6 active, Memory: 84%.",
      wmt: "WMT: $127.26. Daily delta: +$0.43. Liquidation tracker running.",
      help: "Available commands: status, wmt, agents, memory, or ask me anything about the Adler Synod portfolio.",
    }

    const demo = responses[message.toLowerCase()] ?? responses.default
    const words = demo.split(' ')

    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 40))
      onChunk?.(words[i] + (i < words.length - 1 ? ' ' : ''))
    }

    onDone?.()
  }
}

// Singleton instance
export const gatewayClient = new GatewayClient()
