import { supabase } from '../supabase.js';
import { updateItemStats } from './items.js';

/**
 * Fetch all reviews for an item, with joined profile data.
 */
export async function fetchReviewsForItem(itemId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  return data || [];
}

/**
 * Fetch all reviews by a specific user.
 */
export async function fetchUserReviews(userId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      items (
        id,
        title,
        category,
        image_url
      ),
      profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user reviews:', error);
    return [];
  }
  return data || [];
}

/**
 * Get the current user's review for a specific item (if exists).
 */
export async function getUserReviewForItem(itemId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .eq('item_id', itemId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Create a new review for an item.
 */
export async function createReview({ item_id, rating, content }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      item_id,
      rating,
      content: content || '',
    })
    .select(`
      *,
      profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;

  // Update item stats
  await updateItemStats(item_id);

  // Increment user's reviews_count
  supabase
    .from('profiles')
    .select('reviews_count')
    .eq('id', user.id)
    .single()
    .then(({ data: profile }) => {
      if (profile) {
        supabase
          .from('profiles')
          .update({ reviews_count: (profile.reviews_count || 0) + 1 })
          .eq('id', user.id)
          .then(() => {});
      }
    });

  return data;
}

/**
 * Update an existing review.
 */
export async function updateReview(reviewId, { rating, content, item_id }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updates = {};
  if (rating !== undefined) updates.rating = rating;
  if (content !== undefined) updates.content = content;

  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .select(`
      *,
      profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;

  // Update item stats if rating changed
  if (item_id && rating !== undefined) {
    await updateItemStats(item_id);
  }

  return data;
}
