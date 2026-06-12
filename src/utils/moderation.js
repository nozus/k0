import { supabase } from '../supabase.js';

const MODERATION_THRESHOLD = 5; // Votes needed to take action
const MAX_STRIKES = 3; // Strikes before a user is banned

/**
 * Vote to moderate (archive post, delete post, or strike user)
 * @param {string} targetType - 'post' or 'user'
 * @param {string} targetId - post ID or user ID
 * @param {string} action - 'archive', 'delete', or 'strike'
 */
export async function voteModeration(targetType, targetId, action) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user already voted for this specific action
  const { data: existing } = await supabase
    .from('moderation_votes')
    .select('id')
    .eq('voter_id', user.id)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('action', action)
    .single();

  if (existing) {
    throw new Error('You have already voted for this action');
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
  } else if (targetType === 'post' && action === 'archive') {
    await supabase
      .from('posts')
      .update({ is_archived: true })
      .eq('id', targetId);
  } else if (targetType === 'user' && action === 'strike') {
    // Fetch user to increment strikes
    const { data: profile } = await supabase
      .from('profiles')
      .select('strikes')
      .eq('id', targetId)
      .single();
    
    if (profile) {
      const newStrikes = (profile.strikes || 0) + 1;
      const isBlocked = newStrikes >= MAX_STRIKES;
      
      await supabase
        .from('profiles')
        .update({ strikes: newStrikes, is_blocked: isBlocked })
        .eq('id', targetId);
        
      // Delete the strike votes against this user so they need another full threshold for the next strike
      await supabase
        .from('moderation_votes')
        .delete()
        .eq('target_type', 'user')
        .eq('target_id', targetId)
        .eq('action', 'strike');
    }
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
 * Check if current user has voted on a target for a specific action
 */
export async function hasUserVoted(targetType, targetId, action) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('moderation_votes')
    .select('id')
    .eq('voter_id', user.id)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('action', action)
    .single();

  return !!data;
}
