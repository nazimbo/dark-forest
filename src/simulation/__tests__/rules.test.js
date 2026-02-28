import { describe, it, expect, vi } from 'vitest';
import { STATES } from '../constants';
import {
  clearEffects, handleCollision, handleImpact,
  handleScheduledEvent, doBroadcast, doWhisper, doListen,
} from '../rules';

// --- helpers ---

function createMockCtx(stateOverride = STATES.START) {
  return {
    transitionState: vi.fn(),
    setGameState: vi.fn(),
    setCivCount: vi.fn(),
    gameStateRef: { current: stateOverride },
    sound: {
      playDetection: vi.fn(),
      playExplosion: vi.fn(),
      playBroadcast: vi.fn(),
      playWhisper: vi.fn(),
      startDrone: vi.fn(),
    },
  };
}

function makeSim() {
  return {
    waves: [],
    attacks: [],
    particles: [],
    flashes: [],
    stars: [
      { x: 10, y: 20, isHunter: true, hasFired: false, alive: true, size: 1 },
      { x: 30, y: 40, isHunter: false, hasFired: false, alive: true, size: 1.5 },
    ],
    userStar: { x: 400, y: 300, size: 4, color: '#60A5FA', alive: true },
    npcBroadcaster: null,
    shake: { intensity: 0 },
    scheduledEvents: [],
  };
}

// --- clearEffects ---

describe('clearEffects', () => {
  it('resets all effect arrays, npcBroadcaster, and hasFired flags', () => {
    const sim = makeSim();
    sim.waves.push({});
    sim.attacks.push({});
    sim.flashes.push({});
    sim.scheduledEvents.push({});
    sim.npcBroadcaster = { alive: true };
    sim.stars[0].hasFired = true;

    clearEffects(sim);

    expect(sim.waves).toEqual([]);
    expect(sim.attacks).toEqual([]);
    expect(sim.flashes).toEqual([]);
    expect(sim.scheduledEvents).toEqual([]);
    expect(sim.npcBroadcaster).toBeNull();
    expect(sim.stars[0].hasFired).toBe(false);
  });
});

// --- handleCollision ---

describe('handleCollision', () => {
  it('creates flash and transitions to DETECTED for user target', () => {
    const sim = makeSim();
    const ctx = createMockCtx();
    handleCollision(sim, { hunterIndex: 0, target: 'user' }, ctx);

    expect(sim.flashes).toHaveLength(1);
    expect(sim.flashes[0]).toEqual({ x: 10, y: 20, life: 1 });
    expect(ctx.transitionState).toHaveBeenCalledWith(STATES.DETECTED);
    expect(ctx.sound.playDetection).toHaveBeenCalled();
    expect(sim.scheduledEvents).toHaveLength(1);
    expect(sim.scheduledEvents[0].type).toBe('HUNTER_FIRE');
  });

  it('creates flash and schedules HUNTER_FIRE for npc target without DETECTED', () => {
    const sim = makeSim();
    sim.npcBroadcaster = { x: 50, y: 60, alive: true };
    const ctx = createMockCtx();
    handleCollision(sim, { hunterIndex: 0, target: 'npc' }, ctx);

    expect(sim.flashes).toHaveLength(1);
    expect(ctx.transitionState).not.toHaveBeenCalled();
    expect(sim.scheduledEvents).toHaveLength(1);
  });

  it('early returns when target is dead', () => {
    const sim = makeSim();
    sim.userStar.alive = false;
    const ctx = createMockCtx();
    handleCollision(sim, { hunterIndex: 0, target: 'user' }, ctx);

    expect(sim.flashes).toHaveLength(0);
    expect(ctx.transitionState).not.toHaveBeenCalled();
  });
});

// --- handleImpact ---

describe('handleImpact', () => {
  it('destroys NPC target: shake, particles, alive=false, WITNESS', () => {
    const sim = makeSim();
    sim.npcBroadcaster = { x: 30, y: 40, alive: true };
    const ctx = createMockCtx();
    handleImpact(sim, { isNpcTarget: true }, ctx);

    expect(sim.shake.intensity).toBe(10);
    expect(sim.particles).toHaveLength(30);
    expect(sim.npcBroadcaster.alive).toBe(false);
    expect(ctx.setCivCount).toHaveBeenCalled();
    expect(ctx.sound.playExplosion).toHaveBeenCalled();
    expect(ctx.transitionState).toHaveBeenCalledWith(STATES.WITNESS);
  });

  it('destroys user target: shake 25, 60 particles, DESTROYED', () => {
    const sim = makeSim();
    const ctx = createMockCtx();
    handleImpact(sim, { isNpcTarget: false }, ctx);

    expect(sim.shake.intensity).toBe(25);
    expect(sim.particles).toHaveLength(60);
    expect(sim.userStar.alive).toBe(false);
    expect(ctx.transitionState).toHaveBeenCalledWith(STATES.DESTROYED);
  });

  it('early returns when NPC target is already dead', () => {
    const sim = makeSim();
    sim.npcBroadcaster = { x: 30, y: 40, alive: false };
    const ctx = createMockCtx();
    handleImpact(sim, { isNpcTarget: true }, ctx);
    expect(sim.particles).toHaveLength(0);
  });

  it('early returns when user target is already dead', () => {
    const sim = makeSim();
    sim.userStar.alive = false;
    const ctx = createMockCtx();
    handleImpact(sim, { isNpcTarget: false }, ctx);
    expect(sim.particles).toHaveLength(0);
  });
});

