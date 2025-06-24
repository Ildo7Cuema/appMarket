import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import multer from 'multer'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for logo uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, 'uploads'))
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    },
  }),
  limits: {
    fileSize: 30 * 1024 * 1024, // 5MB limit
  },
})
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Database from 'better-sqlite3'

// Initialize database
const db = new Database(path.join('server', 'appmarket.db'), {
  verbose: console.log,
  fileMustExist: true,
})

// Create tables if they don't exist
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT,
    company_address TEXT,
    company_phone TEXT,
    company_email TEXT,
    company_nif TEXT,
    logo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
).run()

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '1h'

console.log('Starting server...')

// Initialize database
function initializeDatabase() {
  // Create all necessary tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT,
      company_address TEXT,
      company_phone TEXT,
      company_email TEXT,
      company_nif TEXT,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create tables without foreign keys first
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT,
      company_address TEXT,
      company_phone TEXT,
      company_email TEXT,
      company_nif TEXT,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      isActive INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Now create tables with foreign keys
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      category_id INTEGER,
      image_url TEXT,
      price_with_tax REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      movement_type TEXT NOT NULL, -- 'in' or 'out'
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS user_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      activity_type TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS offline_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      is_subscribed BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  return db
}

const app = express()
console.log('Express app created')

app.use(
  cors({
    origin: 'http://localhost:9000',
    credentials: true,
  }),
)
app.use(express.json())

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
console.log('Middleware configured')

// Verificação de assinatura ativa
import expirationCheck from './middlewares/expirationCheck.js'
app.use((req, res, next) => {
  // Permite acesso à rota de assinatura sem verificação
  if (req.path.startsWith('/api/subscription')) {
    return next()
  }
  expirationCheck(req, res, next)
})

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// Create uploads directory if it doesn't exist
const dir = path.join(__dirname, 'uploads')
console.log('Checking uploads directory at:', dir)
try {
  if (!fs.existsSync(dir)) {
    console.log('Creating uploads directory...')
    fs.mkdirSync(dir, {
      recursive: true,
      mode: 0o777, // Ensure writable permissions
    })
    console.log('Successfully created uploads directory at:', dir)
  } else {
    console.log('Uploads directory already exists at:', dir)
  }

  // Verify directory permissions
  const stats = fs.statSync(dir)
  console.log('Uploads directory permissions:', stats.mode.toString(8))
} catch (error) {
  console.error('Error creating uploads directory:', error)
  process.exit(1)
}
console.log('Uploads directory ready at:', dir)

// Configure base URL for uploads
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Upload logo endpoint
app.post('/api/settings/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded',
        error: 'Missing logo file',
      })
    }

    const logoUrl = `${BASE_URL}/uploads/${req.file.filename}`

    return res.status(200).json({
      message: 'Logo uploaded successfully',
      logoUrl,
    })
  } catch (error) {
    console.error('Logo upload error:', error)
    return res.status(500).json({
      message: 'Failed to upload logo',
      error: error.message,
    })
  }
})

// Import routers
import reportsRouter from './server/routes/reports.routes.js'

// Import seeds
//import { createSuperAdmin } from './src/seed/super-admin.seed.js'
import { createAdmin } from '../src/seed/admin.seed.js'

// Initialize database
// Initialize database and run seeds
initializeDatabase()
console.log('Database initialized')

// Execute seeds
console.log('Running seeds...')
//createSuperAdmin()
createAdmin()

