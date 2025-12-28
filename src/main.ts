import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/styles/index.scss'

import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

import '@/router/permission'

// 初始化主题
const themeStore = useThemeStore(pinia)
// 确保在应用挂载前应用正确的主题
if (themeStore.isDark) {
  document.documentElement.classList.add('dark')
}

app.mount('#app')
