<template>
  <router-view />
</template>

<script setup>
import { onErrorCaptured, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth-store'
import axios from 'axios'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

// Interceptor para verificar erros 403
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Limpa o token do localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('subscriptionInitialized')

      // Limpa o estado de autenticação
      authStore.clearAuth()

      // Redireciona para a página de assinatura
      // Aguarda o próximo tick para garantir que o layout esteja pronto
      nextTick(() => {
        router.push({ path: '/subscription', replace: true })
      })
    }
    return Promise.reject(error)
  },
)

// Verifica assinatura em cada navegação
router.beforeEach(async () => {
  try {
    const response = await fetch('/api/check-subscription')

    if (!response.ok) {
      const data = await response.json()

      if (data.status === 'expired') {
        authStore.logout()
        return { path: '/subscription' }
      }
    }
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error)
  }
})

onErrorCaptured((err) => {
  $q.notify({
    type: 'negative',
    message: err.message,
    caption: err.stack,
    timeout: 0,
  })
  console.error(err)
  return false
})
</script>
