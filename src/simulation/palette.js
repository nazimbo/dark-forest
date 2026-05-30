// Canvas (2D context) color palette — the single source of truth for colors
// drawn onto the simulation canvas. These are plain strings rather than CSS
// custom properties because a canvas context cannot resolve CSS variables.
//
// RGB triplets are stored without alpha so callers can compose `rgba(triplet,
// opacity)` with a per-frame opacity. HEX values are used where a solid color
// or shadowColor is needed.

export const RGB = {
  brand: '96, 165, 250',     // blue — user star / signals (matches HEX.brand)
  broadcaster: '52, 211, 153', // green — NPC broadcast waves (matches HEX.broadcaster)
  hunter: '239, 68, 68',     // red — hunters and attack trails
  ember: '255, 100, 50',     // orange — burnt-out stars and default particles
  white: '255, 255, 255',    // living stars, flashes
  space: '5, 5, 10',         // background fade
};

export const HEX = {
  brand: '#60A5FA',          // user star + UI accent (mirrors --color-brand)
  userLabel: '#93C5FD',      // "YOU" label
  broadcaster: '#34D399',    // NPC broadcaster body + glow
  broadcasterLabel: '#6EE7B7', // "SIGNAL" label
  attackCore: '#FFFFFF',     // photoid core
  attackGlow: '#EF4444',     // photoid shadow/glow
};
