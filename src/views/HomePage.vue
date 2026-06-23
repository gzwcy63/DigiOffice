<template>
  <div class="home-page">
    <!-- ===== 顶部栏 ===== -->
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">🧠</span>
          <span class="logo-text">数智办公</span>
          <span class="logo-version">v1.0</span>
        </div>
        <div class="logo-sub">老板的牛马员工，员工的摸鱼神器</div>
      </div>

      <div class="header-center">
        <div class="company-name">{{ userStore.userInfo.tenantName || '未登录' }}</div>
        <div class="company-date">{{ currentDate }}</div>
      </div>

      <div class="header-right">
        <span class="user-name" @click="handleUserAction">
          {{ userStore.isGuest ? '点击登录' : userStore.userInfo.name || '用户' }}
          <span class="user-role" v-if="userStore.isFull">
            {{ userStore.isAdmin ? '管理员' : '员工' }}
          </span>
        </span>
        <span class="credit-badge" :class="{ 'credit-low': userStore.isCreditsLow }">
          ⚡ {{ userStore.credits }}
        </span>
        <van-button v-if="userStore.isFull" size="small" type="primary" plain round @click="handleRecharge">
          充值
        </van-button>
        <van-icon name="bell-o" size="20" class="header-icon" @click="showNotifications" />
        <van-icon name="setting-o" size="20" class="header-icon" @click="goSettings" />
      </div>
    </header>

    <!-- ===== 滚动消息栏 ===== -->
    <div class="notice-bar">
      <span class="notice-icon">📢</span>
      <van-swipe class="notice-swipe" vertical :autoplay="5000" :touchable="false">
        <van-swipe-item v-for="(msg, idx) in noticeMessages" :key="idx">
          <span class="notice-text">{{ msg }}</span>
        </van-swipe-item>
      </van-swipe>
    </div>

    <!-- ===== 主内容 ===== -->
    <div class="main-layout">
      <!-- 左侧菜单 -->
      <aside class="sidebar">
        <nav class="nav-menu">
          <div class="nav-item" :class="{ active: currentCategory === '全部工具' }" @click="switchCategory('全部工具')">
            <span class="nav-icon">📋</span>
            <span class="nav-label">全部工具</span>
          </div>

          <div class="nav-divider"></div>

          <div class="nav-item" :class="{ active: currentCategory === '总经办' }" @click="switchCategory('总经办')">
            <span class="nav-icon">🏢</span>
            <span class="nav-label">总经办</span>
          </div>
          <div class="nav-item" :class="{ active: currentCategory === '人事行政' }" @click="switchCategory('人事行政')">
            <span class="nav-icon">👔</span>
            <span class="nav-label">人事行政</span>
          </div>
          <div class="nav-item" :class="{ active: currentCategory === '财务法务' }" @click="switchCategory('财务法务')">
            <span class="nav-icon">💰</span>
            <span class="nav-label">财务法务</span>
          </div>
          <div class="nav-item" :class="{ active: currentCategory === '市场销售' }" @click="switchCategory('市场销售')">
            <span class="nav-icon">📊</span>
            <span class="nav-label">市场销售</span>
          </div>
          <div class="nav-item" :class="{ active: currentCategory === '技术项目' }" @click="switchCategory('技术项目')">
            <span class="nav-icon">🔧</span>
            <span class="nav-label">技术项目</span>
          </div>
          <div class="nav-item" :class="{ active: currentCategory === '其它工具' }" @click="switchCategory('其它工具')">
            <span class="nav-icon">📦</span>
            <span class="nav-label">其它工具</span>
          </div>

          <div class="nav-divider"></div>

          <div class="nav-item" @click="goDeveloper">
            <span class="nav-icon">🛠️</span>
            <span class="nav-label">工具工坊</span>
          </div>
          <div class="nav-item" @click="goSettings">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">设置</span>
          </div>
        </nav>
      </aside>

      <!-- 右侧工具区 -->
      <main class="tool-area">
        <!-- 搜索栏（仅全部工具时显示） -->
        <div v-if="currentCategory === '全部工具'" class="search-bar-compact">
          <van-search
            v-model="searchQuery"
            shape="round"
            placeholder="描述想法，帮找工具..."
            @clear="clearSearch"
            @input="doSearch"
            class="compact-search"
          />
          <span v-if="searchQuery" class="search-result-hint">
            找到 <strong>{{ filteredTools.length }}</strong> 个相关工具
          </span>
        </div>

        <!-- 分类标题 -->
        <div class="category-title">
          <span class="title-icon">{{ categoryIcon }}</span>
          <span class="title-text">{{ currentCategory }}</span>
          <span class="title-count">{{ filteredTools.length }} 个工具</span>
        </div>

        <!-- 工具卡片网格 -->
        <div class="tool-grid">
          <ToolCard
            v-for="tool in filteredTools"
            :key="tool.id"
            :tool="tool"
            :disabled="tool.status === 'archived'"
          />
          <div v-if="filteredTools.length === 0" class="empty-state">
            <span class="empty-icon">📭</span>
            <p>该分类下暂无工具</p>
            <span class="empty-hint">去「全部工具」看看其他工具吧</span>
          </div>
        </div>
      </main>
    </div>

    <!-- ===== 底部 ===== -->
    <footer class="footer">
      <span class="footer-company">深圳数智元科技有限公司</span>
      <span class="footer-divider">|</span>
      <span class="footer-link">官网：www.shuzhi.com</span>
      <span class="footer-divider">|</span>
      <span class="footer-link">客服：0755-XXXX</span>
      <span class="footer-divider">|</span>
      <span class="footer-link footer-feedback" @click="showFeedback">意见反馈</span>
    </footer>

    <LoginModal v-model:show="showLoginModal" @login-success="onLoginSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import { useToolStore } from '@/stores/tool'
