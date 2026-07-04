import { supabase } from '../supabase.js';

/**
 * Fetch items for the explore page with optional filters.
 */
export async function fetchItems({ category = 'all', search = '', limit = 30, offset = 0 } = {}) {
  let query = supabase
    .from('items')
    .select(`
      *,
      profiles (
        username,
        display_name,
        avatar_url
      )
    `)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }
  return data || [];
}

/**
 * Fetch a single item by ID, with joined profile.
 */
export async function fetchItemById(itemId) {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('id', itemId)
    .single();

  if (error) {
    console.error('Error fetching item:', error);
    return null;
  }
  return data;
}

/**
 * Fetch items created by a specific user.
 */
export async function fetchUserItems(userId) {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      profiles (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user items:', error);
    return [];
  }
  return data || [];
}

/**
 * Create a new item.
 */
export async function createItem({ title, description, category, image_url }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('items')
    .insert({
      created_by: user.id,
      title,
      description: description || '',
      category: category || 'other',
      image_url: image_url || null,
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

  // Increment user's items_count
  await supabase.rpc('increment_profile_count', { user_id: user.id, field: 'items_count' }).catch(() => {
    // Fallback: manual update if RPC doesn't exist
    supabase
      .from('profiles')
      .select('items_count')
      .eq('id', user.id)
      .single()
      .then(({ data: profile }) => {
        if (profile) {
          supabase
            .from('profiles')
            .update({ items_count: (profile.items_count || 0) + 1 })
            .eq('id', user.id)
            .then(() => {});
        }
      });
  });

  return data;
}

/**
 * Recalculate avg_rating and review_count for an item.
 */
export async function updateItemStats(itemId) {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('item_id', itemId);

  if (error) {
    console.error('Error fetching reviews for stats:', error);
    return;
  }

  const count = reviews.length;
  const avg = count > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(2)
    : 0;

  await supabase
    .from('items')
    .update({ avg_rating: parseFloat(avg), review_count: count })
    .eq('id', itemId);
}
