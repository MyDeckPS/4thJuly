
-- Create user_tags table to store user-assigned tags (foundation for future tagging logic)
CREATE TABLE public.user_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tag)
);

-- Enable RLS on user_tags
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own tags
CREATE POLICY "Users can view their own tags" 
  ON public.user_tags 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own tags
CREATE POLICY "Users can create their own tags" 
  ON public.user_tags 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own tags
CREATE POLICY "Users can update their own tags" 
  ON public.user_tags 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own tags
CREATE POLICY "Users can delete their own tags" 
  ON public.user_tags 
  FOR DELETE 
  USING (auth.uid() = user_id);
