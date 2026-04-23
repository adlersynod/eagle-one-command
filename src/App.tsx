/**
 * App.tsx — EagleOne Command Interface
 * JARVIS-aesthetic dashboard with amber eagle core, glassmorphism panels, and OpenClaw streaming
 */

import { useState, useCallback, useEffect } from 'react';
import { BootScreen } from './components/BootScreen';
import { EagleCore } from './components/EagleCore';
import { StatusBar } from './components/StatusBar';
import { AgentPanel } from './components/AgentPanel';
import { CommandInput } from './components/CommandInput';
import { useWakeWord } from './hooks/useWakeWord';
import { useGatewayStream, useGatewayStatus } from './hooks/useGatewayStream';

interface AgentData {
  id: string;
  name: string;
  specialty: string;
  status: 'idle' | 'active' | 'error' | 'loading';
  lastResponse: string;
  streamState: 'idle' | 'streaming' | 'done' | 'error';
}

// Default agents
const defaultAgents: AgentData[] = [
  { id: 'eagle-apex', name: 'EagleApex', specialty: 'Finance', status: 'idle', lastResponse: '', streamState: 'idle' },
  { id: 'eagle-scout', name: 'EagleScout', specialty: 'Research', status: 'idle', lastResponse: '', streamState: 'idle' },
  { id: 'eagle-tek', name: 'EagleTek', specialty: 'Technical', status: 'idle', lastResponse: '', streamState: 'idle' },
  { id: 'eagle-search', name: 'EagleSearch', specialty: 'Intelligence', status: 'idle', lastResponse: '', streamState: 'idle' },
  { id: 'eagle-devops', name: 'EagleDevOps', specialty: 'DevOps / EagleForge', status: 'idle', lastResponse: '', streamState: 'idle' },
  { id: 'eagle-forge', name: 'EagleForge', specialty: 'Engineering', status: 'idle', lastResponse: '', streamState: 'idle' },
];

type AppState = 'booting' | 'idle' | 'active' | 'error';

function App() {
  const [appState, setAppState] = useState<AppState>('booting');
  const [agents, setAgents] = useState<AgentData[]>(defaultAgents);
  const [inputStatus, setInputStatus] = useState<'idle' | 'listening' | 'processing' | 'disabled'>('idle');
  const [wmtPrice, setWmtPrice] = useState<number | undefined>(undefined);
  const [gatewayOnline, setGatewayOnline] = useState(true);

  // Gateway streaming (demo mode for Phase 1)
  const { status: streamStatus, send } = useGatewayStream();

  // Gateway health
  const { online } = useGatewayStatus();
  useEffect(() => { setGatewayOnline(online); }, [online]);

  // Wake word
  const wakeWord = useWakeWord();

  // Boot complete handler
  const handleBootReady = useCallback(() => {
    setAppState('idle');
    wakeWord.start();
  }, [wakeWord]);

  // Handle command send
  const handleSend = useCallback(
    async (message: string) => {
      const targetAgent = agents.find((a) => a.status !== 'loading') || agents[0];
      
      setAgents((prev) =>
        prev.map((a) =>
          a.id === targetAgent.id
            ? { ...a, status: 'active', lastResponse: '', streamState: 'idle' as const }
            : a
        )
      );
      setInputStatus('processing');

      await send(message);
    },
    [agents, send]
  );

  // Fetch WMT price periodically
  useEffect(() => {
    const fetchPrice = async () => {
      setWmtPrice(165.42);
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  // Determine input status based on stream state
  useEffect(() => {
    if (streamStatus === 'connecting' || streamStatus === 'streaming') {
      setInputStatus('processing');
    } else if (streamStatus === 'idle') {
      setInputStatus('idle');
    }
  }, [streamStatus]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Boot Screen (full viewport, shown during boot) */}
      {appState === 'booting' && <BootScreen onReady={handleBootReady} />}

      {/* Main Dashboard (hidden until booted) */}
      {appState !== 'booting' && (
        <div className="relative w-full h-full">
          {/* Background gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 30% 50%, #0A0E1A 0%, #000000 100%)',
            }}
          />

          {/* Layout */}
          <div className="relative z-10 flex h-full">
            {/* Left: Eagle Core (25% width) */}
            <div className="w-1/4 h-full flex items-center justify-center p-4">
              <div className="w-full h-full max-w-[300px]">
                <EagleCore active={appState === 'active'} />
              </div>
            </div>

            {/* Right: Panels (75% width) */}
            <div className="w-3/4 h-full flex flex-col p-6 gap-4">
              {/* Status Bar (top-right corner) */}
              <div className="flex justify-end">
                <StatusBar 
                  wmtPrice={wmtPrice}
                  gatewayOnline={gatewayOnline}
                  activeAgents={agents.filter((a) => a.status === 'active').length}
                  totalAgents={6}
                  memoryUsage={42}
                />
              </div>

              {/* Agent Panels Grid */}
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                  {agents.map((agent, idx) => (
                    <div
                      key={agent.id}
                      style={{ animationDelay: `${idx * 80}ms` }}
                      className="panel-enter"
                    >
                      <AgentPanel
                        agentId={agent.id}
                        agentName={agent.name}
                        status={agent.status}
                        lastResponse={agent.lastResponse}
                        specialty={agent.specialty}
                        onClick={() => {
                          console.log('Expand agent:', agent.name);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Command Input (bottom) */}
              <div className="w-full max-w-2xl mx-auto">
                <CommandInput
                  onSend={handleSend}
                  onSubmit={handleSend}
                  state={inputStatus}
                  disabled={inputStatus === 'disabled'}
                  placeholder="Awaiting your command, Adler."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;