// --- handleScheduledEvent ---

describe('handleScheduledEvent', () => {
  it('HUNTER_FIRE creates attack if target alive', () => {
    const sim = makeSim();
    const ctx = createMockCtx();
    handleScheduledEvent(sim, {
      type: 'HUNTER_FIRE', hunterX: 10, hunterY: 20, targetType: 'user',
    }, ctx);

    expect(sim.attacks).toHaveLength(1);
    expect(sim.attacks[0].startX).toBe(10);
    expect(sim.attacks[0].targetX).toBe(400);
    expect(sim.attacks[0].isNpcTarget).toBe(false);
  });

  it('HUNTER_FIRE no-ops if target dead', () => {
    const sim = makeSim();
    sim.userStar.alive = false;
    const ctx = createMockCtx();
    handleScheduledEvent(sim, {
      type: 'HUNTER_FIRE', hunterX: 10, hunterY: 20, targetType: 'user',
    }, ctx);
    expect(sim.attacks).toHaveLength(0);
  });

  it('NPC_BROADCAST creates broadcaster and wave when LISTENING', () => {
    const sim = makeSim();
    const ctx = createMockCtx(STATES.LISTENING);
    handleScheduledEvent(sim, { type: 'NPC_BROADCAST' }, ctx);

    expect(sim.npcBroadcaster).not.toBeNull();
    expect(sim.npcBroadcaster.alive).toBe(true);
    expect(sim.waves).toHaveLength(1);
    expect(sim.waves[0].isNpc).toBe(true);
    expect(ctx.sound.playBroadcast).toHaveBeenCalled();
  });

  it('NPC_BROADCAST no-ops when not LISTENING', () => {
    const sim = makeSim();
    const ctx = createMockCtx(STATES.START);
    handleScheduledEvent(sim, { type: 'NPC_BROADCAST' }, ctx);
    expect(sim.npcBroadcaster).toBeNull();
    expect(sim.waves).toHaveLength(0);
  });

  it('WHISPER_SAFE transitions to SAFE when WHISPERING', () => {
    const sim = makeSim();
    const ctx = createMockCtx(STATES.WHISPERING);
    handleScheduledEvent(sim, { type: 'WHISPER_SAFE' }, ctx);
    expect(ctx.transitionState).toHaveBeenCalledWith(STATES.SAFE);
  });

  it('WHISPER_SAFE no-ops when not WHISPERING', () => {
    const sim = makeSim();
    const ctx = createMockCtx(STATES.START);
    handleScheduledEvent(sim, { type: 'WHISPER_SAFE' }, ctx);
    expect(ctx.transitionState).not.toHaveBeenCalled();
  });
});

// --- doBroadcast ---

describe('doBroadcast', () => {
  it('sets state, plays sounds, and creates wave', () => {
    const sim = makeSim();
    const ctx = createMockCtx();
    doBroadcast(sim, ctx);

    expect(ctx.setGameState).toHaveBeenCalledWith(STATES.BROADCASTING);
    expect(ctx.sound.playBroadcast).toHaveBeenCalled();
    expect(ctx.sound.startDrone).toHaveBeenCalled();
    expect(sim.waves).toHaveLength(1);
    expect(sim.waves[0].x).toBe(400);
    expect(sim.waves[0].y).toBe(300);
  });
});

// --- doWhisper ---

describe('doWhisper', () => {
  it('sets state, plays sound, creates whisper wave', () => {
    const sim = makeSim();
    const ctx = createMockCtx();
    doWhisper(sim, ctx);

    expect(ctx.setGameState).toHaveBeenCalledWith(STATES.WHISPERING);
    expect(ctx.sound.playWhisper).toHaveBeenCalled();
    expect(sim.waves).toHaveLength(1);
    expect(sim.waves[0].isWhisper).toBe(true);
    expect(sim.waves[0].maxRadius).toBe(200);
    expect(sim.waves[0].alpha).toBe(0.6);
  });

  it('schedules WHISPER_SAFE when no hunter in range', () => {
    const sim = makeSim();
    // Move hunter far away
    sim.stars[0].x = 9999;
    sim.stars[0].y = 9999;
    const ctx = createMockCtx();
    doWhisper(sim, ctx);

    expect(sim.scheduledEvents).toHaveLength(1);
    expect(sim.scheduledEvents[0].type).toBe('WHISPER_SAFE');
  });

  it('does NOT schedule WHISPER_SAFE when hunter is in range', () => {
    const sim = makeSim();
    // Place hunter within WHISPER_MAX_RADIUS of userStar (400,300)
    sim.stars[0].x = 400;
    sim.stars[0].y = 350;
    const ctx = createMockCtx();
    doWhisper(sim, ctx);

    expect(sim.scheduledEvents).toHaveLength(0);
  });
});

// --- doListen ---

describe('doListen', () => {
  it('sets state and schedules NPC_BROADCAST', () => {
    const sim = makeSim();
    const ctx = createMockCtx();
    doListen(sim, ctx);

    expect(ctx.setGameState).toHaveBeenCalledWith(STATES.LISTENING);
    expect(sim.scheduledEvents).toHaveLength(1);
    expect(sim.scheduledEvents[0].type).toBe('NPC_BROADCAST');
  });
});
