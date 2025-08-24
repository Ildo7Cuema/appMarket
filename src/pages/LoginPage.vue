<template>
  <q-layout>
    <q-page-container>
      <q-page class="modern-login-page">
        <!-- Animated Background -->
        <div class="background-animation">
          <div class="floating-shape shape-1"></div>
          <div class="floating-shape shape-2"></div>
          <div class="floating-shape shape-3"></div>
          <div class="floating-shape shape-4"></div>
        </div>

        <!-- Main Login Container -->
        <div class="login-wrapper">
          <div class="login-container glass">
            <div class="login-content">
              <!-- Left Side - Branding -->
              <div class="branding-section">
                <div class="brand-logo">
                  <div class="logo-container">
                    <img
                      src="/images/logo.png"
                      alt="AppMarket Logo"
                      class="logo-image"
                      loading="eager"
                    />
                  </div>
                </div>
                
                <div class="brand-content">
                  <h1 class="brand-title text-display-1">AppMarket</h1>
                  <p class="brand-subtitle text-body-large">
                    Sistema Profissional de Gestão
                  </p>
                  <p class="brand-description text-body">
                    Gerencie suas vendas, estoque e faturamento com a mais moderna tecnologia
                  </p>
                  
                  <div class="features-list">
                    <div class="feature-item animate-fade-in-up" style="animation-delay: 0.1s;">
                      <div class="feature-icon">
                        <q-icon name="inventory_2" size="24px" />
                      </div>
                      <div class="feature-text">
                        <div class="feature-title text-body">Controle de Inventário</div>
                        <div class="feature-desc text-body-small">Gestão inteligente de produtos</div>
                      </div>
                    </div>
                    
                    <div class="feature-item animate-fade-in-up" style="animation-delay: 0.2s;">
                      <div class="feature-icon">
                        <q-icon name="point_of_sale" size="24px" />
                      </div>
                      <div class="feature-text">
                        <div class="feature-title text-body">Sistema de Vendas</div>
                        <div class="feature-desc text-body-small">PDV moderno e eficiente</div>
                      </div>
                    </div>
                    
                    <div class="feature-item animate-fade-in-up" style="animation-delay: 0.3s;">
                      <div class="feature-icon">
                        <q-icon name="analytics" size="24px" />
                      </div>
                      <div class="feature-text">
                        <div class="feature-title text-body">Relatórios Avançados</div>
                        <div class="feature-desc text-body-small">Insights e análises detalhadas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Side - Login Form -->
              <div class="form-section">
                <div class="form-container">
                  <div class="form-header">
                    <h2 class="form-title text-heading-1">Bem-vindo de volta</h2>
                    <p class="form-subtitle text-body">
                      Entre com suas credenciais para acessar o sistema
                    </p>
                  </div>

                  <q-form @submit="onSubmit" class="login-form form-modern">
                    <div class="input-group">
                      <q-input
                        v-model="username"
                        label="Nome de usuário"
                        outlined
                        class="form-input"
                        :rules="[(val) => !!val || 'Nome de usuário é obrigatório']"
                        hide-bottom-space
                      >
                        <template v-slot:prepend>
                          <div class="input-icon">
                            <q-icon name="person" />
                          </div>
                        </template>
                      </q-input>
                    </div>

                    <div class="input-group">
                      <q-input
                        v-model="password"
                        :type="showPassword ? 'text' : 'password'"
                        label="Senha"
                        outlined
                        class="form-input"
                        :rules="[(val) => !!val || 'Senha é obrigatória']"
                        hide-bottom-space
                      >
                        <template v-slot:prepend>
                          <div class="input-icon">
                            <q-icon name="lock" />
                          </div>
                        </template>
                        <template v-slot:append>
                          <q-btn
                            flat
                            round
                            dense
                            :icon="showPassword ? 'visibility_off' : 'visibility'"
                            @click="showPassword = !showPassword"
                            class="password-toggle"
                          />
                        </template>
                      </q-input>
                    </div>

                    <div class="form-actions">
                      <q-btn
                        type="submit"
                        color="primary"
                        label="Entrar no Sistema"
                        class="login-button btn-modern btn-primary"
                        :loading="loading"
                        no-caps
                        unelevated
                        size="lg"
                      >
                        <template v-slot:loading>
                          <q-spinner-dots size="24px" />
                        </template>
                      </q-btn>
                    </div>
                  </q-form>

                  <div class="form-footer">
                    <div class="security-info">
                      <q-icon name="security" size="16px" class="security-icon" />
                      <span class="text-body-small">Conexão segura e criptografada</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="login-footer">
            <p class="copyright text-body-small">
              © {{ currentYear }} AppMarket • Sistema desenvolvido com tecnologia avançada
            </p>
            <div class="version-info text-caption">
              Versão 1.0.0 • Build {{ currentYear }}
            </div>
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

