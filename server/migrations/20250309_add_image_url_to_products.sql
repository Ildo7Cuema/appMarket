-- Adiciona colunas para URL da imagem e preço com IVA
ALTER TABLE products
ADD COLUMN image_url TEXT;

ALTER TABLE products
ADD COLUMN price_with_tax REAL;