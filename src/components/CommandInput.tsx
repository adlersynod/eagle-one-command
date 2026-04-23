/**
 * CommandInput — Holographic input field with mic + send icons
 */

import { useState, useRef, KeyboardEvent, FormEvent } from 'react'

export type InputStatus = 'idle' | 'listening' | 'processing' | 'disabled'

interface CommandInputProps {
  onSubmit?: (command: string) => void
  onSend?: (message: string) => void
  state?: InputStatus
  status?: InputStatus
  disabled?: boolean
  placeholder?: string
}

export function CommandInput({
  onSubmit,
  onSend,
  state,
  status,
  disabled,
  placeholder = 'Awaiting your command, Adler.',
}: CommandInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  const inputState = state || status || 'idle'
  const isDisabled = disabled || inputState === 'disabled'
  const isProcessing = inputState === 'processing'
  const isListening = inputState === 'listening'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim() && !isDisabled) {
      onSubmit?.(value.trim())
      onSend?.(value.trim())
      setValue('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel flex items-center gap-3 px-4 py-3 w-full max-w-2xl mx-auto"
    >
      {/* Mic */}
      <button
        type="button"
        onClick={() => inputRef.current?.focus()}
        className={`flex-shrink-0 transition-all duration-300 ${
          isListening ? 'text-[var(--amber-primary)] pulse-amber' : 'text-[var(--text-secondary)]'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-[var(--amber-primary)]'}`}
        disabled={isDisabled}
      >
        <svg className={`w-6 h-6 ${isListening ? 'scale-110' : ''}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 13a5 5 0 01-10 0A7.001 7.001 0 0011 14.93zM11 12a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        placeholder={isProcessing ? 'Processing...' : isListening ? 'Listening for "Hey EagleOne"...' : placeholder}
        className={`flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-[var(--text-secondary)] ${
          inputState === 'listening' ? 'text-[var(--amber-primary)]' : ''
        } ${isProcessing ? 'text-[var(--amber-secondary)] animate-pulse' : ''} ${isDisabled ? 'opacity-50' : ''}`}
      />

      {/* Send / Spinner */}
      {isProcessing ? (
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[var(--amber-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <button
          type="submit"
          disabled={isDisabled || !value.trim()}
          className={`flex-shrink-0 p-1 rounded transition-all duration-150 ${
            value.trim() && !isDisabled
              ? 'text-[var(--amber-primary)] hover:text-[var(--amber-accent)] hover:scale-110'
              : 'text-[var(--text-secondary)] opacity-50 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      )}
    </form>
  )
}

export default CommandInput