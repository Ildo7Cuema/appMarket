import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useSubscriptionStore } from '../stores/subscription-store'

const createHistory = process.env.SERVER
  ? createMemoryHistory
  : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory

const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  history: createHistory(process.env.VUE_ROUTER_BASE),
})

router.beforeEach(async (to, from, next) => {
  const subscriptionStore = useSubscriptionStore()

  // Verificar status da assinatura
  if (subscriptionStore.isExpired || subscriptionStore.isNotFound) {
    // Permitir apenas a página de assinatura
    if (to.name !== 'subscription') {
      return next({ name: 'subscription' })
    }
    // Limpar layout para mostrar apenas a página de assinatura
    to.meta.layout = 'empty'
    return next()
  }

  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    next('/')
  } else {
    next()
  }
})

export default router
