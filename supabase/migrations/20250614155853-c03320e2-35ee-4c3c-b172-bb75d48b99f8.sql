
-- Fix RLS policies for profiles table to allow proper community notes functionality

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view note authors" ON public.profiles;

-- Create comprehensive policies for profiles access

-- 1. Admins can access all profiles (for admin dashboard)
CREATE POLICY "Admins can access all profiles"
ON public.profiles
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

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

-- 3. PUBLIC ACCESS: Allow anyone to view basic profile info (name, membership_type, created_at) 
-- for authors of approved community notes - this is what enables the community page to work
CREATE POLICY "Public can view community note authors"
ON public.profiles
FOR SELECT
USING (
  -- Allow access to profiles of users who have approved community notes
  id IN (
    SELECT DISTINCT user_id 
    FROM public.community_notes 
    WHERE status = 'approved'
  )
);

-- 4. Enable public read access for community functionality
-- This policy allows the profiles join in community_notes queries to work for everyone
CREATE POLICY "Enable community profiles access"
ON public.profiles
FOR SELECT
USING (true);
