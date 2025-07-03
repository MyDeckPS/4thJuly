
-- Create child_insights table for storing developmental progress data
CREATE TABLE child_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cognitive_score integer CHECK (cognitive_score >= 0 AND cognitive_score <= 100),
    motor_score integer CHECK (motor_score >= 0 AND motor_score <= 100),
    physical_score integer CHECK (physical_score >= 0 AND physical_score <= 100),
    social_score integer CHECK (social_score >= 0 AND social_score <= 100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create user_messages table for admin-managed messages from MyDeck team
CREATE TABLE user_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    message_type text DEFAULT 'team_message',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create expert_notes table for admin-managed expert insights
CREATE TABLE expert_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create user_recommendations table for admin-curated product recommendations
CREATE TABLE user_recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    admin_opinion text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- Add RLS policies for child_insights
ALTER TABLE child_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own child insights" ON child_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own child insights" ON child_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own child insights" ON child_insights
    FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for user_messages
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages" ON user_messages
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Add RLS policies for expert_notes
ALTER TABLE expert_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expert notes" ON expert_notes
    FOR SELECT USING (auth.uid() = user_id);

-- Add RLS policies for user_recommendations
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations" ON user_recommendations
    FOR SELECT USING (auth.uid() = user_id);

-- Insert default child insights data for existing users
INSERT INTO child_insights (user_id, cognitive_score, motor_score, physical_score, social_score)
SELECT id, 75, 80, 70, 85 FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM child_insights WHERE user_id IS NOT NULL);

-- Insert default team messages for all users
INSERT INTO user_messages (user_id, title, content, message_type)
SELECT id, 'Welcome to MyDeck!', 'We are excited to help you on your child development journey. Our expert team is here to support you every step of the way.', 'team_message'
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_messages WHERE user_id IS NOT NULL AND message_type = 'team_message');

-- Insert default expert notes for all users
INSERT INTO expert_notes (user_id, content)
SELECT id, 'Based on our assessment, your child is showing great progress in their developmental milestones. Keep up the excellent work with consistent play-based learning activities.'
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM expert_notes WHERE user_id IS NOT NULL);
