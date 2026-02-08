<template>
  <div class="download-page">
    <Header
      :app-icon="appIcon"
      :app-name="appName"
      :actions="headerActions"
    />

    <div class="download-content">
      <div class="download-section">
        <h1 class="section-title">
          <el-icon><Download /></el-icon>
          下载中心
        </h1>
        <p class="section-description">选择适合您的安装包，立即开始使用 Snap Hutao<br>系统要求：新版本Windows10及Windows11</p>
        

        <!-- 最新版本下载区域 -->
        <div v-if="latestVersion" class="latest-version-card">
          <div class="latest-header">
            <el-tag type="success" size="large" effect="dark">最新版本</el-tag>
            <h2 class="version-title">{{ latestVersion.version }}</h2>
          </div>

          <div v-if="latestVersion.features" class="features-section">
            <h3 class="features-title">更新内容</h3>
            <p class="features-text">{{ latestVersion.features }}</p>
          </div>

          <div class="download-buttons">
            <el-tooltip
              v-if="latestVersion.packages.msi"
              effect="dark"
              placement="top"
              :content="getTooltipText(latestVersion, 'msi')"
            >
              <el-button
                type="primary"
                size="large"
                @click="downloadFile(latestVersion, 'msi')"
                :loading="downloading"
              >
                <el-icon><Document /></el-icon>
                <span>下载 MSI 安装包</span>
              </el-button>
            </el-tooltip>
            <el-tooltip
              v-if="latestVersion.packages.msix"
              effect="dark"
              placement="top"
              :content="getTooltipText(latestVersion, 'msix')"
            >
              <el-button
                type="success"
                size="large"
                @click="downloadFile(latestVersion, 'msix')"
                :loading="downloading"
              >
                <el-icon><Box /></el-icon>
                <span>下载 MSIX 安装包</span>
              </el-button>
            </el-tooltip>
          </div>

          <div class="version-info">
            <span class="info-item">
              <el-icon><Clock /></el-icon>
              发布时间：{{ formatDate(latestVersion.created_at) }}
            </span>
          </div>
        </div>

        <el-divider>历史版本</el-divider>

        <!-- 历史版本列表 -->
        <div v-loading="loading" class="history-list">
          <div v-if="historyVersions.length === 0 && !loading" class="empty-state">
            <el-icon><FolderOpened /></el-icon>
            <p>暂无历史版本</p>
          </div>

          <div v-else class="version-table">
            <div
              v-for="(item, index) in historyVersions"
              :key="index"
              class="version-item"
            >
              <div class="version-main">
                <div class="version-number">{{ item.version }}</div>
                <div class="version-meta">
                  <span class="meta-item">
                    <el-icon><Clock /></el-icon>
                    {{ formatDate(item.created_at) }}
                  </span>
                </div>
                <div v-if="item.features" class="version-features">
                  {{ item.features }}
                </div>
              </div>
              <div class="version-actions">
                <el-tooltip
                  v-if="item.packages.msi"
                  effect="dark"
                  placement="top"
                  :content="getTooltipText(item, 'msi')"
                >
                  <el-button
                    type="primary"
                    size="small"
                    @click="downloadFile(item, 'msi')"
                  >
                    MSI
                  </el-button>
                </el-tooltip>
                <el-tooltip
                  v-if="item.packages.msix"
                  effect="dark"
                  placement="top"
                  :content="getTooltipText(item, 'msix')"
                >
                  <el-button
                    type="success"
                    size="small"
                    @click="downloadFile(item, 'msix')"
                  >
                    MSIX
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Download,
  Document,
  Box,
  Clock,
  FolderOpened,
} from '@element-plus/icons-vue'
import Header from '@/components/Header.vue'
import { getDownloadResourcesApi } from '@/api/download'

const router = useRouter()

// 配置项
const appIcon = ref('/HT_logo.png')
const appName = ref('Snap Hutao')

// 页头右侧按钮配置
const headerActions = ref([
  {
    id: 'home',
    label: '返回首页',
    icon: undefined,
    component: 'el-button',
    props: {
      type: 'default',
      link: true
    },
    onClick: () => {
      router.push('/')
    }
  }
])

// 版本信息接口（合并不同包类型）
interface VersionInfo {
  version: string
  created_at: string
  created_by: string
  features: string | null
  file_hash: string | null
  file_size: string | null
  is_active: boolean | null
  packages: {
    msi: string | null
    msix: string | null
    msi_size: string | null
    msix_size: string | null
  }
}

// 包类型描述
const packageDescriptions = {
  msi: '传统安装包，方便部署，但是可能有BUG。',
  msix: '现代化安装包，稳定性更好，原生体验，推荐使用，安装稍繁琐，解压以后右键Add-AppDevPackage.ps1，选择“以PowerShell运行”进行安装。',
}

