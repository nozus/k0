
import { supabase } from './supabase.js';
import { registerRoute, initRouter, navigateTo } from './router.js';
import { renderAuthPage } from './pages/auth.js';
import { renderFeedPage } from './pages/feed.js';
import { renderProfilePage } from './pages/profile.js';

// Register routes
registerRoute('/auth', renderAuthPage);
registerRoute('/feed', renderFeedPage);
registerRoute('/profile', renderProfilePage);
registerRoute('/profile/:id', renderProfilePage);
registerRoute('/', async (app) => {
  // Check auth state and redirect
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    navigateTo('/feed');
  } else {
    navigateTo('/auth');
  }
});

// Initialize router
initRouter();
