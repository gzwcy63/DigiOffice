<template>
  <div class="archive-app">
    <van-nav-bar title="🗂️ 档案管理" />
    <div class="app-content">
      <van-field v-model="searchQuery" label="🔍" placeholder="输入文件名/关键词查找" />
      <van-button type="primary" @click="search" style="margin-top:12px;">搜索</van-button>
      <div v-if="results.length > 0" style="margin-top:12px;">
        <div v-for="r in results" :key="r.path" class="result-item">
          <div><strong>{{ r.name }}</strong></div>
          <div style="font-size:12px;color:#999;">📁 {{ r.path }}</div>
          <div style="font-size:12px;color:#1677ff;">📦 档案柜：{{ r.location || '未标记' }}</div>
        </div>
      </div>
      <van-button plain @click="scanDuplicates" style="margin-top:12px;">扫描重复文件</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'

const searchQuery = ref('')
const results = ref([])

const search = () => {
  if (!searchQuery.value) { showToast('请输入搜索词'); return }
  results.value = [
    { name: '合同_2025.pdf', path: '项目A/合同/', location: 'A3-2-15' },
    { name: '技术方案_v3.docx', path: '项目A/技术资料/', location: 'B1-1-08' }
  ]
  showToast('找到 2 个文件')
}

const scanDuplicates = () => {
  showToast('扫描完成，发现 3 个重复文件')
}
</script>

<style scoped>
.archive-app { padding: 16px; }
.app-content { max-width: 600px; margin: 0 auto; }
.result-item { padding: 10px 12px; background: #f5f5f5; border-radius: 8px; margin-top: 8px; }
</style>