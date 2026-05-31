import { supabase } from '../supabase.js';

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current user's profile
 */
export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

/**
 * Sign up a new user and create their profile (kard)
 */
export async function signUp({ email, password, username, displayName, avatarFile }) {
  // 1. Create auth user
export async function signUp({ username, password, displayName, avatarFile }) {
  // 1. Upload avatar if exists
  let avatarUrl = null;
  if (avatarFile) {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile);

    if (uploadError) {
      throw new Error(`Avatar upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    avatarUrl = data.publicUrl;
  }

  // Generate a dummy email so Supabase auth works without actually requiring an email
  const dummyEmail = `${username}@k0.local`;

  // 2. Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: dummyEmail,
    password,
    options: {
      data: {
        username,
        display_name: displayName,
        avatar_url: avatarUrl,
      },
    },
  });

  if (authError) throw authError;

  // Note: We use a trigger in Supabase to automatically create the profile row
  // after the auth user is created.
  return authData;
}

/**
 * Sign in existing user
 */
export async function signIn({ username, password }) {
  const dummyEmail = `${username}@k0.local`;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: dummyEmail,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Listen for auth state changes
 */
export function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return subscription;
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get a user's profile by ID
 */
export async function getProfileById(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

/**
 * Get a user's profile by username
 */
export async function getProfileByUsername(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) return null;
  return data;
}
