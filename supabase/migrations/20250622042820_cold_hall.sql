/*
  # Fix user_quiz_results unique constraint

  1. Changes
    - Add unique constraint on (user_id, quiz_id, result_id) combination
    - This allows the upsert operation in saveQuizResult to work correctly
  
  2. Security
    - No changes to existing RLS policies
    - Maintains data integrity by preventing duplicate quiz results
*/

-- Add unique constraint to user_quiz_results table
-- This constraint allows the ON CONFLICT clause in upsert operations to work properly
ALTER TABLE user_quiz_results 
ADD CONSTRAINT user_quiz_results_user_quiz_result_unique 
UNIQUE (user_id, quiz_id, result_id);