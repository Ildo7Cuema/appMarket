<template>
  <q-page class="q-pa-lg">
    <!-- Page Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-weight-bold">Painel Administrativo</div>
        <div class="text-subtitle1 text-grey-8">Bem-vindo de volta, Administrador</div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="refresh"
          label="Atualizar Dados"
          @click="refreshData"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card class="text-center">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-icon name="people" class="q-mr-sm" color="blue-6" />
              <div class="text-h6 text-grey-8">
                Total de Usuários
                <q-tooltip>Número total de usuários registrados no sistema</q-tooltip>
              </div>
            </div>
            <div class="text-h4 text-weight-bold text-blue-800">
              <template v-if="loading">
                <q-skeleton type="text" width="80px" />
              </template>
              <template v-else>
                {{ stats.totalUsers ?? 0 }}
              </template>
            </div>
            <q-icon name="people_outline" class="stat-icon" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="text-center">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-icon name="wifi" class="q-mr-sm" color="green-6" />
              <div class="text-h6 text-grey-8">
                Sessões Ativas
                <q-tooltip>Usuários ativos nos últimos 30 minutos</q-tooltip>
              </div>
            </div>
            <div class="text-h4 text-weight-bold text-green-800">
              <template v-if="loading">
                <q-skeleton type="text" width="80px" />
              </template>
              <template v-else>
                {{ stats.activeSessions || '--' }}
              </template>
            </div>
            <q-icon name="wifi_find" class="stat-icon" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="text-center">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-icon name="monitor_heart" class="q-mr-sm" color="purple-6" />
              <div class="text-h6 text-grey-8">
                Saúde do Sistema
                <q-tooltip>Status geral do sistema</q-tooltip>
              </div>
            </div>
            <div class="text-h4 text-weight-bold text-purple-800">
              <template v-if="loading">
                <q-skeleton type="text" width="80px" />
              </template>
              <template v-else>
                <q-icon
                  :name="stats.systemHealth === 'good' ? 'check_circle' : 'warning'"
                  :color="stats.systemHealth === 'good' ? 'positive' : 'negative'"
                  size="2rem"
                />
              </template>
            </div>
            <q-icon name="monitor_heart" class="stat-icon" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="text-center">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-icon name="storage" class="q-mr-sm" color="orange-6" />
              <div class="text-h6 text-grey-8">
                Armaz. Usado
                <q-tooltip>Espaço total utilizado no servidor</q-tooltip>
              </div>
            </div>
            <div class="text-h4 text-weight-bold text-orange-800">
              <template v-if="loading">
                <q-skeleton type="text" width="80px" />
              </template>
              <template v-else>
                {{ stats.storageUsed || '--' }}
              </template>
            </div>
            <q-icon name="storage" class="stat-icon" />
          </q-card-section>
        </q-card>
      </div>

      <!-- New Stats Cards -->
      <div class="col-12 col-md-3">
        <q-card class="text-center">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-icon name="today" class="q-mr-sm" color="teal-6" />
              <div class="text-h6 text-grey-8">
                Vendas Hoje
                <q-tooltip>Total de vendas realizadas hoje</q-tooltip>
              </div>
            </div>
            <div class="text-h4 text-weight-bold text-teal-800">
              <template v-if="loading">
                <q-skeleton type="text" width="80px" />
              </template>
              <template v-else>
                {{ stats.totalSalesDay }}
              </template>
            </div>
            <q-icon name="today" class="stat-icon" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="text-center">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-icon name="calendar_month" class="q-mr-sm" color="indigo-6" />
              <div class="text-h6 text-grey-8">
                Vendas Mês
                <q-tooltip>Total de vendas no mês atual</q-tooltip>
              </div>
            </div>
            <div class="text-h4 text-weight-bold text-indigo-800">
              <template v-if="loading">
                <q-skeleton type="text" width="80px" />
              </template>
              <template v-else>
                {{ stats.totalSalesMonth }}
              </template>
            </div>
            <q-icon name="calendar_month" class="stat-icon" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="text-center">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-icon name="insights" class="q-mr-sm" color="deep-orange-6" />
              <div class="text-h6 text-grey-8">
                Vendas Ano
                <q-tooltip>Total de vendas no ano atual</q-tooltip>
              </div>
            </div>
            <div class="text-h4 text-weight-bold text-deep-orange-800">
              <template v-if="loading">
                <q-skeleton type="text" width="80px" />
              </template>
              <template v-else>
                {{ stats.totalSalesYear || '--' }}
              </template>
            </div>
            <q-icon name="insights" class="stat-icon" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="text-center">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-icon name="inventory_2" class="q-mr-sm" color="cyan-6" />
              <div class="text-h6 text-grey-8">
                Total Produtos
                <q-tooltip>Número total de produtos cadastrados</q-tooltip>
              </div>
            </div>
            <div class="text-h4 text-weight-bold text-cyan-800">
              <template v-if="loading">
                <q-skeleton type="text" width="80px" />
              </template>
              <template v-else>
                {{ stats.totalProducts ?? 0 }}
              </template>
            </div>
            <q-icon name="inventory_2" class="stat-icon" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Best Selling Products -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h5">Produtos Mais Vendidos</div>
          <q-space />
          <q-btn-toggle
            v-model="salesPeriod"
            toggle-color="primary"
            :options="[
              { label: '7 Dias', value: 7 },
              { label: '30 Dias', value: 30 },
              { label: '90 Dias', value: 90 },
              { label: '1 Ano', value: 365 },
            ]"
            @update:model-value="fetchTopProducts"
          />
        </div>

        <q-tabs v-model="activeTab" align="left" class="text-primary q-mb-md">
          <q-tab name="table" label="Tabela" />
          <q-tab name="chart" label="Gráfico" />
        </q-tabs>

        <q-tab-panels v-model="activeTab" animated>
          <!-- Table View -->
          <q-tab-panel name="table">
            <q-table
              :rows="topProducts"
              :columns="topProductsColumns"
              row-key="id"
              :loading="loading"
              loading-label="A carregar..."
              :pagination="{
                rowsPerPage: 10,
                sortBy: 'total_sold',
                descending: true,
              }"
              :filter="topProductsFilter"
              @request="onTableRequest"
            >
              <template v-slot:top-right>
                <q-input
                  v-model="topProductsFilter"
                  outlined
                  dense
                  placeholder="Pesquisar produto..."
                  class="q-mr-sm"
                />
                <q-btn
                  color="primary"
                  icon="refresh"
                  @click="fetchTopProducts"
                  :loading="loading"
                />
                <q-btn color="secondary" icon="download" @click="exportData" class="q-ml-sm">
                  <q-tooltip>Exportar dados</q-tooltip>
                </q-btn>
              </template>

              <!-- Custom Total Sold Cell -->
              <template v-slot:body-cell-total_sold="props">
                <q-td :props="props">
                  <div class="row items-center no-wrap">
                    <q-linear-progress
                      :value="props.row.total_sold / maxSold"
                      color="primary"
                      class="q-mr-sm"
                      style="height: 10px; width: 100px"
                    />
                    <span>{{ props.value }}</span>
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Chart View -->
          <q-tab-panel name="chart">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-card>
                  <q-card-section>
                    <div class="text-h6">Top 10 Produtos</div>
                    <apexchart
                      type="bar"
                      height="350"
                      :options="chartOptions"
                      :series="chartSeries"
                    />
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-md-6">
                <q-card>
                  <q-card-section>
                    <div class="text-h6">Distribuição por Categoria</div>
                    <apexchart
                      type="pie"
                      height="350"
                      :options="pieChartOptions"
                      :series="pieSeries"
                    />
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>

    <!-- Management Section
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-h5 q-mb-md">Gestão do Sistema</div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-list bordered separator>
              <q-item clickable v-ripple @click="navigateTo('employees')">
                <q-item-section avatar>
                  <q-icon name="people" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Gestão de Usuários</q-item-label>
                  <q-item-label caption>Gerencie usuários e permissões do sistema</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="navigateTo('settings')">
                <q-item-section avatar>
                  <q-icon name="settings" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Configurações do Sistema</q-item-label>
                  <q-item-label caption>Configure as preferências do sistema</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="navigateTo('logs')">
                <q-item-section avatar>
                  <q-icon name="list_alt" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Logs do Sistema</q-item-label>
                  <q-item-label caption>Visualize atividades e eventos do sistema</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="col-12 col-md-6">
            <q-card>
              <q-card-section>
                <div class="text-h6 q-mb-md">Actividades recentes</div>
                <q-list>
                  <q-item v-for="activity in recentActivities" :key="activity.id">
                    <q-item-section avatar>
                      <q-icon :name="activity.icon" :color="activity.color" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ activity.title }}</q-item-label>
                      <q-item-label caption>{{ activity.timestamp }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>-->
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import apiService from '../services/api.service'
import VueApexCharts from 'vue3-apexcharts'
import { formatCurrency } from 'src/services/currency.service'

// Registrar o componente globalmente
const apexchart = VueApexCharts

const router = useRouter()
const $q = useQuasar()

const loading = ref(false)
const stats = ref({
  totalUsers: null,
  activeSessions: null,
  systemHealth: null,
  storageUsed: null,
  totalSalesDay: null,
  totalSalesMonth: null,
  totalSalesYear: null,
  totalProducts: null,
  bestSellingProducts: [],
})

// Estado da tabela e gráficos
const topProducts = ref([])
const topProductsFilter = ref('')
const salesPeriod = ref(30) // Período padrão de 30 dias
const activeTab = ref('table')
const maxSold = ref(0)

// Colunas da tabela
const topProductsColumns = [
  { name: 'name', label: 'Produto', field: 'name', align: 'left', sortable: true },
  { name: 'code', label: 'Código', field: 'code', align: 'left', sortable: true },
  { name: 'category', label: 'Categoria', field: 'category_name', align: 'left', sortable: true },
  {
    name: 'price',
    label: 'Preço',
    field: 'price',
    align: 'right',
    sortable: true,
    format: (val) => formatCurrency(val),
  },
  {
    name: 'total_sold',
    label: 'Quantidade Vendida',
    field: 'total_sold',
    align: 'right',
    sortable: true,
  },
  {
    name: 'total_revenue',
    label: 'Receita Total',
    field: 'total_revenue',
    align: 'right',
    sortable: true,
    format: (val) => formatCurrency(val),
  },
]

// Opções do gráfico
const chartOptions = ref({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '45%',
      endingShape: 'rounded',
    },
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: { categories: [] },
  yaxis: { title: { text: 'Quantidade Vendida' } },
  fill: { opacity: 1 },
  tooltip: {
    y: {
      formatter: function (val) {
        return val + ' unidades'
      },
    },
  },
})

