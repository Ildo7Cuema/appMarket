-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10,2) NOT NULL,
  employee_id INTEGER REFERENCES employees(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_sales_sale_date ON sales(sale_date DESC);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);