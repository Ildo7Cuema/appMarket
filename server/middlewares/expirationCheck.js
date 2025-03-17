import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import crypto from '../../src/services/crypto.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const EXPIRATION_FILE = path.join(__dirname, '../expiration.json')

function decryptData(encrypted) {
  return JSON.parse(crypto.decrypt(encrypted))
}

export default (req, res, next) => {
  try {
    // Verifica se o arquivo de expiração existe
    if (!fs.existsSync(EXPIRATION_FILE)) {
      res.clearCookie('token')
      res.setHeader('Clear-Site-Data', '"cookies", "storage"')

      return res.status(403).json({
        message: 'Assinatura expirada ou não encontrada',
        redirect: 'http://localhost:9000/subscription',
        status: 'expired',
      })
    }

    // Verifica se há erro 403/Forbidden na requisição
    if (res.statusCode === 403 || res.statusMessage === 'Forbidden') {
      res.clearCookie('token')
      res.setHeader('Clear-Site-Data', '"cookies", "storage"')

      return res.status(403).json({
        message: 'Acesso negado - Verifique sua assinatura',
        redirect: 'http://localhost:9000/subscription',
        status: 'expired',
      })
    }

    // Lê e decripta os dados
    const encryptedData = fs.readFileSync(EXPIRATION_FILE, 'utf8')
    const { expirationDate } = decryptData(encryptedData)

    // Verifica se a assinatura está válida
    if (new Date(expirationDate) < new Date()) {
      // Limpa o token de autenticação
      res.clearCookie('token')
      res.setHeader('Clear-Site-Data', '"cookies", "storage"')
      localStorage.removeItem('token')

      return res.status(403).json({
        message: 'Assinatura expirada',
        redirect: '/subscription',
        status: 'expired',
      })
    }

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
