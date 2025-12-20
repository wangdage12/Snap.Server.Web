<template>
  <template v-for="item in routes" :key="item.path">
    <!-- 有子路由 -->
    <el-sub-menu
      v-if="hasChildren(item)"
      :index="item.path"
    >
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="icons[item.meta.icon as keyof typeof icons]" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>

      <SidebarItem :routes="item.children!" />
    </el-sub-menu>

    <!-- 普通菜单 -->
    <el-menu-item
      v-else
      :index="item.path"
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

defineProps<{
  routes: RouteRecordRaw[]
}>()

const hasChildren = (route: RouteRecordRaw) =>
  route.children && route.children.length > 0
</script>
