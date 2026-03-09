import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

/**
 * 路由元信息说明：
 * - hidden: 是否在菜单中隐藏
 * - title: 菜单标题
 * - icon: 菜单图标
 * - requiresFullAdmin: 是否需要完整管理员权限（IsMaintainer && IsLicensedDeveloper）
 */
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
    path: '/download',
    component: () => import('@/views/download/index.vue'),
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
        meta: { title: '用户管理', icon: 'User', requiresFullAdmin: true },
      },
      {
        path: 'gacha-log',
        component: () => import('@/views/gacha-log/index.vue'),
        meta: { title: '祈愿记录', icon: 'TrendCharts' },
      },
      {
        path: 'system',
        component: () => import('@/components/RouterViewPlaceholder.vue'),
        meta: { title: '系统管理', icon: 'Setting' },
        children: [
          {
            path: 'menu',
            component: () => import('@/views/dashboard/index.vue'),
            meta: { title: '菜单管理', icon: 'Menu', requiresFullAdmin: true },
          },
          {
            path: 'role',
            component: () => import('@/views/dashboard/index.vue'),
            meta: { title: '角色管理', icon: 'UserFilled', requiresFullAdmin: true },
          },
          {
            path: 'announcement',
            component: () => import('@/views/announcement/index.vue'),
            meta: { title: '公告管理', icon: 'Bell' },
          },
          {
            path: 'download-manager',
            component: () => import('@/views/download-manager/index.vue'),
            meta: { title: '下载资源管理', icon: 'Download' },
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
