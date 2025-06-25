<template>
  <q-page class="products-page">
    <!-- Header com gradiente -->
    <div class="header-section q-px-lg q-pt-lg q-pb-xl">
      <div class="row items-center justify-between">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bold text-white">Gestão de Produtos</div>
          <div class="text-subtitle1 text-grey-3 q-mt-sm">
            Gerencie o estoque e cadastro de produtos do sistema
          </div>
        </div>
        <div class="col-12 col-md-4 text-right">
          <q-btn
            outline
            class="bg-white text-primary"
            icon="add"
            label="Novo Produto"
            @click="newProducts()"
            no-caps
          >
            <q-tooltip>Adicionar novo produto ao estoque</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <div class="content-container q-px-lg q-mt-xl">
      <!-- Card de Pesquisa e Filtros -->
      <q-card class="filter-card q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Pesquisa -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="searchTerm"
                dense
                outlined
                label="Pesquisar produtos"
                placeholder="Nome, código ou categoria"
                debounce="500"
                clearable
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="primary" />
                </template>
                <template v-slot:append v-if="searchTerm">
                  <q-icon name="clear" class="cursor-pointer" @click="searchTerm = ''" />
                </template>
              </q-input>
            </div>

            <!-- Categoria -->
            <div class="col-12 col-md-3">
              <q-select
                dense
                outlined
                v-model="activeFilters.category"
                :options="categories"
                option-label="name"
                option-value="id"
                label="Categoria"
                emit-value
                map-options
                clearable
                class="filter-select"
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Ordenação -->
            <div class="col-12 col-md-3">
              <div class="row q-col-gutter-sm">
                <div class="col">
                  <q-select
                    dense
                    outlined
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
                  >
                    <template v-slot:prepend>
                      <q-icon name="sort" color="primary" />
                    </template>
                  </q-select>
                </div>
                <div class="col-auto">
                  <q-btn-toggle
                    v-model="sortOptions.order"
                    :options="[
                      { label: 'Asc', value: 'asc', icon: 'arrow_upward' },
                      { label: 'Desc', value: 'desc', icon: 'arrow_downward' },
                    ]"
                    dense
                    outline
                    class="full-height"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Filtros Avançados -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12 col-md-3">
              <q-input
                dense
                outlined
                v-model.number="activeFilters.minPrice"
                label="Preço Mínimo"
                type="number"
                prefix="Kz"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="payments" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-3">
              <q-input
                dense
                outlined
                v-model.number="activeFilters.maxPrice"
                label="Preço Máximo"
                type="number"
                prefix="Kz"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="payments" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-3">
              <q-input
                dense
                outlined
                v-model.number="activeFilters.minStock"
                label="Estoque Mínimo"
                type="number"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="inventory" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-3">
              <q-input
                dense
                outlined
                v-model.number="activeFilters.maxStock"
                label="Estoque Máximo"
                type="number"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="inventory" color="primary" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Toggles e Chips -->
          <div class="row q-col-gutter-md q-mt-md items-center">
            <div class="col-auto">
              <q-toggle
                v-model="activeFilters.showLowStock"
                label="Baixo Estoque"
                color="warning"
                icon="warning"
              />
            </div>

            <div class="col-auto">
              <q-toggle
                v-model="activeFilters.showOutOfStock"
                label="Sem Estoque"
                color="negative"
                icon="error"
              />
            </div>

            <div class="col-auto">
              <q-toggle
                v-model="activeFilters.showInactive"
                label="Produtos Desativados"
                color="grey"
                icon="visibility_off"
              />
            </div>

            <!-- Chips de Filtros Ativos -->
            <div class="col-12 q-mt-sm">
              <q-chip
                v-for="(filter, index) in activeFilterChips"
                :key="index"
                dense
                removable
                @remove="removeFilter(filter.type)"
                :color="filter.color || 'primary'"
                class="q-ma-xs"
              >
                {{ filter.label }}
              </q-chip>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Card Principal -->
      <q-card class="main-card">
        <q-card-section class="q-pa-none">
          <!-- View Toggle -->
          <div class="row items-center justify-between q-pa-md">
            <div class="col-auto">
              <div class="text-h6 text-weight-bold text-primary">Lista de Produtos</div>
              <div class="text-caption text-grey-7">{{ products.length }} produtos encontrados</div>
            </div>
            <div class="col-auto">
              <q-btn-group outline>
                <q-btn
                  :color="viewMode === 'table' ? 'primary' : 'grey'"
                  icon="table_chart"
                  @click="viewMode = 'table'"
                >
                  <q-tooltip>Visualização em Tabela</q-tooltip>
                </q-btn>
                <q-btn
                  :color="viewMode === 'cards' ? 'primary' : 'grey'"
                  icon="grid_view"
                  @click="viewMode = 'cards'"
                >
                  <q-tooltip>Visualização em Cards</q-tooltip>
                </q-btn>
              </q-btn-group>
              <q-btn
                flat
                round
                color="primary"
                icon="download"
                @click="exportProducts"
                class="q-ml-sm"
              >
                <q-tooltip>Exportar Produtos</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Table View -->
          <div v-if="viewMode === 'table'">
            <div class="row q-mb-md q-px-md">
              <q-btn
                v-if="selectedProducts.length > 0"
                color="negative"
                icon="delete"
                :label="`Excluir ${selectedProducts.length} Selecionados`"
                @click="confirmBulkDelete"
                class="q-mr-sm"
              />
            </div>
            <q-table
              :rows="products"
              :columns="columns"
              row-key="id"
              :loading="loading"
              :pagination="productPagination"
              :rows-per-page-options="[10, 20, 50, 100]"
              selection="multiple"
              v-model:selected="selectedProducts"
              flat
              bordered
              separator="cell"
              class="modern-table"
              :row-class-name="(row) => (row.is_active ? '' : 'inactive-row')"
            >
              <!-- Loading State -->
              <template v-slot:loading>
                <q-inner-loading showing color="primary">
                  <q-spinner-gears size="50px" color="primary" />
                  <div class="text-primary text-caption q-mt-sm">Carregando produtos...</div>
                </q-inner-loading>
              </template>

              <!-- Custom Status Cell -->
              <template v-slot:body-cell-status="props">
                <q-td :props="props" class="text-center">
                  <q-badge
                    :color="props.row.is_active ? 'positive' : 'grey'"
                    :label="props.row.is_active ? 'Ativo' : 'Desativado'"
                    class="q-px-sm q-py-xs"
                  >
                    <q-icon
                      :name="props.row.is_active ? 'check_circle' : 'visibility_off'"
                      class="q-mr-xs"
                    />
                  </q-badge>
                </q-td>
              </template>

              <!-- Custom Stock Cell -->
              <template v-slot:body-cell-quantity="props">
                <q-td :props="props">
                  <q-linear-progress
                    :value="props.row.quantity / (props.row.max_stock || 100)"
                    :color="getStockColor(props.row.quantity)"
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
                <q-td :props="props" class="text-center">
                  <q-img
                    :src="getImageUrl(props.row.image_url)"
                    spinner-color="primary"
                    style="height: 50px; max-width: 50px"
                    fit="contain"
                    @error="handleImageError"
                    class="rounded-borders"
                  >
                    <template v-slot:error>
                      <div
                        class="absolute-full flex flex-center bg-negative text-white text-caption"
                      >
                        Erro
                      </div>
                    </template>
                  </q-img>
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
                <q-td :props="props" class="text-center">
                  <q-btn-group flat>
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="edit"
                      @click="editProduct(props.row)"
                      class="q-mx-xs"
                      :disable="!props.row.is_active"
                    >
                      <q-tooltip>{{
                        props.row.is_active
                          ? 'Editar Produto'
                          : 'Produto desativado - não pode ser editado'
                      }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="props.row.is_active"
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="confirmDelete(props.row)"
                      class="q-mx-xs"
                    >
                      <q-tooltip>Excluir Produto</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-else
                      flat
                      round
                      color="positive"
                      icon="restore"
                      @click="confirmReactivate(props.row)"
                      class="q-mx-xs"
                    >
                      <q-tooltip>Reativar Produto</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </q-td>
              </template>

              <!-- No Data Message -->
              <template v-slot:no-data>
                <div class="full-width row flex-center q-pa-lg text-grey-7">
                  <q-icon name="inventory_2" size="40px" color="grey-5" class="q-mb-sm" />
                  <div class="text-h6">Nenhum produto encontrado</div>
                  <div class="text-caption">Tente ajustar os filtros de pesquisa</div>
                </div>
              </template>
            </q-table>
          </div>

          <!-- Card View -->
          <div v-else class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div
                v-for="product in products"
                :key="product.id"
                class="col-12 col-sm-6 col-md-4 col-lg-3"
              >
                <q-card
                  class="product-card"
                  :class="{ 'product-card--inactive': !product.is_active }"
                >
                  <q-img
                    :src="getImageUrl(product.image_url)"
                    :ratio="16 / 9"
                    class="cursor-pointer"
                    @click="product.is_active ? editProduct(product) : null"
                    loading="eager"
                    @error="handleImageError"
                    :class="{ 'inactive-image': !product.is_active }"
                  >
                    <template v-slot:error>
                      <div class="absolute-full flex flex-center bg-negative text-white">
                        Erro ao carregar imagem
                      </div>
                    </template>
                    <div class="absolute-top-left q-pa-sm">
                      <q-badge
                        :color="product.is_active ? 'positive' : 'grey'"
                        class="q-px-sm q-py-xs text-weight-bold"
                      >
                        <q-icon
                          :name="product.is_active ? 'check_circle' : 'visibility_off'"
                          class="q-mr-xs"
                        />
                        {{ product.is_active ? 'Ativo' : 'Desativado' }}
                      </q-badge>
                    </div>
                    <div class="absolute-top-right q-pa-sm">
                      <q-badge
                        :color="getStockColor(product.quantity)"
                        class="q-px-sm q-py-xs text-weight-bold"
                      >
                        {{ product.quantity || 0 }} em estoque
                      </q-badge>
                    </div>
                  </q-img>

                  <q-card-section>
                    <div class="text-h6 ellipsis-2-lines">{{ product.name }}</div>
                    <div class="text-subtitle2 text-grey-7">{{ product.code }}</div>
                    <div class="text-caption text-grey-8 q-mt-sm ellipsis-2-lines">
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
                    <div class="text-caption q-mt-sm">
                      Categoria: {{ product.category_name || 'Sem categoria' }}
                    </div>
                  </q-card-section>

                  <q-separator />

                  <q-card-actions align="right">
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="edit"
                      @click="editProduct(product)"
                      :disable="!product.is_active"
                    >
                      <q-tooltip>{{
                        product.is_active
                          ? 'Editar Produto'
                          : 'Produto desativado - não pode ser editado'
                      }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="product.is_active"
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="confirmDelete(product)"
                    >
                      <q-tooltip>Excluir Produto</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-else
                      flat
                      round
                      color="positive"
                      icon="restore"
                      @click="confirmReactivate(product)"
                    >
                      <q-tooltip>Reativar Produto</q-tooltip>
                    </q-btn>
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Diálogo de Produto -->
    <q-dialog v-model="showProductDialog" persistent maximized>
      <q-card class="dialog-card">
        <q-card-section class="bg-gradient-primary text-white row items-center">
          <div class="text-h6">
            <q-icon name="inventory" class="q-mr-sm" />
            {{ isEditing ? 'Editar' : 'Novo' }} Produto
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md scroll" style="max-height: 80vh">
          <q-form @submit="saveProduct" class="row q-col-gutter-md">
            <!-- Coluna Esquerda -->
            <div class="col-12 col-md-8">
              <div class="row q-col-gutter-md">
                <!-- Código -->
                <div class="col-12 col-md-6">
                  <q-input
                    outlined
                    v-model="productForm.code"
                    label="Código do Produto"
                    :rules="[(val) => !!val || 'Campo obrigatório']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="qr_code" color="primary" />
                    </template>
                  </q-input>
                </div>

                <!-- Nome -->
                <div class="col-12 col-md-6">
                  <q-input
                    outlined
                    v-model="productForm.name"
                    label="Nome do Produto"
                    :rules="[(val) => !!val || 'Campo obrigatório']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="inventory_2" color="primary" />
                    </template>
                  </q-input>
                </div>

                <!-- Descrição -->
                <div class="col-12">
                  <q-input
                    outlined
                    v-model="productForm.description"
                    label="Descrição"
                    type="textarea"
                    rows="3"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" color="primary" />
                    </template>
                  </q-input>
                </div>

                <!-- Preço -->
                <div class="col-12 col-md-6">
                  <q-input
                    outlined
                    v-model="productForm.price"
                    label="Preço"
                    type="number"
                    prefix="Kz"
                    :rules="[(val) => val >= 0 || 'Preço inválido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="payments" color="primary" />
                    </template>
                  </q-input>
                  <div v-if="productForm.taxable" class="text-caption text-primary q-mt-sm">
                    Preço com IVA: Kz {{ (productForm.price * 1.14).toLocaleString() }}
                  </div>
                </div>

                <!-- Stock -->
                <div class="col-12 col-md-6">
                  <q-input
                    outlined
                    v-model="productForm.quantity"
                    label="Stock Inicial"
                    type="number"
                    :rules="[(val) => val >= 0 || 'Stock inválido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="inventory" color="primary" />
                    </template>
                  </q-input>
                </div>

                <!-- Categoria -->
                <div class="col-12 col-md-6">
                  <q-select
                    outlined
                    v-model="productForm.category_id"
                    :options="categories"
                    option-label="name"
                    option-value="id"
                    label="Categoria"
                    emit-value
                    map-options
                    clearable
                  >
                    <template v-slot:prepend>
                      <q-icon name="category" color="primary" />
                    </template>
                  </q-select>
                </div>

                <!-- IVA Toggle -->
                <div class="col-12">
                  <q-toggle
                    v-model="productForm.taxable"
                    label="Produto Tributável (IVA 14%)"
                    color="primary"
                    class="q-mt-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Coluna Direita - Imagem -->
            <div class="col-12 col-md-4">
              <q-card class="image-upload-card">
                <q-card-section>
                  <div class="text-h6">Imagem do Produto</div>
                  <div class="text-caption text-grey-7">
                    Formatos aceitos: JPG, PNG. Tamanho máximo: 45MB
                  </div>

                  <q-file
                    v-model="productForm.image"
                    accept=".jpg, .png, .jpeg"
                    clearable
                    class="q-mt-sm"
                    max-file-size="47185920"
                    @rejected="onFileRejected"
                    :rules="[
                      (val) => !val || val.size <= 47185920 || 'Tamanho máximo de 45MB',
                      (val) =>
                        !val ||
                        ['image/jpeg', 'image/png'].includes(val.type) ||
                        'Formato inválido',
                    ]"
                    borderless
                    style="max-width: 100%"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                  </q-file>

                  <!-- Preview da Imagem -->
                  <div class="image-preview q-mt-md">
                    <q-img
                      :src="previewImage || DEFAULT_IMAGE_URL"
                      style="width: 100%; max-height: 200px"
                      fit="contain"
                      class="rounded-borders"
                    >
                      <template v-slot:error>
                        <div class="absolute-full flex flex-center bg-grey-3">
                          <q-icon name="image" size="48px" color="grey-7" />
                        </div>
                      </template>
                    </q-img>
                    <q-btn
                      v-if="productForm.image_url && !productForm.image"
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      class="absolute-top-right"
                      @click="removeImage"
                    >
                      <q-tooltip>Remover imagem atual</q-tooltip>
                    </q-btn>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="bg-white q-pa-md">
          <q-btn outline label="Cancelar" color="grey" v-close-popup icon="close" class="q-mr-sm" />
          <q-btn
            unelevated
            :label="isEditing ? 'Salvar Alterações' : 'Criar Produto'"
            color="primary"
            icon="save"
            @click="saveProduct"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
  showInactive: false,
})
const sortOptions = ref({
  field: 'name',
  order: 'asc',
})

