import { useEffect, useRef, useState, useCallback } from 'react';
import { createSim } from '../simulation/entities';
import { updateWaves, updateAttacks, updateParticles, updateFlashes, updateShake, updateScheduledEvents } from '../simulation/physics';
import { render } from '../simulation/renderer';
import { handleCollision, handleImpact, handleScheduledEvent, clearEffects, doBroadcast, doWhisper, doListen } from '../simulation/rules';
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

    const rulesCtx = {
      transitionState,
      setGameState,
      gameStateRef,
      get sound() { return soundRef.current; },
      setCivCount,
    };

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
        for (const event of triggered) handleScheduledEvent(sim, event, rulesCtx);

        const collisions = updateWaves(sim);
        for (const c of collisions) handleCollision(sim, c, rulesCtx);

        const impacts = updateAttacks(sim);
        for (const impact of impacts) handleImpact(sim, impact, rulesCtx);
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

  const clearAll = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return;
    clearEffects(sim);
    setPendingState(null);
  }, [setPendingState]);

  // --- User actions ---

  const broadcast = useCallback(() => {
    if (!canAct()) return;
    const sim = simRef.current;
    if (!sim?.userStar?.alive) return;
    clearAll();
    doBroadcast(sim, { setGameState, sound: soundRef.current });
  }, [setGameState, clearAll, canAct]);

  const whisper = useCallback(() => {
    if (!canAct()) return;
    const sim = simRef.current;
    if (!sim?.userStar?.alive) return;
    clearAll();
    doWhisper(sim, { setGameState, sound: soundRef.current });
  }, [setGameState, clearAll, canAct]);

  const listen = useCallback(() => {
    if (!canAct()) return;
    const sim = simRef.current;
    if (!sim) return;
    clearAll();
    doListen(sim, { setGameState });
  }, [setGameState, clearAll, canAct]);

  const reset = useCallback(() => {
    clearAll();
    soundRef.current?.stopDrone?.();
    setGameState('START');
    setInitKey(k => k + 1);
  }, [setGameState, clearAll]);

  return { canvasRef, gameState, pendingState, civCount, broadcast, whisper, listen, reset, advance };
};
