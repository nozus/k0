import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { createItemCard } from '../components/item-card.js';
import { fetchItems } from '../utils/items.js';
import { getCurrentUser, getCurrentProfile, updateProfile } from '../utils/auth.js';
import { CATEGORIES } from '../utils/constants.js';

let currentCategory = 'all';
let searchQuery = '';
let isLoading = false;

export async function renderExplorePage(app) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.hash = '/auth';
    return;
  }

  const currentUserProfile = await getCurrentProfile();

  const categoryPills = CATEGORIES.map(cat => `
    <button
      class="category-pill${cat.id === currentCategory ? ' category-pill--active' : ''}"
      data-category="${cat.id}"
    >${cat.label}</button>
  `).join('');

  app.innerHTML = `
    ${renderNavbar()}
    <div class="feed-layout">
      ${renderSidebar('explore')}
      <main class="feed-main explore-main">
        <div class="feed-header">
          <h1 class="feed-title">explore.</h1>
          <p class="explore-subtitle">rate anything. everything. whatever you want.</p>
        </div>

        <div class="explore-search-row">
          <div class="explore-search-wrapper">
            <span class="explore-search-icon">⌕</span>
            <input
              type="text"
              class="explore-search"
              id="explore-search"
              placeholder="search items..."
              value=""
            />
          </div>
        </div>

        <div class="category-scroll" id="category-scroll">
          ${categoryPills}
        </div>

        <div class="item-grid" id="item-grid">
          <div class="skeleton-loader" id="skeleton-loader">
            ${Array(6).fill('').map(() => `
              <div class="skeleton-card">
                <div class="skeleton-card-image skeleton-pulse"></div>
                <div class="skeleton-card-content">
                  <div class="skeleton-line skeleton-line--short skeleton-pulse"></div>
                  <div class="skeleton-line skeleton-pulse"></div>
                  <div class="skeleton-line skeleton-line--medium skeleton-pulse"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="feed-empty" id="feed-empty" style="display:none">
          <h3>nothing here yet.</h3>
          <p>be the first to add something to rate.</p>
        </div>

        <a href="#/create" class="fab" id="fab" aria-label="Create new item">+</a>
      </main>
    </div>
  `;

  initSidebar();
  await loadItems();

  // Category pills
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', async () => {
      document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('category-pill--active'));
      pill.classList.add('category-pill--active');
      currentCategory = pill.dataset.category;
      await loadItems();
    });
  });

  // Search
  let searchTimeout = null;
  const searchInput = document.getElementById('explore-search');
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      searchQuery = searchInput.value.trim();
      await loadItems();
    }, 300);
  });

  // Handle setup modal (display name prompt for new users)
  if (currentUserProfile && currentUserProfile.display_name === currentUserProfile.username) {
    showHandleSetup(user, currentUserProfile);
  }
}

function showHandleSetup(user, profile) {
  const overlay = document.createElement('div');
  overlay.classList.add('handle-setup-overlay');
  overlay.innerHTML = `
    <div class="handle-setup-modal">
      <h2 class="handle-setup-title">set your handle.</h2>
      <p class="handle-setup-subtitle">this is the name people will see on your kard.</p>
      <form class="handle-setup-form" id="handle-setup-form">
        <input
          type="text"
          class="input-control"
          id="handle-input"
          placeholder="display name."
          required
          maxlength="30"
          value=""
        />
        <div class="auth-error" id="handle-error"></div>
        <button type="submit" class="submit-btn" id="handle-submit">save.</button>
        <button type="button" class="handle-skip-btn" id="handle-skip">skip for now.</button>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add('handle-setup-overlay--visible'));

  const form = document.getElementById('handle-setup-form');
  const handleInput = document.getElementById('handle-input');
  const handleError = document.getElementById('handle-error');
  const handleSubmit = document.getElementById('handle-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = handleInput.value.trim();
    if (!newName) return;

    handleSubmit.disabled = true;
    handleSubmit.innerHTML = '<span class="spinner"></span>';
    handleError.textContent = '';
    handleError.classList.remove('visible');

    try {
      await updateProfile(user.id, { display_name: newName });
      overlay.classList.remove('handle-setup-overlay--visible');
      setTimeout(() => overlay.remove(), 300);
      window.location.reload();
    } catch (err) {
      handleError.textContent = err.message;
      handleError.classList.add('visible');
    } finally {
      handleSubmit.disabled = false;
      handleSubmit.innerHTML = 'save.';
    }
  });

  document.getElementById('handle-skip').addEventListener('click', () => {
    overlay.classList.remove('handle-setup-overlay--visible');
    setTimeout(() => overlay.remove(), 300);
  });
}

async function loadItems() {
  const grid = document.getElementById('item-grid');
  const skeleton = document.getElementById('skeleton-loader');
  const emptyState = document.getElementById('feed-empty');

  if (skeleton) skeleton.style.display = 'grid';
  isLoading = true;

  try {
    const items = await fetchItems({ category: currentCategory, search: searchQuery });

    if (skeleton) skeleton.style.display = 'none';

    if (items.length === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';
    grid.innerHTML = '';

    items.forEach((item, index) => {
      const card = createItemCard(item);
      card.style.animationDelay = `${index * 0.06}s`;
      card.classList.add('animate-slideUp');
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading items:', err);
    if (skeleton) skeleton.style.display = 'none';
    grid.innerHTML = `
      <div class="feed-error">
        <span>failed to load items. try refreshing.</span>
      </div>
    `;
  } finally {
    isLoading = false;
  }
}
