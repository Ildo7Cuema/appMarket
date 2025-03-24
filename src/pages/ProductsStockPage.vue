<template>
  <q-page padding>
    <div class="row q-mb-md q-pa-sm">
      <div class="col-6">
        <q-input
          dense
          v-model="searchTerm"
          label="Pesquisar (nome, código ou categoria)"
          debounce="500"
          clearable
        />
      </div>
      <div class="col-6 text-right">
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
          :columns="columns"
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
          <template v-slot:body-cell-quantity="props">
            <q-td :props="props">
              <q-linear-progress
                :value="props.row.quantity / (props.row.max_stock || 100)"
                :color="
                  props.row.quantity <= 5
                    ? 'negative'
                    : props.row.quantity <= 20
                      ? 'warning'
                      : 'positive'
                "
                size="25px"
                class="q-mt-sm"
              >
                <div class="absolute-full flex flex-center">
                  <q-badge color="white" text-color="primary">
                    {{ props.row.quantity || 0 }} / {{ props.row.max_stock || 100 }}
                  </q-badge>
                </div>
              </q-linear-progress>
            </q-td>
          </template>

          <!-- Custom Image Cell -->
          <template v-slot:body-cell-image_url="props">
            <q-td :props="props">
              <q-img
                v-if="props.row.image_url"
                :src="getImageUrl(props.row.image_url)"
                spinner-color="primary"
                style="height: 50px; max-width: 50px"
                fit="contain"
                @error="handleImageError"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-negative text-white">
                    Erro ao carregar imagem
                  </div>
                </template>
              </q-img>
              <q-img
                v-else
                :src="DEFAULT_IMAGE_URL"
                style="height: 50px; max-width: 50px"
                fit="contain"
              />
            </q-td>
          </template>

          <!-- Custom Price Cell -->
          <template v-slot:body-cell-price="props">
            <q-td :props="props">
              <div class="text-right">
                <div class="text-weight-bold">
                  Kz {{ Number(props.row.price).toLocaleString() }}
                </div>
                <div v-if="props.row.price_with_tax" class="text-caption text-grey-8">
                  Com IVA: Kz {{ Number(props.row.price_with_tax).toLocaleString() }}
                </div>
              </div>
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
                :src="getImageUrl(product.image_url)"
                :ratio="16 / 9"
                class="cursor-pointer"
                @click="editProduct(product)"
                loading="eager"
                @error="handleImageError"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-negative text-white">
                    Erro ao carregar imagem
                  </div>
                </template>
                <q-badge
                  floating
                  :color="
                    product.quantity <= 5
                      ? 'negative'
                      : product.quantity <= 20
                        ? 'warning'
                        : 'positive'
                  "
                >
                  {{ product.quantity || 0 }} em estoque
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
                  Kz {{ Number(product.price).toLocaleString() }}
                  <div v-if="product.price_with_tax" class="text-caption text-grey-8">
                    Com IVA: Kz {{ Number(product.price_with_tax).toLocaleString() }}
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
              max-file-size="47185920"
              @rejected="onFileRejected"
              :rules="[
                (val) => !val || val.size <= 47185920 || 'Tamanho máximo de 45MB',
                (val) =>
                  !val || ['image/jpeg', 'image/png'].includes(val.type) || 'Formato inválido',
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-slot:after>
                <q-btn
                  v-if="productForm.image_url && !productForm.image"
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="removeImage"
                >
                  <q-tooltip>Remover imagem</q-tooltip>
                </q-btn>
              </template>
            </q-file>

            <!-- Prévia da imagem -->
            <div v-if="previewImage" class="q-mt-sm">
              <div class="text-caption q-mb-xs">Prévia da imagem:</div>
              <q-img
                :src="previewImage"
                style="max-width: 100%; max-height: 150px; object-fit: contain"
                :ratio="4 / 3"
                class="rounded-borders"
              />
            </div>

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
import { API_BASE_URL, DEFAULT_IMAGE_URL, getFullImageUrl } from '../config/api'

