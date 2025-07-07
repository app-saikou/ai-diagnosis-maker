/*
  # Quiz Application Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key): ユーザーID
      - `display_name` (text): 表示名
      - `is_premium` (boolean): プレミアム会員フラグ
      - `quizzes_taken_today` (integer): 今日作成した診断数
      - `last_reset` (date): 最終リセット日
      - `created_at` (timestamp): 作成日時

    - `quizzes`
      - `id` (uuid, primary key): 診断ID
      - `title` (text): タイトル
      - `description` (text): 説明
      - `created_by` (uuid): 作成者ID
      - `is_template` (boolean): テンプレートフラグ
      - `template_id` (uuid): テンプレート元ID
      - `completions` (integer): 実施回数
      - `likes` (integer): いいね数
      - `created_at` (timestamp): 作成日時

    - `quiz_questions`
      - `id` (uuid, primary key): 質問ID
      - `quiz_id` (uuid): 診断ID
      - `text` (text): 質問文
      - `order` (integer): 表示順

    - `quiz_options`
      - `id` (uuid, primary key): 選択肢ID
      - `question_id` (uuid): 質問ID
      - `text` (text): 選択肢文
      - `points` (jsonb): 各結果への得点

    - `quiz_results`
      - `id` (uuid, primary key): 結果ID
      - `quiz_id` (uuid): 診断ID
      - `title` (text): 結果タイトル
      - `description` (text): 結果説明
      - `image_url` (text): 画像URL

    - `user_quiz_results`
      - `id` (uuid, primary key): 実施結果ID
      - `user_id` (uuid): ユーザーID
      - `quiz_id` (uuid): 診断ID
      - `result_id` (uuid): 結果ID
      - `answers` (jsonb): 回答データ
      - `taken_at` (timestamp): 実施日時

  2. Security
    - すべてのテーブルでRLSを有効化
    - ユーザーは自分のデータのみ読み書き可能
    - 診断は公開データとして全ユーザーが閲覧可能
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  display_name text NOT NULL DEFAULT 'ゲストユーザー',
  is_premium boolean NOT NULL DEFAULT false,
  quizzes_taken_today integer NOT NULL DEFAULT 0,
  last_reset date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  created_by uuid REFERENCES users(id),
  is_template boolean NOT NULL DEFAULT false,
  template_id uuid REFERENCES quizzes(id),
  completions integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes are readable by all users"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create quizzes"
  ON quizzes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own quizzes"
  ON quizzes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  text text NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are readable by all users"
  ON quiz_questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage questions of own quizzes"
  ON quiz_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE id = quiz_id
      AND created_by = auth.uid()
    )
  );

-- Quiz options table
CREATE TABLE IF NOT EXISTS quiz_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  text text NOT NULL,
  points jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Options are readable by all users"
  ON quiz_options
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage options of own quizzes"
  ON quiz_options
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions q
      JOIN quizzes qz ON q.quiz_id = qz.id
      WHERE q.id = question_id
      AND qz.created_by = auth.uid()
    )
  );

-- Quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Results are readable by all users"
  ON quiz_results
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage results of own quizzes"
  ON quiz_results
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE id = quiz_id
      AND created_by = auth.uid()
    )
  );

-- User quiz results table
CREATE TABLE IF NOT EXISTS user_quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  quiz_id uuid NOT NULL REFERENCES quizzes(id),
  result_id uuid NOT NULL REFERENCES quiz_results(id),
  answers jsonb NOT NULL,
  taken_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own results"
  ON user_quiz_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own results"
  ON user_quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);