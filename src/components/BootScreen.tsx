/**
 * BootScreen — Full viewport boot animation with particle scatter → eagle reveal
 */

import { useState, useEffect } from 'react';
import { EagleCore } from './EagleCore';

export type BootStatus = 'loading' | 'ready' | 'error';

export interface BootScreenProps {
  onReady?: () => void;
  className?: string;
}

export function BootScreen({ onReady, className = '' }: BootScreenProps) {
  const [status, setStatus] = useState<BootStatus>('loading');
  const [phase, setPhase] = useState<'particles' | 'eagle' | 'text' | 'done'>('particles');
  const [transcript, setTranscript] = useState('');
  const [showMicPrompt, setShowMicPrompt] = useState(false);

  useEffect(() => {
    // Boot sequence timeline
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1: Particle scatter (1s)
    timers.push(setTimeout(() => setPhase('eagle'), 1000));
    
    // Phase 2: Eagle fades in (0.8s later)
    timers.push(setTimeout(() => setPhase('text'), 1800));
    
    // Phase 3: Status text materializes
    timers.push(setTimeout(() => {
      setTranscript('ADLER SYNOD COMMAND INTERFACE ONLINE');
    }, 2300));
    
    // Phase 4: Mic prompt appears
    timers.push(setTimeout(() => {
      setShowMicPrompt(true);
      setStatus('ready');
    }, 3000));

    // Auto-trigger ready after full boot
    timers.push(setTimeout(() => {
      onReady?.();
    }, 3500));

    return () => timers.forEach(clearTimeout);
  }, [onReady]);

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center ${className}`}>
      {/* Dark gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, #0A0E1A 0%, #000000 100%)',
        }}
      />
      
      {/* Eagle Core — always mounted, controls its own animation */}
      <div 
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-1000"
        style={{ opacity: phase === 'particles' ? 0 : 1 }}
      >
        <EagleCore active={phase !== 'particles'} />
      </div>

      {/* Status text */}
      <div 
        className="absolute bottom-1/3 left-0 right-0 flex justify-center"
        style={{ 
          opacity: phase === 'text' || phase === 'done' ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        <p 
          className="font-jetbrains text-amber text-sm tracking-widest text-center"
          style={{ 
            textShadow: '0 0 10px rgba(245,166,35,0.5)',
            letterSpacing: '0.2em',
          }}
        >
          {transcript || 'INITIALIZING...'}
        </p>
      </div>

      {/* Mic prompt */}
      {showMicPrompt && (
        <div 
          className="absolute bottom-20 flex flex-col items-center gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-2 text-silver text-sm font-inter">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <span>Say &apos;Hey EagleOne&apos; or click to begin</span>
          </div>
          
          {/* Amber accent line */}
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber to-transparent opacity-50" />
        </div>
      )}

      {/* Status indicator */}
      {status === 'error' && (
        <div className="absolute bottom-10 text-ember font-jetbrains text-xs">
          BOOT ERROR — CHECK GATEWAY CONNECTION
        </div>
      )}
    </div>
  );
}

export default BootScreen;