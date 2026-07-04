/**
 * sidebar.js — Sidebar navigation for k0
 * Nozus-style: clean large text links, user info at bottom.
 */

import { supabase } from '../supabase.js';

/**
 * Renders the sidebar HTML.
 * @param {string} currentPage - The active page identifier
 * @returns {string} HTML string for the sidebar
 */
export function renderSidebar(currentPage = 'explore') {
  const navLinks = [
    { id: 'explore', label: 'explore.',  href: '#/explore', disabled: false },
    { id: 'create',  label: 'create.',   href: '#/create',  disabled: false },
    { id: 'profile', label: 'profile.',  href: '#/profile', disabled: false },
  ];

  const linksHtml = navLinks
    .map((link) => {
      const activeClass = link.id === currentPage ? ' sidebar-link--active' : '';
      const disabledClass = link.disabled ? ' sidebar-link--disabled' : '';

      return `
        <a
          href="${link.disabled ? 'javascript:void(0)' : link.href}"
          class="sidebar-link${activeClass}${disabledClass}"
          data-page="${link.id}"
          ${link.disabled ? 'aria-disabled="true" tabindex="-1"' : ''}
        >${link.label}</a>
      `;
    })
    .join('');

  return `
    <aside class="sidebar" id="sidebar">
      <!-- Logo -->
      <a href="#/explore" class="sidebar-logo">k0.</a>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        ${linksHtml}
      </nav>

      <!-- User Info -->
      <div class="sidebar-user" id="sidebar-user"></div>

      <!-- Mobile overlay -->
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
    </aside>
  `;
}

/**
 * Populates the sidebar-user section with the current user's info.
 */
async function loadCurrentUser() {
  const container = document.getElementById('sidebar-user');
  if (!container) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      container.innerHTML = `<a href="#/auth" class="sidebar-link">sign in.</a>`;
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    container.innerHTML = `
      <span class="sidebar-user-name">${escapeHtml(profile.display_name || profile.username)}</span>
      <span class="sidebar-user-handle">@${escapeHtml(profile.username)}</span>
      <button class="sidebar-logout" id="sidebar-logout">sign out.</button>
    `;

    // Sign out handler
    const logoutBtn = document.getElementById('sidebar-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.hash = '/auth';
        window.location.reload();
      });
    }
  } catch (err) {
    console.error('[sidebar] Failed to load current user:', err);
  }
}

/**
 * Basic HTML-entity escaping for untrusted strings.
 */
function escapeHtml(str) {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

/**
 * Initialises sidebar interactivity.
 */
export function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('navbar-toggle');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggle && sidebar) {
    const openSidebar = () => {
      sidebar.classList.add('sidebar--open');
      toggle.setAttribute('aria-expanded', 'true');
    };

    const closeSidebar = () => {
      sidebar.classList.remove('sidebar--open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      sidebar.classList.contains('sidebar--open') ? closeSidebar() : openSidebar();
    });

    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    sidebar.addEventListener('click', (e) => {
      const link = e.target.closest('.sidebar-link');
      if (link && !link.classList.contains('sidebar-link--disabled')) {
        closeSidebar();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebar();
    });
  }

  // Load user info
  loadCurrentUser();
}