// 数据状态
const latestVersion = ref<VersionInfo | null>(null)
const historyVersions = ref<VersionInfo[]>([])
const loading = ref(false)
const downloading = ref(false)

/**
 * 格式化日期
 */
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 下载文件
 */
function downloadFile(item: VersionInfo, packageType: 'msi' | 'msix') {
  const downloadUrl = item.packages[packageType]
  if (!downloadUrl) {
    ElMessage.warning(`${item.version} 版本暂无 ${packageType.toUpperCase()} 安装包`)
    return
  }

  downloading.value = true

  const a = document.createElement('a')
  a.href = downloadUrl
  // 如果是msix的话，文件是用zip格式压缩的
  if (packageType === 'msix') {
    a.download = `Snap.Hutao.${item.version}.zip`
  } else {
    a.download = `Snap.Hutao.${item.version}.msi`
  }
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  ElMessage.success(`开始下载 ${item.version} 版本的 ${packageType.toUpperCase()} 安装包`)

  setTimeout(() => {
    downloading.value = false
  }, 1000)
}

/**
 * 获取下载按钮的提示内容
 */
function getTooltipText(item: VersionInfo, packageType: 'msi' | 'msix') {
  const size = item.packages[`${packageType}_size` as keyof typeof item.packages] as string | null
  const desc = packageDescriptions[packageType]

  if (size) {
    return `${desc}\n文件大小：${size}`
  }
  return desc
}

/**
 * 加载所有版本
 */
async function loadAllVersions() {
  try {
    loading.value = true
    const data = await getDownloadResourcesApi()
    if (!data || data.length === 0) {
      return
    }

    // 按版本号分组
    const versionMap = new Map<string, VersionInfo>()

    data.forEach((item) => {
      if (!versionMap.has(item.version)) {
        // 首次遇到该版本，创建新记录
        versionMap.set(item.version, {
          version: item.version,
          created_at: item.created_at,
          created_by: item.created_by,
          features: item.features,
          file_hash: item.file_hash,
          file_size: item.file_size,
          is_active: item.is_active,
          packages: {
            msi: null,
            msix: null,
            msi_size: null,
            msix_size: null,
          },
        })
      }

      // 添加包类型的下载链接和大小
      const versionInfo = versionMap.get(item.version)
      if (versionInfo) {
        if (item.package_type === 'msi') {
          versionInfo.packages.msi = item.download_url
          versionInfo.packages.msi_size = item.file_size
        } else if (item.package_type === 'msix') {
          versionInfo.packages.msix = item.download_url
          versionInfo.packages.msix_size = item.file_size
        }
      }
    })

    // 转换为数组并按创建时间倒序排序
    const versions = Array.from(versionMap.values()).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    if (versions.length > 0) {
      latestVersion.value = versions[0] ?? null
      historyVersions.value = versions.slice(1)
    }
  } catch (error) {
    console.error('加载版本列表失败:', error)
    ElMessage.error('加载版本列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAllVersions()
})
</script>

<style scoped>
.download-page {
  min-height: 100vh;
  background: var(--main-bg);
  display: flex;
  flex-direction: column;
}

.download-content {
  flex: 1;
  padding: 40px 20px;
}

.download-section {
  max-width: 1000px;
  margin: 0 auto;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-color);
  background: linear-gradient(135deg, var(--aside-active), #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-description {
  font-size: 16px;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 10px;
}

/* 最新版本卡片 */
.latest-version-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
}

.latest-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.version-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.features-section {
  margin-bottom: 24px;
}

.features-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 12px;
}

.features-text {
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.6;
  white-space: pre-wrap;
  background: var(--main-bg);
  padding: 16px;
  border-radius: 8px;
}

.download-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.download-buttons .el-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  font-size: 16px;
  border-radius: 8px;
  min-width: 200px;
  justify-content: center;
}

.version-info {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.7;
}

/* 历史版本列表 */
.history-list {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-color);
  opacity: 0.5;
}

.empty-state .el-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.version-table {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.version-item {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.version-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.version-main {
  flex: 1;
}

.version-number {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}

.version-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.7;
}

.version-features {
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.6;
  white-space: pre-wrap;
  background: var(--main-bg);
  padding: 12px;
  border-radius: 6px;
  max-height: 80px;
  overflow-y: auto;
}

.version-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .section-title {
    font-size: 28px;
  }

  .latest-version-card {
    padding: 24px;
  }

  .download-buttons {
    flex-direction: column;
  }

  .download-buttons .el-button {
    width: 100%;
  }

  .version-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .version-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>