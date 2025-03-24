import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

let db
try {
  console.log('Attempting to connect to database...')

  // Ensure database directory exists
  const dbDir = './server'
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  // Create database with proper permissions
  db = new Database(path.join('server', 'appmarket.db'), {
    verbose: console.log,
    fileMustExist: false,
  })

  console.log('Database connection successful')
} catch (err) {
  console.error('Database connection error:', err)
  throw err
}

// Create users table
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT NOT NULL,
    isActive INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
).run()

// Create settings table
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

// Create initial admin user if none exists
const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin')
if (!adminExists) {
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync('IldoAdmin123!', salt)

  db.prepare(
    `
    INSERT INTO users (username, password, email, role, isActive)
    VALUES (?, ?, ?, ?, ?)
  `,
  ).run('IldoAdmin', hash, 'ildocuema@gmail.com', 'admin', 1)
}

export default db
