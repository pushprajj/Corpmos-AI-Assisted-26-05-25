-- Drop the old media_url column if it exists (use with caution on existing data)
ALTER TABLE posts DROP COLUMN IF EXISTS media_url;

-- Create the posts table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  content TEXT,
  post_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0
);

-- Create a new table for post media to handle multiple URLs
CREATE TABLE post_media (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id),
  media_url TEXT NOT NULL,
  media_type VARCHAR(50),  -- e.g., 'image', 'video' for better querying
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
