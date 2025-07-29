<template>
  <q-page class="sales-page">
    <!-- Header com Gradiente -->
    <div class="header-section q-px-lg q-pt-lg q-pb-xl">
      <div class="row items-center justify-between">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bold text-white">Ponto de Venda (PDV)</div>
          <div class="text-subtitle1 text-grey-3 q-mt-sm">Realize vendas e gerencie transações</div>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="sales-summary-card">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-icon name="trending_up" size="24px" color="positive" class="q-mr-sm" />
                <div class="text-h6 text-weight-bold">Vendas Diárias</div>
              </div>
              <div class="text-h4 text-weight-bold text-positive">
                {{ formatCurrency(dailySales) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <div class="content-container q-px-lg q-mt-xl">
      <div class="row q-col-gutter-lg">
        <!-- Lista de Produtos -->
        <div class="col-12 col-md-8">
          <q-card class="products-card">
            <q-card-section>
              <div class="row items-center q-mb-md">
                <div class="col">
                  <q-input
                    v-model="searchQuery"
                    outlined
                    dense
                    placeholder="Pesquisar produtos..."
                    clearable
                    class="search-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="primary" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        v-if="searchQuery"
                        name="close"
                        class="cursor-pointer"
                        @click="searchQuery = ''"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="filter_list"
                    @click="showFilters = !showFilters"
                  >
                    <q-tooltip>Filtros</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <q-scroll-area style="height: 500px">
                <q-table
                  :rows="filteredProducts"
                  :columns="productColumns"
                  row-key="id"
                  flat
                  bordered
                  :filter="searchQuery"
                  :pagination="{ rowsPerPage: 10 }"
                  class="modern-table"
                  @row-click="(evt, row) => addToCart(row)"
                >
                  <template v-slot:body-cell-image="props">
                    <q-td :props="props">
                      <q-img
                        :src="props.row.image || 'placeholder.jpg'"
                        :ratio="16 / 9"
                        width="100px"
                        class="product-image"
                      >
                        <template v-slot:error>
                          <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
                            <q-icon name="image" size="24px" />
                          </div>
                        </template>
                      </q-img>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-price="props">
                    <q-td :props="props">
                      <div class="text-weight-bold text-primary">
                        {{ formatCurrency(props.row.price_with_tax ?? props.row.price) }}
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-quantity="props">
                    <q-td :props="props">
                      <q-chip
                        :color="props.row.quantity <= 5 ? 'warning' : 'positive'"
                        text-color="white"
                        dense
                      >
                        {{ props.row.quantity }}
                      </q-chip>
                    </q-td>
                  </template>
                </q-table>
              </q-scroll-area>
            </q-card-section>
          </q-card>
        </div>

        <!-- Carrinho de Compras -->
        <div class="col-12 col-md-4">
          <q-card class="cart-card">
            <q-card-section>
              <div class="row items-center q-mb-md">
                <q-icon name="shopping_cart" size="24px" color="primary" class="q-mr-sm" />
                <div class="text-h6 text-weight-bold">Carrinho de Compras</div>
              </div>

              <q-scroll-area style="height: 400px">
                <q-list bordered separator>
                  <q-item v-for="(item, index) in cart" :key="index" class="cart-item">
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{ item.name }}</q-item-label>
                      <q-item-label caption>
                        {{ item.quantity }} x
                        {{ formatCurrency(item.price_with_tax ?? item.price) }}
                      </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <div class="text-h6 text-weight-bold text-primary">
                        {{ formatCurrency(item.quantity * (item.price_with_tax ?? item.price)) }}
                      </div>
                    </q-item-section>

                    <q-item-section side>
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="remove"
                        @click="removeFromCart(index)"
                      >
                        <q-tooltip>Remover item</q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-scroll-area>

              <q-separator class="q-my-md" />

              <!-- Método de Pagamento -->
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-select
                    v-model="paymentMethod"
                    :options="paymentMethods"
                    label="Método de Pagamento"
                    outlined
                    dense
                    class="payment-select"
                  >
                    <template v-slot:prepend>
                      <q-icon name="payment" color="primary" />
                    </template>
                  </q-select>
                </div>
                <div class="col-12">
                  <q-input
                    v-model.number="amountReceived"
                    type="number"
                    label="Valor Recebido"
                    outlined
                    dense
                    class="amount-input"
                    :disable="paymentMethod !== 'Dinheiro'"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_money" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Totais -->
              <div class="totals-section q-mt-md">
                <div class="row q-col-gutter-md">
                  <div class="col-6 text-subtitle1">Total:</div>
                  <div class="col-6 text-right text-h6 text-weight-bold text-positive">
                    {{ formatCurrency(totalAmount) }}
                  </div>
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-6 text-subtitle1">Troco:</div>
                  <div
                    class="col-6 text-right text-h6 text-weight-bold"
                    :class="changeAmount >= 0 ? 'text-positive' : 'text-negative'"
                  >
                    {{ formatCurrency(Math.max(0, changeAmount)) }}
                  </div>
                </div>
              </div>

              <!-- Botão Finalizar -->
              <q-btn
                color="primary"
                class="full-width q-mt-md"
                label="Finalizar Venda"
                :disable="cart.length === 0"
                @click="processSale"
                :loading="processingSale"
              >
                <template v-slot:loading>
                  <q-spinner-facebook />
                </template>
              </q-btn>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Diálogo de Detalhes da Venda -->
    <q-dialog v-model="showDetailsDialog" maximized>
      <q-card class="sale-details-card">
        <q-card-section class="row items-center">
          <div class="text-h6">Detalhes da Venda</div>
        </q-card-section>

        <q-card-section>
          <q-table
            :rows="selectedSale.items"
            :columns="saleDetailColumns"
            row-key="id"
            flat
            bordered
            class="modern-table"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de Pré-visualização da Fatura -->
    <q-dialog v-model="showInvoicePreview" maximized>
      <q-card class="invoice-preview-card">
        <q-bar class="bg-primary text-white">
          <q-icon name="receipt" />
          <div>Pré-visualização da Fatura</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Fechar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-pa-lg">
          <div class="invoice-container" ref="invoiceContent">
            <!-- Cabeçalho da Empresa -->
            <div class="invoice-header q-mb-lg">
              <div class="row items-start">
                <!-- Logo da Empresa -->
                <div class="col-auto q-pr-md" v-if="companySettings.logo_url">
                  <q-img
                    :src="companySettings.logo_url"
                    style="width: 120px; height: 120px; object-fit: contain"
                    class="invoice-logo"
                  />
                </div>

                <!-- Informações da Empresa -->
                <div class="col">
                  <div class="text-h4 text-weight-bold text-primary q-mb-sm">
                    {{ companySettings.company_name || 'Minha Empresa' }}
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
                    {{ companySettings.company_email || 'email@empresa.com' }}
                  </div>
                  <div class="text-body2 text-grey-7">
                    <q-icon name="badge" size="16px" class="q-mr-xs" />
                    NIF: {{ companySettings.company_nif || '000000000' }}
                  </div>
                </div>

                <!-- Título da Fatura -->
                <div class="col-auto text-right">
                  <div class="text-h5 text-weight-bold">FATURA</div>
                  <div class="text-body2 text-grey-7">Data: {{ formatDate(new Date()) }}</div>
                  <div class="text-body2 text-grey-7">Hora: {{ formatTime(new Date()) }}</div>
                  <div class="text-body2 text-grey-7 q-mt-sm">
                    Nº Fatura: #{{ generateInvoiceNumber() }}
                  </div>
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Tabela de Itens -->
            <q-markup-table flat bordered class="invoice-table">
              <thead>
                <tr>
                  <th class="text-left">Descrição</th>
                  <th class="text-right">Preço Base</th>
                  <th class="text-right">IVA (14%)</th>
                  <th class="text-center">Qt</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in pendingSaleData.items" :key="index">
                  <td class="text-left">{{ item.name }}</td>
                  <td class="text-right">{{ formatCurrency(item.price) }}</td>
                  <td class="text-right">
                    {{ formatCurrency((item.price_with_tax ?? item.price) - item.price) }}
                  </td>
                  <td class="text-center">{{ item.quantity }}</td>
                  <td class="text-right text-weight-bold">
                    {{ formatCurrency(item.quantity * (item.price_with_tax ?? item.price)) }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>

            <!-- Totais -->
            <div class="invoice-totals q-mt-lg">
              <div class="row justify-end">
                <div class="col-6">
                  <div class="row q-py-sm">
                    <div class="col-6 text-right text-weight-medium">Subtotal:</div>
                    <div class="col-6 text-right">{{ formatCurrency(invoiceSubtotal) }}</div>
                  </div>
                  <div class="row q-py-sm">
                    <div class="col-6 text-right text-weight-medium">IVA Total:</div>
                    <div class="col-6 text-right">{{ formatCurrency(invoiceTaxTotal) }}</div>
                  </div>
                  <q-separator class="q-my-sm" />
                  <div class="row q-py-sm">
                    <div class="col-6 text-right text-h6 text-weight-bold">Total:</div>
                    <div class="col-6 text-right text-h6 text-weight-bold text-primary">
                      {{ formatCurrency(pendingSaleData.totalAmount) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Informação de Pagamento -->
            <div class="payment-info q-mt-lg">
              <q-separator class="q-mb-md" />
              <div class="row">
                <div class="col-6">
                  <div class="text-body2">
                    <strong>Forma de Pagamento:</strong> {{ pendingSaleData.paymentMethod }}
                  </div>
                </div>
                <div class="col-6 text-right">
                  <div class="text-body2" v-if="pendingSaleData.paymentMethod === 'Dinheiro'">
                    <strong>Valor Recebido:</strong>
                    {{ formatCurrency(pendingSaleData.paymentAmount) }}
                  </div>
                  <div class="text-body2" v-if="pendingSaleData.paymentMethod === 'Dinheiro'">
                    <strong>Troco:</strong>
                    {{
                      formatCurrency(
                        Math.max(0, pendingSaleData.paymentAmount - pendingSaleData.totalAmount),
                      )
                    }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Rodapé -->
            <div class="invoice-footer text-center q-mt-xl">
              <q-separator class="q-mb-md" />
              <div class="text-h6 text-weight-bold">Obrigado pela sua compra!</div>
              <div class="text-body2 text-grey-7">VOLTE SEMPRE</div>
            </div>
          </div>
        </q-card-section>

        <!-- Ações -->
        <q-card-actions align="center" class="q-pa-md">
          <q-btn flat label="Cancelar" color="negative" @click="cancelInvoice" class="q-px-xl" />
          <q-btn
            unelevated
            label="Imprimir"
            color="primary"
            icon="print"
            @click="printInvoice"
            class="q-px-xl"
          />
          <q-btn
            unelevated
            label="Salvar PDF"
            color="positive"
            icon="picture_as_pdf"
            @click="saveAsPDF"
            class="q-px-xl"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useSalesStore } from '../stores/sales-store'
import { useStockStore } from '../stores/stock-store'
import { useAuthStore } from '../stores/auth-store'
import { useQuasar } from 'quasar'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
//import { format } from 'date-fns'

export default {
  setup() {
    const $q = useQuasar()
    const salesStore = useSalesStore()
    const stockStore = useStockStore()

    const sales = ref([])
    const products = ref([])
    const cart = ref([])
    const searchQuery = ref('')
    const showFilters = ref(false)
    const paymentMethod = ref('Dinheiro')
    const amountReceived = ref(0)
    const showDetailsDialog = ref(false)
    const selectedSale = ref({})
    const processingSale = ref(false)
    const showInvoicePreview = ref(false)
    const pendingSaleData = ref({})
    const companySettings = ref({})
    const invoiceContent = ref(null)

    const paymentMethods = [
      'Dinheiro',
      'Cartão de Crédito',
      'Cartão de Débito',
      'PIX',
      'Transferência',
    ]

    const productColumns = [
      {
        name: 'id',
        label: 'ID',
        field: 'id',
        align: 'left',
        sortable: true,
      },
      {
        name: 'code',
        label: 'Código',
        field: 'code',
        align: 'left',
        sortable: true,
      },
      {
        name: 'name',
        label: 'Nome do produto',
        field: 'name',
        align: 'left',
        sortable: true,
      },
      {
        name: 'price',
        label: 'Preço',
        field: (row) => row.price_with_tax ?? row.price,
        align: 'left',
        sortable: true,
        format: (val) => formatCurrency(val),
      },
      {
        name: 'quantity',
        label: 'Quant.',
        field: 'quantity',
        align: 'center',
        sortable: true,
      },
    ]

    const saleDetailColumns = [
      { name: 'product', label: 'Produto', field: 'name' },
      { name: 'quantity', label: 'Quantidade', field: 'quantity' },
      {
        name: 'price',
        label: 'Preço Unitário',
        field: (row) => (row.taxable ? row.price_with_tax : row.base_price),
        format: (val) => formatCurrency(val),
      },
      {
        name: 'iva',
        label: 'IVA (14%)',
        field: (row) => (row.taxable ? row.quantity * row.base_price * 0.14 : 0),
        format: (val) => formatCurrency(val),
      },
      {
        name: 'total',
        label: 'Total',
        field: (row) => row.quantity * (row.taxable ? row.price_with_tax : row.base_price),
        format: (val) => formatCurrency(val),
      },
    ]

    const searchProducts = async (query) => {
      try {
        await stockStore.searchProducts(query)
        products.value = stockStore.products
      } catch (error) {
        console.error(error)
      }
    }

    watch(searchQuery, (newQuery) => {
      if (newQuery) {
        searchProducts(newQuery)
      } else {
        loadProducts()
      }
    })

    const filteredProducts = computed(() => {
      return products.value
    })

    const dailySales = computed(() => {
      const authStore = useAuthStore()
      const today = new Date().toISOString().split('T')[0]
      console.log('Data de hoje:', today)

      if (!sales.value || !authStore.user) {
        console.log('No sales data or user not authenticated')
        return 0
      }

      // Obter o email do usuário logado
      let userEmail = authStore.user.email
      if (!userEmail) {
        console.log('Email não encontrado no auth store')
        return 0
      }

      console.log('Email do usuário logado:', userEmail)
      console.log('Role do usuário:', authStore.user.role)

      // Filtrar vendas do dia atual
      const todaySales = sales.value.filter((sale) => {
        const saleDate = sale?.created_at ? new Date(sale.created_at) : null
        const isValidDate = saleDate instanceof Date && !isNaN(saleDate)
        const formattedDate = isValidDate ? saleDate.toISOString().split('T')[0] : null
        const isToday = formattedDate === today

        // Se for admin, mostrar todas as vendas de hoje
        if (authStore.user.role === 'admin') {
          console.log('Admin - mostrando todas as vendas de hoje')
          return isToday
        }

        // Se for operador de caixa, mostrar apenas vendas do funcionário logado
        // Comparar email do funcionário com email do usuário logado
        const isUserSale =
          sale?.employee_name &&
          ((userEmail.includes('marquescuema') &&
            sale.employee_name.toLowerCase().includes('marques')) ||
            (userEmail.includes('manuelvaz') &&
              sale.employee_name.toLowerCase().includes('manuel')) ||
            (userEmail.includes('ildocuema') && sale.employee_name.toLowerCase().includes('ildo')))

        console.log('Venda:', {
          id: sale?.id,
          date: formattedDate,
          isToday,
          employee_id: sale?.employee_id,
          employee_name: sale?.employee_name,
          isUserSale,
          userEmail: userEmail.split('@')[0],
        })

        return isToday && isUserSale
      })

      console.log('Vendas filtradas:', todaySales)

      // Calcular total das vendas filtradas
      const totalDailySales = todaySales.reduce((sum, sale) => {
        const amount = parseFloat(sale?.total_amount) || 0
        console.log('Adicionando ao total:', amount)
        return sum + amount
      }, 0)

      console.log('Total de vendas diárias:', totalDailySales)
      return totalDailySales
    })
    const totalAmount = computed(() => {
      return cart.value.reduce((sum, item) => {
        return sum + item.quantity * (item.price_with_tax ? item.price_with_tax : item.price)
      }, 0)
    })

    const changeAmount = computed(() => {
      return amountReceived.value - totalAmount.value
    })

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
      }).format(value)
    }

    const addToCart = (product) => {
      const existingItem = cart.value.find((item) => item.id === product.id)
      if (existingItem) {
        existingItem.quantity++
      } else {
        cart.value.push({
          ...product,
          quantity: 1,
        })
      }
    }

    const removeFromCart = (index) => {
      cart.value.splice(index, 1)
    }

    const startNewSale = () => {
      cart.value = []
      amountReceived.value = 0
      paymentMethod.value = 'Dinheiro'
    }

    const processSale = async () => {
      try {
        // Basic validations
        if (cart.value.length === 0) {
          throw new Error('Adicione produtos ao carrinho antes de finalizar a venda')
        }

        if (!paymentMethod.value) {
          throw new Error('Selecione um método de pagamento')
        }

        // Validate stock availability
        const stockErrors = []
        for (const item of cart.value) {
          const product = products.value.find((p) => p.id === item.id)
          if (!product || product.quantity < item.quantity) {
            stockErrors.push({
              product: item.name,
              available: product ? product.quantity : 0,
              requested: item.quantity,
            })
          }
        }

        if (stockErrors.length > 0) {
          const errorMessage = stockErrors
            .map(
              (err) =>
                `${err.product}: ${err.requested} solicitados (${err.available} disponíveis)`,
            )
            .join('\n')
          throw new Error(`Estoque insuficiente para:\n${errorMessage}`)
        }

        // Validate payment amount for cash payments
        if (paymentMethod.value === 'Dinheiro' && amountReceived.value < totalAmount.value) {
          throw new Error(
            `Valor recebido (${formatCurrency(amountReceived.value)}) é menor que o total com IVA (${formatCurrency(totalAmount.value)})`,
          )
        }

        // Prepare sale data for preview
        const authStore = useAuthStore()
        if (!authStore.user) {
          console.error('No user found in auth store')
          throw new Error('Usuário não autenticado. Faça login novamente.')
        }

        // Buscar o funcionário pelo email do usuário logado
        let userEmail = authStore.user.email

        // Se o email não estiver disponível, buscar dados completos do usuário
        if (!userEmail) {
          console.log('Email não encontrado no auth store, buscando dados completos do usuário...')
          console.log('Auth store user:', authStore.user)

          try {
            const { default: authService } = await import('../services/auth.service')
            console.log('Auth service importado com sucesso')

            const userData = await authService.getCurrentUser()
            console.log('Dados do usuário obtidos:', userData)

            userEmail = userData.user.email
            console.log('Email obtido:', userEmail)

            // Atualizar o auth store com os dados completos
            authStore.setUser({
              id: userData.user.id,
              username: userData.user.username,
              email: userData.user.email,
              role: userData.user.role,
            })
            console.log('Auth store atualizado com sucesso')
          } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error)
            throw error
          }
        }

        const { default: employeeService } = await import('../services/employee.service')
        const employee = await employeeService.getEmployeeByEmail(userEmail)

        if (!employee || !employee.id) {
          console.error('No employee found for user email:', userEmail)
          throw new Error('Funcionário não encontrado para este usuário. Contacte o administrador.')
        }

        const employeeId = employee.id

        pendingSaleData.value = {
          employee_id: employeeId,
          items: cart.value.map((item) => ({
            product_id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            price_with_tax: item.price_with_tax,
          })),
          paymentMethod: paymentMethod.value,
          paymentAmount: amountReceived.value,
          totalAmount: totalAmount.value,
        }

        // Show invoice preview
        showInvoicePreview.value = true
      } catch (error) {
        const errorMessage = error?.message || 'Ocorreu um erro ao processar a venda'
        $q.notify({
          type: 'negative',
          message: errorMessage,
          caption: 'Corrija os erros e tente novamente',
          timeout: 5000,
          actions: [{ icon: 'close', color: 'white' }],
        })
        console.error('Sales Error:', error || 'Unknown error')
      }
    }

    const completeSale = async () => {
      try {
        processingSale.value = true
        await salesStore.createSale(pendingSaleData.value)

        $q.notify({
          type: 'positive',
          message: 'Venda realizada com sucesso!',
        })

        await loadSales()
        startNewSale()
        loadProducts()
        showInvoicePreview.value = false
      } catch (error) {
        const errorMessage = error?.message || 'Ocorreu um erro ao processar a venda'
        $q.notify({
          type: 'negative',
          message: errorMessage,
          caption: 'Corrija os erros e tente novamente',
          timeout: 5000,
          actions: [{ icon: 'close', color: 'white' }],
        })
        console.error('Sales Error:', error || 'Unknown error')
      } finally {
        processingSale.value = false
      }
    }

    const showSaleDetails = (sale) => {
      selectedSale.value = sale
      showDetailsDialog.value = true
    }

    const loadSales = async () => {
      try {
        await salesStore.fetchSales()
        sales.value = salesStore.sales
        //console.log('Sales data:', sales.value)
      } catch (error) {
        console.error(error)
      }
    }

    const loadProducts = async (query = '') => {
      try {
        await stockStore.loadProducts(query)
        products.value = stockStore.products
      } catch (error) {
        console.error(error)
      }
    }

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('pt-AO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date)
    }

    const formatTime = (date) => {
      return new Intl.DateTimeFormat('pt-AO', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    }

    const invoiceSubtotal = computed(() => {
      return (
        pendingSaleData.value.items?.reduce((sum, item) => {
          return sum + item.quantity * item.price
        }, 0) || 0
      )
    })

    const invoiceTaxTotal = computed(() => {
      return (
        pendingSaleData.value.items?.reduce((sum, item) => {
          const taxAmount = (item.price_with_tax ?? item.price) - item.price
          return sum + item.quantity * taxAmount
        }, 0) || 0
      )
    })

    const cancelInvoice = () => {
      showInvoicePreview.value = false
      pendingSaleData.value = {}
    }

    const printInvoice = async () => {
      try {
        // Print the invoice
        const { default: printerService } = await import('../services/printer.service')
        await printerService.printInvoice(pendingSaleData.value)

        // Complete the sale after printing
        await completeSale()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Erro ao imprimir a fatura',
          caption: error.message,
        })
      }
    }

    const saveAsPDF = async () => {
      try {
        // Get the invoice content element
        const element = document.querySelector('.invoice-container')
        if (!element) {
          throw new Error('Conteúdo da fatura não encontrado')
        }

        // Show loading
        $q.loading.show({
          message: 'Gerando PDF...',
          spinnerColor: 'white',
        })

        // Convert to canvas
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
        })

        // Create PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        })

        const imgData = canvas.toDataURL('image/png')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

        // Generate filename with date
        const date = new Date()
        const filename = `fatura_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours()}${date.getMinutes()}.pdf`

        pdf.save(filename)

        // Hide loading
        $q.loading.hide()

        // Complete the sale after saving PDF
        await completeSale()

        $q.notify({
          type: 'positive',
          message: 'Fatura salva em PDF com sucesso!',
        })
      } catch (error) {
        $q.loading.hide()
        $q.notify({
          type: 'negative',
          message: 'Erro ao salvar PDF',
          caption: error.message,
        })
      }
    }

    const loadCompanySettings = async () => {
      try {
        const { default: systemService } = await import('../services/system.service')
        const settings = await systemService.getSettings()
        if (settings && settings.length > 0) {
          companySettings.value = settings[0]
        }
      } catch (error) {
        console.error('Error loading company settings:', error)
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
      return `${year}${month}${day}${random}`
    }

    onMounted(() => {
      loadSales()
      loadProducts()
      loadCompanySettings()
    })

    return {
      sales,
      products,
      cart,
      searchQuery,
      showFilters,
      paymentMethod,
      amountReceived,
      showDetailsDialog,
      selectedSale,
      paymentMethods,
      saleDetailColumns,
      filteredProducts,
      totalAmount,
      changeAmount,
      formatCurrency,
      addToCart,
      removeFromCart,
      startNewSale,
      processSale,
      showSaleDetails,
      productColumns,
      dailySales,
      processingSale,
      showInvoicePreview,
      pendingSaleData,
      companySettings,
      invoiceSubtotal,
      invoiceTaxTotal,
      formatDate,
      formatTime,
      cancelInvoice,
      printInvoice,
      saveAsPDF,
      invoiceContent,
      generateInvoiceNumber,
    }
  },
}
</script>

