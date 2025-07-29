<template>
  <q-page class="proforma-page">
    <!-- Header -->
    <div class="header-section q-pa-lg">
      <div class="row items-center justify-between">
        <div class="col">
          <h4 class="text-white text-weight-bold q-mb-xs">Faturas Pró-Forma</h4>
          <p class="text-white-7">Gerencie e crie faturas pró-forma</p>
        </div>
        <div class="col-auto">
          <q-btn
            color="white"
            text-color="primary"
            icon="add"
            label="Nova Fatura Pró-Forma"
            @click="showCreateDialog = true"
            class="q-mr-sm"
          />
          <q-btn
            color="white"
            text-color="primary"
            icon="refresh"
            label="Atualizar"
            @click="loadProFormaInvoices"
          />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="content-container q-px-lg q-mt-xl">
      <!-- Filtros -->
      <q-card class="filters-card q-mb-lg">
        <q-card-section>
          <!-- Campos de Filtro -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-3">
              <q-input
                v-model="filters.search"
                outlined
                dense
                placeholder="Buscar por número, cliente..."
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-2">
              <q-select
                v-model="filters.status"
                :options="statusOptions"
                outlined
                dense
                placeholder="Status"
                clearable
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                v-model="filters.dateFrom"
                outlined
                dense
                placeholder="Data Início"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="filters.dateFrom" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-2">
              <q-input v-model="filters.dateTo" outlined dense placeholder="Data Fim" clearable>
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="filters.dateTo" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <!-- Espaço reservado para futuras funcionalidades -->
            </div>
          </div>

          <!-- Botões de Ação -->
          <div class="row justify-between items-center q-mt-sm">
            <div class="col-auto">
              <q-chip
                v-if="activeFiltersCount > 0"
                color="primary"
                text-color="white"
                icon="filter_list"
                :label="`${activeFiltersCount} filtro(s) ativo(s)`"
                size="sm"
              />
            </div>
            <div class="col-auto">
              <q-btn-group flat>
                <q-btn
                  color="primary"
                  icon="filter_list"
                  label="Aplicar Filtros"
                  @click="applyFilters"
                  class="q-mr-sm"
                />
                <q-btn
                  color="grey"
                  icon="clear"
                  label="Limpar Filtros"
                  @click="clearFilters"
                  outline
                  :disable="activeFiltersCount === 0"
                />
              </q-btn-group>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Lista de Faturas Pró-Forma -->
      <q-card class="invoices-card">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="col">
              <h6 class="text-weight-bold">Faturas Pró-Forma</h6>
            </div>
            <div class="col-auto">
              <q-btn-group flat>
                <q-btn
                  :icon="viewMode === 'table' ? 'view_list' : 'grid_view'"
                  :label="viewMode === 'table' ? 'Tabela' : 'Grid'"
                  @click="viewMode = viewMode === 'table' ? 'grid' : 'table'"
                />
              </q-btn-group>
            </div>
          </div>

          <!-- Tabela -->
          <div v-if="viewMode === 'table'">
            <q-table
              :rows="filteredInvoices"
              :columns="columns"
              row-key="id"
              flat
              bordered
              :loading="loading"
              :pagination="{ rowsPerPage: 10 }"
              class="modern-table"
            >
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="getStatusColor(props.row.status)"
                    text-color="white"
                    :label="getStatusLabel(props.row.status)"
                    size="sm"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-total="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-primary">
                    {{ formatCurrency(props.row.total_amount) }}
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn-group flat>
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="visibility"
                      @click="viewInvoice(props.row)"
                    >
                      <q-tooltip>Visualizar</q-tooltip>
                    </q-btn>
                    <q-btn flat round color="secondary" icon="edit" @click="editInvoice(props.row)">
                      <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      color="positive"
                      icon="print"
                      @click="printInvoice(props.row)"
                    >
                      <q-tooltip>Imprimir</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      color="info"
                      icon="picture_as_pdf"
                      @click="downloadPDF(props.row)"
                    >
                      <q-tooltip>Download PDF</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      color="warning"
                      icon="content_copy"
                      @click="duplicateInvoice(props.row)"
                    >
                      <q-tooltip>Duplicar</q-tooltip>
                    </q-btn>
                    <DigitalSignature
                      :document="props.row"
                      :company-info="companySettings"
                      @signed="onDocumentSigned"
                      @verified="onDocumentVerified"
                    />
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="deleteInvoice(props.row)"
                    >
                      <q-tooltip>Excluir</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </q-td>
              </template>
            </q-table>
          </div>

          <!-- Grid -->
          <div v-else class="row q-col-gutter-md">
            <div
              v-for="invoice in filteredInvoices"
              :key="invoice.id"
              class="col-12 col-md-6 col-lg-4"
            >
              <q-card class="invoice-card">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <div class="col">
                      <div class="text-weight-bold">{{ invoice.invoice_number }}</div>
                      <div class="text-caption text-grey-6">{{ invoice.client_name }}</div>
                    </div>
                    <div class="col-auto">
                      <q-chip
                        :color="getStatusColor(invoice.status)"
                        text-color="white"
                        :label="getStatusLabel(invoice.status)"
                        size="sm"
                      />
                    </div>
                  </div>
                  <div class="text-h6 text-weight-bold text-primary q-mb-sm">
                    {{ formatCurrency(invoice.total_amount) }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ formatDate(invoice.created_at) }}
                  </div>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn flat color="primary" icon="visibility" @click="viewInvoice(invoice)" />
                  <q-btn flat color="secondary" icon="edit" @click="editInvoice(invoice)" />
                  <q-btn flat color="positive" icon="print" @click="printInvoice(invoice)" />
                  <q-btn flat color="info" icon="picture_as_pdf" @click="downloadPDF(invoice)" />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog para Criar/Editar Fatura -->
    <q-dialog
      v-model="showCreateDialog"
      maximized
      @keydown.esc="closeCreateDialog"
      @hide="onDialogHide"
    >
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingInvoice ? 'Editar' : 'Nova' }} Fatura Pró-Forma</div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            @click="
              () => {
                showCreateDialog = false
                editingInvoice = null
                resetForm()
              }
            "
            color="grey-7"
            class="close-btn"
            data-testid="close-modal-btn"
          >
            <q-tooltip>Fechar (ESC)</q-tooltip>
          </q-btn>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-lg">
            <!-- Informações do Cliente -->
            <div class="col-12 col-md-6">
              <q-card class="client-info-card">
                <q-card-section>
                  <h6 class="text-weight-bold q-mb-md">Informações do Cliente</h6>
                  <div class="row q-col-gutter-md">
                    <div class="col-12">
                      <q-input
                        v-model="invoiceForm.client_name"
                        outlined
                        dense
                        label="Nome do Cliente"
                        :rules="[(val) => !!val || 'Nome é obrigatório']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="invoiceForm.client_email"
                        outlined
                        dense
                        label="Email"
                        type="email"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input v-model="invoiceForm.client_phone" outlined dense label="Telefone" />
                    </div>
                    <div class="col-12">
                      <q-input
                        v-model="invoiceForm.client_address"
                        outlined
                        dense
                        label="Endereço"
                        type="textarea"
                        rows="2"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input v-model="invoiceForm.client_nif" outlined dense label="NIF" />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input v-model="invoiceForm.client_nuit" outlined dense label="NUIT" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Informações da Fatura -->
            <div class="col-12 col-md-6">
              <q-card class="invoice-info-card">
                <q-card-section>
                  <h6 class="text-weight-bold q-mb-md">Informações da Fatura</h6>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="invoiceForm.invoice_number"
                        outlined
                        dense
                        label="Número da Fatura"
                        :rules="[(val) => !!val || 'Número é obrigatório']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        :model-value="formatDisplayDate(invoiceForm.invoice_date)"
                        outlined
                        dense
                        label="Data da Fatura"
                        readonly
                        class="date-input"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="invoiceForm.invoice_date"
                                mask="YYYY-MM-DD"
                                @update:model-value="onInvoiceDateChange"
                                :model-value="invoiceForm.invoice_date"
                              />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        :model-value="formatDisplayDate(invoiceForm.due_date)"
                        outlined
                        dense
                        label="Data de Vencimento"
                        readonly
                        class="date-input"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="invoiceForm.due_date"
                                mask="YYYY-MM-DD"
                                @update:model-value="onDueDateChange"
                                :model-value="invoiceForm.due_date"
                              />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="invoiceForm.status"
                        :options="statusOptions"
                        outlined
                        dense
                        label="Status"
                        emit-value
                        map-options
                      />
                    </div>

                    <div class="col-12">
                      <q-input
                        v-model="invoiceForm.payment_conditions"
                        outlined
                        dense
                        label="Condições de Pagamento"
                        type="textarea"
                        rows="4"
                        hint="Defina as condições de pagamento para esta fatura"
                      />
                    </div>
                    <div class="col-12">
                      <q-input
                        v-model="invoiceForm.notes"
                        outlined
                        dense
                        label="Observações"
                        type="textarea"
                        rows="3"
                        hint="Observações adicionais sobre a fatura"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Informações do Emissor -->
          <q-card class="emitter-info-card q-mt-lg">
            <q-card-section>
              <h6 class="text-weight-bold q-mb-md">Informações do Emissor</h6>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="invoiceForm.emitter_name"
                    outlined
                    dense
                    label="Nome do Emissor"
                    :rules="[(val) => !!val || 'Nome do emissor é obrigatório']"
                    hint="Ex: Eng. Ildo Cuema"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="invoiceForm.emitter_title"
                    outlined
                    dense
                    label="Cargo/Função"
                    :rules="[(val) => !!val || 'Cargo é obrigatório']"
                    hint="Ex: Director Executivo"
                  >
                    <template v-slot:prepend>
                      <q-icon name="work" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="invoiceForm.emitter_company"
                    outlined
                    dense
                    label="Empresa do Emissor"
                    :rules="[(val) => !!val || 'Empresa é obrigatória']"
                    hint="Ex: E-Tech Soluções Digitais, Lda"
                  >
                    <template v-slot:prepend>
                      <q-icon name="business" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Preview da seção "Emitido por" -->
              <q-separator class="q-my-md" />
              <div class="text-subtitle2 text-grey-7 q-mb-sm">Preview da seção "Emitido por":</div>
              <q-card flat bordered class="bg-grey-1">
                <q-card-section class="q-pa-md">
                  <div class="text-weight-bold">Emitido por:</div>
                  <div class="q-mt-xs">{{ invoiceForm.emitter_name || 'Eng. Ildo Cuema' }}</div>
                  <div class="q-mt-xs">{{ invoiceForm.emitter_title || 'Director Executivo' }}</div>
                  <div class="q-mt-xs">
                    {{ invoiceForm.emitter_company || 'E-Tech Soluções Digitais, Lda' }}
                  </div>
                </q-card-section>
              </q-card>
            </q-card-section>
          </q-card>

          <!-- Produtos -->
          <q-card class="products-card q-mt-lg">
            <q-card-section>
              <div class="row items-center q-mb-md">
                <div class="col">
                  <h6 class="text-weight-bold">Produtos</h6>
                </div>
                <div class="col-auto">
                  <q-btn color="primary" icon="add" label="Adicionar Produto" @click="addProduct" />
                </div>
              </div>

              <q-table
                :rows="invoiceForm.items"
                :columns="productColumns"
                row-key="id"
                flat
                bordered
                class="modern-table"
              >
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="removeProduct(props.rowIndex)"
                    >
                      <q-tooltip>Remover</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>

          <!-- Totais -->
          <q-card class="totals-card q-mt-lg">
            <q-card-section>
              <div class="row justify-end">
                <div class="col-12 col-md-4">
                  <div class="row q-col-gutter-sm">
                    <div class="col-8 text-right">
                      <strong>Subtotal:</strong>
                    </div>
                    <div class="col-4 text-right">
                      {{ formatCurrency(subtotal) }}
                    </div>
                    <div class="col-8 text-right">
                      <strong>IVA (14%):</strong>
                    </div>
                    <div class="col-4 text-right">
                      {{ formatCurrency(taxAmount) }}
                    </div>
                    <div class="col-8 text-right">
                      <strong>Total:</strong>
                    </div>
                    <div class="col-4 text-right text-h6 text-weight-bold text-primary">
                      {{ formatCurrency(totalAmount) }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="closeCreateDialog" />
          <q-btn
            color="primary"
            :label="editingInvoice ? 'Atualizar' : 'Criar'"
            @click="saveInvoice"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para Adicionar Produto -->
    <q-dialog v-model="showProductDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Adicionar Produto</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="selectedProduct"
                :options="products"
                outlined
                dense
                label="Produto"
                option-label="name"
                option-value="id"
                emit-value
                map-options
                @update:model-value="onProductSelected"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="newItem.quantity"
                outlined
                dense
                label="Quantidade"
                type="number"
                min="1"
                :rules="[(val) => val > 0 || 'Quantidade deve ser maior que 0']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="newItem.price"
                outlined
                dense
                label="Preço Unitário"
                type="number"
                min="0"
                step="0.01"
                :rules="[(val) => val >= 0 || 'Preço deve ser maior ou igual a 0']"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="newItem.description"
                outlined
                dense
                label="Descrição"
                type="textarea"
                rows="2"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            label="Adicionar"
            @click="confirmAddProduct"
            :disable="!selectedProduct || !newItem.quantity || !newItem.price"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para Visualizar Fatura -->
    <q-dialog v-model="showViewDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Fatura Pró-Forma - {{ selectedInvoice?.invoice_number }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="invoice-container" ref="invoicePreview">
            <!-- Cabeçalho da Fatura -->
            <div class="invoice-header">
              <div class="row items-center">
                <!-- Logo da Empresa -->
                <div class="col-auto q-mr-lg">
                  <q-img
                    :src="companySettings.logo_url || '/assets/logo.png'"
                    style="width: 120px; height: 120px; object-fit: contain"
                    class="invoice-logo"
                  />
                </div>

                <!-- Informações da Empresa -->
                <div class="col">
                  <div class="text-h4 text-weight-bold text-primary q-mb-sm company-name">
                    {{ companySettings.company_name || 'E-Tech Soluções Digitais, Lda' }}
                  </div>
                  <div class="text-subtitle1 text-grey-8">
                    {{ companySettings.company_address || 'Endereço da Empresa' }}
                  </div>
                  <div class="text-body2 text-grey-7">
                    <q-icon name="phone" size="16px" class="q-mr-xs" />
                    {{ companySettings.company_phone || '+244 900 000 000' }}
                  </div>
                  <div class="text-body2 text-grey-7">
                    <q-icon name="email" size="16px" class="q-mr-xs" />
                    {{ companySettings.company_email || 'contato@etech.com' }}
                  </div>
                  <div class="text-body2 text-grey-7">
                    <q-icon name="badge" size="16px" class="q-mr-xs" />
                    NIF: {{ companySettings.company_nif || '000000000' }}
                  </div>
                </div>

                <!-- Título da Fatura -->
                <div class="col-auto text-right">
                  <div class="text-h5 text-weight-bold text-primary invoice-title">
                    FATURA PRÓ-FORMA
                  </div>
                  <div class="text-body2 text-grey-7">
                    Data: {{ formatDate(selectedInvoice?.invoice_date) }}
                  </div>
                  <div class="text-body2 text-grey-7">
                    Vencimento: {{ formatDate(selectedInvoice?.due_date) }}
                  </div>
                  <div class="text-body2 text-grey-7 q-mt-sm">
                    Nº Fatura: {{ selectedInvoice?.invoice_number }}
                  </div>
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Informações do Cliente -->
            <div class="client-info q-mb-lg">
              <div class="text-h6 text-weight-bold q-mb-md section-title">
                Informações do Cliente
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="text-body1">
                    <strong>Nome:</strong> {{ selectedInvoice?.client_name }}
                  </div>
                  <div class="text-body1">
                    <strong>Email:</strong> {{ selectedInvoice?.client_email || 'N/A' }}
                  </div>
                  <div class="text-body1">
                    <strong>Telefone:</strong> {{ selectedInvoice?.client_phone || 'N/A' }}
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-body1">
                    <strong>Endereço:</strong> {{ selectedInvoice?.client_address || 'N/A' }}
                  </div>
                  <div class="text-body1">
                    <strong>NIF:</strong> {{ selectedInvoice?.client_nif || 'N/A' }}
                  </div>
                  <div class="text-body1">
                    <strong>NUIT:</strong> {{ selectedInvoice?.client_nuit || 'N/A' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabela de Produtos -->
            <div class="products-section q-mb-lg">
              <div class="text-h6 text-weight-bold q-mb-md section-title">Produtos / Serviços</div>
              <q-markup-table flat bordered class="invoice-table">
                <thead>
                  <tr>
                    <th class="text-left">Descrição</th>
                    <th class="text-center">Quantidade</th>
                    <th class="text-right">Preço Unitário</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in selectedInvoice?.items || []" :key="index">
                    <td class="text-left">{{ item.description }}</td>
                    <td class="text-center">{{ item.quantity }}</td>
                    <td class="text-right">{{ formatCurrency(item.price) }}</td>
                    <td class="text-right text-weight-bold">
                      {{ formatCurrency(item.quantity * item.price) }}
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>

            <!-- Totais -->
            <div class="invoice-totals q-mb-lg">
              <div class="row justify-end">
                <div class="col-6">
                  <div class="row q-py-sm">
                    <div class="col-6 text-right text-weight-medium">Subtotal:</div>
                    <div class="col-6 text-right">
                      {{ formatCurrency(selectedInvoiceSubtotal) }}
                    </div>
                  </div>
                  <div class="row q-py-sm">
                    <div class="col-6 text-right text-weight-medium">IVA (14%):</div>
                    <div class="col-6 text-right">{{ formatCurrency(selectedInvoiceTax) }}</div>
                  </div>
                  <q-separator class="q-my-sm" />
                  <div class="row q-py-sm">
                    <div class="col-6 text-right text-h6 text-weight-bold">Total:</div>
                    <div
                      class="col-6 text-right text-h6 text-weight-bold text-primary total-amount"
                    >
                      {{ formatCurrency(selectedInvoice?.total_amount) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Condições de Pagamento -->
            <div v-if="selectedInvoice?.payment_conditions" class="payment-conditions q-mb-lg">
              <q-separator class="q-mb-md" />
              <div class="text-h6 text-weight-bold q-mb-md section-title">
                Condições de Pagamento
              </div>
              <div class="text-body1" style="white-space: pre-line">
                {{ selectedInvoice.payment_conditions }}
              </div>
            </div>

            <!-- Observações -->
            <div v-if="selectedInvoice?.notes" class="notes-section q-mb-lg">
              <q-separator class="q-mb-md" />
              <div class="text-h6 text-weight-bold q-mb-md section-title">Observações</div>
              <div class="text-body1" style="white-space: pre-line">
                {{ selectedInvoice.notes }}
              </div>
            </div>

            <!-- Informações do Emissor -->
            <div class="emitter-section q-mt-xl">
              <q-separator class="q-mb-md" />
              <div class="row">
                <div class="col-12 col-md-6">
                  <div class="text-h6 text-weight-bold text-primary section-title">
                    Emitido por:
                  </div>
                  <div class="text-body1 q-mt-sm">
                    {{
                      selectedInvoice?.emitter_name ||
                      companySettings.emitter_name ||
                      'Eng. Ildo Cuema'
                    }}
                  </div>
                  <div class="text-body1">
                    {{
                      selectedInvoice?.emitter_title ||
                      companySettings.emitter_title ||
                      'Director Executivo'
                    }}
                  </div>
                  <div class="text-body1">
                    {{
                      selectedInvoice?.emitter_company ||
                      companySettings.emitter_company ||
                      'E-Tech Soluções Digitais, Lda'
                    }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Rodapé -->
            <div class="invoice-footer text-center q-mt-xl">
              <q-separator class="q-mb-md" />
              <div class="text-h6 text-weight-bold text-primary">
                Obrigado pela sua preferência!
              </div>
              <div class="text-body2 text-grey-7">
                Esta fatura pro-forma não substitui a fatura definitiva
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn color="primary" icon="print" label="Imprimir" @click="printSelectedInvoice" />
          <q-btn
            color="info"
            icon="picture_as_pdf"
            label="Download PDF"
            @click="downloadSelectedPDF"
          />
          <q-btn flat label="Fechar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth-store'
import { useStockStore } from '../stores/stock-store'
import proformaService from '../services/proforma.service'
import pdfService from '../services/pdf.service'
import DigitalSignature from '../components/DigitalSignature.vue'

export default defineComponent({
  name: 'ProFormaInvoicePage',
  components: {
    DigitalSignature,
  },
  setup() {
    const $q = useQuasar()
    const authStore = useAuthStore()
    const stockStore = useStockStore()

    // Estado
    const loading = ref(false)
    const saving = ref(false)
    const viewMode = ref('table')
    const showCreateDialog = ref(false)
    const showProductDialog = ref(false)
    const showViewDialog = ref(false)
    const editingInvoice = ref(null)
    const selectedInvoice = ref(null)
    const selectedProduct = ref(null)
    const products = ref([])
    const proFormaInvoices = ref([])
    const companySettings = ref({})

    // Filtros
    const filters = ref({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    })

    // Formulário da fatura
    const invoiceForm = ref({
      client_name: '',
      client_email: '',
      client_phone: '',
      client_address: '',
      client_nif: '',
      client_nuit: '',
      invoice_number: '',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: '',
      status: 'draft',
      payment_conditions:
        'Forma de Pagamento: Transferência Bancária\nConta Bancária: Banco BAI | IBAN: AO06 0006 0000 0000 0000 0010\nPagamento de 50% para início dos trabalhos\nRestante contra entrega',
      notes:
        'Esta fatura pro-forma não substitui a fatura definitiva. É apenas um documento de cotação e não tem valor fiscal.',
      emitter_name: '',
      emitter_title: '',
      emitter_company: '',
      items: [],
    })

    // Novo item
    const newItem = ref({
      product_id: null,
      description: '',
      quantity: 1,
      price: 0,
      total: 0,
    })

    // Opções
    const statusOptions = [
      { label: 'Rascunho', value: 'draft' },
      { label: 'Enviada', value: 'sent' },
      { label: 'Aprovada', value: 'approved' },
      { label: 'Rejeitada', value: 'rejected' },
      { label: 'Expirada', value: 'expired' },
    ]

    // Colunas da tabela
    const columns = [
      {
        name: 'invoice_number',
        label: 'Número',
        field: 'invoice_number',
        sortable: true,
        align: 'left',
      },
      {
        name: 'client_name',
        label: 'Cliente',
        field: 'client_name',
        sortable: true,
        align: 'left',
      },
      {
        name: 'invoice_date',
        label: 'Data',
        field: 'invoice_date',
        sortable: true,
        align: 'left',
        format: (val) => formatDate(val),
      },
      {
        name: 'due_date',
        label: 'Vencimento',
        field: 'due_date',
        sortable: true,
        align: 'left',
        format: (val) => formatDate(val),
      },
      {
        name: 'status',
        label: 'Status',
        field: 'status',
        sortable: true,
        align: 'center',
      },
      {
        name: 'total_amount',
        label: 'Total',
        field: 'total_amount',
        sortable: true,
        align: 'right',
      },
      {
        name: 'actions',
        label: 'Ações',
        field: 'actions',
        align: 'center',
      },
    ]

    // Colunas dos produtos
    const productColumns = [
      {
        name: 'description',
        label: 'Descrição',
        field: 'description',
        align: 'left',
      },
      {
        name: 'quantity',
        label: 'Qtd',
        field: 'quantity',
        align: 'center',
      },
      {
        name: 'price',
        label: 'Preço Unit.',
        field: 'price',
        align: 'right',
        format: (val) => formatCurrency(val),
      },
      {
        name: 'total',
        label: 'Total',
        field: 'total',
        align: 'right',
        format: (val) => formatCurrency(val),
      },
      {
        name: 'actions',
        label: 'Ações',
        field: 'actions',
        align: 'center',
      },
    ]

    // Colunas da visualização
    const invoicePreviewColumns = [
      {
        name: 'description',
        label: 'Descrição',
        field: 'description',
        align: 'left',
      },
      {
        name: 'quantity',
        label: 'Quantidade',
        field: 'quantity',
        align: 'center',
      },
      {
        name: 'price',
        label: 'Preço Unit.',
        field: 'price',
        align: 'right',
        format: (val) => formatCurrency(val),
      },
      {
        name: 'total',
        label: 'Total',
        field: 'total',
        align: 'right',
        format: (val) => formatCurrency(val),
      },
    ]

    // Computed
    const filteredInvoices = computed(() => {
      let filtered = proFormaInvoices.value

      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        filtered = filtered.filter(
          (invoice) =>
            invoice.invoice_number.toLowerCase().includes(search) ||
            invoice.client_name.toLowerCase().includes(search),
        )
      }

      if (filters.value.status) {
        filtered = filtered.filter((invoice) => invoice.status === filters.value.status)
      }

      if (filters.value.dateFrom) {
        filtered = filtered.filter((invoice) => invoice.invoice_date >= filters.value.dateFrom)
      }

      if (filters.value.dateTo) {
        filtered = filtered.filter((invoice) => invoice.invoice_date <= filters.value.dateTo)
      }

      return filtered
    })

    const subtotal = computed(() => {
      return invoiceForm.value.items.reduce((sum, item) => {
        return sum + item.quantity * item.price
      }, 0)
    })

    const taxAmount = computed(() => {
      return subtotal.value * 0.14 // 14% IVA
    })

    const totalAmount = computed(() => {
      return subtotal.value + taxAmount.value
    })

    const selectedInvoiceSubtotal = computed(() => {
      if (!selectedInvoice.value?.items) return 0
      return selectedInvoice.value.items.reduce((sum, item) => {
        return sum + item.quantity * item.price
      }, 0)
    })

    const selectedInvoiceTax = computed(() => {
      return selectedInvoiceSubtotal.value * 0.14
    })

    const activeFiltersCount = computed(() => {
      let count = 0
      if (filters.value.search) count++
      if (filters.value.status) count++
      if (filters.value.dateFrom) count++
      if (filters.value.dateTo) count++
      return count
    })

    // Métodos
    const loadProFormaInvoices = async () => {
      try {
        loading.value = true
        console.log('Carregando faturas pró-forma...')
        const response = await proformaService.getInvoices()
        console.log('Resposta da API:', response)
        proFormaInvoices.value = response.invoices || []
        console.log('Faturas carregadas:', proFormaInvoices.value.length)
      } catch (error) {
        console.error('Erro ao carregar faturas:', error)
        console.error('Detalhes do erro:', error.response?.data || error.message)
        $q.notify({
          type: 'negative',
          message: `Erro ao carregar faturas pró-forma: ${error.response?.data?.message || error.message}`,
        })
      } finally {
        loading.value = false
      }
    }

    const loadProducts = async () => {
      try {
        console.log('Carregando produtos...')
        await stockStore.loadProducts()
        products.value = stockStore.products || []
        console.log('Produtos carregados:', products.value.length)
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        console.error('Detalhes do erro:', error.response?.data || error.message)
        // Não falhar se não conseguir carregar produtos
        products.value = []
      }
    }

    const loadCompanySettings = async () => {
      try {
        console.log('Carregando configurações da empresa...')
        const { default: systemService } = await import('../services/system.service')
        const settings = await systemService.getSettings()
        if (settings && settings.length > 0) {
          companySettings.value = settings[0]
        } else {
          // Usar configurações padrão se não houver configurações salvas
          companySettings.value = {
            company_name: 'E-Tech Soluções Digitais, Lda',
            company_address: 'Endereço da empresa',
            company_phone: '+244 123 456 789',
            company_email: 'contato@etech.com',
            emitter_name: 'Eng. Ildo Cuema',
            emitter_title: 'Director Executivo',
            emitter_company: 'E-Tech Soluções Digitais, Lda',
          }
        }
        console.log('Configurações carregadas:', companySettings.value)
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
        // Usar configurações padrão se falhar
        companySettings.value = {
          company_name: 'E-Tech Soluções Digitais, Lda',
          company_address: 'Endereço da empresa',
          company_phone: '+244 123 456 789',
          company_email: 'contato@etech.com',
          emitter_name: 'Eng. Ildo Cuema',
          emitter_title: 'Director Executivo',
          emitter_company: 'E-Tech Soluções Digitais, Lda',
        }
      }
    }

    const generateInvoiceNumber = () => {
      const date = new Date()
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')
      return `PF${year}${month}${day}${random}`
    }

    const resetForm = () => {
      invoiceForm.value = {
        client_name: '',
        client_email: '',
        client_phone: '',
        client_address: '',
        client_nif: '',
        client_nuit: '',
        invoice_number: generateInvoiceNumber(),
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'draft',
        payment_conditions:
          'Forma de Pagamento: Transferência Bancária\nConta Bancária: Banco BAI | IBAN: AO06 0006 0000 0000 0000 0010\nPagamento de 50% para início dos trabalhos\nRestante contra entrega',
        notes:
          'Esta fatura pro-forma não substitui a fatura definitiva. É apenas um documento de cotação e não tem valor fiscal.',
        emitter_name: companySettings.value.emitter_name || 'Eng. Ildo Cuema',
        emitter_title: companySettings.value.emitter_title || 'Director Executivo',
        emitter_company: companySettings.value.emitter_company || 'E-Tech Soluções Digitais, Lda',
        items: [],
      }
    }

    const closeCreateDialog = () => {
      try {
        console.log('Fechando modal...')
        console.log('Estado atual do modal:', showCreateDialog.value)
        showCreateDialog.value = false
        editingInvoice.value = null
        resetForm()
        console.log('Modal fechado com sucesso')
        console.log('Novo estado do modal:', showCreateDialog.value)
      } catch (error) {
        console.error('Erro ao fechar modal:', error)
        // Fallback: tentar fechar diretamente
        showCreateDialog.value = false
      }
    }

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        closeCreateDialog()
      }
    }

    const onDialogHide = () => {
      console.log('Dialog foi fechado')
      editingInvoice.value = null
      resetForm()
    }

    const forceCloseModal = () => {
      console.log('Forçando fechamento do modal...')
      // Força o fechamento usando nextTick
      nextTick(() => {
        showCreateDialog.value = false
        editingInvoice.value = null
        resetForm()
        console.log('Modal forçado a fechar')
      })
    }

    const onInvoiceDateChange = (date) => {
      console.log('Data da fatura alterada:', date)

      if (date) {
        // Garantir que a data seja uma string no formato YYYY-MM-DD
        const formattedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0]

        // Força a reatividade criando um novo objeto
        invoiceForm.value = {
          ...invoiceForm.value,
          invoice_date: formattedDate,
        }

        console.log('Novo valor da fatura:', invoiceForm.value.invoice_date)
        console.log('Data formatada para exibição:', formatDisplayDate(formattedDate))
      }
    }

    const onDueDateChange = (date) => {
      console.log('Data de vencimento alterada:', date)

      if (date) {
        // Garantir que a data seja uma string no formato YYYY-MM-DD
        const formattedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0]

        // Força a reatividade criando um novo objeto
        invoiceForm.value = {
          ...invoiceForm.value,
          due_date: formattedDate,
        }

        console.log('Novo valor do vencimento:', invoiceForm.value.due_date)
        console.log('Data formatada para exibição:', formatDisplayDate(formattedDate))
      }
    }

    const addProduct = () => {
      showProductDialog.value = true
      newItem.value = {
        product_id: null,
        description: '',
        quantity: 1,
        price: 0,
        total: 0,
      }
      selectedProduct.value = null
    }

    const onProductSelected = (productId) => {
      if (productId) {
        const product = products.value.find((p) => p.id === productId)
        if (product) {
          newItem.value.product_id = product.id
          newItem.value.description = product.name
          newItem.value.price = product.price
          newItem.value.total = product.price * newItem.value.quantity
        }
      }
    }

    const confirmAddProduct = () => {
      if (selectedProduct.value && newItem.value.quantity && newItem.value.price) {
        const item = {
          id: Date.now(), // ID temporário
          product_id: newItem.value.product_id,
          description: newItem.value.description,
          quantity: newItem.value.quantity,
          price: newItem.value.price,
          total: newItem.value.quantity * newItem.value.price,
        }
        invoiceForm.value.items.push(item)
        showProductDialog.value = false
      }
    }

    const removeProduct = (index) => {
      invoiceForm.value.items.splice(index, 1)
    }

    const saveInvoice = async () => {
      try {
        saving.value = true

        // Validar formulário
        if (!invoiceForm.value.client_name || !invoiceForm.value.invoice_number) {
          throw new Error('Preencha todos os campos obrigatórios')
        }

        if (invoiceForm.value.items.length === 0) {
          throw new Error('Adicione pelo menos um produto')
        }

        // Calcular total
        const total = totalAmount.value

        const invoiceData = {
          ...invoiceForm.value,
          total_amount: total,
          created_by: authStore.user.id,
        }

        if (editingInvoice.value) {
          await proformaService.updateInvoice(editingInvoice.value.id, invoiceData)
        } else {
          await proformaService.createInvoice(invoiceData)
        }

        $q.notify({
          type: 'positive',
          message: `Fatura ${editingInvoice.value ? 'atualizada' : 'criada'} com sucesso!`,
        })

        closeCreateDialog()
        loadProFormaInvoices()
      } catch (error) {
        console.error('Erro ao salvar fatura:', error)
        $q.notify({
          type: 'negative',
          message: error.message || 'Erro ao salvar fatura',
        })
      } finally {
        saving.value = false
      }
    }

    const viewInvoice = (invoice) => {
      selectedInvoice.value = invoice
      showViewDialog.value = true
    }

    const editInvoice = (invoice) => {
      editingInvoice.value = invoice
      invoiceForm.value = {
        ...invoice,
        invoice_date: invoice.invoice_date || new Date().toISOString().split('T')[0],
        due_date: invoice.due_date || '',
        payment_conditions:
          invoice.payment_conditions ||
          'Forma de Pagamento: Transferência Bancária\nConta Bancária: Banco BAI | IBAN: AO06 0006 0000 0000 0000 0010\nPagamento de 50% para início dos trabalhos\nRestante contra entrega',
        notes:
          invoice.notes ||
          'Esta fatura pro-forma não substitui a fatura definitiva. É apenas um documento de cotação e não tem valor fiscal.',
        emitter_name:
          invoice.emitter_name || companySettings.value.emitter_name || 'Eng. Ildo Cuema',
        emitter_title:
          invoice.emitter_title || companySettings.value.emitter_title || 'Director Executivo',
        emitter_company:
          invoice.emitter_company ||
          companySettings.value.emitter_company ||
          'E-Tech Soluções Digitais, Lda',
        items: invoice.items || [],
      }
      showCreateDialog.value = true
    }

    const printInvoice = async (invoice) => {
      try {
        // TODO: Implementar impressão
        console.log('Imprimindo fatura:', invoice)
        $q.notify({
          type: 'info',
          message: 'Funcionalidade de impressão em desenvolvimento',
        })
      } catch (error) {
        console.error('Erro ao imprimir:', error)
      }
    }

    const downloadPDF = async (invoice) => {
      try {
        // Primeiro, abrir a visualização da fatura para que o elemento exista no DOM
        selectedInvoice.value = invoice
        showViewDialog.value = true

        // Aguardar um pouco para garantir que o DOM foi atualizado
        await new Promise((resolve) => setTimeout(resolve, 200))

        const pdf = await pdfService.generateProFormaPDF()
        const filename = `fatura_proforma_${invoice.invoice_number}.pdf`
        pdfService.downloadPDF(pdf, filename)

        // Fechar a visualização após gerar o PDF
        showViewDialog.value = false

        $q.notify({
          type: 'positive',
          message: 'PDF gerado e baixado com sucesso!',
        })
      } catch (error) {
        console.error('Erro ao baixar PDF:', error)
        showViewDialog.value = false
        $q.notify({
          type: 'negative',
          message: 'Erro ao gerar PDF',
        })
      }
    }

    const duplicateInvoice = (invoice) => {
      editingInvoice.value = null
      invoiceForm.value = {
        ...invoice,
        id: undefined,
        invoice_number: generateInvoiceNumber(),
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: invoice.due_date || '',
        status: 'draft',
        payment_conditions:
          invoice.payment_conditions ||
          'Forma de Pagamento: Transferência Bancária\nConta Bancária: Banco BAI | IBAN: AO06 0006 0000 0000 0000 0010\nPagamento de 50% para início dos trabalhos\nRestante contra entrega',
        notes:
          invoice.notes ||
          'Esta fatura pro-forma não substitui a fatura definitiva. É apenas um documento de cotação e não tem valor fiscal.',
        emitter_name:
          invoice.emitter_name || companySettings.value.emitter_name || 'Eng. Ildo Cuema',
        emitter_title:
          invoice.emitter_title || companySettings.value.emitter_title || 'Director Executivo',
        emitter_company:
          invoice.emitter_company ||
          companySettings.value.emitter_company ||
          'E-Tech Soluções Digitais, Lda',
        items: invoice.items ? [...invoice.items] : [],
      }
      showCreateDialog.value = true
    }

    const deleteInvoice = async (invoice) => {
      try {
        const confirmed = await $q.dialog({
          title: 'Confirmar Exclusão',
          message: `Deseja realmente excluir a fatura ${invoice.invoice_number}?`,
          cancel: true,
          persistent: true,
        })

        if (confirmed) {
          await proformaService.deleteInvoice(invoice.id)
          $q.notify({
            type: 'positive',
            message: 'Fatura excluída com sucesso!',
          })
          loadProFormaInvoices()
        }
      } catch (error) {
        console.error('Erro ao excluir fatura:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao excluir fatura',
        })
      }
    }

    const applyFilters = () => {
      // Os filtros são aplicados automaticamente via computed
    }

    const clearFilters = () => {
      filters.value = {
        search: '',
        status: '',
        dateFrom: '',
        dateTo: '',
      }
      $q.notify({
        type: 'positive',
        message: 'Filtros limpos com sucesso!',
        position: 'top',
        timeout: 2000,
      })
    }

    const getStatusColor = (status) => {
      const colors = {
        draft: 'grey',
        sent: 'blue',
        approved: 'positive',
        rejected: 'negative',
        expired: 'orange',
      }
      return colors[status] || 'grey'
    }

    const getStatusLabel = (status) => {
      const labels = {
        draft: 'Rascunho',
        sent: 'Enviada',
        approved: 'Aprovada',
        rejected: 'Rejeitada',
        expired: 'Expirada',
      }
      return labels[status] || status
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
      }).format(value || 0)
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Intl.DateTimeFormat('pt-AO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(date))
    }

    const formatDisplayDate = (date) => {
      if (!date) return ''

      try {
        // Se já é uma string no formato YYYY-MM-DD, converter para Date
        const dateObj = typeof date === 'string' ? new Date(date) : date

        if (isNaN(dateObj.getTime())) {
          return ''
        }

        // Formatar para exibição no formato brasileiro
        return new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(dateObj)
      } catch (error) {
        console.error('Erro ao formatar data:', error)
        return ''
      }
    }

    const printSelectedInvoice = () => {
      printInvoice(selectedInvoice.value)
    }

    const downloadSelectedPDF = async () => {
      try {
        const pdf = await pdfService.generateProFormaPDF(
          selectedInvoice.value,
          companySettings.value,
        )
        const filename = `fatura_proforma_${selectedInvoice.value.invoice_number}.pdf`
        pdfService.openPDFInNewTab(pdf, filename)

        $q.notify({
          type: 'positive',
          message: 'PDF gerado e aberto em nova aba!',
        })
      } catch (error) {
        console.error('Erro ao gerar PDF:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao gerar PDF',
        })
      }
    }

    const onDocumentSigned = (signedDocument) => {
      // Atualizar documento na lista
      const index = proFormaInvoices.value.findIndex((invoice) => invoice.id === signedDocument.id)
      if (index !== -1) {
        proFormaInvoices.value[index] = signedDocument
      }

      $q.notify({
        type: 'positive',
        message: 'Documento assinado com sucesso!',
      })
    }

    const onDocumentVerified = (verification) => {
      if (verification.valid) {
        $q.notify({
          type: 'positive',
          message: 'Assinatura verificada com sucesso!',
        })
      } else {
        $q.notify({
          type: 'warning',
          message: `Assinatura inválida: ${verification.reason}`,
        })
      }
    }

    // Lifecycle
    onMounted(async () => {
      console.log('ProFormaInvoicePage montada')
      try {
        // Carregar dados em paralelo para melhor performance
        await Promise.allSettled([loadProFormaInvoices(), loadProducts(), loadCompanySettings()])
        resetForm()
        console.log('Todos os dados carregados com sucesso')
      } catch (error) {
        console.error('Erro no carregamento inicial:', error)
      }
    })

    return {
      // Estado
      loading,
      saving,
      viewMode,
      showCreateDialog,
      showProductDialog,
      showViewDialog,
      editingInvoice,
      selectedInvoice,
      selectedProduct,
      products,
      proFormaInvoices,
      companySettings,
      filters,
      invoiceForm,
      newItem,
      statusOptions,

      // Computed
      filteredInvoices,
      subtotal,
      taxAmount,
      totalAmount,
      selectedInvoiceSubtotal,
      selectedInvoiceTax,
      activeFiltersCount,

      // Colunas
      columns,
      productColumns,
      invoicePreviewColumns,

      // Métodos
      loadProFormaInvoices,
      loadProducts,
      loadCompanySettings,
      generateInvoiceNumber,
      resetForm,
      closeCreateDialog,
      forceCloseModal,
      handleEscapeKey,
      onDialogHide,
      onInvoiceDateChange,
      onDueDateChange,
      addProduct,
      onProductSelected,
      confirmAddProduct,
      removeProduct,
      saveInvoice,
      viewInvoice,
      editInvoice,
      printInvoice,
      downloadPDF,
      duplicateInvoice,
      deleteInvoice,
      applyFilters,
      clearFilters,
      getStatusColor,
      getStatusLabel,
      formatCurrency,
      formatDate,
      formatDisplayDate,
      printSelectedInvoice,
      downloadSelectedPDF,
      onDocumentSigned,
      onDocumentVerified,
    }
  },
})
</script>

