# Dark Forest — Design System

> Single source of truth for the visual identity of the **Dark Forest Simulator**.
> A human or an AI agent should be able to follow this document and produce on-brand UI
> without re-reading the codebase.
>
> Every value below is either **cited** to the file it came from, or marked **PROPOSED**
> when it was inferred to fill a gap and still needs a human decision. Open questions are
> collected at the end.
>
> **Two color worlds.** This app paints almost everything onto a single full-screen HTML5
> Canvas (`src/simulation/renderer.js`) using the palette in `src/simulation/palette.js`,
> while the React chrome (header, narrative panel, buttons, settings) is styled with
> Tailwind CSS v4 utilities. Keep the two in sync — `--color-brand` (`src/index.css`) and
> `HEX.brand` (`src/simulation/palette.js`) are deliberately the same blue.

---

## 1. Brand essence & tone

**Feels like:** cold, vast, tense, contemplative, cinematic. *(PROPOSED — distilled from the
subject matter and the all-black canvas + thin-blue-accent treatment; not stated anywhere in
source.)*

**Who it speaks to:** readers of Liu Cixin's *The Dark Forest* and people curious about the
Fermi paradox / game theory of first contact. A literate, sci-fi-aware audience comfortable
with a slow, atmospheric, "interactive essay" rather than a fast game. *(PROPOSED.)*

**Voice in UI copy:** terse, ominous, second-person, literary. The product narrates rather
than instructs. Real strings from `src/i18n/translations.js` set the tone — keep new copy in
this register:

- Title / subtitle: **"DARK FOREST"** · *"// A Cosmic Sociology Simulation"* (`ui.title`, `ui.subtitle`)
- Onboarding: *"The universe is a dark forest. Every civilization is a hunter."* (`ui.onboardingText`)
- Actions are verbs of intent, not buttons: **Broadcast**, **Whisper**, **Listen**, **Rebirth**.
- A recurring epigraph (`quote`) anchors the bottom of the screen.

**Copy rules**
- Second person ("you", "your civilization"). Present tense.
- No exclamation marks, no emoji, no marketing tone. Dread is communicated by restraint.
- Short. The narrative panel hides its subtext on small screens (`src/index.css`), so the
  primary line must stand alone.
- All user-facing strings live in `src/i18n/translations.js` across 10 languages — never
  hardcode copy in components.

---

## 2. Logo & wordmark

There is **no logo asset**. The brand mark is **typographic**: the word **DARK FOREST** set
in uppercase with wide tracking, prefixed by a vertical blue accent bar.

Cited from `src/App.jsx` (`<h1>`):

```html
<h1 class="text-sm sm:text-xl md:text-2xl tracking-widest uppercase font-bold
           text-gray-400 border-s-2 sm:border-s-4 border-blue-500 ps-2 sm:ps-4">
  DARK FOREST <span class="text-gray-500">// A Cosmic Sociology Simulation</span>
</h1>
```

Wordmark rules (the two below are cited; the rest are **PROPOSED** conventions):
- **Accent bar:** a `border-blue-500` left/inline-start rule (2px mobile → 4px desktop),
  `ps-2`/`ps-4` gap to the text. Logical properties (`border-s`, `ps-`) so it flips for RTL. *(cited)*
- **Casing & tracking:** uppercase, `tracking-widest`, `font-bold`, in `text-gray-400`. *(cited)*
- **Clear space (PROPOSED):** keep at least the cap-height of the wordmark clear on all sides.
- **Minimum size (PROPOSED):** never below `text-sm` (14px); the `// subtitle` is hidden below
  the `sm` breakpoint (`hidden sm:inline`, cited) — do not force it onto small screens.
- **Misuse don'ts (PROPOSED):** don't recolor the bar anything but the brand blue; don't set
  the wordmark in mixed case; don't drop the accent bar; don't place it on a light surface.

The favicon is the default Vite logo (`index.html` → `/vite.svg`) — a placeholder, not brand. *(cited)*

---

## 3. Color

The product is **dark-only**. The base is pure black; everything reads as light-on-dark. There
is no light theme.