const $q = useQuasar()
const stockStore = useStockStore()

console.log('API_BASE_URL no componente ProductsStockPage:', API_BASE_URL)

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
  taxable: false,
  image: null,
})

const newProducts = () => {
  resetProductForm()
  showProductDialog.value = true
}

const columns = [
  {
    name: 'image_url',
    label: 'Imagem',
    field: 'image_url',
    align: 'center',
    style: 'width: 80px',
  },
  {
    name: 'code',
    align: 'left',
    label: 'Código',
    field: 'code',
    sortable: true,
    style: 'width: 120px',
  },
  {
    name: 'name',
    align: 'left',
    label: 'Nome',
    field: 'name',
    sortable: true,
    style: 'width: 200px',
  },
  {
    name: 'price',
    align: 'right',
    label: 'Preço',
    field: 'price',
    sortable: true,
    format: (val) => `Kz ${Number(val).toLocaleString()}`,
    style: 'width: 120px',
  },
  {
    name: 'quantity',
    align: 'right',
    label: 'Stock',
    field: 'quantity',
    sortable: true,
    format: (val) => val.toLocaleString(),
    style: 'width: 100px',
  },
  {
    name: 'category',
    align: 'left',
    label: 'Categoria',
    field: (row) => row.category_name || 'Sem categoria',
    sortable: true,
    style: 'width: 150px',
  },
  {
    name: 'actions',
    align: 'center',
    label: 'Ações',
    field: 'actions',
    style: 'width: 100px',
  },
]

const viewMode = ref('table') // table or cards

const productPagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 20,
})

const products = computed(() => {
  if (!searchTerm.value) return stockStore.products

  const term = searchTerm.value.toLowerCase()
  return stockStore.products.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term) ||
      (p.category_name && p.category_name.toLowerCase().includes(term)),
  )
})

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
  console.log('Editando produto:', product)
  console.log('URL da imagem do produto:', product.image_url)

  isEditing.value = true

  // Deep clone para não modificar o objeto original
  productForm.value = {
    id: product.id,
    code: product.code,
    name: product.name,
    description: product.description || '',
    price: product.price,
    quantity: product.quantity || 0,
    category_id: product.category_id,
    taxable: Boolean(product.price_with_tax),
    image_url: product.image_url,
    image: null, // Reset image file, usaremos o image_url existente
  }

  console.log('Formulário preenchido para edição:', productForm.value)
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
      await productService.deleteProduct(product.id)
      await loadData()
      $q.notify({
        type: 'positive',
        message: 'Produto excluído com sucesso',
      })
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      $q.notify({
        type: 'negative',
        message: error.message.includes('Erro') ? error.message : 'Erro ao excluir produto',
        caption: error.response?.data?.details || '',
        timeout: 5000,
        actions: [{ icon: 'close', color: 'white' }],
      })
    } finally {
      loading.value = false
    }
  })
}

