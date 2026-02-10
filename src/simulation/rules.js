import { STATES, WHISPER_MAX_RADIUS, msToFrames } from './constants';
import { createWave, createAttack, createExplosionParticles, createFlash } from './entities';
import { scheduleEvent } from './physics';

// --- Collision / Impact / Scheduled-event handlers ---

export function handleCollision(sim, collision, ctx) {
  const hunter = sim.stars[collision.hunterIndex];
  const target = collision.target === 'npc' ? sim.npcBroadcaster : sim.userStar;
  if (!target?.alive) return;

  sim.flashes.push(createFlash(hunter.x, hunter.y));

  if (collision.target === 'user') {
    ctx.transitionState(STATES.DETECTED);
    ctx.sound?.playDetection?.();
  }

  const delayFrames = msToFrames(300 + Math.random() * 1500);
  scheduleEvent(sim, delayFrames, 'HUNTER_FIRE', {
    hunterX: hunter.x,
    hunterY: hunter.y,
    targetType: collision.target,
  });
}

export function handleImpact(sim, impact, ctx) {
  if (impact.isNpcTarget) {
    if (!sim.npcBroadcaster?.alive) return;
    sim.shake.intensity = 10;
    sim.particles.push(
      ...createExplosionParticles(sim.npcBroadcaster.x, sim.npcBroadcaster.y, 30, '52, 211, 153')
    );
    sim.npcBroadcaster.alive = false;
    const star = sim.stars.find(s => s.x === sim.npcBroadcaster.x && s.y === sim.npcBroadcaster.y);
    if (star) star.alive = false;
    ctx.setCivCount(c => c - 1);
    ctx.sound?.playExplosion?.();
    ctx.transitionState(STATES.WITNESS);
  } else {
    if (!sim.userStar?.alive) return;
    sim.shake.intensity = 25;
    sim.particles.push(
      ...createExplosionParticles(
        sim.userStar.x, sim.userStar.y, 60,
        () => Math.random() > 0.5 ? '255, 100, 50' : '96, 165, 250'
      )
    );
    sim.userStar.alive = false;
    ctx.setCivCount(c => c - 1);
    ctx.sound?.playExplosion?.();
    ctx.transitionState(STATES.DESTROYED);
  }
}

export function handleScheduledEvent(sim, event, ctx) {
  switch (event.type) {
    case 'HUNTER_FIRE': {
      const target = event.targetType === 'npc' ? sim.npcBroadcaster : sim.userStar;
      if (!target?.alive) return;
      sim.attacks.push(createAttack(
        { x: event.hunterX, y: event.hunterY },
        target,
        event.targetType === 'npc',
      ));
      break;
    }
    case 'NPC_BROADCAST': {
      if (ctx.gameStateRef.current !== STATES.LISTENING) return;
      const candidates = sim.stars.filter(s => !s.isHunter && s.alive);
      if (candidates.length === 0) return;
      const npc = candidates[Math.floor(Math.random() * candidates.length)];
      sim.npcBroadcaster = { x: npc.x, y: npc.y, size: npc.size, alive: true };
      sim.waves.push(createWave(npc.x, npc.y, {
        alpha: 0.8,
        color: '52, 211, 153',
        isNpc: true,
      }));
      ctx.sound?.playBroadcast?.();
      break;
    }
    case 'WHISPER_SAFE': {
      if (ctx.gameStateRef.current === STATES.WHISPERING) {
        ctx.transitionState(STATES.SAFE);
      }
      break;
    }
  }
}

// --- Effect cleanup ---

export function clearEffects(sim) {
  sim.waves = [];
  sim.attacks = [];
  sim.flashes = [];
  sim.scheduledEvents = [];
  sim.npcBroadcaster = null;
  sim.stars.forEach(s => { s.hasFired = false; });
}

// --- User-action game logic ---

export function doBroadcast(sim, ctx) {
  ctx.setGameState(STATES.BROADCASTING);
  ctx.sound?.playBroadcast?.();
  ctx.sound?.startDrone?.();
  sim.waves.push(createWave(sim.userStar.x, sim.userStar.y));
}

export function doWhisper(sim, ctx) {
  ctx.setGameState(STATES.WHISPERING);
  ctx.sound?.playWhisper?.();

  sim.waves.push(createWave(sim.userStar.x, sim.userStar.y, {
    alpha: 0.6,
    maxRadius: WHISPER_MAX_RADIUS,
    isWhisper: true,
  }));

  const hasHunterInRange = sim.stars.some(s => {
    if (!s.isHunter) return false;
    const dx = s.x - sim.userStar.x;
    const dy = s.y - sim.userStar.y;
    return Math.sqrt(dx * dx + dy * dy) <= WHISPER_MAX_RADIUS;
  });

  if (!hasHunterInRange) {
    scheduleEvent(sim, msToFrames(5000), 'WHISPER_SAFE');
  }
}

export function doListen(sim, ctx) {
  ctx.setGameState(STATES.LISTENING);
  const delayFrames = msToFrames(3000 + Math.random() * 5000);
  scheduleEvent(sim, delayFrames, 'NPC_BROADCAST');
}
