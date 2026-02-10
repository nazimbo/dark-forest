import { HUNTER_RATIO, STAR_DENSITY } from './constants';

const NEBULA_COLORS = [
  '59, 130, 246',
  '139, 92, 246',
  '20, 184, 166',
  '168, 85, 247',
];

export function generateStars(width, height) {
  const count = Math.floor((width * height) / STAR_DENSITY);
  const stars = [];
  let livingCivs = 0;

  for (let i = 0; i < count; i++) {
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

  return { stars, livingCivs };
}

export function generateNebulae(width, height) {
  return NEBULA_COLORS.map(color => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 150 + Math.random() * 300,
    color,
    alpha: 0.03 + Math.random() * 0.04,
  }));
}

export function createUserStar(width, height) {
  return {
    x: width / 2,
    y: height / 2,
    size: 4,
    color: '#60A5FA',
    alive: true,
  };
}

export function createWave(x, y, options = {}) {
  return {
    x,
    y,
    radius: 10,
    alpha: options.alpha ?? 1,
    maxRadius: options.maxRadius ?? null,
    isWhisper: options.isWhisper ?? false,
    isNpc: options.isNpc ?? false,
    color: options.color ?? '96, 165, 250',
  };
}

export function createAttack(origin, target, isNpcTarget) {
  return {
    startX: origin.x,
    startY: origin.y,
    targetX: target.x,
    targetY: target.y,
    progress: 0,
    trail: [],
    isNpcTarget,
  };
}

export function createExplosionParticles(x, y, count, colorOrFn) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 8;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.5,
      color: typeof colorOrFn === 'function' ? colorOrFn() : colorOrFn,
    });
  }
  return particles;
}

export function createFlash(x, y) {
  return { x, y, life: 1.0 };
}

export function createSim(width, height) {
  const { stars, livingCivs } = generateStars(width, height);
  const nebulae = generateNebulae(width, height);
  const userStar = createUserStar(width, height);

  return {
    sim: {
      stars,
      userStar,
      waves: [],
      attacks: [],
      particles: [],
      flashes: [],
      nebulae,
      npcBroadcaster: null,
      shake: { intensity: 0 },
      scheduledEvents: [],
      animationId: null,
    },
    livingCivs: livingCivs + 1,
  };
}
