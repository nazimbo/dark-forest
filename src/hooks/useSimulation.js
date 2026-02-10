import { useEffect, useRef, useState, useCallback } from 'react';
import { STATES, WHISPER_MAX_RADIUS, msToFrames } from '../simulation/constants';
import { createSim, createWave, createAttack, createExplosionParticles, createFlash } from '../simulation/entities';
import { updateWaves, updateAttacks, updateParticles, updateFlashes, updateShake, updateScheduledEvents, scheduleEvent } from '../simulation/physics';
import { render } from '../simulation/renderer';
import { useGameState } from './useGameState';

export const useSimulation = (sound) => {
  const canvasRef = useRef(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const [initKey, setInitKey] = useState(0);
  const [civCount, setCivCount] = useState(0);

  const {
    gameState, gameStateRef, pendingState, pendingStateRef,
    setGameState, setPendingState, transitionState, advance, canAct,
  } = useGameState();

  const simRef = useRef(null);
  const soundRef = useRef(sound);
  useEffect(() => { soundRef.current = sound; }, [sound]);

  // Resize — update canvas size directly, do NOT re-init the simulation
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const prev = dimensionsRef.current;

      if (prev.width === w && prev.height > 0 && Math.abs(prev.height - h) < 150) {
        return;
      }

      dimensionsRef.current = { width: w, height: h };
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
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

  // Main simulation init + loop
  useEffect(() => {
    const { width, height } = dimensionsRef.current;
    if (width === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    const { sim, livingCivs } = createSim(width, height);
    simRef.current = sim;
    setCivCount(livingCivs);

    // --- Event handlers ---

    const handleCollision = (collision) => {
      const hunter = sim.stars[collision.hunterIndex];
      const target = collision.target === 'npc' ? sim.npcBroadcaster : sim.userStar;
      if (!target?.alive) return;

      sim.flashes.push(createFlash(hunter.x, hunter.y));

      if (collision.target === 'user') {
        transitionState(STATES.DETECTED);
        soundRef.current?.playDetection?.();
      }

      const delayFrames = msToFrames(300 + Math.random() * 1500);
      scheduleEvent(sim, delayFrames, 'HUNTER_FIRE', {
        hunterX: hunter.x,
        hunterY: hunter.y,
        targetType: collision.target,
      });
    };

    const handleImpact = (impact) => {
      if (impact.isNpcTarget) {
        if (!sim.npcBroadcaster?.alive) return;
        sim.shake.intensity = 10;
        sim.particles.push(
          ...createExplosionParticles(sim.npcBroadcaster.x, sim.npcBroadcaster.y, 30, '52, 211, 153')
        );
        sim.npcBroadcaster.alive = false;
        const star = sim.stars.find(s => s.x === sim.npcBroadcaster.x && s.y === sim.npcBroadcaster.y);
        if (star) star.alive = false;
        setCivCount(c => c - 1);
        soundRef.current?.playExplosion?.();
        transitionState(STATES.WITNESS);
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
        setCivCount(c => c - 1);
        soundRef.current?.playExplosion?.();
        transitionState(STATES.DESTROYED);
      }
    };

    const handleScheduledEvent = (event) => {
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
          if (gameStateRef.current !== STATES.LISTENING) return;
          const candidates = sim.stars.filter(s => !s.isHunter && s.alive);
          if (candidates.length === 0) return;
          const npc = candidates[Math.floor(Math.random() * candidates.length)];
          sim.npcBroadcaster = { x: npc.x, y: npc.y, size: npc.size, alive: true };
          sim.waves.push(createWave(npc.x, npc.y, {
            alpha: 0.8,
            color: '52, 211, 153',
            isNpc: true,
          }));
          soundRef.current?.playBroadcast?.();
          break;
        }
        case 'WHISPER_SAFE': {
          if (gameStateRef.current === STATES.WHISPERING) {
            transitionState(STATES.SAFE);
          }
          break;
        }
      }
    };

    // --- Animation loop: update → events → render ---

    const loop = () => {
      if (!ctx) return;
      const currentState = gameStateRef.current;
      const isPaused = pendingStateRef.current != null;

      // Decorative updates always run
      updateShake(sim);
      updateParticles(sim);
      updateFlashes(sim);

      if (!isPaused) {
        const triggered = updateScheduledEvents(sim);
        for (const event of triggered) handleScheduledEvent(event);

        const collisions = updateWaves(sim);
        for (const c of collisions) handleCollision(c);

        const impacts = updateAttacks(sim);
        for (const impact of impacts) handleImpact(impact);
      }

      const { width: curW, height: curH } = dimensionsRef.current;
      render(ctx, sim, currentState, curW, curH);

      sim.animationId = requestAnimationFrame(loop);
    };

    sim.animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(sim.animationId);
    };
  }, [initKey, setGameState, transitionState, gameStateRef, pendingStateRef]);

  // --- Shared cleanup ---

  const clearEffects = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return;
    sim.waves = [];
    sim.attacks = [];
    sim.flashes = [];
    sim.scheduledEvents = [];
    sim.npcBroadcaster = null;
    sim.stars.forEach(s => { s.hasFired = false; });
    setPendingState(null);
  }, [setPendingState]);

  // --- User actions ---

  const broadcast = useCallback(() => {
    if (!canAct()) return;
    const sim = simRef.current;
    if (!sim?.userStar?.alive) return;

    clearEffects();
    setGameState(STATES.BROADCASTING);
    soundRef.current?.playBroadcast?.();
    soundRef.current?.startDrone?.();

    sim.waves.push(createWave(sim.userStar.x, sim.userStar.y));
  }, [setGameState, clearEffects, canAct]);

  const whisper = useCallback(() => {
    if (!canAct()) return;
    const sim = simRef.current;
    if (!sim?.userStar?.alive) return;

    clearEffects();
    setGameState(STATES.WHISPERING);
    soundRef.current?.playWhisper?.();

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
  }, [setGameState, clearEffects, canAct]);

  const listen = useCallback(() => {
    if (!canAct()) return;
    const sim = simRef.current;
    if (!sim) return;

    clearEffects();
    setGameState(STATES.LISTENING);

    const delayFrames = msToFrames(3000 + Math.random() * 5000);
    scheduleEvent(sim, delayFrames, 'NPC_BROADCAST');
  }, [setGameState, clearEffects, canAct]);

  const reset = useCallback(() => {
    clearEffects();
    soundRef.current?.stopDrone?.();
    setGameState(STATES.START);
    setInitKey(k => k + 1);
  }, [setGameState, clearEffects]);

  return { canvasRef, gameState, pendingState, civCount, broadcast, whisper, listen, reset, advance };
};
