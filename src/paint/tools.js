/**
 * k0 Paint Tools
 * 
 * Each tool defines:
 *   - name, icon (emoji), cursor style
 *   - renderStroke(ctx, points, color, size, opacity, time, wigglePreset)
 *   - renderPreview(ctx, x, y, size, color) — cursor preview
 */

import { getWiggledPoint, WIGGLE_PRESETS } from './wiggle.js';

// ────────────────────────────────────────────────────────
// Utility helpers
// ────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Seeded RNG for deterministic spray/crayon noise */
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ────────────────────────────────────────────────────────
// Tool definitions
// ────────────────────────────────────────────────────────

const paintbrush = {
  name: 'paintbrush',
  icon: '🖌️',
  label: 'Paintbrush',
  cursor: 'crosshair',
  wiggle: WIGGLE_PRESETS.paintbrush,

  renderStroke(ctx, points, color, size, opacity, time) {
    if (points.length < 2) return;
    const { r, g, b } = hexToRgb(color);

    for (let i = 1; i < points.length; i++) {
      const p0 = getWiggledPoint(points[i - 1], time, this.wiggle);
      const p1 = getWiggledPoint(points[i], time, this.wiggle);

      const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const steps = Math.max(1, Math.floor(dist / 3));

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t;

        const pressure = points[i - 1].pressure + (points[i].pressure - points[i - 1].pressure) * t;
        const r2 = size * pressure * 0.5;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r2);
        gradient.addColorStop(0, `rgba(${r},${g},${b},${opacity * 0.6})`);
        gradient.addColorStop(0.5, `rgba(${r},${g},${b},${opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  renderPreview(ctx, x, y, size, color) {
    const { r, g, b } = hexToRgb(color);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.5);
    gradient.addColorStop(0, `rgba(${r},${g},${b},0.4)`);
    gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  },
};

const pencil = {
  name: 'pencil',
  icon: '✏️',
  label: 'Pencil',
  cursor: 'crosshair',
  wiggle: WIGGLE_PRESETS.pencil,

  renderStroke(ctx, points, color, size, opacity, time) {
    if (points.length < 2) return;
    const { r, g, b } = hexToRgb(color);

    ctx.strokeStyle = `rgba(${r},${g},${b},${opacity * 0.85})`;
    ctx.lineWidth = Math.max(1, size * 0.15);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Main line
    ctx.beginPath();
    const first = getWiggledPoint(points[0], time, this.wiggle);
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < points.length; i++) {
      const p = getWiggledPoint(points[i], time, this.wiggle);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // Grain texture — tiny dots along stroke
    const rng = seededRandom(Math.floor(points[0].phase * 10000));
    for (let i = 0; i < points.length; i += 2) {
      const p = getWiggledPoint(points[i], time, this.wiggle);
      const grainCount = Math.floor(size * 0.3);
      for (let g2 = 0; g2 < grainCount; g2++) {
        const gx = p.x + (rng() - 0.5) * size * 0.4;
        const gy = p.y + (rng() - 0.5) * size * 0.4;
        ctx.fillStyle = `rgba(${r},${g},${b},${rng() * opacity * 0.3})`;
        ctx.fillRect(gx, gy, 1, 1);
      }
    }
  },

  renderPreview(ctx, x, y, size, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size * 0.15);
    ctx.beginPath();
    ctx.arc(x, y, size * 0.1, 0, Math.PI * 2);
    ctx.stroke();
  },
};

const marker = {
  name: 'marker',
  icon: '🖍️',
  label: 'Marker',
  cursor: 'crosshair',
  wiggle: WIGGLE_PRESETS.marker,

  renderStroke(ctx, points, color, size, opacity, time) {
    if (points.length < 2) return;
    const { r, g, b } = hexToRgb(color);

    for (let i = 1; i < points.length; i++) {
      const p0 = getWiggledPoint(points[i - 1], time, this.wiggle);
      const p1 = getWiggledPoint(points[i], time, this.wiggle);

      const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      const w = size * 0.8;
      const h = size * 0.25;

      const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const steps = Math.max(1, Math.floor(dist / 2));

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + 0.4);
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity * 0.35})`;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();
      }
    }
  },

  renderPreview(ctx, x, y, size, color) {
    const { r, g, b } = hexToRgb(color);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(0.4);
    ctx.fillStyle = `rgba(${r},${g},${b},0.35)`;
    ctx.fillRect(-size * 0.4, -size * 0.125, size * 0.8, size * 0.25);
    ctx.restore();
  },
};

