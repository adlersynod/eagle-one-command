# EagleOne Command — JARVIS Aesthetic Rebuild
## SPEC.md — Source of Truth

---

## 1. Concept & Vision

**EagleOne Command** is the Adler Synod's answer to JARVIS — a holographic, Iron Man-style AI command interface powered by OpenClaw as the backend brain. It materializes as a dark, immersive dashboard with an amber-glowing eagle head at its core, streaming real-time agent responses into holographic panels. "Hey EagleOne" wakes the interface, and the system responds with EagleTek precision and Adler's strategic authority.

**Personality:** Tactical, minimal, powerful. Every element serves a purpose. No decoration without function.

---

## 2. Design Language

### Aesthetic Direction
**Reference:** Iron Man JARVIS interface meets military command center. Sharp geometric eagle replaces Arc Reactor. Amber/gold replaces green. Dark navy/black replaces Stark's dark gray.

### Color Palette
| Role | Color | Hex |
| :---- | :---- | :-- |
| Primary (hologram) | Amber Gold | `#F5A623` |
| Secondary glow | Warm Gold | `#D4850A` |
| Accent (highlight) | Pale Gold | `#FFD700` |
| Background deep | Midnight Navy | `#0A0E1A` |
| Background panel | Dark Slate | `#111827` |
| Text primary | White | `#FFFFFF` |
| Text secondary | Silver | `#9CA3AF` |
| Error/alert | Ember Red | `#EF4444` |
| Success | Eagle Green | `#10B981` |

### Typography
- **Display / Logo:** `Orbitron` (Google Fonts) — futuristic, geometric
- **Monospace / Data:** `JetBrains Mono` — clean technical readout
- **Body:** `Inter` — readable UI text
- **Fallbacks:** `system-ui, -apple-system, sans-serif`

### Spatial System
- Base unit: `8px`
- Panel padding: `24px`
- Gap between panels: `16px`
- Border radius: `4px` (sharp, tactical)
- Max content width: `1440px`

### Motion Philosophy
- **Boot:** Eagle logo materializes from particle scatter → 1.2s ease-out
- **Holographic panels:** Fade in with subtle Y-translate, staggered 80ms
- **Text streaming:** Characters appear with 20ms delay (typewriter), no cursor
- **Idle pulse:** Eagle core pulses amber glow at 4s interval, 0.8–1.0 opacity
- **Interactions:** Hover lifts panel 2px with box-shadow increase, 150ms

### Visual Assets
- **Eagle Core:** `eagle-clean.png` (from Eagles Nest) rendered as Three.js sprite or plane
- **Particle field:** Three.js `Points` with amber `PointsMaterial`, 800 particles orbiting eagle
- **Background:** Subtle radial gradient from `#0A0E1A` → `#000000`
- **Panel glassmorphism:** `background: rgba(17,24,39,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(245,166,35,0.15);`

---

## 3. Layout & Structure

