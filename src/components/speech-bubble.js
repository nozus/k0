/**
 * speech-bubble.js — Post speech-bubble component for k0
 * Returns a fully interactive DOM element with voting, swiping, and moderation.
 */

import { voteModeration } from '../utils/moderation.js';
import { EMPTY_AVATAR } from '../utils/constants.js';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Converts an ISO timestamp to a human-readable relative time string.
 * @param {string} isoString
 * @returns {string}
 */
function timeAgo(isoString) {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60)   return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d`;
  if (diffSec < 31536000) return `${Math.floor(diffSec / 2592000)}mo`;
  return `${Math.floor(diffSec / 31536000)}y`;
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
 * Generates a deterministic gradient background from a string seed.
 * @param {string} seed
 * @returns {string} CSS linear-gradient value
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

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

/**
 * Creates a speech-bubble DOM element for a post.
 *
 * @param {Object} post - Post record from Supabase (with joined profiles)
 * @param {string|null} currentUserId - The currently logged-in user's ID
 * @returns {HTMLElement}
 */
export function createSpeechBubble(post, currentUserId = null) {
  const {
    id: postId,
    user_id: authorId,
    content,
    created_at: createdAt,
    profiles: { username, display_name: displayName, avatar_url: avatarUrl },
  } = post;

  // ---- Wrapper ---------------------------------------------------
  const wrapper = document.createElement('div');
  wrapper.classList.add('speech-bubble-wrapper');
  wrapper.dataset.postId = postId;

  // ---- Avatar ----------------------------------------------------
  const avatarEl = document.createElement('div');
  avatarEl.classList.add('speech-bubble-avatar');

  const img = document.createElement('img');
  img.src = avatarUrl || EMPTY_AVATAR;
  img.alt = username;
  img.classList.add('speech-bubble-avatar-img');
  avatarEl.appendChild(img);

  // ---- Bubble ----------------------------------------------------
  const bubble = document.createElement('div');
  bubble.classList.add('speech-bubble');

  // Swipe overlay indicators
  const swipeOverlay = document.createElement('div');
  swipeOverlay.classList.add('speech-bubble-swipe-overlay');
  bubble.appendChild(swipeOverlay);

  // Header
  const header = document.createElement('div');
  header.classList.add('bubble-header');
  header.innerHTML = `
    <a href="#/profile/${escapeHtml(username)}" class="bubble-username">@${escapeHtml(username)}</a>
    <span class="bubble-time">${timeAgo(createdAt)}</span>
  `;

  // Content
  const contentEl = document.createElement('div');
  contentEl.classList.add('bubble-content');
  contentEl.textContent = content; // textContent auto-escapes

  // Actions
  const actions = document.createElement('div');
  actions.classList.add('bubble-actions', 'bubble-actions--moderation');

  actions.innerHTML = `
    <button class="bubble-mod-btn" data-action="strike" aria-label="Strike Author">
      ⚠️ Strike
    </button>
    <button class="bubble-mod-btn" data-action="archive" aria-label="Archive Post">
      📦 Archive
    </button>
    <button class="bubble-mod-btn" data-action="delete" aria-label="Delete Post">
      🗑️ Delete
    </button>
  `;

  bubble.append(header, contentEl, actions);
  wrapper.append(avatarEl, bubble);

  // ---- Moderation handlers ----------------------------------------
  actions.addEventListener('click', async (e) => {
    const btn = e.target.closest('.bubble-mod-btn');
    if (!btn || btn.disabled) return;
    
    e.stopPropagation();
    const action = btn.dataset.action;
    const targetType = action === 'strike' ? 'user' : 'post';
    const targetId = action === 'strike' ? authorId : postId;

    try {
      btn.disabled = true;
      const originalText = btn.innerHTML;
      btn.textContent = '...';
      
      await voteModeration(targetType, targetId, action);
      
      btn.textContent = '✓ Voted';
    } catch (err) {
      console.error('[speech-bubble] Moderation vote failed:', err);
      btn.disabled = false;
      alert(err.message || 'Vote failed');
    }
  });

  // ---- Swipe gestures ---------------------------------------------
  let touchStartX = 0;
  let touchCurrentX = 0;
  let isSwiping = false;

  bubble.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchCurrentX = touchStartX;
    isSwiping = true;
    bubble.style.transition = 'none';
  }, { passive: true });

  bubble.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    touchCurrentX = e.touches[0].clientX;
    const deltaX = touchCurrentX - touchStartX;

    // Dampen the swipe distance
    const dampened = deltaX * 0.5;
    bubble.style.transform = `translateX(${dampened}px)`;

    // Show coloured overlay
    if (deltaX > 80) {
      swipeOverlay.className = 'speech-bubble-swipe-overlay swipe-right';
    } else if (deltaX < -80) {
      swipeOverlay.className = 'speech-bubble-swipe-overlay swipe-left';
    } else {
      swipeOverlay.className = 'speech-bubble-swipe-overlay';
    }
  }, { passive: true });

  bubble.addEventListener('touchend', () => {
    if (!isSwiping) return;
    isSwiping = false;

    const deltaX = touchCurrentX - touchStartX;
    bubble.style.transition = 'transform 0.3s ease';
    bubble.style.transform = 'translateX(0)';
    swipeOverlay.className = 'speech-bubble-swipe-overlay';

    if (deltaX > 80) {
      actions.querySelector('[data-action="archive"]')?.click();
    } else if (deltaX < -80) {
      actions.querySelector('[data-action="strike"]')?.click();
    }
  });

  return wrapper;
}
