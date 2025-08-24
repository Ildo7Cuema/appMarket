<template>
  <q-layout view="lHh Lpr lFf" class="modern-layout">
    <!-- Modern Header with Glass Effect -->
    <q-header elevated class="modern-header glass-dark">
      <q-toolbar class="header-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="menu-btn"
          size="md"
        >
          <q-tooltip class="text-body-small">Alternar Menu</q-tooltip>
        </q-btn>

        <q-toolbar-title class="header-brand">
          <div class="brand-container">
            <div class="brand-logo">
              <img src="~assets/logo.png" alt="AppMarket Logo" class="logo-img" />
            </div>
            <div class="brand-text">
              <div class="brand-name text-heading-2">AppMarket</div>
              <div class="brand-tagline text-caption">Sistema Profissional</div>
            </div>
          </div>
        </q-toolbar-title>

        <!-- Quick Actions -->
        <div class="header-actions">
          <q-btn
            flat
            round
            icon="notifications"
            class="action-btn"
            size="md"
          >
            <q-badge color="negative" floating rounded>3</q-badge>
            <q-tooltip>Notificações</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="search"
            class="action-btn"
            size="md"
          >
            <q-tooltip>Pesquisar</q-tooltip>
          </q-btn>
        </div>

        <!-- User Profile Dropdown -->
        <q-btn-dropdown flat class="user-profile-dropdown">
          <template v-slot:label>
            <div class="profile-label">
              <q-avatar size="36px" class="profile-avatar">
                <img src="https://cdn.quasar.dev/img/avatar.png" alt="User Avatar" />
              </q-avatar>
              <div class="profile-info">
                <div class="profile-name text-body">{{ user }}</div>
                <div class="profile-role text-caption">{{ role }}</div>
              </div>
              <q-icon name="keyboard_arrow_down" size="sm" class="dropdown-icon" />
            </div>
          </template>

          <q-list class="profile-menu">
            <q-item clickable v-close-popup to="/profile" class="menu-item">
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body">Meu Perfil</q-item-label>
                <q-item-label caption class="text-body-small">Configurações da conta</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup to="/settings" class="menu-item">
              <q-item-section avatar>
                <q-icon name="settings" color="grey-6" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body">Configurações</q-item-label>
                <q-item-label caption class="text-body-small">Preferências do sistema</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="q-my-sm" />

            <q-item clickable v-close-popup @click="logout" class="menu-item logout-item">
              <q-item-section avatar>
                <q-icon name="logout" color="negative" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body text-negative">Sair</q-item-label>
                <q-item-label caption class="text-body-small">Encerrar sessão</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <!-- Modern Sidebar -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="modern-sidebar"
      :width="280"
      v-if="showFullLayout"
    >
      <div class="sidebar-content">
        <!-- Sidebar Header -->
        <div class="sidebar-header">
          <div class="sidebar-brand">
            <div class="sidebar-logo">
              <img src="~assets/logo.png" alt="AppMarket" class="logo-img" />
            </div>
            <div class="sidebar-title">
              <div class="text-heading-2">Menu</div>
              <div class="text-caption">Navegação Principal</div>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <q-scroll-area class="sidebar-menu-area">
          <nav class="sidebar-nav nav-modern">
            <div class="nav-section">
              <div class="nav-section-title text-caption">Dashboard</div>
              <q-item
                v-for="link in dashboardLinks"
                :key="link.title"
                :to="link.link"
                clickable
                v-ripple
                class="nav-item"
                :class="{ active: isActive(link.link) }"
                @click="leftDrawerOpen = false"
              >
                <q-item-section avatar>
                  <q-icon :name="link.icon" class="nav-icon" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="nav-label">{{ link.title }}</q-item-label>
                  <q-item-label caption class="nav-caption">{{ link.caption }}</q-item-label>
                </q-item-section>

                <q-item-section side v-if="link.badge">
                  <q-badge :color="link.badgeColor || 'primary'" rounded>{{ link.badge }}</q-badge>
                </q-item-section>
              </q-item>
            </div>

            <div class="nav-section">
              <div class="nav-section-title text-caption">Gestão</div>
              <q-item
                v-for="link in managementLinks"
                :key="link.title"
                :to="link.link"
                clickable
                v-ripple
                class="nav-item"
                :class="{ active: isActive(link.link) }"
                @click="leftDrawerOpen = false"
              >
                <q-item-section avatar>
                  <q-icon :name="link.icon" class="nav-icon" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="nav-label">{{ link.title }}</q-item-label>
                  <q-item-label caption class="nav-caption">{{ link.caption }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="nav-section" v-if="adminLinks.length > 0">
              <div class="nav-section-title text-caption">Administração</div>
              <q-item
                v-for="link in adminLinks"
                :key="link.title"
                :to="link.link"
                clickable
                v-ripple
                class="nav-item"
                :class="{ active: isActive(link.link) }"
                @click="leftDrawerOpen = false"
              >
                <q-item-section avatar>
                  <q-icon :name="link.icon" class="nav-icon" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="nav-label">{{ link.title }}</q-item-label>
                  <q-item-label caption class="nav-caption">{{ link.caption }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </nav>
        </q-scroll-area>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <div class="system-status">
            <div class="status-indicator">
              <q-icon name="circle" color="positive" size="xs" />
              <span class="text-body-small">Sistema Online</span>
            </div>
            <div class="version-info text-caption">v1.0.0</div>
          </div>
        </div>
      </div>
    </q-drawer>

    <!-- Page Content -->
    <q-page-container class="page-container">
      <router-view class="animate-fade-in-up" />
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

// User data
const storedUser = localStorage.getItem('username')
const username = storedUser ? localStorage.getItem('username') : 'Convidado'
const user = ref(username)
const role = ref(localStorage.getItem('role') || 'Usuário')

// Navigation state
const leftDrawerOpen = ref(false)
const showFullLayout = ref(true)

// All navigation links organized by category
const allLinks = [
  {
    title: 'Painel',
    caption: 'Visão geral do sistema',
    icon: 'dashboard',
    link: '/',
    roles: ['admin', 'operador de caixa', 'super-admin'],
    category: 'dashboard',
    badge: null,
  },
  {
    title: 'Meu Perfil',
    caption: 'Gerenciar conta',
    icon: 'person',
    link: '/profile',
    roles: ['admin', 'operador de caixa', 'super-admin'],
    category: 'dashboard',
    badge: null,
  },
  {
    title: 'Vendas',
    caption: 'Processar vendas',
    icon: 'point_of_sale',
    link: '/sales',
    roles: ['operador de caixa'],
    category: 'management',
    badge: 'Novo',
    badgeColor: 'positive',
  },
  {
    title: 'Produtos e Stock',
    caption: 'Gestão de inventário',
    icon: 'inventory',
    link: '/products-stock',
    roles: ['admin', 'super-admin'],
    category: 'management',
    badge: null,
  },
  {
    title: 'Categorias',
    caption: 'Organizar produtos',
    icon: 'category',
    link: '/categories',
    roles: ['admin', 'super-admin'],
    category: 'management',
    badge: null,
  },
  {
    title: 'Faturas Pró-Forma',
    caption: 'Gestão de faturas',
    icon: 'receipt_long',
    link: '/proforma-invoices',
    roles: ['admin', 'super-admin'],
    category: 'management',
    badge: null,
  },
  {
    title: 'Admin',
    caption: 'Painel administrativo',
    icon: 'admin_panel_settings',
    link: '/admin',
    roles: ['admin', 'super-admin'],
    category: 'admin',
    badge: null,
  },
  {
    title: 'Funcionários',
    caption: 'Gestão de equipe',
    icon: 'groups',
    link: '/employees',
    roles: ['admin', 'super-admin'],
    category: 'admin',
    badge: null,
  },
  {
    title: 'Permissões',
    caption: 'Controle de acesso',
    icon: 'lock',
    link: '/permissions',
    roles: ['super-admin'],
    category: 'admin',
    badge: null,
  },
  {
    title: 'Status de Ativação',
    caption: 'Verificar licença',
    icon: 'verified_user',
    link: '/admin/activation-status',
    roles: ['admin', 'super-admin'],
    category: 'admin',
    badge: null,
  },
]

// Computed navigation sections
const dashboardLinks = computed(() => {
  return allLinks.filter(
    (link) => link.category === 'dashboard' && link.roles.includes(role.value)
  )
})

const managementLinks = computed(() => {
  return allLinks.filter(
    (link) => link.category === 'management' && link.roles.includes(role.value)
  )
})

const adminLinks = computed(() => {
  return allLinks.filter(
    (link) => link.category === 'admin' && link.roles.includes(role.value)
  )
})

// Utility functions
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
      unelevated: true,
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
      position: 'top-right',
      timeout: 3000,
      actions: [{ icon: 'close', color: 'white' }],
    })
  })
}
</script>

