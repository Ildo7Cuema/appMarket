import express from 'express'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())

// Initialize database
const db = new Database(path.join(__dirname, 'server', 'appmarket.db'), {
  verbose: console.log,
  fileMustExist: true,
})

// Configure database in app.locals
app.locals.db = db

// Import and configure proforma routes
import proformaRoutes from './routes/proforma.routes.js'
app.use('/api/proforma-invoices', proformaRoutes)

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`)
  console.log(`Test API available at http://localhost:${PORT}/api`)
})
