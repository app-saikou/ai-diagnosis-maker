/*
  # Add insert policy for users table

  1. Changes
    - Add RLS policy to allow users to insert their own data during sign up
    
  2. Security
    - Users can only insert their own data (where id matches their auth.uid())
    - Maintains existing policies for select and update
*/

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);