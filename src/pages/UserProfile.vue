<template>
  <q-page class="profile-page">
    <!-- Header com gradiente -->
    <div class="header-section q-px-lg q-pt-lg q-pb-xl">
      <div class="row items-center justify-between">
        <div class="col-12 text-center">
          <q-avatar size="120px" class="profile-avatar q-mb-md">
            <q-icon name="person" size="80px" color="white" />
          </q-avatar>
          <div class="text-h4 text-weight-bold text-white">Perfil do Usuário</div>
          <div class="text-subtitle1 text-grey-3 q-mt-sm">
            Gerencie suas configurações de segurança
          </div>
        </div>
      </div>
    </div>

    <!-- Card Container com efeito de elevação -->
    <div class="card-container q-px-lg q-mt-xl">
      <q-card class="password-card">
        <q-card-section class="text-center q-pb-none">
          <div class="row items-center justify-center q-mb-md">
            <q-icon name="security" color="primary" size="32px" class="q-mr-sm" />
            <div class="text-h5 text-weight-bold text-primary">Alterar Senha</div>
          </div>
          <div class="text-body2 text-grey-7">
            Para sua segurança, escolha uma senha forte e única
          </div>
          <q-separator class="q-mt-md" />
        </q-card-section>

        <q-card-section>
          <q-form @submit="changePassword" class="q-gutter-y-lg">
            <!-- Senha Atual -->
            <div class="password-field">
              <q-input
                v-model="currentPassword"
                type="password"
                label="Senha Atual"
                :rules="[(val) => !!val || 'Campo obrigatório']"
                outlined
                dense
                lazy-rules
                :loading="loading"
                :disable="loading"
                clearable
                color="primary"
                class="input-field"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showCurrentPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showCurrentPassword = !showCurrentPassword"
                  />
                </template>
              </q-input>
            </div>

            <!-- Nova Senha -->
            <div class="password-field">
              <q-input
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                label="Nova Senha"
                :rules="[
                  (val) => !!val || 'Campo obrigatório',
                  (val) => val.length >= 6 || 'Mínimo 6 caracteres',
                ]"
                outlined
                dense
                lazy-rules
                :loading="loading"
                :disable="loading"
                clearable
                color="primary"
                class="input-field"
              >
                <template v-slot:prepend>
                  <q-icon name="vpn_key" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showNewPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showNewPassword = !showNewPassword"
                  />
                </template>
              </q-input>

              <!-- Indicador de Força da Senha -->
              <div class="strength-indicator q-mt-sm">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-caption text-grey-7">Força da Senha:</span>
                  <span class="text-caption" :class="strengthTextColor">{{ strengthText }}</span>
                </div>
                <q-linear-progress
                  :value="passwordStrength"
                  :color="strengthColor"
                  track-color="grey-3"
                  size="4px"
                  rounded
                />
                <div class="text-caption text-grey-7 q-mt-xs">
                  {{ strengthHint }}
                </div>
              </div>
            </div>

            <!-- Confirmar Nova Senha -->
            <div class="password-field">
              <q-input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                label="Confirmar Nova Senha"
                :rules="[
                  (val) => !!val || 'Campo obrigatório',
                  (val) => val === newPassword || 'As senhas não coincidem',
                ]"
                outlined
                dense
                lazy-rules
                :loading="loading"
                :disable="loading"
                clearable
                color="primary"
                class="input-field"
              >
                <template v-slot:prepend>
                  <q-icon name="vpn_key" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showConfirmPassword = !showConfirmPassword"
                  />
                </template>
              </q-input>
            </div>

            <!-- Botão de Submit -->
            <div class="text-center q-mt-lg">
              <q-btn type="submit" color="primary" :loading="loading" class="submit-button">
                <span class="row items-center">
                  <q-icon name="lock_reset" class="q-mr-sm" />
                  Alterar Senha
                </span>
              </q-btn>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
//import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth-store'
import userService from 'src/services/user.service'

export default {
  setup() {
    const $q = useQuasar()
    const currentPassword = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    const loading = ref(false)
    const showCurrentPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)

    const changePassword = async () => {
      loading.value = true
      try {
        const authStore = useAuthStore()
        const userId = authStore.user.id

        await userService.changePassword({
          userId,
          currentPassword: currentPassword.value,
          newPassword: newPassword.value,
        })

        $q.notify({
          type: 'positive',
          message: 'Senha alterada com sucesso!',
          position: 'top',
          timeout: 2000,
        })

        // Limpar campos após sucesso
        currentPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
      } catch (error) {
        console.log('Erro de senha = ', error.response)
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Erro ao alterar senha',
          position: 'top',
          timeout: 3000,
        })
      } finally {
        loading.value = false
      }
    }

    const passwordStrength = computed(() => {
      const password = newPassword.value
      if (!password) return 0

      let strength = 0
      // Comprimento mínimo
      if (password.length >= 6) strength += 0.2
      if (password.length >= 8) strength += 0.2
      // Letras maiúsculas e minúsculas
      if (/[A-Z]/.test(password)) strength += 0.2
      if (/[a-z]/.test(password)) strength += 0.1
      // Números
      if (/[0-9]/.test(password)) strength += 0.2
      // Caracteres especiais
      if (/[^A-Za-z0-9]/.test(password)) strength += 0.1

      return Math.min(1, strength)
    })

    const strengthColor = computed(() => {
      const strength = passwordStrength.value
      if (strength < 0.3) return 'negative'
      if (strength < 0.7) return 'warning'
      return 'positive'
    })

    const strengthText = computed(() => {
      const strength = passwordStrength.value
      if (strength === 0) return 'Não definida'
      if (strength < 0.3) return 'Fraca'
      if (strength < 0.7) return 'Média'
      return 'Forte'
    })

    const strengthTextColor = computed(() => {
      const strength = passwordStrength.value
      if (strength < 0.3) return 'text-negative'
      if (strength < 0.7) return 'text-warning'
      return 'text-positive'
    })

    const strengthHint = computed(() => {
      const password = newPassword.value
      if (!password) return 'Use uma combinação de letras, números e símbolos'

      const hints = []
      if (password.length < 8) hints.push('aumentar o comprimento para 8+ caracteres')
      if (!/[A-Z]/.test(password)) hints.push('adicionar letra maiúscula')
      if (!/[0-9]/.test(password)) hints.push('adicionar número')
      if (!/[^A-Za-z0-9]/.test(password)) hints.push('adicionar caractere especial')

      return hints.length ? `Sugestões: ${hints.join(', ')}` : 'Senha forte!'
    })

    return {
      currentPassword,
      newPassword,
      confirmPassword,
      loading,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      changePassword,
      passwordStrength,
      strengthColor,
      strengthText,
      strengthTextColor,
      strengthHint,
    }
  },
}
</script>

<style scoped>
.profile-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  border-radius: 0 0 30px 30px;
  margin-bottom: -60px;
  padding-bottom: 100px;
}

.profile-avatar {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 4px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.5);
}

.card-container {
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
}

.password-card {
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.password-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.password-field {
  position: relative;
}

.input-field {
  transition: all 0.3s ease;
}

.input-field:hover {
  transform: translateX(5px);
}

.strength-indicator {
  padding: 8px;
  border-radius: 8px;
  background: #f8f9fa;
}

.submit-button {
  width: 100%;
  max-width: 300px;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
}

/* Responsividade */
@media (max-width: 599px) {
  .header-section {
    border-radius: 0 0 20px 20px;
    margin-bottom: -40px;
    padding-bottom: 80px;
  }

  .card-container {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
  }
}
</style>
