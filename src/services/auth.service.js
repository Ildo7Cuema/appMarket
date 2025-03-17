import axios from 'axios'

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

class AuthService {
  static async login(username, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password })
      console.log('Login API Response:', response.data)
      if (response.data?.user?.id) {
        localStorage.setItem('user_id', response.data.user.id)
      }
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Falha no login')
    }
  }

  static verifyToken(token) {
    try {
      return axios.get(`${API_BASE_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch {
      throw new Error('Token inválido')
    }
  }

  static async createUser(username, password, role, isActive = true) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        password,
        role,
        isActive,
      })
      return response.userId
    } catch (error) {
      throw new Error('Erro ao criar usuário: ' + error.message)
    }
  }

  static async toggleUserStatus(userId, isActive) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/auth/users/${userId}/status`, {
        isActive,
      })
      return response.data
    } catch (error) {
      throw new Error('Erro ao atualizar status do usuário: ' + error.message)
    }
  }

  static async getAdmins() {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/users`, {
        params: {
          role: 'admin',
        },
      })
      return response.data
    } catch (error) {
      throw new Error('Erro ao buscar administradores: ' + error.message)
    }
  }
}

export default AuthService
