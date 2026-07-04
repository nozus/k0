import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { createItem } from '../utils/items.js';
import { getCurrentUser } from '../utils/auth.js';
import { CATEGORIES } from '../utils/constants.js';
import { navigateTo } from '../router.js';

export async function renderCreatePage(app) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.hash = '/auth';
    return;
  }

  const categoryOptions = CATEGORIES
    .filter(c => c.id !== 'all')
    .map(c => `<button type="button" class="category-pill" data-category="${c.id}">${c.label}</button>`)
    .join('');

  app.innerHTML = `
    ${renderNavbar()}
    <div class="feed-layout">
      ${renderSidebar('create')}
      <main class="feed-main create-main">
        <div class="feed-header">
          <h1 class="feed-title">create.</h1>
          <p class="explore-subtitle">add anything for the world to rate.</p>
        </div>

        <form class="create-form" id="create-form">
          <div class="create-field">
            <label class="create-label" for="create-title">what is it?</label>
            <input
              type="text"
              class="input-control"
              id="create-title"
              placeholder="name it..."
              required
              maxlength="100"
            />
          </div>

          <div class="create-field">
            <label class="create-label">pick a category.</label>
            <div class="category-scroll create-categories" id="create-categories">
              ${categoryOptions}
            </div>
            <input type="hidden" id="create-category" value="" />
          </div>

          <div class="create-field">
            <label class="create-label" for="create-description">describe it. (optional)</label>
            <textarea
              class="compose-input create-textarea"
              id="create-description"
              placeholder="tell people what this is..."
              maxlength="500"
              rows="3"
            ></textarea>
            <span class="compose-counter" id="create-counter">0/500</span>
          </div>

          <div class="auth-error" id="create-error"></div>

          <button type="submit" class="submit-btn create-submit" id="create-submit" disabled>
            publish.
          </button>
        </form>
      </main>
    </div>
  `;

  initSidebar();

  let selectedCategory = '';

  // Category selection
  document.querySelectorAll('#create-categories .category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#create-categories .category-pill').forEach(p => p.classList.remove('category-pill--active'));
      pill.classList.add('category-pill--active');
      selectedCategory = pill.dataset.category;
      document.getElementById('create-category').value = selectedCategory;
      validateForm();
    });
  });

  // Title validation
  const titleInput = document.getElementById('create-title');
  titleInput.addEventListener('input', validateForm);

  // Description counter
  const descInput = document.getElementById('create-description');
  const descCounter = document.getElementById('create-counter');
  descInput.addEventListener('input', () => {
    descInput.style.height = 'auto';
    descInput.style.height = descInput.scrollHeight + 'px';
    const len = descInput.value.length;
    descCounter.textContent = `${len}/500`;
    if (len > 450) {
      descCounter.classList.add('compose-counter--warn');
    } else {
      descCounter.classList.remove('compose-counter--warn');
    }
  });

  function validateForm() {
    const submitBtn = document.getElementById('create-submit');
    const hasTitle = titleInput.value.trim().length > 0;
    const hasCategory = selectedCategory.length > 0;
    submitBtn.disabled = !(hasTitle && hasCategory);
  }

  // Submit
  const form = document.getElementById('create-form');
  const submitBtn = document.getElementById('create-submit');
  const errorEl = document.getElementById('create-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    errorEl.classList.remove('visible');

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const category = selectedCategory;

    if (!title || !category) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>';

    try {
      const newItem = await createItem({ title, description, category });
      navigateTo(`/item/${newItem.id}`);
    } catch (err) {
      console.error('Error creating item:', err);
      errorEl.textContent = err.message || 'failed to create item.';
      errorEl.classList.add('visible');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'publish.';
    }
  });
}
