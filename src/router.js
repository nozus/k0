/**
 * Simple hash-based SPA router for k0
 */

const routes = {};
let currentCleanup = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigateTo(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  const hash = window.location.hash.slice(1) || '/';
  return hash;
}

export function getRouteParams() {
  const hash = getCurrentRoute();
  const parts = hash.split('/').filter(Boolean);
  return parts;
}

async function handleRouteChange() {
  const path = getCurrentRoute();
  
  // Clean up previous page
  if (currentCleanup && typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  // Find matching route
  let handler = routes[path];
  
  // Try matching parameterized routes like /profile/:id
  if (!handler) {
    for (const [routePath, routeHandler] of Object.entries(routes)) {
      if (routePath.includes(':')) {
        const routeParts = routePath.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);
        
        if (routeParts.length === pathParts.length) {
          const params = {};
          let match = true;
          
          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
              params[routeParts[i].slice(1)] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
              match = false;
              break;
            }
          }
          
          if (match) {
            handler = (app) => routeHandler(app, params);
            break;
          }
        }
      }
    }
  }
  
  // Default to feed or auth
  if (!handler) {
    handler = routes['/'] || routes['/auth'];
  }

  if (handler) {
    const app = document.getElementById('app');
    const cleanup = await handler(app);
    if (cleanup && typeof cleanup === 'function') {
      currentCleanup = cleanup;
    }
  }
}

export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  // Handle initial load
  handleRouteChange();
}
