<template>
  <q-page class="admin-page page-container">
    <!-- Modern Header Section -->
    <div class="page-header">
      <div class="content-area">
        <div class="header-content">
          <div class="header-main">
            <div class="page-title-section">
              <h1 class="page-title text-display-2">Painel Administrativo</h1>
              <p class="page-subtitle text-body-large">
                Bem-vindo de volta, <strong>{{ username }}</strong>
                <q-icon name="verified" color="positive" size="sm" class="q-ml-xs" />
              </p>
            </div>
            <div class="header-actions">
              <q-btn
                color="white"
                text-color="primary"
                icon="refresh"
                label="Atualizar Dados"
                @click="refreshData"
                :loading="loading"
                class="btn-modern btn-secondary"
                no-caps
                unelevated
              >
                <q-tooltip>Atualizar informações do painel</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-area">
      <!-- Statistics Overview -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Visão Geral do Sistema</h2>
          <p class="section-description">Principais métricas e indicadores de performance</p>
        </div>

        <div class="stats-grid">
          <!-- Total Users Card -->
          <div class="stat-card-wrapper animate-fade-in-up" style="animation-delay: 0.1s;">
            <div class="stat-card stats-card">
              <div class="stat-header">
                <div class="stat-info">
                  <div class="stat-label text-caption">Total de Usuários</div>
                  <div class="stat-value">
                    <template v-if="loading">
                      <q-skeleton type="text" width="80px" height="36px" />
                    </template>
                    <template v-else>
                      <span class="stats-value">{{ stats.totalUsers ?? 0 }}</span>
                    </template>
                  </div>
                  <div class="stat-change">
                    <q-icon name="trending_up" size="16px" />
                    <span>+12% este mês</span>
                  </div>
                </div>
                <div class="stat-icon">
                  <div class="stats-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
                    <q-icon name="people" size="28px" />
                  </div>
                </div>
              </div>
              <div class="stat-progress">
                <q-linear-progress 
                  :value="0.75" 
                  color="blue-6" 
                  track-color="blue-1"
                  size="4px" 
                  rounded 
                />
              </div>
            </div>
          </div>

          <!-- Active Sessions Card -->
          <div class="stat-card-wrapper animate-fade-in-up" style="animation-delay: 0.2s;">
            <div class="stat-card stats-card">
              <div class="stat-header">
                <div class="stat-info">
                  <div class="stat-label text-caption">Sessões Ativas</div>
                  <div class="stat-value">
                    <template v-if="loading">
                      <q-skeleton type="text" width="80px" height="36px" />
                    </template>
                    <template v-else>
                      <span class="stats-value">{{ stats.activeSessions || '--' }}</span>
                    </template>
                  </div>
                  <div class="stat-change positive">
                    <q-icon name="trending_up" size="16px" />
                    <span>+8% hoje</span>
                  </div>
                </div>
                <div class="stat-icon">
                  <div class="stats-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
                    <q-icon name="wifi" size="28px" />
                  </div>
                </div>
              </div>
              <div class="stat-progress">
                <q-linear-progress 
                  :value="0.6" 
                  color="green-6" 
                  track-color="green-1"
                  size="4px" 
                  rounded 
                />
              </div>
            </div>
          </div>

          <!-- System Health Card -->
          <div class="stat-card-wrapper animate-fade-in-up" style="animation-delay: 0.3s;">
            <div class="stat-card stats-card">
              <div class="stat-header">
                <div class="stat-info">
                  <div class="stat-label text-caption">Saúde do Sistema</div>
                  <div class="stat-value">
                    <template v-if="loading">
                      <q-skeleton type="text" width="80px" height="36px" />
                    </template>
                    <template v-else>
                      <div class="health-indicator">
                        <q-icon
                          :name="stats.systemHealth === 'good' ? 'check_circle' : 'warning'"
                          :color="stats.systemHealth === 'good' ? 'positive' : 'negative'"
                          size="24px"
                        />
                        <span class="health-text">
                          {{ stats.systemHealth === 'good' ? 'Excelente' : 'Atenção' }}
                        </span>
                      </div>
                    </template>
                  </div>
                  <div class="stat-change">
                    <q-icon name="check" size="16px" />
                    <span>Todos os serviços</span>
                  </div>
                </div>
                <div class="stat-icon">
                  <div class="stats-icon" style="background: rgba(124, 58, 237, 0.1); color: #7c3aed;">
                    <q-icon name="monitor_heart" size="28px" />
                  </div>
                </div>
              </div>
              <div class="stat-progress">
                <q-linear-progress 
                  :value="0.9" 
                  color="purple-6" 
                  track-color="purple-1"
                  size="4px" 
                  rounded 
                />
              </div>
            </div>
          </div>

          <!-- Storage Usage Card -->
          <div class="stat-card-wrapper animate-fade-in-up" style="animation-delay: 0.4s;">
            <div class="stat-card stats-card">
              <div class="stat-header">
                <div class="stat-info">
                  <div class="stat-label text-caption">Armazenamento</div>
                  <div class="stat-value">
                    <template v-if="loading">
                      <q-skeleton type="text" width="80px" height="36px" />
                    </template>
                    <template v-else>
                      <span class="stats-value">{{ stats.storageUsed || '2.4GB' }}</span>
                    </template>
                  </div>
                  <div class="stat-change">
                    <q-icon name="storage" size="16px" />
                    <span>de 10GB</span>
                  </div>
                </div>
                <div class="stat-icon">
                  <div class="stats-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
                    <q-icon name="storage" size="28px" />
                  </div>
                </div>
              </div>
              <div class="stat-progress">
                <q-linear-progress 
                  :value="0.24" 
                  color="amber-6" 
                  track-color="amber-1"
                  size="4px" 
                  rounded 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Ações Rápidas</h2>
          <p class="section-description">Acesso direto às principais funcionalidades</p>
        </div>

        <div class="quick-actions-grid">
          <div class="action-card animate-fade-in-up" style="animation-delay: 0.1s;">
            <div class="action-icon">
              <q-icon name="add_business" size="32px" />
            </div>
            <div class="action-content">
              <h3 class="action-title text-heading-2">Novo Funcionário</h3>
              <p class="action-description text-body">Adicionar novo membro à equipe</p>
            </div>
            <q-btn
              color="primary"
              icon="arrow_forward"
              round
              unelevated
              class="action-button"
              @click="navigateTo('/employees')"
            />
          </div>

          <div class="action-card animate-fade-in-up" style="animation-delay: 0.2s;">
            <div class="action-icon">
              <q-icon name="inventory_2" size="32px" />
            </div>
            <div class="action-content">
              <h3 class="action-title text-heading-2">Gestão de Stock</h3>
              <p class="action-description text-body">Controlar produtos e inventário</p>
            </div>
            <q-btn
              color="primary"
              icon="arrow_forward"
              round
              unelevated
              class="action-button"
              @click="navigateTo('/products-stock')"
            />
          </div>

          <div class="action-card animate-fade-in-up" style="animation-delay: 0.3s;">
            <div class="action-icon">
              <q-icon name="analytics" size="32px" />
            </div>
            <div class="action-content">
              <h3 class="action-title text-heading-2">Relatórios</h3>
              <p class="action-description text-body">Análises e insights detalhados</p>
            </div>
            <q-btn
              color="primary"
              icon="arrow_forward"
              round
              unelevated
              class="action-button"
              @click="navigateTo('/reports')"
            />
          </div>

          <div class="action-card animate-fade-in-up" style="animation-delay: 0.4s;">
            <div class="action-icon">
              <q-icon name="settings" size="32px" />
            </div>
            <div class="action-content">
              <h3 class="action-title text-heading-2">Configurações</h3>
              <p class="action-description text-body">Personalizar sistema</p>
            </div>
            <q-btn
              color="primary"
              icon="arrow_forward"
              round
              unelevated
              class="action-button"
              @click="navigateTo('/settings')"
            />
          </div>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">Atividade Recente</h2>
          <p class="section-description">Últimas ações realizadas no sistema</p>
        </div>

        <div class="activity-card card-modern">
          <div class="card-header">
            <h3 class="card-title">Atividades dos Últimos 7 Dias</h3>
            <q-btn
              flat
              icon="more_vert"
              round
              class="options-btn"
            >
              <q-menu>
                <q-list>
                  <q-item clickable v-close-popup>
                    <q-item-section>Ver todas</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section>Filtrar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <div class="card-content">
            <div class="activity-list">
              <div class="activity-item" v-for="(activity, index) in recentActivities" :key="index">
                <div class="activity-icon">
                  <q-icon :name="activity.icon" :color="activity.color" size="20px" />
                </div>
                <div class="activity-content">
                  <div class="activity-title text-body">{{ activity.title }}</div>
                  <div class="activity-time text-body-small">{{ activity.time }}</div>
                </div>
                <div class="activity-badge">
                  <q-badge :color="activity.badgeColor" rounded>{{ activity.badge }}</q-badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()

