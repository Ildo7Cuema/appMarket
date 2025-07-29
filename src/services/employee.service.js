import axios from 'axios'

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

export default {
  async getEmployees() {
    try {
      const response = await axios.get(`${API_URL}/employees`)
      return response.data
    } catch (error) {
      throw new Error('Erro ao buscar funcionários: ' + error.message)
    }
  },

  async getEmployeeByEmail(email) {
    try {
      const response = await axios.get(`${API_URL}/employees/by-email/${encodeURIComponent(email)}`)
      return response.data
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error('Funcionário não encontrado para este usuário')
      }
      throw new Error('Erro ao buscar funcionário: ' + error.message)
    }
  },

  async createEmployee(employeeData) {
    console.log(this.createEmployee)
    try {
      const response = await axios.post(`${API_URL}/employees`, employeeData)
      return response.data
    } catch (error) {
      throw new Error('Erro ao criar funcionário: ' + error.message)
    }
  },

  async updateEmployee(id, employeeData) {
    try {
      const response = await axios.put(`${API_URL}/employees/${id}`, employeeData)
      return response.data
    } catch (error) {
      throw new Error('Erro ao atualizar funcionário: ' + error.message)
    }
  },

  async deleteEmployee(id) {
    try {
      const response = await axios.delete(`${API_URL}/employees/${id}`)
      return response.data
    } catch (error) {
      throw new Error('Erro ao excluir funcionário: ' + error.message)
    }
  },

  async createUser(userData) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username: userData.username.split('@')[0],
        password: userData.password,
        role: userData.accessLevel.toLowerCase(),
        isActive: true,
      })
      return response.data
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Erro ao criar usuário')
      }
      throw new Error('Erro ao criar usuário: ' + error.message)
    }
  },
}
