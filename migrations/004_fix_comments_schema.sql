-- Migration to clean up comments schema and ensure correct types
-- 1. Ensure comments.user_id and users.id are both INTEGER and FK is enforced
-- 2. Ensure parent_id is INTEGER and references comments(id)
-- 3. Add deleted_at if missing

-- 1. Drop and recreate FK for user_id if needed
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments ALTER COLUMN user_id TYPE INTEGER USING user_id::integer;
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 2. Ensure parent_id is INTEGER referencing comments(id)
ALTER TABLE comments ALTER COLUMN parent_id TYPE INTEGER USING parent_id::integer;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_parent_id_fkey;
ALTER TABLE comments ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE;

-- 3. Add deleted_at column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE comments ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;
