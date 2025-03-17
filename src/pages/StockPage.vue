<template>
  <q-page padding>
    <div class="row q-mb-md">
      <div class="col">
        <q-btn
          color="primary"
          icon="add"
          label="Adicionar Produto"
          @click="showAddDialog = true"
          no-caps
          dense
        />
      </div>
    </div>

    <q-table
      dense
      title="# Gestão de Stock"
      title-class="text-red-10"
      :rows="products"
      :columns="columns"
      row-key="id"
      :loading="loading"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round color="primary" icon="edit" @click="editProduct(props.row)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn flat round color="negative" icon="delete" @click="deleteProduct(props.row.id)">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="text-center">
          <q-icon name="inventory" color="green" size="md"></q-icon>
          <div class="text-small text-grey-8">Adicionar Produto</div>
        </q-card-section>

        <q-card-section>
          <q-input dense v-model="newProduct.name" label="Nome do Produto" />
          <q-input dense v-model="newProduct.description" label="Descrição" class="q-mt-sm" />
          <q-input dense v-model="newProduct.price" label="Preço" type="number" class="q-mt-sm" />
          <q-input
            dense
            v-model="newProduct.quantity"
            label="Stock Inicial"
            type="number"
            class="q-mt-sm"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn outline label="Cancelar" color="grey" no-caps v-close-popup icon="fas fa-close" />
          <q-btn
            outline
            label="Guardar"
            color="green"
            no-caps
            @click="saveProduct"
            icon="fas fa-save"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStockStore } from '../stores/stock-store'

export default {
  setup() {
    const stockStore = useStockStore()
    const products = ref([])
    const loading = ref(false)
    const showAddDialog = ref(false)
    const newProduct = ref({
      name: '',
      description: '',
      price: 0,
      quantity: 0,
    })

    const columns = [
      { name: 'name', label: 'Nome', field: 'name', align: 'left' },
      { name: 'description', label: 'Descrição', field: 'description' },
      { name: 'price', label: 'Preço', field: 'price' },
      { name: 'quantity', label: 'Stock', field: 'quantity' },
      { name: 'actions', label: 'Ações', field: '', align: 'center' },
    ]

    const loadProducts = async () => {
      loading.value = true
      try {
        await stockStore.fetchProducts()
        products.value = stockStore.products
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    const saveProduct = async () => {
      try {
        await stockStore.addProduct(newProduct.value)
        await loadProducts()
        showAddDialog.value = false
      } catch (error) {
        console.error(error)
      }
    }

    const editProduct = (product) => {
      // TODO: Implement edit functionality
      console.log('Edit product:', product)
    }

    const deleteProduct = async (id) => {
      try {
        await stockStore.deleteProduct(id)
        await loadProducts()
      } catch (error) {
        console.error(error)
      }
    }

    onMounted(() => {
      loadProducts()
    })

    return {
      products,
      loading,
      showAddDialog,
      newProduct,
      columns,
      saveProduct,
      editProduct,
      deleteProduct,
    }
  },
}
</script>
