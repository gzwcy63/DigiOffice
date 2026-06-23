<template>
  <div class="bid-app">
    <van-nav-bar title="📑 标书自动编制" />
    <div class="app-content">
      <van-steps :active="step" style="margin:16px 0;">
        <van-step>上传招标</van-step>
        <van-step>评估</van-step>
        <van-step>资料清单</van-step>
        <van-step>出草稿</van-step>
        <van-step>正式标书</van-step>
      </van-steps>
      <van-uploader v-model="fileList" accept=".doc,.docx,.pdf" />
      <van-button type="primary" @click="nextStep" :disabled="step >= 4" style="margin-top:12px;">
        {{ step >= 4 ? '已完成' : '下一步' }}
      </van-button>
      <div v-if="step >= 3" style="margin-top:12px;padding:12px;background:#f6ffed;border-radius:8px;">
        📄 草稿已生成（模拟）
      </div>
      <div v-if="step >= 4" style="margin-top:12px;padding:12px;background:#e6f7ff;border-radius:8px;">
        ✅ 正式标书已生成（模拟）
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'

const step = ref(0)
const fileList = ref([])

const nextStep = () => {
  if (step.value < 4) {
    step.value++
    const steps = ['上传招标文件', '评估投标可行性', '整理资料清单', '生成草稿', '生成正式标书']
    showToast(`✅ 第${step.value}步：${steps[step.value]}`)
  }
}
</script>

<style scoped>
.bid-app { padding: 16px; }
.app-content { max-width: 600px; margin: 0 auto; }
</style>