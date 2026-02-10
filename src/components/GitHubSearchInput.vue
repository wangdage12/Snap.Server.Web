<template>
  <div class="github-search-container gh-search-root" :class="{ 'dark-mode': isDarkMode }">
    <div class="search-input-wrapper">
      <!-- 语法高亮显示层 -->
      <div class="syntax-highlight-layer" v-if="searchValue" v-html="highlightedText"></div>
      <!-- 实际输入框 -->
      <input
        ref="searchInput"
        v-model="searchValue"
        type="text"
        class="form-control"
        :class="{ 'has-content': searchValue }"
        :placeholder="placeholder"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="showSuggestions = true"
        @blur="handleBlur"
      />
      <div class="search-icon">
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-search">
          <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"></path>
        </svg>
      </div>
    </div>

    <!-- 自动补全建议下拉菜单 -->
    <div v-if="showSuggestions && filteredSuggestions.length > 0" class="search-suggestions">
      <div
        v-for="(suggestion, index) in filteredSuggestions"
        :key="index"
        class="suggestion-item"
        :class="{ active: selectedIndex === index }"
        @mousedown.prevent="selectSuggestion(suggestion)"
      >
        <span class="suggestion-text">{{ suggestion.text }}</span>
        <span class="suggestion-desc">{{ suggestion.description }}</span>
      </div>
    </div>

    <!-- 搜索限定符帮助提示 -->
    <div v-if="showSuggestions && currentQualifier && currentQualifierHelp" class="qualifier-help">
      <div class="help-title">{{ currentQualifierHelp.title }}</div>
      <div class="help-desc">{{ currentQualifierHelp.description }}</div>
      <div class="help-examples">
        <div v-for="(example, idx) in currentQualifierHelp.examples" :key="idx" class="example-item">
          <code>{{ example }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

interface SearchQualifier {
  key: string
  title: string
  description: string
  examples: string[]
  autocomplete?: string[]
}

interface SearchSuggestion {
  text: string
  description: string
  type: 'qualifier' | 'value'
  qualifier?: string
}

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string, filters: Record<string, string>]
}>()

const searchValue = ref(props.modelValue)
const searchInput = ref<HTMLInputElement>()
const showSuggestions = ref(false)
const selectedIndex = ref(0)
const isDarkMode = ref(false)

// 检测暗色模式
const checkDarkMode = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark')
}

onMounted(() => {
  checkDarkMode()
  // 监听主题变化
  const observer = new MutationObserver(checkDarkMode)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
  onUnmounted(() => {
    observer.disconnect()
  })
})

// 搜索限定符定义
const qualifiers: SearchQualifier[] = [
  {
    key: 'role',
    title: '角色',
    description: '按用户角色筛选',
    examples: ['role:maintainer', 'role:developer', 'role:user']
  },
  {
    key: 'email',
    title: '邮箱',
    description: '按邮箱地址筛选',
    examples: ['email:test@example.com', 'email:outlook.com']
  },
  {
    key: 'username',
    title: '用户名',
    description: '按用户名筛选',
    examples: ['username:testuser', 'username:admin']
  },
  {
    key: 'id',
    title: '用户ID',
    description: '按用户ID筛选',
    examples: ['id:123456789', 'id:507f1f77bcf86cd799439011']
  }
  // 这个应该没必要，这个实际上就是筛选开发者权限，和role:developer重复了
  // {
  //   key: 'is',
  //   title: '状态',
  //   description: '按权限状态筛选',
  //   examples: ['is:licensed', 'is:not-licensed'],
  //   autocomplete: ['licensed', 'not-licensed']
  // }
]

// 检查是否为已知的限定符
function isQualifier(text: string): boolean {
  return qualifiers.some(q => q.key === text)
}

// 生成高亮的 HTML
const highlightedText = computed(() => {
  if (!searchValue.value) return ''

  let result = ''
  const text = searchValue.value

  // 按空格分割成段
  const segments = text.split(' ')

  segments.forEach((segment, index) => {
    if (segment === '') {
      // 空段表示有空格
      result += '<span class="hl-space"> </span>'
    } else {
      // 检查是否包含冒号
      const colonIndex = segment.indexOf(':')

      if (colonIndex !== -1) {
        // 有冒号，可能是限定符:值格式
        const qualifier = segment.slice(0, colonIndex)
        const value = segment.slice(colonIndex + 1)

        if (isQualifier(qualifier)) {
          // 已知限定符
          result += `<span class="hl-qualifier">${escapeHtml(qualifier)}</span><span class="hl-colon">:</span><span class="hl-value">${escapeHtml(value)}</span>`
        } else {
          // 未知限定符，作为普通文本处理
          result += `<span class="hl-unknown">${escapeHtml(qualifier)}</span><span class="hl-colon">:</span><span class="hl-value">${escapeHtml(value)}</span>`
        }
      } else {
        // 没有冒号，作为普通文本
        result += `<span class="hl-text">${escapeHtml(segment)}</span>`
      }
    }

    // 添加段之间的空格（除了最后一段）
    if (index < segments.length - 1) {
      result += '<span class="hl-space"> </span>'
    }
  })

  return result
})

