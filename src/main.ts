import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/styles/index.scss'

import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import Particles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'
import type { Engine } from '@tsparticles/engine'


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(Particles, {
  init: async (engine: Engine) => {
    await loadSlim(engine)
  }
})
import '@/router/permission'

// 初始化主题
const themeStore = useThemeStore(pinia)
// 确保在应用挂载前应用正确的主题
if (themeStore.isDark) {
  document.documentElement.classList.add('dark')
}

app.mount('#app')
