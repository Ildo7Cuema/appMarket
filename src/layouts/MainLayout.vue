<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Navbar -->
    <q-header elevated class="header-nav">
      <q-toolbar class="q-px-md">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        >
          <q-tooltip>Menu</q-tooltip>
        </q-btn>

        <q-toolbar-title class="row items-center">
          <img src="~assets/logo.png" alt="AppMarket Logo" class="header-logo q-mr-sm" />
          <span class="text-weight-bold">AppMarket</span>
        </q-toolbar-title>

        <!-- Perfil do Usuário -->
        <q-btn-dropdown flat class="user-profile-btn">
          <template v-slot:label>
            <div class="row items-center no-wrap">
              <q-avatar size="32px" color="primary" text-color="white" class="q-mr-sm">
                {{ user.charAt(0).toUpperCase() }}
              </q-avatar>
              <div class="text-weight-medium">{{ user }}</div>
            </div>
          </template>

          <q-list>
            <q-item clickable v-close-popup to="/profile">
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>Meu Perfil</q-item-section>
            </q-item>

            <q-item clickable v-close-popup to="/settings">
              <q-item-section avatar>
                <q-icon name="settings" color="primary" />
              </q-item-section>
              <q-item-section>Configurações</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" color="negative" />
              </q-item-section>
              <q-item-section class="text-negative">Sair</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <!-- Sidebar -->
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
          <!-- Logo e Título -->
          <div class="sidebar-header q-pa-md">
            <img src="~assets/logo.png" alt="AppMarket Logo" class="sidebar-logo q-mb-md" />
            <div class="text-h6 text-weight-bold text-primary">Menu Principal</div>
          </div>

          <!-- Links do Menu -->
          <q-item
            v-for="link in linksList"
            :key="link.title"
            :to="link.link"
            clickable
            v-ripple
            class="menu-item"
            :active="isActive(link.link)"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" :color="link.iconColor" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{ link.title }}</q-item-label>
              <q-item-label caption class="text-grey-7">{{ link.caption }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Conteúdo Principal -->
    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

// Recuperando o valor armazenado no localStorage
const storedUser = localStorage.getItem('username')
const username = storedUser ? localStorage.getItem('username') : 'Convidado'
const user = ref(username)
const role = ref(localStorage.getItem('role'))

const allLinks = [
  {
    title: 'Painel',
    caption: 'Painel principal',
    icon: 'dashboard',
    link: '/',
    roles: ['admin', 'operador de caixa', 'super-admin'],
    iconColor: 'primary',
  },
  {
    title: 'Meu Perfil',
    caption: 'Alterar senha',
    icon: 'person',
    link: '/profile',
    roles: ['admin', 'operador de caixa', 'super-admin'],
    iconColor: 'blue-grey',
  },
  {
    title: 'Admin',
    caption: 'Administração do sistema',
    icon: 'admin_panel_settings',
    link: '/admin',
    roles: ['admin', 'super-admin'],
    iconColor: 'secondary',
  },
  {
    title: 'Funcionários',
    caption: 'Gestão de funcionários',
    icon: 'groups',
    link: '/employees',
    roles: ['admin', 'super-admin'],
    iconColor: 'blue',
  },
  {
    title: 'Categorias',
    caption: 'Gestão de categorias de produtos',
    icon: 'category',
    link: '/categories',
    roles: ['admin', 'super-admin'],
    iconColor: 'teal',
  },
  {
    title: 'Produtos e Stock',
    caption: 'Gestão de produtos e inventário',
    icon: 'inventory',
    link: '/products-stock',
    roles: ['admin', 'super-admin'],
    iconColor: 'green',
  },
  {
    title: 'Vendas',
    caption: 'Transações de vendas',
    icon: 'point_of_sale',
    link: '/sales',
    roles: ['operador de caixa'],
    iconColor: 'red',
  },
  {
    title: 'Permissões',
    caption: 'Gestão de permissões',
    icon: 'lock',
    link: '/permissions',
    roles: ['super-admin'],
    iconColor: 'purple',
  },
  {
    title: 'Status de Ativação',
    caption: 'Verificar status da ativação',
    icon: 'verified_user',
    link: '/admin/activation-status',
    roles: ['admin', 'super-admin'],
    iconColor: 'blue',
  },
  {
    title: 'Faturas Pró-Forma',
    caption: 'Gestão de faturas pró-forma',
    icon: 'receipt_long',
    link: '/proforma-invoices',
    roles: ['admin', 'super-admin'],
    iconColor: 'orange',
  },
]

const linksList = computed(() => {
  return allLinks.filter((link) => link.roles.includes(role.value))
})

const leftDrawerOpen = ref(false)
const showFullLayout = ref(true)

const isActive = (link) => {
  return route.path === link
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  $q.dialog({
    title: 'Confirmar Saída',
    message: 'Tem certeza que deseja sair do sistema?',
    persistent: true,
    ok: {
      label: 'Sair',
      color: 'negative',
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
    },
  }).onOk(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    router.push('/login')
    $q.notify({
      type: 'positive',
      message: 'Logout realizado com sucesso',
      position: 'top',
      timeout: 2000,
    })
  })
}
</script>

<style lang="scss" scoped>
.header-nav {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  height: 64px;

  .header-logo {
    height: 32px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  .user-profile-btn {
    .q-avatar {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.sidebar-drawer {
  background: white;
  border-right: 1px solid rgba(0, 0, 0, 0.12);

  .sidebar-header {
    background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
    padding: 24px 16px;
    color: white;

    .sidebar-logo {
      height: 48px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
  }

  .menu-item {
    margin: 4px 8px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(25, 118, 210, 0.05);
    }

    &.q-item--active {
      background: rgba(25, 118, 210, 0.1);
      color: #1976d2;
    }

    .q-item__section--avatar {
      min-width: 40px;
      padding-right: 12px;
    }

    .q-item__label {
      font-size: 0.95rem;
    }

    .q-item__label--caption {
      font-size: 0.75rem;
    }
  }
}

// Animações
.menu-item {
  transform-origin: left;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// Responsividade
@media (max-width: 599px) {
  .header-nav {
    .q-toolbar__title {
      font-size: 1rem;
    }
  }

  .sidebar-drawer {
    .sidebar-header {
      padding: 16px;
    }
  }
}
</style>
