/**
 * review-card.js — Review display component for k0
 * Nozus-style: avatar left, content right with star rating.
 */

import { createStarDisplay } from './star-rating.js';
import { EMPTY_AVATAR } from '../utils/constants.js';

/**
 * Converts an ISO timestamp to a human-readable relative time string.
 */
function timeAgo(isoString) {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60)     return 'just now';
  if (diffSec < 3600)   return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400)  return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d`;
  if (diffSec < 31536000) return `${Math.floor(diffSec / 2592000)}mo`;
  return `${Math.floor(diffSec / 31536000)}y`;
}

/**
 * Escapes HTML special characters.
 */
function escapeHtml(str) {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

/**
 * Creates a review card DOM element.
 * @param {Object} review - Review record from Supabase (with joined profiles)
 * @param {string|null} currentUserId - The currently logged-in user's ID
 * @returns {HTMLElement}
 */
export function createReviewCard(review, currentUserId = null) {
  const {
    id: reviewId,
    user_id: authorId,
    rating,
    content,
    created_at: createdAt,
    profiles: { username, display_name: displayName, avatar_url: avatarUrl },
  } = review;

  const isOwn = currentUserId === authorId;

  // Wrapper
  const wrapper = document.createElement('div');
  wrapper.classList.add('review-card');
  if (isOwn) wrapper.classList.add('review-card--own');
  wrapper.dataset.reviewId = reviewId;

  // Avatar
  const avatarEl = document.createElement('div');
  avatarEl.classList.add('review-card-avatar');

  const img = document.createElement('img');
  img.src = avatarUrl || EMPTY_AVATAR;
  img.alt = username;
  img.classList.add('review-card-avatar-img');
  avatarEl.appendChild(img);

  // Body
  const body = document.createElement('div');
  body.classList.add('review-card-body');

  // Header
  const header = document.createElement('div');
  header.classList.add('review-card-header');

  const usernameEl = document.createElement('a');
  usernameEl.href = `#/profile/${escapeHtml(username)}`;
  usernameEl.classList.add('review-card-username');
  usernameEl.textContent = `@${escapeHtml(username)}`;

  const timeEl = document.createElement('span');
  timeEl.classList.add('review-card-time');
  timeEl.textContent = timeAgo(createdAt);

  header.append(usernameEl, timeEl);

  // Star rating
  const stars = createStarDisplay(rating, { size: 'small' });

  // Content
  const contentEl = document.createElement('div');
  contentEl.classList.add('review-card-content');
  if (content) {
    contentEl.textContent = content;
  }

  // Own review indicator
  if (isOwn) {
    const ownBadge = document.createElement('span');
    ownBadge.classList.add('review-card-own-badge');
    ownBadge.textContent = 'your review';
    header.appendChild(ownBadge);
  }

  body.append(header, stars);
  if (content) body.appendChild(contentEl);

  wrapper.append(avatarEl, body);
  return wrapper;
}

/**
 * Creates a compact review card for profile pages (shows item info).
 * @param {Object} review - Review with joined items + profiles
 * @returns {HTMLElement}
 */
export function createProfileReviewCard(review) {
  const {
    rating,
    content,
    created_at: createdAt,
    items: { id: itemId, title: itemTitle, category },
  } = review;

  const card = document.createElement('a');
  card.href = `#/item/${itemId}`;
  card.classList.add('profile-review-card');

  // Item info
  const itemInfo = document.createElement('div');
  itemInfo.classList.add('profile-review-item');

  const badge = document.createElement('span');
  badge.classList.add('item-card-badge');
  badge.textContent = category;

  const titleEl = document.createElement('span');
  titleEl.classList.add('profile-review-title');
  titleEl.textContent = itemTitle;

  itemInfo.append(badge, titleEl);

  // Rating
  const stars = createStarDisplay(rating, { size: 'small' });

  // Content preview
  const contentEl = document.createElement('div');
  contentEl.classList.add('profile-review-content');
  contentEl.textContent = content || '';

  // Time
  const timeEl = document.createElement('span');
  timeEl.classList.add('review-card-time');
  timeEl.textContent = timeAgo(createdAt);

  card.append(itemInfo, stars);
  if (content) card.appendChild(contentEl);
  card.appendChild(timeEl);

  return card;
}
