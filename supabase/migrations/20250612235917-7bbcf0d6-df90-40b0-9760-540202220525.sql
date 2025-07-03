
-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true);

-- Create storage policies for media bucket
CREATE POLICY "Allow public access to media files" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Allow authenticated users to upload media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete media" ON storage.objects
FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Add membership fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN membership_type TEXT DEFAULT 'standard' CHECK (membership_type IN ('standard', 'premium')),
ADD COLUMN membership_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for membership queries
CREATE INDEX idx_profiles_membership ON public.profiles (membership_type);
