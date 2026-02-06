# Dark Forest Simulator

An interactive visualization of Liu Cixin's **Dark Forest Theory** from *The Three-Body Problem* trilogy. Experience the chilling logic of cosmic sociology: in a universe where survival is uncertain, revealing your existence may be the last thing you ever do.

![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

The universe is a dark forest. Every civilization is an armed hunter, stalking silently among the stars. This simulator lets you play as a nascent civilization faced with a single, irreversible choice: **broadcast your existence, or remain silent**.

Press the button. Watch the signal ripple outward at the speed of light. And discover what happens when the hunters hear you.

## Features

- **Real-time Canvas simulation** — Stars, broadcast waves, photoid strikes, and explosions rendered at 60fps
- **4-stage narrative** — The story evolves as the simulation progresses, grounded in Dark Forest axioms
- **Procedural starfield** — Dynamically generated stars with twinkling animations, density scaling with screen size
- **Hidden hunter civilizations** — 20% of stars are hunters, invisible until the final moment
- **Photoid attacks** — Red laser-like strikes from detected hunters toward your coordinates
- **Particle explosion system** — Destruction visualized with physics-based particle effects
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
| `START` | Your civilization exists in silent anonymity. You can choose to broadcast. |
| `BROADCASTING` | Your signal expands outward. The wave will eventually reach a hunter. |
| `DETECTED` | A hunter has received your signal and launched a photoid strike. |
| `DESTROYED` | Your civilization is gone. All hidden hunters are revealed in red. |

## Tech Stack

| Technology | Role |
|---|---|
| [React 19](https://react.dev) | UI components and state management |
| [Vite 7](https://vite.dev) | Build tool and dev server |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first styling |
| [Lucide React](https://lucide.dev) | Icon library |
| HTML5 Canvas API | Real-time simulation rendering |

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
│   ├── main.jsx          # React entry point
│   ├── App.jsx            # Main component — simulation + UI (single-file architecture)
│   ├── index.css          # Tailwind CSS imports + global styles
│   └── assets/
│       └── react.svg
├── index.html
├── vite.config.js
├── postcss.config.js
├── tailwind.config.js
├── eslint.config.js
└── package.json
```

## How It Works

1. **Starfield generation** — On mount, stars are procedurally placed based on screen density (~1 per 8000px). Each star has a 20% chance of being a hidden hunter.
2. **Broadcast** — Clicking "Broadcast Signal" emits an expanding circular wave from your position at the center of the screen.
3. **Detection** — When the wave's radius intersects a hunter star (within 5px tolerance), that hunter fires a photoid attack toward your coordinates.
4. **Destruction** — When a photoid reaches your star, an explosion of 50 particles is triggered, your star is removed, and all hunters are revealed.
5. **Rendering** — A `requestAnimationFrame` loop draws everything on a canvas with a semi-transparent overlay creating a trail/glow effect.

## Acknowledgments

Inspired by **Liu Cixin**'s *The Dark Forest* (2008), the second novel of the *Remembrance of Earth's Past* trilogy.

> "The universe is a dark forest. Every civilization is an armed hunter stalking through the trees like a ghost."

## License

MIT
