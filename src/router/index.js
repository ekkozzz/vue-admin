import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    redirect: '/index',
    children: [
      {
        path: '/index',
        name: 'index',
        component: () => import('../views/Welcome.vue'),
        meta: { title: '首页' },
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('../views/user/User.vue'),
        meta: { title: '用户列表' },
      },
      {
        path: '/roles',
        name: 'roles',
        component: () => import('../views/roles/Roles.vue'),
        meta: { title: '角色列表' },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
]

const router = new VueRouter({
  routes,
})

router.beforeEach((to, form, next) => {
  if (to.path === '/login') return next()
  const tokenStr = sessionStorage.getItem('token') || ''
  if (!tokenStr) return next('/login')
  else next()
})

export default router
