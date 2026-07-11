/**
 * k0 Wiggle System (Simplified)
 * 
 * Wiggle has been removed for performance. Points are returned as-is.
 * The animation loop still exists for tools that need time-based effects
 * (neon pulsing, glitter twinkle, rainbow hue shift).
 */

export const WIGGLE_PRESETS = {
  paintbrush: {},
  pencil: {},
  marker: {},
  spray: {},
  crayon: {},
  glitter: {},
  eraser: {},
  rainbow: {},
  neon: {},
};

/**
 * Return the point position directly (no wiggle displacement)
 */
export function getWiggledPoint(point, _time, _preset) {
  return { x: point.x, y: point.y };
}

/**
 * Create a stroke point (simplified — no wiggle phase needed)
 */
export function createWigglePoint(x, y, pressure = 0.5) {
  return {
    x,
    y,
    pressure,
    phase: Math.random() * Math.PI * 2,  // Still used for deterministic spray/glitter seeds
    timestamp: performance.now(),
  };
}

/**
 * SimpleAnimator — renders on demand + handles time-based tool effects
 */
export class WiggleAnimator {
  constructor(renderCallback) {
    this.renderCallback = renderCallback;
    this.running = false;
    this.startTime = 0;
    this._frameId = null;
    this._needsRender = true;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = performance.now() / 1000;
    this._tick();
  }

  stop() {
    this.running = false;
    if (this._frameId) {
      cancelAnimationFrame(this._frameId);
      this._frameId = null;
    }
  }

  /** Request a re-render on the next frame */
  requestRender() {
    this._needsRender = true;
  }

  _tick() {
    if (!this.running) return;
    const time = performance.now() / 1000 - this.startTime;
    
    // Only render when needed (drawing, undo, tool change, etc.)
    if (this._needsRender) {
      this.renderCallback(time);
      this._needsRender = false;
    }
    
    this._frameId = requestAnimationFrame(() => this._tick());
  }
}
