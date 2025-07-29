import axios from 'axios'
import { useSubscriptionStore } from '../stores/subscription-store'

// Configuração básica do Axios
const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
  retry: 3, // Número de tentativas
  retryDelay: 1000, // Intervalo entre tentativas
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para retentativas
api.interceptors.response.use(undefined, (error) => {
  const config = error.config

  // Se não tiver config ou já tiver tentado o máximo de vezes
  if (!config || !config.retry) {
    return Promise.reject(error)
  }

  // Configurar contador de tentativas
  config.__retryCount = config.__retryCount || 0

  // Verificar se atingiu o número máximo de tentativas
  if (config.__retryCount >= config.retry) {
    return Promise.reject(error)
  }

  // Incrementar contador
  config.__retryCount += 1

  // Criar nova promise para tentar novamente
  const delayRetryRequest = new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, config.retryDelay || 1000)
  })

  return delayRetryRequest.then(() => api(config))
})

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!navigator.onLine) {
      throw new Error('Sem conexão com a internet. Verifique sua rede.')
    }

    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || 'Erro na requisição'
      const errorDetails = error.response.data?.error || 'Detalhes não disponíveis'

      if (status === 401) {
        // Tratar token expirado
        localStorage.removeItem('token')
        window.location.reload()
      }

      if (status === 403 && error.response.data?.redirect) {
        const subscriptionStore = useSubscriptionStore()

        if (error.response.data.status === 'expired') {
          subscriptionStore.setExpired()
        } else {
          subscriptionStore.setNotFound()
        }

        window.location.href = error.response.data.redirect
        return
      }

      if (status === 500) {
        console.error('Erro interno do servidor:', {
          message,
          details: errorDetails,
          stack: error.response.data?.stack,
        })
        throw new Error(`Erro interno no servidor: ${message}. Detalhes: ${errorDetails}`)
      }

      throw new Error(`${message} (Status: ${status})`)
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error('Tempo de requisição esgotado. Tente novamente.')
    }

    // Verificar se o servidor está indisponível
    if (error.message.includes('ECONNREFUSED')) {
      console.error('Servidor indisponível:', error)
      throw new Error('Servidor indisponível. Tente novamente mais tarde.')
    }

    throw new Error('Erro de conexão com o servidor. Tente novamente mais tarde.')
  },
)

const apiService = {
  async get(params) {
    try {
      if (typeof params === 'string') {
        const response = await api.get(params)
        return response.data
      }

      if (params?.endpoint) {
        const response = await api.get(params.endpoint)
        return response.data
      }

      throw new Error('Parâmetros inválidos para o método get')
    } catch (error) {
      throw new Error('Erro na requisição GET: ' + error.message)
    }
  },

  // Métodos de configuração
  async saveSettings(settings) {
    try {
      // Garantir que os campos do emissor tenham valores padrão se não fornecidos
      const settingsWithDefaults = {
        ...settings,
        emitter_name: settings.emitter_name || 'Eng. Ildo Cuema',
        emitter_title: settings.emitter_title || 'Director Executivo',
        emitter_company: settings.emitter_company || 'E-Tech Soluções Digitais, Lda',
      }

      const response = await api.post('/settings', settingsWithDefaults)
      return response.data
    } catch (error) {
      throw new Error('Erro ao salvar configurações: ' + error.message)
    }
  },

  async getCompanySettings(userId) {
    try {
      // Verificar conexão com internet
      if (!navigator.onLine) {
        throw new Error('Sem conexão com a internet. Verifique sua rede.')
      }

      // Verificar se userId é válido
      if (!userId || typeof userId !== 'string') {
        throw new Error('ID de usuário inválido')
      }

      console.log(`Buscando configurações para userId: ${userId}`)

      const response = await api.get(`/settings?user_id=${userId}`, {
        retry: 3,
        retryDelay: 1000,
      })

      console.log('Resposta da API:', response.data)

      if (!response.data) {
        throw new Error('Nenhuma configuração encontrada para este usuário')
      }

      if (!response.data.id) {
        console.warn('Configurações encontradas mas sem company_id:', response.data)
        throw new Error('Configurações da empresa incompletas')
      }

      return response.data.id
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)

      // Verificar se o erro é de timeout
      if (error.code === 'ECONNABORTED') {
        throw new Error('Tempo de requisição esgotado. Verifique sua conexão com a internet.')
      }

      // Verificar se o erro é de rede
      if (error.message.includes('Network Error')) {
        throw new Error('Erro de conexão com o servidor. Verifique sua conexão com a internet.')
      }

      throw new Error(`Erro ao buscar configurações da empresa: ${error.message}`)
    }
  },

  async uploadLogo(formData) {
    try {
      const response = await api.post('/settings/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw new Error('Erro ao fazer upload do logo: ' + error.message)
    }
  },

  // Métodos de estatísticas
  async getTotalUsers() {
    try {
      const response = await api.get('/stats/total-users')
      return response.data.count
    } catch (error) {
      throw new Error('Erro ao buscar total de usuários: ' + error.message)
    }
  },

  async getActiveSessions() {
    try {
      const response = await api.get('/stats/active-sessions')
      return response.data.count
    } catch (error) {
      throw new Error('Erro ao buscar sessões ativas: ' + error.message)
    }
  },

  async getStorageUsage() {
    try {
      const response = await api.get('/stats/storage-usage')
      return response.data
    } catch (error) {
      throw new Error('Erro ao buscar uso de armazenamento: ' + error.message)
    }
  },

  async getDailySales() {
    try {
      const response = await api.get('/stats/daily-sales')
      return response.data
    } catch (error) {
      throw new Error('Erro ao buscar vendas diárias: ' + error.message)
    }
  },

  async getMonthlySales() {
    try {
      const response = await api.get('/stats/monthly-sales')
      return response.data
    } catch (error) {
      throw new Error('Erro ao buscar vendas mensais: ' + error.message)
    }
  },

  async getYearlySales() {
    try {
      const response = await api.get('/stats/yearly-sales')
      return response.data
    } catch (error) {
      throw new Error('Erro ao buscar vendas anuais: ' + error.message)
    }
  },

  async getTotalProducts() {
    try {
      const response = await api.get('/stats/total-products')
      return response.data.count
    } catch (error) {
      throw new Error('Erro ao buscar total de produtos: ' + error.message)
    }
  },

  async getTopProducts() {
    try {
      const response = await api.get('/stats/top-products')
      return response.data
    } catch (error) {
      throw new Error('Erro ao buscar produtos mais vendidos: ' + error.message)
    }
  },
}

export default apiService
