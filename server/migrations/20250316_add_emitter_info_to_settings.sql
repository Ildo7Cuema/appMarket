-- Adicionar campos de informações do emissor à tabela settings
ALTER TABLE settings ADD COLUMN emitter_name TEXT DEFAULT 'Eng. Ildo Cuema';
ALTER TABLE settings ADD COLUMN emitter_title TEXT DEFAULT 'Director Executivo';
ALTER TABLE settings ADD COLUMN emitter_company TEXT DEFAULT 'E-Tech Soluções Digitais, Lda';

-- Atualizar registros existentes com valores padrão
UPDATE settings 
SET emitter_name = 'Eng. Ildo Cuema',
    emitter_title = 'Director Executivo',
    emitter_company = 'E-Tech Soluções Digitais, Lda'
WHERE emitter_name IS NULL OR emitter_title IS NULL OR emitter_company IS NULL; 