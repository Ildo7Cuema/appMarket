import bcrypt from 'bcrypt'
import db from '../services/database.js'

export function createAdmin() {
  const username = 'IldoAdmin'
  const password = 'IldoAdmin123!'
  const email = 'ildocuema@gmail.com'
  const role = 'admin'
  const isActive = 1

  // Check if admin already exists
  const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get(username)

  if (adminExists) {
    console.log('Admin user already exists, skipping creation')
    return
  }

  try {
    console.log('Creating admin user...')

    // Hash password
    const saltRounds = 10
    const hashedPassword = bcrypt.hashSync(password, saltRounds)

    // Insert user into database
    const stmt = db.prepare(
      'INSERT INTO users (username, password, role, email, isActive, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
    )
    const result = stmt.run(username, hashedPassword, role, email, isActive)

    console.log(`Admin created successfully with ID: ${result.lastInsertRowid}`)
  } catch (error) {
    console.error('Error creating admin:', error.message)
    process.exit(1)
  }
}

// Execute immediately when imported
createAdmin()
