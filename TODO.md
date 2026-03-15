# Dark Forest — Remaining Improvements

## Error Handling
- [x] Add an `<ErrorBoundary>` component at App level with fallback UI and reset button
- [x] Add try-catch around `canvas.getContext('2d')` in useSimulation
- [x] Log sound errors instead of silently swallowing them

## CI/CD & Deployment
- [x] Add GitHub Actions workflow: lint → test → build
- [x] Configure deployment target (Vercel — already deployed)
- [x] Add build size monitoring

## Testing
- [ ] Add component tests for GameControls, NarrativePanel, LanguageSwitcher
- [ ] Add integration tests (hooks + components together)
- [ ] Add e2e tests (full game flow from START → DESTROYED)
- [ ] Add visual regression tests for canvas rendering

## Gameplay Depth
- [ ] Add difficulty levels (vary hunter ratio, attack speed, detection range)
- [ ] Add score / survival tracking across sessions
- [ ] Add fog of war (stars invisible until within sensor range)
- [ ] Add hunter variety (different speeds, behaviors, detection ranges)
- [ ] Allow multiple actions per game (multi-phase gameplay)
- [ ] Add NPC alliances / responses to other broadcasts

## UX Polish
- [x] Add volume control UI (slider or mute toggle)
- [x] Add settings panel (language, volume, accessibility options)
- [x] Detect browser locale for default language instead of hardcoded 'en'
- [x] Add onboarding / tutorial for first-time players
- [x] Add fullscreen mode (Fullscreen API)
- [x] Handle landscape mode on mobile more gracefully
- [x] Add fallback for very small screens (<320px)

## Internationalization
- [x] Add more languages (ES, DE, ZH, JA, PT)
- [x] Add RTL layout support for Arabic/Hebrew
- [x] Add pluralization support for future strings