const spray = {
  name: 'spray',
  icon: '🎨',
  label: 'Spray Can',
  cursor: 'crosshair',
  wiggle: WIGGLE_PRESETS.spray,

  renderStroke(ctx, points, color, size, opacity, time) {
    const { r, g, b } = hexToRgb(color);
    const radius = size * 0.6;

    for (let i = 0; i < points.length; i++) {
      const p = getWiggledPoint(points[i], time, this.wiggle);
      const rng = seededRandom(Math.floor(points[i].phase * 100000) + i);
      const density = Math.floor(size * 1.5);

      for (let d = 0; d < density; d++) {
        const angle = rng() * Math.PI * 2;
        const dist = rng() * radius;
        const dx = p.x + Math.cos(angle) * dist;
        const dy = p.y + Math.sin(angle) * dist;

        // Particles drift outward over time
        const drift = Math.sin(time * 2 + points[i].phase + d) * 1.5;
        const ddx = dx + Math.cos(angle) * drift;
        const ddy = dy + Math.sin(angle) * drift;

        const alpha = opacity * (1 - dist / radius) * 0.6;
        const dotSize = 1 + rng() * 1.5;
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillRect(ddx, ddy, dotSize, dotSize);
      }
    }
  },

  renderPreview(ctx, x, y, size, color) {
    const { r, g, b } = hexToRgb(color);
    ctx.strokeStyle = `rgba(${r},${g},${b},0.3)`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  },
};

const crayon = {
  name: 'crayon',
  icon: '🖊️',
  label: 'Crayon',
  cursor: 'crosshair',
  wiggle: WIGGLE_PRESETS.crayon,

  renderStroke(ctx, points, color, size, opacity, time) {
    if (points.length < 2) return;
    const { r, g, b } = hexToRgb(color);

    for (let i = 1; i < points.length; i++) {
      const p0 = getWiggledPoint(points[i - 1], time, this.wiggle);
      const p1 = getWiggledPoint(points[i], time, this.wiggle);

      const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const steps = Math.max(1, Math.floor(dist / 1.5));
      const rng = seededRandom(Math.floor(points[i].phase * 100000) + i);

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t;

        // Multiple rough marks for waxy texture
        const marks = 4 + Math.floor(size * 0.2);
        for (let m = 0; m < marks; m++) {
          const mx = x + (rng() - 0.5) * size * 0.6;
          const my = y + (rng() - 0.5) * size * 0.6;
          const alpha = opacity * (0.3 + rng() * 0.4);

          // Gaps for rough texture
          if (rng() > 0.7) continue;

          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fillRect(mx, my, 2 + rng() * 3, 1 + rng() * 2);
        }
      }
    }
  },

  renderPreview(ctx, x, y, size, color) {
    const { r, g, b } = hexToRgb(color);
    ctx.fillStyle = `rgba(${r},${g},${b},0.4)`;
    ctx.fillRect(x - size * 0.3, y - size * 0.3, size * 0.6, size * 0.6);
  },
};

