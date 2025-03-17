<template>
  <q-page class="q-pa-lg bg-gray-50">
    <div class="max-w-7xl mx-auto">
      <q-tabs
        v-model="tab"
        align="left"
        class="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg q-mb-6"
        active-color="white"
        indicator-color="yellow-5"
      >
        <q-tab
          name="employees"
          icon="people"
          label="Funcionários"
          class="q-px-6 q-py-3 text-orange-14"
        />
        <q-tab
          name="users"
          icon="person_add"
          label="Usuários"
          class="q-px-6 q-py-3 text-deep-orange-14"
        />
        <q-tab
          name="user"
          icon="person"
          label="Gestão de usuário"
          class="q-px-6 q-py-3 text-teal"
        />
      </q-tabs>

      <div v-if="tab === 'employees'" class="row q-col-gutter-md">
        <div class="col-12">
          <q-table
            dense
            title="# Gestão e lista de funcionários"
            title-class="text-blue-800 text-h6 q-mb-4"
            :rows="employees"
            :columns="columns"
            row-key="id"
            :loading="loading"
            loading-label="A carregar..."
            class="shadow-sm"
            :grid="$q.screen.lt.md"
            :pagination="{ rowsPerPage: 10 }"
            card-class="bg-blue-1"
          >
            <template v-slot:top-right>
              <q-btn
                color="primary"
                icon="add"
                size="sm"
                label="Novo Funcionário"
                @click="showCreateDialog = true"
                no-caps
              />
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn flat round icon="edit" @click="editEmployee(props.row)" />
                <q-btn
                  flat
                  round
                  icon="delete"
                  color="negative"
                  @click="confirmDelete(props.row)"
                />
              </q-td>
            </template>
          </q-table>
        </div>
      </div>

      <!-- Users Table -->
      <div v-if="tab === 'users'" class="row q-col-gutter-md">
        <div class="col-12">
          <q-table
            dense
            title="# Lista de funcionários para criar usuários"
            title-class=""
            :rows="employees"
            :columns="userColumns"
            row-key="id"
            :loading="loading"
            loading-label="A carregar..."
            class="shadow-sm"
            :grid="$q.screen.lt.md"
            :pagination="{ rowsPerPage: 10 }"
            card-class="bg-blue-1"
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn flat round icon="edit" @click="editUser(props.row)" />
              </q-td>
            </template>
          </q-table>
        </div>
      </div>

      <!-- User Dialog -->
      <q-dialog v-model="showUserDialog">
        <q-card style="min-width: 450px" class="shadow-xl">
          <q-card-section class="bg-gradient-to-r from-blue-600 to-blue-800">
            <div class="text-h6 text-white">Criar Usuário</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-form @submit="createUser">
              <q-select
                dense
                v-model="userForm.accessLevel"
                :options="accessLevels"
                label="Nível de Acesso"
                required
                class="q-mb-4"
                filled
                standout="bg-blue-2 text-blue-9"
                :rules="[(val) => !!val || 'Campo obrigatório']"
              />

              <q-input
                dense
                v-model="userForm.generatedPassword"
                label="Senha Gerada"
                readonly
                class="q-mb-6"
                filled
                standout="bg-blue-2 text-blue-9"
              >
                <template v-slot:append>
                  <q-btn
                    round
                    dense
                    flat
                    icon="content_copy"
                    @click="copyPassword"
                    class="text-blue-700"
                  />
                </template>
              </q-input>

              <div class="q-mt-6 flex justify-between q-mt-sm">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Criar Usuário"
                  class="q-px-8"
                  :loading="loading"
                />
                <q-btn flat label="Cancelar" color="negative" v-close-popup class="q-px-8" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Create/Edit Dialog -->
      <q-dialog v-model="showCreateDialog">
        <q-card style="min-width: 400px">
          <q-card-section>
            <div class="text-h6">{{ isEditing ? 'Editar' : 'Novo' }} Funcionário</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-form @submit="saveEmployee">
              <q-input v-model="employeeForm.name" label="Nome" required />

              <q-input v-model="employeeForm.email" label="Email" type="email" required />

              <q-input
                v-model="employeeForm.phone"
                label="Telefone"
                mask="(###) ###-####"
                required
              />

              <q-input v-model="employeeForm.address" label="Endereço" required />

              <div class="q-mt-md">
                <q-btn type="submit" color="primary" :label="isEditing ? 'Atualizar' : 'Criar'" />
                <q-btn flat label="Cancelar" color="negative" v-close-popup />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- User Management -->
      <div v-if="tab === 'user'" class="row q-col-gutter-md">
        <div class="col-12">
          <UserManagement @updateStatus="toggleStatus" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import EmployeeService from '../services/employee.service'
