import { defineStore } from 'pinia'

// ============================================================
// 1. 安全加载工具
// ============================================================
function loadAllTools() {
  try {
    const manifestModules = import.meta.glob('/tools/*/manifest.json', { eager: true })
    const tools = []

    for (const path in manifestModules) {
      try {
        const manifest = manifestModules[path]?.default
        if (manifest?.id) {
          const dirMatch = path.match(/\/tools\/([^\/]+)\/manifest\.json/)
          const dirName = dirMatch ? dirMatch[1] : manifest.id
          tools.push({
            ...manifest,
            _dir: dirName,
            // 确保 categories 字段存在，没有则为空数组
            categories: manifest.categories || []
          })
        }
      } catch (e) {
        console.warn('⚠️ 跳过无法解析的工具:', path, e.message)
      }
    }
    return tools
  } catch (e) {
    console.warn('⚠️ 工具目录扫描失败:', e.message)
    return []
  }
}

// ============================================================
// 2. 语义搜索（模拟 LLM 匹配）
// ============================================================
function semanticSearch(query, tools) {
  if (!query || query.trim() === '') return tools

  const q = query.toLowerCase().trim()

  // 关键词映射表：用户输入词 → 匹配的工具ID列表
  const keywordMap = {
    '阅读': ['contract-review', 'archive-manager'],
    '文件': ['archive-manager', 'contract-review', 'expense'],
    '合同': ['contract-review'],
    '审查': ['contract-review'],
    '对比': ['contract-review'],
    '行业': ['industry-news'],
    '动态': ['industry-news'],
    '报告': ['industry-news', 'bid-maker'],
    '标书': ['bid-maker'],
    '投标': ['bid-maker'],
    '招标': ['bid-maker'],
    '档案': ['archive-manager'],
    '分类': ['archive-manager'],
    '查找': ['archive-manager'],
    '搜索': ['archive-manager'],
    '查重': ['archive-manager'],
    '报销': ['expense'],
    '发票': ['expense'],
    '会计': ['expense'],
    '财务': ['expense', 'contract-review', 'archive-manager'],
    '法务': ['contract-review'],
    '人事': ['expense', 'archive-manager'],
    '行政': ['expense', 'archive-manager'],
    '项目': ['bid-maker', 'contract-review', 'archive-manager'],
    '销售': ['bid-maker', 'industry-news'],
    '市场': ['industry-news'],
    '技术': ['bid-maker', 'archive-manager', 'industry-news']
  }

  // 第一步：关键词匹配
  let matchedIds = new Set()
  for (const [keyword, ids] of Object.entries(keywordMap)) {
    if (q.includes(keyword)) {
      ids.forEach(id => matchedIds.add(id))
    }
  }

  // 第二步：如果关键词匹配结果太少（<2个），补充分类匹配
  if (matchedIds.size < 2) {
    // 尝试匹配分类名
    const categoryMap = {
      '总经办': ['industry-news', 'bid-maker', 'contract-review'],
      '人事行政': ['expense', 'archive-manager'],
      '财务法务': ['expense', 'contract-review', 'archive-manager'],
      '市场销售': ['industry-news', 'bid-maker'],
      '技术项目': ['bid-maker', 'archive-manager', 'industry-news']
    }
    for (const [cat, ids] of Object.entries(categoryMap)) {
      if (q.includes(cat) || q.includes(cat.replace('行政', ''))) {
        ids.forEach(id => matchedIds.add(id))
      }
    }
  }

  // 第三步：如果还是没有匹配，返回所有工具（兜底，宁多勿少）
  if (matchedIds.size === 0) {
    return tools
  }

  // 按匹配度排序：匹配到的工具排在前面
  const matched = tools.filter(t => matchedIds.has(t.id))
  const unmatched = tools.filter(t => !matchedIds.has(t.id))

  return [...matched, ...unmatched]
}

// ============================================================
// 3. Store 定义
// ============================================================
export const useToolStore = defineStore('tool', {
  state: () => ({
    tools: [],
    selectedToolIds: []
  }),

  getters: {
    selectedTools: (state) => {
      try {
        return state.tools.filter(t => t.status === 'enabled' || t.status === 'active')
      } catch { return [] }
    },
    recommendedTools: (state) => {
      try {
        return state.tools.filter(t => t.status === 'disabled' || t.status === 'inactive')
      } catch { return [] }
    },
    disabledTools: (state) => {
      try {
        return state.tools.filter(t => t.status === 'archived')
      } catch { return [] }
    }
  },

  actions: {
    loadTools() {
      try {
        this.tools = loadAllTools()
        this.selectedToolIds = this.tools
          .filter(t => t.status === 'enabled' || t.status === 'active')
          .map(t => t.id)
        console.log('📦 已加载工具:', this.tools.map(t => t.name).join(', ') || '（无工具）')
      } catch (e) {
        console.warn('⚠️ 加载工具失败:', e.message)
        this.tools = []
        this.selectedToolIds = []
      }
      return this.tools
    },

    // 按分类获取工具
    getToolsByCategory(category) {
      if (category === '全部工具') return this.tools
      if (category === '其它工具') {
        // 其它工具：不属于任何分类的工具（兜底）
        const allCats = new Set()
        this.tools.forEach(t => {
          (t.categories || []).forEach(c => allCats.add(c))
        })
        return this.tools.filter(t => {
          const cats = t.categories || []
          return cats.length === 0 || cats.every(c => !allCats.has(c))
        })
      }
      return this.tools.filter(t => (t.categories || []).includes(category))
    },

    // 语义搜索
    searchTools(query) {
      return semanticSearch(query, this.tools)
    },

    selectTool(toolId) {
      try {
        const tool = this.tools.find(t => t.id === toolId)
        if (tool) {
          tool.status = 'enabled'
          if (!this.selectedToolIds.includes(toolId)) {
            this.selectedToolIds.push(toolId)
          }
        }
      } catch (e) {
        console.warn('⚠️ 选择工具失败:', e.message)
      }
    },

    deselectTool(toolId) {
      try {
        const tool = this.tools.find(t => t.id === toolId)
        if (tool) {
          tool.status = 'disabled'
          const idx = this.selectedToolIds.indexOf(toolId)
          if (idx > -1) {
            this.selectedToolIds.splice(idx, 1)
          }
        }
      } catch (e) {
        console.warn('⚠️ 放弃工具失败:', e.message)
      }
    },

    getToolById(id) {
      try {
        return this.tools.find(t => t.id === id)
      } catch { return null }
    }
  }
})