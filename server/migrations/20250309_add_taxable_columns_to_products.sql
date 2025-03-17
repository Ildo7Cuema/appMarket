ALTER TABLE products
ADD COLUMN taxable BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN price_with_tax DECIMAL(10,2) NOT NULL DEFAULT 0.00;

UPDATE products SET
  base_price = price,
  price_with_tax = price * 1.14;