<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-weight-bold q-mb-lg text-blue-5">Configurações da Empresa</div>

    <template v-if="hasAccess">
      <q-form @submit="saveSettings">
        <!-- Seção Identidade Visual -->
        <q-card class="q-mb-md">
          <q-card-section dense class="bg-primary text-white">
            <div class="text-h6">Identidade Visual</div>
            <div class="text-caption">Personalize a aparência da sua empresa</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <!-- Upload do Logo -->
              <div class="col-12 col-md-6">
                <div class="column items-center q-gutter-y-md">
                  <q-avatar
                    size="150px"
                    font-size="52px"
                    color="grey-3"
                    text-color="primary"
                    class="q-pa-sm"
                  >
                    <img
                      :src="logoPreviewUrl || '/assets/logo.png'"
                      alt="Logotipo da Empresa"
                      class="logo-preview"
                      v-if="logoPreviewUrl"
                    />
                    <q-icon v-else name="business" size="80px" color="grey-6" />
                  </q-avatar>

                  <q-file
                    outlined
                    v-model="companyLogo"
                    label="Logotipo da Empresa"
                    accept=".jpg, .png, .jpeg"
                    max-file-size="1048576"
                    :rules="[(val) => !!val || 'Campo obrigatório']"
                    clearable
                    class="full-width"
                  >
                    <template v-slot:prepend>
                      <q-icon name="image" />
                    </template>
                    <template v-slot:hint> Tamanho máximo: 1MB (JPEG, PNG) </template>
                  </q-file>
                </div>
              </div>

              <!-- Informações Básicas -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="companyName"
                  label="Nome da Empresa"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="business" />
                  </template>
                </q-input>

                <q-input
                  dense
                  v-model="companyAddress"
                  label="Endereço da Empresa"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" />
                  </template>
                </q-input>

                <q-input
                  dense
                  v-model="companyPhone"
                  label="Telefone"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>

                <q-input
                  dense
                  v-model="companyEmail"
                  label="Email"
                  :rules="[
                    (val) => !!val || 'Campo obrigatório',
                    (val) => /.+@.+\..+/.test(val) || 'Formato de email inválido',
                  ]"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>

                <q-input
                  dense
                  v-model="companyNIF"
                  label="Número de Identificação Fiscal (NIF)"
                  mask="### ### ###"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Botão de Salvar -->
        <div class="row justify-end q-mt-md">
          <q-btn
            label="Salvar configurações"
            type="submit"
            color="primary"
            icon="fas fa-save"
            no-caps
            :loading="loading"
          />
        </div>
      </q-form>
    </template>

    <!-- Mensagem de Sem Permissão -->
    <template v-else>
      <q-banner class="bg-negative text-white q-mt-md">
        Você não tem permissão para acessar estas configurações
      </q-banner>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/index.js'
import apiService from '../services/api.service.js'
import systemService from '../services/system.service.js'

const $q = useQuasar()
const authStore = useAuthStore()
const loading = ref(false)

const hasAccess = computed(() => {
  const userRole = authStore.user?.role
  return userRole === 'admin' || userRole === 'super-admin'
})

const userID = Number(localStorage.getItem('user_id'))

const companyLogo = ref(null)
const logoPreviewUrl = ref('')
const companyName = ref('')
const companyAddress = ref('')
const companyPhone = ref('')
const companyEmail = ref('')
const companyNIF = ref('')

watch(companyLogo, (newLogo) => {
  if (newLogo) {
    logoPreviewUrl.value = URL.createObjectURL(newLogo)
  } else {
    logoPreviewUrl.value = ''
  }
})

onMounted(async () => {
  try {
    const settings = await systemService.getSettings()
    if (settings && settings.length > 0) {
      const companySettings = settings[0]
      existingSettingsId.value = companySettings.id
      companyName.value = companySettings.company_name || ''
      companyAddress.value = companySettings.company_address || ''
      companyPhone.value = companySettings.company_phone || ''
      companyEmail.value = companySettings.company_email || ''
      companyNIF.value = companySettings.company_nif || ''
      logoPreviewUrl.value = companySettings.logo_url || ''
    }
  } catch (error) {
    console.error('Error loading company settings:', error)
  }
})

const existingSettingsId = ref(null)

const saveSettings = async () => {
  // Validação dos campos obrigatórios
  if (
    !companyName.value ||
    !companyAddress.value ||
    !companyPhone.value ||
    !companyEmail.value ||
    !companyNIF.value
  ) {
    $q.notify({
      type: 'negative',
      message: 'Preencha todos os campos obrigatórios',
      position: 'top',
    })
    return
  }

  loading.value = true

  try {
    let logoUrl = logoPreviewUrl.value

    // Se um novo logo foi selecionado, faz upload primeiro
    if (companyLogo.value) {
      const formData = new FormData()
      formData.append('logo', companyLogo.value)

      const uploadResponse = await apiService.uploadLogo(formData)
      logoUrl = uploadResponse.logoUrl
    }

    // Prepara os dados para salvar
    const settingsData = {
      company_name: companyName.value,
      company_address: companyAddress.value,
      company_phone: companyPhone.value,
      company_email: companyEmail.value,
      company_nif: companyNIF.value,
      logo_url: logoUrl || '',
      user_id: userID,
    }

    // Salva ou atualiza as configurações
    await apiService.saveSettings(settingsData)

    // Recarrega as configurações após salvar
    const settings = await systemService.getSettings()
    if (settings && settings.length > 0) {
      existingSettingsId.value = settings[0].id
    }

    $q.notify({
      type: 'positive',
      message: 'Configurações salvas com sucesso!',
      position: 'top',
      timeout: 3000,
    })

    // Limpa o arquivo de logo após salvar
    companyLogo.value = null
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao salvar configurações',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.logo-preview {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid #ddd;
  padding: 4px;
}
</style>
