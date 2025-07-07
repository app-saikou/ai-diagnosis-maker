/*
  # Set timezone to Asia/Tokyo

  1. Changes
    - Set timezone to Asia/Tokyo for all database sessions
    - This ensures all timestamps are stored in JST
*/

-- Set timezone to Asia/Tokyo
ALTER DATABASE postgres SET timezone TO 'Asia/Tokyo';

-- Update existing timestamps to JST
UPDATE users 
SET created_at = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo';

UPDATE quizzes 
SET created_at = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo';

UPDATE quiz_questions 
SET created_at = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo';

UPDATE quiz_options 
SET created_at = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo';

UPDATE quiz_results 
SET created_at = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo';

UPDATE user_quiz_results 
SET taken_at = taken_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo';