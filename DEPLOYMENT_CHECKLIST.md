# ✅ CHECKLIST DE DEPLOYMENT - AppMarket

## 📝 Lista de Verificação Completa

### ⚙️ Preparação do Ambiente

**Windows:**
- [ ] Node.js v18+ instalado
- [ ] NPM funcionando
- [ ] PowerShell/CMD com permissões de administrador
- [ ] Antivírus configurado para permitir execução dos .bat
- [ ] Porta 3000 liberada no firewall

**Linux/Mac:**
- [ ] Node.js v18+ instalado
- [ ] NPM funcionando
- [ ] Terminal com permissões adequadas
- [ ] Scripts .sh com permissão de execução
- [ ] Porta 3000 liberada no firewall

### 📦 Instalação

**Passo 1 - Obter o código:**
- [ ] Projeto clonado via Git ou extraído do ZIP
- [ ] Navegado para a pasta do projeto
- [ ] Estrutura de pastas verificada (src/, server/, package.json)

**Passo 2 - Dependências:**
- [ ] Executado `npm install` com sucesso
- [ ] Quasar CLI instalado globalmente
- [ ] Todas as dependências resolvidas sem erros
- [ ] Pasta node_modules criada

**Passo 3 - Build:**
- [ ] Executado `quasar build` com sucesso  
- [ ] Pasta dist/ criada com arquivos buildados
- [ ] Nenhum erro de build reportado

### 🗄️ Banco de Dados

- [ ] Arquivo server/appmarket.db existe
- [ ] Migrações executadas automaticamente
- [ ] Tabelas criadas corretamente
- [ ] Dados de seed inseridos (usuário admin)
- [ ] Pasta de backups criada
- [ ] Primeiro backup manual feito

### 🔧 Scripts de Execução

**Windows (.bat):**
- [ ] server/start-production.bat criado
- [ ] server/install-dependencies.bat criado  
- [ ] server/build-and-start.bat criado
- [ ] server/backup-database.bat criado
- [ ] Todos os .bat com permissões adequadas
- [ ] Atalhos na área de trabalho criados (opcional)

**Linux/Mac (.sh):**
- [ ] start-production.sh criado
- [ ] server/iniciar.sh com permissões +x
- [ ] server/activar*.sh com permissões +x
- [ ] Scripts testados e funcionando

### 🌐 Configuração de Servidor

**Básico:**
- [ ] Servidor rodando na porta 3000
- [ ] Frontend acessível
- [ ] Backend respondendo às APIs
- [ ] Upload de arquivos funcionando
- [ ] Pasta server/uploads com permissões corretas

**Produção (Opcional):**
- [ ] PM2 instalado e configurado
- [ ] Processo reinicia automaticamente
- [ ] Logs sendo salvos
- [ ] Nginx configurado (se usando proxy)
- [ ] SSL configurado (se necessário)

### 🔐 Sistema de Licenciamento

- [ ] Arquivo server/expiration.json configurado
- [ ] Arquivo server/enabled-features.json verificado
- [ ] Scripts de ativação funcionando
- [ ] Data de expiração definida corretamente
- [ ] Tipo de licença configurado

### 🧪 Testes Funcionais

**Login e Autenticação:**
- [ ] Página de login carrega
- [ ] Login com credenciais padrão funciona
- [ ] JWT sendo gerado corretamente
- [ ] Redirecionamento após login funciona

**Funcionalidades Principais:**
- [ ] Dashboard carrega sem erros
- [ ] CRUD de produtos funciona
- [ ] CRUD de categorias funciona
- [ ] Sistema de vendas funciona
- [ ] Relatórios são gerados
- [ ] Upload de imagens funciona

**Base de Dados:**
- [ ] Dados persistem entre reinicializações
- [ ] Backup manual funciona
- [ ] Restore de backup funciona
- [ ] Performance aceitável

### 🚀 Deploy Final

**Configuração:**
- [ ] Variáveis de ambiente configuradas
- [ ] URLs e portas corretas
- [ ] Logs funcionando
- [ ] Monitoramento ativo

**Segurança:**
- [ ] Senhas padrão alteradas
- [ ] JWT_SECRET configurado
- [ ] Firewall configurado
- [ ] Antivírus permitindo execução

**Backup e Recuperação:**
- [ ] Backup automático configurado
- [ ] Procedimento de restore testado
- [ ] Backup armazenado em local seguro
- [ ] Agendamento de backups definido

### 📋 Scripts Rápidos

**Windows - Primeiro Deploy:**
```batch
# 1. Instalar dependências
server\install-dependencies.bat

# 2. Build e iniciar
server\build-and-start.bat

# 3. Fazer backup
server\backup-database.bat
```

**Linux/Mac - Primeiro Deploy:**
```bash
# 1. Instalar dependências
npm install
npm install -g @quasar/cli

# 2. Build e iniciar
quasar build
./start-production.sh

# 3. Fazer backup
cp server/appmarket.db backups/
```

### 🔍 Verificação Final

**Acessibilidade:**
- [ ] http://localhost:3000 carrega
- [ ] Login funciona
- [ ] Todas as páginas acessíveis
- [ ] Não há erros no console

**Performance:**
- [ ] Tempo de carregamento < 3 segundos
- [ ] Navegação fluida
- [ ] Sem travamentos
- [ ] Uso de memória normal

**Produção:**
- [ ] Servidor reinicia automaticamente
- [ ] Logs sendo escritos
- [ ] Backups automáticos funcionando
- [ ] Sistema de licenciamento ativo

### 🚨 Troubleshooting Rápido

**Problemas Comuns:**

❌ **"Node.js não encontrado"**
✅ Instalar Node.js v18+ de nodejs.org

❌ **"Porta 3000 em uso"**  
✅ `netstat -ano | findstr :3000` (Windows) ou `lsof -i :3000` (Linux/Mac)

❌ **"Quasar command not found"**
✅ `npm install -g @quasar/cli`

❌ **"Database não encontrada"**
✅ Verificar se server/appmarket.db existe

❌ **"Permissão negada"**
✅ `chmod +x server/*.sh` (Linux/Mac)

❌ **"Dependências não instaladas"**
✅ Deletar node_modules e executar `npm install`

### 📞 Contatos de Suporte

- **Documentação:** README_SETUP.md
- **Issues:** GitHub Issues
- **Email:** suporte@appmarket.com

---

✅ **DEPLOYMENT COMPLETO QUANDO TODOS OS ITENS ESTIVEREM MARCADOS**
