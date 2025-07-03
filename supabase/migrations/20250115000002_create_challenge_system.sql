-- Create Challenge System for Product Gamification
-- This system allows admins to create challenges for products and users to complete them

-- Create product_challenges table (Admin creates challenges for each product)
CREATE TABLE public.product_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  task_instructions TEXT NOT NULL, -- Detailed instructions for the challenge
  diary_prompt TEXT, -- Optional prompt for diary entry
  emoji TEXT DEFAULT '🏆',
  points_reward INTEGER NOT NULL DEFAULT 50,
  time_limit_hours INTEGER NOT NULL DEFAULT 48, -- Time limit from when user starts
  completion_time_minutes INTEGER, -- Expected completion time (e.g., "finish puzzle in 10 minutes")
  difficulty_level TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_challenge_instances table (Individual challenge instances for each user)
CREATE TABLE public.user_challenge_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_challenge_id UUID NOT NULL REFERENCES public.product_challenges(id) ON DELETE CASCADE,
  user_product_purchase_id UUID NOT NULL REFERENCES public.user_product_purchases(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'active', 'submitted', 'completed', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_challenge_id) -- One instance per user per challenge
);

-- Create challenge_submissions table (User uploads and admin approval)
CREATE TABLE public.challenge_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_challenge_instance_id UUID NOT NULL REFERENCES public.user_challenge_instances(id) ON DELETE CASCADE,
  user_notes TEXT, -- User's description of their completion
  completion_time_minutes INTEGER, -- How long it actually took them
  image_urls JSONB DEFAULT '[]'::jsonb, -- Array of uploaded image URLs
  admin_feedback TEXT, -- Admin feedback on submission
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  reviewed_by UUID REFERENCES public.profiles(id), -- Which admin reviewed it
  reviewed_at TIMESTAMP WITH TIME ZONE,
  auto_posted_to_diary BOOLEAN DEFAULT false, -- Whether this was automatically added to community diary
  diary_entry_id UUID, -- Reference to community_notes if posted
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge_leaderboard table (Optional: For future leaderboard features)
CREATE TABLE public.challenge_leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  total_challenges_completed INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  fastest_completion_time INTEGER, -- In minutes
  last_completion_date TIMESTAMP WITH TIME ZONE,
  rank_position INTEGER, -- Current rank for this product
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on all challenge tables
ALTER TABLE public.product_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_challenges
CREATE POLICY "Everyone can view active product challenges" 
  ON public.product_challenges 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admin can manage product challenges" 
  ON public.product_challenges 
  FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policies for user_challenge_instances
CREATE POLICY "Users can view their own challenge instances" 
  ON public.user_challenge_instances 
  FOR SELECT 
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update their own challenge instances" 
  ON public.user_challenge_instances 
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create challenge instances" 
  ON public.user_challenge_instances 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin can manage all challenge instances" 
  ON public.user_challenge_instances 
  FOR ALL 
  USING (public.is_admin());

-- RLS Policies for challenge_submissions
CREATE POLICY "Users can view their own submissions" 
  ON public.challenge_submissions 
  FOR SELECT 
  USING (
    user_challenge_instance_id IN (
      SELECT id FROM public.user_challenge_instances WHERE user_id = auth.uid()
    ) OR public.is_admin()
  );

