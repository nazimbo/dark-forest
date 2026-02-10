import { STATES } from './constants';

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
      ctx.fillStyle = `rgba(239, 68, 68, ${star.alpha})`;
    } else if (!star.alive) {
      ctx.fillStyle = `rgba(255, 100, 50, ${star.alpha * 0.3})`;
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    }
    ctx.fill();
  }
}

export function drawNpcBroadcaster(ctx, npc) {
  if (!npc?.alive) return;
  const pulseSize = npc.size + 1 + Math.sin(Date.now() / 200) * 0.8;
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#34D399';
  ctx.beginPath();
  ctx.arc(npc.x, npc.y, pulseSize, 0, Math.PI * 2);
  ctx.fillStyle = '#34D399';
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#6EE7B7';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SIGNAL', npc.x, npc.y + 15);
}

export function drawUserStar(ctx, userStar, gameState) {
  if (!userStar?.alive) return;
  const pulseSize = userStar.size + Math.sin(Date.now() / 200);

  ctx.shadowBlur = 15;
  ctx.shadowColor = userStar.color;
  ctx.beginPath();
  ctx.arc(userStar.x, userStar.y, pulseSize, 0, Math.PI * 2);
  ctx.fillStyle = userStar.color;
  ctx.fill();
  ctx.shadowBlur = 0;

  if (gameState !== STATES.DESTROYED) {
    ctx.fillStyle = '#93C5FD';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU', userStar.x, userStar.y + 15);
  }
}

export function drawWaves(ctx, waves) {
  for (const wave of waves) {
    if (wave.alpha <= 0) continue;
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${wave.color}, ${Math.max(0, wave.alpha)})`;
    ctx.lineWidth = wave.isWhisper ? 1 : 2;
    ctx.stroke();
  }
}

export function drawAttacks(ctx, attacks) {
  for (const atk of attacks) {
    for (let t = 0; t < atk.trail.length - 1; t++) {
      const trailAlpha = (t / atk.trail.length) * 0.6;
      const trailWidth = (t / atk.trail.length) * 3;
      ctx.beginPath();
      ctx.moveTo(atk.trail[t].x, atk.trail[t].y);
      ctx.lineTo(atk.trail[t + 1].x, atk.trail[t + 1].y);
      ctx.strokeStyle = `rgba(239, 68, 68, ${trailAlpha})`;
      ctx.lineWidth = trailWidth;
      ctx.stroke();
    }

    const cx = atk.startX + (atk.targetX - atk.startX) * atk.progress;
    const cy = atk.startY + (atk.targetY - atk.startY) * atk.progress;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#EF4444';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

export function drawParticles(ctx, particles) {
  for (const p of particles) {
    const size = 1 + p.life * 2;
    ctx.fillStyle = `rgba(${p.color || '255, 100, 50'}, ${Math.max(0, p.life)})`;
    ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
  }
}

export function drawFlashes(ctx, flashes) {
  for (const f of flashes) {
    ctx.fillStyle = `rgba(255, 255, 255, ${f.life})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 10 * f.life, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function render(ctx, sim, gameState, width, height) {
  ctx.save();

  if (sim.shake.intensity > 0) {
    ctx.translate(
      (Math.random() - 0.5) * sim.shake.intensity,
      (Math.random() - 0.5) * sim.shake.intensity
    );
  }

  ctx.fillStyle = 'rgba(5, 5, 10, 0.4)';
  ctx.fillRect(-10, -10, width + 20, height + 20);

  drawNebulae(ctx, sim.nebulae);
  drawStars(ctx, sim.stars, gameState);
  drawNpcBroadcaster(ctx, sim.npcBroadcaster);
  drawUserStar(ctx, sim.userStar, gameState);
  drawWaves(ctx, sim.waves);
  drawAttacks(ctx, sim.attacks);
  drawFlashes(ctx, sim.flashes);
  drawParticles(ctx, sim.particles);

  ctx.restore();
}
