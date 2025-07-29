import CryptoJS from 'crypto-js'

class SignatureService {
  constructor() {
    this.privateKey = process.env.VUE_APP_SIGNATURE_PRIVATE_KEY || 'default-private-key'
    this.publicKey = process.env.VUE_APP_SIGNATURE_PUBLIC_KEY || 'default-public-key'
  }

  // Gerar hash SHA-256 do conteúdo
  generateHash(content) {
    return CryptoJS.SHA256(content).toString()
  }

  // Assinar documento
  signDocument(documentData) {
    try {
      // Converter dados do documento para string
      const documentString = JSON.stringify(documentData, Object.keys(documentData).sort())

      // Gerar hash do documento
      const documentHash = this.generateHash(documentString)

      // Criar timestamp
      const timestamp = new Date().toISOString()

      // Criar payload para assinatura
      const signaturePayload = {
        documentHash,
        timestamp,
        version: '1.0',
      }

      // Gerar assinatura digital
      const signature = this.generateSignature(signaturePayload)

      // Retornar documento assinado
      return {
        ...documentData,
        signature: {
          hash: documentHash,
          signature,
          timestamp,
          publicKey: this.publicKey,
          version: '1.0',
        },
      }
    } catch (error) {
      console.error('Erro ao assinar documento:', error)
      throw new Error('Falha ao assinar documento')
    }
  }

  // Gerar assinatura digital
  generateSignature(payload) {
    try {
      const payloadString = JSON.stringify(payload)
      const signature = CryptoJS.HmacSHA256(payloadString, this.privateKey).toString()
      return signature
    } catch (error) {
      console.error('Erro ao gerar assinatura:', error)
      throw new Error('Falha ao gerar assinatura')
    }
  }

