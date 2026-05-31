import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { createSpeechBubble } from '../components/speech-bubble.js';
import { fetchPosts, createPost } from '../utils/posts.js';
import { getCurrentUser, getCurrentProfile } from '../utils/auth.js';

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
      ${renderSidebar('kontros')}
      <main class="feed-main">
        <div class="feed-header">
          <h1 class="feed-title">
            <span class="gradient-text">Kontros</span>
          </h1>
          <div class="feed-filters">
            <button class="filter-btn filter-btn--active" data-filter="newest" id="filter-newest">🕐 Newest</button>
            <button class="filter-btn" data-filter="controversial" id="filter-controversial">🔥 Kontroversial</button>
            <button class="filter-btn" data-filter="trending" id="filter-trending">📈 Trending</button>
          </div>
        </div>

        <div class="compose-box glass" id="compose-box">
          <div class="compose-avatar">
            ${currentUserProfile?.avatar_url
              ? `<img src="${currentUserProfile.avatar_url}" alt="You" class="compose-avatar-img" />`
              : `<div class="compose-avatar-initials">${getInitials(currentUserProfile?.display_name || 'U')}</div>`
            }
          </div>
          <form class="compose-form" id="compose-form">
            <textarea 
              class="compose-input" 
              id="compose-input" 
              placeholder="Drop a kontro... 🔥" 
              maxlength="500"
              rows="1"
            ></textarea>
            <div class="compose-footer">
              <span class="compose-counter" id="compose-counter">0/500</span>
              <button type="submit" class="btn-primary compose-submit" id="compose-submit" disabled>
                Post
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
          <span class="feed-empty-icon">🌊</span>
          <h3>No kontros yet</h3>
          <p>Be the first to drop something kontroversial</p>
        </div>
      </main>
    </div>
  `;

  initSidebar();
  initCompose();
  await loadPosts();

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      currentFilter = btn.dataset.filter;
      await loadPosts();
    });
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
      submitBtn.innerHTML = 'Post';
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
      <div class="feed-error glass">
        <span>⚠️ Failed to load kontros. Try refreshing.</span>
      </div>
    `;
  } finally {
    isLoading = false;
  }
}

function getInitials(name) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
