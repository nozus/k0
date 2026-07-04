import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { createStarDisplay, createStarInput, createRatingSummary } from '../components/star-rating.js';
import { createReviewCard } from '../components/review-card.js';
import { fetchItemById } from '../utils/items.js';
import { fetchReviewsForItem, getUserReviewForItem, createReview, updateReview } from '../utils/reviews.js';
import { getCurrentUser } from '../utils/auth.js';
import { CATEGORY_HUES } from '../utils/constants.js';

export async function renderItemPage(app, params = {}) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.hash = '/auth';
    return;
  }

  const itemId = params?.id;
  if (!itemId) {
    window.location.hash = '/explore';
    return;
  }

  const item = await fetchItemById(itemId);
  if (!item) {
    app.innerHTML = `
      <div class="profile-error">
        <h2>item not found.</h2>
        <p>this item doesn't exist or has been removed.</p>
        <a href="#/explore" class="submit-btn" style="display:inline-block;max-width:200px;text-align:center">back to explore</a>
      </div>
    `;
    return;
  }

  const reviews = await fetchReviewsForItem(itemId);
  const existingReview = await getUserReviewForItem(itemId);

  const hue = CATEGORY_HUES[item.category] ?? 0;
  const gradientBg = `linear-gradient(135deg, hsl(${hue}, 30%, 92%), hsl(${(hue + 30) % 360}, 25%, 88%))`;

  app.innerHTML = `
    ${renderNavbar()}
    <div class="feed-layout">
      ${renderSidebar('explore')}
      <main class="feed-main item-detail-main">
        <a href="#/explore" class="item-back-link">← explore</a>

        <div class="item-hero">
          <div class="item-hero-image" id="item-hero-image">
            <div class="item-hero-placeholder" style="background:${gradientBg}">
              <span>${escapeHtml(item.category)}</span>
            </div>
          </div>
          <div class="item-hero-info">
            <span class="item-card-badge">${escapeHtml(item.category)}</span>
            <h1 class="item-hero-title">${escapeHtml(item.title)}</h1>
            ${item.description ? `<p class="item-hero-desc">${escapeHtml(item.description)}</p>` : ''}
            <span class="item-hero-creator">added by <a href="#/profile/${escapeHtml(item.profiles.username)}">@${escapeHtml(item.profiles.username)}</a></span>
          </div>
        </div>

        <div class="item-rating-summary" id="item-rating-summary"></div>

        <div class="item-review-form-section">
          <h2 class="section-title">${existingReview ? 'update your review.' : 'write a review.'}</h2>
          <form class="review-form" id="review-form">
            <div class="review-form-stars" id="review-form-stars"></div>
            <textarea
              class="compose-input review-textarea"
              id="review-content"
              placeholder="what do you think..."
              maxlength="500"
              rows="3"
            >${existingReview?.content || ''}</textarea>
            <div class="compose-footer">
              <span class="compose-counter" id="review-counter">${(existingReview?.content || '').length}/500</span>
              <button type="submit" class="compose-submit" id="review-submit">
                ${existingReview ? 'update.' : 'submit.'}
              </button>
            </div>
          </form>
        </div>

        <div class="item-reviews-section">
          <h2 class="section-title">reviews. <span class="section-count">(${reviews.length})</span></h2>
          <div class="review-list" id="review-list"></div>
          <div class="feed-empty" id="reviews-empty" style="display:${reviews.length === 0 ? 'flex' : 'none'}">
            <h3>no reviews yet.</h3>
            <p>be the first to share your thoughts.</p>
          </div>
        </div>
      </main>
    </div>
  `;

  initSidebar();

  // Rating summary
  const summaryContainer = document.getElementById('item-rating-summary');
  const summary = createRatingSummary(parseFloat(item.avg_rating) || 0, item.review_count || 0);
  summaryContainer.appendChild(summary);

  // Star input
  const starContainer = document.getElementById('review-form-stars');
  const starInput = createStarInput(existingReview?.rating || 0);
  starContainer.appendChild(starInput);

  // Review content counter
  const reviewContentEl = document.getElementById('review-content');
  const reviewCounter = document.getElementById('review-counter');
  reviewContentEl.addEventListener('input', () => {
    reviewContentEl.style.height = 'auto';
    reviewContentEl.style.height = reviewContentEl.scrollHeight + 'px';
    const len = reviewContentEl.value.length;
    reviewCounter.textContent = `${len}/500`;
    if (len > 450) {
      reviewCounter.classList.add('compose-counter--warn');
    } else {
      reviewCounter.classList.remove('compose-counter--warn');
    }
  });

  // Submit review
  const reviewForm = document.getElementById('review-form');
  const reviewSubmit = document.getElementById('review-submit');
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rating = starInput.getValue();
    if (rating === 0) {
      alert('please select a rating.');
      return;
    }

    const content = reviewContentEl.value.trim();
    reviewSubmit.disabled = true;
    reviewSubmit.innerHTML = '<span class="spinner"></span>';

    try {
      if (existingReview) {
        await updateReview(existingReview.id, { rating, content, item_id: itemId });
      } else {
        await createReview({ item_id: itemId, rating, content });
      }
      // Reload page to show updated review
      window.location.reload();
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(err.message || 'failed to submit review.');
    } finally {
      reviewSubmit.disabled = false;
      reviewSubmit.innerHTML = existingReview ? 'update.' : 'submit.';
    }
  });

  // Render reviews
  if (reviews.length > 0) {
    const reviewList = document.getElementById('review-list');
    reviews.forEach((review, index) => {
      const card = createReviewCard(review, user.id);
      card.style.animationDelay = `${index * 0.06}s`;
      card.classList.add('animate-slideUp');
      reviewList.appendChild(card);
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}
