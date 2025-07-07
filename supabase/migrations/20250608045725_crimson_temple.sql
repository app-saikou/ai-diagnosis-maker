/*
  # Add quiz likes functionality

  1. New Tables
    - `quiz_likes`
      - `id` (uuid, primary key): いいねID
      - `quiz_id` (uuid): 診断ID
      - `user_id` (uuid): ユーザーID
      - `created_at` (timestamp): いいね日時

  2. Security
    - Enable RLS on quiz_likes table
    - Users can only read/create/delete their own likes
    - Add unique constraint to prevent duplicate likes

  3. Triggers
    - Add trigger to update quiz likes count automatically
*/

-- Create quiz_likes table
CREATE TABLE IF NOT EXISTS quiz_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(quiz_id, user_id)
);

-- Enable RLS
ALTER TABLE quiz_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can read all likes"
  ON quiz_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own likes"
  ON quiz_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON quiz_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_likes_quiz_id ON quiz_likes(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_likes_user_id ON quiz_likes(user_id);

-- Function to update quiz likes count
CREATE OR REPLACE FUNCTION update_quiz_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment likes count
    UPDATE quizzes 
    SET likes = likes + 1 
    WHERE id = NEW.quiz_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement likes count
    UPDATE quizzes 
    SET likes = GREATEST(0, likes - 1) 
    WHERE id = OLD.quiz_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update likes count
CREATE TRIGGER update_quiz_likes_count_trigger
  AFTER INSERT OR DELETE ON quiz_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_likes_count();