const pieChartOptions = ref({
  chart: {
    type: 'pie',
    height: 350,
  },
  labels: [],
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: 'bottom' },
      },
    },
  ],
})

// Séries de dados para gráficos
const chartSeries = ref([{ name: 'Vendas', data: [] }])
const pieSeries = ref([])

// Calcula o máximo de vendas para normalizar as barras de progresso
function calculateMaxSold(products) {
  try {
    if (!Array.isArray(products)) {
      return 1
    }
    const values = products.map((p) => p.total_sold || 0)
    return Math.max(...values, 1)
  } catch (error) {
    console.error('Erro ao calcular máximo de vendas:', error)
    return 1
  }
}

// Atualiza os gráficos com novos dados
function updateCharts(products) {
  chartOptions.value.xaxis.categories = products.map((p) => p.name)
  chartSeries.value[0].data = products.map((p) => p.total_sold)

  // Agrupa por categoria para o gráfico de pizza
  const categories = {}
  products.forEach((p) => {
    categories[p.category_name] = (categories[p.category_name] || 0) + p.total_sold
  })

  pieChartOptions.value.labels = Object.keys(categories)
  pieSeries.value = Object.values(categories)
}

// Exporta dados para Excel
function exportData() {
  try {
    // Importar a biblioteca xlsx
    import('xlsx').then((XLSX) => {
      // Criar cabeçalhos
      const headers = topProductsColumns.map((col) => col.label)

      // Criar dados
      const data = topProducts.value.map((product) =>
        topProductsColumns.map((col) => product[col.field]),
      )

      // Criar planilha
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos')

      // Gerar arquivo XLSX
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

      // Criar blob e fazer download
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'produtos_mais_vendidos.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      $q.notify({
        type: 'positive',
        message: 'Exportação concluída com sucesso!',
      })
    })
  } catch (error) {
    console.error('Erro ao exportar dados:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao exportar dados para Excel',
    })
  }
}

