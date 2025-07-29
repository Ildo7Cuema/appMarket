-- Adicionar campo payment_conditions à tabela proforma_invoices
ALTER TABLE proforma_invoices ADD COLUMN payment_conditions TEXT;

-- Atualizar registros existentes com condições de pagamento padrão
UPDATE proforma_invoices 
SET payment_conditions = 'Forma de Pagamento: Transferência Bancária
Conta Bancária: Banco BAI | IBAN: AO06 0006 0000 0000 0000 0010
Pagamento de 50% para início dos trabalhos
Restante contra entrega'
WHERE payment_conditions IS NULL;

-- Atualizar registros existentes com observações padrão se estiverem vazias
UPDATE proforma_invoices 
SET notes = 'Esta fatura pro-forma não substitui a fatura definitiva. É apenas um documento de cotação e não tem valor fiscal.'
WHERE notes IS NULL OR notes = ''; 