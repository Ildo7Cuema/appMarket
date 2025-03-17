import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const systemService = {
  async getSettings() {
    try {
      const response = await axios.get(`${API_URL}/system-settings`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch system settings')
    }
  },

  async updateSetting(key, value) {
    try {
      const response = await axios.post(`${API_URL}/system-settings`, { key, value })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update system setting')
    }
  },

  async uploadLogo(file) {
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await axios.post(`${API_URL}/settings/upload-logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload logo')
    }
  },
}

export default systemService
