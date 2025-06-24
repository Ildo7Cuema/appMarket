import systemService from './system.service'

class PrinterService {
  constructor() {
    this.printer = null
    this.settings = null
  }

  async initialize() {
    const set = await systemService.getSettings()
    this.settings = Object.assign({}, set[0]) // Converte o primeiro elemento em objeto puro
    console.log(this.settings)

    try {
      // Get company settings for invoice header
      this.companySettings = await systemService.getSettings()
    } catch (error) {
      console.warn('Failed to get system settings, using defaults:', error)
      // Provide default values if settings can't be retrieved
      this.settings = {
        companyName: 'Minha Empresa',
        address: 'Endereço Padrão',
        phone: '+244 900 000 000',
        taxId: '000000000',
        nif: '000000000',
      }
    }

    try {
      // Initialize printer connection
      this.printer = await this.connectToPrinter()
    } catch (error) {
      console.error('Failed to initialize printer:', error)
      throw error
    }
  }

  async connectToPrinter() {
    // TODO: Implement printer connection logic
    // This should handle USB/Bluetooth/Network connections
    return new Promise((resolve) => {
      // Mock implementation for now
      resolve({
        write: (data) => console.log('Printing:', data),
        close: () => console.log('Printer connection closed'),
      })
    })
  }

  async printInvoice(sale) {
    if (!this.printer) {
      await this.initialize()
    }

    const invoiceContent = this.generateInvoiceContent(sale)
    this.printer.write(invoiceContent)
  }

  generateInvoiceContent(sale) {
    if (!sale) {
      throw new Error('Sale object is required')
    }

    const { company_name, company_address, company_phone, company_email, company_nif } =
      this.settings
    const { items = [], paymentMethod = 'cash', paymentAmount = 0 } = sale || {}

    // Gerar número da fatura
    const date = new Date()
    const invoiceNumber = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(3, '0')}`

    // Definir larguras fixas para cada coluna
    const colWidths = {
      description: 20,
      basePrice: 10,
      taxPrice: 10,
      quantity: 5,
      total: 10,
    }

    // ESC/POS commands
    const commands = [
      '\x1B\x40', // Inicializar impressora
      '\x1B\x21\x30', // Texto grande
      `${company_name}\n`,
      '\x1B\x21\x00', // Texto normal
      `${company_address}\n`,
      `Tel: ${company_phone}\n`,
      company_email ? `Email: ${company_email}\n` : '',
      `NIF: ${company_nif}\n`,
      '\n',
      '\x1B\x45\x01', // Negrito
      '\x1B\x61\x01', // Centro
      'FATURA\n',
      '\x1B\x45\x00', // Normal
      '\x1B\x61\x00', // Esquerda
      `Nº: ${invoiceNumber}\n`,
      `Data: ${date.toLocaleDateString('pt-AO')}\n`,
      `Hora: ${date.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}\n`,
      '----------------------------------------------------\n',
    ]

    // Adicionar cabeçalho da tabela com alinhamento correto
    commands.push(
      `${'Descrição'.padEnd(colWidths.description)}${'Preço Base'.padStart(colWidths.basePrice)}${'IVA(14%)'.padStart(colWidths.taxPrice)}${'Qt'.padStart(colWidths.quantity)}${'Total'.padStart(colWidths.total)}\n`,
      '-------------------------------------------------------\n',
    )

    // Adicionar itens
    if (items.length > 0) {
      items.forEach((item) => {
        if (!item) return

        const name = (item.name || 'Item sem nome')
          .substring(0, colWidths.description)
          .padEnd(colWidths.description)
        const priceBase = (item.price || 0).toFixed(2).padStart(colWidths.basePrice)
        const priceTax = ((item.price_with_tax || item.price || 0) - (item.price || 0))
          .toFixed(2)
          .padStart(colWidths.taxPrice)
        const quantity = (item.quantity || 0).toString().padStart(colWidths.quantity)
        const total = ((item.quantity || 0) * (item.price_with_tax || item.price || 0))
          .toFixed(2)
          .padStart(colWidths.total)

        commands.push(`${name}${priceBase}${priceTax}${quantity}${total}\n`)

        // Adicionar segunda linha se o nome for muito grande
        if (item.name && item.name.length > colWidths.description) {
          commands.push(
            `${item.name.substring(colWidths.description).padEnd(colWidths.description)}\n`,
          )
        }
      })
    } else {
      commands.push('Nenhum item na venda\n')
    }

    // Calcular subtotal
    const subtotal = items.reduce((sum, item) => sum + (item?.quantity || 0) * (item.price || 0), 0)
    const totaTributado = items.reduce(
      (sum, item) => sum + (item?.quantity || 0) * (item?.price_with_tax || item.price || 0),
      0,
    )
    console.log(sale.paymentAmount)
    const change = Math.max(0, (sale.paymentAmount || 0) - totaTributado)
    const lineWidth = 42
    // Adicionar totais e forma de pagamento
    commands.push(
      '-------------------------------------------------------\n',
      `Subtotal:`.padEnd(20) +
        new Intl.NumberFormat('pt-AO', {
          style: 'currency',
          currency: 'AOA',
        })
          .format(subtotal)
          .padStart(lineWidth - 7) +
        '\n',
      `Total:`.padEnd(20) +
        new Intl.NumberFormat('pt-AO', {
          style: 'currency',
          currency: 'AOA',
        })
          .format(totaTributado)
          .padStart(lineWidth - 7) +
        '\n\n',
      `Valor recebido`.padEnd(20) +
        new Intl.NumberFormat('pt-AO', {
          style: 'currency',
          currency: 'AOA',
        })
          .format(paymentAmount)
          .padStart(lineWidth - 7) +
        '\n',
      `Troco`.padEnd(20) +
        new Intl.NumberFormat('pt-AO', {
          style: 'currency',
          currency: 'AOA',
        })
          .format(change)
          .padStart(lineWidth - 7) +
        '\n\n',
      `Forma de Pagamento:${this.translatePaymentMethod(paymentMethod).padStart(lineWidth - 32)}\n`,
      '\x1B\x61\x01' + '\n\n', // Centralizar
      '\x1B\x61\x01', // Comando ESC/POS para centralizar
      'Obrigado pela sua compra!\n',
      '\x1B\x45\x01', // Ativa o negrito
      'VOLTE SEMPRE\n',
      '\x1B\x45\x00', // Desativa o negrito
      '\x1B\x61\x00', // Retorna o alinhamento à esquerda para o restante do recibo
      '\x1B\x69', // Cortar papel
    )

    return commands.join('')
  }

  translatePaymentMethod(method) {
    const translations = {
      cash: 'Dinheiro',
      card: 'Cartão',
      transfer: 'Transferência',
      check: 'Cheque',
    }
    return translations[method] || method
  }
}

export default new PrinterService()
