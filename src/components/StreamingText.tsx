/**
 * StreamingText — Word-by-word streaming text renderer
 */

import { useEffect, useState, useRef } from 'react'

export type StreamingState = 'idle' | 'streaming' | 'complete' | 'done' | 'error'

interface StreamingTextProps {
  text: string
  state?: StreamingState
  onComplete?: () => void
  className?: string
}

export function StreamingText({
  text,
  state = 'idle',
  onComplete,
  className = '',
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [charIndex, setCharIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const resolvedState = state === 'complete' || state === 'done' ? 'done' : state

  useEffect(() => {
    if (resolvedState !== 'streaming') {
      setDisplayedText(text)
      return
    }

    if (charIndex < text.length) {
      const targetIndex = Math.min(charIndex + 3, text.length)
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, targetIndex))
        setCharIndex(targetIndex)
      }, 20)
      return () => clearTimeout(timer)
    } else {
      setDisplayedText(text)
      onComplete?.()
    }
  }, [charIndex, text, resolvedState, onComplete])

  useEffect(() => {
    if (resolvedState === 'streaming' && text !== displayedText) {
      setCharIndex(0)
      setDisplayedText('')
    }
  }, [text, resolvedState])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [displayedText])

  if (resolvedState === 'error') {
    return (
      <div className={`font-mono text-sm text-[var(--error)] ${className}`}>
        ⚠ Error: {text || 'Failed to load response'}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`font-mono text-sm leading-relaxed min-h-[2rem] max-h-48 overflow-y-auto pr-2 ${className}`}
    >
      <span className="text-[var(--amber-primary)]">{displayedText}</span>
      {resolvedState === 'streaming' && (
        <span className="inline-block w-2 h-4 ml-0.5 bg-[var(--amber-primary)] animate-pulse opacity-80" />
      )}
    </div>
  )
}

export default StreamingText