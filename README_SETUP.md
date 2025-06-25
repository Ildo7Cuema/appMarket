# 📦 SETUP DE PRODUÇÃO - AppMarket Sistema de Vendas

## 🎯 Visão Geral

Este guia fornece instruções passo a passo para implementar o AppMarket em produção em qualquer PC Windows/Linux/Mac.

## 📋 Pré-requisitos

### Softwares Necessários

1. **Node.js** (versão 18 ou superior)
   - Download: https://nodejs.org/
   - Verificar instalação: `node --version`

2. **NPM** (instalado com Node.js)
   - Verificar instalação: `npm --version`

3. **Git** (opcional para clonagem)
   - Download: https://git-scm.com/

## 🚀 Instalação Passo a Passo

### 1. Preparação do Ambiente

#### Para Windows:

```bash
# Abrir CMD ou PowerShell como Administrador
# Verificar Node.js
node --version
npm --version
```

#### Para Linux/Mac:

```bash
# Abrir Terminal
# Verificar Node.js
node --version
npm --version
```

### 2. Clonar ou Copiar o Projeto

#### Opção A - Via Git:

```bash
git clone https://github.com/Ildo7Cuema/appMarket.git
cd appMarket
```

#### Opção B - Via arquivo ZIP:

1. Extrair o arquivo ZIP para uma pasta
2. Navegar até a pasta no terminal

### 3. Instalação das Dependências

```bash
# Instalar dependências do projeto
npm install

# Instalar Quasar CLI globalmente
npm install -g @quasar/cli
```

### 4. Configuração do Banco de Dados

O sistema usa SQLite, que já vem configurado. As migrações são executadas automaticamente.

#### Verificar estrutura do banco:

```bash
# O arquivo do banco está em: server/appmarket.db
# As migrações em: server/migrations/
```

### 5. Configuração do Servidor

#### Estrutura de arquivos importantes:

```
appMarket/
├── server/
│   ├── index.js              # Servidor principal
│   ├── appmarket.db          # Banco de dados SQLite
│   ├── uploads/              # Diretório de uploads
│   ├── run-system.bat        # Script Windows
│   ├── iniciar.sh           # Script Linux/Mac
│   └── activate-*.bat       # Scripts de ativação
├── src/                     # Frontend Quasar/Vue
└── package.json
```

## 🔧 Scripts de Execução

### Windows - Arquivos .BAT

#### 1. Script Principal (run-system.bat):

```batch
@echo off
start /min "Quasar Dev" cmd /c quasar dev
start /min "Node Server" cmd /c node index.js
exit
```

#### 2. Scripts de Ativação:

- activate-monthly.bat - Ativação mensal
- activate-quarterly.bat - Ativação trimestral
- activate-semiannually.bat - Ativação semestral
- activate-annually.bat - Ativação anual

#### Como implementar os arquivos .BAT:

