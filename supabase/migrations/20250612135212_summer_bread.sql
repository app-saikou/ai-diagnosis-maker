/*
  # Add consecutive login days calculation

  1. New Function
    - `update_consecutive_login_days()`: 連続ログイン日数を自動計算する関数
    
  2. New Trigger
    - `update_consecutive_login_trigger`: last_login_dateが更新された時に連続ログイン日数を計算

  3. Logic
    - 前日からの連続ログインの場合は日数を+1
    - 1日以上空いた場合は1にリセット
    - 同じ日の場合は変更なし
*/

-- Function to update consecutive login days
CREATE OR REPLACE FUNCTION update_consecutive_login_days()
RETURNS TRIGGER AS $$
DECLARE
  days_diff integer;
BEGIN
  -- Only process if last_login_date actually changed
  IF OLD.last_login_date IS DISTINCT FROM NEW.last_login_date THEN
    
    -- If this is the first login (no previous login date)
    IF OLD.last_login_date IS NULL THEN
      NEW.consecutive_login_days := 1;
    ELSE
      -- Calculate the difference in days
      days_diff := NEW.last_login_date - OLD.last_login_date;
      
      -- If logged in yesterday (consecutive), increment the count
      IF days_diff = 1 THEN
        NEW.consecutive_login_days := OLD.consecutive_login_days + 1;
      -- If logged in today (same day), keep the same count
      ELSIF days_diff = 0 THEN
        NEW.consecutive_login_days := OLD.consecutive_login_days;
      -- If more than 1 day gap, reset to 1
      ELSE
        NEW.consecutive_login_days := 1;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update consecutive login days
DROP TRIGGER IF EXISTS update_consecutive_login_trigger ON users;
CREATE TRIGGER update_consecutive_login_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_consecutive_login_days();