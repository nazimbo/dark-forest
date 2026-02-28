import { describe, it, expect } from 'vitest';
import {
  updateWaves, updateAttacks, updateParticles,
  updateFlashes, updateShake, updateScheduledEvents, scheduleEvent,
} from '../physics';
import { LIGHT_SPEED, ATTACK_SPEED } from '../constants';

// --- helpers ---

function makeSim(overrides = {}) {
  return {
    waves: [],
    attacks: [],
    particles: [],
    flashes: [],
    stars: [],
    shake: { intensity: 0 },
    scheduledEvents: [],
    ...overrides,
  };
}

// --- updateWaves ---

describe('updateWaves', () => {
  it('expands radius by LIGHT_SPEED and decreases alpha by 0.002', () => {
    const wave = { x: 0, y: 0, radius: 10, alpha: 1, maxRadius: null, isNpc: false };
    const sim = makeSim({ waves: [wave], stars: [] });
    updateWaves(sim);
    expect(wave.radius).toBe(10 + LIGHT_SPEED);
    expect(wave.alpha).toBeCloseTo(1 - 0.002);
  });

  it('decays alpha faster when wave exceeds maxRadius', () => {
    const wave = { x: 0, y: 0, radius: 100, alpha: 1, maxRadius: 50, isNpc: false };
    const sim = makeSim({ waves: [wave], stars: [] });
    updateWaves(sim);
    // alpha -= 0.002 (base) and -= 0.02 (over max)
    expect(wave.alpha).toBeCloseTo(1 - 0.002 - 0.02);
  });

  it('detects collision with hunter in range and marks hasFired', () => {
    const wave = { x: 0, y: 0, radius: 10, alpha: 1, maxRadius: null, isNpc: false };
    // Place hunter exactly at the wave front
    const hunter = { x: 10, y: 0, isHunter: true, hasFired: false };
    const sim = makeSim({ waves: [wave], stars: [hunter] });
    // After update, radius becomes 13. dist is 10, |10-13|=3 <5 → collision
    const collisions = updateWaves(sim);
    expect(collisions).toHaveLength(1);
    expect(collisions[0]).toEqual({ hunterIndex: 0, target: 'user' });
    expect(hunter.hasFired).toBe(true);
  });

  it('ignores hunter that already hasFired', () => {
    const wave = { x: 0, y: 0, radius: 10, alpha: 1, maxRadius: null, isNpc: false };
    const hunter = { x: 10, y: 0, isHunter: true, hasFired: true };
    const sim = makeSim({ waves: [wave], stars: [hunter] });
    const collisions = updateWaves(sim);
    expect(collisions).toHaveLength(0);
  });

  it('ignores non-hunter stars', () => {
    const wave = { x: 0, y: 0, radius: 10, alpha: 1, maxRadius: null, isNpc: false };
    const star = { x: 10, y: 0, isHunter: false, hasFired: false };
    const sim = makeSim({ waves: [wave], stars: [star] });
    const collisions = updateWaves(sim);
    expect(collisions).toHaveLength(0);
  });

  it('removes wave when alpha drops to 0', () => {
    const wave = { x: 0, y: 0, radius: 10, alpha: 0.001, maxRadius: null, isNpc: false };
    const sim = makeSim({ waves: [wave], stars: [] });
    updateWaves(sim);
    expect(sim.waves).toHaveLength(0);
  });

  it('returns npc target for isNpc wave', () => {
    const wave = { x: 0, y: 0, radius: 10, alpha: 1, maxRadius: null, isNpc: true };
    const hunter = { x: 10, y: 0, isHunter: true, hasFired: false };
    const sim = makeSim({ waves: [wave], stars: [hunter] });
    const collisions = updateWaves(sim);
    expect(collisions[0].target).toBe('npc');
  });

  it('skips collision checks when wave exceeds maxRadius', () => {
    const wave = { x: 0, y: 0, radius: 100, alpha: 1, maxRadius: 50, isNpc: false };
    // Hunter at distance 103 from origin — would match |103 - 103| < 5 if checked
    const hunter = { x: 103, y: 0, isHunter: true, hasFired: false };
    const sim = makeSim({ waves: [wave], stars: [hunter] });
    const collisions = updateWaves(sim);
    expect(collisions).toHaveLength(0);
  });
});

// --- updateAttacks ---