async function saveProduct() {
  try {
    loading.value = true

    let imageUrl = productForm.value.image_url || null

    // Handle image upload if present
    if (productForm.value.image && productForm.value.image instanceof File) {
      imageUrl = await uploadImage(productForm.value.image)

      if (!imageUrl && isEditing.value) {
        // Se falhar o upload mas estiver editando, mantém a imagem existente
        imageUrl = productForm.value.image_url
        $q.notify({
          type: 'warning',
          message: 'Imagem não atualizada - mantendo imagem existente',
        })
      }
    } else if (isEditing.value && productForm.value.image_url) {
      // Se estiver editando e já houver uma URL, mantém a mesma
      console.log('Mantendo URL existente durante edição:', imageUrl)
    }

    // Preparar objeto do produto com a URL da imagem
    const productData = {
      ...productForm.value,
      price: productForm.value.price,
      price_with_tax: productForm.value.taxable ? productForm.value.price * 1.14 : null,
      image_url: imageUrl,
      taxable: productForm.value.taxable,
    }

    console.log('Objeto do produto a ser salvo:', productData)
    delete productData.image // Remover o objeto File antes de enviar

    if (isEditing.value) {
      await stockStore.updateProduct(productData)
      $q.notify({
        type: 'positive',
        message: 'Produto atualizado com sucesso',
      })
    } else {
      await stockStore.addProduct(productData)
      $q.notify({
        type: 'positive',
        message: 'Produto adicionado com sucesso',
      })
    }

    // Reset form and close dialog
    productForm.value = {
      id: null,
      code: '',
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      category_id: null,
      taxable: false,
      image: null,
    }
    isEditing.value = false
    showProductDialog.value = false
    loadData()
  } catch (error) {
    console.error('Erro ao salvar produto:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao salvar produto',
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
    taxable: false,
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

// Função para obter URL da imagem com tratamento de erro
function getImageUrl(url) {
  if (!url) return DEFAULT_IMAGE_URL

  try {
    // Se já for uma URL completa, retorna diretamente
    if (url.startsWith('http') || url.startsWith('blob:')) {
      return url
    }

    // Se for um caminho relativo, adiciona a base URL
    let fullUrl = getFullImageUrl(url)

    // Verifica se a URL está correta
    if (!fullUrl.startsWith('http') && !fullUrl.startsWith('/')) {
      fullUrl = `${API_BASE_URL}/${fullUrl}`
    }

    console.log('URL da imagem:', fullUrl)
    return fullUrl
  } catch (error) {
    console.error('Erro ao gerar URL da imagem:', error)
    return DEFAULT_IMAGE_URL
  }
}

// Tratamento de erro para imagens
function handleImageError(evt) {
  console.error('Erro ao carregar imagem:', {
    event: evt,
    targetSrc: evt.target.src,
    timestamp: new Date().toISOString(),
  })

  // Verificar se o placeholder existe antes de tentar substituir
  const placeholder = new Image()
  placeholder.src = DEFAULT_IMAGE_URL

  placeholder.onload = () => {
    evt.target.src = DEFAULT_IMAGE_URL
  }

  placeholder.onerror = () => {
    console.error('Erro ao carregar placeholder')
    evt.target.parentElement.innerHTML = `
      <div class="absolute-full flex flex-center bg-grey-4 text-grey-8">
        Imagem não disponível
      </div>
    `
  }
}

// Computed property para a prévia da imagem
const previewImage = computed(() => {
  if (productForm.value.image && productForm.value.image instanceof File) {
    return URL.createObjectURL(productForm.value.image)
  } else if (productForm.value.image_url) {
    return getImageUrl(productForm.value.image_url)
  }
  return null
})

function onFileRejected(rejectedEntries) {
  $q.notify({
    type: 'negative',
    message: `Arquivo rejeitado: ${rejectedEntries[0].file.name}`,
    caption: rejectedEntries[0].failedPropValidation,
  })
}

function removeImage() {
  $q.dialog({
    title: 'Remover Imagem',
    message: 'Deseja realmente remover a imagem deste produto?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    productForm.value.image_url = null
    productForm.value.image = null
    $q.notify({
      type: 'positive',
      message: 'Imagem removida com sucesso',
    })
  })
}

async function uploadImage(file) {
  try {
    const formData = new FormData()
    formData.append('file', file)

    if ($q?.loading?.show) {
      $q.loading.show({
        message: 'Enviando imagem...',
      })
    }

    const uploadResponse = await productService.uploadImage(formData)

    if (uploadResponse && uploadResponse.url) {
      let imageUrl = uploadResponse.url
      if (!imageUrl.startsWith('http')) {
        imageUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
      }
      return imageUrl
    }
  } catch (error) {
    console.error('Erro no upload:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao enviar imagem',
    })
    return null
  } finally {
    if ($q?.loading?.hide) {
      $q.loading.hide()
    }
  }
}

onMounted(() => {
  loadData()

  // Pré-carregar a imagem de placeholder para evitar carregamento lazy
  const img = new Image()
  img.src = DEFAULT_IMAGE_URL
})
</script>

<style scoped>
.q-tab-panel {
  padding: 16px 0;
}
</style>
