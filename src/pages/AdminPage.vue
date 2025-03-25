<template>
  <q-page class="admin-page">
    <!-- Header com gradiente -->
    <div class="header-section q-px-lg q-pt-lg q-pb-xl">
      <div class="row items-center justify-between">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bold text-white">Painel Administrativo</div>
          <div class="text-subtitle1 text-grey-3 q-mt-sm">
            Bem-vindo de volta, {{ username }}
            <q-icon name="verified" color="light-blue-4" size="sm" class="q-ml-xs" />
          </div>
        </div>
        <div class="col-12 col-md-4 text-right">
          <q-btn
            color="white"
            text-color="primary"
            icon="refresh"
            label="Atualizar Dados"
            @click="refreshData"
            :loading="loading"
            class="q-px-md"
            flat
          >
            <q-tooltip>Atualizar informações do painel</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Cards Container com efeito de elevação -->
    <div class="cards-container q-px-lg q-mt-xl">
      <!-- Stats Cards -->
      <div class="row q-col-gutter-lg">
        <!-- Total de Usuários -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-grey-8 text-subtitle1 q-mb-xs">Total de Usuários</div>
                  <div class="text-h4 text-weight-bold text-primary">
                    <template v-if="loading">
                      <q-skeleton type="text" width="80px" />
                    </template>
                    <template v-else>
                      {{ stats.totalUsers ?? 0 }}
                    </template>
                  </div>
                </div>
                <div class="col-auto">
                  <q-avatar size="56px" class="bg-blue-1 text-primary">
                    <q-icon name="people" size="32px" />
                  </q-avatar>
                </div>
              </div>
              <q-linear-progress :value="0.75" color="blue-4" class="q-mt-sm" size="2px" rounded />
            </q-card-section>
          </q-card>
        </div>

        <!-- Sessões Ativas -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-grey-8 text-subtitle1 q-mb-xs">Sessões Ativas</div>
                  <div class="text-h4 text-weight-bold text-green">
                    <template v-if="loading">
                      <q-skeleton type="text" width="80px" />
                    </template>
                    <template v-else>
                      {{ stats.activeSessions || '--' }}
                    </template>
                  </div>
                </div>
                <div class="col-auto">
                  <q-avatar size="56px" class="bg-green-1 text-green">
                    <q-icon name="wifi" size="32px" />
                  </q-avatar>
                </div>
              </div>
              <q-linear-progress :value="0.6" color="green-4" class="q-mt-sm" size="2px" rounded />
            </q-card-section>
          </q-card>
        </div>

        <!-- Saúde do Sistema -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-grey-8 text-subtitle1 q-mb-xs">Saúde do Sistema</div>
                  <div class="text-h4 text-weight-bold text-purple">
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
                </div>
                <div class="col-auto">
                  <q-avatar size="56px" class="bg-purple-1 text-purple">
                    <q-icon name="monitor_heart" size="32px" />
                  </q-avatar>
                </div>
              </div>
              <q-linear-progress :value="0.9" color="purple-4" class="q-mt-sm" size="2px" rounded />
            </q-card-section>
          </q-card>
        </div>

        <!-- Armazenamento -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-grey-8 text-subtitle1 q-mb-xs">Armaz. Usado</div>
                  <div class="text-h4 text-weight-bold text-orange">
                    <template v-if="loading">
                      <q-skeleton type="text" width="80px" />
                    </template>
                    <template v-else>
                      {{ stats.storageUsed || '--' }}
                    </template>
                  </div>
                </div>
                <div class="col-auto">
                  <q-avatar size="56px" class="bg-orange-1 text-orange">
                    <q-icon name="storage" size="32px" />
                  </q-avatar>
                </div>
              </div>
              <q-linear-progress
                :value="0.45"
                color="orange-4"
                class="q-mt-sm"
                size="2px"
                rounded
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Vendas Hoje -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-grey-8 text-subtitle1 q-mb-xs">Vendas Hoje</div>
                  <div class="text-weight-bold text-teal sales-value">
                    <template v-if="loading">
                      <q-skeleton type="text" width="80px" />
                    </template>
                    <template v-else>
                      {{ stats.totalSalesDay }}
                    </template>
                  </div>
                </div>
                <div class="col-auto">
                  <q-avatar size="56px" class="bg-teal-1 text-teal">
                    <q-icon name="today" size="32px" />
                  </q-avatar>
                </div>
              </div>
              <q-linear-progress :value="0.8" color="teal-4" class="q-mt-sm" size="2px" rounded />
            </q-card-section>
          </q-card>
        </div>

        <!-- Vendas Mês -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-grey-8 text-subtitle1 q-mb-xs">Vendas Mês</div>
                  <div class="text-weight-bold text-indigo sales-value">
                    <template v-if="loading">
                      <q-skeleton type="text" width="80px" />
                    </template>
                    <template v-else>
                      {{ stats.totalSalesMonth }}
                    </template>
                  </div>
                </div>
                <div class="col-auto">
                  <q-avatar size="56px" class="bg-indigo-1 text-indigo">
                    <q-icon name="calendar_month" size="32px" />
                  </q-avatar>
                </div>
              </div>
              <q-linear-progress
                :value="0.65"
                color="indigo-4"
                class="q-mt-sm"
                size="2px"
                rounded
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Vendas Ano -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-grey-8 text-subtitle1 q-mb-xs">Vendas Ano</div>
                  <div class="text-weight-bold text-deep-orange sales-value">
                    <template v-if="loading">
                      <q-skeleton type="text" width="80px" />
                    </template>
                    <template v-else>
                      {{ stats.totalSalesYear || '--' }}
                    </template>
                  </div>
                </div>
                <div class="col-auto">
                  <q-avatar size="56px" class="bg-deep-orange-1 text-deep-orange">
                    <q-icon name="insights" size="32px" />
                  </q-avatar>
                </div>
              </div>
              <q-linear-progress
                :value="0.85"
                color="deep-orange-4"
                class="q-mt-sm"
                size="2px"
                rounded
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Total Produtos -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-grey-8 text-subtitle1 q-mb-xs">Total Produtos</div>
                  <div class="text-h4 text-weight-bold text-cyan">
                    <template v-if="loading">
                      <q-skeleton type="text" width="80px" />
                    </template>
                    <template v-else>
                      {{ stats.totalProducts ?? 0 }}
                    </template>
                  </div>
                </div>
                <div class="col-auto">
                  <q-avatar size="56px" class="bg-cyan-1 text-cyan">
                    <q-icon name="inventory_2" size="32px" />
                  </q-avatar>
                </div>
              </div>
              <q-linear-progress :value="0.7" color="cyan-4" class="q-mt-sm" size="2px" rounded />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Best Selling Products -->
      <div class="row q-mt-lg">
        <div class="col-12">
          <q-card class="modern-card">
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h5 text-weight-bold">Produtos Mais Vendidos</div>
                <div class="row items-center q-gutter-x-md">
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
                    flat
                    rounded
                    dense
                    class="bg-grey-2"
                  />
                  <q-btn-group flat>
                    <q-btn
                      :color="activeTab === 'table' ? 'primary' : 'grey-7'"
                      icon="table_chart"
                      @click="activeTab = 'table'"
                      flat
                      round
                    >
                      <q-tooltip>Visualização em Tabela</q-tooltip>
                    </q-btn>
                    <q-btn
                      :color="activeTab === 'chart' ? 'primary' : 'grey-7'"
                      icon="bar_chart"
                      @click="activeTab = 'chart'"
                      flat
                      round
                    >
                      <q-tooltip>Visualização em Gráfico</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </div>
              </div>

              <q-separator class="q-mb-md" />

              <q-tab-panels v-model="activeTab" animated>
                <!-- Table View -->
                <q-tab-panel name="table" class="q-pa-none">
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
                    flat
                    bordered
                    class="modern-table"
                  >
                    <template v-slot:top-right>
                      <div class="row items-center q-gutter-sm">
                        <q-input
                          v-model="topProductsFilter"
                          outlined
                          dense
                          placeholder="Pesquisar produto..."
                          class="search-input"
                        >
                          <template v-slot:prepend>
                            <q-icon name="search" />
                          </template>
                        </q-input>
                        <q-btn
                          color="primary"
                          icon="refresh"
                          @click="fetchTopProducts"
                          :loading="loading"
                          flat
                          round
                        >
                          <q-tooltip>Atualizar Lista</q-tooltip>
                        </q-btn>
                        <q-btn color="secondary" icon="download" @click="exportData" flat round>
                          <q-tooltip>Exportar Dados</q-tooltip>
                        </q-btn>
                      </div>
                    </template>

                    <!-- Custom Total Sold Cell -->
                    <template v-slot:body-cell-total_sold="props">
                      <q-td :props="props">
                        <div class="row items-center no-wrap">
                          <div class="col">
                            <q-linear-progress
                              :value="props.row.total_sold / maxSold"
                              color="primary"
                              class="q-mr-sm"
                              size="10px"
                              rounded
                            />
                          </div>
                          <div class="col-auto text-weight-medium">
                            {{ props.value }}
                          </div>
                        </div>
                      </q-td>
                    </template>
                  </q-table>
                </q-tab-panel>

                <!-- Chart View -->
                <q-tab-panel name="chart" class="q-pa-none">
                  <div class="row q-col-gutter-lg">
                    <div class="col-12 col-md-7">
                      <q-card flat bordered class="chart-card">
                        <q-card-section>
                          <div class="text-h6 text-weight-medium q-mb-md">Top 10 Produtos</div>
                          <apexchart
                            type="bar"
                            height="350"
                            :options="chartOptions"
                            :series="chartSeries"
                          />
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-12 col-md-5">
                      <q-card flat bordered class="chart-card">
                        <q-card-section>
                          <div class="text-h6 text-weight-medium q-mb-md">
                            Distribuição por Categoria
                          </div>
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
        </div>
      </div>
    </div>
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

