import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const role = ref(null)

  // Initialize store from localStorage
  function initialize() {
    const storedUser = {
      id: localStorage.getItem('user_id'),
      username: localStorage.getItem('username'),
      role: localStorage.getItem('role'),
    }

    if (storedUser.username) {
      user.value = storedUser
      role.value = storedUser.role
      token.value = localStorage.getItem('token')
    }
  }

  function setUser(userData) {
    console.log('Setting user:', userData)
    user.value = {
      id: userData?.id,
      username: userData?.username,
      role: userData?.role,
    }
    role.value = userData?.role
    localStorage.setItem('user_id', userData?.id || '')
    localStorage.setItem('username', userData?.username || '')
    localStorage.setItem('role', userData?.role || '')
  }

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken || '')
  }

  function clearAuth() {
    user.value = null
    token.value = null
    role.value = null
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    localStorage.removeItem('token')
  }

  // Initialize store on creation
  initialize()

  return {
    user,
    token,
    role,
    setUser,
    setToken,
    clearAuth,
    initialize,
  }
})
