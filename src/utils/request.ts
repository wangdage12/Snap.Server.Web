import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

/** 请求拦截：自动加 Token */
request.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

/** 响应拦截：兼容 code / retcode */
request.interceptors.response.use(
  (response) => {
    const res = response.data

    // 登录接口：code
    if ('code' in res) {
      if (res.code !== 0) {
        ElMessage.error(res.message || '请求失败')
        return Promise.reject(res.message)
      }
      return res.data
    }

    // 用户信息接口：retcode
    if ('retcode' in res) {
      if (res.retcode !== 0) {
        ElMessage.error(res.message || '请求失败')
        return Promise.reject(res.message)
      }
      return res.data
    }

    // 兜底
    return res
  },
  (error) => {
    // 处理401未授权错误
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      
      // 如果不在登录页，则跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      
      ElMessage.error('登录已过期，请重新登录')
      return Promise.reject(new Error('登录已过期'))
    }
    
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
