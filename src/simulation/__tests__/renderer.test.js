import { describe, it, expect, vi } from 'vitest';
import { STATES } from '../constants';
import {
  drawStars, drawNpcBroadcaster, drawUserStar, drawWaves, render,
} from '../renderer';

// --- mock canvas context ---

function createMockCanvasCtx() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    translate: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    shadowBlur: 0,
    shadowColor: '',
    font: '',
    textAlign: '',
    fillText: vi.fn(),
  };
}

// --- drawStars ---

describe('drawStars', () => {
  it('mutates alpha and reverses direction at bounds', () => {
    const ctx = createMockCanvasCtx();
    const star = { x: 10, y: 10, size: 1, alpha: 0.09, alphaChange: -0.01, isHunter: false, alive: true };
    drawStars(ctx, [star], STATES.START);
    // alpha went to 0.08 which is <= 0.1, so alphaChange should have flipped
    expect(star.alphaChange).toBe(0.01);
  });

  it('reverses at upper bound', () => {
    const ctx = createMockCanvasCtx();
    const star = { x: 10, y: 10, size: 1, alpha: 0.995, alphaChange: 0.01, isHunter: false, alive: true };
    drawStars(ctx, [star], STATES.START);
    // alpha becomes 1.005 >= 1.0 → flip
    expect(star.alphaChange).toBe(-0.01);
  });

  it('uses red for hunter in DESTROYED state', () => {
    const ctx = createMockCanvasCtx();
    const star = { x: 10, y: 10, size: 1, alpha: 0.5, alphaChange: 0.01, isHunter: true, alive: true };
    drawStars(ctx, [star], STATES.DESTROYED);
    expect(ctx.fillStyle).toContain('239, 68, 68');
  });

  it('uses dim orange for dead star', () => {
    const ctx = createMockCanvasCtx();
    const star = { x: 10, y: 10, size: 1, alpha: 0.5, alphaChange: 0.01, isHunter: false, alive: false };
    drawStars(ctx, [star], STATES.START);
    expect(ctx.fillStyle).toContain('255, 100, 50');
  });

  it('uses white for alive non-hunter star', () => {
    const ctx = createMockCanvasCtx();
    const star = { x: 10, y: 10, size: 1, alpha: 0.5, alphaChange: 0.01, isHunter: false, alive: true };
    drawStars(ctx, [star], STATES.START);
    expect(ctx.fillStyle).toContain('255, 255, 255');
  });
});

// --- drawNpcBroadcaster ---

describe('drawNpcBroadcaster', () => {
  it('returns early when npc is null', () => {
    const ctx = createMockCanvasCtx();
    drawNpcBroadcaster(ctx, null, 1);
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });

  it('returns early when npc is not alive', () => {
    const ctx = createMockCanvasCtx();
    drawNpcBroadcaster(ctx, { alive: false, x: 0, y: 0, size: 1 }, 1);
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });

  it('draws when npc is alive', () => {
    const ctx = createMockCanvasCtx();
    drawNpcBroadcaster(ctx, { alive: true, x: 50, y: 60, size: 2 }, 1);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledWith('SIGNAL', 50, expect.any(Number));
  });
});

// --- drawUserStar ---

describe('drawUserStar', () => {
  it('returns early when userStar is not alive', () => {
    const ctx = createMockCanvasCtx();
    drawUserStar(ctx, { alive: false, x: 0, y: 0, size: 4, color: '#60A5FA' }, STATES.START, 1);
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });

  it('draws "YOU" label when not DESTROYED', () => {
    const ctx = createMockCanvasCtx();
    drawUserStar(ctx, { alive: true, x: 400, y: 300, size: 4, color: '#60A5FA' }, STATES.START, 1);
    expect(ctx.fillText).toHaveBeenCalledWith('YOU', 400, expect.any(Number));
  });
});

// --- drawWaves ---

describe('drawWaves', () => {
  it('skips wave with alpha <= 0', () => {
    const ctx = createMockCanvasCtx();
    drawWaves(ctx, [{ x: 0, y: 0, radius: 10, alpha: 0, color: '96,165,250', isWhisper: false }], 1);
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('uses correct lineWidth for whisper vs broadcast', () => {
    const ctx = createMockCanvasCtx();
    const scale = 1;
    drawWaves(ctx, [{ x: 0, y: 0, radius: 10, alpha: 0.5, color: '96,165,250', isWhisper: true }], scale);
    expect(ctx.lineWidth).toBe(1.5);

    drawWaves(ctx, [{ x: 0, y: 0, radius: 10, alpha: 0.5, color: '96,165,250', isWhisper: false }], scale);
    expect(ctx.lineWidth).toBe(2.5);
  });
});

// --- render ---

describe('render', () => {
  it('calls save and restore', () => {
    const ctx = createMockCanvasCtx();
    const sim = {
      shake: { intensity: 0 },
      nebulae: [],
      stars: [],
      npcBroadcaster: null,
      userStar: { alive: false },
      waves: [],
      attacks: [],
      flashes: [],
      particles: [],
    };
    render(ctx, sim, STATES.START, 800, 600);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('translates when shake intensity > 0', () => {
    const ctx = createMockCanvasCtx();
    const sim = {
      shake: { intensity: 5 },
      nebulae: [],
      stars: [],
      npcBroadcaster: null,
      userStar: { alive: false },
      waves: [],
      attacks: [],
      flashes: [],
      particles: [],
    };
    render(ctx, sim, STATES.START, 800, 600);
    expect(ctx.translate).toHaveBeenCalled();
  });

  it('does not translate when shake intensity is 0', () => {
    const ctx = createMockCanvasCtx();
    const sim = {
      shake: { intensity: 0 },
      nebulae: [],
      stars: [],
      npcBroadcaster: null,
      userStar: { alive: false },
      waves: [],
      attacks: [],
      flashes: [],
      particles: [],
    };
    render(ctx, sim, STATES.START, 800, 600);
    expect(ctx.translate).not.toHaveBeenCalled();
  });
});