1. **Colocar os arquivos .BAT na pasta server/**
2. **Dar permissões de execução:**
   - Clicar com botão direito → Propriedades
   - Desbloquear se necessário

3. **Criar atalho na área de trabalho:**
   - Target: "C:\caminho\para\appMarket\server\run-system.bat"
   - Start in: "C:\caminho\para\appMarket\server"

### Linux/Mac - Scripts Shell

#### Script Principal (iniciar.sh):

```bash
#!/bin/bash
cd "$(dirname "$0")"
echo "Iniciando AppMarket..."
quasar dev &
node index.js &
wait
```

#### Como implementar:

```bash
# Dar permissão de execução
chmod +x server/iniciar.sh
chmod +x server/activar.sh

# Executar
./server/iniciar.sh
```

## 🌐 Configuração de Produção

### 1. Build para Produção

```bash
# Build do frontend
quasar build

# Os arquivos buildados ficarão em: dist/spa/
```

### 2. Servidor de Produção

#### Opção A - Usando PM2 (Recomendado):

```bash
# Instalar PM2
npm install -g pm2

# Iniciar com PM2
pm2 start server/index.js --name "appmarket-server"
pm2 save
pm2 startup
```

#### Opção B - Script de Produção Windows (start-production.bat):

```batch
@echo off
echo Iniciando AppMarket em Produção...
cd /d "%~dp0"
set NODE_ENV=production
start /min "AppMarket Server" cmd /c node server/index.js
echo Servidor iniciado na porta 3000
pause
```

#### Opção C - Script de Produção Linux/Mac (start-production.sh):

```bash
#!/bin/bash
cd "$(dirname "$0")"
export NODE_ENV=production
echo "Iniciando AppMarket em Produção..."
nohup node server/index.js > appmarket.log 2>&1 &
echo $! > appmarket.pid
echo "Servidor iniciado na porta 3000"
```

## 🔐 Sistema de Licenciamento

### Configuração de Ativação

1. **Arquivos de ativação estão em server/:**
   - activation.js - Script principal de ativação
   - enabled-features.json - Features habilitadas
   - expiration.json - Data de expiração

2. **Scripts automáticos de verificação:**
   - Windows: activate-monthly.bat, etc.
   - Linux: activar_mensal.sh, etc.

### Como configurar licenças:

1. **Editar expiration.json:**

```json
{
  "expirationDate": "2024-12-31T23:59:59.999Z",
  "isActive": true,
  "licenseType": "premium"
}
```

2. **Executar script de ativação:**

```bash
# Windows
activate-monthly.bat

# Linux/Mac
./server/activar_mensal.sh
```

## 📂 Estrutura de Diretórios de Produção

```
/opt/appmarket/  (Linux) ou C:\AppMarket\ (Windows)
├── server/
│   ├── index.js
│   ├── appmarket.db
│   ├── uploads/          # Imagens e arquivos
│   ├── *.bat            # Scripts Windows
│   └── *.sh             # Scripts Linux
├── dist/                # Build de produção
├── logs/                # Logs do sistema
└── backups/             # Backups do banco
```

## 🔧 Comandos Úteis

### Desenvolvimento:

```bash
npm run dev       # Executar em modo desenvolvimento
npm run build     # Build para produção
npm run server    # Executar apenas servidor
```

### Produção:

```bash
# Windows
run-system.bat

# Linux/Mac
./iniciar.sh

# Com PM2
pm2 start server/index.js --name "appmarket-server"
pm2 status
pm2 logs appmarket-server
```

### Manutenção:

```bash
# Backup do banco
cp server/appmarket.db backups/appmarket_$(date +%Y%m%d).db

# Ver logs (Linux/Mac)
tail -f appmarket.log

# Parar processo (Linux/Mac)
kill $(cat appmarket.pid)
```

## 🚨 Troubleshooting

### Problemas Comuns:

1. **Porta 3000 em uso:**

   ```bash
   # Windows
   netstat -ano | findstr :3000

   # Linux/Mac
   lsof -i :3000
   ```

2. **Permissões de arquivo:**

   ```bash
   # Linux/Mac
   chmod +x server/*.sh
   chown -R $USER:$USER server/uploads
   ```

3. **Dependências não instaladas:**

   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

4. **Banco de dados corrompido:**
   ```bash
   # Restaurar backup
   cp backups/appmarket_YYYYMMDD.db server/appmarket.db
   ```

## 📞 Configurações Específicas

### Variáveis de Ambiente (.env):

```
NODE_ENV=production
PORT=3000
BASE_URL=http://localhost:3000
JWT_SECRET=sua-chave-secreta-muito-forte
DB_PATH=server/appmarket.db
```

### Configuração de Rede:

- **Porta padrão:** 3000
- **Frontend:** http://localhost:9000 (dev) ou servido pelo backend (prod)
- **Backend:** http://localhost:3000

## ✅ Checklist de Deployment

- [ ] Node.js instalado (v18+)
- [ ] Dependências instaladas (npm install)
- [ ] Quasar CLI instalado (npm i -g @quasar/cli)
- [ ] Build criado (quasar build)
- [ ] Banco de dados inicializado
- [ ] Scripts .bat/.sh com permissões corretas
- [ ] Sistema de ativação configurado
- [ ] Servidor rodando na porta correta
- [ ] Uploads funcionando
- [ ] Backup automático configurado

## 📝 Notas Importantes

1. **Sempre fazer backup** do banco de dados antes de updates
2. **Testar em ambiente local** antes de deployment
3. **Configurar firewall** para permitir porta 3000
4. **Monitorar logs** regularmente
5. **Atualizar licenças** conforme necessário

## 🆘 Suporte

Para questões técnicas:

- Email: suporte@appmarket.com
- GitHub: https://github.com/Ildo7Cuema/appMarket/issues

---

**© 2024 AppMarket - Sistema de Vendas e Facturamento**
