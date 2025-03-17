import express from 'express'
import Database from 'better-sqlite3'
import { encryptData, decryptData } from '../../services/crypto.service.js'
import axios from 'axios'

const router = express.Router()
const db = new Database('server/appmarket.db')

// Configuração do AppyPay
const APPYPAY_API_URL = process.env.APPYPAY_API_URL || 'https://api.appypay.ao'
const APPYPAY_API_KEY = process.env.APPYPAY_API_KEY

// Middleware para verificar API Key do AppyPay
const verifyAppyPayKey = (req, res, next) => {
  const apiKey = req.headers['x-appy-pay-key']
  if (!apiKey || apiKey !== APPYPAY_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// Criação de assinatura com integração ao AppyPay
router.post('/subscriptions', verifyAppyPayKey, async (req, res) => {
  try {
    const { data } = req.body

    // 1. Criar pagamento no AppyPay
    const paymentResponse = await axios.post(
      `${APPYPAY_API_URL}/v1/payments`,
      {
        amount: data.amount,
        currency: 'AOA',
        description: `Assinatura ${data.plan}`,
        callback_url: `${process.env.API_BASE_URL}/subscriptions/callback`,
        metadata: {
          user_id: data.user_id,
          plan: data.plan,
          period: data.period,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${APPYPAY_API_KEY}`,
        },
      },
    )

    // 2. Salvar dados criptografados localmente
    const encryptedData = encryptData({
      ...data,
      appypay_payment_id: paymentResponse.data.id,
      payment_status: 'pending',
    })

    const stmt = db.prepare(`
      INSERT INTO subscriptions (data)
      VALUES (@data)
    `)

    const result = stmt.run({ data: encryptedData })

    res.json({
      success: true,
      id: result.lastInsertRowid,
      payment_url: paymentResponse.data.payment_url,
    })
  } catch (error) {
    console.error('Subscription creation error:', error)
    res.status(500).json({
      error: error.response?.data?.message || error.message,
    })
  }
})

// Recuperar assinatura com verificação de status no AppyPay
router.get('/subscriptions/:id', verifyAppyPayKey, async (req, res) => {
  try {
    const { id } = req.params

    // 1. Buscar assinatura no banco local
    const stmt = db.prepare(`
      SELECT data
      FROM subscriptions
      WHERE id = ?
    `)

    const row = stmt.get(id)
    if (!row) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    const decryptedData = decryptData(row.data)

    // 2. Verificar status do pagamento no AppyPay
    const paymentStatus = await axios.get(
      `${APPYPAY_API_URL}/v1/payments/${decryptedData.appypay_payment_id}`,
      {
        headers: {
          Authorization: `Bearer ${APPYPAY_API_KEY}`,
        },
      },
    )

    // 3. Atualizar status local se necessário
    if (paymentStatus.data.status !== decryptedData.payment_status) {
      const updateStmt = db.prepare(`
        UPDATE subscriptions
        SET data = @data
        WHERE id = ?
      `)

      const updatedData = encryptData({
        ...decryptedData,
        payment_status: paymentStatus.data.status,
      })

      updateStmt.run({ data: updatedData }, id)
    }

    res.json({
      success: true,
      data: {
        ...decryptedData,
        payment_status: paymentStatus.data.status,
      },
    })
  } catch (error) {
    console.error('Subscription retrieval error:', error)
    res.status(500).json({
      error: error.response?.data?.message || error.message,
    })
  }
})

export default router
