<template>
  <q-page padding class="q-mt-lg">
    <q-card
      class="q-pa-md"
      style="
        max-width: 500px;
        margin: 0 auto;
        border-radius: 12px;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
      "
    >
      <q-card-section class="text-center q-pb-none">
        <div class="text-h5 text-weight-bold text-primary">Alterar Senha</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Para sua segurança, escolha uma senha forte
        </div>
        <q-separator class="q-mt-sm" />
      </q-card-section>

      <q-card-section>
        <q-form @submit="changePassword" class="q-gutter-y-md">
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
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="newPassword"
            type="password"
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
          >
            <template v-slot:prepend>
              <q-icon name="vpn_key" color="primary" />
            </template>
            <template v-slot:after>
              <q-linear-progress
                :value="passwordStrength"
                :color="strengthColor"
                track-color="grey-3"
                size="4px"
                class="q-mt-xs"
              />
            </template>
          </q-input>

          <q-input
            v-model="confirmPassword"
            type="password"
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
          >
            <template v-slot:prepend>
              <q-icon name="vpn_key" color="primary" />
            </template>
          </q-input>

          <div class="text-center q-mt-lg">
            <q-btn
              type="submit"
              color="primary"
              label="Alterar Senha"
              :loading="loading"
              no-caps
              class="full-width q-py-sm"
              icon="lock"
              :style="{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '8px',
              }"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
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
        })
      } catch (error) {
        console.log('Erro de senha = ', error.response)
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Erro ao alterar senha',
        })
      } finally {
        loading.value = false
      }
    }

    const passwordStrength = computed(() => {
      const length = newPassword.value.length
      if (length === 0) return 0
      if (length < 6) return 0.3
      if (length < 8) return 0.6
      if (/[A-Z]/.test(newPassword.value) && /[0-9]/.test(newPassword.value)) return 1
      return 0.8
    })

    const strengthColor = computed(() => {
      const strength = passwordStrength.value
      if (strength < 0.4) return 'negative'
      if (strength < 0.7) return 'warning'
      return 'positive'
    })

    return {
      currentPassword,
      newPassword,
      confirmPassword,
      loading,
      changePassword,
      passwordStrength,
      strengthColor,
    }
  },
}
</script>