const activeFilterChips = computed(() => {
  const chips = []

  if (activeFilters.value.category) {
    const category = categories.value.find((c) => c.id === activeFilters.value.category)
    chips.push({
      type: 'category',
      label: `Categoria: ${category?.name || activeFilters.value.category}`,
      color: 'primary',
    })
  }

  if (activeFilters.value.minPrice) {
    chips.push({
      type: 'minPrice',
      label: `Preço min: Kz ${activeFilters.value.minPrice}`,
      color: 'green',
    })
  }

  if (activeFilters.value.maxPrice) {
    chips.push({
      type: 'maxPrice',
      label: `Preço max: Kz ${activeFilters.value.maxPrice}`,
      color: 'green',
    })
  }

  if (activeFilters.value.minStock) {
    chips.push({
      type: 'minStock',
      label: `Estoque min: ${activeFilters.value.minStock}`,
      color: 'blue',
    })
  }

  if (activeFilters.value.maxStock) {
    chips.push({
      type: 'maxStock',
      label: `Estoque max: ${activeFilters.value.maxStock}`,
      color: 'blue',
    })
  }

  if (activeFilters.value.showLowStock) {
    chips.push({
      type: 'showLowStock',
      label: 'Baixo estoque',
      color: 'warning',
    })
  }

  if (activeFilters.value.showOutOfStock) {
    chips.push({
      type: 'showOutOfStock',
      label: 'Sem estoque',
      color: 'negative',
    })
  }

  if (activeFilters.value.showInactive) {
    chips.push({
      type: 'showInactive',
      label: 'Produtos desativados',
      color: 'grey',
    })
  }

  return chips
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
    name: 'status',
    align: 'center',
    label: 'Status',
    field: 'is_active',
    sortable: true,
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
    style: 'width: 120px',
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
  let filtered = [...stockStore.products]

  // Apply search term filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        (p.category_name && p.category_name.toLowerCase().includes(term)),
    )
  }

  // Apply category filter
  if (activeFilters.value.category) {
    filtered = filtered.filter((p) => p.category_id === activeFilters.value.category)
  }

  // Apply price filters
  if (typeof activeFilters.value.minPrice === 'number') {
    filtered = filtered.filter((p) => p.price >= activeFilters.value.minPrice)
  }
  if (typeof activeFilters.value.maxPrice === 'number') {
    filtered = filtered.filter((p) => p.price <= activeFilters.value.maxPrice)
  }

  // Apply stock quantity filters
  if (typeof activeFilters.value.minStock === 'number') {
    filtered = filtered.filter((p) => p.quantity >= activeFilters.value.minStock)
  }
  if (typeof activeFilters.value.maxStock === 'number') {
    filtered = filtered.filter((p) => p.quantity <= activeFilters.value.maxStock)
  }

  // Apply stock toggle filters
  if (activeFilters.value.showLowStock && !activeFilters.value.showOutOfStock) {
    filtered = filtered.filter((p) => p.quantity < 10 && p.quantity > 0)
  } else if (activeFilters.value.showOutOfStock && !activeFilters.value.showLowStock) {
    filtered = filtered.filter((p) => p.quantity === 0)
  } else if (activeFilters.value.showLowStock && activeFilters.value.showOutOfStock) {
    filtered = filtered.filter((p) => p.quantity < 10)
  }

  // Apply sorting
  const field = sortOptions.value.field || 'name'
  const order = sortOptions.value.order || 'asc'

  filtered.sort((a, b) => {
    let valA = a[field]
    let valB = b[field]

    // Handle nested fields
    if (field === 'category') {
      valA = a.category_name
      valB = b.category_name
    }

    if (typeof valA === 'string') valA = valA.toLowerCase()
    if (typeof valB === 'string') valB = valB.toLowerCase()

    if (valA < valB) return order === 'asc' ? -1 : 1
    if (valA > valB) return order === 'asc' ? 1 : -1
    return 0
  })

  return filtered
})

