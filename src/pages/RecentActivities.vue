<template>
  <q-page class="q-pa-lg">
    <!-- Page Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-weight-bold">Atividades Recentes</div>
        <div class="text-subtitle1 text-grey-8">Visualize as atividades recentes do sistema</div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="refresh"
          label="Atualizar"
          @click="refreshActivities"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Activities Table -->
    <q-table
      :rows="activities"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :filter="filter"
      v-model:pagination="pagination"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Pesquisar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:body-cell-details="props">
        <q-td :props="props">
          <q-btn flat round color="primary" icon="info" @click="showDetails(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Activity Details Dialog -->
    <q-dialog v-model="showDetailsDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Detalhes da Atividade</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="selectedActivity">
            <div class="text-subtitle1 q-mb-sm">{{ selectedActivity.title }}</div>
            <div class="text-caption text-grey-8 q-mb-sm">
              {{ selectedActivity.timestamp }}
            </div>
            <div class="text-body1">{{ selectedActivity.description }}</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import systemService from '../services/system.service'

const $q = useQuasar()

const loading = ref(false)
const activities = ref([])
const filter = ref('')
const showDetailsDialog = ref(false)
const selectedActivity = ref(null)

const columns = [
  {
    name: 'type',
    label: 'Tipo',
    field: (row) => row.type,
    align: 'left',
    sortable: true,
  },
  {
    name: 'title',
    label: 'Título',
    field: (row) => row.title,
    align: 'left',
    sortable: true,
  },
  {
    name: 'timestamp',
    label: 'Data/Hora',
    field: (row) => row.timestamp,
    align: 'left',
    sortable: true,
  },
  {
    name: 'user',
    label: 'Usuário',
    field: (row) => row.user,
    align: 'left',
    sortable: true,
  },
  {
    name: 'details',
    label: 'Detalhes',
    align: 'right',
    field: '',
  },
]

const pagination = ref({
  sortBy: 'timestamp',
  descending: true,
  page: 1,
  rowsPerPage: 10,
})

onMounted(() => {
  fetchActivities()
})

async function fetchActivities() {
  loading.value = true
  try {
    const response = await systemService.getRecentActivities()
    activities.value = response.map((activity) => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      timestamp: new Date(activity.timestamp).toLocaleString(),
      user: activity.user.email,
      description: activity.description,
    }))
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Falha ao carregar atividades: ${error.message}`,
    })
  } finally {
    loading.value = false
  }
}

function refreshActivities() {
  fetchActivities()
}

function showDetails(activity) {
  selectedActivity.value = activity
  showDetailsDialog.value = true
}
</script>

<style scoped>
.q-table {
  height: calc(100vh - 200px);
}
</style>
