import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { createItemCard } from '../components/item-card.js';
import { createProfileReviewCard } from '../components/review-card.js';
import { getProfileById, getProfileByUsername, getCurrentUser, getCurrentProfile } from '../utils/auth.js';
import { fetchUserItems } from '../utils/items.js';
import { fetchUserReviews } from '../utils/reviews.js';
import { EMPTY_AVATAR } from '../utils/constants.js';

export async function renderProfilePage(app, params = {}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    window.location.hash = '/auth';
    return;
  }

  // Determine which profile to show
  let profile;
  let isOwnProfile = false;
  const currentUserProfile = await getCurrentProfile();

  if (params?.id && params.id !== currentUser.id && params.id !== currentUserProfile?.username) {
    // Try by username first
    profile = await getProfileByUsername(params.id);
    
    // Fallback to ID
    if (!profile) {
      profile = await getProfileById(params.id);
    }
    
    if (!profile) {
      app.innerHTML = `
        <div class="profile-error">
          <h2>kard not found.</h2>
          <p>this user doesn't exist or has been blocked.</p>
          <a href="#/explore" class="submit-btn" style="display:inline-block;max-width:200px;text-align:center">back to explore</a>
        </div>
      `;
      return;
    }
  } else {
    profile = currentUserProfile;
    isOwnProfile = true;
    if (!profile) {
      window.location.hash = '/explore';
      return;
    }
  }

  const items = await fetchUserItems(profile.id);
  const reviews = await fetchUserReviews(profile.id);

  app.innerHTML = `
    ${renderNavbar()}
    <div class="feed-layout">
      ${renderSidebar('profile')}
      <main class="feed-main profile-main">
        <div class="profile-header">
          <div class="profile-avatar">
            <img src="${escapeHtml(profile.avatar_url || EMPTY_AVATAR)}" alt="avatar" class="profile-avatar-img" />
          </div>
          <div class="profile-info">
            <h1 class="profile-name">${escapeHtml(profile.display_name || profile.username)}</h1>
            <span class="profile-username">@${escapeHtml(profile.username)}</span>
          </div>
          
          ${profile.bio ? `<p class="profile-bio">${escapeHtml(profile.bio)}</p>` : ''}

          <div class="profile-stats-row">
            <div class="profile-stat glass">
              <span class="profile-stat-value">${items.length}</span>
              <span class="profile-stat-label">items</span>
            </div>
            <div class="profile-stat glass">
              <span class="profile-stat-value">${reviews.length}</span>
              <span class="profile-stat-label">reviews</span>
            </div>
            <div class="profile-stat glass">
              <span class="profile-stat-value">${formatJoinDate(profile.created_at)}</span>
              <span class="profile-stat-label">joined</span>
            </div>
          </div>
        </div>

        <div class="profile-tabs">
          <button class="profile-tab profile-tab--active" data-tab="items" id="tab-items">
            items (${items.length})
          </button>
          <button class="profile-tab" data-tab="reviews" id="tab-reviews">
            reviews (${reviews.length})
          </button>
        </div>

        <div class="profile-tab-content" id="tab-content-items">
          ${items.length === 0 ? `
            <div class="feed-empty">
              <h3>no items yet.</h3>
              <p>${isOwnProfile ? 'create something for people to rate.' : "this user hasn't created any items yet."}</p>
              ${isOwnProfile ? '<a href="#/create" class="submit-btn" style="display:inline-block;max-width:200px;text-align:center;margin-top:1rem">create.</a>' : ''}
            </div>
          ` : ''}
          <div class="item-grid profile-item-grid" id="profile-items-grid"></div>
        </div>

        <div class="profile-tab-content profile-tab-content--hidden" id="tab-content-reviews">
          ${reviews.length === 0 ? `
            <div class="feed-empty">
              <h3>no reviews yet.</h3>
              <p>${isOwnProfile ? 'go explore and rate something.' : "this user hasn't reviewed anything yet."}</p>
              ${isOwnProfile ? '<a href="#/explore" class="submit-btn" style="display:inline-block;max-width:200px;text-align:center;margin-top:1rem">explore.</a>' : ''}
            </div>
          ` : ''}
          <div class="profile-reviews-list" id="profile-reviews-list"></div>
        </div>
      </main>
    </div>
  `;

  initSidebar();

  // Render items
  if (items.length > 0) {
    const itemsGrid = document.getElementById('profile-items-grid');
    items.forEach((item, index) => {
      const card = createItemCard(item);
      card.style.animationDelay = `${index * 0.06}s`;
      card.classList.add('animate-slideUp');
      itemsGrid.appendChild(card);
    });
  }

  // Render reviews
  if (reviews.length > 0) {
    const reviewsList = document.getElementById('profile-reviews-list');
    reviews.forEach((review, index) => {
      const card = createProfileReviewCard(review);
      card.style.animationDelay = `${index * 0.06}s`;
      card.classList.add('animate-slideUp');
      reviewsList.appendChild(card);
    });
  }

  // Tab switching
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('profile-tab--active'));
      tab.classList.add('profile-tab--active');

      const tabName = tab.dataset.tab;
      document.querySelectorAll('.profile-tab-content').forEach(tc => {
        tc.classList.add('profile-tab-content--hidden');
      });
      document.getElementById(`tab-content-${tabName}`).classList.remove('profile-tab-content--hidden');
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatJoinDate(dateStr) {
  const date = new Date(dateStr);
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}