async function loadData() {
  try {
    loading.value = true
    await stockStore.loadProducts('', activeFilters.value.showInactive)
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
    html: true,
    persistent: true,
    ok: {
      label: 'Excluir',
      color: 'negative',
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey',
    },
  }).onOk(async () => {
    try {
      loading.value = true
      const result = await productService.deleteProduct(product.id)
      await loadData()

      // Mostrar mensagem baseada no tipo de exclusão
      if (result.type === 'soft_delete') {
        $q.notify({
          type: 'warning',
          message: 'Produto desativado com sucesso',
          caption: 'O produto foi mantido no sistema para preservar o histórico',
          icon: 'archive',
          timeout: 6000,
          actions: [{ icon: 'close', color: 'white' }],
        })
      } else if (result.type === 'hard_delete') {
        $q.notify({
          type: 'positive',
          message: 'Produto excluído permanentemente',
          caption: 'O produto foi removido do sistema',
          icon: 'delete_forever',
          timeout: 4000,
        })
      } else {
        $q.notify({
          type: 'positive',
          message: result.message || 'Produto excluído com sucesso',
          timeout: 4000,
        })
      }
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

function confirmReactivate(product) {
  $q.dialog({
    title: 'Confirmar Reativação',
    message: `Tem certeza que deseja reativar o produto "${product.name}"?`,
    html: true,
    persistent: true,
    ok: {
      label: 'Reativar',
      color: 'positive',
      icon: 'restore',
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey',
    },
  }).onOk(async () => {
    try {
      loading.value = true
      await stockStore.reactivateProduct(product.id)
      await loadData()
    } catch (error) {
      console.error('Erro ao reativar produto:', error)
      $q.notify({
        type: 'negative',
        message: error.message || 'Erro ao reativar produto',
        timeout: 5000,
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

function removeFilter(filterType) {
  switch (filterType) {
    case 'category':
      activeFilters.value.category = null
      break
    case 'minPrice':
      activeFilters.value.minPrice = null
      break
    case 'maxPrice':
      activeFilters.value.maxPrice = null
      break
    case 'minStock':
      activeFilters.value.minStock = null
      break
    case 'maxStock':
      activeFilters.value.maxStock = null
      break
    case 'showLowStock':
      activeFilters.value.showLowStock = false
      break
    case 'showOutOfStock':
      activeFilters.value.showOutOfStock = false
      break
    case 'showInactive':
      activeFilters.value.showInactive = false
      break
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

// Função para determinar a cor do indicador de estoque
function getStockColor(quantity) {
  if (quantity === 0) return 'negative'
  if (quantity < 10) return 'warning'
  return 'positive'
}

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

// Watcher para recarregar dados quando filtro de produtos inativos mudar
watch(
  () => activeFilters.value.showInactive,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      loadData()
    }
  },
)

onMounted(() => {
  loadData()

  // Pré-carregar a imagem de placeholder para evitar carregamento lazy
  const img = new Image()
  img.src = DEFAULT_IMAGE_URL
})
</script>

<style scoped>
.products-page {
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

.filter-card,
.main-card {
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.filter-card:hover,
.main-card:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
}

.search-input,
.filter-select {
  transition: all 0.3s ease;
}

.search-input:focus-within,
.filter-select:focus-within {
  transform: translateY(-1px);
}

.modern-table {
  border-radius: 8px;
  overflow: hidden;
}

.modern-table :deep(.q-table__top),
.modern-table :deep(.q-table__bottom) {
  padding: 12px 16px;
  background: #f8fafc;
}

.modern-table :deep(th) {
  font-weight: 600;
  color: #1976d2;
  background: #f8fafc;
  font-size: 0.813rem;
  padding: 8px 12px;
  height: 40px;
}

.modern-table :deep(td) {
  padding: 6px 12px;
  font-size: 0.813rem;
  height: 36px;
}

.modern-table :deep(tr) {
  height: 36px;
}

.modern-table :deep(.q-table__grid-content) {
  background: #f8fafc;
}

.modern-table :deep(.q-table__bottom) {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.modern-table :deep(tbody tr:nth-child(even)) {
  background: #fafbfc;
}

.modern-table :deep(tbody tr:hover) {
  background: #f0f7ff !important;
}

.modern-table :deep(tbody tr:has(td[data-inactive='true'])) {
  opacity: 0.7;
  background: #f5f5f5;
}

.modern-table :deep(tbody tr:has(td[data-inactive='true']):hover) {
  background: #eeeeee !important;
}

/* Estilo alternativo usando classes */
.modern-table :deep(.inactive-row) {
  opacity: 0.7;
  background: #f5f5f5;
}

.modern-table :deep(.inactive-row:hover) {
  background: #eeeeee !important;
}

.product-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.product-card--inactive {
  opacity: 0.7;
  filter: grayscale(30%);
  border: 2px solid #e0e0e0;
}

.product-card--inactive:hover {
  transform: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.inactive-image {
  opacity: 0.8;
  filter: grayscale(40%);
}

.image-upload-card {
  border: 2px dashed #1976d2;
  border-radius: 12px;
  background: #f8fafc;
}

.dialog-card {
  border-radius: 16px;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsividade */
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

  .modern-table :deep(th),
  .modern-table :deep(td) {
    padding: 6px 8px;
    font-size: 0.75rem;
    height: 32px;
  }

  .modern-table :deep(tr) {
    height: 32px;
  }

  .product-card {
    margin-bottom: 16px;
  }
}
</style>
