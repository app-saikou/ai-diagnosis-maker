/*
  # Update quiz_results RLS policies

  1. Changes
    - Drop existing INSERT policy
    - Create new INSERT policy with less restrictive conditions
    - Maintain existing SELECT and ALL policies

  2. Security
    - Allows authenticated users to insert quiz results
    - Maintains existing read permissions
    - Maintains existing management permissions for quiz creators
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert quiz results" ON quiz_results;

-- Create new INSERT policy with less restrictive conditions
CREATE POLICY "Users can insert quiz results"
  ON quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (true);