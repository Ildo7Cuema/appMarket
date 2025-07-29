-- Adicionar coluna is_active à tabela products
ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1;

-- Atualizar produtos existentes para ativos
UPDATE products SET is_active = 1 WHERE is_active IS NULL; 