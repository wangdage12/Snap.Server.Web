import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const routes = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true }
  },
  {
    path: '/',
    component: DefaultLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'House' },
      },
      {
        path: 'user',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '用户管理', icon: 'User' },
      },
      {
        path: 'system',
        meta: { title: '系统管理', icon: 'Setting' },
        children: [
          {
            path: 'menu',
            component: () => import('@/views/dashboard/index.vue'),
            meta: { title: '菜单管理', icon: 'Menu' },
          },
          {
            path: 'role',
            component: () => import('@/views/dashboard/index.vue'),
            meta: { title: '角色管理', icon: 'UserFilled' },
          },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
