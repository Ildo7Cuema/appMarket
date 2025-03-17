<template>
  <q-page padding>
    <div class="row q-mb-md q-pa-sm">
      <div class="col-12 text-right">
        <q-btn
          outline
          color="primary"
          icon="add"
          label="Adicionar Produto"
          @click="newProducts()"
          no-caps
        />
      </div>
    </div>
    <div class="row q-mb-md q-pa-sm q-gutter-sm">
      <!-- Chips de Filtros Ativos -->
      <div class="col-12 q-mb-sm">
        <q-chip v-if="searchTerm" dense removable @remove="searchTerm = ''" color="primary">
          Pesquisa: {{ searchTerm }}
        </q-chip>

        <q-chip
          v-if="activeFilters.category"
          dense
          removable
          @remove="activeFilters.category = null"
          color="primary"
        >
          Categoria: {{ categories.find((c) => c.id === activeFilters.category)?.name }}
        </q-chip>

        <q-chip
          v-if="activeFilters.minPrice"
          dense
          removable
          @remove="activeFilters.minPrice = null"
          color="primary"
        >
          Preço Mín: Kz {{ activeFilters.minPrice.toLocaleString() }}
        </q-chip>

        <q-chip
          v-if="activeFilters.maxPrice"
          dense
          removable
          @remove="activeFilters.maxPrice = null"
          color="primary"
        >
          Preço Máx: Kz {{ activeFilters.maxPrice.toLocaleString() }}
        </q-chip>

        <q-chip
          v-if="activeFilters.minStock"
          dense
          removable
          @remove="activeFilters.minStock = null"
          color="primary"
        >
          Estoque Mín: {{ activeFilters.minStock }}
        </q-chip>

        <q-chip
          v-if="activeFilters.maxStock"
          dense
          removable
          @remove="activeFilters.maxStock = null"
          color="primary"
        >
          Estoque Máx: {{ activeFilters.maxStock }}
        </q-chip>

        <q-chip
          v-if="activeFilters.showLowStock"
          dense
          removable
          @remove="activeFilters.showLowStock = false"
          color="primary"
        >
          Baixo Estoque
        </q-chip>

        <q-chip
          v-if="activeFilters.showOutOfStock"
          dense
          removable
          @remove="activeFilters.showOutOfStock = false"
          color="primary"
        >
          Sem Estoque
        </q-chip>
      </div>
      <q-select
        dense
        v-model="activeFilters.category"
        :options="categories"
        option-label="name"
        option-value="id"
        label="Categoria"
        emit-value
        map-options
        clearable
        style="min-width: 200px"
      />

      <q-input
        dense
        v-model.number="activeFilters.minPrice"
        label="Preço Mínimo"
        type="number"
        prefix="Kz"
        clearable
        style="max-width: 150px"
      />

      <q-input
        dense
        v-model.number="activeFilters.maxPrice"
        label="Preço Máximo"
        type="number"
        prefix="Kz"
        clearable
        style="max-width: 150px"
      />

      <q-input
        dense
        v-model.number="activeFilters.minStock"
        label="Estoque Mínimo"
        type="number"
        clearable
        style="max-width: 150px"
      />

      <q-input
        dense
        v-model.number="activeFilters.maxStock"
        label="Estoque Máximo"
        type="number"
        clearable
        style="max-width: 150px"
      />

      <q-toggle v-model="activeFilters.showLowStock" label="Baixo Estoque" />

      <q-toggle v-model="activeFilters.showOutOfStock" label="Sem Estoque" />

      <q-select
        dense
        v-model="sortOptions.field"
        :options="[
          { label: 'Nome', value: 'name' },
          { label: 'Preço', value: 'price' },
          { label: 'Estoque', value: 'stock' },
          { label: 'Código', value: 'code' },
        ]"
        label="Ordenar por"
        emit-value
        map-options
        style="min-width: 150px"
      />

      <q-btn-toggle
        v-model="sortOptions.order"
        :options="[
          { label: 'Asc', value: 'asc' },
          { label: 'Desc', value: 'desc' },
        ]"
        dense
      />
    </div>

    <div class="row q-col-gutter-md">
      <!-- View Toggle -->
      <div class="col-12">
        <q-btn-toggle
          v-model="viewMode"
          :options="[
            { label: 'Tabela', value: 'table', icon: 'table_chart' },
            { label: 'Cards', value: 'cards', icon: 'grid_view' },
          ]"
          spread
          class="q-mb-md"
        />
      </div>

      <!-- Table View -->
      <div class="col-12" v-if="viewMode === 'table'">
        <q-table
          dense
          title="Gestão de Produtos e Stock"
          :rows="products"
          :columns="productColumns"
          row-key="id"
          :loading="loading"
          :pagination="productPagination"
          :rows-per-page-options="[10, 20, 50, 100]"
          selection="multiple"
          :filter="filter"
          flat
          bordered
          separator="cell"
          v-model:selected="selectedProducts"
        >
          <template v-slot:top-right>
            <q-btn
              v-if="selectedProducts.length > 0"
              color="negative"
              icon="delete"
              label="Eliminar Selecionados"
              @click="confirmBulkDelete"
              no-caps
              dense
              class="q-mr-sm"
            />
            <q-btn flat color="green" icon="download" @click="exportProducts" no-caps dense />
          </template>
          <!-- Custom Loading State -->
          <template v-slot:loading>
            <q-inner-loading showing color="primary">
              <q-spinner-gears size="50px" color="primary" />
              <div class="q-mt-sm">Carregando produtos...</div>
            </q-inner-loading>
          </template>

          <!-- Custom Stock Cell -->
          <template v-slot:body-cell-stock="props">
            <q-td :props="props">
              <q-linear-progress
                :value="props.row.stock / props.row.max_stock"
                :color="
                  props.row.stock <= 5 ? 'negative' : props.row.stock <= 20 ? 'warning' : 'positive'
                "
                size="25px"
                class="q-mt-sm"
              >
                <div class="absolute-full flex flex-center">
                  <q-badge color="white" text-color="primary">
                    {{ props.row.stock }} / {{ props.row.max_stock }}
                  </q-badge>
                </div>
              </q-linear-progress>
            </q-td>
          </template>

          <!-- Custom Actions -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat round color="primary" icon="edit" @click="editProduct(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- Card View -->
      <div class="col-12" v-if="viewMode === 'cards'">
        <div class="row q-col-gutter-md">
          <div
            class="col-12 col-sm-6 col-md-4 col-lg-3"
            v-for="product in products"
            :key="product.id"
          >
            <q-card class="my-card">
              <q-img
                :src="product.image_url || 'https://placehold.co/400x200'"
                :ratio="16 / 9"
                class="cursor-pointer"
                @click="editProduct(product)"
              >
                <q-badge
                  floating
                  :color="
                    product.stock <= 5 ? 'negative' : product.stock <= 20 ? 'warning' : 'positive'
                  "
                >
                  {{ product.stock }} em estoque
                </q-badge>
              </q-img>

              <q-card-section>
                <div class="text-h6">{{ product.name }}</div>
                <div class="text-subtitle2">{{ product.code }}</div>
                <div class="text-caption text-grey-8 q-mt-sm">
                  {{ product.description || 'Sem descrição' }}
                </div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="text-h6 text-primary">
                  {{ formatPrice(product.price_with_tax || product.price) }}
                  <div v-if="product.price_with_tax" class="text-caption text-grey-8">
                    (Preço base: {{ formatPrice(product.price) }})
                  </div>
                </div>
                <div class="text-caption">
                  Categoria: {{ product.category_name || 'Sem categoria' }}
                </div>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat round color="primary" icon="edit" @click="editProduct(product)" />
                <q-btn flat round color="negative" icon="delete" @click="confirmDelete(product)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Dialog -->
    <q-dialog v-model="showProductDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="text-center">
          <q-icon name="inventory" color="green" size="md"></q-icon>
          <div class="text-small text-grey-8">{{ isEditing ? 'Editar' : 'Adicionar' }} Produto</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveProduct">
            <q-input
              dense
              v-model="productForm.code"
              label="Código do Produto"
              :rules="[(val) => !!val || 'Campo obrigatório']"
            />
            <q-input
              dense
              v-model="productForm.name"
              label="Nome do Produto"
              :rules="[(val) => !!val || 'Campo obrigatório']"
              class="q-mt-sm"
            />
            <q-input dense v-model="productForm.description" label="Descrição" class="q-mt-sm" />

            <q-input
              dense
              v-model="productForm.price"
              label="Preço"
              type="number"
              prefix="Kz"
              :rules="[(val) => val >= 0 || 'Preço inválido']"
              class="q-mt-sm"
            />
            <div v-if="productForm.is_taxed" class="text-caption text-grey-8 q-mt-xs">
              Preço com IVA: Kz {{ (productForm.price * 1.14).toLocaleString() }}
            </div>
            <q-input
              dense
              v-model="productForm.quantity"
              label="Stock Inicial"
              type="number"
              :rules="[(val) => val >= 0 || 'Stock inválido']"
              class="q-mt-sm"
            />

            <q-select
              dense
              v-model="productForm.category_id"
              :options="categories"
              option-label="name"
              option-value="id"
              label="Categoria"
              emit-value
              map-options
              clearable
              class="q-mt-sm"
            />

            <q-file
              dense
              v-model="productForm.image"
              label="Imagem do Produto (Opcional)"
              accept=".jpg, .png, .jpeg"
              clearable
              class="q-mt-sm"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <q-toggle
              dense
              v-model="productForm.taxable"
              label="Produto Tributável (IVA 14%)"
              class="q-mt-sm"
            />

            <q-card-actions align="right" class="q-mt-md">
              <q-btn
                outline
                label="Cancelar"
                color="grey"
                no-caps
                v-close-popup
                icon="fas fa-close"
              />
              <q-btn
                outline
                type="submit"
                label="Guardar"
                color="green"
                no-caps
                icon="fas fa-save"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useStockStore } from '../stores/stock-store'