<style lang="scss" scoped>
.proforma-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  border-radius: 0 0 30px 30px;
  margin-bottom: -60px;
  padding-bottom: 100px;
}

.content-container {
  position: relative;
  z-index: 1;
}

.filters-card,
.invoices-card {
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.filters-card {
  .q-btn-group {
    .q-btn {
      border-radius: 8px;
      font-weight: 500;

      &:first-child {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      &:last-child {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
  }
}

.close-btn {
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1) !important;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}

.date-input {
  .q-field__control {
    cursor: pointer;

    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }

  .q-field__append {
    .q-icon {
      transition: all 0.2s ease;

      &:hover {
        color: var(--q-primary);
        transform: scale(1.1);
      }
    }
  }
}

.invoice-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  }
}

.client-info-card,
.invoice-info-card,
.products-card,
.totals-card {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.modern-table {
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    background-color: #f8f9fa;
  }

  thead tr th {
    font-weight: 600;
    color: #495057;
  }

  tbody tr:hover {
    background-color: #f8f9fa;
  }
}

.invoice-preview {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .invoice-header {
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }

  .invoice-client {
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }

  .invoice-items {
    margin-bottom: 1rem;
  }

  .invoice-totals {
    border-top: 2px solid #e9ecef;
    padding-top: 1rem;
  }

  .invoice-notes {
    border-top: 1px solid #e9ecef;
    padding-top: 1rem;
    margin-top: 1rem;
  }
}

// Estilos da Fatura (seguindo o modelo da página de vendas)
.invoice-container {
  padding: 25px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
  font-size: 11px;
  line-height: 1.1;
}

.invoice-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  page-break-inside: avoid;
  break-inside: avoid;
}

