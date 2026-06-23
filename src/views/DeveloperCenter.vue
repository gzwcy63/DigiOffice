<template>
  <div class="developer-center">
    <van-nav-bar title="🛠️ 工具工坊" left-text="返回" left-arrow @click-left="$router.back()" />

    <!-- ===== 统计卡片 ===== -->
    <div class="stats-row">
      <div class="stat-item">
        <span class="num">{{ devStore.stats.total }}</span>
        <span class="label">全部</span>
      </div>
      <div class="stat-item stat-reviewing">
        <span class="num">{{ devStore.stats.reviewing }}</span>
        <span class="label">审核中</span>
      </div>
      <div class="stat-item stat-approved">
        <span class="num">{{ devStore.stats.approved }}</span>
        <span class="label">已上架</span>
      </div>
      <div class="stat-item stat-rejected">
        <span class="num">{{ devStore.stats.rejected }}</span>
        <span class="label">未通过</span>
      </div>
    </div>

    <!-- ===== Tab切换 ===== -->
    <van-tabs v-model:active="activeTab" sticky>
      <!-- Tab1: 开发说明 -->
      <van-tab title="📖 开发说明">
        <div class="tab-content doc-content">
          <div class="doc-card">
            <h3>《工具开发格式说明书》</h3>
            <p>欢迎成为「数智办公」平台的开发者！</p>

            <div class="doc-section">
              <h4>📁 工具结构</h4>
              <pre>
my-tool/
├── manifest.json      # 工具元数据（必填）
├── MyToolApp.vue      # 前端组件（必填）
└── server/            # 后端服务（可选）
    ├── main.py
    └── requirements.txt</pre>
            </div>

            <div class="doc-section">
              <h4>📝 manifest.json 规范</h4>
              <pre>
{
  "id": "my-tool",                    // 唯一标识
  "name": "我的工具",                  // 显示名称
  "description": "工具功能描述",        // 功能介绍
  "version": "1.0.0",                 // 版本号
  "icon": "🧩",                       // 图标（emoji）
  "developer": "你的名字",             // 生产者
  "category": "third_party",          // third_party
  "status": "enabled",                // enabled/disabled
  "tags": ["新上线"],                  // 标签
  "entry": "MyToolApp.vue",           // 组件文件名
  "categories": ["市场销售", "技术项目"] // 分类
}</pre>
            </div>

            <div class="doc-section">
              <h4>📋 审核标准</h4>
              <ul>
                <li>工具功能完整，无明显 bug</li>
                <li>符合平台接口规范</li>
                <li>不包含恶意代码</li>
                <li>不侵犯他人知识产权</li>
              </ul>
            </div>

            <div class="doc-actions">
              <van-button type="primary" size="small" @click="downloadDoc">
                📥 下载完整文档
              </van-button>
            </div>
          </div>
        </div>
      </van-tab>

      <!-- Tab2: 上传与调试 -->
      <van-tab title="📤 上传 & 调试">
        <div class="tab-content">
          <van-cell-group inset title="上传新工具">
            <van-field v-model="uploadForm.name" label="工具名称" placeholder="请输入工具名称" />
            <van-field v-model="uploadForm.description" label="功能描述" type="textarea" rows="2" placeholder="简要描述工具功能" />
            <van-field v-model="uploadForm.version" label="版本号" placeholder="如 1.0.0" />
            <van-field v-model="uploadForm.icon" label="图标" placeholder="输入 emoji 如 🧩" />

            <div class="upload-area" @click="triggerFileUpload">
              <van-uploader v-model="uploadFileList" :after-read="onFileUploaded" accept=".zip" style="display:none;" ref="uploaderRef" />
              <div class="upload-box">
                <span class="icon">📦</span>
                <span>点击上传工具包 (.zip)</span>
                <span class="hint">包含 manifest.json + Vue组件</span>
              </div>
            </div>

            <div style="margin: 12px 0;">
              <van-button type="primary" block @click="uploadAndCreate" :loading="uploading">
                创建工具草稿
              </van-button>
            </div>
          </van-cell-group>

          <!-- 草稿列表 -->
          <van-cell-group inset :title="`我的草稿 (${devStore.draftTools.length})`">
            <div v-for="tool in devStore.draftTools" :key="tool.id" class="tool-item">
              <div class="tool-info">
                <span class="icon">{{ tool.icon || '🧩' }}</span>
                <div>
                  <span class="name">{{ tool.name }}</span>
                  <span class="version">v{{ tool.version }}</span>
                  <span class="status draft">草稿</span>
                </div>
              </div>
              <div class="tool-actions">
                <van-button size="mini" plain type="primary" @click="debugTool(tool)">调试</van-button>
                <van-button size="mini" type="success" @click="submitTool(tool)">提交审核</van-button>
                <van-button size="mini" plain type="danger" @click="deleteTool(tool)">删除</van-button>
              </div>
            </div>
            <div v-if="devStore.draftTools.length === 0" class="empty-hint">暂无草稿</div>
          </van-cell-group>

          <!-- 调试控制台 -->
          <van-cell-group inset title="🖥️ 调试控制台" v-if="devStore.debugLogs.length > 0">
            <div class="debug-console">
              <div v-for="(log, idx) in devStore.debugLogs" :key="idx" class="log-line" :class="logClass(log)">
                {{ log }}
              </div>
            </div>
            <van-button size="small" plain @click="devStore.clearDebugLogs()">清空日志</van-button>
          </van-cell-group>
        </div>
      </van-tab>

      <!-- Tab3: 审核状态 -->
      <van-tab title="📋 审核状态">
        <div class="tab-content">
          <van-cell-group inset :title="`审核中 (${devStore.reviewingTools.length})`">
            <div v-for="tool in devStore.reviewingTools" :key="tool.id" class="tool-item">
              <div class="tool-info">
                <span class="icon">{{ tool.icon || '🧩' }}</span>
                <div>
                  <span class="name">{{ tool.name }}</span>
                  <span class="version">v{{ tool.version }}</span>
                  <span class="status reviewing">⏳ 审核中</span>
                </div>
              </div>
              <div class="submitted-at">提交于 {{ tool.submittedAt }}</div>
            </div>
            <div v-if="devStore.reviewingTools.length === 0" class="empty-hint">暂无审核中的工具</div>
          </van-cell-group>

          <van-cell-group inset :title="`已上架 (${devStore.approvedTools.length})`">
            <div v-for="tool in devStore.approvedTools" :key="tool.id" class="tool-item">
              <div class="tool-info">
                <span class="icon">{{ tool.icon || '🧩' }}</span>
                <div>
                  <span class="name">{{ tool.name }}</span>
                  <span class="version">v{{ tool.version }}</span>
                  <span class="status approved">✅ 已上架</span>
                </div>
              </div>
            </div>
            <div v-if="devStore.approvedTools.length === 0" class="empty-hint">暂无已上架工具</div>
          </van-cell-group>

          <van-cell-group inset :title="`未通过 (${devStore.rejectedTools.length})`">
            <div v-for="tool in devStore.rejectedTools" :key="tool.id" class="tool-item">
              <div class="tool-info">
                <span class="icon">{{ tool.icon || '🧩' }}</span>
                <div>
                  <span class="name">{{ tool.name }}</span>
                  <span class="version">v{{ tool.version }}</span>
                  <span class="status rejected">❌ 未通过</span>
                </div>
              </div>
              <div class="review-comment" v-if="tool.reviewComment">
                💬 {{ tool.reviewComment }}
              </div>
              <div class="tool-actions" style="margin-top:8px;">
                <van-button size="mini" type="primary" @click="resubmitTool(tool)">修改后重新提交</van-button>
              </div>
            </div>
            <div v-if="devStore.rejectedTools.length === 0" class="empty-hint">暂无未通过的工具</div>
          </van-cell-group>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showToast, showDialog, showSuccessToast } from 'vant'
