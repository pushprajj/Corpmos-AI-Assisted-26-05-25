-- Add industry column to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS industry VARCHAR(255); 