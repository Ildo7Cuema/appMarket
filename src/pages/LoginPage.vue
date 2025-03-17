<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card class="q-pa-md" style="width: 400px">
          <q-card-section class="text-center">
            <q-icon name="fas fa-shop" color="green-10" size="sm"></q-icon>
            <div class="text-h6 text-grey-8 text-sm">Market2</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="onSubmit">
              <q-input
                v-model="username"
                label="Nome de usuário"
                outlined
                dense
                :rules="[(val) => !!val || 'Nome de usuário é obrigatório']"
                class="q-mb-md"
              >
                <template v-slot:prepend>
                  <q-icon name="fas fa-user" sise="sm"> </q-icon>
                </template>
              </q-input>

              <q-input
                v-model="password"
                label="Senha"
                :type="showPassword ? 'text' : 'password'"
                outlined
                dense
                :rules="[(val) => !!val || 'Senha é obrigatória']"
                class="q-mb-md"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>

                <template v-slot:prepend>
                  <q-icon name="fas fa-lock" sise="sm"> </q-icon>
                </template>
              </q-input>

              <q-btn
                type="submit"
                color="primary"
                label="Entrar"
                class="full-width"
                :loading="loading"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import AuthService from '../services/auth.service.js'
import { useAuthStore } from '../stores/auth-store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUser, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

// Add icons to library
library.add(faUser, faLock, faEye, faEyeSlash)

const $q = useQuasar()

const router = useRouter()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    const response = await AuthService.login(username.value, password.value)
    const { token, user } = response
    const role = user?.role

    console.log('Login Response:', response)
    console.log('User Object:', user)

    // Update auth store
    const authStore = useAuthStore()
    console.log('Auth Store Before Update:', authStore)

    authStore.setUser({
      id: user.id,
      username: username.value,
      role: role,
    })
    authStore.setToken(token)

    console.log('Auth Store After Update:', authStore)

    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    localStorage.setItem('username', username.value)

    router.push('/')
  } catch (error) {
    let message = 'Falha no login'

    if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
      message = 'Servidor indisponível. Verifique sua conexão com a internet e tente novamente.'
    } else if (error.message.includes('500') || error.message.includes('database')) {
      message = 'Erro de conexão com o banco de dados. Tente novamente mais tarde.'
    } else {
      message = error.message || 'Falha no login'
    }

    $q.notify({
      type: 'negative',
      message,
    })
  } finally {
    loading.value = false
  }
}
</script>
