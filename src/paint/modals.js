/**
 * k0 Modal System
 * 
 * Reusable glassmorphism modals for Profile, Settings, and Confirmations.
 */

import { getCurrentUser, getCurrentProfile, updateProfile } from '../utils/auth.js';

// ────────────────────────────────────────────────────────
// Base Modal
// ────────────────────────────────────────────────────────

function createModal(id, title, contentHTML) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = id;
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h2 class="modal__title">${title}</h2>
        <button class="modal__close" id="${id}-close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="modal__body">${contentHTML}</div>
    </div>
  `;

  // Close on overlay click
  overlay.addEventListener('pointerdown', (e) => {
    if (e.target === overlay) closeModal(id);
  });

  // Close button
  overlay.querySelector(`#${id}-close`).addEventListener('click', () => closeModal(id));

  // Prevent events from reaching canvas
  overlay.addEventListener('pointerdown', (e) => e.stopPropagation());

  document.body.appendChild(overlay);
  return overlay;
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ────────────────────────────────────────────────────────
// Profile Modal (no avatar/profile picture)
// ────────────────────────────────────────────────────────

export async function openProfileModal() {
  // Fetch user data
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  const username = profile?.username || user?.user_metadata?.username || 'unknown';
  const displayName = profile?.display_name || username;
  const bio = profile?.bio || '';
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const contentHTML = `
    <div class="profile-card">
      <div class="profile-card__info">
        <span class="profile-card__username">@${username}</span>
        <span class="profile-card__display">${displayName}</span>
        ${joinDate ? `<span class="profile-card__joined">joined ${joinDate}</span>` : ''}
      </div>
    </div>
    <div class="modal__field">
      <label class="modal__label" for="profile-display-name">display name.</label>
      <input type="text" class="modal__input" id="profile-display-name" value="${displayName}" maxlength="30" placeholder="your display name." />
    </div>
    <div class="modal__field">
      <label class="modal__label" for="profile-bio">bio.</label>
      <textarea class="modal__textarea" id="profile-bio" maxlength="160" rows="3" placeholder="tell the world about yourself.">${bio}</textarea>
      <span class="modal__char-count" id="bio-char-count">${bio.length}/160</span>
    </div>
    <div class="modal__actions">
      <button class="modal__btn modal__btn--primary" id="profile-save">save.</button>
      <span class="modal__status" id="profile-status"></span>
    </div>
  `;

  const modal = createModal('profile-modal', 'profile.', contentHTML);

  // Bio character count
  const bioInput = modal.querySelector('#profile-bio');
  const charCount = modal.querySelector('#bio-char-count');
  bioInput.addEventListener('input', () => {
    charCount.textContent = `${bioInput.value.length}/160`;
  });

  // Save handler
  modal.querySelector('#profile-save').addEventListener('click', async () => {
    const status = modal.querySelector('#profile-status');
    const saveBtn = modal.querySelector('#profile-save');
    const newDisplayName = modal.querySelector('#profile-display-name').value.trim();
    const newBio = bioInput.value.trim();

    saveBtn.disabled = true;
    saveBtn.textContent = 'saving...';
    status.textContent = '';

    try {
      await updateProfile(user.id, {
        display_name: newDisplayName || username,
        bio: newBio,
      });
      status.textContent = 'saved!';
      status.style.color = '#6BCB77';
      saveBtn.textContent = 'save.';
      saveBtn.disabled = false;
    } catch (err) {
      status.textContent = err.message || 'failed to save.';
      status.style.color = '#FF6B6B';
      saveBtn.textContent = 'save.';
      saveBtn.disabled = false;
    }
  });
}

// ────────────────────────────────────────────────────────
// Settings Modal
// ────────────────────────────────────────────────────────

