-- Newsletter Advanced Features Migration (PostgreSQL)

-- Add preferences and verification to subscribers
ALTER TABLE newsletter_subscribers 
ADD COLUMN IF NOT EXISTS preferences TEXT DEFAULT '[]',
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS metadata TEXT DEFAULT '{}';

-- Create newsletter schedules table
CREATE TABLE IF NOT EXISTS newsletter_schedules (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly')),
  send_time TEXT NOT NULL,
  day_of_week INTEGER,
  day_of_month INTEGER,
  template_id VARCHAR REFERENCES newsletter_templates(id),
  article_count INTEGER DEFAULT 5,
  segment TEXT,
  last_sent_at TIMESTAMP,
  next_send_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schedules_next_send ON newsletter_schedules(next_send_at, is_active);

-- Create newsletter templates table
CREATE TABLE IF NOT EXISTS newsletter_templates (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('daily_digest', 'weekly_roundup', 'breaking_news', 'custom')),
  subject_template TEXT NOT NULL,
  header_color TEXT DEFAULT '#1e293b',
  accent_color TEXT DEFAULT '#ef4444',
  layout TEXT NOT NULL CHECK(layout IN ('compact', 'featured', 'grid')),
  include_images BOOLEAN DEFAULT true,
  custom_intro TEXT,
  custom_footer TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default templates
INSERT INTO newsletter_templates (name, description, type, subject_template, layout) 
VALUES
('Daily Digest', 'Your daily news roundup with top stories', 'daily_digest', '📰 Daily Digest - {date}', 'compact'),
('Weekly Roundup', 'Top stories from the past week', 'weekly_roundup', '📅 Weekly Roundup - {date}', 'featured'),
('Breaking News', 'Urgent breaking news alert', 'breaking_news', '🚨 Breaking: {title}', 'featured')
ON CONFLICT DO NOTHING;

-- Create newsletter sends tracking table
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR REFERENCES newsletter_templates(id) ON DELETE SET NULL,
  schedule_id VARCHAR REFERENCES newsletter_schedules(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  article_ids TEXT NOT NULL,
  recipient_count INTEGER NOT NULL,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_by VARCHAR
);

CREATE INDEX IF NOT EXISTS idx_sends_date ON newsletter_sends(sent_at);

-- Create newsletter events tracking (opens, clicks)
CREATE TABLE IF NOT EXISTS newsletter_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id VARCHAR NOT NULL REFERENCES newsletter_sends(id) ON DELETE CASCADE,
  subscriber_email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  article_id VARCHAR,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_send ON newsletter_events(send_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_email ON newsletter_events(subscriber_email, event_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON newsletter_events(created_at);

-- Create drip campaign table
CREATE TABLE IF NOT EXISTS newsletter_drip_campaigns (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL CHECK(trigger_event IN ('subscribe', 'first_article_view', 'custom')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create drip campaign emails table
CREATE TABLE IF NOT EXISTS newsletter_drip_emails (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id VARCHAR NOT NULL REFERENCES newsletter_drip_campaigns(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  delay_days INTEGER NOT NULL,
  delay_hours INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create drip campaign tracking
CREATE TABLE IF NOT EXISTS newsletter_drip_tracking (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id VARCHAR NOT NULL REFERENCES newsletter_drip_campaigns(id) ON DELETE CASCADE,
  subscriber_email TEXT NOT NULL,
  email_id VARCHAR NOT NULL REFERENCES newsletter_drip_emails(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK(status IN ('scheduled', 'sent', 'failed')),
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_drip_tracking_scheduled ON newsletter_drip_tracking(scheduled_for, status);

-- Create newsletter archive table
CREATE TABLE IF NOT EXISTS newsletter_archives (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id VARCHAR NOT NULL UNIQUE REFERENCES newsletter_sends(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  html_content TEXT NOT NULL,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  views INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_archives_published ON newsletter_archives(published_at);
CREATE INDEX IF NOT EXISTS idx_archives_slug ON newsletter_archives(slug);

-- Insert default welcome drip campaign
INSERT INTO newsletter_drip_campaigns (name, trigger_event) 
VALUES ('Welcome Series', 'subscribe')
ON CONFLICT DO NOTHING;

-- Insert welcome series emails (only if campaign exists)
INSERT INTO newsletter_drip_emails (campaign_id, sequence_number, subject, html_content, delay_days) 
SELECT id, 1, '👋 Welcome to PKMedia!', 
'<h1>Welcome to PKMedia!</h1><p>Thank you for subscribing to The Morning Brief. You''ll receive daily news updates every morning.</p>', 
0
FROM newsletter_drip_campaigns WHERE name = 'Welcome Series'
ON CONFLICT DO NOTHING;

INSERT INTO newsletter_drip_emails (campaign_id, sequence_number, subject, html_content, delay_days)
SELECT id, 2, '📰 Your First Week at PKMedia',
'<h1>Enjoying the news?</h1><p>Here are some popular categories you might be interested in...</p>',
3
FROM newsletter_drip_campaigns WHERE name = 'Welcome Series'
ON CONFLICT DO NOTHING;

INSERT INTO newsletter_drip_emails (campaign_id, sequence_number, subject, html_content, delay_days)
SELECT id, 3, '⭐ Get the Most Out of PKMedia',
'<h1>Pro Tips</h1><p>Did you know you can customize your preferences? Click here to choose your favorite topics.</p>',
7
FROM newsletter_drip_campaigns WHERE name = 'Welcome Series'
ON CONFLICT DO NOTHING;
