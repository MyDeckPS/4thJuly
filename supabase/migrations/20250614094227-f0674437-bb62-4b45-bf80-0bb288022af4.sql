
-- Add new score columns to the products table
ALTER TABLE public.products
ADD COLUMN cognitive_score INTEGER DEFAULT 0,
ADD COLUMN creativity_imagination_score INTEGER DEFAULT 0,
ADD COLUMN motor_skills_score INTEGER DEFAULT 0,
ADD COLUMN stem_robotics_score INTEGER DEFAULT 0;

-- Add check constraints for the new score columns
ALTER TABLE public.products
ADD CONSTRAINT check_cognitive_score CHECK (cognitive_score >= 0 AND cognitive_score <= 100),
ADD CONSTRAINT check_creativity_imagination_score CHECK (creativity_imagination_score >= 0 AND creativity_imagination_score <= 100),
ADD CONSTRAINT check_motor_skills_score CHECK (motor_skills_score >= 0 AND motor_skills_score <= 100),
ADD CONSTRAINT check_stem_robotics_score CHECK (stem_robotics_score >= 0 AND stem_robotics_score <= 100);

-- It's good practice to update existing NULL values to the default if any rows exist,
-- though an explicit DEFAULT 0 during ADD COLUMN should handle new rows and potentially existing ones depending on the DB.
-- This makes sure any existing products get a baseline score.
UPDATE public.products
SET
  cognitive_score = COALESCE(cognitive_score, 0),
  creativity_imagination_score = COALESCE(creativity_imagination_score, 0),
  motor_skills_score = COALESCE(motor_skills_score, 0),
  stem_robotics_score = COALESCE(stem_robotics_score, 0);
