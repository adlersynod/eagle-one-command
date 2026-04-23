import { useCallback, useState } from 'react'

export type StreamStatus = 'idle' | 'connecting' | 'streaming' | 'done' | 'error'

export interface UseGatewayStreamReturn {
  status: StreamStatus
  fullText: string
  send: (message: string) => Promise<void>
  isConnected: boolean
}

export function useGatewayStream(): UseGatewayStreamReturn {
  const [isConnected] = useState(true)
  const [fullText, setFullText] = useState('')
  const [status, setStatus] = useState<StreamStatus>('idle')

  const send = useCallback(async (message: string) => {
    setStatus('connecting')
    setFullText('')
    
    try {
      setStatus('streaming')
      
      const words = message.split(' ')
      let accumulated = ''
      
      for (const word of words) {
        accumulated += word + ' '
        setFullText(accumulated)
        await new Promise((r) => setTimeout(r, 30))
      }
      
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }, [])

  return { status, fullText, send, isConnected }
}

export function useGatewayStatus(): { online: boolean } {
  return { online: true }
}