const $q = useQuasar()
const router = useRouter()

// Form state
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const currentYear = computed(() => new Date().getFullYear())

// Page setup
onMounted(() => {
  // Remove existing favicons
  const existingLinks = document.querySelectorAll("link[rel~='icon'], link[rel~='shortcut icon']")
  existingLinks.forEach((link) => link.parentNode.removeChild(link))

  // Add favicon preload
  const preload = document.createElement('link')
  preload.rel = 'preload'
  preload.href = '/images/logo.svg'
  preload.as = 'image'
  preload.type = 'image/svg+xml'
  document.head.appendChild(preload)

  // Add favicon
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/svg+xml'
  link.href = '/images/logo.svg'
  document.head.appendChild(link)

  // Set page title
  document.title = 'AppMarket - Sistema Profissional de Gestão'
})

// Authentication logic
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
      email: user.email,
      role: role,
    })
    authStore.setToken(token)

    // Store in localStorage
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    localStorage.setItem('username', username.value)

    // Success notification
    $q.notify({
      type: 'positive',
      message: 'Login realizado com sucesso!',
      position: 'top-right',
      timeout: 3000,
      actions: [{ icon: 'close', color: 'white' }],
    })

    // Navigate to dashboard
    setTimeout(() => {
      router.push('/')
    }, 800)
  } catch (error) {
    console.error('Login error:', error)
    let message = 'Falha no login'

    if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
      message = 'Servidor indisponível. Verifique sua conexão com a internet e tente novamente.'
    } else if (error.message.includes('500') || error.message.includes('database')) {
      message = 'Erro de conexão com o banco de dados. Tente novamente mais tarde.'
    } else if (error.response && error.response.status === 401) {
      message = 'Usuário ou senha incorretos. Por favor, verifique suas credenciais.'
    } else if (error == 'Error: Usuário inativo') {
      router.push('/inactive-account')
      return
    } else {
      message = error.message || 'Falha no login. Tente novamente.'
    }

    $q.notify({
      type: 'negative',
      message,
      position: 'top-right',
      timeout: 4000,
      actions: [{ icon: 'close', color: 'white' }],
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
// ==========================================================================
// Modern Login Page Styles
// ==========================================================================

.modern-login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

// ==========================================================================
// Animated Background
// ==========================================================================

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;

  .floating-shape {
    position: absolute;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    animation: float 15s infinite ease-in-out;

    &.shape-1 {
      width: 200px;
      height: 200px;
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }

    &.shape-2 {
      width: 150px;
      height: 150px;
      top: 60%;
      right: 15%;
      animation-delay: 5s;
    }

    &.shape-3 {
      width: 100px;
      height: 100px;
      top: 30%;
      right: 30%;
      animation-delay: 10s;
    }

    &.shape-4 {
      width: 80px;
      height: 80px;
      bottom: 20%;
      left: 30%;
      animation-delay: 2s;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  33% {
    transform: translateY(-30px) rotate(120deg);
    opacity: 0.6;
  }
  66% {
    transform: translateY(20px) rotate(240deg);
    opacity: 0.4;
  }
}

// ==========================================================================
// Login Container
// ==========================================================================

.login-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.login-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 35px 70px rgba(0, 0, 0, 0.2);
  }
}

.login-content {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  min-height: 600px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
}

// ==========================================================================
// Branding Section
// ==========================================================================

.branding-section {
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 40%);
  }

  .brand-logo {
    position: relative;
    z-index: 1;
    margin-bottom: 40px;

    .logo-container {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);

      .logo-image {
        width: 50px;
        height: 50px;
        object-fit: contain;
      }
    }
  }

  .brand-content {
    position: relative;
    z-index: 1;

    .brand-title {
      color: white;
      margin-bottom: 16px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 12px;
      font-weight: 500;
    }

    .brand-description {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 40px;
      line-height: 1.6;
    }
  }

  .features-list {
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
      opacity: 0;
      animation-fill-mode: forwards;

      .feature-icon {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .feature-text {
        flex: 1;

        .feature-title {
          color: white;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .feature-desc {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 40px 30px;
    text-align: center;

    .features-list {
      .feature-item {
        flex-direction: column;
        text-align: center;
        align-items: center;
      }
    }
  }
}

// ==========================================================================
// Form Section
// ==========================================================================

.form-section {
  padding: 60px 50px;
  background: rgba(255, 255, 255, 0.98);
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    padding: 40px 30px;
  }
}

.form-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 40px;
  text-align: center;

  .form-title {
    color: #1e293b;
    margin-bottom: 12px;
    font-weight: 700;
  }

  .form-subtitle {
    color: #64748b;
    line-height: 1.5;
  }
}

.login-form {
  .input-group {
    margin-bottom: 24px;

    .form-input {
      .q-field__control {
        border-radius: 12px;
        border: 2px solid #e2e8f0;
        background: #f8fafc;
        transition: all 0.3s ease;
        height: 56px;

        &:hover {
          border-color: #cbd5e1;
          background: white;
        }

        &.q-field__control--focused {
          border-color: #2563eb;
          background: white;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
      }

      .q-field__label {
        color: #64748b;
        font-weight: 500;
      }

      .input-icon {
        color: #64748b;
        margin-right: 4px;
      }

      .password-toggle {
        color: #64748b;
        
        &:hover {
          color: #374151;
        }
      }
    }
  }

  .form-actions {
    margin-bottom: 24px;

    .login-button {
      width: 100%;
      height: 56px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.025em;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

.form-footer {
  text-align: center;

  .security-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #64748b;

    .security-icon {
      color: #10b981;
    }
  }
}

// ==========================================================================
// Footer
// ==========================================================================

.login-footer {
  margin-top: 30px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);

  .copyright {
    margin-bottom: 8px;
  }

  .version-info {
    color: rgba(255, 255, 255, 0.6);
  }
}

// ==========================================================================
// Responsive Design
// ==========================================================================

@media (max-width: 480px) {
  .modern-login-page {
    padding: 10px;
  }

  .branding-section,
  .form-section {
    padding: 30px 20px;
  }

  .form-header {
    margin-bottom: 30px;

    .form-title {
      font-size: 1.5rem;
    }
  }

  .login-form {
    .input-group {
      margin-bottom: 20px;
    }
  }
}

// ==========================================================================
// Loading States
// ==========================================================================

.q-spinner-dots {
  color: white;
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .form-section {
    background: rgba(15, 23, 42, 0.95);

    .form-title {
      color: white;
    }

    .form-subtitle {
      color: #cbd5e1;
    }

    .form-input {
      .q-field__control {
        background: rgba(51, 65, 85, 0.5);
        border-color: #374151;
        color: white;

        &:hover {
          border-color: #4b5563;
          background: rgba(51, 65, 85, 0.7);
        }
      }

      .q-field__label {
        color: #9ca3af;
      }
    }

    .security-info {
      color: #9ca3af;
    }
  }
}
</style>
