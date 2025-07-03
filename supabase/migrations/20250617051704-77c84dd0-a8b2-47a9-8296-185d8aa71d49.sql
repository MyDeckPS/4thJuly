
-- Extend child_insights table to support monthly progress tracking
ALTER TABLE public.child_insights 
ADD COLUMN month_1_score INTEGER DEFAULT 0 CHECK (month_1_score >= 0 AND month_1_score <= 100),
ADD COLUMN month_2_score INTEGER DEFAULT 0 CHECK (month_2_score >= 0 AND month_2_score <= 100),
ADD COLUMN month_3_score INTEGER DEFAULT 0 CHECK (month_3_score >= 0 AND month_3_score <= 100),
ADD COLUMN month_4_score INTEGER DEFAULT 0 CHECK (month_4_score >= 0 AND month_4_score <= 100),
ADD COLUMN month_5_score INTEGER DEFAULT 0 CHECK (month_5_score >= 0 AND month_5_score <= 100),
ADD COLUMN month_6_score INTEGER DEFAULT 0 CHECK (month_6_score >= 0 AND month_6_score <= 100),
ADD COLUMN month_7_score INTEGER DEFAULT 0 CHECK (month_7_score >= 0 AND month_7_score <= 100),
ADD COLUMN month_8_score INTEGER DEFAULT 0 CHECK (month_8_score >= 0 AND month_8_score <= 100),
ADD COLUMN month_9_score INTEGER DEFAULT 0 CHECK (month_9_score >= 0 AND month_9_score <= 100),
ADD COLUMN month_10_score INTEGER DEFAULT 0 CHECK (month_10_score >= 0 AND month_10_score <= 100),
ADD COLUMN month_11_score INTEGER DEFAULT 0 CHECK (month_11_score >= 0 AND month_11_score <= 100),
ADD COLUMN month_12_score INTEGER DEFAULT 0 CHECK (month_12_score >= 0 AND month_12_score <= 100);
