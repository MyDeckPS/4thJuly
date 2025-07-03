
-- Create the validate_quiz_responses function
CREATE OR REPLACE FUNCTION public.validate_quiz_responses(p_responses jsonb)
RETURNS TABLE(is_valid boolean, missing_questions text[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  missing_required TEXT[] := '{}';
  required_question RECORD;
  response_exists BOOLEAN;
BEGIN
  -- Check each required question
  FOR required_question IN 
    SELECT question_key, question 
    FROM public.quiz_questions 
    WHERE active = true AND is_required = true
  LOOP
    -- Check if response exists and is not empty
    response_exists := FALSE;
    
    IF p_responses ? required_question.question_key THEN
      DECLARE
        response_value JSONB := p_responses -> required_question.question_key;
      BEGIN
        -- Check if response has content
        IF jsonb_typeof(response_value) = 'array' THEN
          response_exists := jsonb_array_length(response_value) > 0;
        ELSIF jsonb_typeof(response_value) = 'string' THEN
          response_exists := length(trim(response_value #>> '{}')) > 0;
        ELSE
          response_exists := response_value IS NOT NULL;
        END IF;
      END;
    END IF;
    
    -- Add to missing if not found or empty
    IF NOT response_exists THEN
      missing_required := array_append(missing_required, required_question.question_key);
    END IF;
  END LOOP;
  
  -- Return validation result
  RETURN QUERY SELECT 
    array_length(missing_required, 1) IS NULL OR array_length(missing_required, 1) = 0,
    missing_required;
END;
$$;

-- Create the process_quiz_tags function
CREATE OR REPLACE FUNCTION public.process_quiz_tags(p_user_id uuid, p_responses jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response_key TEXT;
  response_value JSONB;
  option_text TEXT;
  option_obj JSONB;
  range_value INTEGER;
  rule_record RECORD;
  existing_tag_count INTEGER;
  tag_metadata JSONB;
BEGIN
  -- Loop through each response in the quiz
  FOR response_key, response_value IN SELECT * FROM jsonb_each(p_responses) LOOP
    -- Handle array responses (multiple choice with potential range values)
    IF jsonb_typeof(response_value) = 'array' THEN
      FOR option_obj IN SELECT jsonb_array_elements(response_value) LOOP
        -- Check if this is a range-enabled response (object with category and rating)
        IF jsonb_typeof(option_obj) = 'object' AND option_obj ? 'category' AND option_obj ? 'rating' THEN
          option_text := option_obj ->> 'category';
          range_value := (option_obj ->> 'rating')::INTEGER;
          
          -- Create metadata for range-based responses
          tag_metadata := jsonb_build_object(
            'range_value', range_value,
            'question_key', response_key,
            'response_type', 'range_selection'
          );
          
          -- Find matching tagging rules and apply range-based logic
          FOR rule_record IN 
            SELECT qtr.tag_to_assign, qtr.confidence_score, qq.id as question_id
            FROM public.question_tagging_rules qtr
            JOIN public.quiz_questions qq ON qtr.question_id = qq.id
            WHERE qq.question_key = response_key 
              AND qtr.option_value = option_text
          LOOP
            -- Adjust confidence based on range value (higher range = higher confidence)
            DECLARE
              adjusted_confidence INTEGER := LEAST(100, rule_record.confidence_score + (range_value - 1) * 10);
            BEGIN
              -- Check if tag already exists for this user
              SELECT COUNT(*) INTO existing_tag_count
              FROM public.user_tags 
              WHERE user_id = p_user_id AND tag = rule_record.tag_to_assign;
              
              -- Insert or update tag with range metadata
              IF existing_tag_count = 0 THEN
                INSERT INTO public.user_tags (user_id, tag, confidence_score, source_question_id, metadata)
                VALUES (p_user_id, rule_record.tag_to_assign, adjusted_confidence, rule_record.question_id, tag_metadata);
              ELSE
                -- Update existing tag if new confidence is higher
                UPDATE public.user_tags 
                SET confidence_score = GREATEST(confidence_score, adjusted_confidence),
                    source_question_id = rule_record.question_id,
                    metadata = COALESCE(metadata, '{}'::jsonb) || tag_metadata,
                    updated_at = now()
                WHERE user_id = p_user_id AND tag = rule_record.tag_to_assign;
              END IF;
            END;
          END LOOP;
        ELSE
          -- Handle regular string options in arrays
          option_text := option_obj #>> '{}';
          
          -- Find matching tagging rules for this question and option
          FOR rule_record IN 
            SELECT qtr.tag_to_assign, qtr.confidence_score, qq.id as question_id
            FROM public.question_tagging_rules qtr
            JOIN public.quiz_questions qq ON qtr.question_id = qq.id
            WHERE qq.question_key = response_key 
              AND qtr.option_value = option_text
          LOOP
            -- Check if tag already exists for this user
            SELECT COUNT(*) INTO existing_tag_count
            FROM public.user_tags 
            WHERE user_id = p_user_id AND tag = rule_record.tag_to_assign;
            
            -- Insert or update tag
            IF existing_tag_count = 0 THEN
              INSERT INTO public.user_tags (user_id, tag, confidence_score, source_question_id)
              VALUES (p_user_id, rule_record.tag_to_assign, rule_record.confidence_score, rule_record.question_id);
            ELSE
              -- Update existing tag with higher confidence if applicable
              UPDATE public.user_tags 
              SET confidence_score = GREATEST(confidence_score, rule_record.confidence_score),
                  source_question_id = rule_record.question_id,
                  updated_at = now()
              WHERE user_id = p_user_id AND tag = rule_record.tag_to_assign;
            END IF;
          END LOOP;
        END IF;
      END LOOP;
    -- Handle single value responses
    ELSE
      option_text := response_value #>> '{}';
      -- Find matching tagging rules for this question and option
      FOR rule_record IN 
        SELECT qtr.tag_to_assign, qtr.confidence_score, qq.id as question_id
        FROM public.question_tagging_rules qtr
        JOIN public.quiz_questions qq ON qtr.question_id = qq.id
        WHERE qq.question_key = response_key 
          AND qtr.option_value = option_text
      LOOP
        -- Check if tag already exists for this user
        SELECT COUNT(*) INTO existing_tag_count
        FROM public.user_tags 
        WHERE user_id = p_user_id AND tag = rule_record.tag_to_assign;
        
        -- Insert or update tag
        IF existing_tag_count = 0 THEN
          INSERT INTO public.user_tags (user_id, tag, confidence_score, source_question_id)
          VALUES (p_user_id, rule_record.tag_to_assign, rule_record.confidence_score, rule_record.question_id);
        ELSE
          -- Update existing tag with higher confidence if applicable
          UPDATE public.user_tags 
          SET confidence_score = GREATEST(confidence_score, rule_record.confidence_score),
              source_question_id = rule_record.question_id,
              updated_at = now()
          WHERE user_id = p_user_id AND tag = rule_record.tag_to_assign;
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END;
$$;
