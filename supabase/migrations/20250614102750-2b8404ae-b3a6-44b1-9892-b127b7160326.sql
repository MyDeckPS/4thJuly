
-- Update developmental goal names to match frontend expectations
UPDATE public.developmental_goals 
SET name = 'Cognitive Development' 
WHERE name = 'Cognitive';

UPDATE public.developmental_goals 
SET name = 'Creativity and Imagination' 
WHERE name = 'Creativity & Imagination';

UPDATE public.developmental_goals 
SET name = 'STEM and Robotics' 
WHERE name = 'STEM & Robotics';

-- Re-run the data migration to ensure product scores are correctly mapped
DO $$
DECLARE
    cognitive_goal_id UUID;
    creativity_goal_id UUID;
    motor_skill_goal_id UUID;
    stem_robotics_goal_id UUID;
BEGIN
    -- Find the IDs of the core developmental goals by their updated names
    SELECT id INTO cognitive_goal_id FROM public.developmental_goals WHERE name = 'Cognitive Development' LIMIT 1;
    SELECT id INTO creativity_goal_id FROM public.developmental_goals WHERE name = 'Creativity and Imagination' LIMIT 1;
    SELECT id INTO motor_skill_goal_id FROM public.developmental_goals WHERE name = 'Motor Skills' LIMIT 1;
    SELECT id INTO stem_robotics_goal_id FROM public.developmental_goals WHERE name = 'STEM and Robotics' LIMIT 1;

    -- Update products table with scores from product_developmental_goals
    IF cognitive_goal_id IS NOT NULL THEN
        UPDATE public.products p
        SET cognitive_score = COALESCE(
            (SELECT pdg.score
             FROM public.product_developmental_goals pdg
             WHERE pdg.product_id = p.id AND pdg.developmental_goal_id = cognitive_goal_id LIMIT 1),
            p.cognitive_score
        );
    ELSE
        RAISE NOTICE 'Cognitive Development goal ID not found. Scores for cognitive_score not migrated.';
    END IF;

    IF creativity_goal_id IS NOT NULL THEN
        UPDATE public.products p
        SET creativity_imagination_score = COALESCE(
            (SELECT pdg.score
             FROM public.product_developmental_goals pdg
             WHERE pdg.product_id = p.id AND pdg.developmental_goal_id = creativity_goal_id LIMIT 1),
            p.creativity_imagination_score
        );
    ELSE
        RAISE NOTICE 'Creativity and Imagination goal ID not found. Scores for creativity_imagination_score not migrated.';
    END IF;

    IF motor_skill_goal_id IS NOT NULL THEN
        UPDATE public.products p
        SET motor_skills_score = COALESCE(
            (SELECT pdg.score
             FROM public.product_developmental_goals pdg
             WHERE pdg.product_id = p.id AND pdg.developmental_goal_id = motor_skill_goal_id LIMIT 1),
            p.motor_skills_score
        );
    ELSE
        RAISE NOTICE 'Motor Skills goal ID not found. Scores for motor_skills_score not migrated.';
    END IF;

    IF stem_robotics_goal_id IS NOT NULL THEN
        UPDATE public.products p
        SET stem_robotics_score = COALESCE(
            (SELECT pdg.score
             FROM public.product_developmental_goals pdg
             WHERE pdg.product_id = p.id AND pdg.developmental_goal_id = stem_robotics_goal_id LIMIT 1),
            p.stem_robotics_score
        );
    ELSE
        RAISE NOTICE 'STEM and Robotics goal ID not found. Scores for stem_robotics_score not migrated.';
    END IF;

    RAISE NOTICE 'Developmental goal names updated and data migration re-run successfully.';
END $$;
