
-- Create an enum type for note status
CREATE TYPE public.note_status AS ENUM ('pending', 'approved', 'rejected');

-- Create the table to store community notes
CREATE TABLE public.community_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    images TEXT[],
    status public.note_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add a trigger to automatically update the 'updated_at' timestamp on changes
CREATE TRIGGER handle_community_notes_updated_at
BEFORE UPDATE ON public.community_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create the table to track likes on notes
CREATE TABLE public.note_likes (
    note_id UUID NOT NULL REFERENCES public.community_notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (note_id, user_id)
);

-- Enable Row Level Security (RLS) on the new tables
ALTER TABLE public.community_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_likes ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR community_notes

-- 1. Admins have unrestricted access
CREATE POLICY "Allow admin full access on community notes"
ON public.community_notes
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2. Users can create notes for themselves
CREATE POLICY "Users can insert their own notes"
ON public.community_notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Any user can view approved notes (for the community feed)
CREATE POLICY "Users can view approved notes"
ON public.community_notes
FOR SELECT
USING (status = 'approved');

-- 4. Users can view their own notes, regardless of status
CREATE POLICY "Users can view their own notes"
ON public.community_notes
FOR SELECT
USING (auth.uid() = user_id);

-- 5. Users can only delete their own notes if they are still pending
CREATE POLICY "Users can delete their own pending notes"
ON public.community_notes
FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');


-- RLS POLICIES FOR note_likes

-- 1. Admins have unrestricted access to likes
CREATE POLICY "Allow admin full access on likes"
ON public.note_likes
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2. Any user can see who liked which post
CREATE POLICY "Users can view all likes"
ON public.note_likes
FOR SELECT
USING (true);

-- 3. Users can like a post
CREATE POLICY "Users can insert their own likes"
ON public.note_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Users can remove their own like
CREATE POLICY "Users can delete their own likes"
ON public.note_likes
FOR DELETE
USING (auth.uid() = user_id);


-- Create a storage bucket for note images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('note_images', 'note_images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']); -- 5MB limit

-- RLS POLICIES FOR NOTE IMAGE STORAGE

-- 1. Allow public read access to note images
CREATE POLICY "Allow public read access to note images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'note_images');

-- 2. Allow users to upload images into their own folder
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'note_images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Allow users to update their own images
CREATE POLICY "Allow users to update their own images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'note_images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Allow users to delete their own images
CREATE POLICY "Allow users to delete their own images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'note_images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
