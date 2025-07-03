-- Create storage bucket for challenge submission images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('challenge_images', 'challenge_images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']); -- 10MB limit

-- RLS POLICIES FOR CHALLENGE IMAGE STORAGE

-- 1. Allow public read access to challenge images
CREATE POLICY "Allow public read access to challenge images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'challenge_images');

-- 2. Allow users to upload images into their own folder
CREATE POLICY "Allow authenticated users to upload challenge images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'challenge_images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Allow users to update their own images
CREATE POLICY "Allow users to update their own challenge images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'challenge_images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Allow users to delete their own images
CREATE POLICY "Allow users to delete their own challenge images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'challenge_images' AND
  auth.uid()::text = (storage.foldername(name))[1]
); 