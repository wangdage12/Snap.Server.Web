<template>
  <div class="user-management">
    <!-- 搜索栏和用户统计并排 -->
    <div class="search-statistics-row">
      <!-- GitHub样式搜索框 -->
      <div class="search-container">
        <GitHubSearchInput
          ref="githubSearch"
          v-model="searchQuery"
          placeholder="搜索用户... 例如: role:developer username:test"
          @search="handleGitHubSearch"
        />
        <div class="search-actions">
          <el-button type="primary" @click="executeSearch" :loading="loading">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>

      <!-- 用户统计 -->
      <div class="statistics" v-if="!loading && displayUserList.length > 0">
        <el-statistic title="当前显示用户数" :value="displayUserList.length" />
        <el-statistic title="运维人员" :value="maintainerCount" />
        <el-statistic title="开发者" :value="developerCount" />
        <el-statistic v-if="isSearchMode" title="搜索模式" value="进行中" />
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleRefresh" :loading="loading">刷新</el-button>
    </div>

    <!-- 用户表格 -->
    <el-table 
      :data="displayUserList" 
      style="width: 100%" 
      border 
      v-loading="loading"
      element-loading-text="正在加载用户数据..."
    >
      <el-table-column prop="_id" label="ID" width="120" />
      <el-table-column prop="UserName" label="用户名" min-width="150" />
      <el-table-column prop="email" label="邮箱" min-width="200" />
      <el-table-column label="角色" width="150">
        <template #default="scope">
          <el-tag v-if="scope.row.IsMaintainer" type="danger">运维</el-tag>
          <el-tag v-if="scope.row.IsLicensedDeveloper" type="success">开发者</el-tag>
          <el-tag v-if="!scope.row.IsMaintainer && !scope.row.IsLicensedDeveloper" type="info">普通用户</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="CreatedAt" label="注册时间" width="180" />
      <el-table-column label="权限状态" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.IsMaintainer || scope.row.IsLicensedDeveloper ? 'success' : 'info'">
            {{ scope.row.IsMaintainer || scope.row.IsLicensedDeveloper ? '高权限' : '普通' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <el-empty v-if="!loading && displayUserList.length === 0" description="暂无用户数据" />


  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import GitHubSearchInput from '@/components/GitHubSearchInput.vue'
import { getUserListApi, type UserListItem } from '@/api/user'

const githubSearch = ref<InstanceType<typeof GitHubSearchInput>>()
const searchQuery = ref('')
const currentFilters = ref<Record<string, string>>({})
const userList = ref<UserListItem[]>([])
const loading = ref(false)
const isSearchMode = ref(false)

// 显示的用户列表（直接使用后端返回的数据）
const displayUserList = computed(() => {
  return userList.value
})

// 统计数据（基于当前显示的列表）
const maintainerCount = computed(() =>
  displayUserList.value.filter(user => user.IsMaintainer).length
)

const developerCount = computed(() =>
  displayUserList.value.filter(user => user.IsLicensedDeveloper).length
)

// 获取用户列表
async function fetchUserList(filters?: Record<string, string>) {
  loading.value = true
  try {
    const data = await getUserListApi(filters)
    userList.value = data

    if (filters && Object.keys(filters).length > 0) {
      ElMessage.success(`找到 ${data.length} 个匹配的用户`)
      isSearchMode.value = true
    } else {
      ElMessage.success('用户列表加载成功')
      isSearchMode.value = false
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败，请检查权限设置')
    userList.value = []
  } finally {
    loading.value = false
  }
}

// 处理GitHub搜索
function handleGitHubSearch(_query: string, filters: Record<string, string>) {
  currentFilters.value = filters
  fetchUserList(filters)
}

// 执行搜索（通过搜索框）
function executeSearch() {
  if (githubSearch.value) {
    githubSearch.value.handleSearch()
  } else {
    handleGitHubSearch(searchQuery.value, currentFilters.value)
  }
}

// 重置搜索
function handleReset() {
  searchQuery.value = ''
  currentFilters.value = {}
  fetchUserList()
}

// 刷新列表
function handleRefresh() {
  if (isSearchMode.value && Object.keys(currentFilters.value).length > 0) {
    fetchUserList(currentFilters.value)
  } else {
    fetchUserList()
  }
}

// 页面加载时获取用户列表
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-management {
  padding: 24px;
}

.search-statistics-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 24px;
}

.search-container {
  width: 600px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-container :deep(.github-search-container) {
  flex: 1;
  min-width: 0;
}

.search-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.statistics {
  display: flex;
  gap: 24px;
  flex-shrink: 0;
}

.toolbar {
  margin-bottom: 16px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .search-statistics-row {
    flex-direction: column;
  }

  .search-container {
    width: 100%;
  }

  .statistics {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>