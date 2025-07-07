/*
  # Add quiz results insert policy

  1. Security Changes
    - Add RLS policy to allow authenticated users to insert quiz results
    - Policy ensures users can only insert results for quizzes they have access to
    - Maintains existing read permissions

  2. Changes
    - Adds new INSERT policy for quiz_results table
    - Links policy to authenticated role
    - Validates quiz_id exists and is accessible
*/

-- Add policy to allow authenticated users to insert quiz results
CREATE POLICY "Users can insert quiz results"
  ON quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM quizzes
      WHERE quizzes.id = quiz_results.quiz_id
      AND (
        -- Allow if quiz is a template
        quizzes.is_template = true
        OR
        -- Or if user owns the quiz
        quizzes.created_by = auth.uid()
      )
    )
  );