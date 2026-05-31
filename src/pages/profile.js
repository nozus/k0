import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { createKard, initKardTilt } from '../components/kard.js';
import { createSpeechBubble } from '../components/speech-bubble.js';
import { getProfileById, getCurrentUser, getCurrentProfile } from '../utils/auth.js';
import { fetchUserPosts } from '../utils/posts.js';
import { voteModeration } from '../utils/moderation.js';
import { showRateModal } from '../components/rate-modal.js';

export async function renderProfilePage(app, params = {}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    window.location.hash = '/auth';
    return;
  }

  // Determine which profile to show
  let profile;
  let isOwnProfile = false;

  if (params?.id && params.id !== currentUser.id) {
    profile = await getProfileById(params.id);
    if (!profile) {
      app.innerHTML = `
        <div class="profile-error">
          <h2>Kard not found</h2>
          <p>This user doesn't exist or has been blocked.</p>
          <a href="#/feed" class="btn-primary">Back to Kontros</a>
        </div>
      `;
      return;
    }
  } else {
    profile = await getCurrentProfile();
    isOwnProfile = true;
  }

  const posts = await fetchUserPosts(profile.id);

  app.innerHTML = `
    ${renderNavbar()}
    <div class="feed-layout">
      ${renderSidebar('profile')}
      <main class="feed-main profile-main">
        <div class="profile-header">
          <div class="profile-kard-wrapper" id="profile-kard">
            ${createKard(profile, 'large')}
          </div>
          
          ${profile.bio ? `<p class="profile-bio">${escapeHtml(profile.bio)}</p>` : ''}

          <div class="profile-stats-row">
            <div class="profile-stat glass">
              <span class="profile-stat-value">${posts.length}</span>
              <span class="profile-stat-label">Kontros</span>
            </div>
            <div class="profile-stat glass">
              <span class="profile-stat-value">${profile.karma_score || 0}</span>
              <span class="profile-stat-label">Karma</span>
            </div>
            <div class="profile-stat glass">
              <span class="profile-stat-value">${formatJoinDate(profile.created_at)}</span>
              <span class="profile-stat-label">Joined</span>
            </div>
          </div>

          ${!isOwnProfile ? `
            <div class="profile-actions">
              <button class="btn-danger" id="block-user-btn">
                🚫 Vote to Block
              </button>
            </div>
          ` : `
            <div class="profile-actions">
              <button class="btn-secondary" id="edit-profile-btn">
                ✏️ Edit Kard
              </button>
            </div>
          `}
        </div>

        <div class="profile-posts-header">
          <h2 class="profile-posts-title">
            ${isOwnProfile ? 'My' : `@${profile.username}'s`} Kontros
          </h2>
        </div>

        <div class="post-list" id="profile-post-list">
          ${posts.length === 0 ? `
            <div class="feed-empty">
              <span class="feed-empty-icon">🤫</span>
              <h3>No kontros yet</h3>
              <p>${isOwnProfile ? 'Time to speak your mind' : 'This user hasn\'t posted yet'}</p>
            </div>
          ` : ''}
        </div>
      </main>
    </div>
  `;

  initSidebar();

  // Render posts
  if (posts.length > 0) {
    const postList = document.getElementById('profile-post-list');
    posts.forEach((post, index) => {
      const bubble = createSpeechBubble(post, currentUser.id);
      bubble.style.animationDelay = `${index * 0.08}s`;
      bubble.classList.add('animate-slideUp');
      postList.appendChild(bubble);
    });
  }

  // Init kard tilt
  const kardWrapper = document.getElementById('profile-kard');
  if (kardWrapper) {
    initKardTilt(kardWrapper);
  }

  // Block user button
  if (!isOwnProfile) {
    const blockBtn = document.getElementById('block-user-btn');
    if (blockBtn) {
      blockBtn.addEventListener('click', () => {
        showRateModal('user', profile.id, profile.username);
      });
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatJoinDate(dateStr) {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}
