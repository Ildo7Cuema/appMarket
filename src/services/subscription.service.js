import apiService from './api.service.js'
import cryptoService from './crypto.service.js'
import { subscriptions as supabaseService } from './supabase.service.js'

export default {
  async createSubscription(userId, plan, period) {
    console.log(plan)
    try {
      // 1. Gerar dados de pagamento para AppyPay
      const paymentData = {
        amount: plan.price,
        currency: 'AOA',
        description: `Assinatura ${plan.name}`,
        user_id: userId,
        plan_id: plan.id,
        period: period,
      }

      // 2. Iniciar processo de pagamento
      await this.initiateAppyPayPayment(paymentData)

      // 3. Verificar confirmação do pagamento
      const paymentConfirmed = await this.verifyPayment(paymentData)

      if (!paymentConfirmed) {
        throw new Error('Pagamento não confirmado')
      }

      // 4. Criar assinatura no Supabase
      const supabaseResponse = await supabaseService.createSubscription({
        user_id: userId,
        plan: plan.id,
        period: period,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: this.calculateEndDate(period),
      })

      // 5. Armazenar localmente com criptografia
      const encryptedData = cryptoService.encrypt(
        JSON.stringify({
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: this.calculateEndDate(period),
        }),
      )

      localStorage.setItem('subscriptionData', encryptedData)

      return supabaseResponse
    } catch (error) {
      console.error('Subscription creation failed:', error)
      throw error
    }
  },

  async getSubscription(userId) {
    console.log(userId)
    try {
      // Verificar primeiro no armazenamento local
      const encryptedData = localStorage.getItem('subscriptionData')
      if (encryptedData) {
        try {
          const decryptedData = JSON.parse(cryptoService.decrypt(encryptedData))
          return decryptedData
        } catch (decryptError) {
          console.warn('Failed to decrypt local subscription data:', decryptError)
          localStorage.removeItem('subscriptionData')
        }
      }

      try {
        // Verificar assinatura offline
        const isOfflineSubscriber = await this.checkOfflineSubscription(userId)
        console.log('RASTREIO de ASSINATURA ', isOfflineSubscriber)
        if (!isOfflineSubscriber) {
          throw new Error('OFFLINE_SUBSCRIPTION_REQUIRED')
        }

        // Buscar email do usuário no SQLite
        const userEmail = await this.getUserEmailFromSQLite()

        // Verificar se usuário existe no Supabase
        let { data, error } = await supabaseService.getSubscription(userId)

        if (error?.code === 'PGRST201') {
          // Usuário não encontrado, criar novo cadastro
          await this.createSupabaseUser(userEmail, 'userpassword')
          // Tentar novamente buscar assinatura
          const result = await supabaseService.getSubscription(userId)
          data = result.data
          error = result.error
        }

        if (error) {
          if (error.code === 'PGRST106') {
            // Tabela não existe, criar nova
            console.log('Tabela não existe')
            await this.createSubscriptionTable()
            return null
          }
          throw error
        }

        // Armazenar dados obtidos localmente
        const encryptedSubscription = cryptoService.encrypt(JSON.stringify(data))
        localStorage.setItem('subscriptionData', encryptedSubscription)

        return data
      } catch (error) {
        // Se erro de conexão e temos cache local, usar cache
        if (error.message.includes('OFFLINE_SUBSCRIPTION_CHECK_FAILED') && encryptedData) {
          console.warn('Using cached subscription data due to connection error')
          return JSON.parse(cryptoService.decrypt(encryptedData))
        }
        throw error
      }
    } catch (error) {
      console.error('Subscription retrieval failed:', error)
      throw error
    }
  },

  async getSubscriptionStatus(userId) {
    console.log(userId)
    try {
      const subscription = await this.getSubscription(userId)
      if (!subscription) return 'inactive'

      // Verificar validade da assinatura
      const now = new Date()
      const endDate = new Date(subscription.end_date)

      if (now > endDate) {
        // Remover assinatura expirada
        localStorage.removeItem('subscriptionData')
        return 'expired'
      }

      return 'active'
    } catch (error) {
      console.error('Error checking subscription status:', error)
      throw error
    }
  },

  async initiateAppyPayPayment(paymentData) {
    try {
      const response = await apiService.post({
        endpoint: '/appy-pay/create-payment',
        data: paymentData,
      })
      return response.payment_url
    } catch (error) {
      console.error('Error initiating payment:', error)
      throw error
    }
  },

  async verifyPayment(paymentData) {
    try {
      const response = await apiService.post({
        endpoint: '/appy-pay/verify-payment',
        data: paymentData,
      })
      return response.payment_confirmed
    } catch (error) {
      console.error('Error verifying payment:', error)
      throw error
    }
  },

  async createSubscriptionTable() {
    try {
      const { data, error } = await supabaseService.createTable({
        name: 'Assinaturas',
        columns: [
          { name: 'user_id', type: 'uuid', primaryKey: true },
          { name: 'plan', type: 'text' },
          { name: 'period', type: 'integer' },
          { name: 'status', type: 'text' },
          { name: 'start_date', type: 'timestamp' },
          { name: 'end_date', type: 'timestamp' },
        ],
      })
      return { data, error }
    } catch (error) {
      console.error('Error creating Assinaturas table:', error)
      throw error
    }
  },

  async getUserEmailFromSQLite() {
    try {
      // Buscar email da tabela settings
      const response = await apiService.get({
        endpoint: `/settings/employee_email`,
      })
      return response.value
    } catch (error) {
      console.error('Error getting user email from SQLite:', error)
      throw error
    }
  },

  async checkOfflineSubscription(userId) {
    // 1. Check local storage first
    const encryptedData = localStorage.getItem('subscriptionData')
    if (encryptedData) {
      try {
        const decryptedData = JSON.parse(cryptoService.decrypt(encryptedData))
        // Verify subscription dates
        const now = new Date()
        const endDate = new Date(decryptedData.end_date)
        return now <= endDate
      } catch (error) {
        console.warn('Failed to decrypt local subscription data:', error)
        localStorage.removeItem('subscriptionData')
      }
    }

    // 2. Check SQLite database if no local data
    try {
      const response = await apiService.get({
        endpoint: `/subscriptions/${userId}`,
      })

      console.log(response)

      if (response) {
        const subscription = response
        const now = new Date()
        const endDate = new Date(subscription.end_date)

        // Cache the subscription data locally
        const encryptedSubscription = cryptoService.encrypt(JSON.stringify(subscription))
        localStorage.setItem('subscriptionData', encryptedSubscription)

        return now <= endDate
      }
    } catch (error) {
      console.error('Error checking subscription:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
      })

      // If we have cached data, use it as fallback
      if (encryptedData) {
        console.warn('Using cached subscription data due to connection error')
        try {
          const decryptedData = JSON.parse(cryptoService.decrypt(encryptedData))
          const now = new Date()
          const endDate = new Date(decryptedData.end_date)
          return now <= endDate
        } catch (decryptError) {
          console.warn('Failed to decrypt fallback data:', decryptError)
        }
      }

      // If we're offline or have a connection error
      if (!navigator.onLine || error.message.includes('conexão')) {
        console.warn('Connection issue detected - checking local status')

        // If we have any subscription data (even expired), return true
        if (localStorage.getItem('subscriptionData')) {
          console.warn('Using existing subscription data')
          return true
        }

        // If no subscription data exists, check if this is the first run
        const firstRun = !localStorage.getItem('subscriptionInitialized')
        if (firstRun) {
          console.warn('First run detected - allowing initial operation')
          localStorage.setItem('subscriptionInitialized', 'true')
          return true
        }

        console.warn('No subscription data available - requiring connection')
        return false
      }

      // For other errors, throw with more context
      throw new Error(`Falha na verificação de assinatura: ${error.message}`)
    }

    return false
  },

  async createSupabaseUser(email, password) {
    try {
      const { data, error } = await supabaseService.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating Supabase user:', error)
      throw error
    }
  },

  calculateEndDate(period) {
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + period)
    return endDate.toISOString()
  },
}
