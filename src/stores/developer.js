import { defineStore } from 'pinia'

// 模拟数据
const mockMyTools = [
  {
    id: 'dev_tool_001',
    name: '智能图片裁剪',
    description: 'AI自动识别图片主体并智能裁剪',
    icon: '✂️',
    developer: '张开发',
    category: 'third_party',
    status: 'reviewing',
    version: '1.0.0',
    submittedAt: '2026-06-19 14:30',
    reviewComment: '代码规范良好，建议增加错误处理'
  },
  {
    id: 'dev_tool_002',
    name: '合同比对工具',
    description: '自动比对两份合同差异',
    icon: '📑',
    developer: '张开发',
    category: 'third_party',
    status: 'approved',
    version: '2.1.0',
    submittedAt: '2026-06-18 09:20',
    reviewComment: '审核通过，已上架'
  },
  {
    id: 'dev_tool_003',
    name: '会议纪要生成器',
    description: '上传录音文件，自动生成会议纪要',
    icon: '🎙️',
    developer: '张开发',
    category: 'third_party',
    status: 'draft',
    version: '0.9.0',
    submittedAt: null,
    reviewComment: null
  }
]

export const useDeveloperStore = defineStore('developer', {
  state: () => ({
    myTools: [],
    debugLogs: [],
    uploadProgress: 0
  }),

  getters: {
    draftTools: (state) => state.myTools.filter(t => t.status === 'draft'),
    reviewingTools: (state) => state.myTools.filter(t => t.status === 'reviewing'),
    approvedTools: (state) => state.myTools.filter(t => t.status === 'approved'),
    rejectedTools: (state) => state.myTools.filter(t => t.status === 'rejected'),

    stats: (state) => {
      const total = state.myTools.length
      const reviewing = state.myTools.filter(t => t.status === 'reviewing').length
      const approved = state.myTools.filter(t => t.status === 'approved').length
      const rejected = state.myTools.filter(t => t.status === 'rejected').length
      return { total, reviewing, approved, rejected }
    }
  },

  actions: {
    loadMyTools() {
      this.myTools = JSON.parse(JSON.stringify(mockMyTools))
    },

    async uploadTool(toolData, file) {
      this.uploadProgress = 0
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 200))
        this.uploadProgress = i
      }
      const newTool = {
        id: 'dev_tool_' + Date.now().toString(36),
        name: toolData.name,
        description: toolData.description,
        icon: toolData.icon || '🧩',
        developer: '当前用户',
        category: 'third_party',
        status: 'draft',
        version: toolData.version || '1.0.0',
        submittedAt: null,
        reviewComment: null
      }
      this.myTools.unshift(newTool)
      this.uploadProgress = 0
      return newTool
    },

    submitForReview(toolId) {
      const tool = this.myTools.find(t => t.id === toolId)
      if (tool) {
        tool.status = 'reviewing'
        tool.submittedAt = new Date().toLocaleString('zh-CN')
      }
    },

    async debugTool(toolId) {
      this.debugLogs = []
      const logs = [
        '[INFO] 开始加载工具...',
        '[INFO] 工具环境初始化完成',
        '[INFO] 正在解析工具配置...',
        '[WARN] 检测到未使用的依赖包',
        '[INFO] 工具启动成功',
        '[SUCCESS] 工具运行正常，输出结果: {"status":"ok"}'
      ]
      for (const log of logs) {
        await new Promise(resolve => setTimeout(resolve, 300))
        this.debugLogs.push(log)
      }
    },

    clearDebugLogs() {
      this.debugLogs = []
    },

    deleteTool(toolId) {
      const tool = this.myTools.find(t => t.id === toolId)
      if (tool && tool.status === 'draft') {
        this.myTools = this.myTools.filter(t => t.id !== toolId)
        return true
      }
      return false
    }
  }
})