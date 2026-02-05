<template>
  <div class="resource-management">
    <!-- 搜索栏和统计 -->
    <div class="search-statistics-row">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="包类型">
          <el-select
            v-model="searchForm.package_type"
            placeholder="全部"
            clearable
            @change="handleSearch"
          >
            <el-option label="MSI" value="msi" />
            <el-option label="MSIX" value="msix" />
          </el-select>
        </el-form-item>
        <el-form-item label="激活状态">
          <el-select
            v-model="searchForm.is_active"
            placeholder="全部"
            clearable
            @change="handleSearch"
          >
            <el-option label="已激活" value="true" />
            <el-option label="未激活" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 统计信息 -->
      <div class="statistics" v-if="!loading && resourceList.length > 0">
        <el-statistic title="资源总数" :value="resourceList.length" />
        <el-statistic title="MSI包" :value="msiCount" />
        <el-statistic title="MSIX包" :value="msixCount" />
        <el-statistic title="已激活" :value="activeCount" />
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="toolbar">
      <el-button type="success" @click="handleCreate">创建资源</el-button>
      <el-button type="primary" @click="handleRefresh" :loading="loading">刷新</el-button>
    </div>

    <!-- 资源表格 -->
    <el-table
      :data="resourceList"
      style="width: 100%"
      border
      v-loading="loading"
      element-loading-text="正在加载资源数据..."
    >
      <el-table-column prop="version" label="版本号" width="120" />
      <el-table-column label="包类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.package_type === 'msix' ? 'success' : 'primary'" size="small">
            {{ scope.row.package_type.toUpperCase() }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="激活状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.is_active ? 'success' : 'info'" size="small">
            {{ scope.row.is_active ? '已激活' : '未激活' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="file_size" label="文件大小" width="120" />
      <el-table-column label="下载链接" min-width="200">
        <template #default="scope">
          <el-link
            :href="scope.row.download_url"
            target="_blank"
            type="primary"
            :underline="false"
          >
            {{ scope.row.download_url }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="features" label="新功能描述" min-width="250" show-overflow-tooltip />
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="scope">
          {{ formatTime(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            link
            @click="handleView(scope.row)"
          >
            详情
          </el-button>
          <el-button
            size="small"
            type="warning"
            link
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            link
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <el-empty v-if="!loading && resourceList.length === 0" description="暂无资源数据" />

    <!-- 资源详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="资源详情"
      width="60%"
    >
      <div v-if="currentResource" class="resource-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="版本号">
            <el-tag type="primary">{{ currentResource.version }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="包类型">
            <el-tag :type="currentResource.package_type === 'msix' ? 'success' : 'primary'">
              {{ currentResource.package_type.toUpperCase() }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="激活状态">
            <el-tag :type="currentResource.is_active ? 'success' : 'info'">
              {{ currentResource.is_active ? '已激活' : '未激活' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="文件大小">
            {{ currentResource.file_size || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="文件哈希" :span="2">
            {{ currentResource.file_hash || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建者ID">
            {{ currentResource.created_by }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTime(currentResource.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="下载链接" :span="2">
            <el-link
              :href="currentResource.download_url"
              target="_blank"
              type="primary"
            >
              {{ currentResource.download_url }}
            </el-link>
          </el-descriptions-item>
          <el-descriptions-item label="新功能描述" :span="2">
            <div class="features-content">
              {{ currentResource.features || '无' }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 创建资源弹窗 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建资源"
      width="60%"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="120px"
      >
        <el-form-item label="版本号" prop="version">
          <el-input
            v-model="createForm.version"
            placeholder="请输入版本号，如：1.0.0"
          />
        </el-form-item>

        <el-form-item label="包类型" prop="package_type">
          <el-select
            v-model="createForm.package_type"
            placeholder="请选择包类型"
            style="width: 100%"
          >
            <el-option label="MSI" value="msi" />
            <el-option label="MSIX" value="msix" />
          </el-select>
        </el-form-item>

        <el-form-item label="下载链接" prop="download_url">
          <el-input
            v-model="createForm.download_url"
            placeholder="请输入下载URL"
          />
        </el-form-item>

        <el-form-item label="文件大小">
          <el-input
            v-model="createForm.file_size"
            placeholder="可选，如：114514KB"
          />
        </el-form-item>

        <el-form-item label="文件哈希">
          <el-input
            v-model="createForm.file_hash"
            placeholder="可选，文件哈希值"
          />
        </el-form-item>

        <el-form-item label="激活状态">
          <el-switch
            v-model="createForm.is_active"
            active-text="已激活"
            inactive-text="未激活"
          />
        </el-form-item>

        <el-form-item label="新功能描述">
          <el-input
            v-model="createForm.features"
            type="textarea"
            :rows="4"
            placeholder="可选，描述新功能内容"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="createLoading"
            @click="handleCreateSubmit"
          >
            创建
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑资源弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑资源"
      width="60%"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="120px"
      >
        <el-form-item label="版本号" prop="version">
          <el-input
            v-model="editForm.version"
            placeholder="请输入版本号，如：1.0.0"
          />
        </el-form-item>

        <el-form-item label="包类型" prop="package_type">
          <el-select
            v-model="editForm.package_type"
            placeholder="请选择包类型"
            style="width: 100%"
          >
            <el-option label="MSI" value="msi" />
            <el-option label="MSIX" value="msix" />
          </el-select>
        </el-form-item>

        <el-form-item label="下载链接" prop="download_url">
          <el-input
            v-model="editForm.download_url"
            placeholder="请输入下载URL"
          />
        </el-form-item>

        <el-form-item label="文件大小">
          <el-input
            v-model="editForm.file_size"
            placeholder="可选，如：114514KB"
          />
        </el-form-item>

        <el-form-item label="文件哈希">
          <el-input
            v-model="editForm.file_hash"
            placeholder="可选，文件哈希值"
          />
        </el-form-item>

        <el-form-item label="激活状态">
          <el-switch
            v-model="editForm.is_active"
            active-text="已激活"
            inactive-text="未激活"
          />
        </el-form-item>

        <el-form-item label="新功能描述">
          <el-input
            v-model="editForm.features"
            type="textarea"
            :rows="4"
            placeholder="可选，描述新功能内容"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="editLoading"
            @click="handleEditSubmit"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getDownloadResourceListApi,
  deleteDownloadResourceApi,
  createDownloadResourceApi,
  updateDownloadResourceApi,
  type DownloadResource,
  type CreateResourceRequest,
} from '@/api/download'

interface SearchForm {
  package_type: string
  is_active: string
}

const searchForm = reactive<SearchForm>({
  package_type: '',
  is_active: '',
})

const resourceList = ref<DownloadResource[]>([])
const loading = ref(false)
const detailDialogVisible = ref(false)
const currentResource = ref<DownloadResource | null>(null)

// 创建资源相关
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()

const createForm = reactive<CreateResourceRequest>({
  version: '',
  package_type: 'msix',
  download_url: '',
  features: '',
  file_size: '',
  file_hash: '',
  is_active: true,
})

const createRules: FormRules = {
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^\d+\.\d+\.\d+$/, message: '版本号格式应为 x.y.z，如 1.0.0', trigger: 'blur' },
  ],
  package_type: [
    { required: true, message: '请选择包类型', trigger: 'change' },
  ],
  download_url: [
    { required: true, message: '请输入下载链接', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' },
  ],
}

// 编辑资源相关
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref<FormInstance>()
const currentEditId = ref<string | null>(null)

const editForm = reactive<CreateResourceRequest>({
  version: '',
  package_type: 'msix',
  download_url: '',
  features: '',
  file_size: '',
  file_hash: '',
  is_active: true,
})

const editRules: FormRules = {
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^\d+\.\d+\.\d+$/, message: '版本号格式应为 x.y.z，如 1.0.0', trigger: 'blur' },
  ],
  package_type: [
    { required: true, message: '请选择包类型', trigger: 'change' },
  ],
  download_url: [
    { required: true, message: '请输入下载链接', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' },
  ],
}

// 统计数据
const msiCount = computed(() =>
  resourceList.value.filter(item => item.package_type === 'msi').length
)

const msixCount = computed(() =>
  resourceList.value.filter(item => item.package_type === 'msix').length
)

const activeCount = computed(() =>
  resourceList.value.filter(item => item.is_active === true).length
)

// 格式化时间
function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 获取资源列表
async function fetchResourceList() {
  loading.value = true
  try {
    const params: Record<string, any> = {}
    if (searchForm.package_type) {
      params.package_type = searchForm.package_type
    }
    if (searchForm.is_active) {
      params.is_active = searchForm.is_active
    }

    const data = await getDownloadResourceListApi(Object.keys(params).length > 0 ? params : undefined)
    resourceList.value = data || []
  } catch (error) {
    console.error('获取资源列表失败:', error)
    ElMessage.error('获取资源列表失败')
    resourceList.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  fetchResourceList()
}

function handleReset() {
  searchForm.package_type = ''
  searchForm.is_active = ''
  fetchResourceList()
}

function handleRefresh() {
  fetchResourceList()
}

function handleCreate() {
  // 重置表单
  Object.assign(createForm, {
    version: '',
    package_type: 'msix',
    download_url: '',
    features: '',
    file_size: '',
    file_hash: '',
    is_active: true,
  })
  createDialogVisible.value = true
}

async function handleCreateSubmit() {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    createLoading.value = true

    const result = await createDownloadResourceApi(createForm)

    if (result && result.id) {
      ElMessage.success('资源创建成功')
      createDialogVisible.value = false
      // 刷新列表
      await fetchResourceList()
    } else {
      ElMessage.error('创建资源失败')
    }
  } catch (error) {
    ElMessage.error('创建资源失败')
  } finally {
    createLoading.value = false
  }
}

function handleEdit(resource: DownloadResource) {
  if (!resource.id) {
    ElMessage.error('资源ID不存在，无法编辑')
    return
  }

  currentEditId.value = resource.id
  // 填充表单数据
  Object.assign(editForm, {
    version: resource.version,
    package_type: resource.package_type,
    download_url: resource.download_url,
    features: resource.features || '',
    file_size: resource.file_size || '',
    file_hash: resource.file_hash || '',
    is_active: resource.is_active ?? true,
  })
  editDialogVisible.value = true
}

async function handleEditSubmit() {
  if (!editFormRef.value || !currentEditId.value) return

  try {
    await editFormRef.value.validate()
    editLoading.value = true

    await updateDownloadResourceApi(currentEditId.value, editForm)

    ElMessage.success('资源更新成功')
    editDialogVisible.value = false
    // 刷新列表
    await fetchResourceList()
  } catch (error) {
    ElMessage.error('更新资源失败')
  } finally {
    editLoading.value = false
  }
}

function handleView(resource: DownloadResource) {
  currentResource.value = resource
  detailDialogVisible.value = true
}

async function handleDelete(resource: DownloadResource) {
  try {
    await ElMessageBox.confirm(
      `确定要删除版本 ${resource.version} 的 ${resource.package_type.toUpperCase()} 包吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    if (!resource.id) {
      ElMessage.error('资源ID不存在，无法删除')
      return
    }

    await deleteDownloadResourceApi(resource.id)

    ElMessage.success('资源删除成功')
    await fetchResourceList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除资源失败')
    }
  }
}

onMounted(() => {
  fetchResourceList()
})
</script>

<style scoped>
.resource-management {
  padding: 24px;
}

.search-statistics-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.search-form {
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

.features-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}
</style>