import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

class ProFormaService {
  // Buscar todas as faturas pró-forma
  async getInvoices(params = {}) {
    try {
      const response = await axios.get(`${API_URL}/proforma-invoices`, { params })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar faturas pró-forma:', error)
      throw error
    }
  }

  // Buscar fatura por ID
  async getInvoice(id) {
    try {
      const response = await axios.get(`${API_URL}/proforma-invoices/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar fatura:', error)
      throw error
    }
  }

  // Criar nova fatura
  async createInvoice(invoiceData) {
    try {
      const response = await axios.post(`${API_URL}/proforma-invoices`, invoiceData)
      return response.data
    } catch (error) {
      console.error('Erro ao criar fatura:', error)
      throw error
    }
  }

  // Atualizar fatura
  async updateInvoice(id, invoiceData) {
    try {
      const response = await axios.put(`${API_URL}/proforma-invoices/${id}`, invoiceData)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar fatura:', error)
      throw error
    }
  }

  // Excluir fatura
  async deleteInvoice(id) {
    try {
      const response = await axios.delete(`${API_URL}/proforma-invoices/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao excluir fatura:', error)
      throw error
    }
  }

  // Duplicar fatura
  async duplicateInvoice(id) {
    try {
      const response = await axios.post(`${API_URL}/proforma-invoices/${id}/duplicate`)
      return response.data
    } catch (error) {
      console.error('Erro ao duplicar fatura:', error)
      throw error
    }
  }

  // Enviar fatura por email
  async sendInvoice(id, emailData) {
    try {
      const response = await axios.post(`${API_URL}/proforma-invoices/${id}/send`, emailData)
      return response.data
    } catch (error) {
      console.error('Erro ao enviar fatura:', error)
      throw error
    }
  }

  // Gerar PDF
  async generatePDF(id) {
    try {
      const response = await axios.get(`${API_URL}/proforma-invoices/${id}/pdf`, {
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      throw error
    }
  }

  // Aprovar fatura
  async approveInvoice(id) {
    try {
      const response = await axios.put(`${API_URL}/proforma-invoices/${id}/approve`)
      return response.data
    } catch (error) {
      console.error('Erro ao aprovar fatura:', error)
      throw error
    }
  }

  // Rejeitar fatura
  async rejectInvoice(id, reason) {
    try {
      const response = await axios.put(`${API_URL}/proforma-invoices/${id}/reject`, { reason })
      return response.data
    } catch (error) {
      console.error('Erro ao rejeitar fatura:', error)
      throw error
    }
  }

  // Buscar estatísticas
  async getStatistics() {
    try {
      const response = await axios.get(`${API_URL}/proforma-invoices/statistics`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  }

  // Exportar relatório
  async exportReport(params = {}) {
    try {
      const response = await axios.get(`${API_URL}/proforma-invoices/export`, {
        params,
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      throw error
    }
  }
}

export default new ProFormaService()
