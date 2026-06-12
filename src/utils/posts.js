import { supabase } from '../supabase.js';

/**
 * Fetch posts for the feed
 */
export async function fetchPosts({ filter = 'newest', limit = 20, offset = 0 } = {}) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('is_deleted', false)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (filter === 'archived') {
    query = query.eq('is_archived', true);
  } else {
    // Only show active posts in the main feed
    query = query.eq('is_archived', false);
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
      is_archived: false,
      is_deleted: false,
    })
    .select(`
      *,
      profiles (
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
 * Get posts by a specific user
 */
export async function fetchUserPosts(userId) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
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