import UserManagement from './UserManagement.vue'
import userService from 'src/services/user.service'

const tab = ref('employees')

const $q = useQuasar()

const employees = ref([])
const users = ref([])
const loading = ref(false)
const showCreateDialog = ref(false)
const isEditing = ref(false)

const employeeForm = ref({
  id: null,
  name: '',
  email: '',
  phone: '',
  address: '',
})

async function toggleStatus(user) {
  console.log(user.isActive != user.isActive)
  const status = (user.isActive = user.isActive === 1 ? false : true)

  try {
    const updatedUser = await userService.updateUserStatus(user.id, {
      isActive: status,
    })

    const index = users.value.findIndex((u) => u.id === user.id)
    if (index !== -1) {
      users.value[index].active = updatedUser.isActive === true
    }

    $q.notify({
      type: 'positive',
      message: `Status do usuário atualizado para ${updatedUser.isActive === true ? 'Activo' : 'Inativo'}`,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Falha ao atualizar status: ${error.message}`,
    })
  }
}

async function fetchEmployees() {
  try {
    loading.value = true
    employees.value = await EmployeeService.getEmployees()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao carregar funcionários',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEmployees()
})

const columns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'phone', label: 'Telefone', field: 'phone', align: 'left' },
  { name: 'address', label: 'Endereço', field: 'address', align: 'left' },
  { name: 'actions', label: 'Acções', align: 'center' },
]

const userColumns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'actions', label: 'Acções', align: 'center' },
]

const showUserDialog = ref(false)
const accessLevels = ['Admin', 'Gerente', 'Operador de caixa']
const userForm = ref({
  username: '',
  accessLevel: '',
  generatedPassword: '',
})

function generatePassword() {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

function editUser(employee) {
  userForm.value = {
    username: employee.email,
    role: '',
    generatedPassword: generatePassword(),
  }
  showUserDialog.value = true
}

function copyPassword() {
  navigator.clipboard.writeText(userForm.value.generatedPassword)
  $q.notify({
    type: 'positive',
    message: 'Senha copiada para a área de transferência',
  })
}

async function createUser() {
  try {
    loading.value = true
    // Call API to create user with access level and password
    await EmployeeService.createUser({
      username: userForm.value.username,
      accessLevel: userForm.value.accessLevel,
      password: userForm.value.generatedPassword,
    })

    $q.notify({
      type: 'positive',
      message: 'Usuário criado com sucesso',
    })

    showUserDialog.value = false
    userForm.value = {
      employeeId: null,
      accessLevel: '',
      generatedPassword: '',
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao criar usuário',
    })
    console.error(error)
  } finally {
    loading.value = false
  }
}

function editEmployee(employee) {
  employeeForm.value = { ...employee }
  isEditing.value = true
  showCreateDialog.value = true
}

function confirmDelete(employee) {
  $q.dialog({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir ${employee.name}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      loading.value = true
      await EmployeeService.deleteEmployee(employee.id)
      // Refresh employee list
      await fetchEmployees()
      $q.notify({
        type: 'positive',
        message: 'Funcionário excluído com sucesso',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Erro ao excluir funcionário',
      })
      console.error(error)
    } finally {
      loading.value = false
    }
  })
}

async function saveEmployee() {
  try {
    loading.value = true
    const employeeData = {
      name: employeeForm.value.name,
      email: employeeForm.value.email,
      phone: employeeForm.value.phone,
      address: employeeForm.value.address,
    }

    if (isEditing.value) {
      await EmployeeService.updateEmployee(employeeForm.value.id, employeeData)
    } else {
      await EmployeeService.createEmployee(employeeData)
    }
    // Refresh employee list
    await fetchEmployees()

    $q.notify({
      type: 'positive',
      message: `Funcionário ${isEditing.value ? 'atualizado' : 'criado'} com sucesso`,
    })

    showCreateDialog.value = false
    employeeForm.value = {
      id: null,
      name: '',
      email: '',
    }
    isEditing.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || `Erro ao ${isEditing.value ? 'atualizar' : 'criar'} funcionário`,
    })
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
h2 {
  margin-bottom: 2rem;
}
</style>
