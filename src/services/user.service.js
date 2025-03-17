import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const userService = {
  async getUsers() {
    try {
      const response = await axios.get(`${API_URL}/users`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users')
    }
  },

  async createUser(userData) {
    try {
      const response = await axios.post(`${API_URL}/users`, userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create user')
    }
  },

  async updateUser(id, userData) {
    console.log(userData)
    try {
      const response = await axios.put(`${API_URL}/users/${id}`, userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user')
    }
  },

  async updateUserStatus(id, userData) {
    console.log(userData)
    try {
      const response = await axios.put(`${API_URL}/userStatus/${id}`, userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Falha ao actualizar o status do Usuário')
    }
  },

  async deleteUser(id) {
    try {
      // First check if user exists
      const users = await this.getUsers()
      const userExists = users.some((user) => user.id === id)

      if (!userExists) {
        throw new Error('User not found')
      }

      const response = await axios.delete(`${API_URL}/users/${id}`)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('User not found')
      }
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  },

  async getActivities(userId) {
    try {
      const response = await axios.get(`${API_URL}/activities`, {
        params: { userId },
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activities')
    }
  },

  async changePassword({ userId, currentPassword, newPassword }) {
    console.log('Iniciando alteração de senha...')
    console.log('Dados recebidos:', { userId, currentPassword, newPassword })

    // Validação básica dos campos
    if (!userId || !currentPassword || !newPassword) {
      console.log('Erro de validação: campos obrigatórios faltando')
      throw new Error('Todos os campos são obrigatórios')
    }

    if (newPassword.length < 8) {
      console.log('Erro de validação: nova senha muito curta')
      throw new Error('A nova senha deve ter pelo menos 8 caracteres')
    }

    try {
      const payload = {
        currentPassword: currentPassword,
        newPassword: newPassword,
      }

      console.log('Enviando payload:', payload)

      const response = await axios.put(`${API_URL}/users/change-password/${userId}`, payload)
      console.log('Resposta do servidor:', response.data)
      return response.data
    } catch (error) {
      let errorMessage = 'Falha ao alterar a senha'

      if (error.response) {
        // Tratamento específico para diferentes códigos de status
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Dados inválidos fornecidos'
            break
          case 401:
            errorMessage = 'Senha atual incorreta'
            break
          case 404:
            errorMessage = 'Usuário não encontrado'
            break
          case 500:
            errorMessage = 'Erro interno no servidor'
            break
          default:
            errorMessage = error.response.data?.message || 'Erro desconhecido'
        }
      } else if (error.request) {
        errorMessage = 'Sem resposta do servidor'
      } else {
        errorMessage = error.message || 'Erro ao configurar a requisição'
      }

      throw new Error(errorMessage)
    }
  },
}

export default userService
