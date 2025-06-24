<template>
  <q-page class="employees-page">
    <!-- Header com gradiente -->
    <div class="header-section q-px-lg q-pt-lg q-pb-xl">
      <div class="row items-center justify-between">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bold text-white">Gestão de Funcionários</div>
          <div class="text-subtitle1 text-grey-3 q-mt-sm">
            Gerencie funcionários, usuários e permissões do sistema
          </div>
        </div>
      </div>
    </div>

    <div class="content-container q-px-lg q-mt-xl">
      <!-- Tabs com design moderno -->
      <q-card class="tabs-card q-mb-lg">
        <q-tabs
          v-model="tab"
          class="text-grey-8"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
          dense
        >
          <q-tab name="employees" class="tab-item">
            <div class="row items-center">
              <q-icon name="people" size="24px" class="q-mr-sm" />
              <div class="tab-label">
                <div class="text-weight-medium">Funcionários</div>
                <div class="text-caption text-grey-7">Gerenciar funcionários</div>
              </div>
            </div>
          </q-tab>
          <q-tab name="users" class="tab-item">
            <div class="row items-center">
              <q-icon name="person_add" size="24px" class="q-mr-sm" />
              <div class="tab-label">
                <div class="text-weight-medium">Usuários</div>
                <div class="text-caption text-grey-7">Criar contas</div>
              </div>
            </div>
          </q-tab>
          <q-tab name="user" class="tab-item">
            <div class="row items-center">
              <q-icon name="manage_accounts" size="24px" class="q-mr-sm" />
              <div class="tab-label">
                <div class="text-weight-medium">Gestão de Usuário</div>
                <div class="text-caption text-grey-7">Gerenciar permissões</div>
              </div>
            </div>
          </q-tab>
        </q-tabs>
      </q-card>

      <!-- Tabela de Funcionários -->
      <div v-if="tab === 'employees'" class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="data-table-card">
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between q-mb-md">
                <div class="column">
                  <div class="text-h6 text-weight-bold text-primary">Lista de Funcionários</div>
                  <div class="text-caption text-grey-7">Gerencie os funcionários da empresa</div>
                </div>
                <q-btn
                  color="primary"
                  icon="add"
                  label="Novo Funcionário"
                  @click="openEmployeeDialog()"
                  class="action-btn"
                  unelevated
                >
                  <q-tooltip>Adicionar novo funcionário</q-tooltip>
                </q-btn>
              </div>
              <div class="row items-center q-mb-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="employeeSearch"
                    dense
                    outlined
                    placeholder="Pesquisar funcionários..."
                    class="search-input"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="primary" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        name="clear"
                        class="cursor-pointer"
                        @click="employeeSearch = ''"
                        v-if="employeeSearch"
                      />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <q-table
                :rows="filteredEmployees"
                :columns="employeeColumns"
                row-key="id"
                :loading="loading"
                v-model:pagination="pagination"
                flat
                bordered
                dense
                binary-state-sort
                class="modern-table"
                :rows-per-page-options="[10, 20, 50]"
              >
                <template v-slot:loading>
                  <q-inner-loading showing color="primary">
                    <q-spinner-dots size="50px" color="primary" />
                  </q-inner-loading>
                </template>
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props" class="text-center">
                    <q-btn-group flat>
                      <q-btn
                        flat
                        round
                        color="primary"
                        icon="edit"
                        @click="openEmployeeDialog(props.row)"
                        class="q-mx-xs"
                      >
                        <q-tooltip>Editar Funcionário</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="delete"
                        @click="confirmDeleteEmployee(props.row)"
                        class="q-mx-xs"
                      >
                        <q-tooltip>Excluir Funcionário</q-tooltip>
                      </q-btn>
                    </q-btn-group>
                  </q-td>
                </template>
                <template v-slot:no-data>
                  <div class="full-width row flex-center q-pa-md text-grey-7">
                    <q-icon name="sentiment_dissatisfied" size="24px" class="q-mr-sm" />
                    Nenhum funcionário encontrado
                  </div>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Users Table -->
      <div v-if="tab === 'users'" class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="data-table-card">
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between q-mb-md">
                <div class="column">
                  <div class="text-h6 text-weight-bold text-primary">Lista de Usuários</div>
                  <div class="text-caption text-grey-7">Crie e gerencie contas de usuários</div>
                </div>
              </div>
              <div class="row items-center q-mb-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="userSearch"
                    dense
                    outlined
                    placeholder="Pesquisar usuários..."
                    class="search-input"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="primary" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        name="clear"
                        class="cursor-pointer"
                        @click="userSearch = ''"
                        v-if="userSearch"
                      />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <q-table
                :rows="filteredUsers"
                :columns="userColumns"
                row-key="id"
                :loading="loading"
                flat
                bordered
                dense
                binary-state-sort
                class="modern-table"
                :rows-per-page-options="[10, 20, 50]"
                size="sm"
              >
                <template v-slot:loading>
                  <q-inner-loading showing color="primary">
                    <q-spinner-dots size="50px" color="primary" />
                  </q-inner-loading>
                </template>
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props" class="text-center">
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="person_add"
                      @click="editUser(props.row)"
                      class="q-mx-xs"
                    >
                      <q-tooltip>Criar Usuário</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
                <template v-slot:no-data>
                  <div class="full-width row flex-center q-pa-md text-grey-7">
                    <q-icon name="sentiment_dissatisfied" size="24px" class="q-mr-sm" />
                    Nenhum funcionário disponível para criar usuário
                  </div>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
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

      <!-- Diálogo de Funcionário -->
      <q-dialog v-model="employeeDialog" persistent>
        <q-card
          style="
            min-width: 600px;
            max-width: 600px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
          "
          class="dialog-card"
        >
          <q-card-section class="bg-gradient-primary text-white row items-center q-pa-lg">
            <div class="text-h6">
              <q-icon name="person_add" class="q-mr-sm" />
              {{ editingEmployee ? 'Editar' : 'Novo' }} Funcionário
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup class="text-white" />
          </q-card-section>

          <q-card-section class="q-pa-xl scroll" style="flex: 1">
            <q-form @submit="saveEmployee" class="q-gutter-lg">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="employeeForm.name"
                    label="Nome Completo"
                    outlined
                    dense
                    :rules="[
                      (val) => !!val || 'Nome é obrigatório',
                      (val) => val.length >= 3 || 'Nome deve ter pelo menos 3 caracteres',
                    ]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" color="primary" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12">
                  <q-input
                    v-model="employeeForm.email"
                    label="Email"
                    outlined
                    dense
                    type="email"
                    :rules="[
                      (val) => !!val || 'Email é obrigatório',
                      (val) => /.+@.+\..+/.test(val) || 'Email inválido',
                      (val) => checkDuplicateEmail(val) || 'Email já cadastrado',
                    ]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="email" color="primary" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    v-model="employeeForm.phone"
                    label="Telefone"
                    outlined
                    dense
                    mask="(##) #####-####"
                    unmasked-value
                    :rules="[(val) => !val || val.length === 11 || 'Telefone inválido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="phone" color="primary" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-6">
                  <q-select
                    v-model="employeeForm.role"
                    :options="roles"
                    label="Cargo"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Cargo é obrigatório']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="work" color="primary" />
                    </template>
                  </q-select>
                </div>

                <div class="col-12">
                  <q-input
                    v-model="employeeForm.address"
                    label="Endereço (opcional)"
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                  >
                    <template v-slot:prepend>
                      <q-icon name="location_on" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-form>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="bg-white q-pa-lg">
            <q-btn
              label="Cancelar"
              color="grey"
              outline
              no-caps
              padding="sm lg"
              v-close-popup
              icon="close"
            />
            <q-btn
              :label="editingEmployee ? 'Salvar Alterações' : 'Criar Funcionário'"
              color="primary"
              :loading="loading"
              icon="save"
              unelevated
              no-caps
              padding="sm lg"
              @click="saveEmployee"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- User Management -->
      <div v-if="tab === 'user'" class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="data-table-card">
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between q-mb-md">
                <div class="column">
                  <div class="text-h6 text-weight-bold text-primary">Gestão de Usuários</div>
                  <div class="text-caption text-grey-7">
                    Gerencie permissões e status dos usuários
                  </div>
                </div>
              </div>
              <div class="row items-center q-mb-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="userManagementSearch"
                    dense
                    outlined
                    placeholder="Pesquisar usuários..."
                    class="search-input"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="primary" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        name="clear"
                        class="cursor-pointer"
                        @click="userManagementSearch = ''"
                        v-if="userManagementSearch"
                      />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <UserManagement @updateStatus="toggleStatus" class="modern-table" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import EmployeeService from '../services/employee.service'
