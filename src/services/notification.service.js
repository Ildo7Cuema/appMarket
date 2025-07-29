import { useQuasar } from 'quasar'

class NotificationService {
  constructor() {
    this.notifications = []
    this.listeners = []
    this.isConnected = false
  }

  // Inicializar serviço
  init() {
    this.startPolling()
    this.setupEventListeners()
  }

  // Configurar listeners de eventos
  setupEventListeners() {
    // Listener para mudanças de status de faturas
    window.addEventListener('storage', (event) => {
      if (event.key === 'proforma_status_change') {
        this.handleStatusChange(JSON.parse(event.newValue))
      }
    })

    // Listener para novas faturas
    window.addEventListener('storage', (event) => {
      if (event.key === 'new_proforma_invoice') {
        this.handleNewInvoice(JSON.parse(event.newValue))
      }
    })
  }

  // Polling para verificar mudanças
  startPolling() {
    setInterval(() => {
      this.checkForUpdates()
    }, 30000) // Verificar a cada 30 segundos
  }

  // Verificar atualizações
  async checkForUpdates() {
    try {
      // Em produção, aqui seria uma chamada para API
      // const response = await api.get('/api/notifications/check')
      // this.processNotifications(response.data)
    } catch (error) {
      console.error('Erro ao verificar notificações:', error)
    }
  }

  // Processar notificações
  processNotifications(notifications) {
    notifications.forEach((notification) => {
      this.showNotification(notification)
    })
  }

  // Mostrar notificação
  showNotification(notification) {
    const $q = useQuasar()

    $q.notify({
      type: notification.type || 'info',
      message: notification.message,
      position: 'top-right',
      timeout: notification.timeout || 5000,
      actions: notification.actions || [],
      icon: notification.icon || 'info',
    })
  }

  // Notificar mudança de status
  notifyStatusChange(invoice, oldStatus, newStatus) {
    const statusLabels = {
      draft: 'Rascunho',
      sent: 'Enviada',
      approved: 'Aprovada',
      rejected: 'Rejeitada',
      expired: 'Expirada',
    }

    const message = `Fatura ${invoice.invoice_number} mudou de status de "${statusLabels[oldStatus]}" para "${statusLabels[newStatus]}"`

    this.showNotification({
      type: 'info',
      message,
      icon: 'update',
      timeout: 8000,
    })

    // Salvar no localStorage para sincronização
    localStorage.setItem(
      'proforma_status_change',
      JSON.stringify({
        invoice,
        oldStatus,
        newStatus,
        timestamp: new Date().toISOString(),
      }),
    )
  }

  // Notificar nova fatura
  notifyNewInvoice(invoice) {
    const message = `Nova fatura pró-forma criada: ${invoice.invoice_number}`

    this.showNotification({
      type: 'positive',
      message,
      icon: 'add_circle',
      timeout: 6000,
    })

    // Salvar no localStorage para sincronização
    localStorage.setItem(
      'new_proforma_invoice',
      JSON.stringify({
        invoice,
        timestamp: new Date().toISOString(),
      }),
    )
  }

  // Notificar fatura vencendo
  notifyExpiringInvoice(invoice) {
    const message = `Fatura ${invoice.invoice_number} vence em ${invoice.daysUntilExpiry} dias`

    this.showNotification({
      type: 'warning',
      message,
      icon: 'schedule',
      timeout: 10000,
      actions: [{ label: 'Ver', color: 'white', handler: () => this.viewInvoice(invoice.id) }],
    })
  }

  // Notificar fatura expirada
  notifyExpiredInvoice(invoice) {
    const message = `Fatura ${invoice.invoice_number} expirou`

    this.showNotification({
      type: 'negative',
      message,
      icon: 'error',
      timeout: 10000,
      actions: [{ label: 'Renovar', color: 'white', handler: () => this.renewInvoice(invoice.id) }],
    })
  }

  // Notificar erro
  notifyError(error, context = '') {
    const message = context ? `${context}: ${error.message}` : error.message

    this.showNotification({
      type: 'negative',
      message,
      icon: 'error',
      timeout: 8000,
    })
  }

  // Notificar sucesso
  notifySuccess(message, context = '') {
    const fullMessage = context ? `${context}: ${message}` : message

    this.showNotification({
      type: 'positive',
      message: fullMessage,
      icon: 'check_circle',
      timeout: 5000,
    })
  }

  // Notificar informação
  notifyInfo(message, context = '') {
    const fullMessage = context ? `${context}: ${message}` : message

    this.showNotification({
      type: 'info',
      message: fullMessage,
      icon: 'info',
      timeout: 6000,
    })
  }

  // Notificar aviso
  notifyWarning(message, context = '') {
    const fullMessage = context ? `${context}: ${message}` : message

    this.showNotification({
      type: 'warning',
      message: fullMessage,
      icon: 'warning',
      timeout: 7000,
    })
  }

  // Handlers para eventos
  handleStatusChange(data) {
    this.notifyStatusChange(data.invoice, data.oldStatus, data.newStatus)
  }

  handleNewInvoice(data) {
    this.notifyNewInvoice(data.invoice)
  }

  // Ações das notificações
  viewInvoice(invoiceId) {
    // Navegar para a fatura
    window.location.href = `/proforma-invoices?id=${invoiceId}`
  }

  renewInvoice(invoiceId) {
    // Implementar renovação de fatura
    console.log('Renovando fatura:', invoiceId)
  }

  // Verificar faturas vencendo
  checkExpiringInvoices(invoices) {
    const today = new Date()

    invoices.forEach((invoice) => {
      if (invoice.due_date) {
        const dueDate = new Date(invoice.due_date)
        const daysUntilExpiry = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          this.notifyExpiringInvoice({
            ...invoice,
            daysUntilExpiry,
          })
        } else if (daysUntilExpiry <= 0 && invoice.status !== 'expired') {
          this.notifyExpiredInvoice(invoice)
        }
      }
    })
  }

  // Limpar notificações antigas
  clearOldNotifications() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    this.notifications = this.notifications.filter(
      (notification) => new Date(notification.timestamp) > oneDayAgo,
    )
  }

  // Obter notificações não lidas
  getUnreadNotifications() {
    return this.notifications.filter((notification) => !notification.read)
  }

  // Marcar notificação como lida
  markAsRead(notificationId) {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  // Marcar todas como lidas
  markAllAsRead() {
    this.notifications.forEach((notification) => {
      notification.read = true
    })
  }

  // Destruir serviço
  destroy() {
    this.listeners.forEach((listener) => {
      window.removeEventListener(listener.event, listener.handler)
    })
    this.listeners = []
  }
}

export default new NotificationService()
