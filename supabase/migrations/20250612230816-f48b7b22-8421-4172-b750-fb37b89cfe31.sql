
-- Create user profiles table to track user information and quiz completion
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  quiz_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create quiz_questions table for admin-managed questions
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'text', 'select', 'date', 'radio', 'checkbox'
  question_key TEXT NOT NULL UNIQUE, -- used as field name in responses
  options JSONB DEFAULT '[]'::jsonb, -- for select/radio/checkbox options
  required BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quiz_questions (public read for now)
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Create policy for quiz questions (public read access)
CREATE POLICY "Anyone can view active quiz questions" 
  ON public.quiz_questions 
  FOR SELECT 
  USING (active = true);

-- Create quiz_responses table for storing user responses
CREATE TABLE public.quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quiz_responses
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_responses
CREATE POLICY "Users can view their own quiz responses" 
  ON public.quiz_responses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz responses" 
  ON public.quiz_responses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz responses" 
  ON public.quiz_responses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_quiz_responses_updated_at
  BEFORE UPDATE ON public.quiz_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data ->> 'name');
  RETURN new;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert the mandatory quiz questions
INSERT INTO public.quiz_questions (question, question_type, question_key, required, sort_order) VALUES
('What is the name of your child?', 'text', 'childName', true, 1),
('What is your child''s gender?', 'select', 'childGender', true, 2),
('When is your child''s birthday?', 'date', 'childBirthday', true, 3);

-- Update the gender question with options
UPDATE public.quiz_questions 
SET options = '["Boy", "Girl"]'::jsonb 
WHERE question_key = 'childGender';