export function openSettingsModal(engine) {
  const contentHTML = `
    <div class="settings-group">
      <span class="settings-group__title">canvas.</span>
      <div class="settings-row">
        <label class="settings-row__label" for="setting-grid">show grid.</label>
        <label class="settings-toggle">
          <input type="checkbox" id="setting-grid" ${engine.settings.showGrid ? 'checked' : ''} />
          <span class="settings-toggle__slider"></span>
        </label>
      </div>
      <div class="settings-row">
        <label class="settings-row__label" for="setting-cursor">cursor preview.</label>
        <label class="settings-toggle">
          <input type="checkbox" id="setting-cursor" ${engine.settings.cursorPreview ? 'checked' : ''} />
          <span class="settings-toggle__slider"></span>
        </label>
      </div>
      <div class="settings-row">
        <label class="settings-row__label" for="setting-bg">background color.</label>
        <input type="color" class="settings-color" id="setting-bg" value="${engine.settings.bgColor}" />
      </div>
    </div>
    <div class="settings-group">
      <span class="settings-group__title">view.</span>
      <div class="settings-row">
        <label class="settings-row__label">zoom level.</label>
        <span class="settings-row__value" id="setting-zoom-val">${Math.round(engine.zoom * 100)}%</span>
      </div>
      <div class="settings-row">
        <button class="modal__btn modal__btn--secondary" id="setting-reset-view">reset view.</button>
      </div>
    </div>
    <div class="settings-group">
      <span class="settings-group__title">data.</span>
      <div class="settings-row">
        <button class="modal__btn modal__btn--secondary" id="setting-export">export as png.</button>
      </div>
      <div class="settings-row">
        <label class="settings-row__label">strokes.</label>
        <span class="settings-row__value">${engine.strokes.length}</span>
      </div>
    </div>
    <div class="settings-group">
      <span class="settings-group__title">shortcuts.</span>
      <div class="settings-shortcut"><kbd>1</kbd>–<kbd>9</kbd> select tool</div>
      <div class="settings-shortcut"><kbd>ctrl</kbd>+<kbd>z</kbd> undo</div>
      <div class="settings-shortcut"><kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>z</kbd> redo</div>
      <div class="settings-shortcut"><kbd>[</kbd> <kbd>]</kbd> brush size</div>
      <div class="settings-shortcut"><kbd>scroll</kbd> zoom</div>
      <div class="settings-shortcut"><kbd>space</kbd>+<kbd>drag</kbd> pan</div>
      <div class="settings-shortcut"><kbd>middle click</kbd> pan</div>
    </div>
  `;

  const modal = createModal('settings-modal', 'settings.', contentHTML);

  // Grid toggle
  modal.querySelector('#setting-grid').addEventListener('change', (e) => {
    engine.settings.showGrid = e.target.checked;
    engine.requestRender();
  });

  // Cursor preview toggle
  modal.querySelector('#setting-cursor').addEventListener('change', (e) => {
    engine.settings.cursorPreview = e.target.checked;
    engine.requestRender();
  });

  // Background color
  modal.querySelector('#setting-bg').addEventListener('input', (e) => {
    engine.settings.bgColor = e.target.value;
    engine.requestRender();
  });

  // Reset view
  modal.querySelector('#setting-reset-view').addEventListener('click', () => {
    engine.resetView();
    modal.querySelector('#setting-zoom-val').textContent = '100%';
  });

  // Export PNG
  modal.querySelector('#setting-export').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `k0-canvas-${Date.now()}.png`;
    link.href = engine.canvas.toDataURL('image/png');
    link.click();
  });
}

// ────────────────────────────────────────────────────────
// Confirm Delete Modal
// ────────────────────────────────────────────────────────

export function openConfirmDeleteModal(onConfirm) {
  const contentHTML = `
    <div class="confirm-delete">
      <div class="confirm-delete__icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <p class="confirm-delete__text">delete all your drawings?<br><span class="confirm-delete__subtext">this can't be undone.</span></p>
      <div class="confirm-delete__actions">
        <button class="modal__btn modal__btn--danger-fill" id="confirm-delete-yes">delete.</button>
        <button class="modal__btn modal__btn--secondary" id="confirm-delete-no">cancel.</button>
      </div>
    </div>
  `;

  const modal = createModal('confirm-delete-modal', '', contentHTML);

  // Hide the header for this mini modal
  const header = modal.querySelector('.modal__header');
  if (header) header.style.display = 'none';

  modal.querySelector('#confirm-delete-yes').addEventListener('click', () => {
    closeModal('confirm-delete-modal');
    if (onConfirm) onConfirm();
  });

  modal.querySelector('#confirm-delete-no').addEventListener('click', () => {
    closeModal('confirm-delete-modal');
  });
}
