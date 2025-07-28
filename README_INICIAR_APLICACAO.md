# 📋 Guia de Inicialização - AppMarket

Este guia contém todas as instruções necessárias para rodar e ativar o projeto AppMarket (Sistema de Venda e Facturamento).

## 🚀 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Quasar CLI** (será instalado automaticamente se necessário)

## 📁 Estrutura do Projeto

```
appMarket/
├── src/                 # Frontend (Vue.js + Quasar)
├── server/              # Backend (Node.js + Express)
├── public/              # Arquivos públicos
└── package.json         # Dependências do projeto
```

## 🔧 Instalação e Configuração

### 1. Instalar Dependências

```bash
# Na pasta raiz do projeto
npm install
# ou
yarn install
```

### 2. Verificar Instalação do Quasar CLI

```bash
# Verificar se o Quasar CLI está instalado
quasar --version

# Se não estiver instalado, instalar globalmente
npm install -g @quasar/cli
```

## 🏃‍♂️ Como Rodar o Projeto

### Opção 1: Desenvolvimento (Recomendado para desenvolvimento)

#### No macOS/Linux:

```bash
# Na pasta raiz do projeto
cd server
./iniciar.sh
```

#### No Windows:

```bash
# Na pasta raiz do projeto
cd server
run-system.bat
```

#### Manualmente (qualquer sistema):

```bash
# Terminal 1 - Frontend (na pasta raiz)
npm run dev
# ou
quasar dev

# Terminal 2 - Backend (na pasta server)
cd server
node index.js
```

### Opção 2: Produção

#### No Windows:

```bash
# Na pasta raiz do projeto
cd server
build-and-start.bat
```

#### Manualmente:

```bash
# 1. Fazer build da aplicação
npm run build
# ou
quasar build

# 2. Iniciar servidor de produção
cd server
node index.js
```

## 🔐 Sistema de Ativação

O AppMarket possui um sistema de ativação por períodos. Você precisa ativar o sistema para que funcione corretamente.

### Tipos de Ativação Disponíveis:

- **Mensal** (30 dias)
- **Trimestral** (90 dias)
- **Semestral** (180 dias)
- **Anual** (365 dias)
- **Teste** (1 hora, 7 dias)

### Como Ativar:

#### No macOS/Linux:

```bash
# Na pasta server
cd server

# Ativação manual (uma vez)
node activation.js mensal
# ou
node activation.js trimestral
# ou
node activation.js semestral
# ou
node activation.js anual

# Ativação automática (repetitiva)
./activar.sh mensal
# ou
./activar.sh trimestral
# ou
./activar.sh semestral
# ou
./activar.sh anual
```

#### No Windows:

```bash
# Na pasta server
cd server

# Ativação manual (uma vez)
node activation.js mensal

# Ativação automática (repetitiva)
activate-monthly.bat
# ou
activate-quarterly.bat
# ou
activate-semiannually.bat
# ou
activate-annually.bat
```

### Scripts de Ativação Rápida:

Para facilitar, existem scripts específicos para cada período:

#### macOS/Linux:

- `activar_mensal.sh` - Ativação mensal
- `activar_trimestral.sh` - Ativação trimestral
- `activar_semestral.sh` - Ativação semestral
- `activar_anual.sh` - Ativação anual

#### Windows:

- `activate-monthly.bat` - Ativação mensal
- `activate-quarterly.bat` - Ativação trimestral
- `activate-semiannually.bat` - Ativação semestral
- `activate-annually.bat` - Ativação anual

## 🌐 Acessando a Aplicação

Após iniciar o projeto:

- **Frontend (Desenvolvimento)**: http://localhost:9000
- **Backend**: http://localhost:3000
- **Produção**: http://localhost:3000

## 📊 Verificar Status da Ativação

Para verificar se o sistema está ativo:

1. Acesse a aplicação no navegador
2. Vá para a página de status de ativação
3. Ou verifique o arquivo `server/expiration.json`

## 🔧 Comandos Úteis

### Desenvolvimento:

```bash
# Iniciar em modo desenvolvimento
npm run dev

# Fazer build
npm run build

# Executar linting
npm run lint

# Formatar código
npm run format
```

### Servidor:

```bash
# Iniciar servidor
npm run server

# Executar seed (criar super admin)
npm run seed
```

### Banco de Dados:

```bash
# Backup do banco (Windows)
cd server
backup-database.bat

# Instalar dependências (Windows)
cd server
install-dependencies.bat
```

## 🚨 Solução de Problemas

### Problema: "Quasar CLI não encontrado"

```bash
npm install -g @quasar/cli
```

### Problema: "Porta já em uso"

```bash
# Verificar processos na porta
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Matar processo
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Problema: "Permissão negada" (macOS/Linux)

```bash
# Dar permissão de execução aos scripts
chmod +x server/*.sh
```

### Problema: "Banco de dados não encontrado"

```bash
# Verificar se o arquivo existe
ls server/appmarket.db

# Se não existir, o servidor criará automaticamente na primeira execução
```

## 📝 Notas Importantes

1. **Sempre ative o sistema** antes de usar a aplicação
2. **Mantenha o servidor rodando** enquanto usar a aplicação
3. **Faça backup regular** do banco de dados
4. **Verifique a data do sistema** - alterações podem afetar a ativação
5. **Use HTTPS em produção** para segurança

## 🔄 Fluxo Completo de Inicialização

1. **Instalar dependências**: `npm install`
2. **Ativar o sistema**: `node server/activation.js mensal`
3. **Iniciar servidor**: `npm run server` (ou usar scripts)
4. **Iniciar frontend**: `npm run dev` (ou usar scripts)
5. **Acessar aplicação**: http://localhost:9000

## 📞 Suporte

Se encontrar problemas:

1. Verifique se todos os pré-requisitos estão instalados
2. Consulte os logs do servidor
3. Verifique o status de ativação
4. Reinicie o servidor se necessário

---

**Desenvolvido por Ildo Cuema**  
**Versão**: 0.0.1  
**Última atualização**: Janeiro 2025
