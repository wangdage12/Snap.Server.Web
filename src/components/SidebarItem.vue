<template>
  <template v-for="item in routes" :key="item.path">
    <!-- 有子路由 -->
    <el-sub-menu
      v-if="hasChildren(item)"
      :index="getFullPath(item)"
    >
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="icons[item.meta.icon as keyof typeof icons]" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>

      <SidebarItem :routes="item.children!" :parent-path="getFullPath(item)" />
    </el-sub-menu>

    <!-- 普通菜单 -->
    <el-menu-item
      v-else
      :index="getFullPath(item)"
    >
      <el-icon v-if="item.meta?.icon">
        <component :is="icons[item.meta.icon as keyof typeof icons]" />
      </el-icon>
      <span>{{ item.meta?.title }}</span>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import * as icons from '@element-plus/icons-vue'

interface Props {
  routes: RouteRecordRaw[]
  parentPath?: string
}

const props = withDefaults(defineProps<Props>(), {
  parentPath: '/dashboard'
})

const hasChildren = (route: RouteRecordRaw) =>
  route.children && route.children.length > 0

const getFullPath = (route: RouteRecordRaw) => {
  // 如果是绝对路径，直接返回
  if (route.path.startsWith('/')) {
    return route.path
  }
  // 否则拼接父级路径
  const basePath = props.parentPath || ''
  return basePath ? `${basePath}/${route.path}` : `/${route.path}`
}
</script>
