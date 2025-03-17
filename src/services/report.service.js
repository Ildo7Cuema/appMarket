import axios from 'axios'

const API_URL = '/api/reports'

export default {
  async getProductivityReport(period) {
    try {
      const response = await axios.get(`${API_URL}/productivity`, {
        params: { period },
      })
      return { data: response.data }
    } catch (error) {
      console.error('Erro ao buscar relatório de produtividade:', error)
      throw error
    }
  },

  async getEmployeeSalesReport(period) {
    try {
      const response = await axios.get(`${API_URL}/employee-sales`, {
        params: { period },
      })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar relatório de vendas por funcionário:', error)
      throw error
    }
  },

  async getSalesTrendReport(period) {
    try {
      const response = await axios.get(`${API_URL}/sales-trend`, {
        params: { period },
      })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar tendência de vendas:', error)
      throw error
    }
  },

  async getTopSellingProducts() {
    try {
      const response = await axios.get(`${API_URL}/top-products`)
      return { data: response.data.products || response.data }
    } catch (error) {
      console.error('Erro ao buscar produtos mais vendidos:', error)
      throw error
    }
  },
}