/*
const recentActivities = ref([
  {
    id: 1,
    icon: 'person_add',
    color: 'positive',
    title: 'Novo usuário registrado',
    timestamp: '2 horas atrás',
  },
  {
    id: 2,
    icon: 'warning',
    color: 'negative',
    title: 'Tentativa de login falhou',
    timestamp: '4 horas atrás',
  },
])
*/
async function fetchTopProducts() {
  try {
    loading.value = true
    const response = await apiService.getTopProducts()
    // Garantir que sempre temos um array válido
    console.log('top Produtos: ', response)
    topProducts.value = response //Array.isArray(response) ? response.data : []

    console.log('Valor do topProdutos: ', topProducts.value)
    if (topProducts.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'Nenhum produto vendido encontrado',
      })
    } else {
      // Atualizar gráficos e calcular máximo de vendas
      updateCharts(topProducts.value)
      maxSold.value = calculateMaxSold(topProducts.value)
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao carregar produtos mais vendidos',
    })
    topProducts.value = [] // Resetar para array vazio em caso de erro
  } finally {
    loading.value = false
  }
}

function onTableRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const filter = props.filter

  // Lógica de paginação e ordenação
  let returnedData = [...topProducts.value]

  if (filter) {
    returnedData = returnedData.filter((product) =>
      product.name.toLowerCase().includes(filter.toLowerCase()),
    )
  }

  if (sortBy) {
    returnedData.sort((a, b) => (descending ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]))
  }

  const rowsNumber = returnedData.length
  returnedData = returnedData.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return { rows: returnedData, rowsNumber }
}

