/**
 * star-rating.js — Minimal circle-based rating widget for k0
 * Uses ● (filled) and ○ (empty) for nozus-style aesthetic.
 */

/**
 * Creates a display-only star rating element.
 * @param {number} rating - Rating value (1-5)
 * @param {object} [options]
 * @param {string} [options.size='normal'] - 'small', 'normal', or 'large'
 * @returns {HTMLElement}
 */
export function createStarDisplay(rating, { size = 'normal' } = {}) {
  const container = document.createElement('div');
  container.classList.add('star-display', `star-display--${size}`);

  for (let i = 1; i <= 5; i++) {
    const dot = document.createElement('span');
    dot.classList.add('star-dot');
    if (i <= Math.round(rating)) {
      dot.classList.add('star-dot--filled');
      dot.textContent = '●';
    } else {
      dot.textContent = '○';
    }
    container.appendChild(dot);
  }

  return container;
}

/**
 * Creates an interactive star rating input.
 * @param {number} [initialValue=0] - Initial selected rating
 * @param {function} [onChange] - Callback when rating changes: (newRating) => void
 * @returns {HTMLElement}
 */
export function createStarInput(initialValue = 0, onChange = null) {
  const container = document.createElement('div');
  container.classList.add('star-input');

  let currentValue = initialValue;
  let hoverValue = 0;

  const dots = [];

  for (let i = 1; i <= 5; i++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.classList.add('star-input-dot');
    dot.dataset.value = i;
    dot.setAttribute('aria-label', `${i} out of 5`);

    dot.addEventListener('mouseenter', () => {
      hoverValue = i;
      updateDisplay();
    });

    dot.addEventListener('mouseleave', () => {
      hoverValue = 0;
      updateDisplay();
    });

    dot.addEventListener('click', () => {
      currentValue = i;
      hoverValue = 0;
      updateDisplay();

      // Trigger pop animation
      dot.classList.remove('star-pop-anim');
      void dot.offsetWidth; // trigger reflow
      dot.classList.add('star-pop-anim');
      
      dot.addEventListener('animationend', () => {
        dot.classList.remove('star-pop-anim');
      }, { once: true });

      if (onChange) onChange(currentValue);
    });

    dots.push(dot);
    container.appendChild(dot);
  }

  function updateDisplay() {
    const activeValue = hoverValue || currentValue;
    dots.forEach((dot, index) => {
      const val = index + 1;
      if (val <= activeValue) {
        dot.textContent = '●';
        dot.classList.add('star-input-dot--active');
      } else {
        dot.textContent = '○';
        dot.classList.remove('star-input-dot--active');
      }

      // Hover state styling
      if (hoverValue > 0 && val <= hoverValue) {
        dot.classList.add('star-input-dot--hover');
      } else {
        dot.classList.remove('star-input-dot--hover');
      }
    });
  }

  updateDisplay();

  // Expose getter/setter
  container.getValue = () => currentValue;
  container.setValue = (val) => {
    currentValue = val;
    updateDisplay();
  };

  return container;
}

/**
 * Creates a large rating summary display (e.g. "4.2" with stars).
 * @param {number} avgRating
 * @param {number} reviewCount
 * @returns {HTMLElement}
 */
export function createRatingSummary(avgRating, reviewCount) {
  const container = document.createElement('div');
  container.classList.add('rating-summary');

  const scoreEl = document.createElement('span');
  scoreEl.classList.add('rating-summary-score');
  scoreEl.textContent = avgRating > 0 ? avgRating.toFixed(1) : '—';

  const starsEl = createStarDisplay(avgRating, { size: 'large' });

  const countEl = document.createElement('span');
  countEl.classList.add('rating-summary-count');
  countEl.textContent = `${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`;

  container.append(scoreEl, starsEl, countEl);
  return container;
}
