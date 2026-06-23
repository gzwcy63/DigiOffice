<template>
  <div class="contract-app">
    <van-nav-bar title="📄 合同初审" />
    <div class="app-content">
      <van-uploader v-model="fileList" multiple :max-count="2" accept=".doc,.docx,.pdf" />
      <van-button type="primary" @click="startReview" style="margin-top:12px;">开始审查</van-button>
      <div v-if="result" class="result">
        <p>审查结果：{{ result }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'

const fileList = ref([])
const result = ref('')

const startReview = () => {
  if (fileList.value.length === 0) {
    showToast('请上传合同文件')
    return
  }
  showToast('审查中...')
  setTimeout(() => {
    result.value = '未发现重大风险条款，建议关注第3条违约责任'
  }, 1500)
}
</script>

<style scoped>
.contract-app { padding: 16px; }
.app-content { max-width: 600px; margin: 0 auto; }
.result { margin-top: 16px; padding: 12px; background: #f6ffed; border-radius: 8px; }
</style>