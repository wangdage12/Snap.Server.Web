<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>公告管理</span>
        <div>
          <el-button type="success" @click="handleCreate">创建公告</el-button>
          <el-button type="primary" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </template>

    <el-table
      v-loading="loading"
      :data="announcementList"
      style="width: 100%"
    >
      <el-table-column prop="Id" label="ID" width="80" />
      <el-table-column prop="Title" label="标题" width="200" />
      <el-table-column prop="Content" label="内容" show-overflow-tooltip />
      <el-table-column prop="Severity" label="严重等级" width="100">
        <template #default="{ row }">
          <el-tag
            :type="getSeverityType(row.Severity)"
            size="small"
          >
            {{ getSeverityText(row.Severity) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="Distribution" label="发行版" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.Distribution" size="small" type="info">
            {{ row.Distribution }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="Link" label="链接" width="200">
        <template #default="{ row }">
          <el-link
            v-if="row.Link"
            :href="row.Link"
            target="_blank"
            type="primary"
          >
            查看详情
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="LastUpdateTime" label="更新时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.LastUpdateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            link
            @click="handleView(row)"
          >
            查看
          </el-button>
          <el-button
            size="small"
            type="warning"
            link
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            link
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 公告详情弹窗 -->
<el-dialog
  v-model="dialogVisible"
  title="公告详情"
  width="50%"
>
  <div
    v-if="currentAnnouncement"
    :class="['announcement-box', getSeverityClass(currentAnnouncement.Severity)]"
  >
    <!-- 标题 -->
    <div class="announcement-title">
      {{ currentAnnouncement.Title }}
    </div>

    <!-- 内容 -->
    <div class="announcement-content">
      <pre>{{ currentAnnouncement.Content }}</pre>
    </div>

    <!-- 底部信息 -->
    <div class="announcement-footer">
      <span class="announcement-time">
        {{ formatTime(currentAnnouncement.LastUpdateTime) }}
      </span>

      <el-link
        v-if="currentAnnouncement.Link"
        :href="currentAnnouncement.Link"
        target="_blank"
        type="primary"
      >
        查看详情
      </el-link>
    </div>
  </div>
</el-dialog>

<!-- 创建公告弹窗 -->
<el-dialog
  v-model="createDialogVisible"
  title="创建公告"
  width="60%"
>
  <el-form
    ref="createFormRef"
    :model="createForm"
    :rules="createRules"
    label-width="100px"
  >
    <el-form-item label="标题" prop="Title">
      <el-input
        v-model="createForm.Title"
        placeholder="请输入公告标题"
      />
    </el-form-item>
    
    <el-form-item label="内容" prop="Content">
      <el-input
        v-model="createForm.Content"
        type="textarea"
        :rows="6"
        placeholder="请输入公告内容"
      />
    </el-form-item>
    
    <el-form-item label="链接">
      <el-input
        v-model="createForm.Link"
        placeholder="可选，详细信息链接"
      />
    </el-form-item>
    
    <el-form-item label="严重等级">
      <el-select
        v-model="createForm.Severity"
        placeholder="请选择严重等级"
        clearable
      >
        <el-option label="信息" :value="0" />
        <el-option label="低" :value="1" />
        <el-option label="中" :value="2" />
        <el-option label="高" :value="3" />
      </el-select>
    </el-form-item>
    
    <el-form-item label="语言代码">
      <el-input
        v-model="createForm.Locale"
        placeholder="可选，如 zh-CN, en-US"
      />
    </el-form-item>
    
    <el-form-item label="最大显示版本">
      <el-input
        v-model="createForm.MaxPresentVersion"
        placeholder="可选，最大显示版本号"
      />
    </el-form-item>
    
    <el-form-item label="发行版名称">
      <el-input
        v-model="createForm.Distribution"
        placeholder="可选，用于区分不同发行版，默认为空表示所有发行版"
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

<!-- 编辑公告弹窗 -->
<el-dialog
  v-model="editDialogVisible"
  title="编辑公告"
  width="60%"
>
  <el-form
    ref="editFormRef"
    :model="editForm"
    :rules="createRules"
    label-width="100px"
  >
    <el-form-item label="标题" prop="Title">
      <el-input
        v-model="editForm.Title"
        placeholder="请输入公告标题"
      />
    </el-form-item>
    
    <el-form-item label="内容" prop="Content">
      <el-input
        v-model="editForm.Content"
        type="textarea"
        :rows="6"
        placeholder="请输入公告内容"
      />
    </el-form-item>
    
    <el-form-item label="链接">
      <el-input
        v-model="editForm.Link"
        placeholder="可选，详细信息链接"
      />
    </el-form-item>
    
    <el-form-item label="严重等级">
      <el-select
        v-model="editForm.Severity"
        placeholder="请选择严重等级"
        clearable
      >
        <el-option label="信息" :value="0" />
        <el-option label="低" :value="1" />
        <el-option label="中" :value="2" />
        <el-option label="高" :value="3" />
      </el-select>
    </el-form-item>
    
    <el-form-item label="语言代码">
      <el-input
        v-model="editForm.Locale"
        placeholder="可选，如 zh-CN, en-US"
      />
    </el-form-item>
    
    <el-form-item label="最大显示版本">
      <el-input
        v-model="editForm.MaxPresentVersion"
        placeholder="可选，最大显示版本号"
      />
    </el-form-item>
    
    <el-form-item label="发行版名称">
      <el-input
        v-model="editForm.Distribution"
        placeholder="可选，用于区分不同发行版，默认为空表示所有发行版"
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


  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getAnnouncementListApi, createAnnouncementApi, updateAnnouncementApi, deleteAnnouncementApi, type Announcement, type CreateAnnouncementRequest } from '@/api/announcement'

const loading = ref(false)
const announcementList = ref<Announcement[]>([])
const dialogVisible = ref(false)
const currentAnnouncement = ref<Announcement | null>(null)

// 创建公告相关
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()

// 编辑公告相关
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref<FormInstance>()
const currentEditId = ref<number | null>(null)

const createForm = reactive<CreateAnnouncementRequest>({
  Title: '',
  Content: '',
  Link: '',
  Locale: '',
  MaxPresentVersion: '',
  Severity: 0,
  Distribution: '',
})

const editForm = reactive<CreateAnnouncementRequest>({
  Title: '',
  Content: '',
  Link: '',
  Locale: '',
  MaxPresentVersion: '',
  Severity: 0,
  Distribution: '',
})

const createRules: FormRules = {
  Title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度应为 1 到 200 个字符', trigger: 'blur' },
  ],
  Content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { min: 1, max: 2000, message: '内容长度应为 1 到 2000 个字符', trigger: 'blur' },
  ],
}

