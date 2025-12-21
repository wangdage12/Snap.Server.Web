import router from './index'
import { useUserStore } from '@/stores/user'

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 未登录
  if (!userStore.token) {
    if (to.path === '/login') {
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

  next()
})
