-- Add SKU and Category columns to products table
ALTER TABLE products
ADD COLUMN sku VARCHAR(50),
ADD COLUMN category VARCHAR(100);
