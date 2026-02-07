import { useEffect, useRef, useState, useCallback } from 'react';

const LIGHT_SPEED = 3;
const WHISPER_MAX_RADIUS = 200;
const ATTACK_SPEED = 0.04;
const HUNTER_RATIO = 0.2;
const STAR_DENSITY = 8000;

export const useSimulation = (sound) => {
  const canvasRef = useRef(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const [initKey, setInitKey] = useState(0);
  const [civCount, setCivCount] = useState(0);

  const [gameState, _setGameState] = useState('START');
  const gameStateRef = useRef('START');
  const setGameState = useCallback((val) => {
    gameStateRef.current = val;
    _setGameState(val);
  }, []);

  // Pending transition — simulation freezes until user clicks "Continue"
  const [pendingState, _setPendingState] = useState(null);
  const pendingStateRef = useRef(null);
  const setPendingState = useCallback((val) => {
    pendingStateRef.current = val;
    _setPendingState(val);
  }, []);

  // Queue an automatic transition (freeze + wait for user)
  const transitionState = useCallback((newState) => {
    if (pendingStateRef.current != null) return; // already queued
    if (gameStateRef.current === newState) return;
    setPendingState(newState);
  }, [setPendingState]);

  // User clicks "Continue" → apply pending state, unfreeze
  const advance = useCallback(() => {
    const next = pendingStateRef.current;
    if (!next) return;
    setPendingState(null);
    setGameState(next);
  }, [setGameState, setPendingState]);

  const simRef = useRef(null);
  const timeoutsRef = useRef([]);
  const soundRef = useRef(sound);
  useEffect(() => { soundRef.current = sound; }, [sound]);

  // Resize — update canvas size directly, do NOT re-init the simulation
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const prev = dimensionsRef.current;

      // Skip small height-only changes (mobile address bar toggle)
      if (prev.width === w && prev.height > 0 && Math.abs(prev.height - h) < 150) {
        return;
      }

      dimensionsRef.current = { width: w, height: h };
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
        // Full opaque clear to prevent flash after canvas reset
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'rgb(5, 5, 10)';
          ctx.fillRect(0, 0, w, h);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main simulation init + loop — runs once on mount or on explicit reset (initKey)
  useEffect(() => {
    const { width, height } = dimensionsRef.current;
    if (width === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    // --- Generate stars ---
    const starCount = Math.floor((width * height) / STAR_DENSITY);
    const stars = [];
    let livingCivs = 0;

    for (let i = 0; i < starCount; i++) {
      const isHunter = Math.random() < HUNTER_RATIO;
      if (!isHunter) livingCivs++;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        alphaChange: (Math.random() - 0.5) * 0.02,
        isHunter,
        hasFired: false,
        alive: true,
      });
    }

    // --- Generate nebulae ---
    const nebulaColors = [
      '59, 130, 246',
      '139, 92, 246',
      '20, 184, 166',
      '168, 85, 247',
    ];
    const nebulae = [];
    for (let i = 0; i < 4; i++) {
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 150 + Math.random() * 300,
        color: nebulaColors[i],
        alpha: 0.03 + Math.random() * 0.04,
      });
    }

    // --- User star ---
    const userStar = {
      x: width / 2,
      y: height / 2,
      size: 4,
      color: '#60A5FA',
      alive: true,
    };
    livingCivs++;

    const sim = {
      stars,
      userStar,
      waves: [],
      attacks: [],
      particles: [],
      nebulae,
      npcBroadcaster: null,
      shake: { intensity: 0 },
      animationId: null,
    };
    simRef.current = sim;
    setCivCount(livingCivs);

    // --- Helper: create explosion particles ---
    const createExplosion = (x, y, count, color) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        sim.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.5 + Math.random() * 0.5,
          color,
        });
      }
    };

    // --- Helper: destroy user (visuals immediate, state gated) ---
    const destroyUser = () => {
      if (!sim.userStar || !sim.userStar.alive) return;
      sim.shake.intensity = 25;
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        sim.particles.push({
          x: sim.userStar.x, y: sim.userStar.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.5 + Math.random() * 0.5,
          color: Math.random() > 0.5 ? '255, 100, 50' : '96, 165, 250',
        });
      }
      sim.userStar.alive = false;
      setCivCount(c => c - 1);
      soundRef.current?.playExplosion?.();
      transitionState('DESTROYED');
    };

    // --- Helper: destroy NPC ---
    const destroyNpc = () => {
      if (!sim.npcBroadcaster || !sim.npcBroadcaster.alive) return;
      sim.shake.intensity = 10;
      createExplosion(sim.npcBroadcaster.x, sim.npcBroadcaster.y, 30, '52, 211, 153');
      sim.npcBroadcaster.alive = false;
      const star = sim.stars.find(s => s.x === sim.npcBroadcaster.x && s.y === sim.npcBroadcaster.y);
      if (star) star.alive = false;
      setCivCount(c => c - 1);
      soundRef.current?.playExplosion?.();
      transitionState('WITNESS');
    };

    // --- Helper: trigger a hunter ---
    const triggerHunter = (hunterStar, target) => {
      if (!target || !target.alive) return;
      const isNpcTarget = target !== sim.userStar;

      if (!isNpcTarget) {
        transitionState('DETECTED');
        soundRef.current?.playDetection?.();
      }

      // Visual flash
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(hunterStar.x, hunterStar.y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Deliberation delay before firing
      const delay = 300 + Math.random() * 1500;
      const t = setTimeout(() => {
        if (!target.alive) return;
        sim.attacks.push({
          startX: hunterStar.x,
          startY: hunterStar.y,
          targetX: target.x,
          targetY: target.y,
          progress: 0,
          trail: [],
          isNpcTarget,
        });
      }, delay);
      timeoutsRef.current.push(t);
    };

    // --- Animation loop ---
    const loop = () => {
      if (!ctx) return;
      const currentState = gameStateRef.current;
      const isPaused = pendingStateRef.current != null;

      ctx.save();

      // Camera shake (always runs)
      if (sim.shake.intensity > 0.5) {
        ctx.translate(
          (Math.random() - 0.5) * sim.shake.intensity,
          (Math.random() - 0.5) * sim.shake.intensity
        );
        sim.shake.intensity *= 0.92;
      } else {
        sim.shake.intensity = 0;
      }

      // Clear with trail effect (use current dimensions for proper coverage after resize)
      const { width: curW, height: curH } = dimensionsRef.current;
      ctx.fillStyle = 'rgba(5, 5, 10, 0.4)';
      ctx.fillRect(-10, -10, curW + 20, curH + 20);

      // 0. Nebulae
      sim.nebulae.forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        g.addColorStop(0, `rgba(${n.color}, ${n.alpha})`);
        g.addColorStop(1, `rgba(${n.color}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 1. Background stars (always twinkle)
      sim.stars.forEach(star => {
        star.alpha += star.alphaChange;
        if (star.alpha <= 0.1 || star.alpha >= 1) star.alphaChange *= -1;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

        if (star.isHunter && currentState === 'DESTROYED') {
          ctx.fillStyle = `rgba(239, 68, 68, ${star.alpha})`;
        } else if (!star.alive) {
          ctx.fillStyle = `rgba(255, 100, 50, ${star.alpha * 0.3})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        }
        ctx.fill();
      });

      // 2. NPC broadcaster highlight
      if (sim.npcBroadcaster?.alive) {
        const npc = sim.npcBroadcaster;
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

      // 3. User star
      if (sim.userStar?.alive) {
        const u = sim.userStar;
        const pulseSize = u.size + Math.sin(Date.now() / 200);

        ctx.shadowBlur = 15;
        ctx.shadowColor = u.color;
        ctx.beginPath();
        ctx.arc(u.x, u.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = u.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (currentState !== 'DESTROYED') {
          ctx.fillStyle = '#93C5FD';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('YOU', u.x, u.y + 15);
        }
      }

      // 4. Waves — freeze propagation + collisions when paused
      for (let i = sim.waves.length - 1; i >= 0; i--) {
        const wave = sim.waves[i];

        if (!isPaused) {
          wave.radius += LIGHT_SPEED;
          wave.alpha -= 0.002;
          if (wave.maxRadius && wave.radius > wave.maxRadius) {
            wave.alpha -= 0.02;
          }
        }

        // Always draw
        if (wave.alpha > 0) {
          ctx.beginPath();
          ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${wave.color || '96, 165, 250'}, ${Math.max(0, wave.alpha)})`;
          ctx.lineWidth = wave.isWhisper ? 1 : 2;
          ctx.stroke();
        }

        // Collision detection only when not paused
        if (!isPaused && (!wave.maxRadius || wave.radius <= wave.maxRadius)) {
          sim.stars.forEach(star => {
            if (!star.isHunter || star.hasFired) return;
            const dx = star.x - wave.x;
            const dy = star.y - wave.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (Math.abs(dist - wave.radius) < 5) {
              star.hasFired = true;
              const target = wave.isNpc ? sim.npcBroadcaster : sim.userStar;
              if (target?.alive) triggerHunter(star, target);
            }
          });
        }

        if (!isPaused && wave.alpha <= 0) sim.waves.splice(i, 1);
      }

      // 5. Attacks — freeze progression when paused
      for (let i = sim.attacks.length - 1; i >= 0; i--) {
        const atk = sim.attacks[i];

        if (!isPaused) {
          atk.progress += ATTACK_SPEED;
        }

        const cx = atk.startX + (atk.targetX - atk.startX) * atk.progress;
        const cy = atk.startY + (atk.targetY - atk.startY) * atk.progress;

        if (!isPaused) {
          atk.trail.push({ x: cx, y: cy });
          if (atk.trail.length > 20) atk.trail.shift();
        }

        // Always draw trail
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

        // Glowing tip
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#EF4444';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Impact only when not paused
        if (!isPaused && atk.progress >= 1) {
          if (atk.isNpcTarget) {
            destroyNpc();
          } else {
            destroyUser();
          }
          sim.attacks.splice(i, 1);
        }
      }

      // 6. Particles (always animate — decorative)
      for (let i = sim.particles.length - 1; i >= 0; i--) {
        const p = sim.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= 0.015;

        const size = 1 + p.life * 2;
        ctx.fillStyle = `rgba(${p.color || '255, 100, 50'}, ${Math.max(0, p.life)})`;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);

        if (p.life <= 0) sim.particles.splice(i, 1);
      }

      ctx.restore();
      sim.animationId = requestAnimationFrame(loop);
    };

    sim.animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(sim.animationId);
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [initKey, setGameState, transitionState]);

  // --- Shared cleanup ---
  const clearEffects = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return;
    sim.waves = [];
    sim.attacks = [];
    sim.npcBroadcaster = null;
    sim.stars.forEach(s => { s.hasFired = false; });
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
    setPendingState(null);
  }, [setPendingState]);

  // --- User actions (instant, no gate) ---

  const broadcast = useCallback(() => {
    const state = gameStateRef.current;
    if (state !== 'START' && state !== 'WITNESS' && state !== 'SAFE') return;
    const sim = simRef.current;
    if (!sim?.userStar?.alive) return;

    clearEffects();
    setGameState('BROADCASTING');
    soundRef.current?.playBroadcast?.();
    soundRef.current?.startDrone?.();

    sim.waves.push({
      x: sim.userStar.x,
      y: sim.userStar.y,
      radius: 10,
      alpha: 1,
    });
  }, [setGameState, clearEffects]);

  const whisper = useCallback(() => {
    const state = gameStateRef.current;
    if (state !== 'START' && state !== 'WITNESS' && state !== 'SAFE') return;
    const sim = simRef.current;
    if (!sim?.userStar?.alive) return;

    clearEffects();
    setGameState('WHISPERING');
    soundRef.current?.playWhisper?.();

    sim.waves.push({
      x: sim.userStar.x,
      y: sim.userStar.y,
      radius: 10,
      alpha: 0.6,
      maxRadius: WHISPER_MAX_RADIUS,
      isWhisper: true,
    });

    const hasHunterInRange = sim.stars.some(s => {
      if (!s.isHunter) return false;
      const dx = s.x - sim.userStar.x;
      const dy = s.y - sim.userStar.y;
      return Math.sqrt(dx * dx + dy * dy) <= WHISPER_MAX_RADIUS;
    });

    if (!hasHunterInRange) {
      const t = setTimeout(() => {
        if (gameStateRef.current === 'WHISPERING') {
          transitionState('SAFE');
        }
      }, 5000);
      timeoutsRef.current.push(t);
    }
  }, [setGameState, clearEffects, transitionState]);

  const listen = useCallback(() => {
    const state = gameStateRef.current;
    if (state !== 'START' && state !== 'WITNESS' && state !== 'SAFE') return;
    const sim = simRef.current;
    if (!sim) return;

    clearEffects();
    setGameState('LISTENING');

    const delay = 3000 + Math.random() * 5000;
    const t = setTimeout(() => {
      if (gameStateRef.current !== 'LISTENING') return;

      const candidates = sim.stars.filter(s => !s.isHunter && s.alive);
      if (candidates.length === 0) return;

      const npc = candidates[Math.floor(Math.random() * candidates.length)];
      sim.npcBroadcaster = { x: npc.x, y: npc.y, size: npc.size, alive: true };

      sim.waves.push({
        x: npc.x,
        y: npc.y,
        radius: 10,
        alpha: 0.8,
        color: '52, 211, 153',
        isNpc: true,
      });

      soundRef.current?.playBroadcast?.();
    }, delay);
    timeoutsRef.current.push(t);
  }, [setGameState, clearEffects]);

  const reset = useCallback(() => {
    clearEffects();
    soundRef.current?.stopDrone?.();
    setGameState('START');
    setInitKey(k => k + 1);
  }, [setGameState, clearEffects]);

  return { canvasRef, gameState, pendingState, civCount, broadcast, whisper, listen, reset, advance };
};
