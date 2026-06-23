<template>
  <div class="news-app">
    <van-nav-bar title="📰 行业动态" />
    <div class="app-content">
      <van-field v-model="keywords" label="关键词" placeholder="输入行业关键词，10秒自动使用公司信息" />
      <van-button type="primary" @click="generateReport" style="margin-top:12px;">生成报告</van-button>
      <div v-if="reports.length > 0" style="margin-top:16px;">
        <h4>📚 历史报告</h4>
        <div v-for="r in reports" :key="r.id" class="report-item">
          {{ r.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'

const keywords = ref('')
const reports = ref([])

const generateReport = () => {
  showToast('生成中...')
  setTimeout(() => {
    reports.value.push({ 
      id: Date.now(), 
      title: `行业动态报告_${new Date().toLocaleDateString()}` 
    })
    showToast('生成成功')
  }, 1500)
}
</script>

<style scoped>
.news-app { padding: 16px; }
.app-content { max-width: 600px; margin: 0 auto; }
.report-item { padding: 8px 12px; background: #f5f5f5; border-radius: 6px; margin-top: 6px; }
</style>