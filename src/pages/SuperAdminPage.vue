<template>
  <q-page padding>
    <h2>Super Admin Dashboard</h2>

    <q-card>
      <q-card-section>
        <h3>Gestão de Administradores</h3>

        <q-table
          title="Lista de Administradores"
          :rows="admins"
          :columns="columns"
          row-key="id"
          :loading="loading"
          loading-label="A carregar..."
        >
          <template v-slot:no-data>
            <div class="full-width row flex-center text-negative q-gutter-sm">
              <q-icon name="warning" />
              <span>Erro ao carregar administradores</span>
            </div>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-toggle
                v-model="props.row.isActive"
                @update:model-value="toggleAdminStatus(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AuthService from '../services/auth.service'

const admins = ref([])
const loading = ref(false)

const columns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'status', label: 'Status', field: 'isActive', align: 'center' },
]

async function fetchAdmins() {
  try {
    loading.value = true
    const response = await AuthService.getAdmins()
    admins.value = response.map((admin) => ({
      ...admin,
      name: admin.username,
      email: admin.email,
    }))
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function toggleAdminStatus(admin) {
  try {
    await AuthService.toggleUserStatus(admin.id, admin.isActive)
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    // Reverter estado em caso de erro
    admin.isActive = !admin.isActive
  }
}

onMounted(() => {
  fetchAdmins()
})
</script>

<style scoped>
h2 {
  margin-bottom: 2rem;
}

h3 {
  margin-bottom: 1rem;
}
</style>
