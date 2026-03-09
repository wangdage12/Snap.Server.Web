import router from './index'
import { useUserStore } from '@/stores/user'

/**
 * 检查用户是否具有完整管理员权限
 * 需要 IsMaintainer 和 IsLicensedDeveloper 都为 true
 */
const hasFullAdminPermission = (userInfo: { IsMaintainer: boolean; IsLicensedDeveloper: boolean } | null): boolean => {
  return userInfo?.IsMaintainer === true && userInfo?.IsLicensedDeveloper === true
}

router.beforeEach(async (to, _ , next) => {
  const userStore = useUserStore()

  // 未登录
  if (!userStore.token) {
    // 主页（/）、登录页和下载页允许未登录访问
    if (to.path === '/' || to.path === '/login' || to.path === '/download') {
      next()
    } else {
      next('/login')
    }
    return
  }

  // 已登录还去 login
  if (to.path === '/login') {
    next('/')
    return
  }

  // 如果没有用户信息，尝试获取
  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      // 获取用户信息失败，可能token已过期，跳转到登录页
      console.error('获取用户信息失败:', error)
      userStore.logout()
      next('/login')
      return
    }
  }

  // 检查路由权限
  if (to.meta.requiresFullAdmin && !hasFullAdminPermission(userStore.userInfo)) {
    // 没有完整管理员权限，跳转到首页
    next('/dashboard/home')
    return
  }

  next()
})