import { useDeveloperStore } from '@/stores/developer'

const devStore = useDeveloperStore()

const activeTab = ref(0)
const uploaderRef = ref(null)
const uploadFileList = ref([])
const uploading = ref(false)

const uploadForm = reactive({
  name: '',
  description: '',
  version: '1.0.0',
  icon: '🧩'
})

onMounted(() => {
  devStore.loadMyTools()
})

// ===== Tab1 =====
const downloadDoc = () => {
  showToast('📄 文档下载功能开发中...')
}

// ===== Tab2 =====
const triggerFileUpload = () => {
  uploaderRef.value?.chooseFile()
}

const onFileUploaded = (file) => {
  showToast(`已选择: ${file.file.name}`)
}

const uploadAndCreate = async () => {
  if (!uploadForm.name.trim()) {
    showToast('请输入工具名称')
    return
  }
  if (!uploadForm.description.trim()) {
    showToast('请输入功能描述')
    return
  }
  if (uploadFileList.value.length === 0) {
    showToast('请上传工具包文件')
    return
  }

  uploading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    const newTool = await devStore.uploadTool(uploadForm, uploadFileList.value[0].file)
    showSuccessToast('工具草稿创建成功！')
    uploadForm.name = ''
    uploadForm.description = ''
    uploadForm.version = '1.0.0'
    uploadForm.icon = '🧩'
    uploadFileList.value = []
    activeTab.value = 1
  } catch (e) {
    showToast('上传失败，请重试')
  }
  uploading.value = false
}