// Data
const username = ref(localStorage.getItem('username') || 'Administrador')
const loading = ref(false)
const stats = ref({
  totalUsers: 0,
  activeSessions: 0,
  systemHealth: 'good',
  storageUsed: '2.4GB'
})

const recentActivities = ref([
  {
    title: 'Novo usuário registrado: João Silva',
    time: 'Há 2 minutos',
    icon: 'person_add',
    color: 'positive',
    badge: 'Novo',
    badgeColor: 'positive'
  },
  {
    title: 'Produto adicionado ao estoque',
    time: 'Há 15 minutos',
    icon: 'inventory_2',
    color: 'primary',
    badge: 'Stock',
    badgeColor: 'primary'
  },
  {
    title: 'Backup do sistema concluído',
    time: 'Há 1 hora',
    icon: 'backup',
    color: 'info',
    badge: 'Sistema',
    badgeColor: 'info'
  },
  {
    title: 'Relatório mensal gerado',
    time: 'Há 3 horas',
    icon: 'analytics',
    color: 'purple',
    badge: 'Relatório',
    badgeColor: 'purple'
  }
])

// Methods
function refreshData() {
  loading.value = true
  
  // Simulate API call
  setTimeout(() => {
    stats.value = {
      totalUsers: Math.floor(Math.random() * 100) + 50,
      activeSessions: Math.floor(Math.random() * 20) + 5,
      systemHealth: Math.random() > 0.2 ? 'good' : 'warning',
      storageUsed: `${(Math.random() * 5 + 1).toFixed(1)}GB`
    }
    
    loading.value = false
    
    $q.notify({
      type: 'positive',
      message: 'Dados atualizados com sucesso',
      position: 'top-right',
      timeout: 2000,
      actions: [{ icon: 'close', color: 'white' }]
    })
  }, 1500)
}

