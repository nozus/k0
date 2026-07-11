/**
 * k0 Paint Engine
 * 
 * Manages the canvas, stroke history, undo/redo, zoom/pan, and rendering.
 * Persists strokes to Supabase so all users see everyone's drawings.
 * Delegates stroke rendering to individual tool renderers.
 */

import { WiggleAnimator, createWigglePoint } from './wiggle.js';
import { getToolByName } from './tools.js';
import { supabase } from '../supabase.js';
import { getCurrentUser } from '../utils/auth.js';

export class PaintEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Offscreen canvas for strokes so eraser doesn't erase background/grid
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');

    // State — separate own strokes from others
    this.myStrokes = [];        // Current user's strokes (undoable)
    this.otherStrokes = [];     // Other users' strokes (read-only)
    this.currentStroke = null;
    this.undoneStrokes = [];

    // User info (loaded async)
    this.userId = null;
    this._loadUser();

    // Current settings
    this.currentTool = getToolByName('paintbrush');
    this.currentColor = '#FF6B6B';
    this.brushSize = 24;
    this.opacity = 1.0;

    // Settings (configurable)
    this.settings = {
      showGrid: true,
      bgColor: '#1a1a2e',
      cursorPreview: true,
    };

    // Pointer state
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.cursorX = -100;
    this.cursorY = -100;
    this.showCursor = false;

    // Zoom & Pan state
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this.panStartPanX = 0;
    this.panStartPanY = 0;
    this.spaceDown = false;

    // Canvas sizing
    this._resize();
    this._resizeHandler = () => { this._resize(); this.requestRender(); };
    window.addEventListener('resize', this._resizeHandler);

    // Pointer events
    this._setupPointerEvents();

    // Zoom events
    this._setupZoomEvents();

    // Animation loop (on-demand rendering)
    this.animator = new WiggleAnimator((time) => this._render(time));
    this.animator.start();
    this.requestRender();

    // Callbacks
    this.onStrokeEnd = null;
    this.onToolChange = null;

    // Load all existing drawings from Supabase
    this._loadAllStrokes();
  }

  /** Getter for backward compatibility — returns all strokes combined */
  get strokes() {
    return [...this.otherStrokes, ...this.myStrokes];
  }

  /** Request a re-render on the next animation frame */
  requestRender() {
    this.animator.requestRender();
  }

  // ── User ──────────────────────────────────────────────

  async _loadUser() {
    try {
      const user = await getCurrentUser();
      this.userId = user?.id || null;
    } catch (e) {
      console.error('Failed to load user:', e);
    }
  }

  // ── Supabase persistence ──────────────────────────────

  async _loadAllStrokes() {
    try {
      const { data, error } = await supabase
        .from('drawings')
        .select('id, user_id, stroke_data')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to load drawings:', error);
        return;
      }

      if (!data || data.length === 0) return;

      // Wait for user ID if not yet loaded
      if (!this.userId) {
        try {
          const user = await getCurrentUser();
          this.userId = user?.id || null;
        } catch (_) { /* ignore */ }
      }

      // Split into my strokes and other strokes
      for (const row of data) {
        const stroke = row.stroke_data;
        stroke._dbId = row.id;  // Track database ID for deletion
        stroke._userId = row.user_id;

        if (row.user_id === this.userId) {
          this.myStrokes.push(stroke);
        } else {
          this.otherStrokes.push(stroke);
        }
      }

      this.requestRender();
    } catch (e) {
      console.error('Error loading strokes:', e);
    }
  }

  async _saveStroke(stroke) {
    if (!this.userId) return;

    try {
      const { data, error } = await supabase
        .from('drawings')
        .insert({
          user_id: this.userId,
          stroke_data: {
            tool: stroke.tool,
            color: stroke.color,
            size: stroke.size,
            opacity: stroke.opacity,
            points: stroke.points,
          },
        })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to save stroke:', error);
        return;
      }

      // Attach the DB id so we can delete later
      stroke._dbId = data.id;
      stroke._userId = this.userId;
    } catch (e) {
      console.error('Error saving stroke:', e);
    }
  }

  async _deleteStrokeFromDb(stroke) {
    if (!stroke._dbId) return;
    try {
      await supabase.from('drawings').delete().eq('id', stroke._dbId);
    } catch (e) {
      console.error('Error deleting stroke:', e);
    }
  }

  /** Delete all of the current user's drawings from Supabase */
  async deleteMyStrokes() {
    if (!this.userId) return;
    try {
      await supabase.from('drawings').delete().eq('user_id', this.userId);
    } catch (e) {
      console.error('Error deleting all strokes:', e);
    }
    this.myStrokes = [];
    this.undoneStrokes = [];
    this.currentStroke = null;
    this.requestRender();
  }

  // ── Canvas sizing ──────────────────────────────────────

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.offscreenCanvas.width = w * dpr;
    this.offscreenCanvas.height = h * dpr;

    this.ctx.scale(dpr, dpr);
    this.offscreenCtx.scale(dpr, dpr);
    this.width = w;
    this.height = h;
  }

  // ── Coordinate transforms ─────────────────────────────

  /** Convert screen (client) coordinates to canvas (world) coordinates */
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.panX) / this.zoom,
      y: (sy - this.panY) / this.zoom,
    };
  }

  /** Convert world coordinates to screen coordinates */
  worldToScreen(wx, wy) {
    return {
      x: wx * this.zoom + this.panX,
      y: wy * this.zoom + this.panY,
    };
  }

  // ── Zoom & Pan ─────────────────────────────────────────

  _setupZoomEvents() {
    // Scroll wheel zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.max(0.1, Math.min(10, this.zoom * zoomFactor));

      // Zoom toward mouse position
      const worldBefore = this.screenToWorld(mx, my);
      this.zoom = newZoom;
      const screenAfter = this.worldToScreen(worldBefore.x, worldBefore.y);

      this.panX += mx - screenAfter.x;
      this.panY += my - screenAfter.y;

      this.requestRender();
    }, { passive: false });

    // Space bar for pan mode
    this._spaceDownHandler = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        this.spaceDown = true;
        this.canvas.style.cursor = 'grab';
      }
    };
    this._spaceUpHandler = (e) => {
      if (e.code === 'Space') {
        this.spaceDown = false;
        if (!this.isPanning) {
          this.canvas.style.cursor = 'crosshair';
        }
      }
    };
    document.addEventListener('keydown', this._spaceDownHandler);
    document.addEventListener('keyup', this._spaceUpHandler);
  }

  // ── Pointer events ─────────────────────────────────────

  _setupPointerEvents() {
    const canvas = this.canvas;

    canvas.addEventListener('pointerdown', (e) => this._onPointerDown(e));
    canvas.addEventListener('pointermove', (e) => this._onPointerMove(e));
    canvas.addEventListener('pointerup', (e) => this._onPointerUp(e));
    canvas.addEventListener('pointerleave', (e) => this._onPointerLeave(e));
    canvas.addEventListener('pointerenter', () => { this.showCursor = true; });

    // Prevent touch scrolling
    canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    // Prevent right-click context menu
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
    };
  }

  _onPointerDown(e) {
    if (e.target !== this.canvas) return;

    const { x, y, pressure } = this._getPointerPos(e);

    // Middle mouse or Space + left click = pan
    if (e.button === 1 || (this.spaceDown && e.button === 0)) {
      this.isPanning = true;
      this.panStartX = x;
      this.panStartY = y;
      this.panStartPanX = this.panX;
      this.panStartPanY = this.panY;
      this.canvas.style.cursor = 'grabbing';
      this.canvas.setPointerCapture(e.pointerId);
      return;
    }

    // Normal drawing
    this.isDrawing = true;
    const world = this.screenToWorld(x, y);
    this.lastX = world.x;
    this.lastY = world.y;

    const point = createWigglePoint(world.x, world.y, pressure);

    this.currentStroke = {
      tool: this.currentTool.name,
      color: this.currentColor,
      size: this.brushSize,
      opacity: this.opacity,
      points: [point],
    };

    this.undoneStrokes = [];
    this.canvas.setPointerCapture(e.pointerId);
    this.requestRender();
  }

  _onPointerMove(e) {
    const { x, y, pressure } = this._getPointerPos(e);
    this.cursorX = x;
    this.cursorY = y;
    this.showCursor = true;

    // Panning
    if (this.isPanning) {
      this.panX = this.panStartPanX + (x - this.panStartX);
      this.panY = this.panStartPanY + (y - this.panStartY);
      this.requestRender();
      return;
    }

    if (!this.isDrawing || !this.currentStroke) {
      this.requestRender(); // Update cursor preview
      return;
    }

    const world = this.screenToWorld(x, y);

    const dx = world.x - this.lastX;
    const dy = world.y - this.lastY;
    const dist = Math.hypot(dx, dy);

    if (dist < 2 / this.zoom) return;

    const point = createWigglePoint(world.x, world.y, pressure);
    this.currentStroke.points.push(point);

    this.lastX = world.x;
    this.lastY = world.y;
    this.requestRender();
  }

  _onPointerUp(e) {
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = this.spaceDown ? 'grab' : 'crosshair';
      return;
    }

    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.currentStroke && this.currentStroke.points.length > 1) {
      this.myStrokes.push(this.currentStroke);
      // Save to Supabase asynchronously
      this._saveStroke(this.currentStroke);
      if (this.onStrokeEnd) this.onStrokeEnd(this.strokes.length);
    }
    this.currentStroke = null;
    this.requestRender();
  }

  _onPointerLeave(_e) {
    this.showCursor = false;
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = 'crosshair';
    }
    if (this.isDrawing) {
      this._onPointerUp(_e);
    }
    this.requestRender();
  }

  // ── Tool & settings ────────────────────────────────────

  setTool(name) {
    this.currentTool = getToolByName(name);
    if (this.onToolChange) this.onToolChange(this.currentTool);
    this.requestRender();
  }

  setColor(color) {
    this.currentColor = color;
  }

  setBrushSize(size) {
    this.brushSize = Math.max(2, Math.min(120, size));
    this.requestRender();
  }

  setOpacity(opacity) {
    this.opacity = Math.max(0.05, Math.min(1, opacity));
  }

  // ── Undo / Redo ────────────────────────────────────────

  undo() {
    if (this.myStrokes.length === 0) return;
    const stroke = this.myStrokes.pop();
    this.undoneStrokes.push(stroke);
    // Delete from DB
    this._deleteStrokeFromDb(stroke);
    this.requestRender();
  }

  redo() {
    if (this.undoneStrokes.length === 0) return;
    const stroke = this.undoneStrokes.pop();
    this.myStrokes.push(stroke);
    // Re-save to DB
    this._saveStroke(stroke);
    this.requestRender();
  }

  canUndo() { return this.myStrokes.length > 0; }
  canRedo() { return this.undoneStrokes.length > 0; }

  clear() {
    // Only clears current user's strokes — use deleteMyStrokes for persistent delete
    this.deleteMyStrokes();
  }

  resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.requestRender();
  }

  // ── Rendering ──────────────────────────────────────────

  _render(time) {
    const ctx = this.ctx;
    const offCtx = this.offscreenCtx;
    const w = this.width;
    const h = this.height;

    // Clear main canvas
    ctx.clearRect(0, 0, w, h);

    // Draw background (not affected by zoom) to main canvas
    this._drawBackground(ctx, w, h);

    // Clear offscreen canvas
    offCtx.clearRect(0, 0, w, h);

    // Apply zoom/pan transform to offscreen canvas
    offCtx.save();
    offCtx.translate(this.panX, this.panY);
    offCtx.scale(this.zoom, this.zoom);

    // Draw all strokes — others first, then mine on top
    const allStrokes = this.strokes;
    for (const stroke of allStrokes) {
      const tool = getToolByName(stroke.tool);
      tool.renderStroke(offCtx, stroke.points, stroke.color, stroke.size, stroke.opacity, time);
    }

    // Draw current stroke in progress to offscreen canvas
    if (this.currentStroke && this.currentStroke.points.length > 1) {
      const tool = getToolByName(this.currentStroke.tool);
      tool.renderStroke(
        offCtx,
        this.currentStroke.points,
        this.currentStroke.color,
        this.currentStroke.size,
        this.currentStroke.opacity,
        time
      );
    }

    offCtx.restore();

    // Composite offscreen strokes onto main canvas
    ctx.drawImage(this.offscreenCanvas, 0, 0, w, h);

    // Draw cursor preview (in screen space, not world space) on main canvas
    if (this.showCursor && !this.isDrawing && this.settings.cursorPreview) {
      this.currentTool.renderPreview(
        ctx,
        this.cursorX,
        this.cursorY,
        this.brushSize * this.zoom,
        this.currentColor
      );
    }

    // Draw zoom indicator when zoomed
    if (Math.abs(this.zoom - 1) > 0.01) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${Math.round(this.zoom * 100)}%`, 16, h - 16);
    }
  }

  _drawBackground(ctx, w, h) {
    ctx.fillStyle = this.settings.bgColor;
    ctx.fillRect(0, 0, w, h);

    if (!this.settings.showGrid) return;

    // Dot grid adjusted for zoom
    const baseSpacing = 30;
    const spacing = baseSpacing * this.zoom;

    if (spacing < 8) return; // Don't draw grid when zoomed way out

    const offsetX = this.panX % spacing;
    const offsetY = this.panY % spacing;

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let x = offsetX; x < w; x += spacing) {
      for (let y = offsetY; y < h; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, Math.min(1.5, 0.8 * this.zoom), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ── Color picker from canvas ───────────────────────────

  pickColor(x, y) {
    const dpr = window.devicePixelRatio || 1;
    // We pick color from the offscreen canvas (strokes only) to avoid picking the grid
    const pixel = this.offscreenCtx.getImageData(x * dpr, y * dpr, 1, 1).data;
    if (pixel[3] === 0) {
      return this.settings.bgColor; // return background if transparent
    }
    const hex = '#' +
      pixel[0].toString(16).padStart(2, '0') +
      pixel[1].toString(16).padStart(2, '0') +
      pixel[2].toString(16).padStart(2, '0');
    return hex;
  }

  // ── Cleanup ────────────────────────────────────────────

  destroy() {
    this.animator.stop();
    window.removeEventListener('resize', this._resizeHandler);
    document.removeEventListener('keydown', this._spaceDownHandler);
    document.removeEventListener('keyup', this._spaceUpHandler);
  }
}
