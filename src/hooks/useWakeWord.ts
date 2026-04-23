import { useState, useEffect, useCallback, useRef } from 'react';

export type WakeStatus = 'unsupported' | 'ready' | 'listening' | 'detected' | 'error';

export interface UseWakeWordReturn {
  status: WakeStatus;
  transcript: string;
  error: string | null;
  isListening: boolean;
  start: () => void;
  stop: () => void;
}

const WAKE_PHRASE = 'hey eagleone';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionType = any;

export function useWakeWord(onWake?: () => void): UseWakeWordReturn {
  const [status, setStatus] = useState<WakeStatus>('ready');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isListeningState, setIsListening] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionType>(null);
  const isListeningRef = useRef(false);

  const start = useCallback(() => {
    const win = window as unknown as { webkitSpeechRecognition?: SpeechRecognitionType; SpeechRecognition?: SpeechRecognitionType };
    const SR = win.webkitSpeechRecognition || win.SpeechRecognition;

    if (!SR) {
      setStatus('unsupported');
      setError('Speech recognition not supported in this browser');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SR as any)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      setStatus('listening');
      setError(null);
    };

    recognition.onresult = (event: { resultIndex: number; results: Array<{ 0: { transcript: string; isFinal: boolean } }> }) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i][0].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      const combined = final || interim;
      setTranscript(combined);

      if (combined.toLowerCase().trim().includes(WAKE_PHRASE)) {
        setStatus('detected');
        onWake?.();
      }
    };

    recognition.onerror = (event: { error?: string }) => {
      if (event.error === 'no-speech') return;
      setError(event.error || 'Unknown error');
      setStatus('error');
      isListeningRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListeningRef.current && status === 'listening') {
        try { recognition.start(); } catch { /* already running */ }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onWake, status]);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatus('ready');
  }, []);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  return { status, transcript, error, isListening: isListeningState, start, stop };
}
