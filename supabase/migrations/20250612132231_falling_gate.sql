/*
  # Setup daily quiz count reset using pg_cron

  1. Create cron job to reset daily quiz counts
    - Runs every day at midnight JST (15:00 UTC)
    - Calls the reset-daily-quiz-count Edge Function
    - Uses pg_cron extension

  2. Security
    - Uses service role authentication
    - Only resets users whose last_reset is not today
*/

-- Create a cron job to reset daily quiz counts at midnight JST (15:00 UTC)
-- This will run every day at 15:00 UTC which is 00:00 JST (midnight in Japan)
SELECT cron.schedule(
  'reset-daily-quiz-count',
  '0 15 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://twzhqyxllwrupsqzrprr.supabase.co/functions/v1/reset-daily-quiz-count',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);