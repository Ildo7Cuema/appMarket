<template>
  <q-page padding>
    <h2>Gestão de Permissões</h2>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Funções do Sistema</div>
            <q-list bordered>
              <q-item
                v-for="role in roles"
                :key="role.id"
                clickable
                v-ripple
                @click="selectRole(role)"
              >
                <q-item-section avatar>
                  <q-icon :name="role.icon" :color="role.color" size="24px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ role.name }}</q-item-label>
                  <q-item-label caption>{{ role.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Permissões</div>
            <template v-if="loading">
              <q-linear-progress indeterminate />
            </template>
            <template v-else>
              <template v-if="permissions.length > 0">
                <q-list v-if="selectedRole">
                  <q-item
                    v-for="permission in permissions"
                    :key="permission.id"
                    tag="label"
                    v-ripple
                  >
                    <q-item-section>
                      <q-item-label>{{ permission.name }}</q-item-label>
                      <q-item-label caption>{{ permission.description }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-toggle v-model="selectedRole.permissions" :val="permission.id" />
                    </q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-center q-pa-md">
                  Selecione uma função para editar permissões
                </div>
              </template>
              <div v-else class="text-center q-pa-md">
                Nenhuma permissão encontrada no banco de dados
              </div>
            </template>
          </q-card-section>

          <q-card-actions v-if="selectedRole" align="right">
            <q-btn color="primary" label="Salvar" @click="savePermissions" :loading="saving" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import AuthService from '../services/auth.service'

const $q = useQuasar()

const roles = ref([])
const permissions = ref([])
const selectedRole = ref(null)
const loading = ref(false)
const saving = ref(false)

function translateErrorMessage(error) {
  if (error.response) {
    switch (error.response.status) {
      case 404:
        return 'Recurso não encontrado'
      case 401:
        return 'Acesso não autorizado'
      case 500:
        return 'Erro interno do servidor'
      default:
        return `Erro ${error.response.status}: ${error.response.data.message || 'Erro desconhecido'}`
    }
  }
  return error.message || 'Erro desconhecido'
}

async function fetchRolesAndPermissions() {
  try {
    loading.value = true
    const [rolesResponse, permissionsResponse] = await Promise.all([
      AuthService.getRoles(),
      AuthService.getPermissions(),
    ])

    // Add icons and colors to roles
    roles.value = rolesResponse.map((role) => ({
      ...role,
      icon: getRoleIcon(role.name),
      color: getRoleColor(role.name),
    }))

    permissions.value = permissionsResponse
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Erro ao carregar dados: ${translateErrorMessage(error)}`,
    })
  } finally {
    loading.value = false
  }
}

function getRoleIcon(roleName) {
  const icons = {
    'Super Admin': 'security',
    Admin: 'admin_panel_settings',
    Cashier: 'point_of_sale',
  }
  return icons[roleName] || 'person'
}

function getRoleColor(roleName) {
  const colors = {
    'Super Admin': 'red',
    Admin: 'blue',
    Cashier: 'green',
  }
  return colors[roleName] || 'grey'
}

function selectRole(role) {
  selectedRole.value = { ...role }
}

async function savePermissions() {
  try {
    saving.value = true
    // TODO: Implement save logic
    $q.notify({
      type: 'positive',
      message: 'Permissões salvas com sucesso!',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Erro ao salvar permissões: ${translateErrorMessage(error)}`,
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchRolesAndPermissions()
})
</script>

<style scoped>
h2 {
  margin-bottom: 2rem;
}
</style>