.invoice-logo {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 6px;
  background: white;
}

.invoice-table {
  width: 100%;
  margin-top: 10px;
  font-size: 10px;
  page-break-inside: auto;
  break-inside: auto;

  th {
    background: white;
    font-weight: 600;
    color: #333;
    padding: 4px 8px;
    font-size: 10px;
    border-bottom: 1px solid #333;
    line-height: 1;
  }

  td {
    padding: 3px 8px;
    border-bottom: 1px solid #ccc;
    font-size: 10px;
    line-height: 1;
  }

  tbody tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  tbody tr:hover {
    background: #f8f8f8;
  }
}

.invoice-totals {
  margin-top: 15px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  font-size: 10px;
  line-height: 1;
  page-break-inside: avoid;
  break-inside: avoid;
}

.payment-conditions {
  margin-top: 10px;
  padding: 6px;
  background: white;
  border-radius: 4px;
  font-size: 9px;
  line-height: 1;
  page-break-inside: avoid;
  break-inside: avoid;
}

.notes-section {
  margin-top: 10px;
  padding: 6px;
  background: white;
  border-radius: 4px;
  font-size: 9px;
  line-height: 1;
  page-break-inside: avoid;
  break-inside: avoid;
}

.emitter-section {
  margin-top: 10px;
  padding: 6px;
  background: white;
  border-radius: 4px;
  font-size: 9px;
  line-height: 1;
  page-break-inside: avoid;
  break-inside: avoid;
}

