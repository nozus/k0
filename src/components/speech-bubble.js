/**
 * speech-bubble.js — Post speech-bubble component for k0
 * Returns a fully interactive DOM element with voting, swiping, and moderation.
 */

import { ratePost } from '../utils/posts.js';
import { voteModeration } from '../utils/moderation.js';

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
    rating_sum: ratingSum,
    rating_count: ratingCount,
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

  if (avatarUrl) {
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = username;
    img.classList.add('speech-bubble-avatar-img');
    avatarEl.appendChild(img);
  } else {
    const initialsDiv = document.createElement('div');
    initialsDiv.classList.add('speech-bubble-avatar-initials');
    initialsDiv.textContent = getInitials(displayName || username);
    initialsDiv.style.background = avatarGradient(username);
    avatarEl.appendChild(initialsDiv);
  }

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
  actions.classList.add('bubble-actions');

  const ratingDisplay = ratingSum ?? 0;

  actions.innerHTML = `
    <button class="bubble-action-btn bubble-vote-up" data-vote="1" aria-label="Upvote">
      <span class="bubble-vote-arrow">▲</span>
    </button>
    <span class="bubble-rating-count">${ratingDisplay}</span>
    <button class="bubble-action-btn bubble-vote-down" data-vote="-1" aria-label="Downvote">
      <span class="bubble-vote-arrow">▼</span>
    </button>
    <div class="bubble-mod-wrapper">
      <button class="bubble-action-btn bubble-mod-btn" aria-label="Moderation options">
        <span>…</span>
      </button>
      <div class="bubble-mod-dropdown bubble-mod-dropdown--hidden">
        <button class="bubble-mod-option" data-action="delete_post">Vote to Delete Post</button>
        <button class="bubble-mod-option" data-action="block_user">Vote to Block User</button>
      </div>
    </div>
  `;

  bubble.append(header, contentEl, actions);
  wrapper.append(avatarEl, bubble);

  // ---- Voting handlers -------------------------------------------
  const ratingCountEl = actions.querySelector('.bubble-rating-count');
  const upBtn = actions.querySelector('.bubble-vote-up');
  const downBtn = actions.querySelector('.bubble-vote-down');

  let activeVote = 0; // tracks current vote: 1, -1, or 0

  async function handleVote(value) {
    // Toggle off if same vote
    const newValue = activeVote === value ? 0 : value;

    try {
      if (newValue !== 0) {
        await ratePost(postId, newValue);
      }

      activeVote = newValue;

      // Update UI
      upBtn.classList.toggle('bubble-vote--active', activeVote === 1);
      downBtn.classList.toggle('bubble-vote--active', activeVote === -1);

      // Optimistic count update
      const delta = newValue - activeVote;
      const current = parseInt(ratingCountEl.textContent, 10) || 0;
      ratingCountEl.textContent = current + delta;
    } catch (err) {
      console.error('[speech-bubble] Vote failed:', err);
    }
  }

  upBtn.addEventListener('click', () => handleVote(1));
  downBtn.addEventListener('click', () => handleVote(-1));

  // ---- Moderation dropdown ----------------------------------------
  const modBtn = actions.querySelector('.bubble-mod-btn');
  const modDropdown = actions.querySelector('.bubble-mod-dropdown');

  modBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    modDropdown.classList.toggle('bubble-mod-dropdown--hidden');
  });

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    modDropdown.classList.add('bubble-mod-dropdown--hidden');
  });

  modDropdown.addEventListener('click', async (e) => {
    const option = e.target.closest('.bubble-mod-option');
    if (!option) return;

    e.stopPropagation();
    const action = option.dataset.action;

    try {
      if (action === 'delete_post') {
        await voteModeration('post', postId, 'delete');
      } else if (action === 'block_user') {
        await voteModeration('user', authorId, 'block');
      }
      option.textContent = '✓ Voted';
      option.disabled = true;
    } catch (err) {
      console.error('[speech-bubble] Moderation vote failed:', err);
    }

    modDropdown.classList.add('bubble-mod-dropdown--hidden');
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
      handleVote(1);
    } else if (deltaX < -80) {
      handleVote(-1);
    }
  });

  return wrapper;
}
