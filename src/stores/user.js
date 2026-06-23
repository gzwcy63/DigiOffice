import { defineStore } from 'pinia'

const STORAGE_KEY = 'shuzhi_user_cache'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 登录态：'guest' | 'half' | 'full'
    loginState: 'guest',
    // 用户信息
    userInfo: {
      id: null,
      phone: '',
      name: '',
      avatar: '',
      department: '',
      position: '',
      role: 'employee', // admin | employee | platform_admin
      tenantId: null,
      tenantName: ''
    },
    // 积分（仅登录后有效）
    credits: 0,
    // 游客设备指纹（模拟）
    deviceId: ''
  }),

  getters: {
    isGuest: (state) => state.loginState === 'guest',
    isHalf: (state) => state.loginState === 'half',
    isFull: (state) => state.loginState === 'full',
    isAdmin: (state) => state.userInfo.role === 'admin',
    isPlatformAdmin: (state) => state.userInfo.role === 'platform_admin',
    displayName: (state) => {
      if (state.loginState === 'guest') return '点击登录'
      return state.userInfo.name || '用户'
    },
    // 剩余积分是否低于预警线（<10）
    isCreditsLow: (state) => state.credits < 10 && state.credits > 0,
    isCreditsZero: (state) => state.credits === 0 && state.loginState !== 'guest'
  },

  actions: {
    // 初始化：从本地缓存读取半登录态
    initFromCache() {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        try {
          const data = JSON.parse(cached)
          // 如果有缓存且未过期（7天有效期）
          if (data.expireAt > Date.now()) {
            this.loginState = 'half'
            this.userInfo = data.userInfo
            this.credits = data.credits || 1000
            // 自动填充到store，等待用户点"一键登录"
            return true
          }
        } catch (e) {}
      }
      // 游客模式
      this.loginState = 'guest'
      this.credits = 100 // 游客赠送积分
      this.deviceId = 'device_' + Date.now().toString(36)
      return false
    },

    // 一键登录（半登录态 -> 完全登录态）
    quickLogin() {
      // 模拟登录成功
      this.loginState = 'full'
      // 更新缓存
      this.saveCache()
    },

    // 完整登录（游客 -> 完全登录态，或半登录态补全）
    fullLogin(userData) {
      this.loginState = 'full'
      this.userInfo = { ...this.userInfo, ...userData }
      this.credits = userData.credits || 1000
      this.saveCache()
    },

    // 登出
    logout() {
      this.loginState = 'guest'
      this.userInfo = { id: null, phone: '', name: '', avatar: '', department: '', position: '', role: 'employee', tenantId: null, tenantName: '' }
      this.credits = 100
      localStorage.removeItem(STORAGE_KEY)
    },

    // 保存缓存（供下次半登录使用）
    saveCache() {
      if (this.loginState === 'full' || this.loginState === 'half') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          userInfo: this.userInfo,
          credits: this.credits,
          expireAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天
        }))
      }
    },

    // 扣减积分（由工具调用后触发）
    deductCredits(amount) {
      if (this.loginState === 'guest') {
        this.credits -= amount
        if (this.credits < 0) this.credits = 0
        return true
      } else {
        this.credits -= amount
        if (this.credits < 0) this.credits = 0
        this.saveCache()
        return true
      }
    },

    // 提醒管理员充值（员工用）
    remindAdmin() {
      // 模拟发送通知
      alert('📢 已向公司管理员发送充值提醒！')
    }
  }
})