import UserManagement from './UserManagement.vue'
import userService from 'src/services/user.service'

const tab = ref('employees')
const employeeSearch = ref('')
const userSearch = ref('')
const userManagementSearch = ref('')
const pagination = ref({
  rowsPerPage: 10,
  page: 1,
})

const $q = useQuasar()

const employees = ref([])
const users = ref([])
const loading = ref(false)

const editingEmployee = ref(false)
const employeeForm = ref({
  id: null,
  name: '',
  email: '',
  phone: '',
  address: '',
})

const roles = ['Gerente', 'Vendedor', 'Caixa', 'Estoquista', 'Administrativo']
const employeeColumns = [
  {
    name: 'name',
    label: 'Nome',
    field: 'name',
    align: 'left',
    sortable: true,
    style: 'width: 25%',
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left',
    sortable: true,
    style: 'width: 30%',
  },
  {
    name: 'phone',
    label: 'Telefone',
    field: 'phone',
    align: 'left',
    style: 'width: 20%',
  },
  {
    name: 'role',
    label: 'Cargo',
    field: 'role',
    align: 'left',
    sortable: true,
    style: 'width: 15%',
  },
  {
    name: 'actions',
    label: 'Ações',
    align: 'center',
    style: 'width: 10%',
  },
]

const filteredEmployees = computed(() => {
  if (!employees.value || !Array.isArray(employees.value)) {
    return []
  }

  if (!employeeSearch.value) {
    return employees.value
  }

  const search = employeeSearch.value.toLowerCase()
  return employees.value.filter((employee) => {
    return (
      (employee?.name?.toLowerCase()?.includes(search) ?? false) ||
      (employee?.email?.toLowerCase()?.includes(search) ?? false) ||
      (employee?.role?.toLowerCase()?.includes(search) ?? false)
    )
  })
})