### 3.1 Canvas palette (cited — `src/simulation/palette.js`)

These drive the simulation drawing. `RGB.*` are alpha-less triplets composed at runtime as
`rgba(triplet, opacity)`; `HEX.*` are solid colors / `shadowColor` glows.

| Token | Value | Role |
| --- | --- | --- |
| `HEX.brand` / `RGB.brand` | `#60A5FA` / `96,165,250` | User star + UI accent (mirrors `--color-brand`) |
| `HEX.userLabel` | `#93C5FD` | "YOU" label |
| `HEX.broadcaster` / `RGB.broadcaster` | `#34D399` / `52,211,153` | NPC broadcast body + waves + glow |
| `HEX.broadcasterLabel` | `#6EE7B7` | "SIGNAL" label |
| `RGB.hunter` / `HEX.attackGlow` | `239,68,68` / `#EF4444` | Hunters, attack trails, photoid glow |
| `RGB.ember` | `255,100,50` | Burnt-out stars, default particles |
| `RGB.white` / `HEX.attackCore` | `255,255,255` / `#FFFFFF` | Living stars, flashes, photoid core |
| `RGB.space` | `5,5,10` | Background fade (`rgba(5,5,10,0.4)` per frame) |

### 3.2 UI palette (cited — Tailwind utility classes across `src/**/*.jsx`, `src/index.css`)

The chrome uses Tailwind's default palette via utilities. Hex values below are the Tailwind
defaults those utilities resolve to.

| Semantic role | Token (utility) | Hex | Where (cited) |
| --- | --- | --- | --- |
| **Background** | black | `#000000` | `body`/`#root` bg (`src/index.css`), `App.jsx` `bg-black` |
| **Surface** (popover) | black/95 | `#000000` @ 95% | `SettingsPanel.jsx` dropdown |
| **Surface** (modal) | black/98 | `#000000` @ 98% | `Onboarding.jsx` |
| **Primary** | blue-600 / blue-500 hover | `#2563EB` / `#3B82F6` | `ActionButton.jsx` `primary` |
| **Accent / brand** | `--color-brand`, blue-500, blue-400 | `#60A5FA`, `#3B82F6`, `#60A5FA` | `index.css` `@theme`, header bar, narrative title |
| **Secondary action** | indigo-900/60 → indigo-200 text | `#312E81` / `#C7D2FE` | `ActionButton.jsx` `indigo` (Whisper) |
| **Tertiary action** | gray-900/60 → gray-300 text | `#111827` / `#D1D5DB` | `ActionButton.jsx` `gray` (Listen) |
| **Text — primary** | gray-200 | `#E5E7EB` | `App.jsx` root, narrative body |
| **Text — secondary** | gray-400 | `#9CA3AF` | header, settings labels |
| **Text — muted** | gray-500 | `#6B7280` | subtext, epigraph |
| **Border** | white/10–20, gray-700/50 | `#FFFFFF` @ 10–20%, `#374151` @ 50% | buttons, dividers, settings |
| **Danger / hunter** | red (red-500) | `#EF4444` | canvas only (`HEX.attackGlow`) |
| **Success / signal** | emerald (emerald-400) | `#34D399` | canvas only (`HEX.broadcaster`) |
| **Skip-link bg** | blue-800 | `#1E40AF` | `.skip-link` (`src/index.css`) |

> **Note on success/warning/danger:** there is **no dedicated warning color** anywhere in the
> source. Danger (red) and success (green) exist only as *canvas semantics* (hunters vs.
> broadcasters), not as UI status colors. A **warning** token is PROPOSED below — confirm before use.

### 3.3 Contrast (text on the black `#000000` base)

Computed WCAG 2.1 ratios. AA needs **4.5:1** for normal text, **3:1** for large (≥18.66px bold
or ≥24px). All ratios are against pure black unless noted.

