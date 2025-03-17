import fs from 'fs'
import { exec } from 'child_process'
//const crypto = require('../src/services/crypto.service.js').default
import crypto from '../src/services/crypto.service.js'
import path from 'path'

// Tipos de planos e suas durações em dias
const PLANS = {
  mensal: 30,
  trimestral: 90,
  semestral: 180,
  anual: 365,
  hora_1: 1 / 24,
  dias_7: 7,
}

// Regex para validar períodos de teste
const TEST_PERIOD_REGEX = /^(hora_1|dias_7|\d+\s+(hora|dia)s?)$/i

// Converte período de teste para milissegundos
function parseTestPeriod(period) {
  const match = period.match(TEST_PERIOD_REGEX)
  if (!match) return null

  const value = parseInt(match[1])
  const unit = match[2].toLowerCase()

  if (unit === 'hora') {
    return value * 60 * 60 * 1000 // horas para ms
  }
  return value * 24 * 60 * 60 * 1000 // dias para ms
}

// Caminho fixo para armazenar a data de expiração
const EXPIRATION_FILE = path.join(process.cwd(), 'expiration.json')
const LAST_CHECK_FILE = path.join(process.cwd(), '.last_check')

// Verifica se houve alteração na data do sistema
function checkSystemDateIntegrity() {
  try {
    const now = new Date()

    // Se o arquivo de última verificação não existe, cria com a data atual
    if (!fs.existsSync(LAST_CHECK_FILE)) {
      fs.writeFileSync(LAST_CHECK_FILE, now.toISOString())
      return true
    }

    // Lê a última data verificada
    const lastCheck = new Date(fs.readFileSync(LAST_CHECK_FILE, 'utf8'))

    // Se a data atual for anterior à última verificada, é fraude
    if (now < lastCheck) {
      console.error('Fraude detectada: Data do sistema alterada para trás')
      return false
    }

    // Atualiza a última data verificada
    fs.writeFileSync(LAST_CHECK_FILE, now.toISOString())
    return true
  } catch (error) {
    console.error('Erro ao verificar integridade da data:', error)
    return false
  }
}
console.log('Caminho do arquivo de expiração:', EXPIRATION_FILE)
console.log('Diretório atual:', process.cwd())
console.log('Permissões do diretório:', fs.statSync(process.cwd()).mode.toString(8))

