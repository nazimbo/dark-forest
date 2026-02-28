import { describe, it, expect, vi } from 'vitest';
import {
  createUserStar, createWave, createAttack, createFlash,
  createExplosionParticles, generateStars, generateNebulae, createSim,
} from '../entities';

describe('createUserStar', () => {
  it('returns a star centered on the canvas', () => {
    const star = createUserStar(800, 600);
    expect(star).toEqual({
      x: 400, y: 300, size: 4, color: '#60A5FA', alive: true,
    });
  });
});

describe('createWave', () => {
  it('returns defaults when no options given', () => {
    const wave = createWave(10, 20);
    expect(wave).toEqual({
      x: 10, y: 20, radius: 10, alpha: 1,
      maxRadius: null, isWhisper: false, isNpc: false,
      color: '96, 165, 250',
    });
  });

  it('merges provided options', () => {
    const wave = createWave(10, 20, { isWhisper: true, maxRadius: 200 });
    expect(wave.isWhisper).toBe(true);
    expect(wave.maxRadius).toBe(200);
  });
});

describe('createAttack', () => {
  it('creates an attack with progress 0 and empty trail', () => {
    const atk = createAttack({ x: 1, y: 2 }, { x: 10, y: 20 }, false);
    expect(atk).toEqual({
      startX: 1, startY: 2, targetX: 10, targetY: 20,
      progress: 0, trail: [], isNpcTarget: false,
    });
  });
});

describe('createFlash', () => {
  it('creates a flash with life 1', () => {
    expect(createFlash(5, 10)).toEqual({ x: 5, y: 10, life: 1 });
  });
});

describe('createExplosionParticles', () => {
  it('creates the requested number of particles with string color', () => {
    const particles = createExplosionParticles(0, 0, 5, 'red');
    expect(particles).toHaveLength(5);
    for (const p of particles) {
      expect(p.color).toBe('red');
      expect(p).toHaveProperty('x', 0);
      expect(p).toHaveProperty('y', 0);
      expect(p).toHaveProperty('vx');
      expect(p).toHaveProperty('vy');
      expect(p).toHaveProperty('life');
    }
  });

  it('calls colorOrFn for each particle when it is a function', () => {
    const fn = vi.fn(() => 'blue');
    const particles = createExplosionParticles(0, 0, 3, fn);
    expect(fn).toHaveBeenCalledTimes(3);
    for (const p of particles) {
      expect(p.color).toBe('blue');
    }
  });
});

describe('generateStars', () => {
  it('generates the correct count with expected keys', () => {
    const { stars, livingCivs } = generateStars(800, 600);
    const expectedCount = Math.floor((800 * 600) / 8000);
    expect(stars).toHaveLength(expectedCount);
    for (const s of stars) {
      expect(s).toHaveProperty('x');
      expect(s).toHaveProperty('y');
      expect(s).toHaveProperty('size');
      expect(s).toHaveProperty('alpha');
      expect(s).toHaveProperty('alphaChange');
      expect(s).toHaveProperty('isHunter');
      expect(s).toHaveProperty('hasFired', false);
      expect(s).toHaveProperty('alive', true);
    }
    const nonHunters = stars.filter(s => !s.isHunter).length;
    expect(livingCivs).toBe(nonHunters);
  });
});

describe('generateNebulae', () => {
  it('generates 4 nebulae with expected properties', () => {
    const nebulae = generateNebulae(800, 600);
    expect(nebulae).toHaveLength(4);
    for (const n of nebulae) {
      expect(n).toHaveProperty('x');
      expect(n).toHaveProperty('y');
      expect(n).toHaveProperty('radius');
      expect(n).toHaveProperty('color');
      expect(n).toHaveProperty('alpha');
    }
  });
});

describe('createSim', () => {
  it('returns a complete sim structure', () => {
    const { sim, livingCivs } = createSim(800, 600);
    expect(sim.waves).toEqual([]);
    expect(sim.attacks).toEqual([]);
    expect(sim.particles).toEqual([]);
    expect(sim.flashes).toEqual([]);
    expect(sim.npcBroadcaster).toBeNull();
    expect(sim.shake).toEqual({ intensity: 0 });
    expect(sim.scheduledEvents).toEqual([]);
    expect(sim.animationId).toBeNull();
    expect(sim.userStar.x).toBe(400);
    expect(sim.userStar.y).toBe(300);
    expect(sim.stars.length).toBeGreaterThan(0);
    expect(sim.nebulae).toHaveLength(4);
    expect(livingCivs).toBeGreaterThan(0);
  });
});
