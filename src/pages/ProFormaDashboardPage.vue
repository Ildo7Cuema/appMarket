<template>
  <q-page class="dashboard-page">
    <!-- Header -->
    <div class="header-section q-pa-lg">
      <div class="row items-center justify-between">
        <div class="col">
          <h4 class="text-white text-weight-bold q-mb-xs">Dashboard - Faturas Pró-Forma</h4>
          <p class="text-white-7">Estatísticas e análises das faturas pró-forma</p>
        </div>
        <div class="col-auto">
          <q-btn
            color="white"
            text-color="primary"
            icon="refresh"
            label="Atualizar"
            @click="loadStatistics"
          />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="content-container q-px-lg q-mt-xl">
      <!-- Cards de Estatísticas -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <div class="col-12 col-md-3">
          <q-card class="stat-card total-invoices">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h4 text-weight-bold">{{ statistics.total_invoices || 0 }}</div>
                  <div class="text-subtitle2 text-grey-6">Total de Faturas</div>
                </div>
                <div class="col-auto">
                  <q-icon name="receipt_long" size="48px" color="primary" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card class="stat-card total-amount">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h4 text-weight-bold">
                    {{ formatCurrency(statistics.total_amount || 0) }}
                  </div>
                  <div class="text-subtitle2 text-grey-6">Valor Total</div>
                </div>
                <div class="col-auto">
                  <q-icon name="attach_money" size="48px" color="positive" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card class="stat-card avg-amount">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h4 text-weight-bold">
                    {{ formatCurrency(statistics.avg_amount || 0) }}
                  </div>
                  <div class="text-subtitle2 text-grey-6">Valor Médio</div>
                </div>
                <div class="col-auto">
                  <q-icon name="trending_up" size="48px" color="warning" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card class="stat-card approved-invoices">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h4 text-weight-bold">{{ statistics.approved_count || 0 }}</div>
                  <div class="text-subtitle2 text-grey-6">Aprovadas</div>
                </div>
                <div class="col-auto">
                  <q-icon name="check_circle" size="48px" color="positive" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Gráficos e Análises -->
      <div class="row q-col-gutter-lg">
        <!-- Gráfico de Status -->
        <div class="col-12 col-md-6">
          <q-card class="chart-card">
            <q-card-section>
              <div class="text-h6 text-weight-bold q-mb-md">Status das Faturas</div>
              <div class="status-chart">
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-md-6">
                    <div class="status-item draft">
                      <div
                        class="status-bar"
                        :style="{ width: getStatusPercentage('draft') + '%' }"
                      ></div>
                      <div class="status-info">
                        <span class="status-label">Rascunho</span>
                        <span class="status-count">{{ statistics.draft_count || 0 }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="status-item sent">
                      <div
                        class="status-bar"
                        :style="{ width: getStatusPercentage('sent') + '%' }"
                      ></div>
                      <div class="status-info">
                        <span class="status-label">Enviadas</span>
                        <span class="status-count">{{ statistics.sent_count || 0 }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="status-item approved">
                      <div
                        class="status-bar"
                        :style="{ width: getStatusPercentage('approved') + '%' }"
                      ></div>
                      <div class="status-info">
                        <span class="status-label">Aprovadas</span>
                        <span class="status-count">{{ statistics.approved_count || 0 }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="status-item rejected">
                      <div
                        class="status-bar"
                        :style="{ width: getStatusPercentage('rejected') + '%' }"
                      ></div>
                      <div class="status-info">
                        <span class="status-label">Rejeitadas</span>
                        <span class="status-count">{{ statistics.rejected_count || 0 }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="status-item expired">
                      <div
                        class="status-bar"
                        :style="{ width: getStatusPercentage('expired') + '%' }"
                      ></div>
                      <div class="status-info">
                        <span class="status-label">Expiradas</span>
                        <span class="status-count">{{ statistics.expired_count || 0 }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Faturas Recentes -->
        <div class="col-12 col-md-6">
          <q-card class="recent-invoices-card">
            <q-card-section>
              <div class="text-h6 text-weight-bold q-mb-md">Faturas Recentes</div>
              <div class="recent-invoices-list">
                <div
                  v-for="invoice in recentInvoices"
                  :key="invoice.id"
                  class="recent-invoice-item"
                >
                  <div class="invoice-info">
                    <div class="invoice-number">{{ invoice.invoice_number }}</div>
                    <div class="invoice-client">{{ invoice.client_name }}</div>
                    <div class="invoice-date">{{ formatDate(invoice.created_at) }}</div>
                  </div>
                  <div class="invoice-amount">
                    <div class="amount">{{ formatCurrency(invoice.total_amount) }}</div>
                    <q-chip
                      :color="getStatusColor(invoice.status)"
                      text-color="white"
                      :label="getStatusLabel(invoice.status)"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Gráfico de Evolução Mensal -->
      <div class="row q-col-gutter-lg q-mt-lg">
        <div class="col-12">
          <q-card class="evolution-chart-card">
            <q-card-section>
              <div class="text-h6 text-weight-bold q-mb-md">Evolução Mensal</div>
              <div class="evolution-chart">
                <div class="chart-container">
                  <div
                    v-for="(month, index) in monthlyData"
                    :key="index"
                    class="month-bar"
                    :style="{ height: getBarHeight(month.total) + '%' }"
                  >
                    <div class="bar-tooltip">
                      {{ formatCurrency(month.total) }}
                    </div>
                  </div>
                </div>
                <div class="chart-labels">
                  <div v-for="(month, index) in monthlyData" :key="index" class="month-label">
                    {{ month.month }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Ações Rápidas -->
      <div class="row q-col-gutter-lg q-mt-lg">
        <div class="col-12">
          <q-card class="quick-actions-card">
            <q-card-section>
              <div class="text-h6 text-weight-bold q-mb-md">Ações Rápidas</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <q-btn
                    color="primary"
                    icon="add"
                    label="Nova Fatura"
                    class="full-width"
                    @click="$router.push('/proforma-invoices')"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-btn
                    color="secondary"
                    icon="assessment"
                    label="Ver Relatórios"
                    class="full-width"
                    @click="exportReport"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-btn
                    color="info"
                    icon="email"
                    label="Enviar Lembretes"
                    class="full-width"
                    @click="sendReminders"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-btn
                    color="warning"
                    icon="schedule"
                    label="Faturas Vencendo"
                    class="full-width"
                    @click="showExpiringInvoices"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import proformaService from '../services/proforma.service'

export default defineComponent({
  name: 'ProFormaDashboardPage',
  setup() {
    const $q = useQuasar()

    // Estado
    const loading = ref(false)
    const statistics = ref({})
    const recentInvoices = ref([])
    const monthlyData = ref([])

    // Computed
    const totalInvoices = computed(() => statistics.value.total_invoices || 0)

    // Métodos
    const loadStatistics = async () => {
      try {
        loading.value = true
        const response = await proformaService.getStatistics()
        statistics.value = response
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao carregar estatísticas',
        })
      } finally {
        loading.value = false
      }
    }

    const loadRecentInvoices = async () => {
      try {
        const response = await proformaService.getInvoices({ limit: 5 })
        recentInvoices.value = response.invoices || []
      } catch (error) {
        console.error('Erro ao carregar faturas recentes:', error)
      }
    }

    const loadMonthlyData = async () => {
      try {
        // Simular dados mensais (em produção, viria da API)
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
        monthlyData.value = months.map((month) => ({
          month,
          total: Math.random() * 1000000 + 500000,
        }))
      } catch (error) {
        console.error('Erro ao carregar dados mensais:', error)
      }
    }

    const getStatusPercentage = (status) => {
      const total = totalInvoices.value
      if (total === 0) return 0

      const count = statistics.value[`${status}_count`] || 0
      return (count / total) * 100
    }

    const getStatusColor = (status) => {
      const colors = {
        draft: 'grey',
        sent: 'blue',
        approved: 'positive',
        rejected: 'negative',
        expired: 'orange',
      }
      return colors[status] || 'grey'
    }

    const getStatusLabel = (status) => {
      const labels = {
        draft: 'Rascunho',
        sent: 'Enviada',
        approved: 'Aprovada',
        rejected: 'Rejeitada',
        expired: 'Expirada',
      }
      return labels[status] || status
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
      }).format(value || 0)
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Intl.DateTimeFormat('pt-AO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(date))
    }

    const getBarHeight = (value) => {
      const maxValue = Math.max(...monthlyData.value.map((item) => item.total))
      return maxValue > 0 ? (value / maxValue) * 100 : 0
    }

    const exportReport = async () => {
      try {
        await proformaService.exportReport()
        $q.notify({
          type: 'positive',
          message: 'Relatório exportado com sucesso!',
        })
      } catch (error) {
        console.error('Erro ao exportar relatório:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao exportar relatório',
        })
      }
    }

    const sendReminders = () => {
      $q.notify({
        type: 'info',
        message: 'Funcionalidade de lembretes em desenvolvimento',
      })
    }

    const showExpiringInvoices = () => {
      $q.notify({
        type: 'info',
        message: 'Funcionalidade de faturas vencendo em desenvolvimento',
      })
    }

    // Lifecycle
    onMounted(() => {
      loadStatistics()
      loadRecentInvoices()
      loadMonthlyData()
    })

    return {
      // Estado
      loading,
      statistics,
      recentInvoices,
      monthlyData,

      // Computed
      totalInvoices,

      // Métodos
      loadStatistics,
      loadRecentInvoices,
      loadMonthlyData,
      getStatusPercentage,
      getStatusColor,
      getStatusLabel,
      formatCurrency,
      formatDate,
      getBarHeight,
      exportReport,
      sendReminders,
      showExpiringInvoices,
    }
  },
})
</script>

<style lang="scss" scoped>
.dashboard-page {
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

.stat-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  }

  &.total-invoices {
    border-left: 4px solid #1976d2;
  }

  &.total-amount {
    border-left: 4px solid #4caf50;
  }

  &.avg-amount {
    border-left: 4px solid #ff9800;
  }

  &.approved-invoices {
    border-left: 4px solid #4caf50;
  }
}

.chart-card,
.recent-invoices-card,
.evolution-chart-card,
.quick-actions-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.status-chart {
  .status-item {
    position: relative;
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    overflow: hidden;

    .status-bar {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      opacity: 0.1;
      transition: all 0.3s ease;
    }

    .status-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    &.draft .status-bar {
      background: #9e9e9e;
    }

    &.sent .status-bar {
      background: #2196f3;
    }

    &.approved .status-bar {
      background: #4caf50;
    }

    &.rejected .status-bar {
      background: #f44336;
    }

    &.expired .status-bar {
      background: #ff9800;
    }
  }
}

.recent-invoices-list {
  .recent-invoice-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #e0e0e0;

    &:last-child {
      border-bottom: none;
    }

    .invoice-info {
      .invoice-number {
        font-weight: bold;
        color: #1976d2;
      }

      .invoice-client {
        color: #666;
        font-size: 0.9rem;
      }

      .invoice-date {
        color: #999;
        font-size: 0.8rem;
      }
    }

    .invoice-amount {
      text-align: right;

      .amount {
        font-weight: bold;
        color: #4caf50;
        margin-bottom: 4px;
      }
    }
  }
}

.evolution-chart {
  .chart-container {
    display: flex;
    align-items: end;
    justify-content: space-around;
    height: 200px;
    margin-bottom: 20px;

    .month-bar {
      width: 40px;
      background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
      border-radius: 4px 4px 0 0;
      position: relative;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }

      .bar-tooltip {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover .bar-tooltip {
        opacity: 1;
      }
    }
  }

  .chart-labels {
    display: flex;
    justify-content: space-around;

    .month-label {
      width: 40px;
      text-align: center;
      font-size: 0.9rem;
      color: #666;
    }
  }
}
</style>
