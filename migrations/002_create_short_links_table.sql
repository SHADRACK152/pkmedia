-- Create short_links table for URL shortening
CREATE TABLE IF NOT EXISTS short_links (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) NOT NULL UNIQUE,
  article_id VARCHAR NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  clicks INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on code for fast lookups
CREATE INDEX IF NOT EXISTS idx_short_links_code ON short_links(code);
CREATE INDEX IF NOT EXISTS idx_short_links_article_id ON short_links(article_id);