// HTML 转义
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 当前输入的限定符（基于当前段）
const currentQualifier = computed(() => {
  const lastSpaceIndex = searchValue.value.lastIndexOf(' ')
  const afterLastSpace = searchValue.value.slice(lastSpaceIndex + 1)
  const match = afterLastSpace.match(/^(\w+):/)
  return match ? match[1] : null
})

// 当前限定符的帮助信息
const currentQualifierHelp = computed(() => {
  if (!currentQualifier.value) return null
  return qualifiers.find(q => q.key === currentQualifier.value) || null
})

// 建议列表
const suggestions = computed<SearchSuggestion[]>(() => {
  const result: SearchSuggestion[] = []

  // 检查是否正在输入新的限定符（最后一个空格后）
  const lastSpaceIndex = searchValue.value.lastIndexOf(' ')
  const afterLastSpace = searchValue.value.slice(lastSpaceIndex + 1)
  const hasColonInCurrentSegment = afterLastSpace.includes(':')

  // 如果当前段没有冒号，则显示限定符建议
  if (!hasColonInCurrentSegment) {
    const input = afterLastSpace.toLowerCase()
    // 如果输入为空，显示所有限定符；否则显示匹配的限定符
    const shouldShowAll = input === ''
    qualifiers.forEach(q => {
      if (shouldShowAll || q.key.startsWith(input)) {
        result.push({
          text: `${q.key}:`,
          description: q.title,
          type: 'qualifier'
        })
      }
    })
  }

  // 如果当前段有冒号，则显示该限定符的值建议
  if (hasColonInCurrentSegment && currentQualifier.value && currentQualifierHelp.value) {
    const colonIndex = afterLastSpace.indexOf(':')
    const value = afterLastSpace.slice(colonIndex + 1)
    const input = value.toLowerCase()
    const qualifier = currentQualifierHelp.value

    if (qualifier.autocomplete) {
      qualifier.autocomplete.forEach(val => {
        if (val.startsWith(input)) {
          result.push({
            text: `${qualifier.key}:${val}`,
            description: '',
            type: 'value',
            qualifier: qualifier.key
          })
        }
      })
    }

    // 为特定限定符添加常用值建议
    if (qualifier.key === 'role') {
      const roles = ['maintainer', 'developer', 'user']
      roles.forEach(role => {
        if (role.startsWith(input)) {
          result.push({
            text: `role:${role}`,
            description: role === 'maintainer' ? '运维人员' : role === 'developer' ? '开发者' : '普通用户',
            type: 'value',
            qualifier: 'role'
          })
        }
      })
    }
  }

  return result
})

// 过滤后的建议
const filteredSuggestions = computed(() => {
  return suggestions.value
})

// 处理输入
function handleInput() {
  emit('update:modelValue', searchValue.value)
  selectedIndex.value = 0
  // 如果有建议内容，自动显示建议框
  if (suggestions.value.length > 0) {
    showSuggestions.value = true
  }
}

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
  if (!showSuggestions.value || filteredSuggestions.value.length === 0) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredSuggestions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      const selectedSuggestion = filteredSuggestions.value[selectedIndex.value]
      if (selectedSuggestion) {
        selectSuggestion(selectedSuggestion)
      } else {
        handleSearch()
      }
      break
    case 'Escape':
      // ESC键关闭建议框
      showSuggestions.value = false
      break
  }
}

// 选择建议
function selectSuggestion(suggestion: SearchSuggestion) {
  if (suggestion.type === 'qualifier') {
    // 如果是限定符，替换当前输入的限定符部分
    const lastSpaceIndex = searchValue.value.lastIndexOf(' ')
    const beforeLastSpace = searchValue.value.slice(0, lastSpaceIndex + 1)
    searchValue.value = beforeLastSpace + suggestion.text
    // 选择限定符后不关闭建议框，让用户继续输入值
  } else {
    // 如果是值，替换整个限定符+值，并添加空格以便输入下一个限定符
    const lastSpaceIndex = searchValue.value.lastIndexOf(' ')
    const beforeLastSpace = searchValue.value.slice(0, lastSpaceIndex + 1)
    searchValue.value = beforeLastSpace + suggestion.text + ' '
    // 选择值后重新打开建议框，方便继续输入下一个限定符
    // 使用setTimeout确保DOM更新后再打开
    setTimeout(() => {
      showSuggestions.value = true
    }, 0)
  }

  emit('update:modelValue', searchValue.value)

  nextTick(() => {
    searchInput.value?.focus()
  })
}

// 处理失去焦点
function handleBlur() {
  // 延迟隐藏，以便能够点击建议项
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// 解析搜索查询
function parseSearchQuery(query: string): { keyword: string; filters: Record<string, string> } {
  const filters: Record<string, string> = {}
  const parts = query.split(/\s+/)
  const keywords: string[] = []

  parts.forEach(part => {
    if (part.includes(':')) {
      const [key, value] = part.split(':')
      if (key && value) {
        filters[key] = value
      }
    } else if (part.trim()) {
      keywords.push(part)
    }
  })

  return {
    keyword: keywords.join(' '),
    filters
  }
}

// 执行搜索
function handleSearch() {
  const { filters } = parseSearchQuery(searchValue.value)
  emit('search', searchValue.value, filters)
  showSuggestions.value = false
}

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  searchValue.value = newValue
})

