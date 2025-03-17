<template>
  <q-page class="q-pa-lg">
    <!-- Page Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-weight-bold">Configurações do Sistema</div>
        <div class="text-subtitle1 text-grey-8">
          Gerencie as configurações e aparência do sistema
        </div>
      </div>
    </div>

    <!-- Settings Tabs -->
    <q-tabs v-model="tab" align="left" class="bg-primary text-white shadow-2">
      <q-tab name="general" icon="settings" label="Geral" />
      <q-tab name="appearance" icon="palette" label="Aparência" />
      <q-tab name="security" icon="security" label="Segurança" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <!-- General Settings -->
      <q-tab-panel name="general">
        <div class="text-h6 q-mb-md">Configurações Gerais</div>

        <q-form @submit="saveGeneralSettings">
          <q-input v-model="settings.systemName" label="Nome do Sistema" class="q-mb-md" />

          <q-input v-model="settings.defaultLanguage" label="Idioma Padrão" class="q-mb-md" />

          <div class="row justify-end q-mt-md">
            <q-btn label="Salvar" type="submit" color="primary" />
          </div>
        </q-form>
      </q-tab-panel>

      <!-- Appearance Settings -->
      <q-tab-panel name="appearance">
        <div class="text-h6 q-mb-md">Aparência do Sistema</div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-card>
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">Logo do Sistema</div>

                <q-file
                  v-model="logoFile"
                  label="Carregar novo logo"
                  accept=".jpg,.png,.svg"
                  max-file-size="1048576"
                  @rejected="onFileRejected"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>

                <q-img :src="currentLogo" style="max-width: 300px" class="q-mb-md" />

                <q-btn
                  color="primary"
                  label="Atualizar Logo"
                  @click="updateLogo"
                  :loading="logoLoading"
                />
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card>
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">Tema do Sistema</div>

                <q-select
                  v-model="settings.theme"
                  :options="themeOptions"
                  label="Tema"
                  class="q-mb-md"
                />

                <q-toggle v-model="settings.darkMode" label="Modo Escuro" />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- Security Settings -->
      <q-tab-panel name="security">
        <div class="text-h6 q-mb-md">Configurações de Segurança</div>

        <q-form @submit="saveSecuritySettings">
          <q-input
            v-model="settings.sessionTimeout"
            label="Tempo de Sessão (minutos)"
            type="number"
            class="q-mb-md"
          />

          <q-toggle v-model="settings.twoFactorAuth" label="Autenticação de Dois Fatores" />

          <div class="row justify-end q-mt-md">
            <q-btn label="Salvar" type="submit" color="primary" />
          </div>
        </q-form>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import systemService from '../services/system.service'

const $q = useQuasar()

const tab = ref('general')
const logoFile = ref(null)
const logoLoading = ref(false)
const currentLogo = ref('/assets/logo.png')

const settings = ref({
  systemName: '',
  defaultLanguage: '',
  theme: 'default',
  darkMode: false,
  sessionTimeout: 30,
  twoFactorAuth: false,
})

onMounted(async () => {
  try {
    const systemSettings = await systemService.getSettings()
    settings.value = {
      systemName:
        systemSettings.find((s) => s.setting_key === 'system_name')?.setting_value || 'AppMarket',
      defaultLanguage:
        systemSettings.find((s) => s.setting_key === 'default_language')?.setting_value || 'pt-BR',
      theme: systemSettings.find((s) => s.setting_key === 'theme')?.setting_value || 'default',
      darkMode: systemSettings.find((s) => s.setting_key === 'dark_mode')?.setting_value === 'true',
      sessionTimeout: parseInt(
        systemSettings.find((s) => s.setting_key === 'session_timeout')?.setting_value || '30',
      ),
      twoFactorAuth:
        systemSettings.find((s) => s.setting_key === 'two_factor_auth')?.setting_value === 'true',
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Falha ao carregar configurações: ${error.message}`,
    })
  }
})

const themeOptions = [
  { label: 'Padrão', value: 'default' },
  { label: 'Azul', value: 'blue' },
  { label: 'Verde', value: 'green' },
]

function saveGeneralSettings() {
  $q.notify({
    type: 'positive',
    message: 'Configurações gerais salvas com sucesso',
  })
}

async function saveSecuritySettings() {
  try {
    await systemService.updateSetting('session_timeout', settings.value.sessionTimeout.toString())
    await systemService.updateSetting('two_factor_auth', settings.value.twoFactorAuth.toString())

    $q.notify({
      type: 'positive',
      message: 'Configurações de segurança salvas com sucesso',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Falha ao salvar configurações de segurança: ${error.message}`,
    })
  }
}

async function updateLogo() {
  if (!logoFile.value) {
    $q.notify({
      type: 'warning',
      message: 'Selecione um arquivo de logo para carregar',
    })
    return
  }

  logoLoading.value = true
  try {
    const response = await systemService.uploadLogo(logoFile.value)
    currentLogo.value = response.logoUrl
    $q.notify({
      type: 'positive',
      message: 'Logo atualizado com sucesso',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Falha ao atualizar logo: ${error.message}`,
    })
  } finally {
    logoLoading.value = false
  }
}

function onFileRejected(rejectedEntries) {
  const reasons = rejectedEntries
    .map((entry) => {
      if (entry.failedPropValidation === 'accept') {
        return 'Tipo de arquivo inválido'
      }
      if (entry.failedPropValidation === 'max-file-size') {
        return 'Arquivo muito grande'
      }
      return 'Erro desconhecido'
    })
    .join(', ')

  $q.notify({
    type: 'negative',
    message: `Upload falhou: ${reasons}. Use imagens JPG, PNG ou SVG até 1MB`,
  })
}
</script>

<style scoped>
.q-tab-panels {
  background: transparent;
}
</style>
