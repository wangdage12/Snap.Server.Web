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
  integrations: [Sentry.browserTracingIntegration({ router })],
  tracesSampleRate: 0.2,
  tracePropagationTargets: ["localhost", "https://htserver.wdg.cloudns.ch/"],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
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
