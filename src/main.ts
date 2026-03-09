import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/styles/index.scss'
import '@/router/permission'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import Particles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'
import type { Engine } from '@tsparticles/engine'
import * as Sentry from "@sentry/vue";

const app = createApp(App)
const pinia = createPinia()

Sentry.init({
  app,
  dsn: "https://2e38c08821de95d002b6e6253d3cd599@o4507525750521856.ingest.us.sentry.io/4511014276169728",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.2,
  tracePropagationTargets: ["localhost", "https://htserver.wdg.cloudns.ch/"],
});

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(Particles, {
  init: async (engine: Engine) => {
    await loadSlim(engine)
  }
})

// 初始化主题
const themeStore = useThemeStore(pinia)
// 确保在应用挂载前应用正确的主题
if (themeStore.isDark) {
  document.documentElement.classList.add('dark')
}

app.mount('#app')