<style lang="scss" scoped>
.sales-page {
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

.sales-summary-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  }
}

.products-card,
.cart-card {
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  }
}

.search-input {
  .q-field__control {
    border-radius: 8px;
  }
}

.modern-table {
  .q-table__top {
    background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
    color: white;
    border-radius: 8px 8px 0 0;
  }

  .q-table__thead th {
    background-color: rgba(255, 255, 255, 0.9);
    font-weight: bold;
    color: #2c3e50;
  }

  .q-table__tbody tr {
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(25, 118, 210, 0.05);
      cursor: pointer;
    }
  }

  .q-table__bottom {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    background-color: rgba(255, 255, 255, 0.9);
  }
}

.product-image {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cart-item {
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(25, 118, 210, 0.05);
  }
}

.payment-select,
.amount-input {
  .q-field__control {
    border-radius: 8px;
  }
}

.totals-section {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
}

.sale-details-card {
  border-radius: 12px;
  max-width: 1000px;
  margin: 0 auto;
}

.invoice-preview-card {
  border-radius: 12px;
  max-width: 1000px;
  margin: 0 auto;
}

.invoice-container {
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.invoice-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
}

.invoice-logo {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
  background: white;
}

.invoice-table {
  width: 100%;
  margin-top: 20px;

  th {
    background: #f5f5f5;
    font-weight: 600;
    color: #333;
    padding: 12px 16px;
  }

  td {
    padding: 10px 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  tbody tr:hover {
    background: #fafafa;
  }
}

.invoice-totals {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.payment-info {
  margin-top: 20px;
  padding: 16px;
  background: #fff3e0;
  border-radius: 8px;
  border: 1px solid #ffe0b2;
}

.invoice-footer {
  margin-top: 40px;
  padding-top: 20px;
  text-align: center;
  border-top: 2px solid #e0e0e0;
}

// Animações
.cart-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsividade
@media (max-width: 599px) {
  .header-section {
    border-radius: 0 0 20px 20px;
    margin-bottom: -40px;
    padding-bottom: 80px;
  }

  .content-container {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .sales-summary-card {
    margin-top: 16px;
  }
}
</style>
