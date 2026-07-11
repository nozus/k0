/**
 * k0 Color Picker
 * 
 * Custom color picker with preset palette, recent colors,
 * and native <input type="color"> fallback.
 */

const PRESET_COLORS = [
  // Row 1 — Vibrant
  '#FF6B6B', '#FF8E53', '#FEC89A', '#FFD93D',
  '#6BCB77', '#4D96FF', '#9B5DE5', '#F15BB5',
  // Row 2 — Pastels
  '#FFB5B5', '#FFDAB9', '#FFF3B0', '#B5EAD7',
  '#B5D5FF', '#D5B5FF', '#FFB5E8', '#C4FAF8',
  // Row 3 — Deep / Neon
  '#E63946', '#F77F00', '#2EC4B6', '#118AB2',
  '#073B4C', '#7209B7', '#F72585', '#4CC9F0',
  // Row 4 — Neutrals
  '#FFFFFF', '#E0E0E0', '#A0A0A0', '#606060',
  '#303030', '#1A1A1A', '#000000', '#2D2D44',
];

export class ColorPicker {
  constructor(container, onChange) {
    this.container = container;
    this.onChange = onChange;
    this.currentColor = '#FF6B6B';
    this.recentColors = [];
    this.isOpen = false;

    this._build();
  }

  _build() {
    this.el = document.createElement('div');
    this.el.className = 'color-picker';
    this.el.innerHTML = `
      <button class="color-picker__trigger" id="color-trigger">
        <span class="color-picker__swatch" id="color-swatch"></span>
      </button>
      <div class="color-picker__popup color-picker__popup--hidden" id="color-popup">
        <div class="color-picker__section">
          <div class="color-picker__grid" id="color-grid"></div>
        </div>
        <div class="color-picker__section" id="recent-section" style="display:none">
          <span class="color-picker__label">recent.</span>
          <div class="color-picker__recent" id="recent-grid"></div>
        </div>
        <div class="color-picker__section">
          <label class="color-picker__custom-label">
            custom.
            <input type="color" class="color-picker__native" id="color-native" value="${this.currentColor}" />
          </label>
        </div>
      </div>
    `;

    this.container.appendChild(this.el);

    // Populate grid
    const grid = this.el.querySelector('#color-grid');
    PRESET_COLORS.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'color-picker__cell';
      btn.style.background = color;
      btn.title = color;
      btn.setAttribute('data-color', color);
      btn.addEventListener('click', () => this.selectColor(color));
      grid.appendChild(btn);
    });

    // Swatch
    this.swatch = this.el.querySelector('#color-swatch');
    this._updateSwatch();

    // Toggle popup
    this.el.querySelector('#color-trigger').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Native color input
    this.el.querySelector('#color-native').addEventListener('input', (e) => {
      this.selectColor(e.target.value);
    });

    // Close on outside click
    this._outsideHandler = (e) => {
      if (this.isOpen && !this.el.contains(e.target)) {
        this.close();
      }
    };
    document.addEventListener('pointerdown', this._outsideHandler);
  }

  selectColor(color) {
    this.currentColor = color;
    this._updateSwatch();
    this._addRecent(color);
    this.onChange(color);

    // Update native input
    const native = this.el.querySelector('#color-native');
    if (native) native.value = color;

    // Highlight active cell
    this.el.querySelectorAll('.color-picker__cell').forEach(cell => {
      cell.classList.toggle('active', cell.getAttribute('data-color') === color);
    });
  }

  _updateSwatch() {
    this.swatch.style.background = this.currentColor;
  }

  _addRecent(color) {
    // Don't add if it's a preset
    if (PRESET_COLORS.includes(color)) return;

    this.recentColors = this.recentColors.filter(c => c !== color);
    this.recentColors.unshift(color);
    if (this.recentColors.length > 8) this.recentColors.pop();

    this._renderRecent();
  }

  _renderRecent() {
    const section = this.el.querySelector('#recent-section');
    const grid = this.el.querySelector('#recent-grid');

    if (this.recentColors.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    grid.innerHTML = '';
    this.recentColors.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'color-picker__cell color-picker__cell--recent';
      btn.style.background = color;
      btn.title = color;
      btn.addEventListener('click', () => this.selectColor(color));
      grid.appendChild(btn);
    });
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    this.el.querySelector('#color-popup').classList.remove('color-picker__popup--hidden');
  }

  close() {
    this.isOpen = false;
    this.el.querySelector('#color-popup').classList.add('color-picker__popup--hidden');
  }

  setColor(color) {
    this.currentColor = color;
    this._updateSwatch();
    const native = this.el.querySelector('#color-native');
    if (native) native.value = color;
  }

  destroy() {
    document.removeEventListener('pointerdown', this._outsideHandler);
    this.el.remove();
  }
}
