import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import stockService from '../services/stock.service'

export const useStockStore = defineStore('stock', () => {
  const $q = useQuasar()

  // State
  const products = ref([])
  const movements = ref([])
  const history = ref([])
  const alerts = ref([])
  const batches = ref([])
  const loading = ref(false)

  // Actions
  async function loadProducts(query = '') {
    try {
      loading.value = true
      products.value = await stockService.getProducts(query)
    } catch (error) {
      showError('Erro ao carregar produtos')
      console.error('Erro ao carregar produtos:', error)
    } finally {
      loading.value = false
    }
  }

  async function loadMovements() {
    try {
      loading.value = true
      movements.value = await stockService.getStockMovements()
    } catch (error) {
      showError('Erro ao carregar movimentações')
      console.error('Erro ao carregar movimentações:', error)
    } finally {
      loading.value = false
    }
  }

  async function loadHistory(productId, period = '30d') {
    try {
      loading.value = true
      history.value = await stockService.getStockHistory(productId, period)
    } catch (error) {
      showError('Erro ao carregar histórico')
      console.error('Erro ao carregar histórico:', error)
    } finally {
      loading.value = false
    }
  }

  async function loadAlerts() {
    try {
      loading.value = true
      alerts.value = await stockService.getStockAlerts()
    } catch (error) {
      showError('Erro ao carregar alertas')
      console.error('Erro ao carregar alertas:', error)
    } finally {
      loading.value = false
    }
  }

  async function loadBatches() {
    try {
      loading.value = true
      batches.value = await stockService.getStockBatches()
    } catch (error) {
      showError('Erro ao carregar lotes')
      console.error('Erro ao carregar lotes:', error)
    } finally {
      loading.value = false
    }
  }

  async function addMovement(movement) {
    try {
      loading.value = true
      const newMovement = await stockService.registerMovement(movement)
      movements.value.unshift(newMovement)
      $q.notify({
        type: 'positive',
        message: 'Movimentação registrada com sucesso',
      })
    } catch (error) {
      showError('Erro ao registrar movimentação')
      console.error('Erro ao registrar movimentação:', error)
    } finally {
      loading.value = false
    }
  }

  async function addProduct(product) {
    try {
      loading.value = true
      const newProduct = await stockService.addProduct(product)
      products.value.unshift(newProduct)
      $q.notify({
        type: 'positive',
        message: 'Produto adicionado com sucesso',
      })
      return newProduct
    } catch (error) {
      showError('Erro ao adicionar produto')
      console.error('Erro ao adicionar produto:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function showError(message) {
    $q.notify({
      type: 'negative',
      message: message || 'Erro na operação',
    })
  }

  return {
    // State
    products,
    movements,
    history,
    alerts,
    batches,
    loading,

    // Actions
    loadProducts,
    loadMovements,
    loadHistory,
    loadAlerts,
    loadBatches,
    addMovement,
    addProduct,
  }
})