// Verifica se o plano fornecido é válido
function isValidPlan(plan) {
  // Remove aspas e espaços extras do plano
  const cleanPlan = plan.replace(/['"]/g, '').trim()

  // Verifica se é um plano fixo
  const isFixedPlan = Object.keys(PLANS).includes(cleanPlan)

  // Verifica se é um período de teste válido
  const isTestPeriod = TEST_PERIOD_REGEX.test(cleanPlan)

  // Se for um período de teste, verifica se está na lista de planos fixos
  if (isTestPeriod && !isFixedPlan) {
    // Adiciona o período de teste à lista de planos
    PLANS[cleanPlan] = parseTestPeriod(cleanPlan) / (24 * 60 * 60 * 1000)
  }

  if (!isFixedPlan && !isTestPeriod) {
    console.error(`Plano inválido: ${plan}`)
    console.error('Planos disponíveis:', Object.keys(PLANS).join(', '))
    console.error('Períodos de teste devem seguir o formato: X horas ou X dias')
  }

  return isFixedPlan || isTestPeriod
}

// Calcula a data de expiração com base no plano ou período de teste
function calculateExpiration(plan) {
  const expirationDate = new Date()
  let duration = null

  // Remove aspas e espaços extras
  const cleanPlan = plan.replace(/['"]/g, '').trim()

  // Verifica se é um plano fixo
  if (PLANS[cleanPlan]) {
    duration = PLANS[cleanPlan] * 24 * 60 * 60 * 1000
  }
  // Verifica se é um período de teste
  else if (TEST_PERIOD_REGEX.test(cleanPlan)) {
    duration = parseTestPeriod(cleanPlan)
    if (!duration) {
      throw new Error(`Período de teste inválido: ${cleanPlan}`)
    }
  } else {
    throw new Error(`Plano inválido: ${cleanPlan}`)
  }

  expirationDate.setTime(expirationDate.getTime() + duration)

  if (isNaN(expirationDate.getTime())) {
    throw new Error('Data de expiração inválida calculada')
  }

  return expirationDate.toISOString()
}

// Armazena a data de expiração no arquivo de forma criptografada
function saveExpirationDate(expirationDate) {
  const data = {
    active: true,
    expiration: expirationDate,
    plan: process.argv[2],
    activationDate: new Date().toISOString(),
    status: 'active',
    testPeriod: TEST_PERIOD_REGEX.test(process.argv[2]),
  }

  console.log('Dados a serem salvos:', data)

  try {
    const jsonData = JSON.stringify(data)
    console.log('Dados antes da criptografia:', jsonData)

    const encryptedData = crypto.encrypt(jsonData)
    console.log('Dados criptografados:', encryptedData)

    // Escreve arquivo criptografado
    fs.writeFileSync(EXPIRATION_FILE, encryptedData)
    console.log('Arquivo de expiração criado com sucesso em:', EXPIRATION_FILE)

    // Armazena dados no arquivo para o frontend acessar
    const frontendDataFile = path.join(process.cwd(), '..', 'public', 'activation-data.json')
    fs.writeFileSync(frontendDataFile, JSON.stringify(data))
    console.log('Dados de ativação armazenados em:', frontendDataFile)
  } catch (error) {
    console.error('Erro ao salvar arquivo de expiração:', error)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }

  // Ativar funcionalidades do sistema
  exec('node enable-features.js', (error) => {
    if (error) {
      console.error('Erro ao ativar funcionalidades:', error)
      process.exit(1)
    }
  })
}

// Verifica se a assinatura expirou
function checkExpiration() {
  try {
    // Verifica integridade da data do sistema
    if (!checkSystemDateIntegrity()) {
      deactivateSystem()
      return true
    }

    if (!fs.existsSync(EXPIRATION_FILE)) return true

    const encryptedData = fs.readFileSync(EXPIRATION_FILE, 'utf8')
    const data = JSON.parse(crypto.decrypt(encryptedData))

    // Verifica se o arquivo está corrompido ou se faltam dados essenciais
    if (!data || !data.expiration || !data.activationDate) return true

    const activationDate = new Date(data.activationDate)
    const expirationDate = new Date(data.expiration)
    const currentDate = new Date()

    // Verifica se a data de ativação é posterior à data de expiração
    if (activationDate > expirationDate) {
      console.error('Erro: Data de ativação posterior à data de expiração')
      return true
    }

    // Verifica se a data atual é posterior à data de expiração
    return currentDate > expirationDate
  } catch (error) {
    console.error('Erro ao verificar expiração:', error)
    return true
  }
}

// Remove o arquivo de expiração e bloqueia o sistema
function deactivateSystem() {
  if (fs.existsSync(EXPIRATION_FILE)) {
    fs.unlinkSync(EXPIRATION_FILE)
  }

  // Desativar funcionalidades do sistema
  exec('node disable-features.js', (error) => {
    if (error) {
      console.error('Erro ao desativar funcionalidades:', error)
    }
  })

  console.log('Sistema desativado. Redirecionando para página de nova assinatura...')
}

// Função principal
function main() {
  // Junta todos os argumentos após o primeiro para lidar com espaços
  // Remove aspas e espaços extras do plano
  const plan = process.argv.slice(2).join(' ').replace(/['"]/g, '').trim()

  if (!plan) {
    console.error('Erro: Nenhum plano fornecido')
    console.error('Exemplos de uso válidos:')
    console.error('  node activation.js "mensal"')
    console.error('  node activation.js dias_7')
    console.error('  node activation.js hora_1')
    process.exit(1)
  }

  if (!isValidPlan(plan)) {
    console.error(`Erro: Plano inválido "${plan}"`)
    console.error('Planos válidos:')
    console.error('  - mensal')
    console.error('  - trimestral')
    console.error('  - semestral')
    console.error('  - anual')
    console.error('  - hora_1 (período de teste)')
    console.error('  - dias_7 (período de teste)')
    process.exit(1)
  }

  const expirationDate = calculateExpiration(plan)
  saveExpirationDate(expirationDate)

  console.log(`Sistema ativado com plano ${plan}. Expira em: ${expirationDate}`)

  // Verifica expiração a cada hora
  setInterval(() => {
    if (checkExpiration()) {
      deactivateSystem()
      process.exit(0)
    }
  }, 60000) // 1 minuto
}

main()
