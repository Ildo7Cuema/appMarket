import express from 'express'

const router = express.Router()

// Middleware para verificar se o banco de dados está disponível
const checkDatabase = (req, res, next) => {
  if (!req.app.locals.db) {
    return res.status(500).json({ message: 'Database not available' })
  }
  req.db = req.app.locals.db
  next()
}

// Aplicar middleware em todas as rotas
router.use(checkDatabase)

// GET /api/proforma-invoices - Listar todas as faturas pró-forma
router.get('/', async (req, res) => {
  try {
    console.log('Recebida requisição para listar faturas pró-forma')

    const { search, status, dateFrom, dateTo, page = 1, limit = 10 } = req.query

    let query = `
      SELECT
        pf.*,
        u.username as created_by_name
      FROM proforma_invoices pf
      LEFT JOIN users u ON pf.created_by = u.id
      WHERE 1=1
    `

    const params = []

    if (search) {
      query += ` AND (pf.invoice_number LIKE ? OR pf.client_name LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }

    if (status) {
      query += ` AND pf.status = ?`
      params.push(status)
    }

    if (dateFrom) {
      query += ` AND pf.invoice_date >= ?`
      params.push(dateFrom)
    }

    if (dateTo) {
      query += ` AND pf.invoice_date <= ?`
      params.push(dateTo)
    }

    query += ` ORDER BY pf.created_at DESC`

    // Paginação
    const offset = (page - 1) * limit
    query += ` LIMIT ? OFFSET ?`
    params.push(parseInt(limit), offset)

    console.log('Executando query:', query)
    console.log('Parâmetros:', params)

    const invoices = req.db.prepare(query).all(...params)
    console.log('Faturas encontradas:', invoices.length)

    // Buscar itens para cada fatura
    const invoicesWithItems = invoices.map((invoice) => {
      const items = req.db
        .prepare('SELECT * FROM proforma_invoice_items WHERE invoice_id = ? ORDER BY id')
        .all(invoice.id)
      return {
        ...invoice,
        items,
      }
    })

    // Contar total para paginação
    let countQuery = `
      SELECT COUNT(*) as total
      FROM proforma_invoices pf
      WHERE 1=1
    `

    const countParams = []

    if (search) {
      countQuery += ` AND (pf.invoice_number LIKE ? OR pf.client_name LIKE ?)`
      countParams.push(`%${search}%`, `%${search}%`)
    }

    if (status) {
      countQuery += ` AND pf.status = ?`
      countParams.push(status)
    }

    if (dateFrom) {
      countQuery += ` AND pf.invoice_date >= ?`
      countParams.push(dateFrom)
    }

    if (dateTo) {
      countQuery += ` AND pf.invoice_date <= ?`
      countParams.push(dateTo)
    }

    const totalResult = req.db.prepare(countQuery).get(...countParams)
    const total = totalResult.total

    console.log('Total de faturas:', total)

    res.json({
      invoices: invoicesWithItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar faturas pró-forma:', error)
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message })
  }
})

// GET /api/proforma-invoices/:id - Buscar fatura por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const invoice = req.db
      .prepare(
        `
      SELECT
        pf.*,
        u.name as created_by_name
      FROM proforma_invoices pf
      LEFT JOIN users u ON pf.created_by = u.id
      WHERE pf.id = ?
    `,
      )
      .get(id)

    if (!invoice) {
      return res.status(404).json({ message: 'Fatura não encontrada' })
    }

    // Buscar itens da fatura
    const items = req.db
      .prepare(
        `
      SELECT * FROM proforma_invoice_items
      WHERE invoice_id = ?
      ORDER BY id
    `,
      )
      .all(id)

    res.json({
      ...invoice,
      items,
    })
  } catch (error) {
    console.error('Erro ao buscar fatura:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// POST /api/proforma-invoices - Criar nova fatura
router.post('/', async (req, res) => {
  try {
    const {
      client_name,
      client_email,
      client_phone,
      client_address,
      client_nif,
      client_nuit,
      invoice_number,
      invoice_date,
      due_date,
      status,
      notes,
      payment_conditions,
      emitter_name,
      emitter_title,
      emitter_company,
      items,
      total_amount,
    } = req.body

    // Validar dados obrigatórios
    if (!client_name || !invoice_number || !items || items.length === 0) {
      return res.status(400).json({
        message: 'Nome do cliente, número da fatura e itens são obrigatórios',
      })
    }

    // Inserir fatura
    let result
    try {
      result = req.db
        .prepare(
          `
        INSERT INTO proforma_invoices (
          client_name, client_email, client_phone, client_address,
          client_nif, client_nuit, invoice_number, invoice_date,
          due_date, status, notes, payment_conditions, emitter_name, emitter_title, emitter_company, total_amount, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        )
        .run(
          client_name || null,
          client_email || null,
          client_phone || null,
          client_address || null,
          client_nif || null,
          client_nuit || null,
          invoice_number,
          invoice_date,
          due_date || null,
          status || 'draft',
          notes || null,
          payment_conditions || null,
          emitter_name || 'Eng. Ildo Cuema',
          emitter_title || 'Director Executivo',
          emitter_company || 'E-Tech Soluções Digitais, Lda',
          total_amount || 0,
          req.user?.id || 6,
        )
    } catch (dbError) {
      console.error('Erro na query de inserção:', dbError)
      throw dbError
    }

    const invoiceId = result.lastInsertRowid

    // Inserir itens
    for (const item of items) {
      req.db
        .prepare(
          `
        INSERT INTO proforma_invoice_items (
          invoice_id, description, quantity, price, total
        ) VALUES (?, ?, ?, ?, ?)
      `,
        )
        .run(invoiceId, item.description, item.quantity, item.price, item.quantity * item.price)
    }

    // Buscar fatura criada
    const newInvoice = req.db
      .prepare(
        `
      SELECT * FROM proforma_invoices WHERE id = ?
    `,
      )
      .get(invoiceId)

    res.status(201).json(newInvoice)
  } catch (error) {
    console.error('Erro ao criar fatura:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// PUT /api/proforma-invoices/:id - Atualizar fatura
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      client_name,
      client_email,
      client_phone,
      client_address,
      client_nif,
      client_nuit,
      invoice_number,
      invoice_date,
      due_date,
      status,
      notes,
      payment_conditions,
      emitter_name,
      emitter_title,
      emitter_company,
      items,
      total_amount,
    } = req.body

    // Verificar se a fatura existe
    const existingInvoice = req.db
      .prepare(
        `
      SELECT * FROM proforma_invoices WHERE id = ?
    `,
      )
      .get(id)

    if (!existingInvoice) {
      return res.status(404).json({ message: 'Fatura não encontrada' })
    }

    // Atualizar fatura
    req.db
      .prepare(
        `
      UPDATE proforma_invoices SET
        client_name = ?, client_email = ?, client_phone = ?, client_address = ?,
        client_nif = ?, client_nuit = ?, invoice_number = ?, invoice_date = ?,
        due_date = ?, status = ?, notes = ?, payment_conditions = ?, emitter_name = ?, emitter_title = ?, emitter_company = ?, total_amount = ?, updated_at = datetime('now')
      WHERE id = ?
    `,
      )
      .run(
        client_name,
        client_email,
        client_phone,
        client_address,
        client_nif,
        client_nuit,
        invoice_number,
        invoice_date,
        due_date,
        status,
        notes,
        payment_conditions,
        emitter_name || 'Eng. Ildo Cuema',
        emitter_title || 'Director Executivo',
        emitter_company || 'E-Tech Soluções Digitais, Lda',
        total_amount,
        id,
      )

    // Remover itens antigos
    req.db
      .prepare(
        `
      DELETE FROM proforma_invoice_items WHERE invoice_id = ?
    `,
      )
      .run(id)

    // Inserir novos itens
    for (const item of items) {
      req.db
        .prepare(
          `
        INSERT INTO proforma_invoice_items (
          invoice_id, description, quantity, price, total
        ) VALUES (?, ?, ?, ?, ?)
      `,
        )
        .run(id, item.description, item.quantity, item.price, item.quantity * item.price)
    }

    // Buscar fatura atualizada
    const updatedInvoice = req.db
      .prepare(
        `
      SELECT * FROM proforma_invoices WHERE id = ?
    `,
      )
      .get(id)

    res.json(updatedInvoice)
  } catch (error) {
    console.error('Erro ao atualizar fatura:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// DELETE /api/proforma-invoices/:id - Excluir fatura
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Verificar se a fatura existe
    const invoice = req.db
      .prepare(
        `
      SELECT * FROM proforma_invoices WHERE id = ?
    `,
      )
      .get(id)

    if (!invoice) {
      return res.status(404).json({ message: 'Fatura não encontrada' })
    }

    // Excluir itens primeiro
    req.db
      .prepare(
        `
      DELETE FROM proforma_invoice_items WHERE invoice_id = ?
    `,
      )
      .run(id)

    // Excluir fatura
    req.db
      .prepare(
        `
      DELETE FROM proforma_invoices WHERE id = ?
    `,
      )
      .run(id)

    res.json({ message: 'Fatura excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir fatura:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// POST /api/proforma-invoices/:id/duplicate - Duplicar fatura
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params

    // Buscar fatura original
    const originalInvoice = req.db
      .prepare(
        `
      SELECT * FROM proforma_invoices WHERE id = ?
    `,
      )
      .get(id)

    if (!originalInvoice) {
      return res.status(404).json({ message: 'Fatura não encontrada' })
    }

    // Buscar itens da fatura original
    const originalItems = req.db
      .prepare(
        `
      SELECT * FROM proforma_invoice_items WHERE invoice_id = ?
    `,
      )
      .all(id)

    // Gerar novo número de fatura
    const newInvoiceNumber = `PF${Date.now()}`

    // Criar nova fatura
    const result = req.db
      .prepare(
        `
      INSERT INTO proforma_invoices (
        client_name, client_email, client_phone, client_address,
        client_nif, client_nuit, invoice_number, invoice_date,
        due_date, status, notes, total_amount, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `,
      )
      .run(
        originalInvoice.client_name,
        originalInvoice.client_email,
        originalInvoice.client_phone,
        originalInvoice.client_address,
        originalInvoice.client_nif,
        originalInvoice.client_nuit,
        newInvoiceNumber,
        new Date().toISOString().split('T')[0],
        originalInvoice.due_date,
        'draft',
        originalInvoice.notes,
        originalInvoice.total_amount,
        req.user?.id || 1,
      )

    const newInvoiceId = result.lastInsertRowid

    // Duplicar itens
    for (const item of originalItems) {
      req.db
        .prepare(
          `
        INSERT INTO proforma_invoice_items (
          invoice_id, description, quantity, price, total
        ) VALUES (?, ?, ?, ?, ?)
      `,
        )
        .run(newInvoiceId, item.description, item.quantity, item.price, item.total)
    }

    // Buscar nova fatura
    const newInvoice = req.db
      .prepare(
        `
      SELECT * FROM proforma_invoices WHERE id = ?
    `,
      )
      .get(newInvoiceId)

    res.status(201).json(newInvoice)
  } catch (error) {
    console.error('Erro ao duplicar fatura:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// PUT /api/proforma-invoices/:id/approve - Aprovar fatura
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params

    const result = req.db
      .prepare(
        `
      UPDATE proforma_invoices
      SET status = 'approved', updated_at = datetime('now')
      WHERE id = ?
    `,
      )
      .run(id)

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Fatura não encontrada' })
    }

    const updatedInvoice = req.db
      .prepare(
        `
      SELECT * FROM proforma_invoices WHERE id = ?
    `,
      )
      .get(id)

    res.json(updatedInvoice)
  } catch (error) {
    console.error('Erro ao aprovar fatura:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// PUT /api/proforma-invoices/:id/reject - Rejeitar fatura
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const result = req.db
      .prepare(
        `
      UPDATE proforma_invoices
      SET status = 'rejected', notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `,
      )
      .run(reason, id)

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Fatura não encontrada' })
    }

    const updatedInvoice = req.db
      .prepare(
        `
      SELECT * FROM proforma_invoices WHERE id = ?
    `,
      )
      .get(id)

    res.json(updatedInvoice)
  } catch (error) {
    console.error('Erro ao rejeitar fatura:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// GET /api/proforma-invoices/statistics - Estatísticas
router.get('/statistics', async (req, res) => {
  try {
    const stats = req.db
      .prepare(
        `
      SELECT
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_count,
        SUM(total_amount) as total_amount,
        AVG(total_amount) as avg_amount
      FROM proforma_invoices
    `,
      )
      .get()

    res.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// GET /api/proforma-invoices/export - Exportar relatório
router.get('/export', async (req, res) => {
  try {
    const { format = 'csv', dateFrom, dateTo } = req.query

    let query = `
      SELECT
        pf.invoice_number,
        pf.client_name,
        pf.client_email,
        pf.invoice_date,
        pf.due_date,
        pf.status,
        pf.total_amount,
        pf.created_at
      FROM proforma_invoices pf
      WHERE 1=1
    `

    const params = []

    if (dateFrom) {
      query += ` AND pf.invoice_date >= ?`
      params.push(dateFrom)
    }

    if (dateTo) {
      query += ` AND pf.invoice_date <= ?`
      params.push(dateTo)
    }

    query += ` ORDER BY pf.created_at DESC`

    const invoices = req.db.prepare(query).all(...params)

    if (format === 'csv') {
      const csvHeader = 'Número,Cliente,Email,Data Fatura,Vencimento,Status,Total,Data Criação\n'
      const csvData = invoices
        .map(
          (invoice) =>
            `"${invoice.invoice_number}","${invoice.client_name}","${invoice.client_email}","${invoice.invoice_date}","${invoice.due_date}","${invoice.status}","${invoice.total_amount}","${invoice.created_at}"`,
        )
        .join('\n')

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=proforma_invoices.csv')
      res.send(csvHeader + csvData)
    } else {
      res.json(invoices)
    }
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

export default router