const getAnnouncementList = async () => {
  loading.value = true
  try {
    const data = await getAnnouncementListApi()
    announcementList.value = data || []
  } catch (error) {
    ElMessage.error('获取公告列表失败')
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  getAnnouncementList()
}

const handleView = (announcement: Announcement) => {
  currentAnnouncement.value = announcement
  dialogVisible.value = true
}

const getSeverityType = (severity: number) => {
  if (severity === 0) return 'info'
  if (severity === 1) return 'success'
  if (severity === 2) return 'warning'
  return 'danger'
}

const getSeverityText = (severity: number) => {
  if (severity === 0) return '信息'
  if (severity === 1) return '低'
  if (severity === 2) return '中'
  return '高'
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString()
}

const getSeverityClass = (severity: number) => {
  if (severity === 0) return 'announcement-box-info'
  if (severity === 1) return 'announcement-box-success'
  if (severity === 2) return 'announcement-box-warning'
  return 'announcement-box-danger'
}

const handleCreate = () => {
  // 重置表单
  Object.assign(createForm, {
    Title: '',
    Content: '',
    Link: '',
    Locale: '',
    MaxPresentVersion: '',
    Severity: 0,
    Distribution: '',
  })
  createDialogVisible.value = true
}

const handleCreateSubmit = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
    createLoading.value = true
    
    // 由于request.ts拦截器已经处理了code字段，这里直接返回data
    const result = await createAnnouncementApi(createForm)
    
    // result 直接就是 { Id: number }
    if (result && result.Id) {
      ElMessage.success('公告创建成功')
      createDialogVisible.value = false
      // 刷新列表
      await getAnnouncementList()
    } else {
      ElMessage.error('创建公告失败')
    }
  } catch (error) {
    ElMessage.error('创建公告失败')
  } finally {
    createLoading.value = false
  }
}

