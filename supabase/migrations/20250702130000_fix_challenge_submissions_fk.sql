-- Fix foreign key constraint for challenge_submissions table
-- First drop the constraint if it exists (in case it was added manually)
ALTER TABLE public.challenge_submissions 
DROP CONSTRAINT IF EXISTS fk_challenge_submissions_user_challenge_instance_id;

-- Add the foreign key constraint with the correct name that Supabase expects
ALTER TABLE public.challenge_submissions 
ADD CONSTRAINT challenge_submissions_user_challenge_instance_id_fkey 
FOREIGN KEY (user_challenge_instance_id) 
REFERENCES public.user_challenge_instances(id) 
ON DELETE CASCADE; 