import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import cryptoService from '../../src/services/crypto.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const EXPIRATION_FILE = path.join(__dirname, '../expiration.json')

export default (req, res, next) => {
  try {
    // Verifica se o arquivo de expiração existe
    if (!fs.existsSync(EXPIRATION_FILE)) {
      res.clearCookie('token')
      res.setHeader('Clear-Site-Data', '"cookies", "storage"')
      return res.status(403).json({
        message: 'Assinatura expirada ou não encontrada',
        redirect: '/subscription',
        status: 'expired',
      })
    }

    // Lê e descriptografa os dados de expiração
    const encryptedData = fs.readFileSync(EXPIRATION_FILE, 'utf8')
    const decryptedData = cryptoService.decrypt(encryptedData)

    if (!decryptedData) {
      throw new Error('Falha ao descriptografar dados de expiração')
    }

    // Tenta fazer parse dos dados descriptografados
    let expirationData
    try {
      expirationData = JSON.parse(decryptedData)
    } catch (error) {
      throw new Error('Dados de expiração inválidos: ' + error.message)
    }

    // Verifica se a assinatura está válida
    const currentDate = new Date()
    const expirationDate = new Date(expirationData.expiration)

    if (expirationDate < currentDate) {
      // Remove o arquivo de expiração
      fs.unlinkSync(EXPIRATION_FILE)

      // Limpa os dados de autenticação
      res.clearCookie('token')
      res.setHeader('Clear-Site-Data', '"cookies", "storage"')

      return res.status(403).json({
        message: 'Assinatura expirada',
        redirect: '/subscription',
        status: 'expired',
      })
    }

    // Verifica se o usuário tentou alterar a data do sistema
    const lastCheck = fs.existsSync(path.join(__dirname, '../.last_check'))
      ? new Date(fs.readFileSync(path.join(__dirname, '../.last_check'), 'utf8'))
      : currentDate

    if (currentDate < lastCheck) {
      // Data do sistema foi alterada para trás
      fs.unlinkSync(EXPIRATION_FILE)
      res.clearCookie('token')
      res.setHeader('Clear-Site-Data', '"cookies", "storage"')
      return res.status(403).json({
        message: 'Tentativa de manipulação de data detectada',
        redirect: '/subscription',
        status: 'expired',
      })
    }

    // Atualiza o último check
    fs.writeFileSync(path.join(__dirname, '../.last_check'), currentDate.toISOString())

    // Assinatura válida, prossegue
    next()
  } catch (error) {
    console.error('Erro na verificação de assinatura:', error)
    return res.status(500).json({
      message: 'Erro ao verificar assinatura',
      error: error.message,
    })
  }
}