// Settings endpoint
app.post('/api/settings', async (req, res) => {
  console.log(req.body)
  try {
    const settings = req.body
    // Validate required fields
    if (
      !settings.company_name ||
      !settings.company_address ||
      !settings.company_phone ||
      !settings.company_email ||
      !settings.company_nif ||
      !settings.user_id
    ) {
      return res.status(400).json({
        message: 'All fields are required',
        error: 'Missing required fields',
      })
    }

    // Verify database connection and table existence
    try {
      const tableExists = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'")
        .get()

      if (!tableExists) {
        console.error('Settings table does not exist')
        return res.status(500).json({
          message: 'Database configuration error',
          error: 'Settings table not found',
        })
      }

      // Verify database connection
      if (!db.open) {
        console.error('Database connection is closed')
        return res.status(500).json({
          message: 'Database connection error',
          error: 'Database is not connected',
        })
      }

      // Check if settings already exist
      const existingSettings = db.prepare('SELECT id FROM settings LIMIT 1').get()

      let result
      if (existingSettings) {
        // Update existing settings
        const stmt = db.prepare(
          `
          UPDATE settings SET
            company_name = ?,
            company_address = ?,
            company_phone = ?,
            company_email = ?,
            company_nif = ?,
            logo_url = ?
          WHERE id = ?
        `,
        )

        result = stmt.run(
          settings.company_name,
          settings.company_address,
          settings.company_phone,
          settings.company_email,
          settings.company_nif,
          settings.logo_url || '',
          existingSettings.id,
        )
      } else {
        // Insert new settings
        const stmt = db.prepare(
          `
          INSERT INTO settings
          (company_name, company_address, company_phone, company_email, company_nif, logo_url)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        )

        result = stmt.run(
          settings.company_name,
          settings.company_address,
          settings.company_phone,
          settings.company_email,
          settings.company_nif,
          settings.logo_url || '',
        )
      }

      if (!existingSettings && !result.lastInsertRowid) {
        console.error('Failed to save settings:', result)
        return res.status(500).json({
          message: 'Failed to save settings',
          error: 'Failed to insert settings',
          details: result,
        })
      }

      console.log('Settings saved successfully. Last ID:', result.lastInsertRowid)

      return res.status(200).json({
        message: 'Settings saved successfully',
        settings: {
          ...settings,
          id: result.lastID,
        },
      })
    } catch (error) {
      console.error('Database error during settings save:', {
        error: error.message,
        stack: error.stack,
        settings: settings,
      })
      return res.status(500).json({
        message: 'Database operation failed',
        error: error.message,
        details: {
          operation: 'settings_save',
          settings: settings,
        },
      })
    }
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Get settings endpoint
app.get('/api/settings', async (req, res) => {
  try {
    const settings = db
      .prepare(
        `
      SELECT * FROM settings
      ORDER BY created_at DESC
      LIMIT 1
    `,
      )
      .get()

    if (!settings) {
      return res.status(404).json({ message: 'No settings found' })
    }

    res.status(200).json(settings)
  } catch (error) {
    console.error('Error getting settings:', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

console.log('Routes registered')

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body

    // Validate required fields
    if (!username || !password || !role) {
      return res.status(400).json({
        message: 'Username, password and role are required',
      })
    }

    // Check if username already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username)

    if (existingUser) {
      return res.status(400).json({
        message: 'Username already exists',
      })
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10)

    // Insert new user
    const stmt = db.prepare(`
      INSERT INTO users (username, password, role)
      VALUES (?, ?, ?)
    `)
    const result = stmt.run(username, hashedPassword, role)

    if (!result.lastInsertRowid) {
      return res.status(500).json({
        message: 'Failed to create user',
      })
    }

    return res.status(201).json({
      message: 'User created successfully',
      userId: result.lastInsertRowid,
    })
  } catch (error) {
    console.error('Error registering user:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required',
      })
    }

    // Find user in database
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      })
    }

    // Verify password
    const passwordMatch = bcrypt.compareSync(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
      })
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Debug endpoint to get table schema
app.get('/api/debug/table-schema/:table', async (req, res) => {
  try {
    const { table } = req.params
    const schema = db.prepare(`PRAGMA table_info(${table})`).all()
    return res.status(200).json(schema)
  } catch (error) {
    console.error('Error getting table schema:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Employees endpoints
app.get('/api/employees', async (req, res) => {
  try {
    const employees = db.prepare('SELECT * FROM employees').all()
    return res.status(200).json(employees)
  } catch (error) {
    console.error('Error getting employees:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.post('/api/employees', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        message: 'Name, email are required',
      })
    }

    // Check if email already exists
    const existingEmployee = db.prepare('SELECT * FROM employees WHERE email = ?').get(email)

    if (existingEmployee) {
      return res.status(400).json({
        message: 'O email já existe',
        error: 'DUPLICATE_EMAIL',
      })
    }

    // Insert new employee
    const stmt = db.prepare(`
      INSERT INTO employees
      (name, email, phone, address)
      VALUES (?, ?, ?, ?)
    `)

    const result = stmt.run(name, email, phone, address)

    if (!result.lastInsertRowid) {
      return res.status(500).json({
        message: 'Falha ao criar funcionário',
        error: 'INSERT_FAILED',
      })
    }

    // Get created employee
    const employee = db
      .prepare(
        `
      SELECT * FROM employees
      WHERE id = ?
    `,
      )
      .get(result.lastInsertRowid)

    return res.status(201).json({
      message: 'Funcionário criado com sucesso',
      employee,
    })
  } catch (error) {
    console.error('Error creating employee:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    })
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      code: error.code,
    })
  }
})

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, address } = req.body

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        message: 'Name, email and role are required',
      })
    }

    // Update employee
    const stmt = db.prepare(`
      UPDATE employees SET
        name = ?,
        email = ?,
        phone = ?,
        address = ?,
      WHERE id = ?
    `)

    const result = stmt.run(name, email, phone, address, id)

    if (result.changes === 0) {
      return res.status(404).json({
        message: 'Employee not found',
      })
    }

    // Get updated employee
    const updatedEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id)

    return res.status(200).json({
      message: 'Employee updated successfully',
      employee: updatedEmployee,
    })
  } catch (error) {
    console.error('Error updating employee:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.get('/api/products', async (req, res) => {
  try {
    const products = db
      .prepare(
        `
      SELECT
        p.*,
        c.name as category_name,
        c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `,
      )
      .all()
    return res.status(200).json(products)
  } catch (error) {
    console.error('Error getting products:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.post('/api/products', async (req, res) => {
  try {
    const { code, name, description, price, quantity, category_id, image_url, price_with_tax } =
      req.body

    // Validate required fields
    if (!name || !price || !quantity || !code) {
      return res.status(400).json({
        message: 'Name, price, stock and code are required',
      })
    }

    // Insert new product
    const productStmt = db.prepare(`
      INSERT INTO products
      (code, name, description, price, quantity, category_id, image_url, price_with_tax)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const productResult = productStmt.run(
      code,
      name,
      description || null,
      price,
      quantity,
      category_id || null,
      image_url || null,
      price_with_tax || null,
    )

    if (!productResult.lastInsertRowid) {
      throw new Error('Failed to create product')
    }

    // Get created product
    const product = db
      .prepare('SELECT * FROM products WHERE id = ?')
      .get(productResult.lastInsertRowid)
    const category = category_id
      ? db.prepare('SELECT * FROM categories WHERE id = ?').get(category_id)
      : null

    return res.status(201).json({
      message: 'Product created successfully',
      product: {
        ...product,
        category,
      },
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, quantity, category_id } = req.body

    // Validate required fields
    if (!name || !price || !quantity) {
      return res.status(400).json({
        message: 'Name, price and quantity are required',
      })
    }

    // Update product
    const productStmt = db.prepare(`
      UPDATE products SET
        name = ?,
        description = ?,
        price = ?,
        quantity = ?,
        category_id = ?
      WHERE id = ?
    `)
    const productResult = productStmt.run(
      name,
      description || null,
      price,
      quantity,
      category_id || null,
      id,
    )

    if (productResult.changes === 0) {
      return res.status(404).json({
        message: 'Product not found',
      })
    }

    // Get updated product with category
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
    const category = category_id
      ? db.prepare('SELECT * FROM categories WHERE id = ?').get(category_id)
      : null

    return res.status(200).json({
      message: 'Product updated successfully',
      product: {
        ...product,
        category,
      },
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.get('/api/stock-movements', async (req, res) => {
  try {
    const movements = db.prepare('SELECT * FROM stock_movements').all()
    return res.status(200).json(movements)
  } catch (error) {
    console.error('Error getting stock movements:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Stock movements endpoint
app.post('/api/stock-movements', async (req, res) => {
  try {
    const { productId, quantity, movement_type, reason } = req.body

    // Validate movement type
    if (!['in', 'out'].includes(movement_type)) {
      return res.status(400).json({
        message: 'Invalid movement type',
        error: 'Movement type must be either "in" or "out"',
      })
    }

    // Start transaction
    const transaction = db.transaction(() => {
      // Insert movement
      const stmt = db.prepare(`
        INSERT INTO stock_movements (product_id, quantity, movement_type, reason)
        VALUES (?, ?, ?, ?)
      `)
      const result = stmt.run(productId, quantity, movement_type, reason)

      // Update product quantity
      const productStmt = db.prepare(`
        UPDATE products
        SET quantity = quantity ${movement_type === 'in' ? '+' : '-'} ?
        WHERE id = ?
      `)
      productStmt.run(quantity, productId)

      return {
        id: result.lastInsertRowid,
        productId,
        quantity,
        movement_type,
        reason,
        createdAt: new Date().toISOString(),
      }
    })

    // Execute transaction
    const movement = transaction()

    return res.status(201).json(movement)
  } catch (error) {
    console.error('Error creating stock movement:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Stock history endpoint
app.get('/api/stock/history', async (req, res) => {
  try {
    const { productId, period = '30d' } = req.query

    // Validate productId
    if (!productId) {
      return res.status(400).json({
        message: 'Product ID is required',
        error: 'Missing productId parameter',
      })
    }

    const dateFilter = new Date()
    switch (period) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30)
        break
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90)
        break
      default:
        dateFilter.setDate(dateFilter.getDate() - 30)
    }

    const history = db
      .prepare(
        `
      SELECT
        sm.*,
        p.name as product_name,
        p.code as product_code,
        c.name as category_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE sm.product_id = ?
        AND sm.created_at >= ?
      ORDER BY sm.created_at DESC
    `,
      )
      .all(productId, dateFilter.toISOString())

    return res.status(200).json(history)
  } catch (error) {
    console.error('Error getting stock history:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Locations endpoints
app.get('/api/locations', async (req, res) => {
  try {
    const locations = db.prepare('SELECT * FROM locations').all()
    return res.status(200).json(locations)
  } catch (error) {
    console.error('Error getting locations:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.post('/api/locations', async (req, res) => {
  try {
    const { name, address } = req.body

    if (!name) {
      return res.status(400).json({
        message: 'Location name is required',
      })
    }

    const stmt = db.prepare(`
      INSERT INTO locations (name, address)
      VALUES (?, ?)
    `)
    const result = stmt.run(name, address || null)

    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(result.lastInsertRowid)

    return res.status(201).json({
      message: 'Location created successfully',
      location,
    })
  } catch (error) {
    console.error('Error creating location:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Batch tracking endpoints
app.get('/api/stock/batches', async (req, res) => {
  try {
    const batches = db
      .prepare(
        `
      SELECT
        batch_number,
        expiration_date,
        SUM(quantity) as total_quantity,
        product_id
      FROM stock_movements
      WHERE batch_number IS NOT NULL
      GROUP BY batch_number, product_id
    `,
      )
      .all()

    return res.status(200).json(batches)
  } catch (error) {
    console.error('Error getting batches:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Stock alerts endpoints
app.get('/api/stock/alerts', async (req, res) => {
  try {
    const { threshold = 10 } = req.query

    const alerts = db
      .prepare(
        `
      SELECT p.*
      FROM products p
      WHERE p.quantity <= ?
    `,
      )
      .all(threshold)

    return res.status(200).json(alerts)
  } catch (error) {
    console.error('Error getting stock alerts:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Stock history endpoints
app.get('/api/stock/history', async (req, res) => {
  try {
    const { productId, period = '30d' } = req.query

    const dateFilter = new Date()
    switch (period) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30)
        break
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90)
        break
      default:
        dateFilter.setDate(dateFilter.getDate() - 30)
    }

    const history = db
      .prepare(
        `
      SELECT
        sm.*,
        p.name as product_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      WHERE sm.product_id = ?
        AND sm.created_at >= ?
      ORDER BY sm.created_at DESC
    `,
      )
      .all(productId, dateFilter.toISOString())

    return res.status(200).json(history)
  } catch (error) {
    console.error('Error getting stock history:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Locations endpoints
app.get('/api/locations', async (req, res) => {
  try {
    const locations = db.prepare('SELECT * FROM locations').all()
    return res.status(200).json(locations)
  } catch (error) {
    console.error('Error getting locations:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.post('/api/locations', async (req, res) => {
  try {
    const { name, address } = req.body

    if (!name) {
      return res.status(400).json({
        message: 'Location name is required',
      })
    }

    const stmt = db.prepare(`
        INSERT INTO locations (name, address)
        VALUES (?, ?)
      `)
    const result = stmt.run(name, address || null)

    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(result.lastInsertRowid)

    return res.status(201).json({
      message: 'Location created successfully',
      location,
    })
  } catch (error) {
    console.error('Error creating location:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Batch tracking endpoint
app.get('/api/stock/batches', async (req, res) => {
  try {
    const batches = db
      .prepare(
        `
        SELECT
          sm.batch_number,
          sm.expiration_date,
          SUM(sm.quantity) as total_quantity,
          sm.product_id,
          p.name as product_name,
          p.code as product_code,
          c.name as category_name
        FROM stock_movements sm
        JOIN products p ON sm.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE sm.batch_number IS NOT NULL
        GROUP BY sm.batch_number, sm.product_id
        ORDER BY sm.expiration_date ASC
      `,
      )
      .all()

    return res.status(200).json(batches)
  } catch (error) {
    console.error('Error getting batches:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Stock alerts endpoint
app.get('/api/stock/alerts', async (req, res) => {
  try {
    const { threshold = 10 } = req.query

    const alerts = db
      .prepare(
        `
      SELECT
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.quantity <= ?
    `,
      )
      .all(threshold)

    return res.status(200).json(alerts)
  } catch (error) {
    console.error('Error getting stock alerts:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Stock history endpoints
app.get('/api/stock/history', async (req, res) => {
  try {
    const { productId, period = '30d' } = req.query

    const dateFilter = new Date()
    switch (period) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30)
        break
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90)
        break
      default:
        dateFilter.setDate(dateFilter.getDate() - 30)
    }

    const history = db
      .prepare(
        `
        SELECT
          sm.*,
          p.name as product_name
        FROM stock_movements sm
        JOIN products p ON sm.product_id = p.id
        WHERE sm.product_id = ?
          AND sm.created_at >= ?
        ORDER BY sm.created_at DESC
      `,
      )
      .all(productId, dateFilter.toISOString())

    return res.status(200).json(history)
  } catch (error) {
    console.error('Error getting stock history:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Category endpoints
app.get('/api/categories', async (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all()
    return res.status(200).json(categories)
  } catch (error) {
    console.error('Error getting categories:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.get('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id)

    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
      })
    }

    return res.status(200).json(category)
  } catch (error) {
    console.error('Error getting category:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.post('/api/categories', async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({
        message: 'Category name is required',
      })
    }

    const stmt = db.prepare(`
      INSERT INTO categories (name, description)
      VALUES (?, ?)
    `)
    const result = stmt.run(name, description || null)

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid)

    return res.status(201).json({
      message: 'Category created successfully',
      category,
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({
        message: 'Category name is required',
      })
    }

    const stmt = db.prepare(`
      UPDATE categories SET
        name = ?,
        description = ?
      WHERE id = ?
    `)
    const result = stmt.run(name, description || null, id)

    if (result.changes === 0) {
      return res.status(404).json({
        message: 'Category not found',
      })
    }

    const updatedCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id)

    return res.status(200).json({
      message: 'Category updated successfully',
      category: updatedCategory,
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Check if category is used by any products
    const productsCount = db
      .prepare(
        `
      SELECT COUNT(*) as count FROM products WHERE category_id = ?
    `,
      )
      .get(id).count

    if (productsCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete category - it is being used by products',
      })
    }

    const stmt = db.prepare('DELETE FROM categories WHERE id = ?')
    const result = stmt.run(id)

    if (result.changes === 0) {
      return res.status(404).json({
        message: 'Category not found',
      })
    }

    return res.status(200).json({
      message: 'Category deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.put('/api/users/:id', async (req, res) => {
  console.log(req)
  try {
    const { id } = req.params
    const { username, role, isActive } = req.body

    // Validate required fields
    if (!username || !role || !isActive) {
      return res.status(400).json({
        message: 'Existem campos que são requerido',
      })
    }

    // Update user
    const stmt = db.prepare(`
      UPDATE users SET
        username = ?,
        role = ?,
        isActive = ?
      WHERE id = ?
    `)

    const result = stmt.run(username, role, isActive, id)

    if (result.changes === 0) {
      return res.status(404).json({
        message: 'Usuário não encotrado',
      })
    }

    // Get updated user
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id)

    return res.status(200).json({
      message: 'Usuário actualizado com sucesso!',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Password change endpoint
app.put('/api/users/change-password/:id', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const { id } = req.params

    // Validações básicas
    if (!id || !currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios',
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'A nova senha deve ter pelo menos 6 caracteres',
      })
    }

    // Verificar se usuário existe
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      })
    }

    // Verificar senha atual
    const passwordMatch = bcrypt.compareSync(currentPassword, user.password)

    if (!passwordMatch) {
      return res.status(400).json({
        error: 'Senha atual incorreta',
      })
    }

    // Atualizar senha
    const newPasswordHash = bcrypt.hashSync(newPassword, 10)
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPasswordHash, id)

    // Log password change activity
    const activityStmt = db.prepare(`
      INSERT INTO user_activities (user_id, activity_type, description)
      VALUES (?, ?, ?)
    `)
    activityStmt.run(id, 'PASSWORD_CHANGE', 'Usuário alterou a senha')

    return res.status(200).json({
      message: 'Senha alterada com sucesso',
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return res.status(500).json({
      message: 'Erro interno ao alterar senha',
      error: error.message,
    })
  }
})

app.put('/api/userStatus/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    // Validate required fields
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'O campo isActive é obrigatório e deve ser um booleano',
      })
    }

    // Convert isActive to proper SQLite boolean (1 or 0)
    const sqliteBoolean = isActive ? 1 : 0

    // Update user status
    const stmt = db.prepare(`
      UPDATE users SET
        isActive = ?
      WHERE id = ?
    `)

    const result = stmt.run(sqliteBoolean, id)

    if (result.changes === 0) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
      })
    }

    // Get updated user
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id)

    return res.status(200).json({
      message: 'Status do usuário atualizado com sucesso',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Delete employee
    const stmt = db.prepare('DELETE FROM employees WHERE id = ?')
    const result = stmt.run(id)

    if (result.changes === 0) {
      return res.status(404).json({
        message: 'Employee not found',
      })
    }

    return res.status(200).json({
      message: 'Employee deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// User Management Endpoints
app.get('/api/users', async (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all()
    return res.status(200).json(users)
  } catch (error) {
    console.error('Error getting users:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.post('/api/users', async (req, res) => {
  try {
    const { username, password, email, role } = req.body

    // Validate required fields
    if (!username || !password || !email) {
      return res.status(400).json({
        message: 'Username, password and email are required',
      })
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10)

    const stmt = db.prepare(`
      INSERT INTO users (username, password, email, role)
      VALUES (?, ?, ?, ?)
    `)
    const result = stmt.run(username, hashedPassword, email, role || 'user')

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)

    return res.status(201).json({
      message: 'User created successfully',
      user,
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Verify user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    // Delete user
    const stmt = db.prepare('DELETE FROM users WHERE id = ?')
    const result = stmt.run(id)

    if (result.changes === 0) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    return res.status(200).json({
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// System Settings Endpoints
app.get('/api/system-settings', async (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings ORDER BY created_at DESC LIMIT 1').all()
    return res.status(200).json(settings)
  } catch (error) {
    console.error('Error getting system settings:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.post('/api/system-settings', async (req, res) => {
  try {
    const { key, value } = req.body

    if (!key || !value) {
      return res.status(400).json({
        message: 'Key and value are required',
      })
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO system_settings (setting_key, setting_value)
      VALUES (?, ?)
    `)
    stmt.run(key, value)

    return res.status(200).json({
      message: 'System setting updated successfully',
    })
  } catch (error) {
    console.error('Error updating system setting:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Dashboard Statistics Endpoints
app.get('/api/stats/system-health', async (req, res) => {
  try {
    // Check database connection
    const dbHealth = db.prepare('SELECT 1').get() ? 'good' : 'bad'

    // Check disk space
    const diskUsage = await checkDiskSpace()

    return res.status(200).json({
      status: dbHealth,
      diskUsage,
    })
  } catch (error) {
    console.error('Error checking system health:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.get('/api/stats/storage-usage', async (req, res) => {
  try {
    // Get total file size in uploads directory
    const uploadsDir = path.join(__dirname, 'uploads')
    const totalSize = await getDirectorySize(uploadsDir)

    // Get database size
    const dbSize = db
      .prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()')
      .get().size

    return res.status(200).json({
      uploads: totalSize,
      database: dbSize,
      total: totalSize + dbSize,
    })
  } catch (error) {
    console.error('Error getting storage usage:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.get('/api/stats/total-products', async (req, res) => {
  try {
    const count = db.prepare('SELECT COUNT(*) as count FROM products').get().count
    return res.status(200).json({ count })
  } catch (error) {
    console.error('Error getting total products:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.get('/api/stats/top-products', async (req, res) => {
  try {
    const { limit = 10 } = req.query

    // Primeiro verifica se as tabelas existem
    const tables = db
      .prepare(
        `
      SELECT name FROM sqlite_master
      WHERE type='table'
      AND name IN ('sale_items', 'products', 'categories')
    `,
      )
      .all()

    if (tables.length < 3) {
      return res.status(500).json({
        message: 'Tabelas necessárias não encontradas',
        error:
          'Tabelas faltando: ' +
          ['sale_items', 'products', 'categories']
            .filter((t) => !tables.some((x) => x.name === t))
            .join(', '),
      })
    }

    const products = db
      .prepare(
        `
      SELECT
        p.id,
        p.name,
        p.code,
        p.price,
        COALESCE(SUM(si.quantity), 0) as total_sold,
        COALESCE(SUM(si.quantity * si.price), 0) as total_revenue,
        c.name as category_name
      FROM products p
      LEFT JOIN sale_items si ON si.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      GROUP BY p.id
      HAVING total_sold > 0
      ORDER BY total_sold DESC
      LIMIT ?
    `,
      )
      .all(limit)

    if (products.length === 0) {
      return res.status(200).json({
        message: 'Nenhum produto com vendas registradas encontrado',
        products: [],
      })
    }

    return res.status(200).json(products)
  } catch (error) {
    console.error('Error getting top products:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.get('/api/stats/monthly-sales', async (req, res) => {
  try {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1)

    const sales = db
      .prepare(
        `
      SELECT
        SUM(total_amount) as total,
        strftime('%Y-%m-%d', created_at) as date
      FROM sales
      WHERE created_at >= ?
      GROUP BY strftime('%Y-%m-%d', created_at)
      ORDER BY date ASC
    `,
      )
      .all(startDate.toISOString())

    return res.status(200).json(sales)
  } catch (error) {
    console.error('Error getting monthly sales:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

app.get('/api/stats/yearly-sales', async (req, res) => {
  try {
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 1)

    const sales = db
      .prepare(
        `
      SELECT
        SUM(total_amount) as total,
        strftime('%Y-%m', created_at) as month
      FROM sales
      WHERE created_at >= ?
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
    `,
      )
      .all(startDate.toISOString())

    return res.status(200).json(sales)
  } catch (error) {
    console.error('Error getting yearly sales:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Total de usuários
app.get('/api/stats/total-users', async (req, res) => {
  try {
    const count = db.prepare('SELECT COUNT(*) as count FROM users').get().count
    return res.status(200).json({ count })
  } catch (error) {
    console.error('Error getting total users:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Sessões ativas
app.get('/api/stats/active-sessions', async (req, res) => {
  try {
    const activeThreshold = new Date(Date.now() - 30 * 60 * 1000) // 30 minutos
    const count = db
      .prepare(
        `
      SELECT COUNT(DISTINCT user_id) as count
      FROM user_activities
      WHERE created_at >= ?
    `,
      )
      .get(activeThreshold.toISOString()).count
    return res.status(200).json({ count })
  } catch (error) {
    console.error('Error getting active sessions:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Vendas diárias
app.get('/api/stats/daily-sales', async (req, res) => {
  try {
    const sales = db
      .prepare(
        `
      SELECT
        strftime('%Y-%m-%d', created_at) as date,
        SUM(total_amount) as total_sales
      FROM sales
      WHERE date = date('now')
      GROUP BY date
    `,
      )
      .get()
    return res
      .status(200)
      .json(sales || { date: new Date().toISOString().split('T')[0], total_sales: 0 })
  } catch (error) {
    console.error('Error getting daily sales:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})

// Helper functions
async function checkDiskSpace() {
  const checkDiskSpace = (await import('check-disk-space')).default
  return checkDiskSpace('/')
}

async function getDirectorySize(dir) {
  const { readdir, stat } = fs.promises
  const files = await readdir(dir)
  const stats = await Promise.all(files.map((file) => stat(path.join(dir, file))))
  return stats.reduce((sum, stat) => sum + stat.size, 0)
}

// Activity Tracking Endpoints
app.get('/api/activities', async (req, res) => {
  try {
    const { userId, limit = 100 } = req.query

    const query = userId
      ? 'SELECT * FROM user_activities WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
      : 'SELECT * FROM user_activities ORDER BY created_at DESC LIMIT ?'

    const params = userId ? [userId, limit] : [limit]

    const activities = db.prepare(query).all(...params)
    return res.status(200).json(activities)
  } catch (error) {
    console.error('Error getting activities:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
})
// Product endpoints
app.get('/api/products/filter', async (req, res) => {
  try {
    const { search } = req.query

    const products = db
      .prepare(
        `
      SELECT
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.name LIKE ? OR p.code LIKE ?
      ORDER BY p.name ASC
    `,
      )
      .all(`%${search}%`, `%${search}%`)

    res.status(200).json(products)
  } catch (error) {
    console.error('Error filtering products:', error)
    res.status(500).json({
      message: 'Failed to filter products',
      error: error.message,
    })
  }
})

// Sales endpoints
app.get('/api/sales', async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query

    let query = `
      SELECT
        s.*,
        e.name as employee_name,
        (SELECT SUM(si.quantity * si.price) FROM sale_items si WHERE si.sale_id = s.id) as total_amount,
        (SELECT GROUP_CONCAT(p.name, ', ')
         FROM sale_items si
         JOIN products p ON si.product_id = p.id
         WHERE si.sale_id = s.id) as product_names
      FROM sales s
      JOIN employees e ON s.employee_id = e.id
    `
    const params = []

    if (startDate && endDate) {
      query += ' WHERE s.created_at BETWEEN ? AND ?'
      params.push(startDate, endDate)
    }

    if (employeeId) {
      query += startDate && endDate ? ' AND ' : ' WHERE '
      query += 's.employee_id = ?'
      params.push(employeeId)
    }

    query += ' ORDER BY s.created_at DESC'

    const sales = db.prepare(query).all(...params)

    res.status(200).json(sales)
  } catch (error) {
    console.error('Error getting sales:', error)
    res.status(500).json({
      message: 'Failed to get sales',
      error: error.message,
    })
  }
})

app.get('/api/sales', async (req, res) => {
  try {
    const sales = db
      .prepare(
        `
      SELECT
        s.*,
        e.name as employee_name
      FROM sales s
      JOIN employees e ON s.employee_id = e.id
      ORDER BY s.created_at DESC
    `,
      )
      .all()

    res.status(200).json(sales)
  } catch (error) {
    console.error('Error getting sales:', error)
    res.status(500).json({
      message: 'Failed to get sales',
      error: error.message,
    })
  }
})

app.get('/api/sales/:id', async (req, res) => {
  try {
    const { id } = req.params

    const sale = db
      .prepare(
        `
      SELECT
        s.*,
        e.name as employee_name
      FROM sales s
      JOIN employees e ON s.employee_id = e.id
      WHERE s.id = ?
    `,
      )
      .get(id)

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' })
    }

    const items = db
      .prepare(
        `
      SELECT
        si.*,
        p.name as product_name,
        p.code as product_code
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `,
      )
      .all(id)

    res.status(200).json({
      ...sale,
      items,
    })
  } catch (error) {
    console.error('Error getting sale:', error)
    res.status(500).json({
      message: 'Failed to get sale',
      error: error.message,
    })
  }
})

app.get('/api/sales/report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const sales = db
      .prepare(
        `
      SELECT
        s.*,
        e.name as employee_name,
        SUM(si.quantity * si.price) as total_amount,
        COUNT(si.id) as total_items
      FROM sales s
      JOIN employees e ON s.employee_id = e.id
      JOIN sale_items si ON s.id = si.sale_id
      WHERE s.created_at BETWEEN ? AND ?
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `,
      )
      .all(startDate, endDate)

    res.status(200).json(sales)
  } catch (error) {
    console.error('Error getting sales report:', error)
    res.status(500).json({
      message: 'Failed to get sales report',
      error: error.message,
    })
  }
})

app.get('/api/sales/daily', async (req, res) => {
  try {
    const sales = db
      .prepare(
        `
      SELECT
        strftime('%Y-%m-%d', created_at) as date,
        SUM(total_amount) as total_sales
      FROM sales
      GROUP BY date
      ORDER BY date DESC
    `,
      )
      .all()
    res.json(sales)
  } catch (err) {
    console.error('Error fetching daily sales:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Endpoint para dashboard
app.get('/api/sales/top-products', async (req, res) => {
  try {
    const products = db
      .prepare(
        `
        SELECT
          p.id,
          p.name,
          p.code,
          p.price,
          SUM(si.quantity) as total_sold,
          SUM(si.quantity * si.price) as total_revenue,
          c.name as category_name
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        GROUP BY p.id
        ORDER BY total_revenue DESC
        LIMIT 10
      `,
      )
      .all()
    res.json(products)
  } catch (err) {
    console.error('Error fetching top products:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Sales endpoints
app.post('/api/sales', async (req, res) => {
  try {
    const { employee_id, items } = req.body

    // Start transaction
    const result = db.transaction(() => {
      // Verificar se o funcionário existe
      console.log('Employee ID recebido:', employee_id)
      const employee = db.prepare('SELECT id FROM employees WHERE id = ?').get(employee_id)
      console.log('Funcionário encontrado:', employee)
      if (!employee) {
        throw new Error(`Funcionário com ID ${employee_id} não encontrado`)
      }

      // Verificar estoque antes de processar a venda
      for (const item of items) {
        const product = db
          .prepare('SELECT quantity FROM products WHERE id = ?')
          .get(item.product_id)
        if (!product) {
          throw new Error(`Produto com ID ${item.product_id} não encontrado`)
        }
        if (product.quantity < item.quantity) {
          throw new Error(
            `Estoque insuficiente para o produto ${item.product_id}. Disponível: ${product.quantity}, Solicitado: ${item.quantity}`,
          )
        }
      }

      // Insert sale
      const saleStmt = db.prepare(`
        INSERT INTO sales (employee_id, total_amount)
        VALUES (?, ?)
      `)

      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

      const saleResult = saleStmt.run(employee_id, totalAmount)
      const saleId = saleResult.lastInsertRowid

      // Insert sale items and update stock
      const itemStmt = db.prepare(`
        INSERT INTO sale_items (sale_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `)

      const updateStockStmt = db.prepare(`
        UPDATE products
        SET quantity = quantity - ?
        WHERE id = ?
      `)

      const insertMovementStmt = db.prepare(`
        INSERT INTO stock_movements (product_id, quantity, movement_type, reason)
        VALUES (?, ?, ?, ?)
      `)

      items.forEach((item) => {
        // Insert sale item
        itemStmt.run(saleId, item.product_id, item.quantity, item.price)

        // Update product stock
        updateStockStmt.run(item.quantity, item.product_id)

        // Register stock movement
        insertMovementStmt.run(item.product_id, item.quantity, 'out', `Venda #${saleId}`)
      })

      return { saleId, totalAmount }
    })()

    res.status(201).json({
      message: 'Sale created successfully',
      saleId: result.saleId,
      totalAmount: result.totalAmount,
    })
  } catch (error) {
    console.error('Error creating sale:', error)
    res.status(500).json({
      message: 'Failed to create sale',
      error: error.message,
    })
  }
})

app.get('/api/sales', async (req, res) => {
  try {
    const sales = db
      .prepare(
        `
      SELECT
        s.*,
        e.name as employee_name
      FROM sales s
      JOIN employees e ON s.employee_id = e.id
      ORDER BY s.created_at DESC
    `,
      )
      .all()

    res.status(200).json(sales)
  } catch (error) {
    console.error('Error getting sales:', error)
    res.status(500).json({
      message: 'Failed to get sales',
      error: error.message,
    })
  }
})

app.get('/api/offline-subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params
    const asign = await db.prepare('SELECT * FROM offline_subscription WHERE id = ?').get(id)
    res.status(200).json(asign)
  } catch (error) {
    console.log(error)
  }
})

app.get('/api/subscriptions/:id', async (req, res) => {
  try {
    console.log('Server teste=', req.body)
    const { id } = req.params
    const subs = await db.prepare('SELECT * FROM offline_subscriptions WHERE user_id = ?').get(id)
    console.log('RETORNO SERVER = ', res.status(200).json(subs))
    res.status(200).json(subs)
  } catch (error) {
    console.log(error)
  }
})

app.get('/api/sales/:id', async (req, res) => {
  try {
    const { id } = req.params

    const sale = db
      .prepare(
        `
      SELECT
        s.*,
        e.name as employee_name
      FROM sales s
      JOIN employees e ON s.employee_id = e.id
      WHERE s.id = ?
    `,
      )
      .get(id)

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' })
    }

    const items = db
      .prepare(
        `
      SELECT
        si.*,
        p.name as product_name,
        p.code as product_code
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `,
      )
      .all(id)

    res.status(200).json({
      ...sale,
      items,
    })
  } catch (error) {
    console.error('Error getting sale:', error)
    res.status(500).json({
      message: 'Failed to get sale',
      error: error.message,
    })
  }
})

// Upload product image endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Nenhum arquivo enviado',
        error: 'Arquivo ausente',
      })
    }

    const imageUrl = `${BASE_URL}/uploads/${req.file.filename}`

    return res.status(200).json({
      message: 'Upload realizado com sucesso',
      url: imageUrl,
    })
  } catch (error) {
    console.error('Erro no upload:', error)
    return res.status(500).json({
      message: 'Falha no upload da imagem',
      error: error.message,
    })
  }
})

// Configure reports routes
app.use('/api/reports', reportsRouter)

// Activation status endpoint
app.get('/api/activation/status', async (req, res) => {
  try {
    const activationFile = path.join(process.cwd(), 'expiration.json')

    if (!fs.existsSync(activationFile)) {
      return res.status(200).json({
        active: false,
        message: 'Sistema não ativado',
      })
    }

    console.log('Lendo arquivo de ativação:', activationFile)
    const encryptedData = fs.readFileSync(activationFile, 'utf8')
    console.log('Dados criptografados:', encryptedData)

    // Verificar se as variáveis de ambiente estão definidas
    if (!process.env.VUE_APP_CRYPTO_SECRET || !process.env.VUE_APP_CRYPTO_IV) {
      return res.status(500).json({
        message: 'Variáveis de criptografia não configuradas',
      })
    }

    let decrypted
    try {
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(process.env.VUE_APP_CRYPTO_SECRET, 'hex'),
        Buffer.from(process.env.VUE_APP_CRYPTO_IV, 'hex'),
      )

      decrypted = decipher.update(encryptedData, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
    } catch (error) {
      console.error('Erro ao decriptar dados:', error)
      return res.status(500).json({
        message: 'Erro ao decriptar dados de ativação',
        error: error.message,
      })
    }
    console.log('Dados decriptados:', decrypted)

    const data = JSON.parse(decrypted)
    console.log('Dados parseados:', data)

    if (!data || !data.expiration) {
      return res.status(200).json({
        active: false,
        message: 'Arquivo de ativação inválido',
      })
    }

    const expirationDate = new Date(data.expiration)
    const active = new Date() < expirationDate

    return res.status(200).json({
      active,
      expiration: data.expiration,
      plan: data.plan,
      activationDate: data.activationDate,
      status: active ? 'active' : 'expired',
      testPeriod: data.testPeriod,
    })
  } catch (error) {
    console.error('Error checking activation status:', error)
    return res.status(500).json({
      message: 'Erro ao verificar status de ativação',
      error: error.message,
    })
  }
})

// Serve uploaded files
app.use('/uploads', express.static('uploads'))
console.log('Static files configured')

// Error handling middleware
app.use((err, req, res) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString(),
  })

  // Handle specific error types
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      message: 'Invalid JSON',
      error: err.message,
    })
  }

  if (err.code === 'SQLITE_ERROR') {
    return res.status(500).json({
      message: 'Database error',
      error: err.message,
      code: err.code,
    })
  }

  // Default error handler
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
})

// 404 handler
app.use((req, res) => {
  console.error('404 Not Found:', {
    url: req.originalUrl,
    method: req.method,
  })
  res.status(404).json({
    message: 'Endpoint not found',
  })
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api`)
})