.invoice-footer {
  margin-top: 15px;
  padding-top: 10px;
  text-align: center;
  border-top: 1px solid #ccc;
  font-size: 10px;
  line-height: 1;
  page-break-inside: avoid;
  break-inside: avoid;
}

.client-info {
  margin-bottom: 10px;
  padding: 6px;
  background: white;
  border-radius: 4px;
  font-size: 9px;
  line-height: 1;
  page-break-inside: avoid;
  break-inside: avoid;
}

// Estilos para títulos e cabeçalhos menores
.invoice-container h1,
.invoice-container h2,
.invoice-container h3,
.invoice-container h4,
.invoice-container h5,
.invoice-container h6 {
  font-family: 'Arial', sans-serif;
  font-weight: 600;
  color: #333;
  margin: 0;
  padding: 0;
}

.invoice-container h1 {
  font-size: 18px;
  margin-bottom: 10px;
}

.invoice-container h2 {
  font-size: 14px;
  margin-bottom: 8px;
}

.invoice-container h3 {
  font-size: 12px;
  margin-bottom: 6px;
}

.invoice-container h4 {
  font-size: 11px;
  margin-bottom: 5px;
}

.invoice-container h5 {
  font-size: 10px;
  margin-bottom: 4px;
}

.invoice-container h6 {
  font-size: 9px;
  margin-bottom: 3px;
}

