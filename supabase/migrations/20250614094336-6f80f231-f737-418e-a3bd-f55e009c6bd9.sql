
DO $$
DECLARE
    cognitive_goal_id UUID;
    creativity_goal_id UUID;
    motor_skill_goal_id UUID;
    stem_robotics_goal_id UUID;
BEGIN
    -- Attempt to find the IDs of the core developmental goals by their names.
    -- Please verify these names match exactly what's in your 'developmental_goals' table.
    SELECT id INTO cognitive_goal_id FROM public.developmental_goals WHERE name = 'Cognitive Development' LIMIT 1;
    SELECT id INTO creativity_goal_id FROM public.developmental_goals WHERE name = 'Creativity and Imagination' LIMIT 1;
    SELECT id INTO motor_skill_goal_id FROM public.developmental_goals WHERE name = 'Motor Skills' LIMIT 1;
    SELECT id INTO stem_robotics_goal_id FROM public.developmental_goals WHERE name = 'STEM and Robotics' LIMIT 1;

    -- Update products table with scores from product_developmental_goals.
    -- If a product didn't have a specific goal linked in product_developmental_goals,
    -- its score for that goal will remain as it is (which should be 0 from the previous migration).

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

    RAISE NOTICE 'Data migration for product scores attempted. Check for any specific goal ID not found notices.';
END $$;
