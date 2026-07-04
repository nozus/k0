
import { supabase } from './supabase.js';
import { registerRoute, initRouter, navigateTo } from './router.js';
import { renderAuthPage } from './pages/auth.js';
import { renderExplorePage } from './pages/explore.js';
import { renderItemPage } from './pages/item.js';
import { renderCreatePage } from './pages/create.js';
import { renderProfilePage } from './pages/profile.js';

// Register routes
registerRoute('/auth', renderAuthPage);
registerRoute('/explore', renderExplorePage);
registerRoute('/item/:id', renderItemPage);
registerRoute('/create', renderCreatePage);
registerRoute('/profile', renderProfilePage);
registerRoute('/profile/:id', renderProfilePage);
registerRoute('/', async (app) => {
  // Check auth state and redirect
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    navigateTo('/explore');
  } else {
    navigateTo('/auth');
  }
});

// Initialize router
initRouter();
