<template>
  <div class="home-page">
    <Header
      :app-icon="appIcon"
      :app-name="appName"
      :actions="headerActions"
    />

    <div class="home-content">
      <div class="hero-section">
        <img :src="appIcon" alt="App Icon" class="hero-icon" />
        <h1 class="hero-title">{{ appName }}</h1>
        <p class="hero-description">
          {{ appDescription }}
        </p>
        <div class="hero-buttons">
          <template v-for="button in heroButtons" :key="button.id">
            <el-button
              :type="button.type || 'primary'"
              :size="button.size || 'large'"
              @click="button.onClick"
            >
              <el-icon v-if="button.icon">
                <component :is="button.icon" />
              </el-icon>
              <span>{{ button.label }}</span>
            </el-button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Setting, Document, ChatDotRound } from '@element-plus/icons-vue'
import Header from '@/components/Header.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 配置项
const appIcon = ref('/HT_logo.png')
const appName = ref('Snap Hutao')
const appDescription = ref('胡桃工具箱是一款以 MIT 协议开源的原神工具箱，专为现代化 Windows 平台设计，旨在改善桌面端玩家的游戏体验。')

// 页头右侧按钮配置
const headerActions = ref([
  {
    id: 'github',
    label: 'GitHub 仓库',
    icon: Document,
    component: 'el-button',
    props: {
      type: 'default',
      link: true
    },
    onClick: () => {
      window.open('https://github.com/wangdage12/Snap.Hutao', '_blank')
    }
  },
  {
    id: 'discord',
    label: '加入 Discord 服务器',
    icon: ChatDotRound,
    component: 'el-button',
    props: {
      type: 'default',
      link: true
    },
    onClick: () => {
      window.open('https://discord.gg/ucH3mgeWpQ', '_blank')
    }
  },
  {
    id: 'console',
    label: '控制台',
    icon: Setting,
    component: 'el-button',
    props: {
      type: 'primary'
    },
    onClick: () => {
      router.push('/dashboard')
    }
  }
])

// 主页中心按钮配置
const heroButtons = ref([
  {
    id: 'btn1',
    label: '快速开始',
    type: 'primary',
    size: 'large',
    icon: undefined,
    onClick: () => {
      window.open('https://github.com/wangdage12/Snap.Hutao', '_blank')
    }
  },
  {
    id: 'btn2',
    label: '查看文档',
    type: 'default',
    size: 'large',
    icon: undefined,
    onClick: () => {
      // window.open('https://github.com/wangdage12/Snap.Server.Web', '_blank')
      ElMessage.info('文档正在编写中，敬请期待！')
    }
  }
])
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--main-bg);
  display: flex;
  flex-direction: column;
}

.home-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.hero-section {
  text-align: center;
  max-width: 800px;
}

.hero-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 10px;
  border-radius: 20px;
  object-fit: contain;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-color);
  background: linear-gradient(135deg, var(--aside-active), #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 18px;
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 40px;
  opacity: 0.8;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-buttons .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 32px;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.hero-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .app-header {
    padding: 12px 16px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-description {
    font-size: 16px;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-buttons .el-button {
    width: 100%;
  }
}
</style>