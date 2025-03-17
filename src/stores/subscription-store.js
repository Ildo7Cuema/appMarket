import { defineStore } from 'pinia'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    status: 'active', // 'active' | 'expired' | 'not_found'
    lastCheck: null,
  }),
  actions: {
    setExpired() {
      this.status = 'expired'
      this.lastCheck = new Date()
    },
    setNotFound() {
      this.status = 'not_found'
      this.lastCheck = new Date()
    },
    setActive() {
      this.status = 'active'
      this.lastCheck = new Date()
    },
  },
  getters: {
    isActive: (state) => state.status === 'active',
    isExpired: (state) => state.status === 'expired',
    isNotFound: (state) => state.status === 'not_found',
  },
})
