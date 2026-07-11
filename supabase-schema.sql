-- ============================================
-- k0 Database Schema — Universal Rating Platform
-- Run this in your Supabase SQL Editor
-- ============================================

-- Drop old tables to prevent "already exists" errors during reset
DROP TABLE IF EXISTS moderation_votes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PROFILES (Kards)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  items_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. ITEMS — the things people rate
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'other',
  avg_rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items are viewable by everyone"
  ON items FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Items can be updated"
  ON items FOR UPDATE
  USING (true);

-- 3. REVIEWS — user ratings + text for items
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. MODERATION VOTES
CREATE TABLE IF NOT EXISTS moderation_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('item', 'review', 'user')),
  target_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('report', 'delete')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(voter_id, target_type, target_id, action)
);

ALTER TABLE moderation_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderation votes are viewable"
  ON moderation_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own moderation votes"
  ON moderation_votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id);

-- 5. STORAGE BUCKETS
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

-- 6. BACKFILL ORPHANED USERS
-- If you encountered a foreign key error on created_by, this rescues existing auth users.
-- Uses a CTE with ROW_NUMBER to prevent duplicate username errors.
WITH ranked_users AS (
  SELECT 
    id,
    COALESCE(raw_user_meta_data->>'username', 'user_' || substr(id::text, 1, 8)) AS base_username,
    COALESCE(raw_user_meta_data->>'display_name', 'User') AS display_name,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(raw_user_meta_data->>'username', 'user_' || substr(id::text, 1, 8)) 
      ORDER BY created_at ASC
    ) as rn
  FROM auth.users
)
INSERT INTO public.profiles (id, username, display_name)
SELECT 
  id, 
  CASE WHEN rn = 1 THEN base_username ELSE base_username || '_' || substr(id::text, 1, 4) END, 
  display_name
FROM ranked_users
ON CONFLICT (id) DO NOTHING;
