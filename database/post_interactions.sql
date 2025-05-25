-- Create tables for post interactions

-- Based on the error message, it appears the posts.id column is INTEGER, not UUID

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id),
  CONSTRAINT likes_post_fk FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT comments_post_fk FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Add self-reference after table creation
ALTER TABLE comments ADD CONSTRAINT comments_parent_fk 
  FOREIGN KEY(parent_id) REFERENCES comments(id) ON DELETE CASCADE;

-- Shares table
CREATE TABLE IF NOT EXISTS shares (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  shared_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT shares_post_fk FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Add counter columns to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;