const username = 'Administrador' // Você pode tornar isso dinâmico depois
</script>

<style scoped>
.admin-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  border-radius: 0 0 30px 30px;
  margin-bottom: -60px;
}

.cards-container {
  position: relative;
  z-index: 1;
}

.stats-card {
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.modern-card {
  border-radius: 16px;
  background: white;
}

.modern-table {
  border-radius: 12px;
}

.search-input {
  min-width: 200px;
}

.chart-card {
  border-radius: 12px;
  background: white;
}

.q-avatar {
  transition: all 0.3s ease;
}

.stats-card:hover .q-avatar {
  transform: scale(1.1);
}

/* Responsividade */
@media (max-width: 1023px) {
  .header-section {
    border-radius: 0 0 20px 20px;
    margin-bottom: -40px;
  }
}

@media (max-width: 599px) {
  .header-section {
    border-radius: 0 0 15px 15px;
    margin-bottom: -30px;
  }

  .cards-container {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
}

.sales-value {
  font-size: 1.8rem;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

@media (max-width: 1400px) {
  .sales-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 1200px) {
  .sales-value {
    font-size: 1.3rem;
  }
}

@media (max-width: 600px) {
  .sales-value {
    font-size: 1.2rem;
  }
}

/* Para valores muito longos */
.sales-value:not(.q-skeleton) {
  font-size: clamp(1rem, 4vw, 1.8rem);
}
</style>