import productService from '../services/product.service'

const $q = useQuasar()
const stockStore = useStockStore()

// Declare all variables
const loading = ref(false)
const showProductDialog = ref(false)
const isEditing = ref(false)
const categories = ref([])
const filter = ref('')
const searchTerm = ref('')
const selectedProducts = ref([])
const activeFilters = ref({
  category: null,
  minPrice: null,
  maxPrice: null,
  minStock: null,
  maxStock: null,
  showLowStock: false,
  showOutOfStock: false,
})
const sortOptions = ref({
  field: 'name',
  order: 'asc',
})

const productForm = ref({
  id: null,
  code: '',
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  category_id: null,
  is_taxed: false,
  image: null,
})

const newProducts = () => {
  resetProductForm()
  showProductDialog.value = true
}

const productColumns = [
  {
    name: 'code',
    label: 'Código',
    field: 'code',
    align: 'left',
    sortable: true,
    filterable: true,
  },
  {
    name: 'name',
    label: 'Nome',
    field: 'name',
    align: 'left',
    sortable: true,
    filterable: true,
  },
  {
    name: 'description',
    label: 'Descrição',
    field: 'description',
    sortable: true,
    filterable: true,
    align: 'left',
  },
  {
    name: 'category',
    label: 'Categoria',
    field: (row) => row.category_name || 'Sem categoria',
    align: 'left',
    sortable: true,
    filterable: true,
  },
  {
    name: 'price',
    label: 'Preço',
    field: (row) => row.price_with_tax || row.price,
    format: (val) => (val ? `Kz ${Number(val).toLocaleString()}` : 'Kz 0'),
    sortable: true,
    filterable: true,
    align: 'left',
    classes: (row) => (row.price_with_tax ? 'text-green' : ''),
  },
  {
    name: 'quantity',
    label: 'Stock',
    field: 'quantity',
    sortable: true,
    filterable: true,
    align: 'center',
  },
  {
    name: 'actions',
    label: 'Ações',
    field: '',
    align: 'center',
  },
]

