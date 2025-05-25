-- Add founded_year and size columns to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS size VARCHAR(50); 