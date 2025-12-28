import { defineStore } from 'pinia'
import { getUserInfoApi } from '@/api/user'
import type { UserInfo } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null as UserInfo | null,
  }),

  actions: {
    setToken(token: string) {
      this.token = token
      // 持久化存储token
      localStorage.setItem('token', token)
    },

    async fetchUserInfo() {
      const userData = await getUserInfoApi()
      this.userInfo = userData
      return userData
    },

    logout() {
      this.token = ''
      this.userInfo = null
      // 清除本地存储的token（如果有）
      localStorage.removeItem('token')
    },
  },
})