<style lang="scss" scoped>
// ==========================================================================
// Modern Layout Styles
// ==========================================================================

.modern-layout {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

// ==========================================================================
// Header Styles
// ==========================================================================

.modern-header {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(59, 130, 246, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 72px;

  .header-toolbar {
    padding: 0 24px;
    height: 100%;
    
    .menu-btn {
      color: white;
      margin-right: 16px;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .header-brand {
    .brand-container {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .brand-logo {
        .logo-img {
          height: 40px;
          width: 40px;
          border-radius: 8px;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
        }
      }
      
      .brand-text {
        .brand-name {
          color: white;
          font-weight: 600;
          line-height: 1.2;
        }
        
        .brand-tagline {
          color: rgba(255, 255, 255, 0.8);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: -2px;
        }
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 16px;
    
    .action-btn {
      color: white;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .user-profile-dropdown {
    .profile-label {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-radius: 12px;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .profile-avatar {
        border: 2px solid rgba(255, 255, 255, 0.2);
      }
      
      .profile-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        
        .profile-name {
          color: white;
          font-weight: 500;
          line-height: 1.2;
        }
        
        .profile-role {
          color: rgba(255, 255, 255, 0.8);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: -2px;
        }
      }
      
      .dropdown-icon {
        color: rgba(255, 255, 255, 0.8);
        transition: transform 0.2s ease;
      }
    }
  }

  .profile-menu {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.05);
    padding: 8px;
    min-width: 250px;
    
    .menu-item {
      border-radius: 8px;
      margin: 2px 0;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(37, 99, 235, 0.05);
      }
      
      &.logout-item:hover {
        background: rgba(239, 68, 68, 0.05);
      }
    }
  }
}

// ==========================================================================
// Sidebar Styles
// ==========================================================================

.modern-sidebar {
  background: white;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.05);

  .sidebar-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      
      .sidebar-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .sidebar-logo {
          .logo-img {
            height: 36px;
            width: 36px;
            border-radius: 8px;
          }
        }
        
        .sidebar-title {
          div:first-child {
            color: #1e293b;
            font-weight: 600;
          }
          
          div:last-child {
            color: #64748b;
            margin-top: -2px;
          }
        }
      }
    }

    .sidebar-menu-area {
      flex: 1;
      padding: 16px 0;
      
      .nav-section {
        margin-bottom: 24px;
        
        .nav-section-title {
          color: #64748b;
          padding: 8px 20px 12px 20px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        
        .nav-item {
          margin: 2px 16px;
          border-radius: 10px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          &:hover {
            transform: translateX(4px);
            
            &::before {
              opacity: 1;
            }
          }

          &.active {
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
            border-left: 3px solid #2563eb;
            
            .nav-icon {
              color: #2563eb;
            }
            
            .nav-label {
              color: #2563eb;
              font-weight: 600;
            }
          }

          .nav-icon {
            color: #64748b;
            transition: color 0.2s ease;
          }

          .nav-label {
            color: #374151;
            font-weight: 500;
            transition: color 0.2s ease;
          }

          .nav-caption {
            color: #9ca3af;
            font-size: 11px;
          }
        }
      }
    }

    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      background: rgba(248, 250, 252, 0.5);
      
      .system-status {
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          margin-bottom: 4px;
        }
        
        .version-info {
          color: #9ca3af;
          text-align: center;
        }
      }
    }
  }
}

// ==========================================================================
// Page Container
// ==========================================================================

.page-container {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  min-height: calc(100vh - 72px);
}

// ==========================================================================
// Responsive Design
// ==========================================================================

@media (max-width: 768px) {
  .modern-header {
    .header-brand {
      .brand-container {
        .brand-text {
          .brand-tagline {
            display: none;
          }
        }
      }
    }
    
    .header-actions {
      gap: 4px;
      margin-right: 8px;
    }
    
    .user-profile-dropdown {
      .profile-label {
        .profile-info {
          display: none;
        }
      }
    }
  }
  
  .modern-sidebar {
    .sidebar-content {
      .sidebar-header {
        padding: 20px 16px;
      }
      
      .sidebar-menu-area {
        .nav-section {
          .nav-item {
            margin: 2px 12px;
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .modern-header {
    .header-toolbar {
      padding: 0 16px;
    }
    
    .header-brand {
      .brand-container {
        gap: 8px;
        
        .brand-logo {
          .logo-img {
            height: 32px;
            width: 32px;
          }
        }
        
        .brand-text {
          .brand-name {
            font-size: 1.1rem;
          }
        }
      }
    }
  }
}
</style>
