import { signUp } from '../utils/auth.js';
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
          <!-- Signup Form -->
          <form class="auth-form" id="signup-form">
            <h2>create kard.</h2>
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
            
            <!-- Hidden avatar input & visible trigger button -->
            <input type="file" id="signup-avatar" accept="image/*" style="display:none;" />
            <button type="button" class="btn-ghost upload-avatar-btn" id="upload-avatar-btn">add profile picture</button>
            
            <div class="auth-error" id="signup-error"></div>
            <button type="submit" class="submit-btn" id="signup-btn">create my kard</button>
          </form>
        </div>
      </div>
    </div>
  `;

  const signupForm = document.getElementById('signup-form');
  
  // Password show/hide
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

  // Avatar upload (no preview)
  const avatarInput = document.getElementById('signup-avatar');
  const uploadBtn = document.getElementById('upload-avatar-btn');
  let selectedAvatarFile = null;

  uploadBtn.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedAvatarFile = file;
      uploadBtn.textContent = 'picture added ✓';
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
        avatarFile: selectedAvatarFile,
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
