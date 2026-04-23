/**
 * EagleOne Command — Gateway Client
 * Connects to OpenClaw via OpenAI-compatible Responses API (/v1/responses)
 * Falls back to demo mode if gateway is unreachable
 */

export type GatewayStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface GatewayMessage {
  token?: string
  done?: boolean
  error?: string
}

type MessageHandler = (msg: GatewayMessage) => void
type StatusHandler = (status: GatewayStatus) => void

// OpenClaw gateway on loopback
const GATEWAY_URL =
  import.meta.env.VITE_GATEWAY_URL || '/v1'
const GATEWAY_TOKEN =
  import.meta.env.VITE_OPENCLAW_TOKEN || ''
const AGENT_MODEL =
  import.meta.env.VITE_OPENCLAW_AGENT || 'openclaw'

export class GatewayClient {
  private status: GatewayStatus = 'disconnected'
  private messageHandlers: Set<MessageHandler> = new Set()
  private statusHandlers: Set<StatusHandler> = new Set()
  private demoMode = false

  constructor() {
    this.checkGatewayReachability()
  }

  private async checkGatewayReachability(): Promise<void> {
    try {
      const res = await fetch(`${GATEWAY_URL}/v1/models`, {
        headers: { Authorization: `Bearer ${GATEWAY_TOKEN}` },
        signal: AbortSignal.timeout(2000),
      })
      if (!res.ok) throw new Error('Gateway unreachable')
    } catch {
      this.demoMode = true
      console.warn('[GatewayClient] OpenClaw gateway unreachable — demo mode active')
    }
  }

  /** Send a message and stream the response via OpenAI Responses API */
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

    this.setStatus('connecting')

    try {
      const res = await fetch(`${GATEWAY_URL}/v1/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GATEWAY_TOKEN}`,
        },
        body: JSON.stringify({
          model: AGENT_MODEL,
          stream: true,
          input: message,
        }),
        signal: AbortSignal.timeout(60000),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`HTTP ${res.status}: ${err}`)
      }

      this.setStatus('connected')
      await this.parseSSEResponse(res, onChunk, onDone)
      onDone?.()
    } catch (err) {
      this.setStatus('error')
      onError?.(err instanceof Error ? err.message : 'Unknown error')
      // Fallback to demo on error
      await this.demoStream(message, onChunk, onDone)
    }
  }

  /** Parse SSE stream from OpenAI Responses API */
  private async parseSSEResponse(
    res: Response,
    onChunk?: (token: string) => void,
    onDone?: () => void
  ): Promise<void> {
    if (!res.body) throw new Error('No response body')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('event: ')) continue
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim()
            if (dataStr === '[DONE]') continue

            try {
              const event = JSON.parse(dataStr)
              // OpenAI Responses API streaming events
              if (event.type === 'response.output_text.delta') {
                onChunk?.(event.delta)
              } else if (event.type === 'response.done') {
                onDone?.()
              } else if (event.type === 'error') {
                throw new Error(event.error?.message || 'Streaming error')
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.startsWith('data: ')) {
        try {
          const event = JSON.parse(buffer.slice(6).trim())
          if (event.type === 'response.output_text.delta') {
            onChunk?.(event.delta)
          }
        } catch {
          // ignore
        }
      }

      onDone?.()
    } catch (err) {
      throw err
    }
  }

  /** Heartbeat ping */
  ping(): void {
    // No-op for HTTP-based client
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
    this.setStatus('disconnected')
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private setStatus(status: GatewayStatus): void {
    this.status = status
    this.statusHandlers.forEach(h => h(status))
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
      apex: "EagleApex reporting: WMT position under review. Capital gains strategy active. RV park underwriting in progress.",
      scout: "EagleScout reporting: 3 new PNW RV park leads identified. Cap rates 5.2–7.1%. Deep dive queued.",
      tek: "EagleTek reporting: Brinkley 4100 systems nominal. Ram 3500 oil change due in 500 miles. RV Tech prep on track.",
      search: "EagleSearch reporting: Walmart sector sentiment neutral-to-positive. No regulatory headwinds. RV industry growth +8.2% YoY.",
      devops: "EagleDevOps reporting: Mac Mini uptime 99.97%. Gateway stable. Memory systems healthy. CI/CD pipeline nominal.",
      forge: "EagleForge reporting: Sprint complete. Build → QA → Deploy pipeline active. Next sprint queued for Phase 2 enhancements.",
    }

    const key = message.toLowerCase().replace(/[^a-z]/g, '')
    const demo = responses[key] ?? responses.default
    const words = demo.split(' ')

    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 35))
      onChunk?.(words[i] + (i < words.length - 1 ? ' ' : ''))
    }

    onDone?.()
  }
}

// Singleton instance
export const gatewayClient = new GatewayClient()
