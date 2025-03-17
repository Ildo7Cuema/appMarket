-- Add ON DELETE CASCADE to stock_movements.product_id
BEGIN TRANSACTION;

-- Create temporary table with new schema
CREATE TABLE temp_stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  movement_type TEXT NOT NULL,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Copy data from old table
INSERT INTO temp_stock_movements
SELECT * FROM stock_movements;

-- Drop old table
DROP TABLE stock_movements;

-- Rename temporary table
ALTER TABLE temp_stock_movements RENAME TO stock_movements;

COMMIT;