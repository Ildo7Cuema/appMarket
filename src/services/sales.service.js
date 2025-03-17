import axios from 'axios'

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

export default {
  async createSale(sale) {
    const response = await axios.post(`${API_URL}/sales`, sale)
    return response.data
  },

  async getSales() {
    const response = await axios.get(`${API_URL}/sales`)
    return response.data
  },

  async getSale(id) {
    const response = await axios.get(`${API_URL}/sales/${id}`)
    return response.data
  },

  async getSalesReport(startDate, endDate) {
    const response = await axios.get(`${API_URL}/sales/report`, {
      params: {
        startDate,
        endDate,
      },
    })
    return response.data
  },

  async getDailySales() {
    const response = await axios.get(`${API_URL}/sales/daily`)
    return response.data
  },

  async getTopProducts() {
    const response = await axios.get(`${API_URL}/sales/top-products`)
    return response.data
  },
}