const viewMode = ref('table') // table or cards

const productPagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 20,
})

function formatPrice(price) {
  return `Kz ${Number(price).toLocaleString()}`
}

const products = computed(() => stockStore.products)

async function loadData() {
  try {
    loading.value = true
    await stockStore.loadProducts()
    categories.value = await productService.getCategories()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao carregar dados',
    })
  } finally {
    loading.value = false
  }
}

function editProduct(product) {
  productForm.value = { ...product }
  isEditing.value = true
  showProductDialog.value = true
}

function confirmDelete(product) {
  $q.dialog({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir ${product.name}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      loading.value = true
      await stockStore.deleteProduct(product.id)
      $q.notify({
        type: 'positive',
        message: 'Produto excluído com sucesso',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Erro ao excluir produto',
      })
    } finally {
      loading.value = false
    }
  })
}

async function saveProduct() {
  try {
    loading.value = true

    let imageUrl = null

    // Handle image upload if present
    if (productForm.value.image) {
      const formData = new FormData()
      formData.append('file', productForm.value.image)

      const uploadResponse = await productService.uploadImage(formData)
      imageUrl = uploadResponse.url
    }

    // Calculate final price based on tax
    const productData = {
      ...productForm.value,
      price: productForm.value.price,
      price_with_tax: productForm.value.taxable ? productForm.value.price * 1.14 : null,
      image_url: imageUrl,
      taxable: productForm.value.taxable,
    }

    if (isEditing.value) {
      await stockStore.updateProduct(productData)
      loadData()
    } else {
      await stockStore.addProduct(productData)
      loadData()
    }

    $q.notify({
      type: 'positive',
      message: `Produto ${isEditing.value ? 'atualizado' : 'criado'} com sucesso`,
    })

    // Wait for UI to update before closing dialog
    await new Promise((resolve) => setTimeout(resolve, 100))
    resetProductForm()
    showProductDialog.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || `Erro ao ${isEditing.value ? 'atualizar' : 'criar'} produto`,
    })
  } finally {
    loading.value = false
  }
}

function resetProductForm() {
  productForm.value = {
    id: null,
    code: '',
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    category_id: null,
    is_taxed: false,
    image: null,
  }
  isEditing.value = false
}

function confirmBulkDelete() {
  if (!selectedProducts.value || selectedProducts.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Nenhum produto selecionado',
    })
    return
  }

  $q.dialog({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir ${selectedProducts.value.length} produtos selecionados?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      loading.value = true
      const productIds = selectedProducts.value.filter((p) => p && p.id).map((p) => p.id)

      if (productIds.length > 0) {
        await stockStore.deleteProducts(productIds)
        selectedProducts.value = []
        $q.notify({
          type: 'positive',
          message: 'Produtos excluídos com sucesso',
        })
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Erro ao excluir produtos',
      })
    } finally {
      loading.value = false
    }
  })
}

async function exportProducts() {
  try {
    loading.value = true
    const buffer = await productService.exportProducts(products.value)

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `produtos_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)

    $q.notify({
      type: 'positive',
      message: 'Exportação concluída com sucesso',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao exportar produtos',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.q-tab-panel {
  padding: 16px 0;
}
</style>
