<template>
  <q-page class="q-pa-lg">
    <!-- Page Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-weight-bold">Gestão de Usuários</div>
        <div class="text-subtitle1 text-grey-8">Gerencie usuários e permissões do sistema</div>
      </div>
    </div>

    <!-- User Table -->
    <q-table
      dense
      :rows="users"
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

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            :color="props.row.isActive ? 'positive' : 'negative'"
            :icon="props.row.isActive ? 'toggle_on' : 'toggle_off'"
            @click="toggleStatus(props.row)"
          />
          <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Create User Dialog -->
    <q-dialog v-model="showCreateDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Criar Novo Usuário</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="createUser">
            <q-input v-model="newUser.name" label="Nome Completo" required class="q-mb-md" />

            <q-input v-model="newUser.email" label="Email" type="email" required class="q-mb-md" />

            <q-select
              v-model="newUser.role"
              :options="roleOptions"
              label="Função"
              required
              class="q-mb-md"
            />

            <q-input
              v-model="newUser.password"
              label="Senha"
              type="password"
              required
              class="q-mb-md"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Cancelar" color="grey" v-close-popup />
              <q-btn label="Criar" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { useQuasar } from 'quasar'
import userService from '../services/user.service'

const $q = useQuasar()

const emit = defineEmits(['updateStatus'])
const loading = ref(false)
const users = ref([])
const filter = ref('')
const showCreateDialog = ref(false)
const newUser = ref({
  name: '',
  email: '',
  role: 'user',
  password: '',
})

const roleOptions = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Usuário', value: 'user' },
  { label: 'Super Admin', value: 'super-admin' },
]

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.username,
    sortable: true,
  },
  {
    name: 'role',
    label: 'Função',
    field: (row) => row.role,
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    field: (row) => (row.isActive ? 'Activo' : 'Inativo'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'created_at',
    label: 'Criado em',
    field: (row) => row.created_at,
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Ações',
    align: 'right',
    field: '',
  },
]

const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
})

onMounted(() => {
  fetchUsers()
})

async function fetchUsers() {
  loading.value = true
  try {
    const response = await userService.getUsers()
    // Filter out admin user and map status
    users.value = response
      .filter((user) => user.username !== 'admin')
      .map((user) => ({
        ...user,
        active: user.status === 'active',
      }))
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Falha ao carregar usuários: ${error.message}`,
    })
  } finally {
    loading.value = false
  }
}

async function toggleStatus(user) {
  emit('updateStatus', user)
}

async function createUser() {
  try {
    // TODO: Implement API call
    users.value.push({
      ...newUser.value,
      id: users.value.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
    })
    showCreateDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Usuário criado com sucesso',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Falha ao criar usuário: ${error.message}`,
    })
  }
}

function confirmDelete(user) {
  $q.dialog({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir o usuário ${user.username}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteUser(user)
  })
}

async function deleteUser(user) {
  try {
    console.log(user.id)
    await userService.deleteUser(user.id)
    users.value = users.value.filter((u) => u.id !== user.id)
    $q.notify({
      type: 'positive',
      message: 'Usuário excluído com sucesso',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Falha ao excluir usuário: ${error.response?.data?.message || error.message}`,
    })
  }
}
</script>

<style scoped>
.q-table {
  height: calc(100vh - 200px);
}
</style>
