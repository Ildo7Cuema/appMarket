const routes = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/inactive-account',
    component: () => import('pages/InactiveAccountPage.vue'),
    meta: {
      title: 'Conta Inativa',
    },
  },
  {
    path: '/subscription',
    component: () => import('pages/SubscriptionPage.vue'),
    meta: {
      title: 'Assinatura',
    },
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'products-stock',
        component: () => import('pages/ProductsStockPage.vue'),
        meta: { roles: ['admin', 'super-admin'] },
      },
      {
        path: 'categories',
        component: () => import('pages/CategoryPage.vue'),
        meta: { roles: ['admin', 'super-admin'] },
      },
      {
        path: 'sales',
        component: () => import('pages/SalesPage.vue'),
        meta: { roles: ['operador de caixa'] },
      },
      {
        path: 'admin',
        component: () => import('pages/AdminPage.vue'),
        meta: { roles: ['admin', 'super-admin'] },
      },
      {
        path: 'admin/activation-status',
        component: () => import('pages/ActivationStatusPage.vue'),
        meta: { roles: ['admin', 'super-admin'] },
      },
      {
        path: 'admin/settings',
        component: () => import('pages/SystemSettings.vue'),
        meta: { roles: ['admin', 'super-admin'] },
      },
      {
        path: 'admin/activities',
        component: () => import('pages/RecentActivities.vue'),
        meta: { roles: ['admin', 'super-admin'] },
      },
      {
        path: 'super-admin',
        component: () => import('pages/SuperAdminPage.vue'),
        meta: { roles: ['super-admin'] },
      },
      {
        path: 'employees',
        component: () => import('pages/EmployeesPage.vue'),
        meta: { roles: ['admin', 'super-admin'] },
      },
      {
        path: 'reports',
        component: () => import('pages/ReportsPage.vue'),
        meta: { roles: ['admin', 'super-admin'] },
      },
      {
        path: 'permissions',
        component: () => import('pages/PermissionsPage.vue'),
        meta: { roles: ['super-admin'] },
      },
      {
        path: 'settings',
        component: () => import('pages/SettingsPage.vue'),
        meta: { roles: ['super-admin', 'admin'] },
      },
      {
        path: 'profile',
        component: () => import('pages/UserProfile.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
