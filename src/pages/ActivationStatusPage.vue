<template>
  <q-page class="activation-page">
    <!-- Header com gradiente -->
    <div class="header-section q-px-lg q-pt-lg q-pb-xl">
      <div class="row items-center justify-between">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bold text-white">Status de Ativação</div>
          <div class="text-subtitle1 text-grey-3 q-mt-sm">
            Gerencie e monitore o status da sua licença
          </div>
        </div>
      </div>
    </div>

    <div class="content-container q-px-lg q-mt-xl">
      <!-- Card Principal -->
      <q-card class="main-card">
        <q-card-section class="q-pa-lg">
          <!-- Status do Plano -->
          <div class="row items-center q-mb-xl">
            <div class="col-auto">
              <q-avatar size="80px" color="primary" text-color="white" class="q-mr-md">
                <q-icon name="workspace_premium" size="40px" />
              </q-avatar>
            </div>
            <div class="col">
              <div class="text-h5 text-weight-bold text-primary">{{ activationData.plan }}</div>
              <div class="text-subtitle1 text-grey-7">Plano Atual</div>
            </div>
            <div class="col-auto">
              <q-chip
                :color="activationData.testPeriod ? 'warning' : 'positive'"
                text-color="white"
                class="text-weight-bold"
              >
                {{ activationData.testPeriod ? 'Período de Teste' : 'Licença Ativa' }}
              </q-chip>
            </div>
          </div>

          <q-separator class="q-my-xl" />

          <!-- Informações de Ativação -->
          <div class="row q-col-gutter-lg">
            <!-- Data de Ativação -->
            <div class="col-12 col-md-6">
              <q-card class="info-card" flat bordered>
                <q-card-section>
                  <div class="row items-center q-mb-md">
                    <q-icon name="event" size="32px" color="primary" class="q-mr-sm" />
                    <div class="text-h6">Data de Ativação</div>
                  </div>
                  <div class="text-h5 text-weight-medium q-mt-sm">
                    {{ formatDate(activationData.activationDate) }}
                  </div>
                  <div class="text-caption text-grey-7 q-mt-sm">
                    Data em que sua licença foi ativada
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Data de Expiração -->
            <div class="col-12 col-md-6">
              <q-card class="info-card" flat bordered>
                <q-card-section>
                  <div class="row items-center q-mb-md">
                    <q-icon
                      name="timer"
                      size="32px"
                      :color="activationData.testPeriod ? 'warning' : 'negative'"
                      class="q-mr-sm"
                    />
                    <div class="text-h6">Expira em</div>
                  </div>
                  <div
                    class="text-h5 text-weight-medium q-mt-sm"
                    :class="{
                      'text-warning': activationData.testPeriod,
                      'text-negative': !activationData.testPeriod,
                    }"
                  >
                    {{ formatDate(activationData.expiration) }}
                  </div>
                  <div class="text-caption text-grey-7 q-mt-sm">
                    {{
                      activationData.testPeriod
                        ? 'Fim do período de teste'
                        : 'Data de expiração da licença'
                    }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Botão de Renovação -->
          <div class="text-center q-mt-xl">
            <q-btn
              v-if="activationData.testPeriod"
              color="primary"
              label="Renovar Plano"
              @click="renewPlan"
              icon="autorenew"
              size="lg"
              class="full-width"
              rounded
              :loading="loading"
            >
              <q-tooltip>Clique para renovar seu plano</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
      </q-card>

      <!-- Card de Suporte -->
      <q-card class="support-card q-mt-md">
        <q-card-section class="q-pa-lg">
          <div class="row items-center q-mb-md">
            <q-icon name="support_agent" size="32px" color="primary" class="q-mr-sm" />
            <div class="text-h6">Suporte Técnico</div>
          </div>
          <div class="text-body1 q-mb-md">
            Precisa de ajuda? Entre em contato com nossa equipe de suporte
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-btn
                color="primary"
                icon="phone"
                label="+244 921 923 232"
                class="full-width"
                flat
                @click="copyToClipboard('+244 921 923 232')"
              >
                <q-tooltip>Clique para copiar o número</q-tooltip>
              </q-btn>
            </div>
            <div class="col-12 col-sm-6">
              <q-btn
                color="primary"
                icon="email"
                label="suporte@appmarket.com"
                class="full-width"
                flat
                @click="copyToClipboard('suporte@appmarket.com')"
              >
                <q-tooltip>Clique para copiar o email</q-tooltip>
              </q-btn>
            </div>
          </div>
          <div class="text-caption text-grey-7 q-mt-md text-center">
            Horário de atendimento: Segunda a Sexta, 08h00 - 18h00
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const activationData = ref({
  active: false,
  plan: '',
  activationDate: null,
  expiration: null,
  testPeriod: false,
})

const formatDate = (dateString) => {
  if (!dateString) return 'Não definido'
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    $q.notify({
      type: 'positive',
      message: 'Copiado para a área de transferência',
      position: 'top',
      timeout: 2000,
    })
  })
}

