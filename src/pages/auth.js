import { signUp, signIn } from '../utils/auth.js';
import { navigateTo } from '../router.js';

export async function renderAuthPage(app) {
  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-inner">
        <!-- Left: Branding -->
        <div class="auth-branding">
          <h1 class="auth-logo">k0.</h1>
          <p class="auth-tagline">leave your mark.</p>
        </div>

        <!-- Right: Auth Options -->
        <div class="auth-form-section" id="auth-form-section">
          <!-- Step 1: Choice buttons -->
          <div class="auth-choice" id="auth-choice">
            <button class="auth-choice-btn" id="btn-create">create account.</button>
            <button class="auth-choice-btn" id="btn-login">i have an account.</button>
          </div>

          <!-- Step 2: Create Account Form (hidden initially) -->
          <form class="auth-form auth-form--hidden" id="signup-form">
            <button type="button" class="auth-back-btn" id="back-create">← create account.</button>
            <input
              type="text"
              class="input-control"
              id="signup-username"
              placeholder="username."
              required
              pattern="[a-zA-Z0-9_]+"
              maxlength="20"
              autocomplete="username"
            />
            <div class="password-wrapper">
              <input
                type="password"
                class="input-control"
                id="signup-password"
                placeholder="password."
                required
                minlength="6"
                autocomplete="new-password"
              />
              <button type="button" class="show-pass-btn" data-target="signup-password">show.</button>
            </div>
            <div class="auth-error" id="signup-error"></div>
            <button type="submit" class="submit-btn" id="signup-btn">go.</button>
          </form>

          <!-- Step 3: Login Form (hidden initially) -->
          <form class="auth-form auth-form--hidden" id="login-form">
            <button type="button" class="auth-back-btn" id="back-login">← i have an account.</button>
            <input
              type="text"
              class="input-control"
              id="login-username"
              placeholder="username."
              required
              autocomplete="username"
            />
            <div class="password-wrapper">
              <input
                type="password"
                class="input-control"
                id="login-password"
                placeholder="password."
                required
                autocomplete="current-password"
              />
              <button type="button" class="show-pass-btn" data-target="login-password">show.</button>
            </div>
            <div class="auth-error" id="login-error"></div>
            <button type="submit" class="submit-btn" id="login-btn">go.</button>
          </form>
        </div>
      </div>
    </div>
  `;

  const authChoice = document.getElementById('auth-choice');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');

  // -- Choice buttons --
  document.getElementById('btn-create').addEventListener('click', () => {
    authChoice.classList.add('auth-choice--hidden');
    signupForm.classList.remove('auth-form--hidden');
  });

  document.getElementById('btn-login').addEventListener('click', () => {
    authChoice.classList.add('auth-choice--hidden');
    loginForm.classList.remove('auth-form--hidden');
  });

  // -- Back buttons --
  document.getElementById('back-create').addEventListener('click', () => {
    signupForm.classList.add('auth-form--hidden');
    authChoice.classList.remove('auth-choice--hidden');
    document.getElementById('signup-error').textContent = '';
    document.getElementById('signup-error').classList.remove('visible');
  });

  document.getElementById('back-login').addEventListener('click', () => {
    loginForm.classList.add('auth-form--hidden');
    authChoice.classList.remove('auth-choice--hidden');
    document.getElementById('login-error').textContent = '';
    document.getElementById('login-error').classList.remove('visible');
  });

  // -- Password show/hide --
  document.querySelectorAll('.show-pass-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'hide.';
      } else {
        input.type = 'password';
        btn.textContent = 'show.';
      }
    });
  });

  // -- Signup handler --
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const signupError = document.getElementById('signup-error');
    const signupBtn = document.getElementById('signup-btn');
    signupError.textContent = '';
    signupError.classList.remove('visible');
    signupBtn.disabled = true;
    signupBtn.innerHTML = '<span class="spinner"></span>';

    try {
      const username = document.getElementById('signup-username').value.trim();
      await signUp({
        username,
        password: document.getElementById('signup-password').value,
        displayName: username,
      });
      navigateTo('/paint');
    } catch (err) {
      signupError.textContent = err.message;
      signupError.classList.add('visible');
    } finally {
      signupBtn.disabled = false;
      signupBtn.innerHTML = 'go.';
    }
  });

  // -- Login handler --
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
      navigateTo('/paint');
    } catch (err) {
      loginError.textContent = err.message;
      loginError.classList.add('visible');
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = 'go.';
    }
  });
}
