-- ============================================
-- MIGRATION: Disable RLS on missions table
-- ============================================
-- Date: 22 novembre 2025
-- Description: Ensure missions table is accessible for CRUD operations

-- Disable RLS on missions table if it's enabled
ALTER TABLE missions DISABLE ROW LEVEL SECURITY;

-- Ensure public can insert/select/update/delete
GRANT ALL PRIVILEGES ON missions TO anon;
GRANT ALL PRIVILEGES ON missions TO authenticated;

-- If RLS is re-enabled in the future, use these policies:
/*
-- Create RLS policies for missions
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all missions
CREATE POLICY "Allow authenticated users to view missions"
  ON missions FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create missions
CREATE POLICY "Allow authenticated users to create missions"
  ON missions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update missions
CREATE POLICY "Allow authenticated users to update missions"
  ON missions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete missions
CREATE POLICY "Allow authenticated users to delete missions"
  ON missions FOR DELETE
  TO authenticated
  USING (true);
*/

-- ============================================
-- Verify table is accessible
-- ============================================
-- SELECT COUNT(*) FROM missions;
