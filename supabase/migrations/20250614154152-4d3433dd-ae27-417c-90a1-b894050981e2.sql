
-- Fix RLS policies for community_notes table
-- First, drop any existing policies to start fresh
DROP POLICY IF EXISTS "Allow admin full access on community notes" ON public.community_notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.community_notes;
DROP POLICY IF EXISTS "Users can view approved notes" ON public.community_notes;
DROP POLICY IF EXISTS "Users can view their own notes" ON public.community_notes;
DROP POLICY IF EXISTS "Users can delete their own pending notes" ON public.community_notes;

-- Create comprehensive RLS policies for community_notes
-- 1. Admins have full access to all notes (for moderation)
CREATE POLICY "Admins can access all community notes"
ON public.community_notes
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2. Users can view approved notes (public community feed)
CREATE POLICY "Users can view approved notes"
ON public.community_notes
FOR SELECT
USING (status = 'approved' OR auth.uid() = user_id);

-- 3. Users can insert their own notes
CREATE POLICY "Users can insert their own notes"
ON public.community_notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Users can update only their own pending notes
CREATE POLICY "Users can update their own pending notes"
ON public.community_notes
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- 5. Users can delete only their own pending notes
CREATE POLICY "Users can delete their own pending notes"
ON public.community_notes
FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- Fix RLS policies for profiles table (needed for admin dashboard and note authors)
-- Enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create RLS policies for profiles
-- 1. Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());

-- 2. Users can view and update their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Public can view basic profile info for approved note authors
CREATE POLICY "Public can view note authors"
ON public.profiles
FOR SELECT
USING (
  id IN (
    SELECT user_id 
    FROM public.community_notes 
    WHERE status = 'approved'
  )
);

-- Fix RLS policies for note_likes table
-- Enable RLS if not already enabled
ALTER TABLE public.note_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow admin full access on likes" ON public.note_likes;
DROP POLICY IF EXISTS "Users can view all likes" ON public.note_likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON public.note_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.note_likes;

-- Create comprehensive RLS policies for note_likes
-- 1. Admins have full access
CREATE POLICY "Admins can access all note likes"
ON public.note_likes
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2. Users can view likes on approved notes
CREATE POLICY "Users can view likes on approved notes"
ON public.note_likes
FOR SELECT
USING (
  note_id IN (
    SELECT id 
    FROM public.community_notes 
    WHERE status = 'approved'
  )
);

-- 3. Users can like approved notes
CREATE POLICY "Users can like approved notes"
ON public.note_likes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  note_id IN (
    SELECT id 
    FROM public.community_notes 
    WHERE status = 'approved'
  )
);

-- 4. Users can remove their own likes
CREATE POLICY "Users can remove their own likes"
ON public.note_likes
FOR DELETE
USING (auth.uid() = user_id);
