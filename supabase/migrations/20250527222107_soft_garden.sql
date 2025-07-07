/*
  # Add quiz templates support

  1. Changes
    - Add `is_template` column to quizzes table to mark quizzes as templates
    - Add `template_id` column to quizzes table to track template relationships
    - Add indexes for better query performance
    - Add policies for template access

  2. Security
    - Templates are readable by all authenticated users
    - Only template owners can update their templates
    - Users can create quizzes from templates
*/

-- Add template-related columns to quizzes table
ALTER TABLE quizzes
ADD COLUMN IF NOT EXISTS is_template boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES quizzes(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_is_template ON quizzes(is_template);
CREATE INDEX IF NOT EXISTS idx_quizzes_template_id ON quizzes(template_id);

-- Add policies for templates
CREATE POLICY "Templates are readable by all users"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (is_template = true);

CREATE POLICY "Users can create quizzes from templates"
  ON quizzes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    template_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM quizzes templates
      WHERE templates.id = template_id
      AND templates.is_template = true
    )
  );

-- Add function to copy quiz questions and options
CREATE OR REPLACE FUNCTION copy_quiz_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Copy questions
  INSERT INTO quiz_questions (quiz_id, text, "order")
  SELECT NEW.id, text, "order"
  FROM quiz_questions
  WHERE quiz_id = NEW.template_id;

  -- Copy options for each question
  INSERT INTO quiz_options (question_id, text, points)
  SELECT 
    new_questions.id,
    old_options.text,
    old_options.points
  FROM quiz_questions old_questions
  JOIN quiz_questions new_questions ON 
    old_questions.quiz_id = NEW.template_id AND
    new_questions.quiz_id = NEW.id AND
    old_questions.text = new_questions.text
  JOIN quiz_options old_options ON
    old_options.question_id = old_questions.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically copy content when creating from template
CREATE TRIGGER copy_quiz_content_trigger
  AFTER INSERT ON quizzes
  FOR EACH ROW
  WHEN (NEW.template_id IS NOT NULL)
  EXECUTE FUNCTION copy_quiz_content();