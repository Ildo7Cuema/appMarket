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
  async function loadProducts(query = '', includeInactive = false) {
    try {
      loading.value = true
      products.value = await stockService.getProducts(query, includeInactive)
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

  async function updateProduct(product) {
    try {
      loading.value = true
      console.log('Atualizando produto no store:', product)

      // Verificar se o produto tem ID
      if (!product.id) {
        throw new Error('ID do produto é necessário para atualização')
      }

      // Chamar o serviço para atualizar o produto
      const updatedProduct = await stockService.updateProduct(product.id, product)

      // Atualizar a lista de produtos
      const index = products.value.findIndex((p) => p.id === product.id)
      if (index !== -1) {
        products.value[index] = { ...products.value[index], ...updatedProduct }
      }

      $q.notify({
        type: 'positive',
        message: 'Produto atualizado com sucesso',
      })

      return updatedProduct
    } catch (error) {
      showError('Erro ao atualizar produto')
      console.error('Erro ao atualizar produto:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(productId) {
    try {
      loading.value = true
      await stockService.deleteProduct(productId)

      // Remove o produto da lista local
      const index = products.value.findIndex((p) => p.id === productId)
      if (index !== -1) {
        products.value.splice(index, 1)
      }

      $q.notify({
        type: 'positive',
        message: 'Produto excluído com sucesso',
      })
    } catch (error) {
      showError('Erro ao excluir produto')
      console.error('Erro ao excluir produto:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteProducts(productIds) {
    try {
      loading.value = true
      const deletePromises = productIds.map((id) => stockService.deleteProduct(id))

      // Executar todos os deletes em paralelo
      const results = await Promise.allSettled(deletePromises)

      // Contar sucessos e falhas
      const successful = results.filter((result) => result.status === 'fulfilled')
      const failed = results.filter((result) => result.status === 'rejected')

      // Remover produtos bem-sucedidos da lista local
      successful.forEach((_, index) => {
        const productId = productIds[index]
        const productIndex = products.value.findIndex((p) => p.id === productId)
        if (productIndex !== -1) {
          products.value.splice(productIndex, 1)
        }
      })

      // Mostrar notificação apropriada
      if (failed.length === 0) {
        $q.notify({
          type: 'positive',
          message: `${successful.length} produtos excluídos com sucesso`,
        })
      } else if (successful.length === 0) {
        $q.notify({
          type: 'negative',
          message: 'Erro ao excluir todos os produtos selecionados',
        })
      } else {
        $q.notify({
          type: 'warning',
          message: `${successful.length} produtos excluídos, ${failed.length} falharam`,
        })
      }
    } catch (error) {
      showError('Erro ao excluir produtos')
      console.error('Erro ao excluir produtos:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function reactivateProduct(productId) {
    try {
      loading.value = true
      await stockService.reactivateProduct(productId)

      // Atualizar o produto na lista local
      const index = products.value.findIndex((p) => p.id === productId)
      if (index !== -1) {
        products.value[index].is_active = 1
      }

      $q.notify({
        type: 'positive',
        message: 'Produto reativado com sucesso',
      })
    } catch (error) {
      showError('Erro ao reativar produto')
      console.error('Erro ao reativar produto:', error)
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
    updateProduct,
    deleteProduct,
    deleteProducts,
    reactivateProduct,
  }
})
