/**
 * item-card.js — Grid card component for items on the explore page.
 * Nozus-style: thin borders, minimal colors, smooth hover transitions.
 */

import { createStarDisplay } from './star-rating.js';
import { CATEGORY_HUES } from '../utils/constants.js';

/**
 * Escapes HTML special characters.
 */
function escapeHtml(str) {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

/**
 * Generates a gradient placeholder based on category.
 */
function categoryGradient(category) {
  const hue = CATEGORY_HUES[category] ?? 0;
  return `linear-gradient(135deg, hsl(${hue}, 30%, 92%), hsl(${(hue + 30) % 360}, 25%, 88%))`;
}

/**
 * Creates an item card DOM element.
 * @param {Object} item - Item record from Supabase (with joined profiles)
 * @returns {HTMLElement}
 */
export function createItemCard(item) {
  const {
    id,
    title,
    category,
    image_url: imageUrl,
    avg_rating: avgRating,
    review_count: reviewCount,
    profiles: { username },
  } = item;

  const card = document.createElement('a');
  card.href = `#/item/${id}`;
  card.classList.add('item-card');

  // Image area
  const imageArea = document.createElement('div');
  imageArea.classList.add('item-card-image');

  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = title;
    img.classList.add('item-card-img');
    img.loading = 'lazy';
    imageArea.appendChild(img);
  } else {
    imageArea.style.background = categoryGradient(category);
    const placeholder = document.createElement('span');
    placeholder.classList.add('item-card-placeholder');
    placeholder.textContent = category;
    imageArea.appendChild(placeholder);
  }

  // Content area
  const content = document.createElement('div');
  content.classList.add('item-card-content');

  // Category badge
  const badge = document.createElement('span');
  badge.classList.add('item-card-badge');
  badge.textContent = category;

  // Title
  const titleEl = document.createElement('h3');
  titleEl.classList.add('item-card-title');
  titleEl.textContent = title;

  // Rating row
  const ratingRow = document.createElement('div');
  ratingRow.classList.add('item-card-rating');

  const stars = createStarDisplay(avgRating || 0, { size: 'small' });

  const countEl = document.createElement('span');
  countEl.classList.add('item-card-count');
  countEl.textContent = `(${reviewCount || 0})`;

  ratingRow.append(stars, countEl);

  // Creator
  const creator = document.createElement('span');
  creator.classList.add('item-card-creator');
  creator.textContent = `@${escapeHtml(username)}`;

  content.append(badge, titleEl, ratingRow, creator);
  card.append(imageArea, content);

  return card;
}