function navigateTo(path) {
  router.push(path)
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style lang="scss" scoped>
// ==========================================================================
// Admin Page Styles
// ==========================================================================

.admin-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

// ==========================================================================
// Page Header
// ==========================================================================

.page-header {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: white;
  padding: 60px 0;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 40%);
  }

  .header-content {
    position: relative;
    z-index: 1;
  }

  .header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
  }

  .page-title-section {
    .page-title {
      color: white;
      margin-bottom: 8px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      display: flex;
      align-items: center;
    }
  }

  .header-actions {
    .btn-modern {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      
      &:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px);
      }
    }
  }

  @media (max-width: 768px) {
    padding: 40px 0;
    
    .header-main {
      flex-direction: column;
      text-align: center;
    }
    
    .page-title {
      font-size: 1.75rem;
    }
  }
}

// ==========================================================================
// Dashboard Sections
// ==========================================================================

.dashboard-section {
  margin-bottom: 60px;

  .section-header {
    margin-bottom: 32px;
    
    .section-title {
      color: #1e293b;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .section-description {
      color: #64748b;
      margin: 0;
    }
  }
}

// ==========================================================================
// Statistics Grid
// ==========================================================================

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card-wrapper {
  opacity: 0;
  animation-fill-mode: forwards;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .stat-info {
    flex: 1;
  }

  .stat-label {
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }

  .stat-value {
    .stats-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
    }

    .health-indicator {
      display: flex;
      align-items: center;
      gap: 8px;

      .health-text {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1e293b;
      }
    }
  }

  .stat-change {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;

    &.positive {
      color: #10b981;
    }

    .q-icon {
      color: inherit;
    }
  }

  .stat-icon {
    .stats-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }
  }

  .stat-progress {
    margin-top: 16px;
  }
}

// ==========================================================================
// Quick Actions Grid
// ==========================================================================

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 20px;
  opacity: 0;
  animation-fill-mode: forwards;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    
    .action-button {
      transform: translateX(4px);
    }
  }

  .action-icon {
    width: 56px;
    height: 56px;
    background: rgba(37, 99, 235, 0.1);
    color: #2563eb;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .action-content {
    flex: 1;

    .action-title {
      color: #1e293b;
      margin-bottom: 4px;
      font-weight: 600;
    }

    .action-description {
      color: #64748b;
      margin: 0;
    }
  }

  .action-button {
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }
}

// ==========================================================================
// Activity Card
// ==========================================================================

.activity-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      color: #1e293b;
      font-weight: 600;
    }

    .options-btn {
      color: #64748b;
    }
  }

  .activity-list {
    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #f1f5f9;

      &:last-child {
        border-bottom: none;
      }

      .activity-icon {
        width: 40px;
        height: 40px;
        background: #f8fafc;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .activity-content {
        flex: 1;

        .activity-title {
          color: #1e293b;
          margin-bottom: 2px;
          font-weight: 500;
        }

        .activity-time {
          color: #64748b;
          margin: 0;
        }
      }

      .activity-badge {
        flex-shrink: 0;
      }
    }
  }
}

// ==========================================================================
// Responsive Design
// ==========================================================================

@media (max-width: 768px) {
  .content-area {
    padding: 24px 16px;
  }

  .stats-grid,
  .quick-actions-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-card {
    padding: 20px;
  }

  .action-card {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 16px;

    .action-content {
      text-align: center;
    }
  }

  .dashboard-section {
    margin-bottom: 40px;
  }
}

@media (max-width: 480px) {
  .stat-card {
    .stat-header {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }

    .stat-icon {
      align-self: center;
    }
  }
}
</style>
