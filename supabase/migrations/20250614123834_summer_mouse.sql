/*
  # ログインストリーク計算ロジックの調整

  1. 変更内容
    - `users` テーブルの `consecutive_login_days` のデフォルト値を 0 から 1 に変更
    - `users` テーブルの `last_login_date` のデフォルト値を NULL から CURRENT_DATE に変更
    - 既存ユーザーで `last_login_date` が NULL のレコードを更新
    - `update_consecutive_login_days()` 関数から初回ログイン時の特別処理を削除

  2. 理由
    - ユーザーの期待に合わせて、アカウント登録時点で連続ログイン日数を1日目とする
    - より直感的なユーザー体験を提供

  3. セキュリティ
    - 既存のRLSポリシーは変更なし
    - データの整合性を保持
*/

-- Step 1: 既存ユーザーで last_login_date が NULL のレコードを更新
UPDATE users 
SET 
  last_login_date = CURRENT_DATE,
  consecutive_login_days = 1
WHERE last_login_date IS NULL;

-- Step 2: users テーブルのデフォルト値を変更
ALTER TABLE users 
ALTER COLUMN consecutive_login_days SET DEFAULT 1;

ALTER TABLE users 
ALTER COLUMN last_login_date SET DEFAULT CURRENT_DATE;

-- Step 3: update_consecutive_login_days() 関数を修正
CREATE OR REPLACE FUNCTION update_consecutive_login_days()
RETURNS TRIGGER AS $$
DECLARE
  days_diff integer;
BEGIN
  -- Only process if last_login_date actually changed
  IF OLD.last_login_date IS DISTINCT FROM NEW.last_login_date THEN
    
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;