CREATE POLICY "Users can create their own submissions" 
  ON public.challenge_submissions 
  FOR INSERT 
  WITH CHECK (
    user_challenge_instance_id IN (
      SELECT id FROM public.user_challenge_instances WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own pending submissions" 
  ON public.challenge_submissions 
  FOR UPDATE 
  USING (
    approval_status = 'pending' AND
    user_challenge_instance_id IN (
      SELECT id FROM public.user_challenge_instances WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all submissions" 
  ON public.challenge_submissions 
  FOR ALL 
  USING (public.is_admin());

-- RLS Policies for challenge_leaderboard (read-only for users)
CREATE POLICY "Everyone can view leaderboard" 
  ON public.challenge_leaderboard 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin can manage leaderboard" 
  ON public.challenge_leaderboard 
  FOR ALL 
  USING (public.is_admin());

-- Add triggers for updated_at
CREATE TRIGGER update_product_challenges_updated_at
  BEFORE UPDATE ON public.product_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_challenge_instances_updated_at
  BEFORE UPDATE ON public.user_challenge_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_challenge_submissions_updated_at
  BEFORE UPDATE ON public.challenge_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_challenge_leaderboard_updated_at
  BEFORE UPDATE ON public.challenge_leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Function to automatically create challenge instances when user purchases a product
CREATE OR REPLACE FUNCTION public.create_challenge_instances_for_purchase()
RETURNS trigger AS $$
BEGIN
  -- Create challenge instances for all active challenges of the purchased product
  INSERT INTO public.user_challenge_instances (
    user_id,
    product_challenge_id,
    user_product_purchase_id,
    status
  )
  SELECT 
    NEW.user_id,
    pc.id,
    NEW.id,
    'available'
  FROM public.product_challenges pc
  WHERE pc.product_id = NEW.product_id 
    AND pc.is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create challenge instances on product purchase
CREATE TRIGGER create_challenges_on_purchase
  AFTER INSERT ON public.user_product_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.create_challenge_instances_for_purchase();

-- Function to start a challenge (sets timer)
CREATE OR REPLACE FUNCTION public.start_challenge(challenge_instance_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  instance_record RECORD;
  time_limit_hours INTEGER;
BEGIN
  -- Get challenge instance and time limit
  SELECT uci.*, pc.time_limit_hours 
  INTO instance_record, time_limit_hours
  FROM public.user_challenge_instances uci
  JOIN public.product_challenges pc ON pc.id = uci.product_challenge_id
  WHERE uci.id = challenge_instance_id
    AND uci.user_id = auth.uid()
    AND uci.status = 'available';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update instance to active status with timer
  UPDATE public.user_challenge_instances
  SET 
    status = 'active',
    started_at = now(),
    expires_at = now() + (time_limit_hours || ' hours')::interval
  WHERE id = challenge_instance_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit challenge completion
CREATE OR REPLACE FUNCTION public.submit_challenge(
  challenge_instance_id UUID,
  p_user_notes TEXT DEFAULT NULL,
  p_completion_time_minutes INTEGER DEFAULT NULL,
  p_image_urls JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID AS $$
DECLARE
  submission_id UUID;
BEGIN
  -- Verify the challenge instance belongs to the user and is active
  IF NOT EXISTS (
    SELECT 1 FROM public.user_challenge_instances 
    WHERE id = challenge_instance_id 
      AND user_id = auth.uid() 
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Invalid challenge instance';
  END IF;
  
  -- Create submission
  INSERT INTO public.challenge_submissions (
    user_challenge_instance_id,
    user_notes,
    completion_time_minutes,
    image_urls
  ) VALUES (
    challenge_instance_id,
    p_user_notes,
    p_completion_time_minutes,
    p_image_urls
  ) RETURNING id INTO submission_id;
  
  -- Update challenge instance status
  UPDATE public.user_challenge_instances
  SET 
    status = 'submitted',
    submitted_at = now()
  WHERE id = challenge_instance_id;
  
  RETURN submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for admin to approve/reject submissions
CREATE OR REPLACE FUNCTION public.review_challenge_submission(
  submission_id UUID,
  p_approval_status TEXT,
  p_admin_feedback TEXT DEFAULT NULL,
  p_auto_post_to_diary BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
DECLARE
  instance_record RECORD;
  points_to_award INTEGER;
  diary_entry_id UUID;
BEGIN
  -- Verify admin access
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Get submission and related data
  SELECT 
    cs.*,
    uci.user_id,
    uci.product_challenge_id,
    pc.points_reward,
    pc.title as challenge_title,
    p.title as product_title
  INTO instance_record
  FROM public.challenge_submissions cs
  JOIN public.user_challenge_instances uci ON uci.id = cs.user_challenge_instance_id
  JOIN public.product_challenges pc ON pc.id = uci.product_challenge_id
  JOIN public.products p ON p.id = (
    SELECT product_id FROM public.user_product_purchases 
    WHERE id = uci.user_product_purchase_id
  )
  WHERE cs.id = submission_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update submission
  UPDATE public.challenge_submissions
  SET 
    approval_status = p_approval_status,
    admin_feedback = p_admin_feedback,
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = submission_id;
  
  -- If approved, complete the challenge and award points
  IF p_approval_status = 'approved' THEN
    UPDATE public.user_challenge_instances
    SET 
      status = 'completed',
      completed_at = now(),
      points_earned = instance_record.points_reward
    WHERE id = instance_record.user_challenge_instance_id;
    
    -- Update/create leaderboard entry
    INSERT INTO public.challenge_leaderboard (
      user_id,
      product_id,
      total_challenges_completed,
      total_points_earned,
      fastest_completion_time,
      last_completion_date
    ) 
    SELECT 
      instance_record.user_id,
      (SELECT product_id FROM public.user_product_purchases WHERE id = instance_record.user_product_purchase_id),
      1,
      instance_record.points_reward,
      instance_record.completion_time_minutes,
      now()
    ON CONFLICT (user_id, product_id) DO UPDATE SET
      total_challenges_completed = challenge_leaderboard.total_challenges_completed + 1,
      total_points_earned = challenge_leaderboard.total_points_earned + instance_record.points_reward,
      fastest_completion_time = LEAST(
        COALESCE(challenge_leaderboard.fastest_completion_time, instance_record.completion_time_minutes), 
        COALESCE(instance_record.completion_time_minutes, challenge_leaderboard.fastest_completion_time)
      ),
      last_completion_date = now();
    
    -- Auto-post to community diary if requested
    IF p_auto_post_to_diary THEN
      INSERT INTO public.community_notes (
        user_id,
        title,
        content,
        note_type,
        is_approved,
        approved_by,
        approved_at
      ) VALUES (
        instance_record.user_id,
        'Challenge Completed: ' || instance_record.challenge_title,
        'I just completed the "' || instance_record.challenge_title || '" challenge for my ' || instance_record.product_title || '! ' || 
        COALESCE(instance_record.user_notes, ''),
        'challenge_completion',
        true,
        auth.uid(),
        now()
      ) RETURNING id INTO diary_entry_id;
      
      -- Update submission with diary reference
      UPDATE public.challenge_submissions
      SET 
        auto_posted_to_diary = true,
        diary_entry_id = diary_entry_id
      WHERE id = submission_id;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old active challenges
CREATE OR REPLACE FUNCTION public.expire_old_challenges()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE public.user_challenge_instances
  SET status = 'expired'
  WHERE status = 'active' 
    AND expires_at < now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_product_challenges_product_id ON public.product_challenges(product_id);
CREATE INDEX idx_product_challenges_active ON public.product_challenges(is_active);
CREATE INDEX idx_user_challenge_instances_user_id ON public.user_challenge_instances(user_id);
CREATE INDEX idx_user_challenge_instances_status ON public.user_challenge_instances(status);
CREATE INDEX idx_user_challenge_instances_expires_at ON public.user_challenge_instances(expires_at);
CREATE INDEX idx_challenge_submissions_approval_status ON public.challenge_submissions(approval_status);
CREATE INDEX idx_challenge_leaderboard_product_id ON public.challenge_leaderboard(product_id);

-- Insert sample challenges (you can modify these based on your products)
INSERT INTO public.product_challenges (product_id, title, description, task_instructions, diary_prompt, emoji, points_reward, time_limit_hours, completion_time_minutes, difficulty_level) VALUES
-- Note: You'll need to replace these product_id values with actual product IDs from your database
-- Example challenges for demonstration:
((SELECT id FROM public.products WHERE title ILIKE '%puzzle%' LIMIT 1), 
 'Speed Builder Challenge', 
 'Complete your puzzle as fast as possible!', 
 'Assemble the entire puzzle from start to finish. Time yourself and try to beat the suggested completion time!',
 'Upload a picture of your completed puzzle and share your completion time. How did you feel during the challenge?',
 '⚡',
 50,
 48,
 10,
 'easy'),

((SELECT id FROM public.products WHERE title ILIKE '%building%' OR title ILIKE '%blocks%' LIMIT 1), 
 'Creative Builder Challenge', 
 'Build something amazing with your blocks!', 
 'Use all your building blocks to create a tower, castle, or any creative structure. The goal is to use as many pieces as possible!',
 'Show us your amazing creation! What inspired your design?',
 '🏗️',
 75,
 72,
 30,
 'medium'),

((SELECT id FROM public.products WHERE title ILIKE '%stem%' OR title ILIKE '%robot%' LIMIT 1), 
 'Future Engineer Challenge', 
 'Design and build a bridge with your STEM kit!', 
 'Use your STEM building set to design a bridge that can hold at least 10 toy cars. Test the strength and stability!',
 'Document your engineering process and final bridge design. What challenges did you face?',
 '🔧',
 100,
 72,
 45,
 'hard');

-- Add comment for documentation
COMMENT ON TABLE public.product_challenges IS 'Challenges that admins create for each product to gamify the user experience';
COMMENT ON TABLE public.user_challenge_instances IS 'Individual challenge instances for users who have purchased products';
COMMENT ON TABLE public.challenge_submissions IS 'User submissions for completed challenges, pending admin approval';
COMMENT ON TABLE public.challenge_leaderboard IS 'Leaderboard tracking user progress and achievements'; 