const fetchActivationStatus = async () => {
  loading.value = true
  try {
    const response = await fetch('/activation-data.json')
    if (response.ok) {
      const data = await response.json()
      activationData.value = data
    } else {
      const { data } = await api.get('/activation/status')
      activationData.value = data
    }
  } catch (error) {
    console.error('Erro ao carregar status:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar status de ativação',
      position: 'top',
      timeout: 3000,
    })
  } finally {
    loading.value = false
  }
}

const renewPlan = () => {
  $q.dialog({
    title: 'Renovar Plano',
    message: `
      <div class="q-pa-md">
        <div class="text-h6 q-mb-md">Informações do Plano</div>

        <div class="row items-center q-mb-sm">
          <q-icon name="workspace_premium" class="q-mr-sm" color="primary" />
          <div class="text-body1">Plano Atual: ${activationData.value.plan}</div>
        </div>

        <div class="row items-center q-mb-sm">
          <q-icon name="event" class="q-mr-sm" color="primary" />
          <div class="text-body1">Expira em: ${formatDate(activationData.value.expiration)}</div>
        </div>

        <q-separator class="q-my-md" />

        <div class="text-h6 q-mb-md">Suporte Técnico</div>

        <div class="row items-center q-mb-sm">
          <q-icon name="support_agent" class="q-mr-sm" color="primary" />
          <div class="text-body1">+244 921 923 232</div>
        </div>

        <div class="row items-center q-mb-sm">
          <q-icon name="email" class="q-mr-sm" color="primary" />
          <div class="text-body1">suporte@appmarket.com</div>
        </div>

        <div class="row items-center q-mb-sm">
          <q-icon name="schedule" class="q-mr-sm" color="primary" />
          <div class="text-body1">Seg-Sex: 08h00 - 18h00</div>
        </div>
      </div>
    `,
    html: true,
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey',
    },
    ok: {
      label: 'Ok',
      color: 'primary',
      rounded: true,
    },
    persistent: true,
    style: {
      maxWidth: '500px',
    },
  }).onOk(() => {
    // Implementar lógica de renovação
  })
}

onMounted(() => {
  fetchActivationStatus()
})
</script>

<style scoped>
.activation-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  border-radius: 0 0 30px 30px;
  margin-bottom: -60px;
  padding-bottom: 100px;
}

.content-container {
  position: relative;
  z-index: 1;
}

.main-card,
.support-card {
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.main-card:hover,
.support-card:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.info-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.info-card:hover {
  background: #f8fafc;
}

/* Responsividade */
@media (max-width: 599px) {
  .header-section {
    border-radius: 0 0 20px 20px;
    margin-bottom: -40px;
    padding-bottom: 80px;
  }

  .content-container {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
}
</style>
