<template>
  <q-layout>
    <q-page-container>
      <q-page class="login-page flex flex-center">
        <div class="login-container row">
          <!-- Banner/Imagem do lado esquerdo -->
          <div class="login-banner col-md-6 col-sm-12">
            <div class="banner-content flex flex-center column">
              <img
                src="/images/logo.png"
                alt="Market2 Logo"
                class="logo q-mb-md"
                loading="eager"
                width="80"
                height="80"
              />
              <h1 class="text-h3 text-white q-mb-md">Market2</h1>
              <p class="text-subtitle1 text-white q-mb-xl">
                Sistema de Gestão de Vendas e Facturamento
              </p>
              <div class="features">
                <div class="feature-item q-mb-sm">
                  <q-icon name="fas fa-check-circle" color="white" size="sm" class="q-mr-sm" />
                  <span class="text-white">Controle de Inventário</span>
                </div>
                <div class="feature-item q-mb-sm">
                  <q-icon name="fas fa-check-circle" color="white" size="sm" class="q-mr-sm" />
                  <span class="text-white">Gestão de Vendas</span>
                </div>
                <div class="feature-item q-mb-sm">
                  <q-icon name="fas fa-check-circle" color="white" size="sm" class="q-mr-sm" />
                  <span class="text-white">Relatórios Detalhados</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Formulário de login do lado direito -->
          <div class="login-form-container col-md-6 col-sm-12 flex flex-center">
            <q-card class="login-card q-pa-md" flat bordered>
              <q-card-section class="text-center">
                <div class="text-h5 text-weight-bold text-primary q-mb-sm">Bem-vindo</div>
                <div class="text-subtitle2 text-grey-7 q-mb-md">
                  Entre com suas credenciais para acessar o sistema
                </div>
              </q-card-section>

              <q-card-section>
                <q-form @submit="onSubmit" class="q-gutter-sm">
                  <q-input
                    v-model="username"
                    label="Nome de usuário"
                    outlined
                    dense
                    class="input-field"
                    :rules="[(val) => !!val || 'Nome de usuário é obrigatório']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="fas fa-user" color="primary" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="password"
                    label="Senha"
                    :type="showPassword ? 'text' : 'password'"
                    outlined
                    dense
                    class="input-field"
                    :rules="[(val) => !!val || 'Senha é obrigatória']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="fas fa-lock" color="primary" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                        class="cursor-pointer"
                        color="grey-7"
                        @click="showPassword = !showPassword"
                      />
                    </template>
                  </q-input>

                  <q-btn
                    type="submit"
                    color="primary"
                    label="Entrar"
                    class="full-width login-btn q-mt-md"
                    :loading="loading"
                    unelevated
                  >
                    <template v-slot:loading>
                      <q-spinner-dots color="white" />
                    </template>
                  </q-btn>
                </q-form>
              </q-card-section>

              <q-card-section class="text-center q-pt-none">
                <p class="text-grey-7 text-caption q-mt-sm">
                  © {{ currentYear }} Market2 • Todos os direitos reservados
                </p>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import AuthService from '../services/auth.service.js'
import { useAuthStore } from '../stores/auth-store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUser, faLock, faEye, faEyeSlash, faCheckCircle } from '@fortawesome/free-solid-svg-icons'

// Add icons to library
library.add(faUser, faLock, faEye, faEyeSlash, faCheckCircle)

const $q = useQuasar()
const router = useRouter()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const currentYear = computed(() => new Date().getFullYear())

// Definir o ícone na aba do navegador
onMounted(() => {
  // Remover qualquer favicon existente
  const existingLinks = document.querySelectorAll("link[rel~='icon'], link[rel~='shortcut icon']")
  existingLinks.forEach((link) => link.parentNode.removeChild(link))

  // Criar preload para o favicon
  const preload = document.createElement('link')
  preload.rel = 'preload'
  preload.href = '/images/logo.svg'
  preload.as = 'image'
  preload.type = 'image/svg+xml'
  document.head.appendChild(preload)

  // Adicionar o favicon
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/svg+xml'
  link.href = '/images/logo.svg'
  document.head.appendChild(link)

  // Definir o título da página
  document.title = 'Market2 - Login'
})

async function onSubmit() {
  loading.value = true
  try {
    const response = await AuthService.login(username.value, password.value)
    const { token, user } = response
    const role = user?.role

    // Update auth store
    const authStore = useAuthStore()
    authStore.setUser({
      id: user.id,
      username: username.value,
      role: role,
    })
    authStore.setToken(token)

    // Sempre armazenar no localStorage
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    localStorage.setItem('username', username.value)

    // Show success notification
    $q.notify({
      type: 'positive',
      message: 'Login realizado com sucesso!',
      position: 'top-right',
      timeout: 2000,
    })

    // Navigate to dashboard
    setTimeout(() => {
      router.push('/')
    }, 500)
  } catch (error) {
    let message = 'Falha no login'

    if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
      message = 'Servidor indisponível. Verifique sua conexão com a internet e tente novamente.'
    } else if (error.message.includes('500') || error.message.includes('database')) {
      message = 'Erro de conexão com o banco de dados. Tente novamente mais tarde.'
    } else if (error.response && error.response.status === 401) {
      message = 'Usuário ou senha incorretos. Por favor, tente novamente.'
    } else {
      message = error.message || 'Falha no login'
    }

    $q.notify({
      type: 'negative',
      message,
      position: 'top-right',
      timeout: 3000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.login-page {
  min-height: 100vh;
  background: #f5f7fb;
}

.login-container {
  width: 100%;
  max-width: 1000px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  margin: 16px;

  @media (max-width: 767px) {
    flex-direction: column;
    margin: 0;
    border-radius: 0;
  }
}

.login-banner {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  padding: 3rem;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 20%),
      radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
      radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 25%);
    opacity: 1;
  }

  .banner-content {
    position: relative;
    z-index: 1;
    height: 100%;
  }

  .logo {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  @media (max-width: 767px) {
    padding: 2rem;
    text-align: center;
  }
}

.login-form-container {
  background: white;
  padding: 1.5rem;

  @media (max-width: 767px) {
    padding: 1rem;
  }
}

.login-card {
  width: 100%;
  max-width: 380px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.input-field {
  margin-bottom: 1rem;
  border-radius: 8px;

  .q-field__control {
    height: 42px;
  }
}

.login-btn {
  border-radius: 8px;
  height: 42px;
  font-weight: bold;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  }
}

.feature-item {
  display: flex;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
  }
}
</style>
