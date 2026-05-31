/**
 * sidebar.js — Sidebar navigation for k0
 * Brand area, nav links with active state, and logged-in user mini kard.
 */

import { supabase } from '../supabase.js';

/**
 * Renders the sidebar HTML.
 * @param {string} currentPage - The active page identifier ('feed' | 'profile')
 * @returns {string} HTML string for the sidebar
 */
export function renderSidebar(currentPage = 'feed') {
  const navLinks = [
    { id: 'feed',     label: 'Kontros',  icon: '🔥', href: '#/feed',     disabled: false },
    { id: 'profile',  label: 'My Kard',  icon: '💳', href: '#/profile',  disabled: false },
    { id: 'trending', label: 'Trending', icon: '📈', href: '#/trending', disabled: true  },
  ];

  const linksHtml = navLinks
    .map((link) => {
      const activeClass = link.id === currentPage ? ' sidebar-link--active' : '';
      const disabledAttr = link.disabled ? ' aria-disabled="true" tabindex="-1"' : '';
      const disabledClass = link.disabled ? ' sidebar-link--disabled' : '';

      return `
        <a
          href="${link.disabled ? 'javascript:void(0)' : link.href}"
          class="sidebar-link${activeClass}${disabledClass}"
          data-page="${link.id}"
          ${disabledAttr}
        >
          <span class="sidebar-link-icon">${link.icon}</span>
          <span class="sidebar-link-label">${link.label}</span>
        </a>
      `;
    })
    .join('');

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-inner">
        <!-- Brand -->
        <div class="sidebar-brand">
          <a href="#/feed" class="sidebar-logo">k0</a>
          <span class="sidebar-tagline">speak your mind</span>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          ${linksHtml}
        </nav>

        <!-- Logged-in user mini kard -->
        <div class="sidebar-user" id="sidebar-user"></div>
      </div>

      <!-- Mobile overlay backdrop -->
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
    </aside>
  `;
}

/**
 * Populates the sidebar-user section with the current user's info.
 * @private
 */
async function loadCurrentUser() {
  const container = document.getElementById('sidebar-user');
  if (!container) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      container.innerHTML = `<a href="#/login" class="sidebar-login-link">Sign In</a>`;
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    const avatarHtml = profile.avatar_url
      ? `<img class="sidebar-user-avatar" src="${profile.avatar_url}" alt="${profile.username}" />`
      : `<div class="sidebar-user-avatar sidebar-user-avatar--initials">${getInitials(profile.display_name || profile.username)}</div>`;

    container.innerHTML = `
      <a href="#/profile" class="sidebar-user-card">
        ${avatarHtml}
        <div class="sidebar-user-info">
          <span class="sidebar-user-name">${escapeHtml(profile.display_name || profile.username)}</span>
          <span class="sidebar-user-handle">@${escapeHtml(profile.username)}</span>
        </div>
      </a>
    `;
  } catch (err) {
    console.error('[sidebar] Failed to load current user:', err);
  }
}

/**
 * Returns uppercase initials from a name string (max 2 chars).
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
 * Basic HTML-entity escaping for untrusted strings.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

/**
 * Initialises sidebar interactivity (mobile toggle, overlay dismiss).
 * Call once after the sidebar HTML has been inserted into the DOM.
 */
export function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('navbar-toggle');
  const overlay = document.getElementById('sidebar-overlay');

  if (!sidebar || !toggle) return;

  const openSidebar = () => {
    sidebar.classList.add('sidebar--open');
    toggle.classList.add('navbar-toggle--active');
    toggle.setAttribute('aria-expanded', 'true');
  };

  const closeSidebar = () => {
    sidebar.classList.remove('sidebar--open');
    toggle.classList.remove('navbar-toggle--active');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const toggleSidebar = () => {
    sidebar.classList.contains('sidebar--open') ? closeSidebar() : openSidebar();
  };

  // Hamburger toggle
  toggle.addEventListener('click', toggleSidebar);

  // Close when clicking the overlay backdrop
  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar on nav link click (mobile)
  sidebar.addEventListener('click', (e) => {
    const link = e.target.closest('.sidebar-link');
    if (link && !link.classList.contains('sidebar-link--disabled')) {
      closeSidebar();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Load the logged-in user's mini kard
  loadCurrentUser();
}
