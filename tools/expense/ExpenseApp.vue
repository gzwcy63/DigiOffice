<template>
  <div class="expense-tool">
    <!-- 步骤条 -->
    <van-steps :active="step" class="steps">
      <van-step>上传发票</van-step>
      <van-step>识别信息</van-step>
      <van-step>确认</van-step>
      <van-step>完成</van-step>
    </van-steps>

    <!-- 核心交互区 -->
    <div class="content-area">
      <!-- Step 0: 上传 -->
<!-- Step 0: 上传 -->
<div v-if="step === 0" class="upload-area">
  <div class="upload-box" @click="triggerUpload">
    <van-uploader 
      v-model="fileList" 
      :after-read="onAfterRead" 
      accept="image/*,.pdf,.png,.jpg,.jpeg"
      style="display:none;" 
      ref="uploaderRef" 
      multiple
    />
    <span class="icon">📤</span>
    <span>点击上传发票照片或文件</span>
    <span class="hint">支持 JPG / PNG / PDF</span>
  </div>
  
  <!-- 新增：粘贴区域 -->
  <div class="paste-area" @click="pasteFromClipboard">
    <span>📋 点击粘贴</span>
    <span class="hint">从剪贴板粘贴图片</span>
  </div>
</div>

      <!-- Step 1: 识别中 / 识别结果 -->
      <div v-if="step === 1" class="recognize-area">
        <div v-if="recognizing" class="loading-box">
          <van-loading size="40" /> 识别中...
        </div>
        <div v-else class="result-box">
          <div class="file-preview">
            <img v-if="fileList[0]?.url" :src="fileList[0].url" alt="发票" />
          </div>
          <van-cell-group inset title="识别结果">
            <van-cell title="发票号码" :value="invoiceData.number" />
            <van-cell title="金额" :value="invoiceData.amount" />
            <van-cell title="日期" :value="invoiceData.date" />
            <van-cell title="销方" :value="invoiceData.seller" />
          </van-cell-group>
          <div class="action-row">
            <van-button plain type="warning" size="small" @click="reUpload">重新上传</van-button>
            <van-button plain type="primary" size="small" @click="editMode = !editMode">编辑</van-button>
            <van-button type="primary" size="large" @click="confirmOK">✅ OK 确认</van-button>
          </div>
        </div>
      </div>

      <!-- Step 2: 查重与生成 -->
      <div v-if="step === 2" class="result-area">
        <div v-if="duplicate" class="duplicate-warning">
          ⚠️ 该发票已报销过！
        </div>
        <div v-else>
          <van-icon name="checked" size="48" color="#52c41a" />
          <p>查重通过，报销单生成中...</p>
          <van-button type="primary" @click="generateDoc" :loading="generating">
            生成报销单
          </van-button>
        </div>
      </div>

      <!-- Step 3: 完成 -->
      <div v-if="step === 3" class="done-area">
        <van-icon name="success" size="64" color="#52c41a" />
        <h3>报销单已生成！</h3>
        <div class="file-card">
          <span>📄 报销单_张三_20260116.docx</span>
          <span class="size">(28KB)</span>
        </div>
        <div class="done-actions">
          <van-button type="primary" @click="downloadFile">📥 下载 Word</van-button>
          <van-button plain @click="shareFile">📤 转发微信</van-button>
        </div>
        <p class="watermark-hint" v-if="userLevel === 'anonymous' || userLevel === 'registered'">
          ⚠️ 当前为{{ userLevel === 'anonymous' ? '游客' : '注册未充值' }}模式，文件带有水印
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { showToast, showDialog } from 'vant'

// ===== 接收平台注入的Props =====
const props = defineProps({
  userInfo: { type: Object, default: () => ({}) },
  tenantInfo: { type: Object, default: () => ({}) },
  credits: { type: Number, default: 0 },
  onDeduct: { type: Function, default: () => {} },
  uploadUrl: { type: String, default: '' },
  requestLogin: { type: Function, default: () => {} },
  userLevel: { type: String, default: 'anonymous' } // anonymous | registered | paid
})

// ===== 内部状态 =====
const step = ref(0)
const fileList = ref([])
const recognizing = ref(false)
const duplicate = ref(false)
const generating = ref(false)
const editMode = ref(false)

const invoiceData = reactive({
  number: '12345678',
  amount: '¥ 1,280.00',
  date: '2026-01-16',
  seller: 'XX科技有限公司'
})

