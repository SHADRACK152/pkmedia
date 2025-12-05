-- Migration: Add tags support
-- This migration is safe to run multiple times

-- Add tags column to articles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'tags'
  ) THEN
    ALTER TABLE articles ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Create tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on tag name for faster lookups
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