const debugTool = async (tool) => {
  showToast(`开始调试「${tool.name}」...`)
  await devStore.debugTool(tool.id)
  showToast('调试完成')
}

const submitTool = (tool) => {
  showDialog({
    title: '提交审核',
    message: `确定要提交「${tool.name}」进行审核吗？`,
    confirmButtonText: '确认提交'
  }).then(res => {
    if (res === 'confirm') {
      devStore.submitForReview(tool.id)
      showSuccessToast('已提交审核')
    }
  })
}

const deleteTool = (tool) => {
  showDialog({
    title: '删除工具',
    message: `确定要删除「${tool.name}」吗？`,
    confirmButtonText: '确认删除',
    confirmButtonColor: '#ee0a24'
  }).then(res => {
    if (res === 'confirm') {
      const success = devStore.deleteTool(tool.id)
      if (success) {
        showSuccessToast('已删除')
      } else {
        showToast('只有草稿状态可删除')
      }
    }
  })
}

// ===== Tab3 =====
const resubmitTool = (tool) => {
  const target = devStore.myTools.find(t => t.id === tool.id)
  if (target) {
    target.status = 'draft'
    target.reviewComment = null
    showSuccessToast('已转为草稿，修改后可重新提交')
    activeTab.value = 1
  }
}

const logClass = (log) => {
  if (log.startsWith('[SUCCESS]')) return 'log-success'
  if (log.startsWith('[WARN]')) return 'log-warn'
  if (log.startsWith('[ERROR]')) return 'log-error'
  return 'log-info'
}
</script>

<style lang="scss" scoped>
.developer-center {
  background: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 30px;
}

.stats-row {
  display: flex;
  background: #fff;
  margin: 12px 16px;
  border-radius: 12px;
  padding: 12px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);

  .stat-item {
    flex: 1;
    text-align: center;
    .num { display: block; font-size: 24px; font-weight: 700; color: #4A90D9; }
    .label { font-size: 12px; color: #999; }
    &.stat-reviewing .num { color: #faad14; }
    &.stat-approved .num { color: #52c41a; }
    &.stat-rejected .num { color: #ff4d4f; }
  }
}

.tab-content {
  padding: 12px 16px 20px;
}

.doc-content .doc-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  h3 { color: #4A90D9; margin-bottom: 12px; font-size: 18px; }
  p { color: #666; font-size: 14px; line-height: 1.8; }
  .doc-section {
    margin-top: 16px;
    h4 { font-size: 15px; color: #333; margin-bottom: 6px; }
    pre {
      background: #f5f7fa;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 12px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      border: 1px solid #eee;
      color: #333;
    }
    ul { padding-left: 20px; li { font-size: 14px; color: #666; line-height: 2; } }
  }
  .doc-actions { margin-top: 20px; text-align: center; }
}

.upload-area {
  margin: 12px 0;
  .upload-box {
    border: 2px dashed #ddd;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    background: #fafafa;
    cursor: pointer;
    .icon { font-size: 32px; display: block; }
    span { display: block; font-size: 14px; color: #666; margin-top: 4px; }
    .hint { font-size: 12px; color: #bbb; }
    &:hover { border-color: #4A90D9; background: #f0f5ff; }
  }
}

.tool-item {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child { border-bottom: none; }
  .tool-info {
    display: flex;
    align-items: center;
    gap: 10px;
    .icon { font-size: 24px; }
    .name { font-size: 14px; font-weight: 600; color: #333; }
    .version { font-size: 11px; color: #999; margin-left: 4px; }
    .status {
      font-size: 11px;
      padding: 1px 8px;
      border-radius: 10px;
      margin-left: 6px;
      &.draft { background: #f0f0f0; color: #666; }
      &.reviewing { background: #fff7e6; color: #d46b08; }
      &.approved { background: #f6ffed; color: #52c41a; }
      &.rejected { background: #fff2f0; color: #ff4d4f; }
    }
  }
  .submitted-at { font-size: 11px; color: #bbb; margin-left: 48px; }
  .review-comment {
    font-size: 12px;
    color: #ff4d4f;
    background: #fff2f0;
    padding: 4px 10px;
    border-radius: 6px;
    margin: 4px 0 4px 48px;
  }
  .tool-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-left: 48px;
  }
}

.debug-console {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 12px 16px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
  .log-line {
    padding: 2px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    &.log-success { color: #a6e3a1; }
    &.log-warn { color: #f9e2af; }
    &.log-error { color: #f38ba8; }
    &.log-info { color: #89b4fa; }
  }
}

.empty-hint {
  text-align: center;
  color: #ccc;
  font-size: 14px;
  padding: 20px 0;
}
</style>