| Pair | Ratio | AA normal | AA large | Notes |
| --- | --- | --- | --- | --- |
| white `#FFFFFF` on black | 21.0:1 | ✅ | ✅ | |
| gray-200 `#E5E7EB` on black | ~17.0:1 | ✅ | ✅ | narrative body |
| gray-300 `#D1D5DB` on black | ~15.9:1 | ✅ | ✅ | button text |
| blue-300 `#93C5FD` on black | ~11.6:1 | ✅ | ✅ | "YOU" label tone |
| gray-400 `#9CA3AF` on black | ~8.3:1 | ✅ | ✅ | header / settings labels |
| blue-400 `#60A5FA` on black | ~8.2:1 | ✅ | ✅ | narrative title (used at /80 opacity → slightly lower) |
| blue-500 `#3B82F6` on black | ~5.6:1 | ✅ | ✅ | accent bar (decorative) |
| white on blue-600 `#2563EB` | ~5.2:1 | ✅ | ✅ | **primary button** |
| gray-500 `#6B7280` on black | ~4.2:1 | ⚠️ **fail** | ✅ | subtext/epigraph — **large/italic only** |
| gray-600 `#4B5563` on black | ~2.8:1 | ❌ | ❌ | borders only, **never text** |

**Flags:**
- `text-gray-500` (subtext, epigraph, status dot label) is **below AA for normal-size body
  text (4.2:1)**. In source it's only used at small/italic secondary copy that is *hidden on
  small screens* and duplicated in `aria-live` regions — acceptable as de-emphasized
  decoration, **not** for anything a user must read. Do not use gray-500 for primary content.
- `text-blue-400/80` (narrative title) drops the 8.2:1 base by ~20% from the opacity over a
  gradient; still comfortably AA at its size. *(PROPOSED note — verify against the actual gradient.)*

---

## 4. Typography

### 4.1 Families

- **UI / sans (default):** `font-sans` on the root (`App.jsx`). No custom font is loaded, so
  this resolves to **Tailwind's default sans stack**: `ui-sans-serif, system-ui, sans-serif,
  "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`. *(cited: `font-sans`; stack is the Tailwind default.)*
- **Mono / numerals:** `font-mono tabular-nums` for the civilization counter (`App.jsx`).
  Resolves to Tailwind's default mono stack (`ui-monospace, SFMono-Regular, Menlo, …`). *(cited)*
- **Canvas labels:** drawn as `${Math.round(11 * scale)}px monospace` (`renderer.js` lines 53, 72)
  for the "YOU" and "SIGNAL" tags. *(cited)*

> **PROPOSED:** there is no brand display font. If a distinct sci-fi wordmark face is ever
> wanted, that's a human decision — today the identity is *system fonts + uppercase + wide
> tracking*, which is intentional and cheap to render. Confirm whether to keep it.

### 4.2 Type scale (cited from utility classes; px at default 16px root)

The app is responsive — most sizes step up at the `sm` (≥640px) and `md` (≥768px) breakpoints.

| Level | Mobile → desktop classes | Size (px) | Weight | Tracking / style | Used for |
| --- | --- | --- | --- | --- | --- |
| Display (onboarding) | `text-2xl sm:text-3xl` | 24 → 30 | `font-bold` | `tracking-widest uppercase` | Onboarding title |
| Wordmark (H1) | `text-sm sm:text-xl md:text-2xl` | 14 → 20 → 24 | `font-bold` | `tracking-widest uppercase` | Header title |
| Narrative body | `text-sm sm:text-lg md:text-xl` | 14 → 18 → 20 | normal | `leading-relaxed`, `text-shadow` | Primary narrative line |
| Narrative title (eyebrow) | `text-[10px] sm:text-sm` | 10 → 14 | `font-medium` | `uppercase tracking-[0.25em]` | State label above body |
| Button / control | `text-sm sm:text-base` | 14 → 16 | normal | — | `ActionButton`, `StatusBadge` |
| Subtext | `text-[11px] sm:text-sm` | 11 → 14 | normal | `italic` | Narrative subtext |
| Meta / counter | `text-[10px] sm:text-xs` | 10 → 12 | normal | `font-mono tabular-nums` | Civ counter, epigraph, settings |

**Usage rules**
- **Headings & labels are uppercase with wide tracking** (`tracking-widest` ≈ 0.1em, or the
  custom `tracking-[0.25em]` on the narrative eyebrow). This is the strongest brand signal —
  keep it for titles and section labels.