import ToolCard from '@/components/ToolCard.vue'
import LoginModal from '@/components/LoginModal.vue'

const router = useRouter()
const userStore = useUserStore()
const toolStore = useToolStore()

const currentCategory = ref('全部工具')
const searchQuery = ref('')
const showLoginModal = ref(false)

const currentDate = computed(() => {
  const now = new Date()
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} 周${days[now.getDay()]}`
})

const noticeMessages = ref([
  '合同初审工具已上线，欢迎体验！',
  '老板的牛马员工，员工的摸鱼神器 —— 数智办公',
  '行业动态报告已更新，点击查看最新资讯',
  '标书自动编制工具升级至 v1.1，生成速度提升50%'
])

const categoryIconMap = {
  '全部工具': '📋',
  '总经办': '🏢',
  '人事行政': '👔',
  '财务法务': '💰',
  '市场销售': '📊',
  '技术项目': '🔧',
  '其它工具': '📦'
}
const categoryIcon = computed(() => categoryIconMap[currentCategory.value] || '📦')

const filteredTools = computed(() => {
  if (searchQuery.value && currentCategory.value === '全部工具') {
    return toolStore.searchTools(searchQuery.value)
  }
  return toolStore.getToolsByCategory(currentCategory.value)
})

const switchCategory = (category) => {
  currentCategory.value = category
  if (category !== '全部工具') {
    searchQuery.value = ''
  }
}

const doSearch = () => {}
const clearSearch = () => { searchQuery.value = '' }

const handleUserAction = () => {
  if (userStore.isGuest) showLoginModal.value = true
}

const handleRecharge = () => {
  if (userStore.isAdmin) {
    showToast('跳转充值页')
  } else {
    userStore.remindAdmin()
  }
}

const goSettings = () => router.push('/settings')
const goDeveloper = () => router.push('/developer')

const showNotifications = () => {
  showDialog({
    title: '📢 通知',
    message: '暂无新通知',
    confirmButtonText: '知道了'
  })
}

const showFeedback = () => {
  showDialog({
    title: '💬 意见反馈',
    message: '请发送邮件至：feedback@shuzhi.com\n或拨打客服：0755-XXXX',
    confirmButtonText: '知道了'
  })
}

const onLoginSuccess = (userData) => {
  userStore.fullLogin(userData)
  showToast({ message: '登录成功', icon: 'success' })
}

onMounted(() => {
  userStore.initFromCache()
  toolStore.loadTools()
})
</script>

<style lang="scss" scoped>
$primary: #4A90D9;
$primary-light: #6BA8E8;
$primary-gradient: linear-gradient(135deg, #4A90D9 0%, #6BA8E8 100%);
$sidebar-width: 190px;
$bg: #F7F8FC;

.home-page {
  min-height: 100vh;
  background: $bg;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 28px;
  background: #fff;
  border-bottom: 1px solid #f0f2f5;
  flex-shrink: 0;

  .header-left {
    display: flex;
    flex-direction: column;
    .logo {
      display: flex;
      align-items: center;
      gap: 6px;
      .logo-icon { font-size: 28px; }
      .logo-text {
        font-size: 20px;
        font-weight: 800;
        background: $primary-gradient;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .logo-version {
        font-size: 11px;
        color: #BCC8D4;
        background: #F0F2F5;
        padding: 0 10px;
        border-radius: 12px;
      }
    }
    .logo-sub {
      font-size: 12px;
      color: #BCC8D4;
      margin-top: -2px;
      padding-left: 34px;
    }
  }

  .header-center {
    text-align: center;
    .company-name {
      font-size: 16px;
      font-weight: 600;
      color: #2C3E50;
    }
    .company-date {
      font-size: 12px;
      color: #8C9DAB;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    .user-name {
      font-size: 14px;
      font-weight: 500;
      color: #2C3E50;
      cursor: pointer;
      .user-role {
        font-size: 11px;
        color: $primary;
        background: rgba(74,144,217,0.1);
        padding: 0 10px;
        border-radius: 12px;
        margin-left: 4px;
      }
    }
    .credit-badge {
      font-size: 15px;
      font-weight: 700;
      color: #52C41A;
      background: #F6FFED;
      padding: 2px 16px;
      border-radius: 20px;
      border: 1px solid #B7EB8F;
      &.credit-low {
        color: #FF6B6B;
        background: #FFF1F0;
        border-color: #FFCCC7;
      }
    }
    .header-icon {
      color: #8C9DAB;
      cursor: pointer;
      transition: color 0.2s;
      &:hover { color: $primary; }
    }
  }
}

.notice-bar {
  display: flex;
  align-items: center;
  padding: 6px 28px;
  background: rgba(74,144,217,0.04);
  border-bottom: 1px solid #f0f2f5;
  flex-shrink: 0;
  .notice-icon { font-size: 14px; margin-right: 10px; flex-shrink: 0; }
  .notice-swipe {
    flex: 1;
    height: 24px;
    .notice-text {
      font-size: 13px;
      color: #5A6C7D;
      line-height: 24px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: $sidebar-width;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #f0f2f5;
  padding: 12px 0;
  overflow-y: auto;

  .nav-menu {
    .nav-item {
      display: flex;
      align-items: center;
      padding: 10px 20px;
      cursor: pointer;
      transition: all 0.2s;
      color: #5A6C7D;
      border-right: 3px solid transparent;
      &:hover { background: #F7F8FC; }
      &.active {
        background: rgba(74,144,217,0.06);
        color: $primary;
        font-weight: 600;
        border-right-color: $primary;
      }
      .nav-icon { font-size: 16px; margin-right: 10px; width: 24px; text-align: center; }
      .nav-label { font-size: 14px; flex: 1; }
    }
    .nav-divider {
      height: 1px;
      background: #f0f2f5;
      margin: 8px 16px;
    }
  }
}

.tool-area {
  flex: 1;
  padding: 16px 28px 24px;
  overflow-y: auto;
}

.search-bar-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 24px;
  padding: 2px 8px 2px 18px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(74,144,217,0.06);

  .compact-search {
    flex: 1;
    padding: 0;
    :deep(.van-search__content) {
      background: transparent;
      border: none;
      padding: 4px 0;
    }
    :deep(.van-field__control) {
      font-size: 14px;
      height: 34px;
    }
    :deep(.van-field__left-icon) {
      display: none;
    }
  }
  .search-result-hint {
    font-size: 13px;
    color: #8C9DAB;
    white-space: nowrap;
    padding-right: 8px;
    strong { color: $primary; }
  }
}

.category-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  .title-icon { font-size: 22px; }
  .title-text {
    font-size: 18px;
    font-weight: 700;
    color: #2C3E50;
  }
  .title-count {
    font-size: 13px;
    color: #8C9DAB;
    margin-left: auto;
  }
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 16px;
  .empty-icon { font-size: 56px; display: block; margin-bottom: 12px; }
  p { font-size: 16px; color: #5A6C7D; margin: 0; }
  .empty-hint { font-size: 14px; color: #BCC8D4; display: block; margin-top: 6px; }
}

.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 10px 28px;
  background: #fff;
  border-top: 1px solid #f0f2f5;
  font-size: 13px;
  color: #8C9DAB;
  flex-shrink: 0;
  .footer-divider { color: #E8ECF0; }
  .footer-link { color: #8C9DAB; cursor: default; }
  .footer-feedback {
    cursor: pointer;
    &:hover { color: $primary; }
  }
}

@media (max-width: 768px) {
  .sidebar { width: 56px; }
  .sidebar .nav-label { display: none; }
  .sidebar .nav-item { padding: 10px 12px; justify-content: center; .nav-icon { margin-right: 0; } }
  .header .header-center .company-name { font-size: 13px; }
  .header .header-center .company-date { font-size: 11px; }
  .tool-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  .header .header-right .user-name { display: none; }
  .header .header-left .logo-sub { display: none; }
  .search-bar-compact { flex-wrap: wrap; padding: 6px 12px; }
}
</style>