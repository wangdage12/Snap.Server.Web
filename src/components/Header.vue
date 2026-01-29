<template>
  <div class="app-header">
    <div class="header-left">
      <img :src="appIcon" alt="App Icon" class="app-icon" />
      <span class="app-name">{{ appName }}</span>
    </div>
    <div class="header-right">
      <template v-for="action in headerActions" :key="action.id">
        <component
          :is="action.component || 'el-button'"
          v-bind="action.props"
          @click="action.onClick"
          class="header-action-btn"
        >
          <template v-if="action.icon">
            <el-icon>
              <component :is="action.icon" />
            </el-icon>
          </template>
          <span>{{ action.label }}</span>
        </component>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface HeaderAction {
  id: string
  label: string
  icon?: any
  component?: any
  props?: Record<string, any>
  onClick: () => void
}

interface Props {
  appIcon?: string
  appName?: string
  actions?: HeaderAction[]
}

const props = withDefaults(defineProps<Props>(), {
  appIcon: '/vite.svg',
  appName: 'Snap Hutao Web',
  actions: () => []
})

const headerActions = computed(() => props.actions)
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  min-height: 70px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: contain;
}

.app-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>