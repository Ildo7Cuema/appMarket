import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

class PDFService {
  // Gerar PDF da fatura pró-forma
  async generateProFormaPDF() {
    // Usar o método generatePDFFromHTML para capturar exatamente o que está sendo exibido na visualização
    // Primeiro, precisamos aguardar um pouco para garantir que o DOM esteja atualizado
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Buscar o elemento da visualização da fatura
    const invoicePreviewElement = document.querySelector('.invoice-container')

    if (!invoicePreviewElement) {
      console.error('Elemento de visualização da fatura não encontrado')
      throw new Error('Elemento de visualização da fatura não encontrado')
    }

    // Gerar PDF a partir do HTML da visualização
    return await this.generatePDFFromHTML(invoicePreviewElement)
  }

  // Gerar PDF a partir de HTML
  async generatePDFFromHTML(element) {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      return pdf
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      throw error
    }
  }

  // Download do PDF
  downloadPDF(pdf, filename) {
    pdf.save(filename)
  }

  // Abrir PDF em nova aba
  openPDFInNewTab(pdf, filename) {
    const pdfBlob = pdf.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = pdfUrl
    link.target = '_blank'
    link.download = filename
    link.click()
    URL.revokeObjectURL(pdfUrl)
  }

  // Formatar moeda com melhor precisão
  formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return '0,00 Kz'
    }

    // Garantir que o valor é um número
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      return '0,00 Kz'
    }

    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue)
  }

  // Formatar data
  formatDate(date) {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('pt-AO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(date))
  }

  // Dividir texto em linhas
  splitTextToSize(text, maxWidth) {
    if (!text) return []

    const words = text.split(' ')
    const lines = []
    let currentLine = ''

    words.forEach((word) => {
      const testLine = currentLine + word + ' '
      // Usar uma aproximação mais precisa do tamanho do texto (aproximadamente 2.5mm por caractere)
      const estimatedWidth = testLine.length * 2.5

      if (estimatedWidth > maxWidth && currentLine) {
        lines.push(currentLine.trim())
        currentLine = word + ' '
      } else {
        currentLine = testLine
      }
    })

    if (currentLine.trim()) {
      lines.push(currentLine.trim())
    }

    return lines
  }
}

export default new PDFService()
