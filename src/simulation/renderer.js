import { STATES } from './constants';
import { RGB, HEX } from './palette';

function getScale(width) {
  return Math.max(1, Math.min(1.8, 800 / width));
}

export function drawNebulae(ctx, nebulae) {
  for (const n of nebulae) {
    const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
    g.addColorStop(0, `rgba(${n.color}, ${n.alpha})`);
    g.addColorStop(1, `rgba(${n.color}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Star twinkling (alpha mutation) is kept here — purely decorative,
// does not affect game logic, and is simpler than a separate update pass.
export function drawStars(ctx, stars, gameState) {
  for (const star of stars) {
    star.alpha += star.alphaChange;
    if (star.alpha <= 0.1 || star.alpha >= 1) star.alphaChange *= -1;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

    if (star.isHunter && gameState === STATES.DESTROYED) {
      ctx.fillStyle = `rgba(${RGB.hunter}, ${star.alpha})`;
    } else if (!star.alive) {
      ctx.fillStyle = `rgba(${RGB.ember}, ${star.alpha * 0.3})`;
    } else {
      ctx.fillStyle = `rgba(${RGB.white}, ${star.alpha})`;
    }
    ctx.fill();
  }
}

export function drawNpcBroadcaster(ctx, npc, scale, label = 'SIGNAL') {
  if (!npc?.alive) return;
  const pulseSize = npc.size + 1 + Math.sin(Date.now() / 200) * 0.8;
  ctx.shadowBlur = 10 * scale;
  ctx.shadowColor = HEX.broadcaster;
  ctx.beginPath();
  ctx.arc(npc.x, npc.y, pulseSize, 0, Math.PI * 2);
  ctx.fillStyle = HEX.broadcaster;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = HEX.broadcasterLabel;
  ctx.font = `${Math.round(11 * scale)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(label, npc.x, npc.y + 15 * scale);
}

export function drawUserStar(ctx, userStar, gameState, scale, label = 'YOU') {
  if (!userStar?.alive) return;
  const pulseSize = userStar.size + Math.sin(Date.now() / 200);

  ctx.shadowBlur = 15 * scale;
  ctx.shadowColor = userStar.color;
  ctx.beginPath();
  ctx.arc(userStar.x, userStar.y, pulseSize, 0, Math.PI * 2);
  ctx.fillStyle = userStar.color;
  ctx.fill();
  ctx.shadowBlur = 0;

  if (gameState !== STATES.DESTROYED) {
    ctx.fillStyle = HEX.userLabel;
    ctx.font = `${Math.round(11 * scale)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(label, userStar.x, userStar.y + 15 * scale);
  }
}

export function drawWaves(ctx, waves, scale) {
  for (const wave of waves) {
    if (wave.alpha <= 0) continue;
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${wave.color}, ${Math.max(0, wave.alpha)})`;
    ctx.lineWidth = (wave.isWhisper ? 1.5 : 2.5) * scale;
    ctx.stroke();
  }
}

export function drawAttacks(ctx, attacks, scale) {
  for (const atk of attacks) {
    for (let t = 0; t < atk.trail.length - 1; t++) {
      const trailAlpha = (t / atk.trail.length) * 0.6;
      const trailWidth = (t / atk.trail.length) * 3 * scale;
      ctx.beginPath();
      ctx.moveTo(atk.trail[t].x, atk.trail[t].y);
      ctx.lineTo(atk.trail[t + 1].x, atk.trail[t + 1].y);
      ctx.strokeStyle = `rgba(${RGB.hunter}, ${trailAlpha})`;
      ctx.lineWidth = trailWidth;
      ctx.stroke();
    }

    const cx = atk.startX + (atk.targetX - atk.startX) * atk.progress;
    const cy = atk.startY + (atk.targetY - atk.startY) * atk.progress;
    ctx.shadowBlur = 8 * scale;
    ctx.shadowColor = HEX.attackGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 3 * scale, 0, Math.PI * 2);
    ctx.fillStyle = HEX.attackCore;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

export function drawParticles(ctx, particles) {
  for (const p of particles) {
    const size = 1 + p.life * 2;
    ctx.fillStyle = `rgba(${p.color || RGB.ember}, ${Math.max(0, p.life)})`;
    ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
  }
}

export function drawFlashes(ctx, flashes, scale) {
  for (const f of flashes) {
    ctx.fillStyle = `rgba(${RGB.white}, ${f.life})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 10 * scale * f.life, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function render(ctx, sim, gameState, width, height, reducedMotion, labels = {}) {
  ctx.save();

  if (!reducedMotion && sim.shake.intensity > 0) {
    ctx.translate(
      (Math.random() - 0.5) * sim.shake.intensity,
      (Math.random() - 0.5) * sim.shake.intensity
    );
  }

  ctx.fillStyle = `rgba(${RGB.space}, 0.4)`;
  ctx.fillRect(-10, -10, width + 20, height + 20);

  const scale = getScale(width);

  drawNebulae(ctx, sim.nebulae);
  drawStars(ctx, sim.stars, gameState);
  drawNpcBroadcaster(ctx, sim.npcBroadcaster, scale, labels.signal);
  drawUserStar(ctx, sim.userStar, gameState, scale, labels.you);
  drawWaves(ctx, sim.waves, scale);
  drawAttacks(ctx, sim.attacks, scale);
  drawFlashes(ctx, sim.flashes, scale);
  drawParticles(ctx, sim.particles);

  ctx.restore();
}
