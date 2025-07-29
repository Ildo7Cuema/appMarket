-- Criar tabela de faturas pró-forma
CREATE TABLE IF NOT EXISTS proforma_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    client_address TEXT,
    client_nif TEXT,
    client_nuit TEXT,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
    notes TEXT,
    total_amount DECIMAL(10,2) DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Criar tabela de itens das faturas pró-forma
CREATE TABLE IF NOT EXISTS proforma_invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES proforma_invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_proforma_invoices_number ON proforma_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_proforma_invoices_client ON proforma_invoices(client_name);
CREATE INDEX IF NOT EXISTS idx_proforma_invoices_status ON proforma_invoices(status);
CREATE INDEX IF NOT EXISTS idx_proforma_invoices_date ON proforma_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_proforma_invoices_created_by ON proforma_invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_proforma_invoice_items_invoice_id ON proforma_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_proforma_invoice_items_product_id ON proforma_invoice_items(product_id);

-- Inserir dados de exemplo
INSERT OR IGNORE INTO proforma_invoices (
    client_name, 
    client_email, 
    client_phone, 
    client_address, 
    client_nif, 
    client_nuit,
    invoice_number, 
    invoice_date, 
    due_date, 
    status, 
    notes, 
    total_amount, 
    created_by
) VALUES 
(
    'Empresa ABC Ltda',
    'contato@empresaabc.com',
    '+244 123 456 789',
    'Rua das Flores, 123 - Luanda',
    '123456789',
    '987654321',
    'PF20250314001',
    '2025-03-14',
    '2025-04-14',
    'sent',
    'Fatura pró-forma para aprovação',
    150000.00,
    1
),
(
    'Comércio XYZ',
    'vendas@comercioxyz.com',
    '+244 987 654 321',
    'Av. 4 de Fevereiro, 456 - Luanda',
    '987654321',
    '123456789',
    'PF20250314002',
    '2025-03-14',
    '2025-04-14',
    'draft',
    'Aguardando confirmação de preços',
    75000.00,
    1
);

-- Inserir itens de exemplo
INSERT OR IGNORE INTO proforma_invoice_items (
    invoice_id,
    product_id,
    description,
    quantity,
    price,
    total
) VALUES 
(1, 1, 'Produto A - Especificações técnicas', 10, 10000.00, 100000.00),
(1, 2, 'Produto B - Acessórios', 5, 10000.00, 50000.00),
(2, 3, 'Serviço de Consultoria', 1, 75000.00, 75000.00); 