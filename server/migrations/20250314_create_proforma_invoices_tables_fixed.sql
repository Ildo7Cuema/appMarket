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
    emitter_name TEXT DEFAULT 'Eng. Ildo Cuema',
    emitter_title TEXT DEFAULT 'Director Executivo',
    emitter_company TEXT DEFAULT 'E-Tech Soluções Digitais, Lda',
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