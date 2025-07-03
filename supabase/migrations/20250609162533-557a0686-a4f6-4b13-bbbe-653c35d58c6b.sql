
-- Final cleanup to ensure complete restoration to June 9, 2025 3:29 PM state
-- Drop any remaining custom tables that might still exist
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.experts CASCADE;
DROP TABLE IF EXISTS public.quiz_responses CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop any custom types that might still exist
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Drop any custom functions that might still exist
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.assign_admin_role() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;

-- Remove any custom triggers that might still exist on auth tables
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Clean up any remaining sequences
DROP SEQUENCE IF EXISTS public.profiles_id_seq CASCADE;

-- Ensure no custom extensions were added
-- (Most extensions are system-level, so we'll only drop custom ones if they exist)
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Reset any modified system settings to defaults
-- (This ensures the database is in its cleanest possible state)
