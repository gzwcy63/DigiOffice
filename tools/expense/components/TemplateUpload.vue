<template>
  <div class="template-upload">
    <van-cell-group inset title="📄 报销单模板">
      <div class="template-status">
        <span v-if="hasTemplate" class="status-ok">✅ 已上传自定义模板</span>
        <span v-else class="status-empty">⚪ 使用系统默认模板</span>
        <span class="template-name" v-if="hasTemplate">{{ templateName }}</span>
      </div>
      <div class="template-actions">
        <van-button size="small" plain type="primary" @click="triggerUpload">
          {{ hasTemplate ? '更换模板' : '上传模板' }}
        </van-button>
        <van-button v-if="hasTemplate" size="small" plain type="danger" @click="removeTemplate">
          恢复默认
        </van-button>
      </div>
      <van-uploader
        v-model="fileList"
        :after-read="onFileRead"
        accept=".docx"
        style="display:none;"
        ref="uploaderRef"
      />
      <div class="template-hint">
        <span>支持 .docx 格式，文档中需包含：<br/>部门、报销人、类别、金额、备注、报销时间、发票时间</span>
      </div>
    </van-cell-group>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { getTemplate, saveTemplate, hasTemplate as checkTemplate } from '../utils/storage.js'

const emit = defineEmits(['update'])

const uploaderRef = ref(null)
const fileList = ref([])
const hasTemplate = ref(checkTemplate())
const templateName = ref(hasTemplate.value ? getTemplate()?.name || '自定义模板' : '')

function triggerUpload() {
  uploaderRef.value?.chooseFile()
}

function onFileRead(file) {
  const templateData = {
    name: file.file.name,
    content: 'base64_placeholder',
    uploadedAt: new Date().toISOString()
  }
  saveTemplate(templateData)
  hasTemplate.value = true
  templateName.value = file.file.name
  showToast('模板上传成功')
  emit('update')
}

function removeTemplate() {
  showConfirmDialog({
    title: '确认恢复默认',
    message: '将删除自定义模板，恢复使用系统默认模板',
    confirmButtonText: '确认恢复'
  }).then(res => {
    if (res === 'confirm') {
      localStorage.removeItem('expense_template')
      hasTemplate.value = false
      templateName.value = ''
      showToast('已恢复默认模板')
      emit('update')
    }
  })
}
</script>

<style lang="scss" scoped>
.template-upload {
  .template-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    font-size: 14px;
    .status-ok { color: #52c41a; }
    .status-empty { color: #999; }
    .template-name {
      color: #4A90D9;
      font-weight: 500;
      font-size: 13px;
    }
  }
  .template-actions {
    display: flex;
    gap: 8px;
    padding: 4px 0 8px;
  }
  .template-hint {
    font-size: 12px;
    color: #bbb;
    padding: 8px 0;
    line-height: 1.6;
    border-top: 1px solid #f5f5f5;
    margin-top: 8px;
  }
}
</style>