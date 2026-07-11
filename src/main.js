
import { supabase } from './supabase.js';
import { registerRoute, initRouter, navigateTo } from './router.js';
import { renderAuthPage } from './pages/auth.js';
import { renderPaintPage } from './pages/paint.js';

// Register routes
registerRoute('/auth', renderAuthPage);
registerRoute('/paint', renderPaintPage);
registerRoute('/', async (app) => {
  // Check auth state and redirect
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    navigateTo('/paint');
  } else {
    navigateTo('/auth');
  }
});

// Initialize router
initRouter();
