export const STATES = Object.freeze({
  START: 'START',
  BROADCASTING: 'BROADCASTING',
  WHISPERING: 'WHISPERING',
  LISTENING: 'LISTENING',
  DETECTED: 'DETECTED',
  DESTROYED: 'DESTROYED',
  WITNESS: 'WITNESS',
  SAFE: 'SAFE',
});

export const ACTIONABLE_STATES = new Set([STATES.START, STATES.WITNESS, STATES.SAFE]);

export const LIGHT_SPEED = 3;            // Wave expansion (px/frame)
export const WHISPER_MAX_RADIUS = 200;   // Max whisper reach (px)
export const ATTACK_SPEED = 0.04;        // Photoid progress per frame (0-1 range)
export const HUNTER_RATIO = 0.2;         // Probability a star is a hunter
export const STAR_DENSITY = 8000;        // Area per star (px^2)
export const FPS = 60;

export const msToFrames = (ms) => Math.round(ms * FPS / 1000);
