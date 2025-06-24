import { defineStore } from 'pinia'
import salesService from '../services/sales.service'
import printerService from '../services/printer.service'

export const useSalesStore = defineStore('sales', {
  state: () => ({
    sales: [],
    loading: false,
    error: null,
  }),
  getters: {
    getSaleById: (state) => (id) => {
      return state.sales.find((sale) => sale.id === id)
    },
    totalSales: (state) => {
      return state.sales.reduce((total, sale) => total + sale.total, 0)
    },
  },
  actions: {
    async fetchSales() {
      this.loading = true
      try {
        this.sales = await salesService.getSales()
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },
    async createSale(saleData) {
      try {
        // Create sale (without automatic printing by default)
        const newSale = await salesService.createSale(saleData)
        this.sales.push(newSale)
        return newSale
      } catch (error) {
        this.error = error
        throw error // Re-throw to allow handling in components
      }
    },
    async createSaleWithPrinting(saleData) {
      try {
        // Print invoice before creating sale
        await printerService.printInvoice(saleData)

        // Create sale after successful printing
        const newSale = await salesService.createSale(saleData)
        this.sales.push(newSale)
        return newSale
      } catch (error) {
        this.error = error
        throw error // Re-throw to allow handling in components
      }
    },
    async fetchSalesReport(startDate, endDate) {
      try {
        return await salesService.getSalesReport(startDate, endDate)
      } catch (error) {
        this.error = error
      }
    },
    async fetchDailySales() {
      try {
        return await salesService.getDailySales()
      } catch (error) {
        this.error = error
      }
    },
    async fetchTopProducts() {
      try {
        return await salesService.getTopProducts()
      } catch (error) {
        this.error = error
      }
    },
  },
})
