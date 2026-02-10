# Dark Forest Simulator

An interactive visualization of Liu Cixin's **Dark Forest Theory** from *The Three-Body Problem* trilogy. Experience the chilling logic of cosmic sociology: in a universe where survival is uncertain, revealing your existence may be the last thing you ever do.

![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

The universe is a dark forest. Every civilization is an armed hunter, stalking silently among the stars. This simulator lets you play as a nascent civilization faced with three choices: **broadcast your existence**, **whisper cautiously**, or **listen in silence**.

Press the button. Watch the signal ripple outward at the speed of light. And discover what happens when the hunters hear you.

## Features

- **Real-time Canvas simulation** — Stars, broadcast waves, photoid strikes, and explosions rendered at 60fps
- **8-stage narrative** — The story evolves through multiple branching paths grounded in Dark Forest axioms
- **Three player choices** — Broadcast (full signal), Whisper (limited range), or Listen (observe silently)
- **Procedural starfield** — Dynamically generated stars with twinkling animations, density scaling with screen size
- **Hidden hunter civilizations** — 20% of stars are hunters, invisible until the final moment
- **NPC civilizations** — Watch other civilizations broadcast and face the consequences
- **Photoid attacks** — Red laser-like strikes from detected hunters toward your coordinates
- **Particle explosion system** — Destruction visualized with physics-based particle effects
- **Procedural sound design** — Web Audio API synthesis for broadcasts, whispers, detections, and explosions
- **Multilingual support** — English and French with persistent language preference
- **Responsive design** — Adapts to any screen size
- **Glassmorphism UI** — Semi-transparent narrative panel with backdrop blur

## The Dark Forest Theory

The simulation is built around two axioms of **cosmic sociology**:

1. **Survival is the primary need of civilization.**
2. **Civilization continuously grows and expands, but the total matter in the universe remains constant.**

From these axioms, combined with the **chain of suspicion** (no civilization can know another's true intentions) and **technological explosion** (a weaker civilization can surpass a stronger one overnight), a grim conclusion emerges: the only rational response to detecting another civilization is to destroy it immediately.

## Game States

| State | Description |
|---|---|
| `START` | Your civilization exists in silent anonymity. You can broadcast, whisper, or listen. |
| `BROADCASTING` | Your full-power signal expands outward. The wave will eventually reach a hunter. |
| `WHISPERING` | A limited-range signal. If no hunters are within range, you survive. |
| `LISTENING` | You observe the void in silence. Eventually an NPC civilization will broadcast. |
| `WITNESS` | You watched another civilization get destroyed by hunters. You may now act. |
| `SAFE` | Your whisper faded without reaching any hunters. You survived — this time. |
| `DETECTED` | A hunter has received your signal and launched a photoid strike. |
| `DESTROYED` | Your civilization is gone. All hidden hunters are revealed in red. |

### State Transitions

```
                    ┌─────────────────────────────────┐
                    │                                 │
                    ▼                                 │
               ┌─────────┐                            │
        ┌──────│  START   │──────────┐                 │
        │      └─────────┘          │                 │
        │           │               │                 │
   broadcast     whisper         listen               │
        │           │               │                 │
        ▼           ▼               ▼                 │
 ┌──────────┐ ┌──────────┐  ┌──────────┐             │
 │BROADCAST-│ │WHISPERING│  │LISTENING │             │
 │   ING    │ │          │  │          │             │
 └────┬─────┘ └──┬───┬───┘  └────┬─────┘             │
      │          │   │            │                   │
  detected   detected  no     NPC broadcast           │
      │          │   hunters   + destroyed            │
      │          │   nearby       │                   │
      ▼          ▼    ▼           ▼                   │
 ┌─────────┐  ┌─────────┐  ┌─────────┐              │
 │DETECTED │  │  SAFE   │  │ WITNESS │              │
 └────┬────┘  └────┬────┘  └────┬────┘              │
      │            │            │                    │
   photoid     broadcast/   broadcast/               │
   arrives     whisper/     whisper/                  │
      │        listen       listen                   │
      ▼            │            │                    │
 ┌─────────┐       └────────────┘                    │
 │DESTROYED│                                         │
 └────┬────┘                                         │
      │              reset                           │
      └──────────────────────────────────────────────┘
```

## Tech Stack

| Technology | Role |
|---|---|
| [React 19](https://react.dev) | UI components and state management |
| [Vite 7](https://vite.dev) | Build tool and dev server |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first styling |
| [Lucide React](https://lucide.dev) | Icon library |
| HTML5 Canvas API | Real-time simulation rendering |
| Web Audio API | Procedural sound synthesis |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dark-forest

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
dark-forest/
├── public/
│   └── vite.svg
├── src/
│   ├── main.jsx                    # React entry point, wraps App in LanguageProvider
│   ├── App.jsx                     # Root component — canvas + header + narrative panel
│   ├── index.css                   # Tailwind CSS imports + global styles
│   ├── components/
│   │   ├── GameControls.jsx        # Action buttons (broadcast/whisper/listen/reset/continue)
│   │   ├── LanguageSwitcher.jsx    # EN/FR language toggle
│   │   └── NarrativePanel.jsx      # Bottom panel showing story text + controls
│   ├── hooks/
│   │   ├── useGameState.js         # Game state machine (states, transitions, refs)
│   │   ├── useSimulation.js        # Orchestrator — canvas, animation loop, user actions
│   │   └── useSound.js             # Web Audio API procedural sound effects
│   ├── simulation/
│   │   ├── constants.js            # Game constants (states, speeds, ratios)
│   │   ├── entities.js             # Factory functions (stars, waves, attacks, particles)
│   │   ├── physics.js              # Frame updates (waves, attacks, particles, shake)
│   │   ├── renderer.js             # Canvas rendering pipeline
│   │   └── rules.js                # Game rules (collisions, impacts, user actions)
│   └── i18n/
│       ├── LanguageContext.jsx      # React context + hooks for language switching
│       └── translations.js         # EN/FR translation strings and narrative content
├── index.html
├── vite.config.js
├── postcss.config.js
├── tailwind.config.js
├── eslint.config.js
└── package.json
```

## How It Works

### Simulation Architecture

The simulation is split into pure modules (`simulation/`) and React glue (`hooks/`):

- **`simulation/constants`** — Tuning knobs (speeds, ratios, state enum)
- **`simulation/entities`** — Factory functions that create stars, waves, attacks, and particles
- **`simulation/physics`** — Frame-by-frame updates (wave expansion, attack progress, particle decay, scheduled events)
- **`simulation/rules`** — Game rules mapping physics events to consequences (collisions → attacks, impacts → explosions, user actions → state transitions)
- **`simulation/renderer`** — Draws the full scene to canvas each frame
- **`hooks/useGameState`** — State machine managing game states, transitions, and pending-state pausing
- **`hooks/useSimulation`** — Orchestrator wiring the animation loop, canvas resize, and user action callbacks
- **`hooks/useSound`** — Web Audio API procedural sound synthesis

### Game Loop (per frame)

1. **Decorative updates** always run — particles, flashes, screen shake decay
2. **Scheduled events** fire when their frame counters reach zero (hunter attacks, NPC broadcasts, whisper safety checks)
3. **Wave expansion** — broadcast/whisper waves grow outward; collisions with hunter stars are detected
4. **Attack progress** — photoid strikes advance along their trajectories toward targets
5. **Rendering** — canvas is drawn with a semi-transparent overlay creating a trail/glow effect

### Gameplay

1. **Starfield generation** — On mount, stars are procedurally placed based on screen density (~1 per 8000px²). Each star has a 20% chance of being a hidden hunter.
2. **Player choice** — The player can broadcast (full-range signal), whisper (limited-range signal), or listen (passive observation).
3. **Broadcast / Whisper** — Emits an expanding circular wave from the player's star. Whisper waves fade out at 200px radius.
4. **Detection** — When a wave's radius intersects a hunter star (within 5px tolerance), that hunter fires a photoid attack toward the signal's origin.
5. **Listening** — After a random delay, an NPC civilization broadcasts. Hunters detect it and destroy it, demonstrating the dark forest in action.
6. **Destruction** — When a photoid reaches its target, an explosion of particles is triggered, the star is removed, and all hunters are revealed.

## Development

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

### Adding a New Language

1. Add a new key to the `translations` object in `src/i18n/translations.js` (use the `en` entry as a template — all keys must be present).
2. Add a new button to the `LanguageSwitcher` component in `src/App.jsx`.

### Browser Compatibility

The app uses Canvas 2D, `requestAnimationFrame`, and the Web Audio API. These are supported in all modern browsers (Chrome, Firefox, Safari, Edge).

## Acknowledgments

Inspired by **Liu Cixin**'s *The Dark Forest* (2008), the second novel of the *Remembrance of Earth's Past* trilogy.

> "The universe is a dark forest. Every civilization is an armed hunter stalking through the trees like a ghost."

## License

MIT