// 暴露搜索方法
defineExpose({
  handleSearch
})
</script>

<style>
/* 定义全局CSS变量 - 亮色模式 */
.gh-search-root {
  --color-fg-default: #24292f;
  --color-fg-muted: #57606a;
  --color-accent-fg: #0969da;
  --color-accent-muted: rgba(9, 105, 218, 0.1);
  --color-accent-subtle: #ddf4ff;
  --color-bg-subtle: #f6f8fa;
  --color-bg-canvas: #ffffff;
  --color-canvas-overlay: #ffffff;
  --color-border-default: #d0d7de;
  --color-shadow-medium: 0 3px 6px rgba(140, 149, 159, 0.15);
  /* 高亮颜色 - 亮色模式 */
  --hl-qualifier: #cf222e;
  --hl-colon: #cf222e;
  --hl-value: #0550ae;
  --hl-text: #24292f;
  --hl-unknown: #6e7781;
}

/* 定义全局CSS变量 - 暗色模式 */
.gh-search-root.dark-mode {
  --color-fg-default: #c9d1d9;
  --color-fg-muted: #8b949e;
  --color-accent-fg: #58a6ff;
  --color-accent-muted: rgba(88, 166, 255, 0.15);
  --color-accent-subtle: rgba(88, 166, 255, 0.15);
  --color-bg-subtle: #161b22;
  --color-bg-canvas: #0d1117;
  --color-canvas-overlay: #161b22;
  --color-border-default: #30363d;
  --color-shadow-medium: 0 3px 6px rgba(0, 0, 0, 0.5);
  /* 高亮颜色 - 暗色模式 */
  --hl-qualifier: #ff7b72;
  --hl-colon: #ff7b72;
  --hl-value: #79c0ff;
  --hl-text: #c9d1d9;
  --hl-unknown: #8b949e;
}

/* 语法高亮样式 - 非scoped，用于v-html生成的HTML */
.gh-search-root .hl-qualifier {
  color: var(--hl-qualifier);
  font-weight: 500;
}

.gh-search-root .hl-colon {
  color: var(--hl-colon);
  font-weight: 500;
}

.gh-search-root .hl-value {
  color: var(--hl-value);
}

.gh-search-root .hl-text {
  color: var(--hl-text);
}

.gh-search-root .hl-unknown {
  color: var(--hl-unknown);
}

.gh-search-root .hl-space {
  color: var(--color-fg-muted);
}
</style>

<style scoped>
.github-search-container {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  background-color: var(--color-bg-subtle);
  border-radius: 6px;
  box-sizing: border-box;
}

/* 语法高亮显示层 */
.syntax-highlight-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px 36px 8px 12px;
  font-size: 14px;
  line-height: 20px;
  font-family: inherit;
  font-weight: normal;
  white-space: pre;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
  color: var(--color-fg-default);
  background: transparent;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.form-control {
  width: 100%;
  padding: 8px 36px 8px 12px;
  font-size: 14px;
  line-height: 20px;
  font-family: inherit;
  font-weight: normal;
  color: var(--color-fg-default);
  caret-color: var(--color-fg-default);
  background: transparent;
  border: 1px solid var(--color-border-default);
  border-radius: 6px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.form-control.has-content {
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.form-control:focus {
  outline: none;
}

.form-control:focus + .search-icon {
  color: var(--color-accent-fg);
}

.search-input-wrapper:focus-within {
  border-color: var(--color-accent-fg);
  box-shadow: 0 0 0 3px var(--color-accent-muted);
  background-color: var(--color-bg-canvas);
}

.form-control::placeholder {
  color: var(--color-fg-muted);
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-fg-muted);
  pointer-events: none;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  background-color: var(--color-canvas-overlay);
  border: 1px solid var(--color-border-default);
  border-radius: 6px;
  box-shadow: var(--color-shadow-medium);
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.15s ease-in-out;
}

.suggestion-item:hover,
.suggestion-item.active {
  background-color: var(--color-accent-subtle);
}

.suggestion-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-accent-fg);
}

.suggestion-desc {
  font-size: 12px;
  color: var(--color-fg-muted);
}

.qualifier-help {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 999;
  margin-top: 4px;
  padding: 12px;
  background-color: var(--color-canvas-overlay);
  border: 1px solid var(--color-border-default);
  border-radius: 6px;
  box-shadow: var(--color-shadow-medium);
}

.help-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-fg-default);
  margin-bottom: 4px;
}

.help-desc {
  font-size: 12px;
  color: var(--color-fg-muted);
  margin-bottom: 8px;
}

.help-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.example-item {
  code {
    display: inline-block;
    padding: 2px 6px;
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
    color: var(--color-accent-fg);
    background-color: var(--color-accent-subtle);
    border-radius: 3px;
  }
}
</style>