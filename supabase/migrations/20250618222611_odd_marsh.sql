-- Drop existing cron job if it exists
SELECT cron.unschedule('reset-daily-quiz-count');

-- Create new cron job with direct SQL approach
-- This will run every day at 15:00 UTC which is 00:00 JST (midnight in Japan)
SELECT cron.schedule(
  'reset-daily-quiz-count',
  '0 15 * * *',
  $$
  UPDATE users 
  SET 
    quizzes_taken_today = 0,
    last_reset = CURRENT_DATE
  WHERE last_reset < CURRENT_DATE;
  $$
);