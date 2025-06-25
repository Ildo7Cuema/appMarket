import { api } from 'boot/axios'

export default {
  async getProducts(query = '', includeInactive = false) {
    try {
      const response = await api.get('/products', {
        params: {
          q: query,
          include_inactive: includeInactive ? 'true' : 'false',
        },
      })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      throw error
    }
  },

  async searchProducts(query) {
    try {
      const response = await api.get('/products/search', {
        params: { q: query },
      })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      throw error
    }
  },

  async getStockMovements(params = {}) {
    try {
      const response = await api.get('/stock-movements', { params })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error)
      throw error
    }
  },

  async getStockHistory(productId, period = '30d') {
    try {
      const response = await api.get('/stock/history', {
        params: { productId, period },
      })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
      throw error
    }
  },

  async getStockAlerts() {
    try {
      const response = await api.get('/stock/alerts')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar alertas:', error)
      throw error
    }
  },

  async getStockBatches() {
    try {
      const response = await api.get('/stock/batches')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar lotes:', error)
      throw error
    }
  },

  async registerMovement(movement) {
    try {
      const response = await api.post('/stock-movements', movement)
      return response.data
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error)
      throw error
    }
  },

  async addProduct(product) {
    try {
      const response = await api.post('/products', product)
      return response.data
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
      throw error
    }
  },

  async updateProduct(id, product) {
    try {
      const response = await api.put(`/products/${id}`, product)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      throw error
    }
  },

  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
      throw error
    }
  },

  async reactivateProduct(id) {
    try {
      const response = await api.patch(`/products/${id}/reactivate`)
      return response.data
    } catch (error) {
      console.error('Erro ao reativar produto:', error)
      throw error
    }
  },
}