const filteredUsers = computed(() => {
  if (!employees.value || !Array.isArray(employees.value)) {
    return []
  }

  if (!userSearch.value) {
    return employees.value
  }

  const search = userSearch.value.toLowerCase()
  return employees.value.filter((employee) => {
    return (
      (employee?.name?.toLowerCase()?.includes(search) ?? false) ||
      (employee?.email?.toLowerCase()?.includes(search) ?? false)
    )
  })
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

const userColumns = [
  {
    name: 'name',
    label: 'Nome',
    field: 'name',
    align: 'left',
    style: 'width: 40%',
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left',
    style: 'width: 45%',
  },
  {
    name: 'actions',
    label: 'Ações',
    align: 'center',
    style: 'width: 15%',
  },
]

const employeeDialog = ref(false)
const showUserDialog = ref(false)
const accessLevels = ['Admin', 'Gerente', 'Operador de caixa']
const userForm = ref({
  username: '',
  accessLevel: '',
  generatedPassword: '',
})

function checkDuplicateEmail(email) {
  if (!email || editingEmployee.value) return true

  // Verifica se o email já existe em outro funcionário
  const exists = employees.value.some(
    (emp) => emp.email.toLowerCase() === email.toLowerCase() && emp.id !== employeeForm.value.id,
  )

  return !exists
}

function openEmployeeDialog(employee = null) {
  if (employee) {
    employeeForm.value = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      address: employee.address || '',
    }
    editingEmployee.value = true
  } else {
    employeeForm.value = {
      id: null,
      name: '',
      email: '',
      phone: '',
      role: '',
      address: '',
    }
    editingEmployee.value = false
  }
  employeeDialog.value = true
}

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

async function saveEmployee() {
  try {
    loading.value = true
    const employeeData = {
      name: employeeForm.value.name,
      email: employeeForm.value.email,
      phone: employeeForm.value.phone,
      role: employeeForm.value.role,
      address: employeeForm.value.address,
    }

    if (editingEmployee.value) {
      await EmployeeService.updateEmployee(employeeForm.value.id, employeeData)
    } else {
      await EmployeeService.createEmployee(employeeData)
    }
    // Refresh employee list
    await fetchEmployees()

    $q.notify({
      type: 'positive',
      message: `Funcionário ${editingEmployee.value ? 'atualizado' : 'criado'} com sucesso`,
      icon: 'check_circle',
      position: 'top',
    })

    employeeDialog.value = false
    employeeForm.value = {
      id: null,
      name: '',
      email: '',
      phone: '',
      role: '',
      address: '',
    }
    editingEmployee.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message:
        error.message || `Erro ao ${editingEmployee.value ? 'atualizar' : 'criar'} funcionário`,
      icon: 'error',
      position: 'top',
    })
    console.error(error)
  } finally {
    loading.value = false
  }
}

