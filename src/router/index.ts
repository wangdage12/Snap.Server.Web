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
    component: () => import('@/views/home/index.vue'),
    meta: { hidden: true }
  },
  {
    path: '/dashboard',
    component: DefaultLayout,
    redirect: '/dashboard/home',
    children: [
      {
        path: 'home',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'House' },
      },
      {
        path: 'user',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' },
      },
      {
        path: 'system',
        component: () => import('@/components/RouterViewPlaceholder.vue'),
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
          {
            path: 'announcement',
            component: () => import('@/views/announcement/index.vue'),
            meta: { title: '公告管理', icon: 'Bell' },
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
