/*
  # Add cascade delete for user data

  1. Changes
    - Add ON DELETE CASCADE to foreign key constraints in tables referencing users
    - This ensures all user data is properly cleaned up when a user is deleted

  2. Security
    - Users can only delete their own account
    - All related data will be automatically deleted
*/

-- Modify quizzes table to cascade delete
ALTER TABLE quizzes
DROP CONSTRAINT quizzes_created_by_fkey,
ADD CONSTRAINT quizzes_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- Modify user_quiz_results table to cascade delete
ALTER TABLE user_quiz_results
DROP CONSTRAINT user_quiz_results_user_id_fkey,
ADD CONSTRAINT user_quiz_results_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;