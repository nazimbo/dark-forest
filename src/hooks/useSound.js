import { useRef, useCallback, useEffect } from 'react';

// All sounds are synthesized at runtime via the Web Audio API — no audio files needed.
// Sound design overview:
//   startDrone    — Two sine oscillators slightly detuned (48Hz vs 48.7Hz) create a
//                   slow ~0.7Hz beat frequency, producing an eerie low rumble.
//   playBroadcast — Rising-then-falling sine sweep (220→880→440Hz) over 2.5s.
//   playWhisper   — Gentle short sine sweep (300→500Hz), quieter and briefer.
//   playDetection — Descending sawtooth (150→80Hz), harsh and alarming.
//   playExplosion — Two layers: a noise burst through a sweeping lowpass filter for
//                   the "crackle", plus a sub-bass sine thud (60→20Hz) for impact.

export const useSound = () => {
  const ctxRef = useRef(null);
  const droneRef = useRef(null);
  const masterRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const master = ctx.createGain();
      master.gain.value = 0.3;
      master.connect(ctx.destination);
      masterRef.current = master;
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const startDrone = useCallback(() => {
    const ctx = getCtx();
    if (droneRef.current) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.value = 48;
    osc2.type = 'sine';
    osc2.frequency.value = 48.7;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterRef.current);

    osc1.start();
    osc2.start();

    droneRef.current = { osc1, osc2, gain };
  }, [getCtx]);

  const stopDrone = useCallback(() => {
    if (!droneRef.current || !ctxRef.current) return;
    const ctx = ctxRef.current;
    const { osc1, osc2, gain } = droneRef.current;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
    setTimeout(() => {
      try { osc1.stop(); osc2.stop(); } catch { /* already stopped */ }
    }, 2200);
    droneRef.current = null;
  }, []);

  const playBroadcast = useCallback(() => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 1);
    osc.frequency.exponentialRampToValueAtTime(440, now + 2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.connect(gain);
    gain.connect(masterRef.current);
    osc.start(now);
    osc.stop(now + 2.5);
  }, [getCtx]);

  const playWhisper = useCallback(() => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.8);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(masterRef.current);
    osc.start(now);
    osc.stop(now + 1.2);
  }, [getCtx]);

  const playDetection = useCallback(() => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(masterRef.current);
    osc.start(now);
    osc.stop(now + 0.8);
  }, [getCtx]);

  const playExplosion = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Noise burst
    const bufferSize = Math.floor(ctx.sampleRate * 1.5);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 1);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterRef.current);
    noise.start(now);
    noise.stop(now + 1.5);

    // Low thud
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(oscGain);
    oscGain.connect(masterRef.current);
    osc.start(now);
    osc.stop(now + 0.8);
  }, [getCtx]);

  useEffect(() => {
    return () => {
      stopDrone();
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
      }
    };
  }, [stopDrone]);

  return { startDrone, stopDrone, playBroadcast, playWhisper, playDetection, playExplosion };
};
