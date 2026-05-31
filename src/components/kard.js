/**
 * kard.js — Credit-card style profile card for k0
 * Supports normal / large / mini sizes, holographic shimmer, and 3D tilt.
 */

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Escapes HTML special characters.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

/**
 * Returns uppercase initials (max 2 chars) from a name.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/**
 * Deterministic gradient from a string seed.
 * @param {string} seed
 * @returns {string}
 */
function avatarGradient(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 45) % 360;
  return `linear-gradient(135deg, hsl(${hue1},70%,55%), hsl(${hue2},80%,50%))`;
}

/**
 * Formats a date as MM/YY.
 * @param {string} isoString
 * @returns {string}
 */
function formatJoinDate(isoString) {
  const d = new Date(isoString);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

/**
 * Spaces out a username into a monospace "card number" style.
 * e.g. "username" → "u s e r n a m e"
 * @param {string} username
 * @returns {string}
 */
function spaceOutUsername(username) {
  return username.split('').join(' ');
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

/**
 * Creates an HTML string for a profile kard.
 *
 * @param {Object} profile - Profile record from Supabase
 * @param {'normal'|'large'|'mini'} [size='normal'] - Card size variant
 * @returns {string} HTML string
 */
export function createKard(profile, size = 'normal') {
  const {
    id,
    username = 'unknown',
    display_name: displayName,
    avatar_url: avatarUrl,
    bio,
    karma_score: karmaScore,
    created_at: createdAt,
  } = profile;

  const sizeClass = size === 'large'
    ? ' kard-large'
    : size === 'mini'
      ? ' kard-mini'
      : '';

  // Chip: avatar image or initials
  const chipContent = avatarUrl
    ? `<img class="kard-chip-img" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(username)}" />`
    : `<div class="kard-chip-initials" style="background:${avatarGradient(username)}">${getInitials(displayName || username)}</div>`;

  const karma = karmaScore ?? 0;
  const joinDate = createdAt ? formatJoinDate(createdAt) : '--/--';

  return `
    <div class="kard${sizeClass}" data-user-id="${escapeHtml(id)}">
      <div class="kard-shimmer"></div>

      <div class="kard-top">
        <div class="kard-chip">${chipContent}</div>
        <div class="kard-logo">k0</div>
      </div>

      <div class="kard-number">
        <span class="kard-at">@</span>${spaceOutUsername(escapeHtml(username))}
      </div>

      <div class="kard-bottom">
        <div class="kard-name">${escapeHtml(displayName || username)}</div>
        <div class="kard-stats">
          <span class="kard-karma" title="Karma score">✦ ${karma}</span>
          <span class="kard-join" title="Member since">SINCE ${joinDate}</span>
        </div>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------------ */
/*  3D Tilt Effect                                                    */
/* ------------------------------------------------------------------ */

/**
 * Adds a 3D mouse-tilt effect to all `.kard` elements inside a container.
 * Call once after kard HTML has been inserted into the DOM.
 *
 * @param {HTMLElement} container - Parent element containing `.kard` elements
 */
export function initKardTilt(container) {
  if (!container) return;

  const cards = container.querySelectorAll('.kard');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // -1 to 1 range relative to center
      const percentX = (e.clientX - centerX) / (rect.width / 2);
      const percentY = (e.clientY - centerY) / (rect.height / 2);

      // Max ±10 degrees
      const maxAngle = 10;
      const rotateY = percentX * maxAngle;
      const rotateX = -percentY * maxAngle; // invert Y for natural feel

      card.style.transition = 'transform 0.05s ease';
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s ease';
      card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
    });
  });
}