const glitter = {
  name: 'glitter',
  icon: '✨',
  label: 'Glitter Pen',
  cursor: 'crosshair',
  wiggle: WIGGLE_PRESETS.glitter,

  renderStroke(ctx, points, color, size, opacity, time) {
    if (points.length < 2) return;
    const { r, g, b } = hexToRgb(color);

    // Thin base line
    ctx.strokeStyle = `rgba(${r},${g},${b},${opacity * 0.5})`;
    ctx.lineWidth = Math.max(1, size * 0.1);
    ctx.lineCap = 'round';
    ctx.beginPath();
    const first = getWiggledPoint(points[0], time, this.wiggle);
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < points.length; i++) {
      const p = getWiggledPoint(points[i], time, this.wiggle);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // Sparkle particles
    for (let i = 0; i < points.length; i += 1) {
      const p = getWiggledPoint(points[i], time, this.wiggle);
      const rng = seededRandom(Math.floor(points[i].phase * 100000) + i);
      const sparkleCount = 3 + Math.floor(size * 0.15);

      for (let s = 0; s < sparkleCount; s++) {
        const sx = p.x + (rng() - 0.5) * size * 0.8;
        const sy = p.y + (rng() - 0.5) * size * 0.8;

        // Twinkle: vary alpha with time
        const twinkle = Math.sin(time * 8 + points[i].phase * 3 + s * 1.7);
        const alpha = opacity * Math.max(0, twinkle * 0.6 + 0.3);

        // Hue shift for rainbow sparkle
        const hue = (points[i].phase * 180 / Math.PI + time * 50 + s * 30) % 360;
        const sparkColor = hslToHex(hue, 80, 60);
        const sc = hexToRgb(sparkColor);

        const sparkSize = 1.5 + rng() * 2.5;

        // Draw 4-point star
        ctx.fillStyle = `rgba(${sc.r},${sc.g},${sc.b},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(sx, sy - sparkSize);
        ctx.lineTo(sx + sparkSize * 0.3, sy);
        ctx.lineTo(sx, sy + sparkSize);
        ctx.lineTo(sx - sparkSize * 0.3, sy);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx - sparkSize, sy);
        ctx.lineTo(sx, sy + sparkSize * 0.3);
        ctx.lineTo(sx + sparkSize, sy);
        ctx.lineTo(sx, sy - sparkSize * 0.3);
        ctx.closePath();
        ctx.fill();
      }
    }
  },

  renderPreview(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    const s = size * 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * 0.3, y);
    ctx.lineTo(x, y + s);
    ctx.lineTo(x - s * 0.3, y);
    ctx.closePath();
    ctx.fill();
  },
};

const eraser = {
  name: 'eraser',
  icon: '🧹',
  label: 'Eraser',
  cursor: 'crosshair',
  wiggle: WIGGLE_PRESETS.eraser,
  isEraser: true,

  renderStroke(ctx, points, _color, size, _opacity, time) {
    if (points.length < 2) return;

    ctx.globalCompositeOperation = 'destination-out';

    for (let i = 1; i < points.length; i++) {
      const p0 = getWiggledPoint(points[i - 1], time, this.wiggle);
      const p1 = getWiggledPoint(points[i], time, this.wiggle);

      const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const steps = Math.max(1, Math.floor(dist / 3));

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.5);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.7, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
  },

  renderPreview(ctx, x, y, size, _color) {
    ctx.strokeStyle = 'rgba(180,180,180,0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  },
};

const rainbow = {
  name: 'rainbow',
  icon: '🌈',
  label: 'Rainbow',
  cursor: 'crosshair',
  wiggle: WIGGLE_PRESETS.rainbow,

  renderStroke(ctx, points, _color, size, opacity, time) {
    if (points.length < 2) return;

    ctx.lineWidth = size * 0.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < points.length; i++) {
      const p0 = getWiggledPoint(points[i - 1], time, this.wiggle);
      const p1 = getWiggledPoint(points[i], time, this.wiggle);

      // Hue shifts along the stroke + time
      const hue = ((i / points.length) * 360 + time * 60) % 360;
      const color = hslToHex(hue, 85, 55);
      const { r, g, b } = hexToRgb(color);

      ctx.strokeStyle = `rgba(${r},${g},${b},${opacity * 0.7})`;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
  },

  renderPreview(ctx, x, y, size, _color) {
    const hues = [0, 30, 60, 120, 200, 270, 320];
    const r = size * 0.4;
    hues.forEach((h, i) => {
      const angle = (i / hues.length) * Math.PI * 2;
      const px = x + Math.cos(angle) * r * 0.5;
      const py = y + Math.sin(angle) * r * 0.5;
      ctx.fillStyle = hslToHex(h, 85, 55);
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  },
};

const neon = {
  name: 'neon',
  icon: '💡',
  label: 'Neon',
  cursor: 'crosshair',
  wiggle: WIGGLE_PRESETS.neon,

  renderStroke(ctx, points, color, size, opacity, time) {
    if (points.length < 2) return;
    const { r, g, b } = hexToRgb(color);

    // Pulsing glow intensity
    const pulse = 0.7 + Math.sin(time * 3) * 0.3;

    // Outer glow layer
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 0.8 * pulse;
    ctx.strokeStyle = `rgba(${r},${g},${b},${opacity * 0.3 * pulse})`;
    ctx.lineWidth = size * 0.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const first = getWiggledPoint(points[0], time, this.wiggle);
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < points.length; i++) {
      const p = getWiggledPoint(points[i], time, this.wiggle);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();

    // Inner bright core
    ctx.save();
    ctx.shadowColor = `rgba(255,255,255,0.8)`;
    ctx.shadowBlur = 4 * pulse;
    ctx.strokeStyle = `rgba(${Math.min(255, r + 80)},${Math.min(255, g + 80)},${Math.min(255, b + 80)},${opacity * 0.9})`;
    ctx.lineWidth = Math.max(1, size * 0.12);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const first2 = getWiggledPoint(points[0], time, this.wiggle);
    ctx.moveTo(first2.x, first2.y);
    for (let i = 1; i < points.length; i++) {
      const p = getWiggledPoint(points[i], time, this.wiggle);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  },

  renderPreview(ctx, x, y, size, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 0.5;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};

// ────────────────────────────────────────────────────────
// Export all tools in order
// ────────────────────────────────────────────────────────

export const ALL_TOOLS = [
  paintbrush,
  pencil,
  marker,
  spray,
  crayon,
  glitter,
  eraser,
  rainbow,
  neon,
];

export function getToolByName(name) {
  return ALL_TOOLS.find(t => t.name === name) || paintbrush;
}
