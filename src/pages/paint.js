/**
 * k0 Paint Page
 * 
 * Full-screen paint canvas with floating toolbar, profile & settings modals.
 */

import { PaintEngine } from '../paint/paint-engine.js';
import { Toolbar } from '../paint/toolbar.js';
import { openProfileModal, openSettingsModal } from '../paint/modals.js';
import { signOut } from '../utils/auth.js';
import { navigateTo } from '../router.js';

export async function renderPaintPage(app) {
  app.innerHTML = `
    <div class="paint-page" id="paint-page">
      <canvas class="paint-canvas" id="paint-canvas"></canvas>
      <div class="paint-toolbar-container" id="paint-toolbar-container"></div>
      <div class="paint-watermark">k0.</div>
    </div>
  `;

  const canvas = document.getElementById('paint-canvas');
  const toolbarContainer = document.getElementById('paint-toolbar-container');

  // Initialize paint engine
  const engine = new PaintEngine(canvas);

  // Initialize toolbar
  const toolbar = new Toolbar(toolbarContainer, engine);

  // Profile handler
  toolbar.onProfileClick(() => openProfileModal());

  // Settings handler
  toolbar.onSettingsClick(() => openSettingsModal(engine));

  // Sign out handler
  toolbar.onSignOut(async () => {
    try {
      await signOut();
      navigateTo('/auth');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  });

  // Cleanup function for router
  return () => {
    engine.destroy();
    toolbar.destroy();
  };
}
