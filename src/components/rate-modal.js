/**
 * rate-modal.js — Moderation vote modal for k0
 * Glassmorphism dialog for confirming delete-post / block-user votes.
 */

import { voteModeration } from '../utils/moderation.js';

const MODAL_ID = 'rate-modal';
const OVERLAY_ID = 'rate-modal-overlay';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function escapeHtml(str) {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

/* ------------------------------------------------------------------ */
/*  Show Modal                                                        */
/* ------------------------------------------------------------------ */

/**
 * Creates and displays a moderation-vote confirmation modal.
 *
 * @param {'post'|'user'} targetType - What the vote targets
 * @param {string} targetId - UUID of the target post or user
 * @param {string} targetName - Username to display in the prompt
 */
export async function showRateModal(targetType, targetId, targetName) {
  // Remove any existing modal first
  hideRateModal();

  const safeName = escapeHtml(targetName);

  const message =
    targetType === 'post'
      ? `Vote to delete this post by <strong>@${safeName}</strong>?`
      : `Vote to block <strong>@${safeName}</strong>?`;

  const confirmLabel =
    targetType === 'post' ? 'Confirm Delete Vote' : 'Confirm Block Vote';

  // ---- Build overlay + modal DOM ----------------------------------
  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.classList.add('rate-modal-overlay');

  const modal = document.createElement('div');
  modal.id = MODAL_ID;
  modal.classList.add('rate-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  modal.innerHTML = `
    <div class="rate-modal-card">
      <div class="rate-modal-icon">
        ${targetType === 'post' ? '🗑️' : '🚫'}
      </div>
      <p class="rate-modal-message">${message}</p>
      <div class="rate-modal-actions">
        <button class="rate-modal-btn rate-modal-btn--confirm" id="rate-modal-confirm">
          ${escapeHtml(confirmLabel)}
        </button>
        <button class="rate-modal-btn rate-modal-btn--cancel" id="rate-modal-cancel">
          Cancel
        </button>
      </div>
      <p class="rate-modal-status" id="rate-modal-status"></p>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Trigger enter animation (next frame so CSS transition fires)
  requestAnimationFrame(() => {
    overlay.classList.add('rate-modal-overlay--visible');
    modal.classList.add('rate-modal--visible');
  });

  // ---- Event handlers --------------------------------------------
  const confirmBtn = document.getElementById('rate-modal-confirm');
  const cancelBtn = document.getElementById('rate-modal-cancel');
  const statusEl = document.getElementById('rate-modal-status');

  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Submitting…';

    try {
      const action = targetType === 'post' ? 'delete' : 'block';
      await voteModeration(targetType, targetId, action);
      statusEl.textContent = '✓ Vote submitted';
      statusEl.classList.add('rate-modal-status--success');

      // Auto-close after brief delay
      setTimeout(() => hideRateModal(), 800);
    } catch (err) {
      console.error('[rate-modal] Vote failed:', err);
      statusEl.textContent = 'Failed to submit vote. Try again.';
      statusEl.classList.add('rate-modal-status--error');
      confirmBtn.disabled = false;
      confirmBtn.textContent = confirmLabel;
    }
  });

  cancelBtn.addEventListener('click', () => hideRateModal());
  overlay.addEventListener('click', () => hideRateModal());

  // Close on Escape
  const onEscape = (e) => {
    if (e.key === 'Escape') {
      hideRateModal();
      document.removeEventListener('keydown', onEscape);
    }
  };
  document.addEventListener('keydown', onEscape);
}

/* ------------------------------------------------------------------ */
/*  Hide Modal                                                        */
/* ------------------------------------------------------------------ */

/**
 * Closes and removes the moderation modal with a fade-out animation.
 */
export function hideRateModal() {
  const overlay = document.getElementById(OVERLAY_ID);
  const modal = document.getElementById(MODAL_ID);

  if (!overlay && !modal) return;

  // Trigger exit animation
  if (overlay) overlay.classList.remove('rate-modal-overlay--visible');
  if (modal) modal.classList.remove('rate-modal--visible');

  // Remove from DOM after transition completes
  const cleanup = () => {
    overlay?.remove();
    modal?.remove();
  };

  if (modal) {
    modal.addEventListener('transitionend', cleanup, { once: true });
    // Safety fallback if transitionend doesn't fire
    setTimeout(cleanup, 400);
  } else {
    cleanup();
  }
}
