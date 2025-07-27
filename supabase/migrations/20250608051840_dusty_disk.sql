/*
  # Add profile image and statistics columns

  1. New Columns
    - `profile_image_url` (text): プロフィール画像URL
    - `total_quizzes_taken` (integer): 総相談回数
    - `consecutive_login_days` (integer): 連続ログイン日数
    - `total_quizzes_created` (integer): 総相談作成回数
    - `last_login_date` (date): 最終ログイン日
    - `stripe_customer_id` (text): Stripe顧客ID
    - `stripe_subscription_id` (text): StripeサブスクリプションID

  2. Performance
    - Add indexes for Stripe columns
    - Add functions and triggers for automatic counting

  3. Security
    - Maintain existing RLS policies
*/

-- Add profile image URL column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image_url text;

-- Add total statistics columns for better performance
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS total_quizzes_taken integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS consecutive_login_days integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_quizzes_created integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_date date;

-- Add Stripe-related columns for future premium features
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);

-- Function to update quiz creation count
CREATE OR REPLACE FUNCTION update_quiz_creation_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment for non-template quizzes created by authenticated users
  IF NEW.created_by IS NOT NULL AND (NEW.is_template = false OR NEW.is_template IS NULL) THEN
    UPDATE users 
    SET total_quizzes_created = total_quizzes_created + 1
    WHERE id = NEW.created_by;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update quiz taken count
CREATE OR REPLACE FUNCTION update_quiz_taken_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment total_quizzes_taken for the user
  UPDATE users 
  SET total_quizzes_taken = total_quizzes_taken + 1
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist and recreate them
DROP TRIGGER IF EXISTS update_quiz_creation_trigger ON quizzes;
DROP TRIGGER IF EXISTS update_quiz_taken_trigger ON user_quiz_results;

-- Create triggers to automatically update counts
CREATE TRIGGER update_quiz_creation_trigger
  AFTER INSERT ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_creation_count();

CREATE TRIGGER update_quiz_taken_trigger
  AFTER INSERT ON user_quiz_results
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_taken_count();