/**
 * k0 Toolbar
 * 
 * Floating glassmorphism toolbar with tool selector,
 * brush size/opacity sliders, color picker, and undo/redo.
 */

import { ALL_TOOLS } from './tools.js';
import { ColorPicker } from './color-picker.js';
import { openConfirmDeleteModal } from './modals.js';

export class Toolbar {
  constructor(container, paintEngine) {
    this.container = container;
    this.engine = paintEngine;
    this.activeTool = paintEngine.currentTool.name;

    this._build();
    this._setupKeyboard();
  }

  _build() {
    this.el = document.createElement('div');
    this.el.className = 'toolbar';
    this.el.id = 'paint-toolbar';

    // Prevent canvas pointer events from firing when interacting with toolbar
    this.el.addEventListener('pointerdown', (e) => e.stopPropagation());

    this.el.innerHTML = `
      <div class="toolbar__brand" style="position: relative;">
        <button class="toolbar__logo-btn" id="logo-trigger">
          <span class="toolbar__logo">k0.</span>
        </button>
        <div class="toolbar__menu toolbar__menu--hidden" id="logo-menu">
          <button class="toolbar__menu-item" id="menu-profile">profile.</button>
          <button class="toolbar__menu-item" id="menu-settings">settings.</button>
          <div class="toolbar__menu-divider"></div>
          <button class="toolbar__menu-item toolbar__menu-item--danger" id="menu-signout">sign out.</button>
        </div>
      </div>
      <div class="toolbar__divider"></div>
      <div class="toolbar__tools" id="toolbar-tools"></div>
      <div class="toolbar__divider"></div>
      <div class="toolbar__colors" id="toolbar-colors"></div>
      <div class="toolbar__divider"></div>
      <div class="toolbar__sliders">
        <div class="toolbar__slider-group">
          <label class="toolbar__slider-label" for="brush-size">size.</label>
          <input type="range" class="toolbar__slider" id="brush-size" 
            min="2" max="120" value="${this.engine.brushSize}" />
          <span class="toolbar__slider-value" id="brush-size-val">${this.engine.brushSize}</span>
        </div>
        <div class="toolbar__slider-group">
          <label class="toolbar__slider-label" for="brush-opacity">opacity.</label>
          <input type="range" class="toolbar__slider" id="brush-opacity" 
            min="5" max="100" value="${Math.round(this.engine.opacity * 100)}" />
          <span class="toolbar__slider-value" id="brush-opacity-val">${Math.round(this.engine.opacity * 100)}%</span>
        </div>
      </div>
      <div class="toolbar__divider"></div>
      <div class="toolbar__actions">
        <button class="toolbar__btn toolbar__btn--action" id="btn-undo" title="undo (ctrl+z)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
        </button>
        <button class="toolbar__btn toolbar__btn--action" id="btn-redo" title="redo (ctrl+shift+z)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"></path></svg>
        </button>
        <button class="toolbar__btn toolbar__btn--action toolbar__btn--danger" id="btn-clear" title="delete your drawings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;

    this.container.appendChild(this.el);

    // ── Build tool buttons ──
    const toolsContainer = this.el.querySelector('#toolbar-tools');
    ALL_TOOLS.forEach((tool, index) => {
      const btn = document.createElement('button');
      btn.className = 'toolbar__btn toolbar__btn--tool';
      btn.id = `tool-${tool.name}`;
      btn.title = `${tool.label} (${index + 1})`;
      btn.innerHTML = `<span class="toolbar__tool-icon">${tool.icon}</span>`;

      if (tool.name === this.activeTool) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => this.selectTool(tool.name));
      toolsContainer.appendChild(btn);
    });

    // ── Color picker ──
    const colorsContainer = this.el.querySelector('#toolbar-colors');
    this.colorPicker = new ColorPicker(colorsContainer, (color) => {
      this.engine.setColor(color);
    });

    // ── Sliders ──
    const sizeSlider = this.el.querySelector('#brush-size');
    const sizeVal = this.el.querySelector('#brush-size-val');
    sizeSlider.addEventListener('input', (e) => {
      const v = parseInt(e.target.value);
      this.engine.setBrushSize(v);
      sizeVal.textContent = v;
    });

    const opacitySlider = this.el.querySelector('#brush-opacity');
    const opacityVal = this.el.querySelector('#brush-opacity-val');
    opacitySlider.addEventListener('input', (e) => {
      const v = parseInt(e.target.value);
      this.engine.setOpacity(v / 100);
      opacityVal.textContent = `${v}%`;
    });

    // ── Action buttons ──
    this.el.querySelector('#btn-undo').addEventListener('click', () => this.engine.undo());
    this.el.querySelector('#btn-redo').addEventListener('click', () => this.engine.redo());
    this.el.querySelector('#btn-clear').addEventListener('click', () => {
      if (this.engine.myStrokes.length === 0) return;
      // Show confirmation modal before deleting
      openConfirmDeleteModal(() => {
        this.engine.clear();
      });
    });
    
    // ── Logo Menu ──
    const logoMenu = this.el.querySelector('#logo-menu');
    this.el.querySelector('#logo-trigger').addEventListener('click', (e) => {
      e.stopPropagation();
      logoMenu.classList.toggle('toolbar__menu--hidden');
    });

    this._menuOutsideHandler = (e) => {
      if (!logoMenu.classList.contains('toolbar__menu--hidden') && !this.el.querySelector('.toolbar__brand').contains(e.target)) {
        logoMenu.classList.add('toolbar__menu--hidden');
      }
    };
    document.addEventListener('pointerdown', this._menuOutsideHandler);

    this.el.querySelector('#menu-profile').addEventListener('click', () => {
      logoMenu.classList.add('toolbar__menu--hidden');
      if (this.onProfile) this.onProfile();
    });
    
    this.el.querySelector('#menu-settings').addEventListener('click', () => {
      logoMenu.classList.add('toolbar__menu--hidden');
      if (this.onSettings) this.onSettings();
    });

    // Sign out (will be wired up externally)
    this.signOutBtn = this.el.querySelector('#menu-signout');

    // ── Start wiggle animations on tool icons ──
    this._startToolWiggle();
  }

  selectTool(name) {
    this.activeTool = name;
    this.engine.setTool(name);

    // Update active state
    this.el.querySelectorAll('.toolbar__btn--tool').forEach(btn => {
      btn.classList.toggle('active', btn.id === `tool-${name}`);
    });
  }

  _startToolWiggle() {
    // Give each tool icon a slightly different wiggle animation
    const icons = this.el.querySelectorAll('.toolbar__tool-icon');
    icons.forEach((icon, i) => {
      icon.style.animationDelay = `${i * 0.12}s`;
    });
  }

  _setupKeyboard() {
    this._keyHandler = (e) => {
      // Number keys 1-9 for tool selection
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey) {
        const idx = parseInt(e.key) - 1;
        if (idx < ALL_TOOLS.length) {
          this.selectTool(ALL_TOOLS[idx].name);
        }
      }

      // Ctrl+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.engine.undo();
      }

      // Ctrl+Shift+Z or Ctrl+Y for redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || e.key === 'y')) {
        e.preventDefault();
        this.engine.redo();
      }

      // [ and ] for brush size
      if (e.key === '[') {
        const newSize = Math.max(2, this.engine.brushSize - 4);
        this.engine.setBrushSize(newSize);
        this.el.querySelector('#brush-size').value = newSize;
        this.el.querySelector('#brush-size-val').textContent = newSize;
      }
      if (e.key === ']') {
        const newSize = Math.min(120, this.engine.brushSize + 4);
        this.engine.setBrushSize(newSize);
        this.el.querySelector('#brush-size').value = newSize;
        this.el.querySelector('#brush-size-val').textContent = newSize;
      }
    };

    document.addEventListener('keydown', this._keyHandler);
  }

  onSignOut(callback) {
    this.signOutBtn.addEventListener('click', () => {
      const logoMenu = this.el.querySelector('#logo-menu');
      logoMenu.classList.add('toolbar__menu--hidden');
      callback();
    });
  }

  onProfileClick(callback) {
    this.onProfile = callback;
  }

  onSettingsClick(callback) {
    this.onSettings = callback;
  }

  destroy() {
    document.removeEventListener('keydown', this._keyHandler);
    document.removeEventListener('pointerdown', this._menuOutsideHandler);
    this.colorPicker.destroy();
    this.el.remove();
  }
}
