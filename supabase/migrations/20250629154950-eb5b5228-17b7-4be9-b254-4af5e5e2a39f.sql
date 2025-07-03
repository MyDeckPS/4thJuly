
-- Add emoji column to developmental_goals table
ALTER TABLE public.developmental_goals 
ADD COLUMN emoji TEXT DEFAULT '🎯';

-- Add boolean columns to products table for each developmental goal
ALTER TABLE public.products
ADD COLUMN has_cognitive_development BOOLEAN DEFAULT false,
ADD COLUMN has_creativity_imagination BOOLEAN DEFAULT false,
ADD COLUMN has_motor_skills BOOLEAN DEFAULT false,
ADD COLUMN has_stem_robotics BOOLEAN DEFAULT false;

-- Migrate existing data: Set boolean to true if score > 0
UPDATE public.products 
SET has_cognitive_development = (cognitive_score > 0),
    has_creativity_imagination = (creativity_imagination_score > 0),
    has_motor_skills = (motor_skills_score > 0),
    has_stem_robotics = (stem_robotics_score > 0);

-- Drop the old score columns
ALTER TABLE public.products
DROP COLUMN cognitive_score,
DROP COLUMN creativity_imagination_score,
DROP COLUMN motor_skills_score,
DROP COLUMN stem_robotics_score;

-- Drop the product_developmental_goals table
DROP TABLE public.product_developmental_goals;

-- Update developmental_goals with emojis
UPDATE public.developmental_goals 
SET emoji = CASE 
  WHEN name = 'Cognitive Development' THEN '🧠'
  WHEN name = 'Creativity and Imagination' THEN '🎨'
  WHEN name = 'Motor Skills' THEN '🏃'
  WHEN name = 'STEM and Robotics' THEN '🔬'
  WHEN name = 'Creative Expression' THEN '🎭'
  WHEN name = 'Problem Solving' THEN '🧩'
  WHEN name = 'Emotional Intelligence' THEN '❤️'
  WHEN name = 'STEM Learning' THEN '⚗️'
  WHEN name = 'Social Skills' THEN '👥'
  WHEN name = 'Language Development' THEN '💬'
  ELSE '🎯'
END;
