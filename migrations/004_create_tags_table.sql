-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on tag name for faster lookups
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
