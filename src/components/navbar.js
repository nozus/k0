/**
 * navbar.js — Mobile top navigation bar for k0
 * Displays brand logo and hamburger toggle (mobile only).
 */

/**
 * Renders the top navbar HTML (visible on mobile screens).
 * @returns {string} HTML string for the navbar
 */
export function renderNavbar() {
  return `
    <nav class="navbar" id="navbar">
      <a href="#/feed" class="navbar-brand">
        <span class="navbar-brand-text">k0</span>
      </a>
      <button
        class="navbar-toggle"
        id="navbar-toggle"
        aria-label="Toggle sidebar menu"
        aria-expanded="false"
      >
        <span class="navbar-toggle-bar"></span>
        <span class="navbar-toggle-bar"></span>
        <span class="navbar-toggle-bar"></span>
      </button>
    </nav>
  `;
}
