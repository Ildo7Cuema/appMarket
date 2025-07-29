import db from '../services/database.js'

export function syncUsersWithEmployees() {
  try {
    console.log('Sincronizando usuários com funcionários...')

    // Buscar todos os usuários
    const users = db.prepare('SELECT id, username, email, role FROM users').all()
    console.log('Usuários encontrados:', users)

    users.forEach((user) => {
      if (!user.email) {
        console.log(`Usuário ${user.username} não tem email, pulando...`)
        return
      }

      // Verificar se já existe um funcionário com este email
      const existingEmployee = db
        .prepare('SELECT id FROM employees WHERE email = ?')
        .get(user.email)

      if (existingEmployee) {
        console.log(`Funcionário já existe para ${user.username} (${user.email})`)
        return
      }

      // Criar funcionário para o usuário
      console.log(`Criando funcionário para ${user.username} (${user.email})`)

      const stmt = db.prepare(`
        INSERT INTO employees (name, email, phone, address)
        VALUES (?, ?, ?, ?)
      `)

      const result = stmt.run(
        user.username, // name
        user.email, // email
        '', // phone (vazio por padrão)
        '', // address (vazio por padrão)
      )

      console.log(`Funcionário criado com ID: ${result.lastInsertRowid}`)
    })

    console.log('Sincronização concluída!')
  } catch (error) {
    console.error('Erro na sincronização:', error)
  }
}

// Executar imediatamente quando importado
syncUsersWithEmployees()
