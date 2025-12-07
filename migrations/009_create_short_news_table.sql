-- Create short_news table for quick news updates
CREATE TABLE IF NOT EXISTS short_news (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  link_url TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_short_news_status ON short_news(status);
CREATE INDEX IF NOT EXISTS idx_short_news_category ON short_news(category);
CREATE INDEX IF NOT EXISTS idx_short_news_created_at ON short_news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_short_news_pinned ON short_news(is_pinned);
