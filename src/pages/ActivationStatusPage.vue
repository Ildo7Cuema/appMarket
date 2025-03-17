<template>
  <q-page class="q-pa-md">
    <div class="text-h4 text-weight-bold q-mb-md">
      <q-icon name="verified" class="q-mr-sm" color="primary" />
      Status de Ativação
    </div>

    <q-card class="q-pa-md shadow-5">
      <q-card-section class="q-pa-lg">
        <div class="row items-center q-mb-md">
          <q-icon name="workspace_premium" size="md" class="q-mr-sm" color="primary" />
          <div>
            <div class="text-subtitle1 text-grey-8">Plano Atual</div>
            <div class="text-h5 text-weight-medium">{{ activationData.plan }}</div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <div class="row items-center q-mb-md">
          <q-icon name="event" size="md" class="q-mr-sm" color="primary" />
          <div>
            <div class="text-subtitle1 text-grey-8">Data de Ativação</div>
            <div class="text-h6">{{ formatDate(activationData.activationDate) }}</div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <div class="row items-center q-mb-md">
          <q-icon
            name="timer"
            size="md"
            class="q-mr-sm"
            :color="activationData.testPeriod ? 'warning' : 'negative'"
          />
          <div>
            <div class="text-subtitle1 text-grey-8">Expira em</div>
            <div
              class="text-h6"
              :class="{
                'text-warning': activationData.testPeriod,
                'text-negative': !activationData.testPeriod,
              }"
            >
              {{ formatDate(activationData.expiration) }}
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <div class="text-center q-mt-lg">
          <q-btn
            color="primary"
            label="Renovar Plano"
            @click="renewPlan"
            v-if="activationData.testPeriod"
            icon="autorenew"
            size="lg"
            class="full-width"
            rounded
          />
        </div>
      </q-card-section>
    </q-card>

    <div class="q-mt-md text-caption text-grey-7 text-center">
      Para mais informações sobre seu plano, entre em contato com nosso suporte.
      <b>+244 921 923 232</b>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const activationData = ref({
  active: false,
  plan: '',
  activationDate: null,
  expiration: null,
  testPeriod: false,
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

const fetchActivationStatus = async () => {
  // Tenta obter dados do arquivo JSON primeiro
  try {
    const response = await fetch('/activation-data.json')
    console.log(response)
    if (response.ok) {
      const data = await response.json()
      activationData.value = data
      return
    }
  } catch (error) {
    console.error('Erro ao carregar dados do arquivo:', error)
  }

  // Se não houver dados no arquivo, faz requisição à API
  try {
    const { data } = await api.get('/activation/status')
    activationData.value = data
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar status de ativação',
    })
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