// Estilos para textos e parágrafos
.invoice-container p {
  font-size: 10px;
  margin: 1px 0;
  line-height: 1;
}

.invoice-container .text-caption {
  font-size: 9px;
}

.invoice-container .text-body2 {
  font-size: 10px;
}

.invoice-container .text-body1 {
  font-size: 11px;
}

.invoice-container .text-h6 {
  font-size: 12px;
}

.invoice-container .text-h5 {
  font-size: 14px;
}

.invoice-container .text-h4 {
  font-size: 16px;
}

.invoice-container .text-h3 {
  font-size: 18px;
}

.invoice-container .text-h2 {
  font-size: 20px;
}

.invoice-container .text-h1 {
  font-size: 22px;
}

// Estilos específicos para elementos importantes em negrito
.invoice-container .company-name {
  font-weight: 700 !important;
  color: #000 !important;
  font-size: 18px;
}

.invoice-container .invoice-title {
  font-weight: 700 !important;
  color: #000 !important;
  font-size: 16px;
}

.invoice-container .total-amount {
  font-weight: 700 !important;
  color: #000 !important;
  font-size: 14px;
}

.invoice-container .section-title {
  font-weight: 600 !important;
  color: #000 !important;
  font-size: 11px;
}

// Estilos específicos para seções com texto menor
.invoice-container .payment-conditions .text-body1,
.invoice-container .notes-section .text-body1,
.invoice-container .emitter-section .text-body1 {
  font-size: 8px !important;
  line-height: 1 !important;
  margin: 0.5px 0 !important;
}

