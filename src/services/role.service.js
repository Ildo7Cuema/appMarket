import axios from 'axios'

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

export default {
  async getRoles() {
    try {
      const response = await axios.get(`${API_URL}/roles`)
      return response.data
    } catch (error) {
      throw new Error('Erro ao buscar funções: ' + error.message)
    }
  },

  async updateRolePermissions(id, permissions) {
    try {
      const response = await axios.put(`${API_URL}/roles/${id}/permissions`, { permissions })
      return response.data
    } catch (error) {
      throw new Error('Erro ao atualizar permissões da função: ' + error.message)
    }
  },
}