- **Body is sentence-case, `leading-relaxed`**, max width constrained (`max-w-2xl` /
  `max-w-xl`) and center-aligned in the narrative panel, with a dark `text-shadow` so it stays
  legible over the canvas: `textShadow: '0 2px 8px rgba(0,0,0,0.8)'` *(cited, `NarrativePanel.jsx`)*.
- **Numerals use `font-mono tabular-nums`** so the live counter doesn't jitter.
- **Code/labels on canvas use monospace** at 11px × DPR scale.

---

## 5. Spacing & layout

### 5.1 Spacing scale

Tailwind's default **4px-based scale** (`1` = 0.25rem = 4px). Common steps seen in source:
`1` (4px), `1.5` (6px), `2` (8px), `2.5` (10px), `3` (12px), `4` (16px), `5` (20px), `6` (24px),
`8` (32px), `10` (40px), `12` (48px), `16` (64px), `24` (96px). Gaps between controls are
`gap-2 sm:gap-3` (8 → 12px); panel padding scales `px-4 sm:px-10 md:px-16`. *(cited across components.)*

### 5.2 Layout model

This is a **full-bleed canvas app**, not a document with a content column:
- Root is `fixed inset-0` (`App.jsx`) — the canvas fills the viewport at z-0; chrome floats at z-10.
- A **radial vignette** overlay darkens the edges:
  `bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]` *(cited, `App.jsx`)*.
- The **header** is a top gradient scrim: `bg-linear-to-b from-black/80 to-transparent`.
- The **narrative panel** is a bottom gradient scrim:
  `bg-linear-to-t from-black/90 via-black/50 to-transparent` *(cited, `NarrativePanel.jsx`)*.
- **Safe areas** are respected: `viewport-fit=cover` (`index.html`) +
  `pb-[max(1rem,env(safe-area-inset-bottom))]` on the panel.

### 5.3 Breakpoints (Tailwind defaults, used in source)

| Name | Min width | Notable use |
| --- | --- | --- |
| (base) | 0 | mobile-first defaults |
| `sm` | 640px | most type/spacing step-ups; subtitle & epigraph appear |
| `md` | 768px | larger header & narrative type |

Plus custom media queries in `src/index.css` that **can't** be expressed as min-width
breakpoints *(cited)*:
- `@media (max-height: 500px) and (orientation: landscape)` — compact narrative, hide subtext/quote.
- `@media (max-width: 639px) and (orientation: portrait)` — hide subtext.
- `@media (max-width: 319px)` — shrink header type.

### 5.4 Container widths

No page container — content is centered and width-capped per element: narrative body
`max-w-2xl`, subtext `max-w-xl`, onboarding `max-w-lg`, settings dropdown `min-w-[180px]`. *(cited)*

### 5.5 Border-radius

| Token | Value | Used for |
| --- | --- | --- |
| `rounded-md` | 6px | settings list items, language chips |
| `rounded-lg` | 8px | **buttons, status badges** (the default control radius) |
| `rounded-xl` | 12px | settings dropdown panel |
| `rounded-full` | 9999px | status/pulse dots |
| `rounded-b-lg` (`0 0 .5rem .5rem`) | 8px bottom | skip-link |

*(all cited.)*

### 5.6 Elevation

There is no Material-style elevation system; depth comes from **glow shadows** and
**gradient scrims**, not drop shadows on cards. Defined tokens *(cited, `src/index.css`)*:

```css
--shadow-glow:    0 0 20px rgba(37, 99, 235, 0.3);  /* shadow-glow    → primary button */
--shadow-glow-lg: 0 0 30px rgba(37, 99, 235, 0.3);  /* shadow-glow-lg → onboarding CTA */
```

Plus Tailwind's `shadow-xl shadow-black/50` on the settings popover *(cited)*. Use **glow** for
emphasis (it reinforces the "signal in the dark" metaphor), not lift.

---

## 6. Iconography & imagery

