-- Add payment columns to sales table
ALTER TABLE sales
ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'Dinheiro',
ADD COLUMN amount_received DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN change_amount DECIMAL(10,2) NOT NULL DEFAULT 0;