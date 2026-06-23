<template>
  <div class="settings-page">
    <van-nav-bar title="设置" left-text="返回" left-arrow @click-left="$router.back()" />

    <!-- ===== 个人信息 ===== -->
    <van-cell-group inset title="👤 个人信息">
      <van-cell title="昵称" :value="userStore.userInfo.name || '未设置'" is-link @click="editNickname" />
      <van-cell title="手机号" :value="userStore.userInfo.phone || '未绑定'" is-link @click="editPhone" />
      <van-cell title="修改密码" is-link @click="editPassword" />
    </van-cell-group>

    <!-- ===== 积分与充值 ===== -->
    <van-cell-group inset title="💰 积分与充值">
      <van-cell title="剩余积分" :value="userStore.credits + ' 分'" />
      <van-cell
        :title="userStore.isAdmin ? '去充值' : '提醒管理员充值'"
        is-link
        @click="handleCreditAction"
      />
    </van-cell-group>

    <!-- ===== 公司信息（仅管理员） ===== -->
    <van-cell-group inset title="🏢 公司信息" v-if="userStore.isAdmin">
      <van-cell title="公司名称" :value="userStore.userInfo.tenantName || '未设置'" is-link @click="editCompany" />
      <van-cell title="行业" :value="companyInfo.industry || '未设置'" is-link @click="editCompany" />
      <van-cell title="主要产品" :value="companyInfo.products || '未设置'" is-link @click="editCompany" />
    </van-cell-group>

    <!-- ===== 员工管理（仅管理员） ===== -->
    <van-cell-group inset title="👥 员工管理" v-if="userStore.isAdmin">
      <van-cell title="添加员工" is-link @click="addEmployee" />
      <van-cell title="员工列表" :value="employeeCount + '人'" is-link @click="employeeList" />
    </van-cell-group>

    <!-- ===== 开发者生态 ===== -->
    <van-cell-group inset title="🛠️ 开发者生态">
      <van-cell
        title="进入开发者中心"
        is-link
        value="点击进入 →"
        @click="$router.push('/developer')"
      />
    </van-cell-group>

    <!-- ===== 平台管理员入口 ===== -->
    <van-cell-group inset v-if="userStore.isPlatformAdmin" title="🔐 系统管理">
      <van-cell title="平台管理后台" is-link @click="alert('暂不开放')" />
    </van-cell-group>

    <!-- ===== 退出登录 ===== -->
    <div class="logout-btn" @click="handleLogout">退出登录</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog, showConfirmDialog } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// ===== 模拟数据 =====
const companyInfo = ref({
  industry: '软件与信息技术',
  products: '数智办公平台'
})
const employeeCount = ref(5)

// ===== 方法 =====
const alert = (msg) => showToast(msg)

const editNickname = () => {
  showDialog({
    title: '修改昵称',
    message: '请输入新昵称',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(res => {
    if (res === 'confirm') {
      showToast('昵称已修改')
    }
  })
}

const editPhone = () => {
  showDialog({
    title: '更换手机号',
    message: '请输入新手机号',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(res => {
    if (res === 'confirm') {
      showToast('手机号已更新')
    }
  })
}

const editPassword = () => {
  showDialog({
    title: '修改密码',
    message: '请输入旧密码和新密码',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(res => {
    if (res === 'confirm') {
      showToast('密码已修改')
    }
  })
}

const handleCreditAction = () => {
  if (userStore.isAdmin) {
    showToast('跳转充值页面')
  } else {
    userStore.remindAdmin()
  }
}

const editCompany = () => {
  showDialog({
    title: '编辑公司信息',
    message: '请填写公司名称、行业、主要产品',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: '保存',
    cancelButtonText: '取消'
  }).then(res => {
    if (res === 'confirm') {
      showToast('公司信息已更新')
    }
  })
}

const addEmployee = () => {
  showDialog({
    title: '添加员工',
    message: '请输入手机号、姓名、部门',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: '添加',
    cancelButtonText: '取消'
  }).then(res => {
    if (res === 'confirm') {
      employeeCount.value++
      showToast('员工已添加')
    }
  })
}

const employeeList = () => {
  showDialog({
    title: '员工列表',
    message: '1. 张三 (138****8000) - 销售部\n2. 李四 (139****8001) - 技术部\n3. 王五 (137****8002) - 财务部',
    confirmButtonText: '知道了'
  })
}

const handleLogout = () => {
  showConfirmDialog({
    title: '确认退出',
    message: '确定要退出登录吗？',
    confirmButtonText: '退出'
  }).then(res => {
    if (res === 'confirm') {
      userStore.logout()
      router.push('/')
      showToast('已退出')
    }
  })
}
</script>

<style lang="scss" scoped>
.settings-page {
  background: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40px;

  .logout-btn {
    margin: 30px 20px;
    padding: 14px;
    text-align: center;
    background: #ff4d4f;
    color: #fff;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { background: #ff7875; }
    &:active { transform: scale(0.97); }
  }
}
</style>