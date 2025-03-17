<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Gestão de Estoque</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-table
              title="Produtos"
              :rows="products"
              :columns="productColumns"
              row-key="id"
              :loading="loading"
              :pagination="{ rowsPerPage: 10 }"
            >
              <template v-slot:top-right>
                <q-btn
                  color="primary"
                  label="Adicionar Movimentação"
                  @click="showMovementDialog = true"
                />
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="showMovementDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Nova Movimentação</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="registerMovement">
            <q-select
              v-model="movement.productId"
              :options="productOptions"
              label="Produto"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              required
            />

            <q-select
              v-model="movement.type"
              :options="movementTypes"
              label="Tipo de Movimentação"
              required
            />

            <q-input
              v-model.number="movement.quantity"
              type="number"
              label="Quantidade"
              min="1"
              required
            />

            <q-input v-model="movement.description" label="Descrição" type="textarea" />

            <div class="q-mt-md">
              <q-btn label="Cancelar" color="negative" flat v-close-popup />
              <q-btn label="Registrar" type="submit" color="positive" class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStockStore } from 'stores/stock-store'

const stockStore = useStockStore()

const products = ref([])
const loading = ref(false)
const showMovementDialog = ref(false)

const movement = ref({
  productId: null,
  type: 'entrada',
  quantity: 1,
  description: '',
})

const productColumns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
  { name: 'quantity', label: 'Quantidade', field: 'quantity', align: 'center' },
  { name: 'unit', label: 'Unidade', field: 'unit', align: 'center' },
  { name: 'category', label: 'Categoria', field: 'category', align: 'center' },
]

const movementTypes = [
  { label: 'Entrada', value: 'entrada' },
  { label: 'Saída', value: 'saida' },
]

const productOptions = computed(() => {
  return products.value.map((p) => ({
    id: p.id,
    name: `${p.name} (${p.quantity} ${p.unit})`,
  }))
})

async function loadProducts() {
  try {
    loading.value = true
    products.value = await stockStore.loadProducts()
  } finally {
    loading.value = false
  }
}

async function registerMovement() {
  try {
    await stockStore.addMovement(movement.value)
    showMovementDialog.value = false
    movement.value = {
      productId: null,
      type: 'entrada',
      quantity: 1,
      description: '',
    }
  } catch (error) {
    console.error('Erro ao registrar movimentação:', error)
  }
}

onMounted(() => {
  loadProducts()
})
</script>
