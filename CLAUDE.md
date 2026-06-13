# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Dark Forest Simulator — an interactive single-page visualization of Liu Cixin's Dark Forest Theory. The player's civilization can **broadcast**, **whisper**, or **listen**; hidden "hunter" stars detect signals and destroy the source. The whole experience is one full-screen HTML5 Canvas animation driven by React. There is no backend, router, or persistence beyond `localStorage` for language/onboarding preferences.

Stack: React 19, Vite 7, Tailwind CSS 4 (via `@tailwindcss/postcss`), Vitest 4, Lucide icons.

## Commands

```bash
npm run dev      # Vite dev server at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build
npm run lint     # ESLint over the whole repo
npm test         # Vitest (single run, no watch)
```

Run a single test file or filter by name:

```bash
npx vitest run src/simulation/__tests__/rules.test.js
npx vitest run -t "whisper"
npx vitest            # watch mode (not wired to an npm script)
```

CI (`.github/workflows/ci.yml`) runs lint → test → build on push/PR to `main`. Vercel auto-deploys from `main`. Keep `npm run lint` and `npm test` green — they gate merges.

## Architecture

The core insight: **simulation logic is pure and framework-free; React only provides the canvas, the animation loop, and UI chrome.** Understanding the boundary between `src/simulation/` (pure) and `src/hooks/` (React glue) is the key to working here productively.

### The `sim` object and the game loop

A single mutable `sim` object (created by `createSim` in `simulation/entities.js`) holds all simulation state: `stars`, `userStar`, `waves`, `attacks`, `particles`, `flashes`, `nebulae`, `npcBroadcaster`, `shake`, and `scheduledEvents`. It lives in a ref (`simRef`), not React state — it is mutated in place every frame and never triggers re-renders.

The loop runs inside the main `useEffect` of `hooks/useSimulation.js` via `requestAnimationFrame`. Each frame:

1. **Decorative updates always run** (even when paused): `updateShake`, `updateParticles`, `updateFlashes`.
2. **When not paused**, physics runs and returns *event lists*; rules consume them:
   - `updateScheduledEvents` → `handleScheduledEvent`
   - `updateWaves` → `handleCollision`
   - `updateAttacks` → `handleImpact`
3. `render(ctx, sim, ...)` draws the whole scene.

This is the central pattern: **physics functions are pure detectors that mutate `sim` and return events; rules functions interpret events into game consequences** (state transitions, spawning attacks/explosions, playing sounds). Physics never imports rules; rules never run the loop. New mechanics follow the same flow: add a physics detector that returns events, then a rules handler that reacts.

### Module responsibilities (`src/simulation/`)

- **`constants.js`** — tuning knobs (`LIGHT_SPEED`, `WHISPER_MAX_RADIUS`, `ATTACK_SPEED`, `HUNTER_RATIO`, `STAR_DENSITY`), the frozen `STATES` enum, `ACTIONABLE_STATES`, and `msToFrames(ms)` (the canonical ms→frame converter at 60 FPS — always use it for timing, never hardcode frame counts).
- **`entities.js`** — factory functions only (`createSim`, `createWave`, `createAttack`, `createExplosionParticles`, `createFlash`, `generateStars`, etc.). No update logic.
- **`physics.js`** — per-frame `update*` functions. Pure (except mutating `sim`), return event arrays. Detection uses ring-intersection (`Math.abs(dist - radius) < 5`), and `star.hasFired` prevents a hunter firing twice from one wave.
- **`rules.js`** — `handleCollision` / `handleImpact` / `handleScheduledEvent`, plus the user-action entry points `doBroadcast` / `doWhisper` / `doListen` and `clearEffects`. This is the only simulation module that knows about game states and sound. It receives a `ctx` object (`transitionState`, `setGameState`, `gameStateRef`, `sound`, `setCivCount`) so it stays decoupled from React.
- **`renderer.js`** — `render()`, the entire canvas drawing pipeline. Respects `reducedMotion` and takes localized `labels` (e.g. "YOU"/"SIGNAL").
- **`palette.js`** — shared color tokens (`RGB`, `HEX`). Use these instead of literal color strings.

### Scheduled events

Time-delayed actions (a hunter firing after a reaction delay, an NPC broadcasting, a whisper proving safe) are queued via `scheduleEvent(sim, frames, type, data)` and counted down by `updateScheduledEvents`. Types: `HUNTER_FIRE`, `NPC_BROADCAST`, `WHISPER_SAFE`. Handlers re-check current state before acting (e.g. `NPC_BROADCAST` aborts if no longer `LISTENING`) because the player may have acted during the delay.

### State machine and the pending-state pause (`hooks/useGameState.js`)

States: `START`, `BROADCASTING`, `WHISPERING`, `LISTENING`, `DETECTED`, `DESTROYED`, `WITNESS`, `SAFE`. Only `START`, `WITNESS`, `SAFE` are actionable (`canAct`).

Every state value is mirrored into **both** React state and a ref (`gameState`/`gameStateRef`, `pendingState`/`pendingStateRef`). The ref is what the rAF loop reads — React state alone would be stale inside the loop closure. Always go through `setGameState`/`setPendingState` so both stay in sync.

`transitionState(next)` does **not** apply the state immediately — it sets `pendingState`, which **freezes the simulation** (the `!isPaused` branch in the loop is skipped). The narrative panel shows a "Continue" button; `advance()` clears the pending state and commits it. This is how the game pauses on dramatic beats (detection, destruction) until the player reads and clicks through.

### React layer

- `main.jsx` → `ErrorBoundary` → `LanguageProvider` → `App`.
- `App.jsx` wires `useSound`, `useSimulation`, and renders the canvas + header + `NarrativePanel`.
- `hooks/useSimulation.js` is the orchestrator: owns the canvas ref, DPR/resize handling (resize updates canvas size but does **not** re-init the sim), the loop, and the `broadcast`/`whisper`/`listen`/`reset`/`advance` callbacks. `reset` bumps `initKey` to tear down and rebuild the sim.
- `hooks/useSound.js` — procedural Web Audio synthesis; all calls are optional-chained (`sound?.playX?.()`) so a missing/blocked audio context never breaks the sim.

### i18n (`src/i18n/`)

`LanguageContext.jsx` provides the language and a `t()` helper; `translations.js` holds all strings and narrative for 10 languages (EN, FR, ES, DE, ZH, JA, PT, AR, FA, HE) with RTL (AR, FA, HE) and pluralization (via `Intl.PluralRules`). The `<html lang>` and `dir` attributes are set dynamically. To **add a language**: copy the `en` entry in `translations.js` (every key must be present) and optionally add a label to `LANG_LABELS` in `components/SettingsPanel.jsx`.

## Conventions

- **Keep simulation modules pure.** `simulation/*` (except `rules.js`'s game-state awareness via `ctx`) must not import React or touch the DOM — that is what makes them unit-testable. Tests in `simulation/__tests__/` construct `sim`-like objects and assert on returned event arrays.
- **Physics returns events; rules cause effects.** Don't transition state or play sound from `physics.js`.
- **Loop-read values go through refs.** Anything the rAF loop must see live (game state, language labels, sound, reduced-motion) is stored in a ref and synced from props via a small `useEffect`.
- **Express time in milliseconds** and convert with `msToFrames`; pull magnitudes from `constants.js` rather than inlining numbers.
- **Colors come from `palette.js`.**
- ESLint flag: unused vars are errors, except identifiers matching `^[A-Z_]` (constants/components are exempt).
