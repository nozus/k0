-- ============================================
-- k0 Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Drop old tables to prevent "already exists" errors during reset
DROP TABLE IF EXISTS moderation_votes CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PROFILES (Kards)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  strikes INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. POSTS (Kontros)
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read non-deleted posts
CREATE POLICY "Posts are viewable if not deleted"
  ON posts FOR SELECT
  USING (is_deleted = FALSE);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow updates for archiving and soft deletes
CREATE POLICY "Posts can be updated"
  ON posts FOR UPDATE
  USING (true);

-- 3. MODERATION VOTES
-- Users vote to 'strike' a user, 'archive' a post, or 'delete' a post
CREATE TABLE IF NOT EXISTS moderation_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'user')),
  target_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('strike', 'archive', 'delete')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(voter_id, target_type, target_id, action)
);

ALTER TABLE moderation_votes ENABLE ROW LEVEL SECURITY;

-- Users can read moderation vote counts
CREATE POLICY "Moderation votes are viewable"
  ON moderation_votes FOR SELECT
  USING (true);

-- Users can insert their own votes
CREATE POLICY "Users can insert own moderation votes"
  ON moderation_votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id);

-- 4. STORAGE BUCKET for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
