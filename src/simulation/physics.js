import { LIGHT_SPEED, ATTACK_SPEED } from './constants';

// Expand waves, fade alpha, detect collisions with hunter stars.
// Returns collision events: [{ hunterIndex, target: 'user'|'npc' }]
export function updateWaves(sim) {
  const collisions = [];

  for (let i = sim.waves.length - 1; i >= 0; i--) {
    const wave = sim.waves[i];
    wave.radius += LIGHT_SPEED;
    wave.alpha -= 0.002;

    if (wave.maxRadius && wave.radius > wave.maxRadius) {
      wave.alpha -= 0.02;
    }

    if (!wave.maxRadius || wave.radius <= wave.maxRadius) {
      for (let j = 0; j < sim.stars.length; j++) {
        const star = sim.stars[j];
        if (!star.isHunter || star.hasFired) continue;
        const dx = star.x - wave.x;
        const dy = star.y - wave.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (Math.abs(dist - wave.radius) < 5) {
          star.hasFired = true;
          collisions.push({
            hunterIndex: j,
            target: wave.isNpc ? 'npc' : 'user',
          });
        }
      }
    }

    if (wave.alpha <= 0) sim.waves.splice(i, 1);
  }

  return collisions;
}

// Advance photoid attacks along their trajectories.
// Returns impact events: [{ isNpcTarget }]
export function updateAttacks(sim) {
  const impacts = [];

  for (let i = sim.attacks.length - 1; i >= 0; i--) {
    const atk = sim.attacks[i];
    atk.progress += ATTACK_SPEED;

    const cx = atk.startX + (atk.targetX - atk.startX) * atk.progress;
    const cy = atk.startY + (atk.targetY - atk.startY) * atk.progress;
    atk.trail.push({ x: cx, y: cy });
    if (atk.trail.length > 20) atk.trail.shift();

    if (atk.progress >= 1) {
      impacts.push({ isNpcTarget: atk.isNpcTarget });
      sim.attacks.splice(i, 1);
    }
  }

  return impacts;
}

export function updateParticles(sim) {
  for (let i = sim.particles.length - 1; i >= 0; i--) {
    const p = sim.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.life -= 0.015;
    if (p.life <= 0) sim.particles.splice(i, 1);
  }
}

export function updateFlashes(sim) {
  for (let i = sim.flashes.length - 1; i >= 0; i--) {
    sim.flashes[i].life -= 0.08;
    if (sim.flashes[i].life <= 0) sim.flashes.splice(i, 1);
  }
}

export function updateShake(sim) {
  if (sim.shake.intensity > 0.5) {
    sim.shake.intensity *= 0.92;
  } else {
    sim.shake.intensity = 0;
  }
}

// Decrement frame counters on scheduled events; return those that triggered.
export function updateScheduledEvents(sim) {
  const triggered = [];
  for (let i = sim.scheduledEvents.length - 1; i >= 0; i--) {
    sim.scheduledEvents[i].framesRemaining--;
    if (sim.scheduledEvents[i].framesRemaining <= 0) {
      triggered.push(sim.scheduledEvents[i]);
      sim.scheduledEvents.splice(i, 1);
    }
  }
  return triggered;
}

export function scheduleEvent(sim, framesRemaining, type, data = {}) {
  sim.scheduledEvents.push({ framesRemaining, type, ...data });
}