- **Icon library:** [`lucide-react`](https://lucide.dev) *(cited — `package.json`, imported in
  `GameControls.jsx`, `SettingsPanel.jsx`)*. Icons in use: `Radio`, `Volume2`, `VolumeX`, `Eye`,
  `RefreshCw`, `ArrowRight`, `Settings`, `Maximize`, `Minimize`.
- **Icon style:** outline / stroke, 24px grid, rendered at `w-4 h-4` (16px) → `sm:w-5 sm:h-5`
  (20px) for controls, `w-3.5 h-3.5` (14px) in the settings menu. Always `aria-hidden="true"`
  because every icon is paired with a visible text label. *(cited.)*
- **Icon ↔ action mapping (cited):** Broadcast = `Radio`, Whisper = `Volume2`, Listen = `Eye`,
  Reset/Rebirth = `RefreshCw`, Continue = `ArrowRight`. Keep these stable.
- **Imagery:** there is **no photography or illustration** — all imagery is the procedurally
  drawn starfield (stars, expanding signal rings, photoid attacks, explosion particles,
  nebulae) generated in `renderer.js`. The aesthetic is generative, not asset-based.
- **Aspect ratio:** the canvas is full-viewport (any ratio). DPR-aware sizing is handled in
  `useSimulation.js`; canvas text scales by `scale` (`renderer.js`). *(cited.)*

---

## 7. Components

All interactive controls share one base shape. **Minimum hit target is 44px**
(`min-h-[44px]`, cited in `ActionButton.jsx`) — honor this on any new control.

### 7.1 Buttons — `ActionButton.jsx` (cited)

Base: `group flex items-center justify-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3
min-h-[44px] rounded-lg transition-all text-sm sm:text-base`

| Variant | Classes | Use |
| --- | --- | --- |
| `primary` | `bg-blue-600 hover:bg-blue-500 text-white transform hover:scale-105 shadow-glow` | Broadcast (the loud, dangerous choice) |
| `indigo` | `bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-700/50 hover:border-indigo-500/70` | Whisper |
| `gray` | `bg-gray-900/60 hover:bg-gray-800/80 text-gray-300 border border-gray-700/50 hover:border-gray-500/70` | Listen |
| `neutral` | `bg-white/10 hover:bg-white/20 text-gray-200 border border-white/20 hover:border-white/40` | Continue / generic |
| `outline` | `border border-gray-600 hover:border-gray-400 hover:bg-gray-800 text-gray-300` | Rebirth / low-emphasis |

**States:**
- **Hover:** background lightens one step; borders brighten; `primary` and the onboarding CTA
  also `scale-105`. Icons animate on hover (`group-hover:` — e.g. `Radio` `animate-ping`,
  `ArrowRight` translates `group-hover:translate-x-1` with RTL mirroring). *(cited.)*
- **Focus-visible:** global `outline: 2px solid var(--color-brand); outline-offset: 2px;`
  (`src/index.css`) — **do not remove**; it's the only focus indicator.
- **Active / disabled / error / loading:** **not defined in source.** PROPOSED:
  - *Active:* drop the `hover:scale` (e.g. `active:scale-100`) and deepen the bg one step.
  - *Disabled:* `opacity-50 cursor-not-allowed`, remove hover transforms, `aria-disabled`.
  - *Loading:* use the existing `StatusBadge` (`animate-pulse` + spinning icon) pattern rather
    than a spinner-in-button. *(See §7.2.)*

### 7.2 Status badge — `StatusBadge.jsx` (cited)

Non-interactive, `role="status" aria-live="polite"`. Same shape as a button minus the press
affordances. Tones: `blue` (transmitting), `indigo` (whispering), `gray` (observing); optional
`pulse` adds `animate-pulse`; the icon may spin (`animate-spin`) or pulse. This **is** the
project's loading/in-progress pattern.

```
border rounded-lg px-4 py-2.5 sm:px-6 sm:py-3
blue:   border-blue-500/30   bg-blue-900/20   text-blue-300
indigo: border-indigo-500/30 bg-indigo-900/20 text-indigo-300
gray:   border-gray-500/30   bg-gray-900/20   text-gray-400
```

