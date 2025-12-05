-- Add images array column to articles table for slideshow support
ALTER TABLE articles ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
