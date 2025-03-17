<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> AppMarket </q-toolbar-title>

        <div class="q-mr-md">
          <q-icon name="person" class="q-mr-xs" />
          {{ user }}
        </div>

        <q-btn flat round icon="settings" class="q-mr-sm" to="/settings">
          <q-tooltip>Configurações</q-tooltip>
        </q-btn>
        <q-btn flat round icon="logout" class="q-mr-sm" @click="logout()">
          <q-tooltip>Sair</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="sidebar-drawer"
      :width="280"
      v-if="showFullLayout"
    >
      <q-scroll-area class="fit">
        <q-list class="sidebar-menu">
          <div class="q-pa-md text-center">
            <img
              src="~assets/logo.png"
              alt="AppMarket Logo"
              style="max-width: 150px; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"
              class="q-mb-md"
            />
          </div>
          <q-item-label header class="text-center text-weight-bold text-grey-8">
            Menu Principal
          </q-item-label>
          <EssentialLink
            v-for="link in linksList"
            :key="link.title"
            :title="link.title"
            :caption="link.caption"
            :link="link.link"
            :icon="link.icon"
            :color="link.iconColor"
          />
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="bg-blue-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import EssentialLink from 'components/EssentialLink.vue'

const $q = useQuasar()
const router = useRouter()

// Recuperando o valor armazenado no localStorage
const storedUser = localStorage.getItem('username')

// Verificando se o valor existe e se é um JSON válido
const username = storedUser ? localStorage.getItem('username') : 'Convidado'

// Criando o objeto reativo com o nome
const user = ref(username)

const role = ref(localStorage.getItem('role'))

const allLinks = [
  {
    title: 'Painel',
    caption: 'Painel principal',
    icon: 'dashboard',
    link: '/',
    roles: ['admin', 'operador de caixa', 'super-admin'],
    iconColor: 'gree-10', // Cor para o ícone
  },
  {
    title: 'Meu Perfil',
    caption: 'Alterar senha',
    icon: 'person',
    link: '/profile',
    roles: ['admin', 'operador de caixa', 'super-admin'],
    iconColor: 'blue-grey', // Cor para o ícone
  },
  /*{
    title: 'Assinatura',
    caption: 'Gerenciar assinatura',
    icon: 'paid',
    link: '/assinatura',
    roles: ['admin', 'super-admin'],
    iconColor: 'green', // Cor para o ícone
  },*/
  {
    title: 'Admin',
    caption: 'Administração do sistema',
    icon: 'admin_panel_settings',
    link: '/admin',
    roles: ['admin', 'super-admin'],
    iconColor: 'secondary', // Cor para o ícone
  },
  {
    title: 'Funcionários',
    caption: 'Gestão de funcionários',
    icon: 'groups',
    link: '/employees',
    roles: ['admin', 'super-admin'],
    iconColor: 'blue', // Cor para o ícone
  },
  {
    title: 'Categorias',
    caption: 'Gestão de categorias de produtos',
    icon: 'category',
    link: '/categories',
    roles: ['admin', 'super-admin'],
    iconColor: 'teal', // Cor para o ícone
  },
  {
    title: 'Produtos e Stock',
    caption: 'Gestão de produtos e inventário',
    icon: 'inventory',
    link: '/products-stock',
    roles: ['admin', 'super-admin'],
    iconColor: 'green', // Cor para o ícone
  },
  {
    title: 'Vendas',
    caption: 'Transações de vendas',
    icon: 'point_of_sale',
    link: '/sales',
    roles: ['operador de caixa'],
    iconColor: 'red', // Cor para o ícone
  },
  /*{
    title: 'Relatórios',
    caption: 'Relatórios e estatísticas',
    icon: 'analytics',
    link: '/reports',
    roles: ['admin', 'super-admin'],
    iconColor: 'orange', // Cor para o ícone
  },*/
  {
    title: 'Permissões',
    caption: 'Gestão de permissões',
    icon: 'lock',
    link: '/permissions',
    roles: ['super-admin'],
    color: 'green-8', // Cor para o link
    iconColor: 'purple', // Cor para o ícone
  },
  {
    title: 'Status de Ativação',
    caption: 'Verificar status da ativação',
    icon: 'verified_user',
    link: '/admin/activation-status',
    roles: ['admin', 'super-admin'],
    iconColor: 'blue', // Cor para o ícone
  },
]

const linksList = computed(() => {
  return allLinks.filter((link) => link.roles.includes(role.value))
})

const leftDrawerOpen = ref(false)
const showFullLayout = ref(true)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
  router.push('/login')
  $q.notify({
    type: 'positive',
    message: 'Logged out successfully',
  })
}
</script>

<style lang="scss" scoped>
.sidebar-drawer {
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-right: 1px solid rgba(0, 0, 0, 0.12);

  .sidebar-menu {
    padding: 8px;

    .q-item__label--header {
      font-size: 0.875rem;
      letter-spacing: 0.5px;
      padding: 16px 0;
    }
  }
}

.q-header {
  background: linear-gradient(145deg, #6200ea, #7c4dff);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .q-toolbar {
    min-height: 64px;

    .q-toolbar__title {
      font-size: 1.25rem;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
  }
}
</style>
