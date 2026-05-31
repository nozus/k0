import { signUp, signIn } from '../utils/auth.js';
import { navigateTo } from '../router.js';

export async function renderAuthPage(app) {
  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-inner">
        <!-- Left: Branding -->
        <div class="auth-branding">
          <h1 class="auth-logo">k0.</h1>
          <p class="auth-tagline">speak your mind.</p>
        </div>

        <!-- Right: Forms -->
        <div class="auth-form-section">
          <!-- Segmented Control -->
          <div class="auth-segmented">
            <input type="radio" name="auth-mode" id="mode-login" checked>
            <label for="mode-login" class="auth-segment-label">login</label>
            <input type="radio" name="auth-mode" id="mode-signup">
            <label for="mode-signup" class="auth-segment-label">create kard</label>
          </div>

          <!-- Login Form -->
          <form class="auth-form" id="login-form">
            <input
              type="text"
              class="input-control"
              id="login-username"
              placeholder="username"
              required
              autocomplete="username"
            />
            <div class="password-wrapper">
              <input
                type="password"
                class="input-control"
                id="login-password"
                placeholder="password"
                required
                autocomplete="current-password"
              />
              <button type="button" class="show-pass-btn" data-target="login-password">show</button>
            </div>
            <div class="auth-error" id="login-error"></div>
            <button type="submit" class="submit-btn" id="login-btn">enter k0</button>
          </form>

          <!-- Signup Form -->
          <form class="auth-form auth-form--hidden" id="signup-form">
            <input
              type="text"
              class="input-control"
              id="signup-username"
              placeholder="username"
              required
              pattern="[a-zA-Z0-9_]+"
              maxlength="20"
            />
            <input
              type="text"
              class="input-control"
              id="signup-displayname"
              placeholder="display name"
              required
              maxlength="30"
            />
            <div class="password-wrapper">
              <input
                type="password"
                class="input-control"
                id="signup-password"
                placeholder="password (min 6 chars)"
                required
                minlength="6"
                autocomplete="new-password"
              />
              <button type="button" class="show-pass-btn" data-target="signup-password">show</button>
            </div>
            <div class="auth-error" id="signup-error"></div>
            <button type="submit" class="submit-btn" id="signup-btn">create my kard</button>
          </form>
        </div>
      </div>
    </div>
  `;

  // Segmented control - toggle forms
  const modeLogin = document.getElementById('mode-login');
  const modeSignup = document.getElementById('mode-signup');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  modeLogin.addEventListener('change', () => {
    loginForm.classList.remove('auth-form--hidden');
    signupForm.classList.add('auth-form--hidden');
  });

  modeSignup.addEventListener('change', () => {
    signupForm.classList.remove('auth-form--hidden');
    loginForm.classList.add('auth-form--hidden');
  });

  // Password show/hide toggles
  document.querySelectorAll('.show-pass-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'hide';
      } else {
        input.type = 'password';
        btn.textContent = 'show';
      }
    });
  });

  // Login handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const loginError = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');
    loginError.textContent = '';
    loginError.classList.remove('visible');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner"></span>';

    try {
      await signIn({
        username: document.getElementById('login-username').value.trim(),
        password: document.getElementById('login-password').value,
      });
      navigateTo('/feed');
    } catch (err) {
      loginError.textContent = err.message;
      loginError.classList.add('visible');
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = 'enter k0';
    }
  });

  // Signup handler
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const signupError = document.getElementById('signup-error');
    const signupBtn = document.getElementById('signup-btn');
    signupError.textContent = '';
    signupError.classList.remove('visible');
    signupBtn.disabled = true;
    signupBtn.innerHTML = '<span class="spinner"></span>';

    try {
      await signUp({
        username: document.getElementById('signup-username').value.trim(),
        password: document.getElementById('signup-password').value,
        displayName: document.getElementById('signup-displayname').value.trim(),
        avatarFile: null,
      });
      navigateTo('/feed');
    } catch (err) {
      signupError.textContent = err.message;
      signupError.classList.add('visible');
    } finally {
      signupBtn.disabled = false;
      signupBtn.innerHTML = 'create my kard';
    }
  });
}
