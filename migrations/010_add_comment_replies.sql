-- Add parentId column to comments table for threaded replies
ALTER TABLE comments ADD COLUMN parent_id VARCHAR(255) REFERENCES comments(id) ON DELETE CASCADE;