function confirmDeleteEmployee(employee) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir o funcionário ${employee.name}?`,
    persistent: true,
    ok: {
      label: 'Excluir',
      color: 'negative',
      flat: false,
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey',
      flat: true,
    },
  }).onOk(() => {
    deleteEmployee(employee)
  })
}

async function deleteEmployee(employee) {
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
}
</script>

<style scoped>
.employees-page {
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

.tabs-card {
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.tab-item {
  padding: 16px;
  min-height: 72px;
}

.tab-label {
  text-align: left;
  line-height: 1.2;
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

  .tab-item {
    padding: 12px;
    min-height: 60px;
  }
}

.data-table-card {
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.data-table-card:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
}

.search-input {
  max-width: 100%;
  transition: all 0.3s ease;
}

.search-input:focus-within {
  transform: translateY(-1px);
}

.modern-table {
  border-radius: 8px;
  overflow: hidden;
}

.modern-table :deep(.q-table__top),
.modern-table :deep(.q-table__bottom) {
  padding: 12px 16px;
  background: #f8fafc;
}

.modern-table :deep(th) {
  font-weight: 600;
  color: #1976d2;
  background: #f8fafc;
  font-size: 0.813rem;
  transition: all 0.3s ease;
  padding: 8px 12px;
  height: 40px;
}

.modern-table :deep(td) {
  padding: 6px 12px;
  font-size: 0.813rem;
  height: 36px;
}

.modern-table :deep(tr) {
  height: 36px;
}

.modern-table :deep(.q-table__grid-content) {
  background: #f8fafc;
}

.modern-table :deep(.q-table__bottom) {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  min-height: 40px;
}

/* Ajuste para os botões de ação na tabela */
.modern-table :deep(.q-btn) {
  padding: 4px;
  min-height: 32px;
  min-width: 32px;
}

.modern-table :deep(.q-btn__content) {
  font-size: 1.1rem;
}

/* Ajuste para linhas alternadas */
.modern-table :deep(tbody tr:nth-child(even)) {
  background: #fafbfc;
}

.modern-table :deep(tbody tr:hover) {
  background: #f0f7ff !important;
}

/* Ajuste para o loading e mensagens */
.modern-table :deep(.q-inner-loading) {
  background: rgba(255, 255, 255, 0.9);
}

.modern-table :deep(.q-table__bottom--nodata) {
  min-height: 100px;
  font-size: 0.875rem;
}

/* Responsividade */
@media (max-width: 599px) {
  .modern-table :deep(th),
  .modern-table :deep(td) {
    padding: 6px 8px;
    font-size: 0.75rem;
    height: 32px;
  }

  .modern-table :deep(tr) {
    height: 32px;
  }

  .modern-table :deep(.q-btn) {
    padding: 3px;
    min-height: 28px;
    min-width: 28px;
  }
}

.action-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

q-btn-group :deep(.q-btn) {
  transition: all 0.3s ease;
}

q-btn-group :deep(.q-btn:hover) {
  background: rgba(25, 118, 210, 0.1);
}

.dialog-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.dialog-card :deep(.q-field) {
  margin-bottom: 20px;
}

/* Espaçamento adequado para o formulário */
.dialog-card :deep(.q-form) {
  max-width: 100%;
}

/* Alinhamento dos ícones */
.dialog-card :deep(.q-field__prepend) {
  padding-right: 12px;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
}

/* Animações suaves nos inputs */
.dialog-card :deep(.q-field__control) {
  transition: all 0.3s ease;
}

.dialog-card :deep(.q-field--focused .q-field__control) {
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(25, 118, 210, 0.15);
}

/* Estilo dos botões */
.dialog-card :deep(.q-btn) {
  transition: all 0.3s ease;
}

.dialog-card :deep(.q-btn:hover) {
  transform: translateY(-1px);
}

/* Separador estilizado */
.dialog-card :deep(.q-separator) {
  background: linear-gradient(to right, transparent, rgba(25, 118, 210, 0.2), transparent);
  height: 1px;
}

/* Ajuste do padding lateral do formulário */
@media (min-width: 600px) {
  .dialog-card :deep(.q-card__section--vert) {
    padding: 32px 48px;
  }
}

/* Largura dos campos de input */
.dialog-card :deep(.q-field__control) {
  min-height: 48px;
}

/* Alinhamento do campo de textarea */
.dialog-card :deep(textarea.q-field__native) {
  padding-top: 12px;
}

/* Estilo dos botões de ação */
.dialog-card :deep(.q-btn--outline) {
  border-width: 2px;
}

.dialog-card :deep(.q-btn) {
  min-width: 120px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Responsividade */
@media (max-width: 599px) {
  .dialog-card {
    width: 90vw;
    min-width: unset !important;
  }

  .modern-table :deep(th),
  .modern-table :deep(td) {
    padding: 8px;
  }
}
</style>
