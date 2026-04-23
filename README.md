# EagleOne Command

> JARVIS meets Adler Synod — a holographic AI command interface powered by OpenClaw.

EagleOne Command is the strategic command center for the Adler Synod. Modeled after Iron Man's JARVIS interface, it renders a dark, immersive dashboard with an amber-glowing eagle at its core, streaming real-time agent responses into holographic glassmorphic panels. Wake the interface with **"Hey EagleOne"** and command the full force of the Adler Synod from a single screen.

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 6 |
| **3D Rendering** | Three.js + `@react-three/fiber` + `@react-three/drei` |
| **Styling** | Tailwind CSS 3 |
| **Voice / Wake Word** | Web Speech API (`SpeechRecognition`) |
| **Speech Synthesis** | OpenClaw TTS pipeline (ElevenLabs via gateway) |
| **Backend / Brain** | OpenClaw Gateway (WebSocket + REST) |

---

## Features

### Wake Word — "Hey EagleOne"
- Continuous listening via Web Speech API after boot
- Say `"Hey EagleOne"` to wake the interface or activate the dashboard
- Mic icon pulses amber while actively listening
- Click-to-wake fallback always available

### Eagle Core (Three.js)
- Amber eagle logo rendered as a Three.js sprite
- 800-particle amber cloud orbiting in an elliptical path
- Idle pulse animation (4s interval, 0.8–1.0 opacity)
- Glow intensifies when system is active

### Agent Panels
- Six holographic panels for the Adler Synod team: `EagleApex`, `EagleScout`, `EagleTek`, `EagleSearch`, `EagleDev`, `EagleForge`
- Each panel displays agent name, current task status, and last response excerpt
- Glassmorphism styling with amber border accents
- Click to expand full conversation thread

### Streaming Responses
- Real-time token streaming from OpenClaw gateway via WebSocket
- Word-by-word typewriter rendering in each agent panel
- No cursor after completion; clean output display

### Status Bar
- Live WMT stock price
- Gateway connectivity indicator (online/offline)
- Active agent count
- System uptime counter
- Memory utilization

### Boot Sequence
- Full-viewport particle scatter animation on first load
- Eagle logo materializes from the particle field
- Dashboard panels slide in with staggered animation
- `"Say 'Hey EagleOne' to begin"` prompt

---

## Project Structure

```
eagle-one-command/
├── public/
│   └── eagle-clean.png          # Eagle logo asset
├── src/
│   ├── components/
│   │   ├── AgentPanel.tsx       # Holographic agent card
│   │   ├── BootScreen.tsx       # Particle boot animation
│   │   ├── CommandInput.tsx     # Holographic text input
│   │   ├── EagleCore.tsx        # Three.js eagle + particle field
│   │   ├── StatusBar.tsx        # Live metrics bar
│   │   └── StreamingText.tsx    # Word-by-word response renderer
│   ├── hooks/
│   │   ├── useGatewayStream.ts  # OpenClaw WebSocket hook
│   │   ├── useStatusMetrics.ts  # Gateway status polling
│   │   └── useWakeWord.ts       # Web Speech API wake word
│   ├── lib/
│   │   └── gateway.ts          # WebSocket + REST client
│   ├── App.tsx                  # Root layout
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind + custom CSS vars
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── package.json
└── README.md
```

---

## Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- OpenClaw Gateway running (for full streaming functionality)

### Installation

```bash
cd eagle-one-command
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173` by default.

### Production Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Environment Variables

Create a `.env` file (or set these in your shell) to configure the OpenClaw gateway connection:

| Variable | Description | Default |
|:---------|:------------|:--------|
| `VITE_GS_URL` | OpenClaw Gateway base URL (REST) | `http://localhost:56565` |
| `VITE_WS_URL` | OpenClaw Gateway WebSocket URL | `ws://localhost:56565` |

Example `.env`:
```
VITE_GS_URL=http://localhost:56565
VITE_WS_URL=ws://localhost:56565
```

### API Contract (Frontend → OpenClaw Gateway)

- **WebSocket:** `ws://[gateway-host]/api/v1/chat/stream`
- **REST fallback:** `POST /api/v1/chat` with `Accept: text/event-stream`
- **Payload:** `{ "message": "user input", "agent": null, "stream": true }`
- **Response:** SSE stream — each chunk: `data: {"token": "word "}\n\n`

---

## Design Reference

| Role | Color | Hex |
|:-----|:------|:----|
| Primary (hologram) | Amber Gold | `#F5A623` |
| Secondary glow | Warm Gold | `#D4850A` |
| Accent highlight | Pale Gold | `#FFD700` |
| Background deep | Midnight Navy | `#0A0E1A` |
| Background panel | Dark Slate | `#111827` |
| Text primary | White | `#FFFFFF` |
| Text secondary | Silver | `#9CA3AF` |
| Error/alert | Ember Red | `#EF4444` |
| Success | Eagle Green | `#10B981` |

**Fonts:** Orbitron (display/logo) · JetBrains Mono (data/monospace) · Inter (body)

---

## License

MIT — The Adler Synod, 2026.
