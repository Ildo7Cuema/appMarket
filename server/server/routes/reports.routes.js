import express from 'express'
import db from '../../../src/services/database.js'
import { productsResponseValidator } from '../../middlewares/responseValidator.js'

const router = express.Router()

// Rota para relatório de produtividade
router.get('/productivity', async (req, res) => {
  try {
    const { period } = req.query

    // Calcula o período baseado no parâmetro
    const dateRange = getDateRange(period)

    // Busca dados de vendas e atividades dos funcionários
    const [salesData, activitiesData] = await Promise.all([
      getEmployeeSales(dateRange),
      getEmployeeActivities(dateRange),
    ])

    console.log('Dados de vendas:', salesData)
    console.log('Dados de atividades:', activitiesData)

    // Calcula métricas de produtividade
    const productivityData = calculateProductivity(salesData, activitiesData)

    res.json({ data: productivityData })
  } catch (error) {
    console.error('Erro no relatório de produtividade:', error)
    res.status(500).json({ error: 'Erro ao gerar relatório de produtividade' })
  }
})

// Funções auxiliares
function getDateRange(period) {
  const now = new Date()
  const from = new Date(now)

  switch (period) {
    case 'last_7_days':
      from.setDate(now.getDate() - 7)
      break
    case 'last_30_days':
      from.setDate(now.getDate() - 30)
      break
    case 'last_90_days':
      from.setDate(now.getDate() - 90)
      break
    default:
      from.setDate(now.getDate() - 30)
  }

  return { from: from.toISOString().split('T')[0], to: now.toISOString().split('T')[0] }
}

async function getEmployeeSales({ from, to }) {
  const query = `
    SELECT
      e.id AS employee_id,
      e.name AS employee_name,
      SUM(s.total_amount) AS total_sales,
      COUNT(s.id) AS sales_count
    FROM sales s
    JOIN employees e ON s.employee_id = e.id
    WHERE s.created_at BETWEEN ? AND ?
    GROUP BY e.id
  `
  return db.query(query, [from, to])
}

async function getEmployeeActivities({ from, to }) {
  const query = `
    SELECT
      user_id AS employee_id,
      COUNT(*) AS total_activities,
      SUM(CASE WHEN activity_type = 'SALE' THEN 1 ELSE 0 END) AS sales_activities,
      SUM(CASE WHEN activity_type = 'SERVICE' THEN 1 ELSE 0 END) AS service_activities
    FROM user_activities
    WHERE created_at BETWEEN ? AND ?
    GROUP BY user_id
  `
  return db.query(query, [from, to])
}

function calculateProductivity(salesData, activitiesData) {
  console.log('Dados brutos de vendas:', salesData)
  console.log('Dados brutos de atividades:', activitiesData)

  const productivityMap = new Map()

  // Processa dados de vendas
  if (salesData && salesData.length > 0) {
    salesData.forEach((row) => {
      productivityMap.set(row.employee_id, {
        id: row.employee_id,
        name: row.employee_name,
        sales: parseFloat(row.total_sales) || 0,
        salesCount: parseInt(row.sales_count) || 0,
        productivity: 0,
      })
    })
  }

  // Processa dados de atividades
  if (activitiesData && activitiesData.length > 0) {
    activitiesData.forEach((row) => {
      const employee = productivityMap.get(row.employee_id) || {
        id: row.employee_id,
        name: 'Funcionário desconhecido',
        sales: 0,
        salesCount: 0,
        productivity: 0,
      }

      const totalActivities = parseInt(row.total_activities) || 1
      const salesActivities = parseInt(row.sales_activities) || 0

      // Calcula produtividade como porcentagem de atividades de vendas
      employee.productivity = Math.round((salesActivities / totalActivities) * 100)

      productivityMap.set(row.employee_id, employee)
    })
  }

  const result = Array.from(productivityMap.values())
  console.log('Dados processados:', result)
  return result
}

// Rota para produtos mais vendidos
router.get('/top-products', productsResponseValidator, async (req, res) => {
  try {
    console.log('Iniciando busca por produtos mais vendidos...')
    const products = await getTopSellingProducts()
    console.log('Produtos encontrados:', products)
    res.json({ data: products })
  } catch (error) {
    console.error('Erro ao buscar produtos mais vendidos:', error)
    res.status(500).json({
      error: 'Erro ao buscar produtos mais vendidos',
      details: error.message,
    })
  }
})

async function getTopSellingProducts() {
  const query = `
    SELECT
      p.id,
      p.name,
      p.code,
      c.name AS category_name,
      p.price,
      COALESCE(SUM(si.quantity), 0) AS total_sold,
      COALESCE(SUM(si.quantity * p.price), 0) AS total_revenue
    FROM products p
    LEFT JOIN sale_items si ON p.id = si.product_id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN sales s ON si.sale_id = s.id
    WHERE s.id IS NOT NULL
    GROUP BY p.id
    HAVING total_sold > 0
    ORDER BY total_sold DESC
    LIMIT 10
  `
  return db.query(query)
}

export default router
