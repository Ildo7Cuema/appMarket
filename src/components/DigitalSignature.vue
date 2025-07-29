<template>
  <div class="digital-signature">
    <!-- Modal de Assinatura -->
    <q-dialog v-model="showSignatureDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Assinatura Digital</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="signature-content">
            <!-- Informações do documento -->
            <div class="document-info q-mb-lg">
              <h6 class="text-weight-bold">Documento a ser assinado:</h6>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-6">
                  <strong>Número:</strong> {{ document.invoice_number }}
                </div>
                <div class="col-12 col-md-6">
                  <strong>Cliente:</strong> {{ document.client_name }}
                </div>
                <div class="col-12 col-md-6">
                  <strong>Data:</strong> {{ formatDate(document.invoice_date) }}
                </div>
                <div class="col-12 col-md-6">
                  <strong>Total:</strong> {{ formatCurrency(document.total_amount) }}
                </div>
              </div>
            </div>

            <!-- Área de assinatura -->
            <div class="signature-area q-mb-lg">
              <h6 class="text-weight-bold q-mb-md">Assinatura:</h6>

              <!-- Assinatura digital -->
              <div class="digital-signature-display">
                <div class="signature-box">
                  <q-icon name="verified" size="48px" color="positive" class="q-mb-sm" />
                  <div class="text-weight-bold text-positive">Documento Assinado Digitalmente</div>
                  <div class="text-caption text-grey-6">Hash: {{ signature.hash }}</div>
                  <div class="text-caption text-grey-6">
                    Assinado em: {{ formatDateTime(signature.timestamp) }}
                  </div>
                </div>
              </div>

              <!-- QR Code de verificação -->
              <div class="qr-code-section q-mt-md">
                <h6 class="text-weight-bold q-mb-sm">QR Code de Verificação:</h6>
                <div class="qr-code-container">
                  <div class="qr-code-placeholder">
                    <q-icon name="qr_code" size="64px" color="primary" />
                    <div class="text-caption q-mt-sm">QR Code gerado</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Certificado digital -->
            <div class="certificate-section q-mb-lg">
              <h6 class="text-weight-bold q-mb-md">Certificado Digital:</h6>
              <q-card class="certificate-card">
                <q-card-section>
                  <div class="row q-col-gutter-sm">
                    <div class="col-12 col-md-6">
                      <strong>Empresa:</strong> {{ certificate.company_name }}
                    </div>
                    <div class="col-12 col-md-6">
                      <strong>NIF:</strong> {{ certificate.company_nif }}
                    </div>
                    <div class="col-12 col-md-6">
                      <strong>NUIT:</strong> {{ certificate.company_nuit }}
                    </div>
                    <div class="col-12 col-md-6">
                      <strong>Válido até:</strong> {{ formatDate(certificate.expires_at) }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Verificação de integridade -->
            <div class="integrity-check q-mb-lg">
              <h6 class="text-weight-bold q-mb-md">Verificação de Integridade:</h6>
              <div class="integrity-status">
                <q-icon
                  :name="integrityValid ? 'check_circle' : 'error'"
                  :color="integrityValid ? 'positive' : 'negative'"
                  size="24px"
                />
                <span class="q-ml-sm">
                  {{ integrityValid ? 'Documento íntegro' : 'Documento comprometido' }}
                </span>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            :label="isSigned ? 'Verificar' : 'Assinar'"
            @click="handleSignature"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Botão para abrir modal -->
    <q-btn
      :color="isSigned ? 'positive' : 'primary'"
      :icon="isSigned ? 'verified' : 'edit'"
      :label="isSigned ? 'Assinado' : 'Assinar'"
      @click="openSignatureDialog"
      :disable="loading"
    />
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import signatureService from '../services/signature.service'

export default defineComponent({
  name: 'DigitalSignature',
  props: {
    document: {
      type: Object,
      required: true,
    },
    companyInfo: {
      type: Object,
      default: () => ({
        company_name: 'Empresa Exemplo',
        company_nif: '123456789',
        company_nuit: '987654321',
      }),
    },
  },
  emits: ['signed', 'verified'],
  setup(props, { emit }) {
    const $q = useQuasar()

    // Estado
    const showSignatureDialog = ref(false)
    const loading = ref(false)
    const signature = ref({})
    const certificate = ref({})
    const integrityValid = ref(false)

    // Computed
    const isSigned = computed(() => {
      return props.document.signature && props.document.signature.signature
    })

    // Métodos
    const openSignatureDialog = () => {
      showSignatureDialog.value = true
      if (isSigned.value) {
        loadSignatureInfo()
      } else {
        prepareSignature()
      }
    }

    const prepareSignature = () => {
      try {
        // Gerar certificado digital
        certificate.value = signatureService.generateDigitalCertificate(props.companyInfo)

        // Preparar assinatura
        signature.value = {
          hash: '',
          timestamp: new Date().toISOString(),
          version: '1.0',
        }

        integrityValid.value = true
      } catch (error) {
        console.error('Erro ao preparar assinatura:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao preparar assinatura digital',
        })
      }
    }

    const loadSignatureInfo = () => {
      try {
        signature.value = props.document.signature
        certificate.value = props.companyInfo

        // Verificar integridade
        const verification = signatureService.verifySignature(props.document)
        integrityValid.value = verification.valid

        if (!integrityValid.value) {
          $q.notify({
            type: 'warning',
            message: `Documento comprometido: ${verification.reason}`,
          })
        }
      } catch (error) {
        console.error('Erro ao carregar informações da assinatura:', error)
        integrityValid.value = false
      }
    }

    const handleSignature = async () => {
      try {
        loading.value = true

        if (isSigned.value) {
          // Verificar assinatura
          const verification = signatureService.verifySignature(props.document)

          if (verification.valid) {
            $q.notify({
              type: 'positive',
              message: 'Assinatura válida!',
            })
            emit('verified', { valid: true, document: props.document })
          } else {
            $q.notify({
              type: 'negative',
              message: `Assinatura inválida: ${verification.reason}`,
            })
            emit('verified', { valid: false, reason: verification.reason })
          }
        } else {
          // Assinar documento
          const signedDocument = signatureService.signProFormaInvoice(props.document)

          $q.notify({
            type: 'positive',
            message: 'Documento assinado com sucesso!',
          })

          emit('signed', signedDocument)
        }

        showSignatureDialog.value = false
      } catch (error) {
        console.error('Erro ao processar assinatura:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao processar assinatura digital',
        })
      } finally {
        loading.value = false
      }
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Intl.DateTimeFormat('pt-AO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(date))
    }

    const formatDateTime = (date) => {
      if (!date) return 'N/A'
      return new Intl.DateTimeFormat('pt-AO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(date))
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
      }).format(value || 0)
    }

    // Lifecycle
    onMounted(() => {
      if (isSigned.value) {
        loadSignatureInfo()
      }
    })

    return {
      // Estado
      showSignatureDialog,
      loading,
      signature,
      certificate,
      integrityValid,

      // Computed
      isSigned,

      // Métodos
      openSignatureDialog,
      prepareSignature,
      loadSignatureInfo,
      handleSignature,
      formatDate,
      formatDateTime,
      formatCurrency,
    }
  },
})
</script>

<style lang="scss" scoped>
.digital-signature {
  .signature-content {
    .document-info {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .signature-area {
      .digital-signature-display {
        .signature-box {
          text-align: center;
          padding: 24px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #4caf50;
        }
      }

      .qr-code-section {
        .qr-code-container {
          display: flex;
          justify-content: center;

          .qr-code-placeholder {
            text-align: center;
            padding: 24px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }
        }
      }
    }

    .certificate-section {
      .certificate-card {
        background: #fff3e0;
        border-left: 4px solid #ff9800;
      }
    }

    .integrity-check {
      .integrity-status {
        display: flex;
        align-items: center;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        font-weight: 500;
      }
    }
  }
}
</style>