### 7.3 Popover / menu — `SettingsPanel.jsx` (cited)

`absolute end-0 top-full mt-2 bg-black/95 border border-white/15 rounded-xl p-2 min-w-[180px]
backdrop-blur-sm shadow-xl shadow-black/50 animate-in`. Trigger is `aria-haspopup` +
`aria-expanded`. Closes on outside `pointerdown` and on `Escape`. Internal selectable items use
`aria-pressed` and the `bg-white/15 text-gray-200` (selected) vs `text-gray-400
hover:bg-white/5` (idle) pattern. Dividers: `border-t border-white/10`.

### 7.4 Modal / dialog — `Onboarding.jsx` (cited)

`fixed inset-0 z-50 bg-black/98 flex items-center justify-center` with
`role="dialog" aria-modal="true"` + `aria-labelledby`/`aria-describedby`. Implements a **full
focus trap**: captures `document.activeElement`, focuses the primary button, cycles Tab/Shift+Tab
within the dialog, closes on `Escape`, and **restores focus** on close. Reuse this pattern for
any new modal — it is the accessibility baseline.

### 7.5 Inputs

There are **no text inputs / forms** in the product (it's gesture/button-driven). If one is ever
needed, the conventions are **PROPOSED**: match button geometry (`rounded-lg`, `min-h-[44px]`,
`px-4`), `bg-white/5 border border-white/15`, `text-gray-200`, `placeholder:text-gray-500`,
`focus-visible` brand outline, and an error state of `border-red-500/60` + a `text-red-400`
message. Confirm before building.

---

## 8. Motion

Timing is intentionally short for UI and physically driven (60 FPS) for the simulation.

**UI durations (cited):**
- Narrative cross-fade between states: **300ms** (`duration-300`, `setTimeout(…, 300)` in
  `NarrativePanel.jsx`); the secondary subtext fades at **500ms** (`duration-500`).
- Settings dropdown entry: **150ms ease-out** (`@keyframes settings-in`, `src/index.css`) —
  fades + `translateY(-4px) scale(0.97)` → rest.
- Hover transitions: `transition-all` / `transition-colors` (Tailwind default **150ms**).

**Easing:** the only explicit curve in source is **`ease-out`** (settings entry). PROPOSED
default for new transitions: `ease-out` for enter, default ease for hover. Confirm if a custom
cubic-bezier is wanted.

**Looping / ambient motion:** `animate-pulse` (status dots, badges, observing eye),
`animate-ping` (broadcast icon on hover), `animate-spin` (transmitting radio). The canvas runs
its own `requestAnimationFrame` loop with a per-frame `rgba(5,5,10,0.4)` trail fade.

**What animates:** state transitions (narrative panel), hover affordances on controls, the live
starfield, and status indicators. **What should not:** body text position, layout, the wordmark.
Keep motion in service of the "signal pulsing in the dark" metaphor — subtle, never bouncy.

**Reduced motion (cited — non-negotiable):**
- CSS: `@media (prefers-reduced-motion: reduce)` clamps **all** animation/transition durations
  to `0.01ms` (`src/index.css`).
- Canvas: `renderer.js` takes a `reducedMotion` flag and respects it; `useSimulation.js` wires
  it. New animations must check `prefers-reduced-motion` or ride the existing CSS clamp.

---

## 9. Accessibility commitments

- **Target standard:** WCAG 2.1 **AA**. *(PROPOSED as the stated target; the codebase clearly
  builds toward AA — confirm it's the official bar.)*
- **Contrast:** body/interactive text meets AA (≥4.5:1) on black; large/decorative text meets
  ≥3:1. `text-gray-500` is reserved for de-emphasized, screen-reader-duplicated secondary copy
  only (see §3.3). Don't introduce text below 4.5:1 for anything a user must read.
- **Focus visibility:** every focusable element gets a `2px` brand-blue `:focus-visible` outline
  with `2px` offset (`src/index.css`). Never set `outline: none` without an equal replacement.
- **Hit targets:** interactive controls are **≥44×44px** (`min-h-[44px]`). Keep it.
- **Keyboard:** a **skip link** (`.skip-link` → `#game-controls`) is the first focusable element
  (`App.jsx`). Menus and the onboarding dialog close on `Escape`; the dialog traps and restores
  focus. All actions are real `<button>`s — reachable and operable by keyboard.
- **Screen readers:** the canvas is `role="img"` with an `aria-label`; canvas-only text ("YOU",
  "SIGNAL") is mirrored as localized labels passed from React so it isn't lost. Live regions:
  the narrative uses a single `aria-live="polite" aria-atomic="true"` region (title+body
  announced once per change); status badges use `role="status"`. Icons are `aria-hidden`. Region
  landmarks (`role="region"`, `role="group"`) carry localized `aria-label`s.
- **i18n / direction:** `<html lang>` and `dir` are set dynamically; RTL is fully supported
  (AR, FA, HE) via logical properties (`border-s`, `ps-`, `end-0`, `ltr:`/`rtl:` variants). Use
  logical properties, never `left`/`right`, in new UI.

---

## 10. Design tokens

Copy-pasteable. The first block reflects what's **actually in source** (`src/index.css`
`@theme` + `src/simulation/palette.js`); the rest are the Tailwind-derived values this design
relies on, exposed as variables so a stylesheet or agent can consume them directly. Values not
present in source as variables are marked.

```css
:root {
  /* ── Brand (cited: src/index.css @theme, src/simulation/palette.js) ── */
  --color-brand: #60a5fa;            /* user star + UI accent */
  --shadow-glow:    0 0 20px rgba(37, 99, 235, 0.3);
  --shadow-glow-lg: 0 0 30px rgba(37, 99, 235, 0.3);

  /* ── Canvas semantic colors (cited: palette.js) ── */
  --canvas-user:            #60a5fa;
  --canvas-user-label:      #93c5fd;
  --canvas-broadcaster:     #34d399;
  --canvas-broadcaster-label:#6ee7b7;
  --canvas-hunter:          #ef4444;  /* also attack glow */
  --canvas-attack-core:     #ffffff;
  --canvas-ember:           rgb(255 100 50);
  --canvas-space:           rgb(5 5 10);   /* per-frame fade */

  /* ── UI surfaces & text (Tailwind utilities in use; hex = Tailwind defaults) ── */
  --bg:               #000000;
  --surface-popover:  rgba(0,0,0,0.95);
  --surface-modal:    rgba(0,0,0,0.98);
  --text-primary:     #e5e7eb;   /* gray-200 */
  --text-secondary:   #9ca3af;   /* gray-400 */
  --text-muted:       #6b7280;   /* gray-500 — decorative/large only */
  --border-subtle:    rgba(255,255,255,0.10);
  --border-strong:    rgba(255,255,255,0.20);

  /* ── Action colors ── */
  --primary:          #2563eb;   /* blue-600 */
  --primary-hover:    #3b82f6;   /* blue-500 */
  --accent:           #3b82f6;   /* blue-500 (wordmark bar) */
  --on-primary:       #ffffff;
  --whisper-bg:       rgba(49,46,129,0.60);   /* indigo-900/60 */
  --whisper-text:     #c7d2fe;                /* indigo-200 */
  --listen-bg:        rgba(17,24,39,0.60);    /* gray-900/60 */
  --listen-text:      #d1d5db;                /* gray-300 */

  /* ── Status / semantic (canvas-derived; PROPOSED as UI tokens) ── */
  --success:          #34d399;   /* emerald-400 */
  --danger:           #ef4444;   /* red-500 */
  --warning:          #f59e0b;   /* amber-500 — PROPOSED, no source usage */

  /* ── Typography ── */
  --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
               "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
               "Liberation Mono", "Courier New", monospace;
  --tracking-wide:  0.1em;    /* tracking-widest, headings */
  --tracking-label: 0.25em;   /* narrative eyebrow */

  /* type scale (desktop values; see §4.2 for responsive steps) */
  --text-display: 30px;  --text-h1: 24px;  --text-body: 20px;
  --text-control: 16px;  --text-sub: 14px; --text-meta: 12px; --text-eyebrow: 10px;
  --leading-relaxed: 1.625;

  /* ── Spacing (4px scale) ── */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  --space-12: 48px; --space-16: 64px;

  /* ── Radius ── */
  --radius-md: 6px;   /* menu items */
  --radius-lg: 8px;   /* buttons, badges (default) */
  --radius-xl: 12px;  /* popovers */
  --radius-full: 9999px;

  /* ── Elevation (glow, not lift) ── */
  --shadow-popover: 0 20px 25px -5px rgba(0,0,0,0.5);  /* shadow-xl shadow-black/50 */

  /* ── Motion ── */
  --dur-fast: 150ms;     /* hover, menu enter */
  --dur-base: 300ms;     /* narrative cross-fade */
  --dur-slow: 500ms;     /* subtext fade */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);

  /* ── Layout ── */
  --bp-sm: 640px;  --bp-md: 768px;
  --hit-target: 44px;
  --focus-ring: 2px solid var(--color-brand);
  --focus-offset: 2px;
}
```

> In **Tailwind v4** the `@theme` block (`src/index.css`) is the live source for `--color-brand`,
> `--shadow-glow`, `--shadow-glow-lg`, which auto-generate `text-brand` / `shadow-glow` utilities.
> When adding a token you want as a utility, add it there — not to a separate config.

---

## 11. Do / Don't

**Do**
- Keep the stage **pure black**; let the canvas starfield be the visual, and float chrome over
  it with gradient scrims.
- Set titles/labels **uppercase with wide tracking**; keep body sentence-case and relaxed.
- Use the **brand blue** for "you / signal / focus" and keep `--color-brand` and `HEX.brand` in
  sync between CSS and canvas.
- Reuse `ActionButton` variants and `StatusBadge` for new controls; respect `min-h-[44px]` and
  the global `:focus-visible` ring.
- Use **logical properties** (`ps-`, `border-s`, `end-0`, `ltr:`/`rtl:`) so RTL keeps working.
- Honor `prefers-reduced-motion`; prefer **glow** over drop-shadow for emphasis.
- Put every user-facing string in `src/i18n/translations.js` (all 10 languages).

**Don't**
- Don't introduce a light theme or non-black surfaces without a design decision.
- Don't use `text-gray-500` (or lighter-failing tones) for content a user must read.
- Don't remove focus outlines, drop the 44px hit target, or hardcode `left`/`right`.
- Don't add red/green as generic UI status colors — they read as *hunter/broadcaster* here.
- Don't hardcode copy in components or invent a new icon set (stay on `lucide-react`).
- Don't add bouncy/decorative motion; motion serves the "signal in the dark" metaphor.

---

## 12. Open questions & PROPOSED values needing a human decision

1. **Brand adjectives, audience, and voice** (§1) — distilled from the theme, not stated in
   source. Confirm or replace.
2. **Wordmark rules** — clear space, minimum size, and misuse don'ts (§2) are PROPOSED; only the
   accent-bar + uppercase tracking treatment is cited.
3. **Favicon** is the default Vite logo (`index.html`). Should there be a real mark/favicon?
4. **Warning color** — none exists in source. PROPOSED `#f59e0b` (amber-500). Adopt, or decide
   the product never needs a warning state?
5. **Success/danger as UI tokens** — currently canvas-only semantics (green/red). OK to promote
   them to general UI status colors, or keep them reserved for the simulation?
6. **Button active / disabled / loading states** (§7.1) — not in source; PROPOSED conventions
   provided. Approve before use.
7. **Input/form conventions** (§7.5) — no inputs exist yet; styling is PROPOSED for if/when one
   is needed.
8. **Display/brand typeface** — identity currently relies on system fonts + tracking. Keep, or
   commission a display face for the wordmark?
9. **Default easing curve** — only `ease-out` appears in source; confirm it as the standard for
   new transitions (or specify a custom cubic-bezier).
10. **Stated accessibility target** — code builds toward WCAG 2.1 AA; confirm AA (not AAA) is the
    official commitment, and that gray-500's sub-AA usage is an accepted exception.
```
