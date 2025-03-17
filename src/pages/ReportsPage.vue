<template>
  <q-page padding>
    <h2>Relatórios e Estatísticas</h2>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Desenvolvimento das Vendas</div>
            <Line :data="salesTrendData" :options="chartOptions" class="chart-container" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Vendas por Funcionário</div>
            <Bar :data="employeeSalesData" :options="chartOptions" class="chart-container" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="text-h6">Produtividade dos Funcionários</div>
              <q-space />
              <q-btn flat round icon="download" @click="exportProductivity">
                <q-tooltip>Exportar dados</q-tooltip>
              </q-btn>
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="selectedPeriod"
                  :options="periodOptions"
                  label="Período"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="selectedEmployee"
                  :options="employeeOptions"
                  label="Funcionário"
                  outlined
                  dense
                  clearable
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="text-subtitle1 q-mb-sm">Métricas Gerais</div>
                <div class="q-gutter-y-sm">
                  <div class="row items-center">
                    <q-icon name="person" size="sm" class="q-mr-sm" />
                    <div>Total Funcionários: {{ productivitySummary.totalEmployees }}</div>
                  </div>
                  <div class="row items-center">
                    <q-icon name="trending_up" size="sm" class="q-mr-sm" />
                    <div>Produtividade Média: {{ productivitySummary.averageProductivity }}%</div>
                  </div>
                  <div class="row items-center">
                    <q-icon name="attach_money" size="sm" class="q-mr-sm" />
                    <div>Vendas Totais: {{ formatCurrency(productivitySummary.totalSales) }}</div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-subtitle1 q-mb-sm">Distribuição de Produtividade</div>
                <Doughnut
                  :data="productivityChartData"
                  :options="productivityChartOptions"
                  class="chart-container"
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <q-list bordered separator>
              <q-item v-for="employee in filteredProductivityData" :key="employee.id">
                <q-item-section>
                  <q-item-label>{{ employee.name }}</q-item-label>
                  <q-item-label caption>
                    <div class="row items-center">
                      <q-icon
                        :name="employee.productivity >= 80 ? 'check_circle' : 'warning'"
                        :color="employee.productivity >= 80 ? 'positive' : 'warning'"
                        size="xs"
                        class="q-mr-xs"
                      />
                      <div>
                        Vendas: {{ employee.sales }} | Produtividade: {{ employee.productivity }}%
                      </div>
                    </div>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Produtos Mais Vendidos</div>
            <q-table
              :rows="computedRows"
              :columns="topProductsColumns"
              row-key="id"
              :loading="loading"
              loading-label="A carregar..."
              :pagination="{ rowsPerPage: 10 }"
            >
              <template v-slot:top-right>
                <q-input
                  v-model="topProductsFilter"
                  outlined
                  dense
                  placeholder="Pesquisar produto..."
                  class="q-mr-sm"
                />
                <q-btn color="primary" icon="refresh" @click="fetchTopProducts" />
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-table
              title="Relatório Detalhado"
              :rows="reportData"
              :columns="columns"
              row-key="id"
              :loading="loading"
              loading-label="A carregar..."
            >
              <template v-slot:top-right>
                <q-btn color="primary" icon="download" label="Exportar" @click="exportReport" />
              </template>
            </q-table>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { exportFile } from 'quasar'
import axios from 'axios'
import reportService from '../services/report.service'
import { formatCurrency } from '../services/currency.service'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  BarElement,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  BarElement,
  ArcElement,
)

const $q = useQuasar()

const dateRange = ref({
  from: new Date().toISOString().split('T')[0],
  to: new Date().toISOString().split('T')[0],
})

const selectedReportType = ref('sales')
const loading = ref(false)
const reportData = ref([
  {
    date: '',
    total: 0,
    details: '',
  },
])
const salesTrendData = ref({
  labels: [],
  datasets: [
    {
      label: 'Vendas',
      backgroundColor: '#1976D2',
      borderColor: '#1976D2',
      data: [],
    },
  ],
})

const employeeSalesData = ref({
  labels: [],
  datasets: [
    {
      label: 'Vendas',
      backgroundColor: '#26A69A',
      data: [],
    },
  ],
})

// Dados de produtividade
const productivityData = ref([])

// Verifica se o valor é um array antes de usar map
function safeMap(array, callback) {
  return Array.isArray(array) ? array.map(callback) : []
}
const selectedPeriod = ref('last_30_days')
const selectedEmployee = ref(null)
const periodOptions = [
  { label: 'Últimos 7 dias', value: 'last_7_days' },
  { label: 'Últimos 30 dias', value: 'last_30_days' },
  { label: 'Últimos 90 dias', value: 'last_90_days' },
]

const employeeOptions = computed(() => {
  return safeMap(productivityData.value, (emp) => ({
    label: emp.name,
    value: emp.id,
  }))
})

const productivitySummary = computed(() => {
  const data = safeMap(productivityData.value, (emp) => emp)
  const totalEmployees = data.length
  const totalSales = data.reduce((sum, emp) => sum + (emp.sales || 0), 0)
  const averageProductivity =
    data.reduce((sum, emp) => sum + (emp.productivity || 0), 0) / totalEmployees || 0

  return {
    totalEmployees,
    totalSales,
    averageProductivity: averageProductivity.toFixed(1),
  }
})

