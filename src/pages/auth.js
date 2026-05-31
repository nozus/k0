import { signUp, signIn } from '../utils/auth.js';
import { createKard } from '../components/kard.js';
import { navigateTo } from '../router.js';

export async function renderAuthPage(app) {
  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-background">
        <div class="auth-shape auth-shape--1"></div>
        <div class="auth-shape auth-shape--2"></div>
        <div class="auth-shape auth-shape--3"></div>
        <div class="auth-shape auth-shape--4"></div>
        <div class="auth-shape auth-shape--5"></div>
      </div>

      <div class="auth-content">
        <div class="auth-card glass">
          <div class="auth-brand">
            <h1 class="auth-logo gradient-text">k0</h1>
            <p class="auth-tagline">speak your mind</p>
          </div>

          <div class="auth-tabs">
            <button class="auth-tab auth-tab--active" data-tab="login" id="login-tab">Login</button>
            <button class="auth-tab" data-tab="signup" id="signup-tab">Create Kard</button>
          </div>

          <!-- Login Form -->
          <form class="auth-form" id="login-form">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input type="email" id="login-email" placeholder="you@example.com" required autocomplete="email" />
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input type="password" id="login-password" placeholder="••••••••" required autocomplete="current-password" />
            </div>
            <div class="form-error" id="login-error"></div>
            <button type="submit" class="btn-primary auth-submit" id="login-btn">
              <span>Enter k0</span>
            </button>
          </form>

          <!-- Signup Form -->
          <form class="auth-form auth-form--hidden" id="signup-form">
            <div class="form-group">
              <label for="signup-email">Email</label>
              <input type="email" id="signup-email" placeholder="you@example.com" required autocomplete="email" />
            </div>
            <div class="form-group">
              <label for="signup-password">Password</label>
              <input type="password" id="signup-password" placeholder="Min 6 characters" required minlength="6" autocomplete="new-password" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="signup-username">Username</label>
                <input type="text" id="signup-username" placeholder="@handle" required pattern="[a-zA-Z0-9_]+" maxlength="20" />
              </div>
              <div class="form-group">
                <label for="signup-displayname">Display Name</label>
                <input type="text" id="signup-displayname" placeholder="Your name" required maxlength="30" />
              </div>
            </div>
            <div class="form-group">
              <label for="signup-avatar">Profile Photo</label>
              <div class="avatar-upload" id="avatar-upload-area">
                <input type="file" id="signup-avatar" accept="image/*" hidden />
                <div class="avatar-upload-placeholder" id="avatar-placeholder">
                  <span class="avatar-upload-icon">📷</span>
                  <span class="avatar-upload-text">Click to upload</span>
                </div>
                <img class="avatar-upload-preview" id="avatar-preview" src="" alt="Preview" style="display:none" />
              </div>
            </div>
            <div class="form-error" id="signup-error"></div>
            <button type="submit" class="btn-primary auth-submit" id="signup-btn">
              <span>Create My Kard</span>
            </button>
          </form>
        </div>

        <!-- Live Kard Preview (signup only) -->
        <div class="auth-preview" id="kard-preview-area" style="display:none">
          <h3 class="auth-preview-title">Your Kard Preview</h3>
          <div id="kard-preview-container">
            ${createKard({
              username: 'username',
              display_name: 'Your Name',
              avatar_url: null,
              karma_score: 0,
              created_at: new Date().toISOString(),
            }, 'normal')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Tab switching
  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const previewArea = document.getElementById('kard-preview-area');

  loginTab.addEventListener('click', () => {
    loginTab.classList.add('auth-tab--active');
    signupTab.classList.remove('auth-tab--active');
    loginForm.classList.remove('auth-form--hidden');
    signupForm.classList.add('auth-form--hidden');
    previewArea.style.display = 'none';
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('auth-tab--active');
    loginTab.classList.remove('auth-tab--active');
    signupForm.classList.remove('auth-form--hidden');
    loginForm.classList.add('auth-form--hidden');
    previewArea.style.display = 'block';
  });

  // Avatar upload
  const avatarUploadArea = document.getElementById('avatar-upload-area');
  const avatarInput = document.getElementById('signup-avatar');
  const avatarPreview = document.getElementById('avatar-preview');
  const avatarPlaceholder = document.getElementById('avatar-placeholder');
  let selectedAvatarFile = null;

  avatarUploadArea.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedAvatarFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        avatarPreview.src = ev.target.result;
        avatarPreview.style.display = 'block';
        avatarPlaceholder.style.display = 'none';
        updateKardPreview();
      };
      reader.readAsDataURL(file);
    }
  });

  // Live preview update
  const usernameInput = document.getElementById('signup-username');
  const displayNameInput = document.getElementById('signup-displayname');
  const previewContainer = document.getElementById('kard-preview-container');

  function updateKardPreview() {
    previewContainer.innerHTML = createKard({
      username: usernameInput.value || 'username',
      display_name: displayNameInput.value || 'Your Name',
      avatar_url: avatarPreview.style.display !== 'none' ? avatarPreview.src : null,
      karma_score: 0,
      created_at: new Date().toISOString(),
    }, 'normal');
  }

  usernameInput.addEventListener('input', updateKardPreview);
  displayNameInput.addEventListener('input', updateKardPreview);

  // Login handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const loginError = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');
    loginError.textContent = '';
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner"></span>';

    try {
      await signIn({
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
      });
      navigateTo('/feed');
    } catch (err) {
      loginError.textContent = err.message;
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<span>Enter k0</span>';
    }
  });

  // Signup handler
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const signupError = document.getElementById('signup-error');
    const signupBtn = document.getElementById('signup-btn');
    signupError.textContent = '';
    signupBtn.disabled = true;
    signupBtn.innerHTML = '<span class="spinner"></span>';

    try {
      await signUp({
        email: document.getElementById('signup-email').value,
        password: document.getElementById('signup-password').value,
        username: document.getElementById('signup-username').value,
        displayName: document.getElementById('signup-displayname').value,
        avatarFile: selectedAvatarFile,
      });
      navigateTo('/feed');
    } catch (err) {
      signupError.textContent = err.message;
    } finally {
      signupBtn.disabled = false;
      signupBtn.innerHTML = '<span>Create My Kard</span>';
    }
  });
}
