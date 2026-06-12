import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { createSpeechBubble } from '../components/speech-bubble.js';
import { createKard, initKardTilt } from '../components/kard.js';
import { fetchPosts, createPost } from '../utils/posts.js';
import { getCurrentUser, getCurrentProfile, updateProfile } from '../utils/auth.js';
import { EMPTY_AVATAR } from '../utils/constants.js';

let currentFilter = 'newest';
let isLoading = false;
let currentUserProfile = null;

export async function renderFeedPage(app) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.hash = '/auth';
    return;
  }

  currentUserProfile = await getCurrentProfile();

  app.innerHTML = `
    ${renderNavbar()}
    <div class="feed-layout">
      ${renderSidebar('feed')}
      <main class="feed-main">
        <div class="feed-header">
          <h1 class="feed-title">kontros.</h1>
          <div class="feed-filters">
            <button class="filter-btn filter-btn--active" data-filter="newest" id="filter-newest">newest</button>
            <button class="filter-btn" data-filter="controversial" id="filter-controversial">kontroversial</button>
            <button class="filter-btn" data-filter="trending" id="filter-trending">kraze</button>
          </div>
        </div>

        <div class="compose-box" id="compose-box">
          <div class="compose-avatar">
            <img src="${currentUserProfile?.avatar_url || EMPTY_AVATAR}" alt="You" class="compose-avatar-img" />
          </div>
          <form class="compose-form" id="compose-form">
            <textarea 
              class="compose-input" 
              id="compose-input" 
              placeholder="drop a kontro..." 
              maxlength="500"
              rows="1"
            ></textarea>
            <div class="compose-footer">
              <span class="compose-counter" id="compose-counter">0/500</span>
              <button type="submit" class="compose-submit" id="compose-submit" disabled>
                post
              </button>
            </div>
          </form>
        </div>

        <div class="post-list" id="post-list">
          <div class="skeleton-loader" id="skeleton-loader">
            ${Array(3).fill('').map(() => `
              <div class="skeleton-bubble">
                <div class="skeleton-avatar skeleton-pulse"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line skeleton-line--short skeleton-pulse"></div>
                  <div class="skeleton-line skeleton-pulse"></div>
                  <div class="skeleton-line skeleton-line--medium skeleton-pulse"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="feed-empty" id="feed-empty" style="display:none">
          <h3>no kontros yet.</h3>
          <p>be the first to drop something kontroversial.</p>
        </div>
      </main>

      <aside class="right-sidebar" id="right-sidebar">
        <div class="right-sidebar-section kard-section" id="kard-section">
          <h3 class="right-sidebar-title">my kard.</h3>
          <div class="kard-wrapper" id="kard-wrapper">
            ${currentUserProfile ? createKard(currentUserProfile, 'mini') : ''}
          </div>
        </div>

        <div class="right-sidebar-divider"></div>

        <div class="right-sidebar-section kraze-section" id="kraze-section">
          <h3 class="right-sidebar-title">kraze.</h3>
          <p class="right-sidebar-subtitle">what's hot right now</p>
          <div class="kraze-list" id="kraze-list">
            <div class="kraze-loading">
              <span class="spinner"></span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  `;

  initSidebar();
  initCompose();
  await loadPosts();

  // Init kard tilt in right sidebar
  const kardWrapper = document.getElementById('kard-wrapper');
  if (kardWrapper) initKardTilt(kardWrapper);

  // Load kraze (trending) posts
  // loadKrazePosts();

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      currentFilter = btn.dataset.filter;
      await loadPosts();
    });
  });

  // Prompt user to set handle if they haven't yet (display_name still equals username)
  if (currentUserProfile && currentUserProfile.display_name === currentUserProfile.username) {
    showHandleSetup(user, currentUserProfile);
  }
}

function showHandleSetup(user, profile) {
  // Create overlay
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

  // Animate in
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
      // Refresh page to show new name
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

function initCompose() {
  const input = document.getElementById('compose-input');
  const counter = document.getElementById('compose-counter');
  const submitBtn = document.getElementById('compose-submit');
  const form = document.getElementById('compose-form');

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
    
    const len = input.value.length;
    counter.textContent = `${len}/500`;
    submitBtn.disabled = len === 0 || len > 500;
    
    if (len > 450) {
      counter.classList.add('compose-counter--warn');
    } else {
      counter.classList.remove('compose-counter--warn');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = input.value.trim();
    if (!content) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>';

    try {
      const newPost = await createPost(content);
      input.value = '';
      input.style.height = 'auto';
      counter.textContent = '0/500';
      
      // Ensure profiles is attached for optimistic rendering
      if (!newPost.profiles || Array.isArray(newPost.profiles)) {
        newPost.profiles = {
          username: currentUserProfile.username,
          display_name: currentUserProfile.display_name,
          avatar_url: currentUserProfile.avatar_url
        };
      }
      
      // Prepend new post to feed
      const postList = document.getElementById('post-list');
      const user = await getCurrentUser();
      const bubble = createSpeechBubble(newPost, user.id);
      bubble.classList.add('animate-slideUp');
      postList.insertBefore(bubble, postList.firstChild);
      
      // Remove empty state if shown
      document.getElementById('feed-empty').style.display = 'none';
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'post';
    }
  });
}

async function loadPosts() {
  const postList = document.getElementById('post-list');
  const skeleton = document.getElementById('skeleton-loader');
  const emptyState = document.getElementById('feed-empty');
  
  if (skeleton) skeleton.style.display = 'block';
  isLoading = true;

  try {
    const posts = await fetchPosts({ filter: currentFilter });
    const user = await getCurrentUser();

    if (skeleton) skeleton.style.display = 'none';

    if (posts.length === 0) {
      postList.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';
    postList.innerHTML = '';

    posts.forEach((post, index) => {
      const bubble = createSpeechBubble(post, user.id);
      bubble.style.animationDelay = `${index * 0.08}s`;
      bubble.classList.add('animate-slideUp');
      postList.appendChild(bubble);
    });
  } catch (err) {
    console.error('Error loading posts:', err);
    if (skeleton) skeleton.style.display = 'none';
    postList.innerHTML = `
      <div class="feed-error">
        <span>failed to load kontros. try refreshing.</span>
      </div>
    `;
  } finally {
    isLoading = false;
  }
}

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toLowerCase()
    .slice(0, 2);
}
