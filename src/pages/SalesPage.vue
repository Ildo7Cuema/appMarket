<template>
  <q-page padding>
    <!-- Header Section -->
    <div class="row q-mb-md items-center">
      <div class="col">
        <div class="text-h5 text-weight-bold text-blue-7">Ponto de Venda ( PDV )</div>
      </div>

      <div class="col text-right">
        <div class="text-h6 text-weight-bold text-green-7">
          <span class="text-blue-7">Sua venda diária:</span>
          {{ formatCurrency(dailySales) }}
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row q-col-gutter-lg">
      <!-- Products List -->
      <div class="col-8">
        <q-card flat class="q-pa-md">
          <div class="row items-center q-mb-md">
            <div class="col">
              <q-input
                v-model="searchQuery"
                outlined
                dense
                placeholder="Pesquisar produtos..."
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
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
              />
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
              class="gradient-table"
              @row-click="(evt, row) => addToCart(row)"
            >
              <template v-slot:body-cell-image="props">
                <q-td :props="props">
                  <q-img
                    :src="props.row.image || 'placeholder.jpg'"
                    :ratio="16 / 9"
                    width="100px"
                    class="rounded-borders"
                  />
                </q-td>
              </template>
            </q-table>
          </q-scroll-area>
        </q-card>
      </div>

      <!-- Shopping Cart -->
      <div class="col-4">
        <q-card flat class="q-pa-md">
          <div class="text-h6 q-mb-md">
            <q-icon class="" name="shopping_cart"></q-icon> Carrinho de compra
          </div>

          <q-list bordered separator>
            <q-item v-for="(item, index) in cart" :key="index" class="q-pa-none">
              <q-item-section>
                <q-item-label>{{ item.name }}</q-item-label>
                <q-item-label caption>
                  {{ item.quantity }} x {{ formatCurrency(item.price_with_tax ?? item.price) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="text-h6">
                  {{ formatCurrency(item.quantity * (item.price_with_tax ?? item.price)) }}
                </div>
              </q-item-section>

              <q-item-section side>
                <q-btn flat round color="negative" icon="remove" @click="removeFromCart(index)" />
              </q-item-section>
            </q-item>
          </q-list>

          <q-separator class="q-my-md" />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select
                v-model="paymentMethod"
                :options="paymentMethods"
                label="Método de Pagamento"
                outlined
                dense
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="amountReceived"
                type="number"
                label="Valor Recebido"
                outlined
                dense
              />
            </div>
          </div>

          <div class="q-mt-md">
            <div class="row q-col-gutter-md">
              <div class="col-6 text-subtitle1">Total:</div>
              <div class="col-6 text-right text-h6 text-green-8">
                {{ formatCurrency(totalAmount) }}
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6 text-subtitle1">Troco:</div>
              <div class="col-6 text-right text-h6 text-red-5">
                {{ formatCurrency(Math.max(0, changeAmount)) }}
              </div>
            </div>
          </div>

          <q-btn
            color="primary"
            class="full-width q-mt-md"
            label="Finalizar Venda"
            :disable="cart.length === 0"
            @click="processSale"
          />
        </q-card>
      </div>
    </div>

    <!-- Sale Details Dialog -->
    <q-dialog v-model="showDetailsDialog">
      <q-card style="min-width: 800px">
        <q-card-section>
          <div class="text-h6">Detalhes da Venda</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-table
                :rows="selectedSale.items"
                :columns="saleDetailColumns"
                row-key="id"
                flat
                bordered
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
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
      console.log(today)
      if (!sales.value || !authStore.user) {
        console.log('No sales data or user not authenticated')
        return 0
      }

      const userIdStorage = localStorage.getItem('user_id')

      const userDailySales = sales.value
        .filter((sale) => {
          const saleDate = sale?.created_at ? new Date(sale.created_at) : null
          const isValidDate = saleDate instanceof Date && !isNaN(saleDate)
          const formattedDate = isValidDate ? saleDate.toISOString().split('T')[0] : null
          const isToday = formattedDate === today
          const isUserSale = sale?.employee_id?.toString() === userIdStorage?.toString()

          /* console.log('Venda:', {
            id: sale?.id,
            date: saleDate,
            isToday,
            employee_id: sale?.employee_id,
            isUserSale,
          })
*/
          return isToday && isUserSale
        })
        .reduce((sum, sale) => {
          const amount = parseFloat(sale?.total_amount) || 0
          //console.log('Adicionando ao total:', amount)
          return sum + amount
        }, 0)

      /*const userSales = sales.value
        .map((sale) => {
          //console.log('Sale employee ID:', sale.employee_id)
          return {
            ...sale,
            isCurrentUser: sale.employee_id === userIdStorage,
          }
        })
        .filter((sale) => sale.isCurrentUser)

      console.log('Vendas do usuário:', userSales)
*/
      return userDailySales
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

        // Process sale
        // Get authenticated user from auth store
        const authStore = useAuthStore()
        console.log('Auth Store:', authStore)
        console.log('Auth Store User:', authStore.user)

        if (!authStore.user) {
          console.error('No user found in auth store')
          throw new Error('Usuário não autenticado. Faça login novamente.')
        }

        const employeeId = authStore.user.id
        if (!employeeId) {
          console.error('No employee ID found in user object:', authStore.user)
          throw new Error('ID do funcionário não encontrado. Faça login novamente.')
        }

        console.log('Authenticated Employee ID:', employeeId)

        const saleData = {
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

        await salesStore.createSale(saleData)

        $q.notify({
          type: 'positive',
          message: 'Venda realizada com sucesso!',
        })

        await loadSales()
        startNewSale()
        loadProducts()
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

    onMounted(() => {
      loadSales()
      loadProducts()
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
    }
  },
}
</script>

<style lang="scss" scoped>
.q-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.gradient-table {
  background: linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%);

  .q-table__top {
    background: linear-gradient(145deg, #6a11cb 0%, #2575fc 100%);
    color: white;
    border-radius: 8px 8px 0 0;
  }

  .q-table__thead th {
    background-color: rgba(255, 255, 255, 0.9);
    font-weight: bold;
    color: #2c3e50;
  }

  .q-table__tbody tr:hover {
    background-color: rgba(245, 247, 250, 0.7);
  }

  .q-table__bottom {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    background-color: rgba(255, 255, 255, 0.9);
  }
}

.q-img {
  border-radius: 8px 8px 0 0;
}

.q-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