.invoice-container .payment-conditions .section-title,
.invoice-container .notes-section .section-title,
.invoice-container .emitter-section .section-title {
  font-size: 10px !important;
  margin-bottom: 2px !important;
}

// Reduzir espaçamento entre elementos nas informações gerais
.invoice-container .text-body1,
.invoice-container .text-body2 {
  line-height: 1 !important;
  margin: 0.5px 0 !important;
}

.invoice-container .row {
  margin: 0 !important;
}

.invoice-container .col {
  padding: 1px !important;
}

// Reduzir espaçamento nos separadores
.invoice-container .q-separator {
  margin: 4px 0 !important;
}

// Remover cores azuis de todos os elementos
.invoice-container * {
  color: #000 !important;
}

.invoice-container .text-primary,
.invoice-container .text-blue,
.invoice-container .text-info {
  color: #000 !important;
}

// Melhorar quebra de página para todo o container
.invoice-container {
  page-break-after: auto;
  break-after: auto;
}

// Evitar quebra de página em elementos importantes
.invoice-container .row {
  page-break-inside: avoid;
  break-inside: avoid;
}

.invoice-container .col {
  page-break-inside: avoid;
  break-inside: avoid;
}

// Melhorar espaçamento para impressão
@media print {
  .invoice-container {
    padding: 20px !important;
  }

  .invoice-container * {
    page-break-inside: auto;
    break-inside: auto;
  }

  .invoice-container .payment-conditions,
  .invoice-container .notes-section,
  .invoice-container .emitter-section,
  .invoice-container .client-info,
  .invoice-container .invoice-totals,
  .invoice-container .invoice-header,
  .invoice-container .invoice-footer {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  // Controle específico para tabelas pequenas (até 5 linhas)
  .invoice-container .invoice-table {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  // Reduzir ainda mais o espaçamento para impressão
  .invoice-container .invoice-table th,
  .invoice-container .invoice-table td {
    padding: 2px 6px !important;
    line-height: 1 !important;
  }

  .invoice-container .invoice-header {
    margin-bottom: 10px !important;
    padding-bottom: 8px !important;
  }

  .invoice-container .client-info {
    margin-bottom: 8px !important;
    padding: 4px !important;
  }

  .invoice-container .invoice-totals {
    margin-top: 10px !important;
    padding: 6px !important;
  }

  .invoice-container .payment-conditions,
  .invoice-container .notes-section,
  .invoice-container .emitter-section {
    margin-top: 8px !important;
    padding: 4px !important;
  }
}

.products-section {
  margin-bottom: 20px;
}

// Responsividade para fatura
@media (max-width: 599px) {
  .invoice-container {
    padding: 20px;
  }
}
</style>
