# Configuração do Banco de Dados

## Caminho do Banco de Dados

O sistema está configurado para usar sempre o arquivo de banco de dados localizado em:

```
/server/server/appmarket.db
```

## Arquivos de Configuração

### 1. Servidor Principal (`server/index.js`)

```javascript
const db = new Database(path.join(__dirname, 'server', 'appmarket.db'), {
  verbose: console.log,
  fileMustExist: true,
})
```

### 2. Rotas de Subscription (`server/server/routes/subscription.routes.js`)

```javascript
const db = new Database(path.join(__dirname, '..', 'appmarket.db'))
```

### 3. Teste ProForma (`server/test-proforma.js`)

```javascript
const db = new Database(path.join(__dirname, 'server', 'appmarket.db'), {
  verbose: console.log,
  fileMustExist: true,
})
```

## Estrutura de Diretórios

```
appMarket/
├── server/
│   ├── index.js                    # Servidor principal
│   ├── test-proforma.js           # Script de teste
│   ├── migrations/                 # Migrações do banco
│   └── server/
│       ├── appmarket.db           # Banco de dados principal
│       └── routes/
│           └── subscription.routes.js
```

## Tabelas Principais

- `users` - Usuários do sistema
- `products` - Produtos (com coluna `is_active`)
- `categories` - Categorias de produtos
- `employees` - Funcionários
- `sales` - Vendas
- `sale_items` - Itens das vendas
- `proforma_invoices` - Faturas pró-forma
- `proforma_invoice_items` - Itens das faturas pró-forma
- `settings` - Configurações da empresa
- `stock_movements` - Movimentações de estoque
- `offline_subscriptions` - Assinaturas offline
- `user_activities` - Atividades dos usuários

## Migrações Aplicadas

1. `20250314_create_proforma_invoices_tables.sql` - Tabelas de faturas pró-forma
2. `20250314_add_is_active_to_products.sql` - Coluna is_active na tabela products

## Verificação do Banco

Para verificar se o banco está funcionando corretamente:

```bash
# Verificar tabelas
sqlite3 server/appmarket.db ".tables"

# Verificar tabelas de faturas pró-forma
sqlite3 server/appmarket.db "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%proforma%';"

# Testar conexão via API
curl -X GET http://localhost:3000/api/proforma-invoices
```

## Importante

- O sistema sempre usa o banco em `/server/server/appmarket.db`
- Todas as migrações devem ser aplicadas neste banco
- O caminho está configurado em todos os arquivos relevantes
- O banco é compartilhado entre todas as funcionalidades do sistema
