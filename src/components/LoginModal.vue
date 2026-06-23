<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    round
    :style="{ height: '65%', padding: '0 20px 20px' }"
  >
    <div class="login-modal">
      <!-- ===== 头部 ===== -->
      <div class="login-header">
        <span class="login-title">登录 / 注册</span>
        <span class="login-close" @click="visible = false">✕</span>
      </div>

      <p class="login-sub" v-if="hasCache">
        ✅ 检测到本机缓存账号，一键快速登录
      </p>
      <p class="login-sub" v-else>
        使用手机号登录，首次自动注册
      </p>

      <!-- ===== 表单 ===== -->
      <van-form @submit="onSubmit" ref="formRef">
        <van-cell-group inset>
          <van-field
            v-model="form.phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确手机号' }]"
            left-icon="phone-o"
            clearable
          />
          <van-field
            v-model="form.password"
            label="密码"
            :type="form.showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
            left-icon="lock-o"
            :right-icon="form.showPassword ? 'eye-o' : 'closed-eye'"
            @click-right-icon="form.showPassword = !form.showPassword"
            clearable
          />
        </van-cell-group>

        <div class="login-actions">
          <van-button
            type="primary"
            size="large"
            round
            native-type="submit"
            :loading="loading"
            class="login-btn"
          >
            {{ hasCache ? '一键登录' : '登录 / 注册' }}
          </van-button>
        </div>

        <div class="login-extra">
          <span class="extra-link" @click="switchAccount">切换账号</span>
          <span class="extra-link" @click="forgotPassword">忘记密码？</span>
        </div>
      </van-form>

      <!-- ===== 其他登录方式 ===== -->
      <div class="login-others">
        <div class="divider"><span>其他方式</span></div>
        <div class="other-icons">
          <span class="other-icon" @click="wechatLogin">💬 微信</span>
          <span class="other-icon" @click="smsLogin">📱 验证码</span>
        </div>
      </div>

      <!-- ===== 协议 ===== -->
      <p class="login-agreement">
        登录即代表同意 <span>《用户协议》</span> 和 <span>《隐私政策》</span>
      </p>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  show: { type: Boolean, default: false }
})
const emit = defineEmits(['update:show', 'login-success'])

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const hasCache = ref(false)

// ===== 双向绑定 =====
const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

// ===== 表单数据 =====
const form = reactive({
  phone: '',
  password: '',
  showPassword: false
})

// ===== 检测缓存 =====
onMounted(() => {
  const cached = localStorage.getItem('shuzhi_login_cache')
  if (cached) {
    try {
      const data = JSON.parse(cached)
      if (data.phone) {
        form.phone = data.phone
        form.password = '······'
        hasCache.value = true
      }
    } catch (e) {}
  }
})

// 弹窗打开时重新检测缓存
watch(visible, (val) => {
  if (val) {
    const cached = localStorage.getItem('shuzhi_login_cache')
    if (cached) {
      try {
        const data = JSON.parse(cached)
        if (data.phone) {
          form.phone = data.phone
          form.password = '······'
          hasCache.value = true
        }
      } catch (e) {}
    }
  }
})

// ===== 提交登录 =====
const onSubmit = async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 800))

  // ===== 模拟登录成功 =====
  const userData = {
    id: 'user_' + Date.now().toString(36),
    phone: form.phone,
    name: form.phone === '13800138000' ? '张三' : form.phone.slice(0, 4) + '用户',
    role: form.phone === '13800138000' ? 'admin' : 'employee',
    tenantId: 'tenant_001',
    tenantName: '深圳数智元科技有限公司',
    credits: 1000
  }

  // 保存登录缓存
  localStorage.setItem('shuzhi_login_cache', JSON.stringify({
    phone: form.phone,
    expireAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  }))

  loading.value = false
  visible.value = false
  emit('login-success', userData)
  showSuccessToast('登录成功')
}

// ===== 辅助方法 =====
const switchAccount = () => {
  localStorage.removeItem('shuzhi_login_cache')
  form.phone = ''
  form.password = ''
  hasCache.value = false
  showToast('已清除缓存，请重新输入')
}

const forgotPassword = () => {
  showToast('请联系管理员重置密码')
}

const wechatLogin = () => {
  showToast('微信登录功能开发中')
}

const smsLogin = () => {
  showToast('短信验证码登录开发中')
}
</script>

<style lang="scss" scoped>
.login-modal {
  padding: 16px 0 20px;
  display: flex;
  flex-direction: column;
  min-height: 400px;

  .login-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .login-title {
      font-size: 22px;
      font-weight: 700;
      color: #2C3E50;
    }
    .login-close {
      font-size: 24px;
      color: #999;
      cursor: pointer;
      padding: 4px 8px;
      &:hover { color: #333; }
    }
  }

  .login-sub {
    font-size: 14px;
    color: #8C9DAB;
    margin: 4px 0 20px;
  }

  .login-actions {
    margin: 20px 0 12px;
    .login-btn {
      height: 48px;
      font-size: 16px;
      background: linear-gradient(135deg, #4A90D9, #6BA8E8);
      border: none;
    }
  }

  .login-extra {
    display: flex;
    justify-content: space-between;
    .extra-link {
      font-size: 13px;
      color: #4A90D9;
      cursor: pointer;
      &:hover { color: #6BA8E8; }
    }
  }

  .login-others {
    margin-top: 20px;
    .divider {
      display: flex;
      align-items: center;
      color: #ccc;
      font-size: 13px;
      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #eee;
      }
      span { padding: 0 16px; }
    }
    .other-icons {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 12px;
      .other-icon {
        font-size: 14px;
        color: #666;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 20px;
        background: #f5f7fa;
        transition: all 0.2s;
        &:hover { background: #e8ecf0; }
      }
    }
  }

  .login-agreement {
    margin-top: 16px;
    font-size: 12px;
    color: #ccc;
    text-align: center;
    span { color: #4A90D9; cursor: pointer; }
  }
}
</style>