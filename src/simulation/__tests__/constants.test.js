import { describe, it, expect } from 'vitest';
import {
  STATES, ACTIONABLE_STATES, LIGHT_SPEED, WHISPER_MAX_RADIUS,
  ATTACK_SPEED, HUNTER_RATIO, STAR_DENSITY, FPS, msToFrames,
} from '../constants';

describe('STATES', () => {
  it('is frozen', () => {
    expect(Object.isFrozen(STATES)).toBe(true);
  });

  it('contains the 8 expected keys', () => {
    const expected = [
      'START', 'BROADCASTING', 'WHISPERING', 'LISTENING',
      'DETECTED', 'DESTROYED', 'WITNESS', 'SAFE',
    ];
    expect(Object.keys(STATES)).toEqual(expected);
    for (const key of expected) {
      expect(STATES[key]).toBe(key);
    }
  });
});

describe('ACTIONABLE_STATES', () => {
  it('contains exactly START, WITNESS, SAFE', () => {
    expect(ACTIONABLE_STATES).toEqual(new Set(['START', 'WITNESS', 'SAFE']));
  });
});

describe('numeric constants', () => {
  it('has correct values', () => {
    expect(LIGHT_SPEED).toBe(3);
    expect(WHISPER_MAX_RADIUS).toBe(200);
    expect(ATTACK_SPEED).toBe(0.04);
    expect(HUNTER_RATIO).toBe(0.2);
    expect(STAR_DENSITY).toBe(8000);
    expect(FPS).toBe(60);
  });
});

describe('msToFrames', () => {
  it.each([
    [0, 0],
    [1000, 60],
    [500, 30],
    [16, 1],
    [8, 0],
  ])('converts %i ms to %i frames', (ms, expected) => {
    expect(msToFrames(ms)).toBe(expected);
  });
});