### Page Architecture
```
┌─────────────────────────────────────────────────────────────┐
│  BOOT SCREEN (full viewport, particle scatter → eagle)     │
├─────────────────────────────────────────────────────────────┤
│  MAIN DASHBOARD (post-boot)                                │
│  ┌──────────┐  ┌────────────────────────────────────────┐ │
│  │  EAGLE   │  │  STATUS BAR (system metrics, time)      │ │
│  │  CORE    │  ├────────────────────────────────────────┤ │
│  │ (3D)     │  │  AGENT PANELS (4x grid)               │ │
│  │          │  │  [EagleApex] [EagleScout] [EagleTek]  │ │
│  │  Amber   │  │  [EagleDev]  [EagleSearch] [EagleDev] │ │
│  │  Orbit   │  ├────────────────────────────────────────┤ │
│  │          │  │  COMMAND INPUT (holographic input)    │ │
│  └──────────┘  │  "Hey EagleOne..."                      │ │
│                └────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Strategy
- **Desktop (>1024px):** Full layout as above, eagle core left-anchored
- **Tablet (768-1024px):** Eagle core shrinks to top-center, panels stack below
- **Mobile (<768px):** Eagle core top-center icon only, single-column panels, full-width input

### Wake Screen (pre-boot)
- Full viewport: particle field animating
- Centered eagle logo fading in
- "INITIALIZING ADLER SYNOD..." text
- "Hey EagleOne" mic prompt after boot

---

## 4. Features & Interactions

### Wake Word ("Hey EagleOne")
- Web Speech API (`SpeechRecognition`) listens continuously after boot
- On "Hey EagleOne" detected → boot animation triggers (if cold) or dashboard activates (if idle)
- Mic icon pulses amber when actively listening
- Fallback: click the mic icon to wake manually

### Command Input
- Holographic input field at bottom of dashboard
- Placeholder: `"Awaiting your command, Adler."`
- On Enter: input text streams to OpenClaw gateway via WebSocket
- Response streams back word-by-word into active panel
- Input clears on new command

### Agent Panels
- 6 panels for 6 agents: `EagleApex`, `EagleScout`, `EagleTek`, `EagleSearch`, `EagleDev`, `EagleForge`
- Each panel shows: agent name, current task status, last response excerpt
- Click panel → expands to full conversation thread
- Panel header color-coded by agent specialty

### Status Bar (top-right)
- `WMT: $XXX.XX` (live ticker via OpenClaw)
- `Gateway: ONLINE` (green dot) / `OFFLINE` (red dot)
- `Agents: X/6 ACTIVE`
- `Uptime: HH:MM:SS`
- `Memory: XX%`

### Boot Sequence (first load)
1. Black screen → particle scatter animation (1s)
2. Eagle logo fades in at center (0.8s)
3. `"ADLER SYNOD COMMAND INTERFACE ONLINE"` text materializes (0.5s)
4. Dashboard panels slide in from edges (0.6s staggered)
5. Mic prompt appears: `"Say 'Hey EagleOne' to begin"`
6. If no voice: click-to-wake fallback

### Error States
- **Gateway unreachable:** Status bar shows `⚠ GATEWAY OFFLINE` in ember red; panels show last cached state
- **Voice not supported:** Browser check on load; fallback to click-to-wake always shown
- **API key missing (ElevenLabs):** Skip TTS; text-only mode with `🔇` indicator

---

## 5. Component Inventory

### `BootScreen`
- Full-viewport dark background with particle field (Three.js)
- Eagle logo centered, opacity 0→1
- Status text bottom-center, monospace, amber
- States: `loading` | `ready` | `error`

### `EagleCore` (Three.js)
- Eagle logo as `THREE.Sprite` or `THREE.Plane` with `eagle-clean.png` texture
- Amber `PointsMaterial` particle cloud: 800 points, size 0.04, orbiting in elliptical path
- Idle: slow Y-axis rotation (0.001 rad/frame)
- Active: rotation pauses, glow intensifies

### `StatusBar`
- Fixed top-right, glassmorphism panel
- Live metrics: WMT price, gateway status, agent count, uptime counter
- States: `nominal` (green accents) | `degraded` (amber) | `critical` (red)

### `AgentPanel`
- Glassmorphism card, 1px amber border at 15% opacity
- Header: agent name (Orbitron) + status dot
- Body: last response preview (2 lines, truncated)
- States: `idle` | `active` (amber border brightens) | `error` | `loading`
- Hover: lift 2px, border opacity 30%

### `CommandInput`
- Full-width input, dark background, amber text
- Bottom-fixed or bottom-center
- Mic icon (SVG) left side, send icon right side
- Placeholder in silver, amber on focus
- States: `idle` | `listening` (mic pulses) | `processing` (amber spinner) | `disabled`

### `StreamingText`
- Renders agent response word-by-word
- Monospace font, amber color
- No cursor after completion
- States: `streaming` | `complete` | `error`

---

## 6. Technical Approach

### Stack
- **Frontend:** React 18 + Vite + TypeScript
- **3D:** Three.js + `@react-three/fiber` + `@react-three/drei`
- **Styling:** Tailwind CSS + custom CSS variables for theme
- **Voice:** Web Speech API (`SpeechRecognition`) — no external STT needed
- **TTS:** OpenClaw TTS pipeline (ElevenLabs via OpenClaw gateway)
- **Backend:** OpenClaw Gateway (existing — replaces FastAPI/Gemini from JARVIS demo)

### Architecture
```
┌─────────────────────────────────────────┐
│  React + Three.js Frontend (Vite)       │
│  ├── Wake word (Web Speech API)         │
│  ├── EagleCore (Three.js scene)         │
│  ├── Agent panels (React components)   │
│  └── Command input + streaming text     │
└──────────────────┬──────────────────────┘
                   │ WebSocket / REST
                   ▼
┌─────────────────────────────────────────┐
│  OpenClaw Gateway (existing)           │
│  ├── LLM routing (→ agents)            │
│  ├── TTS (ElevenLabs)                  │
│  ├── Memory / context                   │
│  └── Streaming response                │
└─────────────────────────────────────────┘
```

### API Contract (Frontend → OpenClaw)
- **WebSocket:** `ws://[gateway-host]/api/v1/chat/stream`
- **REST fallback:** `POST /api/v1/chat` with `Accept: text/event-stream`
- **Payload:** `{ "message": "user input", "agent": null, "stream": true }`
- **Response:** SSE stream — each chunk: `data: {"token": "word "}\n\n`

### Key Files to Create/Modify
```
eagle-one-command/
├── SPEC.md                    ← this file
├── README.md
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── package.json
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css              ← custom properties + Tailwind base
│   ├── components/
│   │   ├── BootScreen.tsx
│   │   ├── EagleCore.tsx      ← Three.js eagle + particle field
│   │   ├── StatusBar.tsx
│   │   ├── AgentPanel.tsx
│   │   ├── CommandInput.tsx
│   │   └── StreamingText.tsx
│   ├── hooks/
│   │   ├── useWakeWord.ts     ← Web Speech API integration
│   │   ├── useGatewayStream.ts ← OpenClaw WebSocket hook
│   │   └── useStatusMetrics.ts ← polling gateway status
│   └── lib/
│       └── gateway.ts         ← WebSocket + REST client
└── public/
    └── eagle-clean.png        ← copied from Eagles Nest
```

### Deployment
- **Target:** Self-hosted on Mac Mini (port 3000, behind nginx reverse proxy)
- **Build:** `npm run build` → `dist/` served by nginx
- **Dev:** `npm run dev` on port 3000
- **CI/CD:** GitHub Actions on `main` branch → build + deploy to Mac Mini

### Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@react-three/fiber": "^8.17.0",
    "@react-three/drei": "^9.115.0",
    "three": "^0.170.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 7. Out of Scope (Phase 1)
- Clap detection (covered by voice wake)
- ElevenLabs TTS (Phase 2 — text-only streaming first)
- Mobile native apps
- Persistent conversation history (handled by OpenClaw memory)
- Multiple simultaneous agent conversations

---

*SPEC locked. Sprint begins on approval.*
