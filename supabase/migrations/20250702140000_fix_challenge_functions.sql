-- Recreate challenge functions to ensure they're properly registered

-- Function to start a challenge (sets timer)
CREATE OR REPLACE FUNCTION public.start_challenge(challenge_instance_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  instance_record RECORD;
  time_limit_hours INTEGER;
BEGIN
  -- Get challenge instance and time limit
  SELECT uci.*, pc.time_limit_hours 
  INTO instance_record
  FROM public.user_challenge_instances uci
  JOIN public.product_challenges pc ON pc.id = uci.product_challenge_id
  WHERE uci.id = challenge_instance_id
    AND uci.user_id = auth.uid()
    AND uci.status = 'available';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Get the time limit hours separately
  SELECT pc.time_limit_hours
  INTO time_limit_hours
  FROM public.product_challenges pc
  WHERE pc.id = instance_record.product_challenge_id;
  
  -- Update instance to active status with timer
  UPDATE public.user_challenge_instances
  SET 
    status = 'active',
    started_at = now(),
    expires_at = now() + (time_limit_hours || ' hours')::interval,
    updated_at = now()
  WHERE id = challenge_instance_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit challenge completion
CREATE OR REPLACE FUNCTION public.submit_challenge(
  challenge_instance_id UUID,
  p_user_notes TEXT DEFAULT NULL,
  p_completion_time_minutes INTEGER DEFAULT NULL,
  p_image_urls TEXT DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
  submission_id UUID;
  parsed_image_urls JSONB;
BEGIN
  -- Parse image URLs from JSON string
  BEGIN
    parsed_image_urls := p_image_urls::JSONB;
  EXCEPTION
    WHEN OTHERS THEN
      parsed_image_urls := '[]'::JSONB;
  END;

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
    parsed_image_urls
  ) RETURNING id INTO submission_id;
  
  -- Update challenge instance status
  UPDATE public.user_challenge_instances
  SET 
    status = 'submitted',
    submitted_at = now(),
    updated_at = now()
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
  new_diary_entry_id UUID;
BEGIN
  -- Verify admin access
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Get submission and related data
  SELECT 
    cs.id as submission_id,
    cs.user_challenge_instance_id,
    cs.user_notes,
    cs.completion_time_minutes,
    cs.image_urls,
    cs.admin_feedback,
    cs.approval_status,
    cs.reviewed_by,
    cs.reviewed_at,
    cs.auto_posted_to_diary,
    cs.diary_entry_id,
    uci.user_id,
    uci.product_challenge_id,
    uci.user_product_purchase_id,
    pc.points_reward,
    pc.title as challenge_title,
    p.title as product_title
  INTO instance_record
  FROM public.challenge_submissions cs
  JOIN public.user_challenge_instances uci ON uci.id = cs.user_challenge_instance_id
  JOIN public.product_challenges pc ON pc.id = uci.product_challenge_id
  JOIN public.user_product_purchases upp ON upp.id = uci.user_product_purchase_id
  JOIN public.products p ON p.id = upp.product_id
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
    reviewed_at = now(),
    updated_at = now()
  WHERE id = submission_id;
  
  -- If approved, complete the challenge and award points
  IF p_approval_status = 'approved' THEN
    UPDATE public.user_challenge_instances
    SET 
      status = 'completed',
      completed_at = now(),
      points_earned = instance_record.points_reward,
      updated_at = now()
    WHERE id = instance_record.user_challenge_instance_id;
    
    -- Auto-post to community diary if requested
    IF p_auto_post_to_diary AND instance_record.user_notes IS NOT NULL THEN
      INSERT INTO public.community_notes (
        user_id,
        content,
        images,
        status
      ) VALUES (
        instance_record.user_id,
        'Challenge Completed: ' || instance_record.challenge_title || '! 🏆' || Chr(10) || Chr(10) ||
        'I just completed the "' || instance_record.challenge_title || '" challenge for my ' || instance_record.product_title || '! ' || 
        COALESCE(instance_record.user_notes, ''),
        (SELECT array_agg(value::TEXT) FROM jsonb_array_elements_text(COALESCE(instance_record.image_urls, '[]'::jsonb))),
        'approved'
      ) RETURNING id INTO new_diary_entry_id;
      
      -- Update submission with diary reference
      UPDATE public.challenge_submissions
      SET 
        auto_posted_to_diary = true,
        diary_entry_id = new_diary_entry_id,
        updated_at = now()
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
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' 
    AND expires_at < now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 