const filteredProductivityData = computed(() => {
  const data = safeMap(productivityData.value, (emp) => emp)

  if (selectedEmployee.value) {
    return data.filter((emp) => emp.id === selectedEmployee.value)
  }

  return data
})
const productivityChartData = computed(() => {
  const categories = [
    { label: 'Alta (>80%)', value: 0, color: '#26A69A' },
    { label: 'Média (60-80%)', value: 0, color: '#FFC107' },
    { label: 'Baixa (<60%)', value: 0, color: '#F44336' },
  ]

  if (Array.isArray(productivityData.value)) {
    productivityData.value.forEach((emp) => {
      const productivity = emp.productivity || 0
      if (productivity >= 80) {
        categories[0].value++
      } else if (productivity >= 60) {
        categories[1].value++
      } else {
        categories[2].value++
      }
    })
  }

  return {
    labels: categories.map((c) => c.label),
    datasets: [
      {
        data: categories.map((c) => c.value),
        backgroundColor: categories.map((c) => c.color),
      },
    ],
  }
})

const productivityChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
})

function exportProductivity() {
  const headers = ['Nome', 'Vendas', 'Produtividade']
  const rows = productivityData.value.map((emp) => [emp.name, emp.sales, `${emp.productivity}%`])

  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')

  const status = exportFile('produtividade.csv', csvContent, 'text/csv')

  if (status) {
    $q.notify({
      type: 'positive',
      message: 'Dados exportados com sucesso',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: 'Erro ao exportar dados',
    })
  }
}

const topProducts = ref([]) // Inicializa sempre como array vazio
const computedRows = computed(() => {
  return Array.isArray(topProducts.value) ? topProducts.value : []
})
const topProductsFilter = ref('')
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
    format: (val) => `${val} un`,
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

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
})

async function fetchReportData() {
  try {
    loading.value = true
    const params = {
      from: dateRange.value.from,
      to: dateRange.value.to,
      type: selectedReportType.value,
    }

    // Fetch all data in parallel
    const [reportResponse, salesTrendResponse, employeeSalesResponse, productivityResponse] =
      await Promise.all([
        axios.get('/api/reports/summary', { params }),
        axios.get('/api/reports/sales-trend', { params }),
        axios.get('/api/reports/employee-sales', { params }),
        reportService.getProductivityReport(selectedPeriod.value),
      ])

    // Update reactive data
    reportData.value = Array.isArray(reportResponse.data) ? reportResponse.data : []
    salesTrendData.value = {
      labels: salesTrendResponse.data.labels,
      datasets: [
        {
          ...salesTrendData.value.datasets[0],
          data: salesTrendResponse.data.values,
        },
      ],
    }
    employeeSalesData.value = {
      labels: employeeSalesResponse.data.labels,
      datasets: [
        {
          ...employeeSalesData.value.datasets[0],
          data: employeeSalesResponse.data.values,
        },
      ],
    }
    if (!productivityResponse) {
      throw new Error('Resposta de produtividade inválida')
    }

    // Aceita tanto { data: [...] } quanto array direto
    const productivityArray = Array.isArray(productivityResponse.data)
      ? productivityResponse.data
      : Array.isArray(productivityResponse)
        ? productivityResponse
        : []

    console.log('Dados de produtividade:', productivityArray)
    productivityData.value = productivityArray
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao carregar relatório',
    })
  } finally {
    loading.value = false
  }
}

// Watch for changes in filters
watch([dateRange, selectedReportType], () => {
  fetchReportData()
})

async function fetchTopProducts() {
  try {
    loading.value = true
    const response = await reportService.getTopSellingProducts()

    // Handle response format: { data: [...] }
    if (!response || !Array.isArray(response.data)) {
      throw new Error('Formato de dados inválido da API. Esperado: { data: [...] }')
    }
    const products = response.data

    // Format numbers and ensure correct data types
    const formattedProducts = products.map((product) => ({
      id: product.id || 0,
      name: product.name || 'Produto sem nome',
      code: product.code || '',
      category_name: product.category_name || 'Sem categoria',
      price: parseFloat(product.price || 0).toFixed(2),
      total_sold: parseInt(product.total_sold || 0),
      total_revenue: parseFloat(product.total_revenue || 0).toFixed(2),
    }))

    // Always set the value to an array
    topProducts.value = formattedProducts
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao carregar produtos mais vendidos',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReportData()
  fetchTopProducts()
})

const columns = [
  { name: 'date', label: 'Data', field: 'date', align: 'left' },
  { name: 'total', label: 'Total', field: 'total', align: 'right' },
  { name: 'details', label: 'Detalhes', field: 'details', align: 'left' },
]

function exportReport() {
  const content = reportData.value
    .map((row) => `${row.date},${row.total},${row.details}`)
    .join('\n')

  const status = exportFile('relatorio.csv', `Data,Total,Detalhes\n${content}`, 'text/csv')

  if (status === true) {
    $q.notify({
      type: 'positive',
      message: 'Relatório exportado com sucesso',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: 'Erro ao exportar relatório',
    })
  }
}

// TODO: Implement report data fetching
</script>

<style scoped>
h2 {
  margin-bottom: 2rem;
}

.chart-container {
  position: relative;
  height: 400px;
  max-height: 400px;
  min-height: 300px;
}
</style>