  // Verificar assinatura
  verifySignature(signedDocument) {
    try {
      const { signature, ...documentData } = signedDocument

      if (!signature) {
        return { valid: false, reason: 'Documento não possui assinatura' }
      }

      // Verificar se todos os campos necessários estão presentes
      const requiredFields = ['hash', 'signature', 'timestamp', 'publicKey', 'version']
      for (const field of requiredFields) {
        if (!signature[field]) {
          return { valid: false, reason: `Campo obrigatório ausente: ${field}` }
        }
      }

      // Verificar se a chave pública é válida
      if (signature.publicKey !== this.publicKey) {
        return { valid: false, reason: 'Chave pública inválida' }
      }

      // Verificar se o timestamp não é muito antigo (24 horas)
      const signatureTime = new Date(signature.timestamp)
      const currentTime = new Date()
      const timeDiff = currentTime - signatureTime
      const maxAge = 24 * 60 * 60 * 1000 // 24 horas em milissegundos

      if (timeDiff > maxAge) {
        return { valid: false, reason: 'Assinatura expirada' }
      }

      // Gerar hash do documento atual
      const documentString = JSON.stringify(documentData, Object.keys(documentData).sort())
      const currentHash = this.generateHash(documentString)

      // Verificar se o hash corresponde
      if (currentHash !== signature.hash) {
        return { valid: false, reason: 'Hash do documento não corresponde' }
      }

      // Verificar assinatura
      const payload = {
        documentHash: signature.hash,
        timestamp: signature.timestamp,
        version: signature.version,
      }

      const expectedSignature = this.generateSignature(payload)

      if (expectedSignature !== signature.signature) {
        return { valid: false, reason: 'Assinatura inválida' }
      }

      return { valid: true, reason: 'Assinatura válida' }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error)
      return { valid: false, reason: 'Erro ao verificar assinatura' }
    }
  }

  // Assinar fatura pró-forma
  signProFormaInvoice(invoice) {
    try {
      // Preparar dados da fatura para assinatura
      const invoiceData = {
        invoice_number: invoice.invoice_number,
        client_name: invoice.client_name,
        client_email: invoice.client_email,
        client_nif: invoice.client_nif,
        client_nuit: invoice.client_nuit,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        total_amount: invoice.total_amount,
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
        status: invoice.status,
        notes: invoice.notes,
        created_at: invoice.created_at,
      }

      // Assinar documento
      const signedInvoice = this.signDocument(invoiceData)

      return signedInvoice
    } catch (error) {
      console.error('Erro ao assinar fatura:', error)
      throw new Error('Falha ao assinar fatura pró-forma')
    }
  }

  // Verificar assinatura de fatura
  verifyProFormaInvoice(signedInvoice) {
    return this.verifySignature(signedInvoice)
  }

  // Gerar certificado digital
  generateDigitalCertificate(companyInfo) {
    try {
      const certificateData = {
        company_name: companyInfo.company_name,
        company_nif: companyInfo.company_nif,
        company_nuit: companyInfo.company_nuit,
        certificate_type: 'PROFORMA_INVOICE',
        issued_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 ano
        version: '1.0',
      }

      const signedCertificate = this.signDocument(certificateData)

      return signedCertificate
    } catch (error) {
      console.error('Erro ao gerar certificado:', error)
      throw new Error('Falha ao gerar certificado digital')
    }
  }

  // Verificar certificado digital
  verifyDigitalCertificate(signedCertificate) {
    return this.verifySignature(signedCertificate)
  }

  // Gerar QR Code para verificação
  generateVerificationQRCode(signedDocument) {
    try {
      const verificationData = {
        documentId: signedDocument.invoice_number || signedDocument.id,
        hash: signedDocument.signature.hash,
        timestamp: signedDocument.signature.timestamp,
        publicKey: signedDocument.signature.publicKey,
        verificationUrl: `${window.location.origin}/verify-signature`,
      }

      const qrData = JSON.stringify(verificationData)
      return qrData
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
      throw new Error('Falha ao gerar QR Code de verificação')
    }
  }

  // Verificar integridade de múltiplos documentos
  verifyMultipleDocuments(signedDocuments) {
    const results = []

    for (const document of signedDocuments) {
      const verification = this.verifySignature(document)
      results.push({
        documentId: document.invoice_number || document.id,
        valid: verification.valid,
        reason: verification.reason,
      })
    }

    return results
  }

  // Revogar assinatura
  revokeSignature(documentId, reason) {
    try {
      const revocationData = {
        documentId,
        reason,
        revoked_at: new Date().toISOString(),
        revoked_by: 'system',
      }

      const signedRevocation = this.signDocument(revocationData)

      // Em produção, aqui seria salvo no banco de dados
      localStorage.setItem(`revoked_${documentId}`, JSON.stringify(signedRevocation))

      return signedRevocation
    } catch (error) {
      console.error('Erro ao revogar assinatura:', error)
      throw new Error('Falha ao revogar assinatura')
    }
  }

  // Verificar se assinatura foi revogada
  isSignatureRevoked(documentId) {
    try {
      const revocationData = localStorage.getItem(`revoked_${documentId}`)
      if (!revocationData) {
        return false
      }

      const revocation = JSON.parse(revocationData)
      const verification = this.verifySignature(revocation)

      return verification.valid
    } catch (error) {
      console.error('Erro ao verificar revogação:', error)
      return false
    }
  }

  // Obter histórico de assinaturas
  getSignatureHistory(documentId) {
    try {
      // Em produção, isso viria do banco de dados
      const history = localStorage.getItem(`signature_history_${documentId}`)
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error('Erro ao obter histórico:', error)
      return []
    }
  }

  // Adicionar ao histórico
  addToHistory(documentId, signatureData) {
    try {
      const history = this.getSignatureHistory(documentId)
      history.push({
        ...signatureData,
        timestamp: new Date().toISOString(),
      })

      localStorage.setItem(`signature_history_${documentId}`, JSON.stringify(history))
    } catch (error) {
      console.error('Erro ao adicionar ao histórico:', error)
    }
  }
}

export default new SignatureService()
