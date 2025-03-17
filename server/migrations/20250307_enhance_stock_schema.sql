BEGIN TRANSACTION;

-- Add locations table
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add batch tracking to products
ALTER TABLE products ADD COLUMN batch_tracking BOOLEAN DEFAULT 0;

-- Add expiration date to stock movements
ALTER TABLE stock_movements ADD COLUMN batch_number TEXT;
ALTER TABLE stock_movements ADD COLUMN expiration_date DATETIME;
ALTER TABLE stock_movements ADD COLUMN location_id INTEGER REFERENCES locations(id);

-- Create stock alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  threshold INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

COMMIT;