const handleEdit = (announcement: Announcement) => {
  currentEditId.value = announcement.Id
  // 填充表单数据
  Object.assign(editForm, {
    Title: announcement.Title,
    Content: announcement.Content,
    Link: announcement.Link || '',
    Locale: announcement.Locale || '',
    MaxPresentVersion: announcement.MaxPresentVersion || '',
    Severity: announcement.Severity,
    Distribution: announcement.Distribution || '',
  })
  editDialogVisible.value = true
}

const handleEditSubmit = async () => {
  if (!editFormRef.value || !currentEditId.value) return
  
  try {
    await editFormRef.value.validate()
    editLoading.value = true
    
    await updateAnnouncementApi(currentEditId.value, editForm)
    
    ElMessage.success('公告更新成功')
    editDialogVisible.value = false
    // 刷新列表
    await getAnnouncementList()
  } catch (error) {
    ElMessage.error('更新公告失败')
  } finally {
    editLoading.value = false
  }
}

const handleDelete = async (announcement: Announcement) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除公告"${announcement.Title}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await deleteAnnouncementApi(announcement.Id)
    ElMessage.success('公告删除成功')
    // 刷新列表
    await getAnnouncementList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除公告失败')
    }
  }
}

onMounted(() => {
  getAnnouncementList()
})
</script>

<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 公告正文容器 */
.announcement-box {
  padding: 16px;
  border-radius: 6px;
  background-color: var(--announcement-bg);
  color: var(--announcement-text);
  transition: background-color 0.2s, color 0.2s;
}

/* 不同严重等级的公告背景色和文字色 */
.announcement-box-info {
  background-color: var(--announcement-bg-info);
  color: var(--announcement-text-info);
}
.announcement-box-success {
  background-color: var(--announcement-bg-success);
  color: var(--announcement-text-success);
}
.announcement-box-warning {
  background-color: var(--announcement-bg-warning);
  color: var(--announcement-text-warning);
}
.announcement-box-danger {
  background-color: var(--announcement-bg-danger);
  color: var(--announcement-text-danger);
}

/* 标题 */
.announcement-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

/* 内容 */
.announcement-content {
  margin-bottom: 16px;
}

.announcement-content pre {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  font-family: inherit;
  line-height: 1.6;
}

/* 底部 */
.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

/* 时间 */
.announcement-time {
  color: var(--announcement-time);
}

/* ===== 明亮模式变量 ===== */
:root {
  --announcement-bg: #eaf3ff;
  --announcement-text: #303133;
  --announcement-time: #909399;

  --announcement-bg-info: #e1e1e1;
  --announcement-text-info: #000000;

  --announcement-bg-success: #f0f9eb;
  --announcement-text-success: #3a7a3a;

  --announcement-bg-warning: #fdf6ec;
  --announcement-text-warning: #b26a00;

  --announcement-bg-danger: #fef0f0;
  --announcement-text-danger: #a94442;
}

/* ===== 暗色模式（Element Plus） ===== */
html.dark {
  --announcement-bg: #1f1f1f;
  --announcement-text: #e5eaf3;
  --announcement-time: #a3a6ad;

  --announcement-bg-info: #575e64;
  --announcement-text-info: #ffffff;

  --announcement-bg-success: #1e2b22;
  --announcement-text-success: #a5d6a7;

  --announcement-bg-warning: #2c211b;
  --announcement-text-warning: #ffd54f;

  --announcement-bg-danger: #2a1a1a;
  --announcement-text-danger: #ef9a9a;
}

</style>