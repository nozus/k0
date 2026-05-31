import { supabase } from '../supabase.js';

/**
 * Fetch posts for the feed
 */
export async function fetchPosts({ filter = 'newest', limit = 20, offset = 0 } = {}) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('is_deleted', false)
    .range(offset, offset + limit - 1);

  switch (filter) {
    case 'controversial':
      // Most votes but lowest net rating
      query = query.order('rating_count', { ascending: false });
      break;
    case 'trending':
      // Most votes recently
      query = query
        .order('rating_count', { ascending: false })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  return data || [];
}

/**
 * Create a new post (kontro)
 */
export async function createPost(content) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content,
      rating_sum: 0,
      rating_count: 0,
      is_deleted: false,
    })
    .select(`
      *,
      profiles:user_id (
        username,
        display_name,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Rate a post (upvote or downvote)
 * @param {string} postId 
 * @param {number} value - 1 for upvote, -1 for downvote
 */
export async function ratePost(postId, value) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user already rated this post
  const { data: existing } = await supabase
    .from('ratings')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    if (existing.value === value) {
      // Same vote — remove it (toggle off)
      await supabase.from('ratings').delete().eq('id', existing.id);
      
      // Update post rating
      await supabase.rpc('update_post_rating', {
        p_post_id: postId,
        p_delta: -value,
        p_count_delta: -1,
      });
      
      return { action: 'removed', value: 0 };
    } else {
      // Different vote — update it
      await supabase
        .from('ratings')
        .update({ value })
        .eq('id', existing.id);

      // Update post rating (swing of 2: remove old + add new)
      await supabase.rpc('update_post_rating', {
        p_post_id: postId,
        p_delta: value * 2,
        p_count_delta: 0,
      });

      return { action: 'changed', value };
    }
  } else {
    // New vote
    const { error } = await supabase
      .from('ratings')
      .insert({
        post_id: postId,
        user_id: user.id,
        value,
      });

    if (error) throw error;

    // Update post rating
    await supabase.rpc('update_post_rating', {
      p_post_id: postId,
      p_delta: value,
      p_count_delta: 1,
    });

    return { action: 'added', value };
  }
}

/**
 * Get the current user's rating for a post
 */
export async function getUserRating(postId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('ratings')
    .select('value')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  return data?.value || 0;
}

/**
 * Get posts by a specific user
 */
export async function fetchUserPosts(userId) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
  return data || [];
}

/**
 * Delete a post (soft delete)
 */
export async function deletePost(postId) {
  const { error } = await supabase
    .from('posts')
    .update({ is_deleted: true })
    .eq('id', postId);

  if (error) throw error;
}
