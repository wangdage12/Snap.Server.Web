<template>
  <el-container class="layout">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo" :class="{ collapsed: isCollapse }">
        <span v-if="!isCollapse">Vite Admin</span>
        <span v-else>VA</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        router
        class="menu"
      >
        <SidebarItem :routes="menuRoutes" />
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="toggle-btn" @click="toggle">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <div class="theme-toggle">
            <el-switch
              :model-value="themeStore.isDark"
              class="dark-mode-switch"
              :active-icon="Moon"
              :inactive-icon="Sunny"
              @change="themeStore.toggleTheme"
            />
          </div>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Fold, Expand, Moon, Sunny } from '@element-plus/icons-vue'
import SidebarItem from '../components/SidebarItem.vue'
import { useThemeStore } from '../stores/theme'

const isCollapse = ref(false)
const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

const toggle = () => (isCollapse.value = !isCollapse.value)

const activeMenu = computed(() => route.path)

/**
 * 获取菜单路由，直接使用配置的路由结构
 */
const menuRoutes = computed(() => {
  // 直接返回路由配置中的子路由
  const mainRoute = router.options.routes.find(r => r.path === '/')
  return mainRoute?.children || []
})
</script>

<style scoped>
.layout {
  height: 100vh;
}

.aside {
  background-color: var(--aside-bg);
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background-color: var(--aside-hover);
  transition: all 0.3s;
}

.logo.collapsed {
  font-size: 16px;
}

.menu {
  border-right: none;
  background-color: var(--aside-bg);
}

.menu :deep(.el-menu-item) {
  color: var(--aside-text);
  background-color: var(--aside-bg);
}

.menu :deep(.el-menu-item:hover) {
  background-color: var(--aside-hover) !important;
  color: #fff;
}

.menu :deep(.el-menu-item.is-active) {
  background-color: var(--aside-active) !important;
  color: #fff;
}

.menu :deep(.el-sub-menu__title) {
  color: var(--aside-text);
  background-color: var(--aside-bg);
}

.menu :deep(.el-sub-menu__title:hover) {
  background-color: var(--aside-hover) !important;
  color: #fff;
}

.header {
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-btn {
  font-size: 20px;
  cursor: pointer;
  color: var(--text-color);
  transition: color 0.3s;
}

.toggle-btn:hover {
  color: var(--aside-active);
}

.header-right {
  display: flex;
  align-items: center;
}

.theme-toggle {
  display: flex;
  align-items: center;
}

.dark-mode-switch {
  --el-switch-on-color: #409eff;
  --el-switch-off-color: #dcdfe6;
}

.main {
  background-color: var(--main-bg);
  padding: 20px;
}
</style>