describe('updateAttacks', () => {
  it('advances progress by ATTACK_SPEED and adds trail point', () => {
    const atk = { startX: 0, startY: 0, targetX: 100, targetY: 0, progress: 0, trail: [], isNpcTarget: false };
    const sim = makeSim({ attacks: [atk] });
    updateAttacks(sim);
    expect(atk.progress).toBeCloseTo(ATTACK_SPEED);
    expect(atk.trail).toHaveLength(1);
  });

  it('caps trail at 20 entries', () => {
    const atk = {
      startX: 0, startY: 0, targetX: 1000, targetY: 0,
      progress: 0, trail: Array.from({ length: 20 }, (_, i) => ({ x: i, y: 0 })),
      isNpcTarget: false,
    };
    const sim = makeSim({ attacks: [atk] });
    updateAttacks(sim);
    expect(atk.trail).toHaveLength(20);
  });

  it('returns impact and removes attack when progress >= 1', () => {
    const atk = { startX: 0, startY: 0, targetX: 100, targetY: 0, progress: 0.97, trail: [], isNpcTarget: true };
    const sim = makeSim({ attacks: [atk] });
    const impacts = updateAttacks(sim);
    expect(impacts).toEqual([{ isNpcTarget: true }]);
    expect(sim.attacks).toHaveLength(0);
  });
});

// --- updateParticles ---

describe('updateParticles', () => {
  it('updates position, applies friction, and decreases life', () => {
    const p = { x: 0, y: 0, vx: 10, vy: 5, life: 1 };
    const sim = makeSim({ particles: [p] });
    updateParticles(sim);
    expect(p.x).toBe(10);
    expect(p.y).toBe(5);
    expect(p.vx).toBeCloseTo(10 * 0.98);
    expect(p.vy).toBeCloseTo(5 * 0.98);
    expect(p.life).toBeCloseTo(1 - 0.015);
  });

  it('removes dead particles', () => {
    const p = { x: 0, y: 0, vx: 0, vy: 0, life: 0.01 };
    const sim = makeSim({ particles: [p] });
    updateParticles(sim);
    expect(sim.particles).toHaveLength(0);
  });
});

// --- updateFlashes ---

describe('updateFlashes', () => {
  it('decreases life by 0.08 per frame', () => {
    const f = { x: 0, y: 0, life: 1 };
    const sim = makeSim({ flashes: [f] });
    updateFlashes(sim);
    expect(f.life).toBeCloseTo(0.92);
  });

  it('removes flash when life <= 0', () => {
    const f = { x: 0, y: 0, life: 0.05 };
    const sim = makeSim({ flashes: [f] });
    updateFlashes(sim);
    expect(sim.flashes).toHaveLength(0);
  });
});

// --- updateShake ---

describe('updateShake', () => {
  it('decays intensity by *0.92 when > 0.5', () => {
    const sim = makeSim({ shake: { intensity: 10 } });
    updateShake(sim);
    expect(sim.shake.intensity).toBeCloseTo(10 * 0.92);
  });

  it('snaps to 0 when intensity <= 0.5', () => {
    const sim = makeSim({ shake: { intensity: 0.5 } });
    updateShake(sim);
    expect(sim.shake.intensity).toBe(0);
  });
});

// --- scheduleEvent + updateScheduledEvents ---

describe('scheduleEvent & updateScheduledEvents', () => {
  it('adds and triggers event when framesRemaining reaches 0', () => {
    const sim = makeSim();
    scheduleEvent(sim, 2, 'TEST', { foo: 'bar' });
    expect(sim.scheduledEvents).toHaveLength(1);

    // Frame 1: decrement but not triggered
    let triggered = updateScheduledEvents(sim);
    expect(triggered).toHaveLength(0);
    expect(sim.scheduledEvents).toHaveLength(1);

    // Frame 2: triggers
    triggered = updateScheduledEvents(sim);
    expect(triggered).toHaveLength(1);
    expect(triggered[0].type).toBe('TEST');
    expect(triggered[0].foo).toBe('bar');
    expect(sim.scheduledEvents).toHaveLength(0);
  });

  it('triggers immediately when framesRemaining is 1', () => {
    const sim = makeSim();
    scheduleEvent(sim, 1, 'INSTANT');
    const triggered = updateScheduledEvents(sim);
    expect(triggered).toHaveLength(1);
  });
});
