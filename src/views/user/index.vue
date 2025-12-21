<template>
  <div class="user-management">
    <!-- 搜索栏和用户统计并排 -->
    <div class="search-statistics-row">
<!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="关键词">
        <el-input 
          v-model="searchForm.keyword" 
          placeholder="请输入用户名、邮箱或ID" 
          clearable 
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch" :loading="loading">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserListApi, type UserListItem } from '@/api/user'

interface SearchForm {
  keyword: string
}

const searchForm = reactive<SearchForm>({
  keyword: ''
})

const userList = ref<UserListItem[]>([])
const loading = ref(false)
const isSearchMode = ref(false)

// 显示的用户列表（根据是否在搜索模式决定显示全部还是搜索结果）
const displayUserList = computed(() => {
  return userList.value
})

// 统计数据
const maintainerCount = computed(() => 
  userList.value.filter(user => user.IsMaintainer).length
)

const developerCount = computed(() => 
  userList.value.filter(user => user.IsLicensedDeveloper).length
)

// 获取用户列表
async function fetchUserList(searchKeyword?: string) {
  loading.value = true
  try {
    const data = await getUserListApi(searchKeyword)
    userList.value = data
    
    if (searchKeyword) {
      ElMessage.success(`搜索完成，找到 ${data.length} 个匹配的用户`)
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

function handleSearch() {
  if (!searchForm.keyword.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  fetchUserList(searchForm.keyword.trim())
}

function handleReset() {
  searchForm.keyword = ''
  isSearchMode.value = false
  fetchUserList() // 重新获取全部用户列表
}

function handleRefresh() {
  if (isSearchMode.value && searchForm.keyword) {
    fetchUserList(searchForm.keyword)
  } else {
    fetchUserList()
  }
}

function handleAdd() {
  ElMessage.info('新增用户功能待实现')
}

function handleEdit(row: UserListItem) {
  ElMessage.info(`编辑用户 ${row.UserName} 功能待实现`)
}

function handleDelete(row: UserListItem) {
  ElMessage.info(`删除用户 ${row.UserName} 功能待实现`)
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
/* 新增flex布局 */
.search-statistics-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}
.search-form {
  /* 保持原有样式，可根据需要调整宽度 */
  margin-bottom: 0;
  flex: 1;
}
.statistics {
  margin-left: 32px;
  display: flex;
  gap: 24px;
  margin-top: 0;
}
.toolbar {
  margin-bottom: 16px;
}
</style>