<template>
  <div class="gacha-log-page">
    <!-- 头部：UID选择和视图切换 -->
    <el-card class="header-card">
      <div class="header-content">
        <div class="left-section">
          <el-select
            v-model="selectedUid"
            placeholder="选择UID"
            class="uid-select"
            @change="handleUidChange"
          >
            <el-option
              v-for="entry in entries"
              :key="entry.Uid"
              :label="`${entry.Uid} (${entry.ItemCount}条记录)`"
              :value="entry.Uid"
            />
          </el-select>
          <el-tag v-if="currentEntry?.Excluded" type="warning">已排除全球统计</el-tag>
        </div>
        <div class="right-section">
          <el-radio-group v-model="viewMode" size="default">
            <el-radio-button value="overview">总览统计</el-radio-button>
            <el-radio-button value="list">详细列表</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </el-card>

    <el-card v-if="loading" class="loading-card">
      <div class="loading-content">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <p>正在加载祈愿记录...</p>
      </div>
    </el-card>

    <el-card v-else-if="!selectedUid && entries.length === 0" class="empty-card">
      <el-empty description="暂无祈愿记录" />
    </el-card>

    <!-- 总览统计视图 -->
    <template v-else-if="viewMode === 'overview' && gachaData.length > 0">
      <div class="overview-grid">
        <el-card
          v-for="type in gachaTypes"
          :key="type.queryType"
          class="stat-card"
          :class="{ active: selectedType === type.queryType }"
          @click="selectedType = type.queryType"
        >
          <div class="stat-header">
            <span class="type-name">{{ type.name }}</span>
            <el-tag :type="type.color || undefined" size="small">{{ type.count }}抽</el-tag>
          </div>
          <div class="stat-body">
            <div class="stat-row">
              <span class="label">5星</span>
              <span class="value star5">{{ type.star5Count }}</span>
            </div>
            <div class="stat-row">
              <span class="label">4星</span>
              <span class="value star4">{{ type.star4Count }}</span>
            </div>
            <div class="stat-row">
              <span class="label">平均出货</span>
              <span class="value">{{ type.avgPity?.toFixed(1) || '-' }}抽</span>
            </div>
            <div class="stat-row">
              <span class="label">已垫</span>
              <span class="value highlight">{{ type.currentPity }}抽</span>
            </div>
          </div>
          <!-- 5星物品展示 -->
          <div v-if="type.star5Items.length > 0" class="star5-preview">
            <div
              v-for="item in type.star5Items.slice(0, 5)"
              :key="item.Id"
              class="preview-item"
            >
              <img
                :src="getItemIcon(item.ItemId)"
                :alt="getItemName(item.ItemId)"
                :title="getItemName(item.ItemId)"
                class="item-icon star5"
              />
            </div>
            <span v-if="type.star5Items.length > 5" class="more-count">
              +{{ type.star5Items.length - 5 }}
            </span>
          </div>
        </el-card>
      </div>

      <!-- 选中类型的详细信息 -->
      <el-card v-if="selectedTypeStat" class="detail-card">
        <template #header>
          <div class="card-header">
            <span>{{ selectedTypeStat.name }} - 详细记录 (共{{ selectedTypeStat.star5Count }}个5星)</span>
          </div>
        </template>
        <div class="detail-content">
          <el-table :data="selectedTypeStat.star5ItemsWithPity" stripe style="width: 100%">
            <el-table-column prop="ItemId" label="物品" min-width="200">
              <template #default="{ row }">
                <div class="item-cell">
                  <img
                    :src="getItemIcon(row.ItemId)"
                    :alt="getItemName(row.ItemId)"
                    class="item-icon-small star5"
                  />
                  <span class="item-name star5">{{ getItemName(row.ItemId) }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="Time" label="获取时间" min-width="180">
              <template #default="{ row }">
                {{ formatTime(row.Time) }}
              </template>
            </el-table-column>
            <el-table-column label="5星出货抽数" min-width="120">
              <template #default="{ row }">
                <span class="pity-tag" :style="getPityStyle(row.pity)">{{ row.pity }}抽</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </template>

    <!-- 列表视图 -->
    <el-card v-else-if="viewMode === 'list' && gachaData.length > 0" class="list-card">
      <template #header>
        <div class="card-header">
          <span>祈愿记录列表 (共{{ filteredGachaData.length }}条)</span>
          <el-select v-model="listFilterType" placeholder="筛选祈愿类型" clearable size="small" style="width: 150px">
            <el-option label="全部" :value="0" />
            <el-option v-for="type in gachaTypes" :key="type.queryType" :label="type.name" :value="type.queryType" />
          </el-select>
        </div>
      </template>
      <el-scrollbar ref="scrollbarRef" height="550px" @end-reached="handleScrollEnd">
        <el-table 
          :data="displayedListData" 
          stripe
          style="width: 100%"
        >
          <el-table-column prop="ItemId" label="物品" width="220">
            <template #default="{ row }">
              <div class="item-cell">
                <img
                  :src="getItemIcon(row.ItemId)"
                  :alt="getItemName(row.ItemId)"
                  class="item-icon-small"
                  :class="getQualityClass(row.ItemId)"
                />
                <span class="item-name" :class="getQualityClass(row.ItemId)">
                  {{ getItemName(row.ItemId) }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="GachaType" label="祈愿类型" width="140">
            <template #default="{ row }">
              <el-tag size="small">{{ getGachaTypeName(row.GachaType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="Time" label="获取时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.Time) }}
            </template>
          </el-table-column>
          <el-table-column prop="Id" label="记录ID" min-width="180">
            <template #default="{ row }">
              <span class="record-id">{{ row.Id }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="listLoading" class="list-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else-if="noMoreListData && filteredGachaData.length > 0" class="list-end">
          已加载全部记录
        </div>
      </el-scrollbar>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ScrollbarDirection } from 'element-plus'
import {
  getGachaLogEntriesApi,
  getGachaLogDataApi,
  type GachaLogEntry,
  type GachaLogItem,
  type EndIds,
  getGachaTypeName,
  gachaTypeToQueryType,
  GACHA_TYPE_NAMES,
} from '@/api/gachaLog'

// 元数据类型
interface GachaItemMeta {
  id: number
  name: string
  icon: string
  quality: number
  type: 'avatar' | 'weapon' | 'material'
}

// 祈愿类型统计
interface GachaTypeStat {
  queryType: number
  name: string
  count: number
  star5Count: number
  star4Count: number
  star3Count: number
  star5Items: GachaLogItem[]
  star4Items: GachaLogItem[]
  avgPity: number
  currentPity: number
  color: '' | 'success' | 'warning' | 'info' | 'danger'
}

// 状态
const loading = ref(false)
const entries = ref<GachaLogEntry[]>([])
const selectedUid = ref<string>('')
const gachaData = ref<GachaLogItem[]>([])
const viewMode = ref<'overview' | 'list'>('overview')
const selectedType = ref<number>(301)
const listFilterType = ref<number>(0)
const metadata = ref<Record<string, GachaItemMeta>>({})

// 列表无限滚动相关
const LIST_PAGE_SIZE = 50 // 每次加载的条数
const listDisplayCount = ref(LIST_PAGE_SIZE)
const listLoading = ref(false)
const scrollbarRef = ref()
const savedScrollTop = ref(0) // 保存加载前的滚动位置

// 当前选中的条目
const currentEntry = computed(() => {
  return entries.value.find(e => e.Uid === selectedUid.value)
})

// 获取元数据
async function loadMetadata() {
  try {
    const response = await fetch('/metadata/gacha_items.json') // 这个是精简之后的元数据
    metadata.value = await response.json()
  } catch (error) {
    console.error('加载元数据失败:', error)
  }
}

// 获取物品名称
function getItemName(itemId: number): string {
  const item = metadata.value[String(itemId)]
  return item?.name || `未知物品(${itemId})`
}

// 静态资源基础URL
const STATIC_BASE_URL = 'https://htserver.wdg.cloudns.ch/static/raw'

// 获取物品图标
function getItemIcon(itemId: number): string {
  const item = metadata.value[String(itemId)]
  if (!item || !item.icon) return '/HT_logo.png' // 没图标，占位
  
  const iconName = item.icon
  // 角色: AvatarIcon/{Icon}.png
  // 武器: EquipIcon/{Icon}.png
  const category = item.type === 'avatar' ? 'AvatarIcon' : 'EquipIcon'
  return `${STATIC_BASE_URL}/${category}/${iconName}.png`
}

// 获取品质样式类
function getQualityClass(itemId: number): string {
  const item = metadata.value[String(itemId)]
  const quality = item?.quality || 3
  if (quality >= 5) return 'star5'
  if (quality === 4) return 'star4'
  return 'star3'
}

// 根据抽数计算渐变颜色，5星列表的标签颜色
function getPityStyle(pity: number): Record<string, string> {
  let bgColor = ''
  let textColor = '#fff'
  
  if (pity <= 10) {
    // 金色：非常欧
    bgColor = '#ffd700'
    textColor = '#333'
  } else if (pity <= 30) {
    // 绿色：运气很好
    bgColor = '#22c55e'
  } else if (pity <= 60) {
    // 蓝色：正常
    bgColor = '#3b82f6'
  } else if (pity <= 75) {
    // 橙色：快到保底
    bgColor = '#f59e0b'
  } else {
    // 红色：保底区
    bgColor = '#ef4444'
  }
  
  return {
    backgroundColor: bgColor,
    color: textColor,
  }
}

// 格式化时间
function formatTime(time: string): string {
  if (!time) return '-'
  try {
    const date = new Date(time)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return time
  }
}

// 5星物品的出货抽数记录
interface Star5ItemWithPity extends GachaLogItem {
  pity: number // 出货抽数
}

// 祈愿类型统计（扩展）
interface GachaTypeStatExt extends GachaTypeStat {
  star5ItemsWithPity: Star5ItemWithPity[]
}

// 祈愿类型统计计算
const gachaTypes = computed<GachaTypeStatExt[]>(() => {
  const typeStats: Record<number, GachaTypeStatExt> = {}
  
  // 初始化所有类型
  Object.keys(GACHA_TYPE_NAMES).forEach(type => {
    const queryType = Number(type)
    typeStats[queryType] = {
      queryType,
      name: GACHA_TYPE_NAMES[queryType] || '未知祈愿',
      count: 0,
      star5Count: 0,
      star4Count: 0,
      star3Count: 0,
      star5Items: [],
      star4Items: [],
      star5ItemsWithPity: [],
      avgPity: 0,
      currentPity: 0,
      color: queryType === 100 ? 'info' : queryType === 200 ? '' : queryType === 301 ? 'danger' : queryType === 302 ? 'warning' : 'success',
    }
  })
  
  // 按时间正序排序（从旧到新）
  const sortedData = [...gachaData.value].sort((a, b) => new Date(a.Time).getTime() - new Date(b.Time).getTime())
  
  // 每种类型的当前抽数计数器
  const pityCounters: Record<number, number> = {}
  Object.keys(GACHA_TYPE_NAMES).forEach(type => {
    pityCounters[Number(type)] = 0
  })
  
  // 统计数据并计算抽数
  sortedData.forEach(item => {
    const queryType = gachaTypeToQueryType(item.GachaType)
    const stat = typeStats[queryType]
    if (!stat) return
    
    stat.count++

    if (pityCounters[queryType] === undefined) {
      pityCounters[queryType] = 0
    }
    pityCounters[queryType]++
    
    const itemMeta = metadata.value[String(item.ItemId)]
    const quality = itemMeta?.quality || 3
    
    if (quality >= 5) {
      stat.star5Count++
      // 记录当前抽数
      const itemWithPity: Star5ItemWithPity = {
        ...item,
        pity: pityCounters[queryType] ?? 0
      }
      stat.star5ItemsWithPity.push(itemWithPity)
      stat.star5Items.push(item)
      // 重置计数器
      pityCounters[queryType] = 0
    } else if (quality === 4) {
      stat.star4Count++
      stat.star4Items.push(item)
    } else {
      stat.star3Count++
    }
  })
  
  // 计算平均出货抽数和当前垫抽数
  Object.values(typeStats).forEach(stat => {
    if (!stat) return
    
    // 当前垫抽数就是计数器的值
    const qType = stat.queryType
    stat.currentPity = (qType && pityCounters[qType]) || 0
    
    if (stat.star5ItemsWithPity.length > 0) {
      // 平均出货抽数
      const totalPity = stat.star5ItemsWithPity.reduce((sum, item) => sum + item.pity, 0)
      stat.avgPity = totalPity / stat.star5ItemsWithPity.length
      
      // 按时间倒序排列5星物品
      stat.star5ItemsWithPity.sort((a, b) => new Date(b.Time).getTime() - new Date(a.Time).getTime())
      stat.star5Items = stat.star5ItemsWithPity.map(item => {
        const { pity: _pity, ...rest } = item
        return rest
      })
    }
  })
  
  // 返回有数据的类型，按顺序排列
  return [301, 302, 200, 500, 100]
    .map(type => typeStats[type])
    .filter((stat): stat is GachaTypeStatExt => stat !== undefined && stat.count > 0)
})

// 当前选中的类型统计
const selectedTypeStat = computed<GachaTypeStatExt | undefined>(() => {
  return gachaTypes.value.find(t => t.queryType === selectedType.value)
})

// 列表过滤后的数据
const filteredGachaData = computed(() => {
  let data = [...gachaData.value]
  
  if (listFilterType.value > 0) {
    data = data.filter(item => gachaTypeToQueryType(item.GachaType) === listFilterType.value)
  }
  
  // 按时间倒序排列
  data.sort((a, b) => new Date(b.Time).getTime() - new Date(a.Time).getTime())
  
  return data
})

// 是否还有更多数据
const noMoreListData = computed(() => {
  return listDisplayCount.value >= filteredGachaData.value.length
})

// 当前显示的列表数据
const displayedListData = computed(() => {
  return filteredGachaData.value.slice(0, listDisplayCount.value)
})

// 加载更多列表数据，为了防止滚动条持续在底部导致重复加载，需要恢复滚动条位置
function loadMoreListData() {
  if (listLoading.value || noMoreListData.value) return
  
  // 记录当前滚动位置
  if (scrollbarRef.value?.wrapRef) {
    savedScrollTop.value = scrollbarRef.value.wrapRef.scrollTop
  }
  
  listLoading.value = true
  setTimeout(() => {
    listDisplayCount.value += LIST_PAGE_SIZE
    
    // 等待DOM更新后恢复滚动位置
    nextTick(() => {
      if (scrollbarRef.value?.wrapRef) {
        scrollbarRef.value.wrapRef.scrollTop = savedScrollTop.value
      }
      listLoading.value = false
    })
  }, 50)
}

// 滚动到底部
function handleScrollEnd(direction: ScrollbarDirection) {
  if (direction === 'bottom' && !listLoading.value && !noMoreListData.value) {
    loadMoreListData()
  }
}

// 重置列表显示数量
function resetListDisplay() {
  listDisplayCount.value = LIST_PAGE_SIZE
}

// 监听筛选条件变化，重置列表显示
watch(listFilterType, () => {
  resetListDisplay()
})

// 加载祈愿记录列表
async function loadEntries() {
  loading.value = true
  try {
    entries.value = await getGachaLogEntriesApi()
    const firstEntry = entries.value[0]
    if (firstEntry) {
      selectedUid.value = firstEntry.Uid
      await loadGachaData(selectedUid.value)
    }
  } catch (error) {
    ElMessage.error('获取祈愿记录列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 加载祈愿数据
async function loadGachaData(uid: string) {
  loading.value = true
  gachaData.value = []
  try {
    // 获取所有记录，EndIds全部设为0
    const endIds: EndIds = {
      '100': 0,
      '200': 0,
      '301': 0,
      '302': 0,
      '500': 0,
    }
    gachaData.value = await getGachaLogDataApi(uid, endIds)
    
    // 设置默认选中的类型
    const firstType = gachaTypes.value[0]
    if (firstType) {
      selectedType.value = firstType.queryType
    }
  } catch (error) {
    ElMessage.error('获取祈愿数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// UID切换
function handleUidChange(uid: string) {
  if (uid) {
    loadGachaData(uid)
  }
}

// 初始化
onMounted(async () => {
  await loadMetadata()
  await loadEntries()
})
</script>

<style scoped>
.gacha-log-page {
  padding: 0;
}

.header-card {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.uid-select {
  width: 280px;
}

.loading-card,
.empty-card {
  margin-bottom: 20px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-color);
}

.loading-content .el-icon {
  margin-bottom: 16px;
  color: var(--aside-active);
}

/* 总览网格 */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card.active {
  border-color: var(--aside-active);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.type-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-row .label {
  color: var(--text-color);
  opacity: 0.7;
  font-size: 14px;
}

.stat-row .value {
  font-weight: 600;
  font-size: 14px;
}

.stat-row .value.star5 {
  color: #f59e0b;
}

.stat-row .value.star4 {
  color: #a855f7;
}

.stat-row .value.highlight {
  color: var(--aside-active);
}

/* 5星预览 */
.star5-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.preview-item {
  display: flex;
  align-items: center;
}

.item-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background: rgba(0, 0, 0, 0.1);
}

.item-icon.star5 {
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
}

.more-count {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.7;
  margin-left: 4px;
}

/* 详细卡片 */
.detail-card {
  margin-bottom: 20px;
  width: 100%;
}

.detail-card :deep(.el-card__body) {
  padding: 0;
}

.detail-content {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-icon-small {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
  background: rgba(0, 0, 0, 0.1);
}

.item-icon-small.star5 {
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.6);
}

.item-icon-small.star4 {
  box-shadow: 0 0 4px rgba(168, 85, 247, 0.5);
}

.item-name {
  font-weight: 500;
}

.item-name.star5 {
  color: #f59e0b;
}

.item-name.star4 {
  color: #a855f7;
}

.record-id {
  font-family: monospace;
  font-size: 12px;
  opacity: 0.6;
}

/* 列表卡片 */
.list-card {
  margin-bottom: 20px;
}

/* 抽数标签渐变色 */
.pity-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}

/* 列表加载状态 */
.list-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: var(--text-color);
  opacity: 0.7;
}

.list-loading .el-icon {
  font-size: 18px;
}

/* 列表结束提示 */
.list-end {
  text-align: center;
  padding: 16px;
  color: var(--text-color);
  opacity: 0.5;
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .left-section,
  .right-section {
    justify-content: center;
  }
  
  .uid-select {
    width: 100%;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