const uploaderRef = ref(null)

// ===== 方法 =====
const triggerUpload = () => {
  uploaderRef.value?.chooseFile()
}

// 粘贴上传
const pasteFromClipboard = async () => {
  try {
    const permission = await navigator.permissions.query({ name: 'clipboard-read' })
    if (permission.state === 'denied') {
      showToast('剪贴板权限被拒绝，请手动上传')
      return
    }
    const items = await navigator.clipboard.read()
    for (const item of items) {
      if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
        const blob = await item.getType(item.types[0])
        const file = new File([blob], 'clipboard-image.png', { type: blob.type })
        // 模拟上传
        fileList.value = [{ file, url: URL.createObjectURL(blob) }]
        onAfterRead({ file, content: blob })
        return
      }
    }
    showToast('剪贴板中没有图片')
  } catch (e) {
    showToast('无法读取剪贴板，请手动上传')
    console.error(e)
  }
}

const onAfterRead = (file) => {
  // 模拟上传后进入识别步骤
  step.value = 1
  recognizing.value = true
  setTimeout(() => {
    recognizing.value = false
    // 模拟识别结果
    showToast('识别完成，请确认信息')
  }, 2000)
}

const reUpload = () => {
  step.value = 0
  fileList.value = []
}

const confirmOK = () => {
  // 如果积分<10且非付费用户，触发登录/充值引导
  if (props.userLevel === 'anonymous') {
    props.requestLogin(() => {
      // 登录后重新确认
      confirmOK()
    })
    return
  }
  if (props.userLevel === 'registered' && props.credits < 10) {
    showDialog({
      title: '积分不足',
      message: '剩余积分不足，请充值后使用'
    })
    return
  }

  // 查重模拟
  step.value = 2
  duplicate.value = Math.random() > 0.8 // 20%概率重复
  if (duplicate.value) {
    showToast('⚠️ 发票重复！')
  } else {
    showToast('✅ 查重通过')
  }
}

const generateDoc = async () => {
  generating.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 扣减积分（调用平台注入的方法）
  if (props.onDeduct) {
    props.onDeduct(1)
  }
  
  generating.value = false
  step.value = 3
  showToast('报销单生成成功！')
}

const downloadFile = () => {
  if (props.userLevel === 'anonymous') {
    props.requestLogin()
    return
  }
  if (props.userLevel === 'registered') {
    showToast('注册未充值用户只能下载PDF（带水印）')
    return
  }
  showToast('下载中...')
}

const shareFile = () => {
  showToast('转发链接已复制')
}
</script>

<style lang="scss" scoped>
.expense-tool {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  min-height: 500px;
  .steps { margin-bottom: 20px; }
  .content-area {
    .upload-area {
      .upload-box {
        border: 2px dashed #ddd;
        border-radius: 16px;
        padding: 40px 20px;
        text-align: center;
        background: #fafafa;
        .icon { font-size: 48px; display: block; }
        span { display: block; font-size: 16px; color: #666; margin-top: 8px; }
        .hint { font-size: 12px; color: #bbb; }
      }
    }

 .paste-area {
  margin-top: 12px;
  border: 1px dashed #1677ff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  background: #f0f5ff;
  cursor: pointer;
  span { display: block; font-size: 14px; color: #1677ff; }
  .hint { font-size: 11px; color: #999; }
}
   .recognize-area {
      .loading-box { text-align: center; padding: 40px; }
      .result-box {
        .file-preview {
          img { width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px; background: #f5f5f5; }
        }
        .action-row {
          display: flex;
          gap: 10px;
          margin-top: 16px;
          flex-wrap: wrap;
          .van-button--large { flex: 1; }
        }
      }
    }
    .duplicate-warning {
      background: #fff2f0;
      border: 1px solid #ffccc7;
      color: #cf1322;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
    }
    .result-area, .done-area {
      text-align: center;
      padding: 20px;
      .file-card {
        background: #f6ffed;
        border: 1px solid #b7eb8f;
        padding: 12px 20px;
        border-radius: 8px;
        margin: 16px 0;
        display: flex;
        justify-content: space-between;
        .size { color: #999; font-size: 13px; }
      }
      .done-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin: 16px 0;
      }
      .watermark-hint {
        font-size: 12px;
        color: #ff4d4f;
        margin-top: 12px;
      }
    }
  }
}
</style>