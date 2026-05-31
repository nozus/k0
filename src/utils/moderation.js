import { supabase } from '../supabase.js';

const MODERATION_THRESHOLD = 5; // Votes needed to take action

/**
 * Vote to moderate (delete post or block user)
 * @param {string} targetType - 'post' or 'user'
 * @param {string} targetId - post ID or user ID
 * @param {string} action - 'delete' or 'block'
 */
export async function voteModeration(targetType, targetId, action) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user already voted
  const { data: existing } = await supabase
    .from('moderation_votes')
    .select('id')
    .eq('voter_id', user.id)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .single();

  if (existing) {
    throw new Error('You have already voted on this');
  }

  // Insert vote
  const { error } = await supabase
    .from('moderation_votes')
    .insert({
      voter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      action,
    });

  if (error) throw error;

  // Check if threshold reached
  const { count } = await supabase
    .from('moderation_votes')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('action', action);

  if (count >= MODERATION_THRESHOLD) {
    await executeModeration(targetType, targetId, action);
    return { executed: true, count };
  }

  return { executed: false, count };
}

/**
 * Execute moderation action (when threshold is reached)
 */
async function executeModeration(targetType, targetId, action) {
  if (targetType === 'post' && action === 'delete') {
    await supabase
      .from('posts')
      .update({ is_deleted: true })
      .eq('id', targetId);
  } else if (targetType === 'user' && action === 'block') {
    await supabase
      .from('profiles')
      .update({ is_blocked: true })
      .eq('id', targetId);
  }
}

/**
 * Get moderation vote count for a target
 */
export async function getModerationCount(targetType, targetId, action) {
  const { count, error } = await supabase
    .from('moderation_votes')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('action', action);

  if (error) return 0;
  return count || 0;
}

/**
 * Check if current user has voted on a target
 */
export async function hasUserVoted(targetType, targetId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('moderation_votes')
    .select('id')
    .eq('voter_id', user.id)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .single();

  return !!data;
}