onMounted(() => {
  const role = localStorage.getItem('role')
  if (role !== 'admin') {
    router.push('/')
  }
  fetchStats()
  fetchTopProducts()
})

async function fetchStats() {
  loading.value = true
  try {
    // Fetch all stats in parallel with error handling
    const [
      totalUsers,
      activeSessions,
      storageUsage,
      dailySales,
      monthlySales,
      yearlySales,
      totalProducts,
    ] = await Promise.all([
      apiService.getTotalUsers(),
      apiService.getActiveSessions(),
      apiService.getStorageUsage(),
      apiService.getDailySales(),
      apiService.getMonthlySales(),
      apiService.getYearlySales(),
      apiService.getTotalProducts(),
    ])

    // Format storage usage
    const formatStorage = (bytes) => {
      const units = ['B', 'KB', 'MB', 'GB']
      let size = bytes
      let unitIndex = 0
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      return `${size.toFixed(1)}${units[unitIndex]}`
    }

    // Use imported formatCurrency function from currency.service

    stats.value = {
      totalUsers: new Intl.NumberFormat('pt-AO').format(totalUsers || 0),
      activeSessions: new Intl.NumberFormat('pt-AO').format(activeSessions || 0),
      systemHealth: 'good',
      storageUsed: formatStorage(storageUsage?.total || 0),
      totalSalesDay: formatCurrency(dailySales?.total_sales || 0),
      totalSalesMonth: formatCurrency(
        Array.isArray(monthlySales)
          ? monthlySales.reduce((sum, month) => sum + (month?.total || 0), 0)
          : 0,
      ),
      totalSalesYear: formatCurrency(
        Array.isArray(yearlySales)
          ? yearlySales.reduce((sum, year) => sum + (year?.total || 0), 0)
          : 0,
      ),
      totalProducts: new Intl.NumberFormat('pt-AO').format(totalProducts || 0),
      bestSellingProducts: [],
    }
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    $q.notify({
      type: 'negative',
      message: 'Falha ao carregar dados do painel',
    })
  } finally {
    loading.value = false
  }
}

function refreshData() {
  fetchStats()
}

/*
function navigateTo(route) {
  if (route === 'employees') {
    router.push('/employees')
    return
  }
  router.push(`/admin/${route}`)
}*/
</script>

<style scoped>
.q-card {
  transition: all 0.3s ease;
  min-height: 140px;
  display: flex;
  align-items: center;
  border-radius: 12px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
}

.q-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.q-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
}

.q-card-section {
  width: 100%;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.stat-icon {
  position: absolute;
  right: 20px;
  bottom: 20px;
  opacity: 0.1;
  font-size: 4rem;
  color: #3b82f6;
  transition: opacity 0.3s ease;
}

.q-card:hover .stat-icon {
  opacity: 0.2;
}

.text-h4 {
  font-size: 1.5rem;
  line-height: 1.2;
  margin: 8px 0;
}

.text-h6 {
  font-size: 1.1rem;
  margin-bottom: 8px;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .text-h4 {
    font-size: 1.3rem;
  }

  .text-h6 {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .text-h4 {
    font-size: 1.1rem;
  }

  .q-card-section {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .text-h4 {
    font-size: 1rem;
  }

  .text-h6 {
    font-size: 0.8rem;
  }

  .q-card-section {
    padding: 8px;
  }
}

/* Truncate long numbers */
.value-container {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
