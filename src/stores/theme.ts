import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 从localStorage读取初始主题状态，默认为light
  const savedTheme = localStorage.getItem('theme') || 'light'
  const isDark = ref(savedTheme === 'dark')

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // 设置主题
  const setTheme = (theme: 'light' | 'dark') => {
    isDark.value = theme === 'dark'
  }

  // 监听主题变化，同步到localStorage和html元素
  watch(isDark, (newValue) => {
    const theme = newValue ? 'dark' : 'light'
    localStorage.setItem('theme', theme)
    
    // 在html元素上添加或移除dark类
    const html = document.documentElement
    if (newValue) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }, { immediate: true })

  return {
    isDark,
    toggleTheme,
    setTheme
  }
})