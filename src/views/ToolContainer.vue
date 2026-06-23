<template>
  <div class="tool-container">
    <van-nav-bar :title="toolName" left-text="返回" left-arrow @click-left="$router.back()">
      <template #right>
        <span class="credit-display">💰 {{ userStore.credits }}</span>
      </template>
    </van-nav-bar>
    <div class="tool-body">
      <div v-if="loadError" class="error-state">
        <span style="font-size:48px;">⚠️</span>
        <p>{{ loadError }}</p>
        <van-button plain @click="$router.back()">返回首页</van-button>
      </div>
      <component
        v-else-if="currentComponent"
        :is="currentComponent"
        :user-info="userStore.userInfo"
        :tenant-info="{ name: userStore.userInfo.tenantName }"
        :credits="userStore.credits"
        :on-deduct="handleDeduct"
        :user-level="userLevel"
      />
      <div v-else class="loading-tool"><van-loading /> 加载中...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { useToolStore } from '@/stores/tool'

const route = useRoute()
const userStore = useUserStore()
const toolStore = useToolStore()

const toolId = computed(() => route.params.toolId)
const toolName = ref('')
const currentComponent = ref(null)
const loadError = ref('')

const userLevel = computed(() => {
  if (userStore.isGuest) return 'anonymous'
  if (userStore.credits > 0) return 'paid'
  return 'registered'
})

// 动态扫描所有工具目录下的 Vue 组件
// 使用 / 开头表示从项目根目录开始扫描
const componentModules = import.meta.glob('/tools/*/*.vue')

onMounted(async () => {
  try {
    const tool = toolStore.getToolById(toolId.value)
    if (!tool) {
      loadError.value = '工具不存在或已被下架'
      return
    }

    toolName.value = tool.name
    const dirName = tool._dir || tool.id

    console.log('🔍 查找组件:', `/tools/${dirName}/`)
    console.log('📋 所有组件路径:', Object.keys(componentModules))

    // 遍历所有匹配的组件
    let found = false
    for (const path in componentModules) {
      if (path.includes(`/tools/${dirName}/`)) {
        try {
          console.log('✅ 找到匹配组件:', path)
          const module = await componentModules[path]()
          currentComponent.value = module.default || Object.values(module)[0]
          found = true
          break
        } catch (e) {
          console.warn(`⚠️ 加载组件失败 (${path}):`, e.message)
        }
      }
    }

    if (!found) {
      loadError.value = `工具「${tool.name}」的组件未找到，可能正在开发中`
    }
  } catch (e) {
    loadError.value = '加载工具时发生异常，请稍后重试'
    console.error('工具加载异常:', e)
  }
})

const handleDeduct = (amount) => {
  try {
    userStore.deductCredits(amount)
    showToast(`消耗 ${amount} 积分`)
  } catch (e) {
    console.warn('积分扣除失败:', e)
  }
}
</script>

<style scoped>
.tool-container { height: 100vh; background: #f5f7fa; display: flex; flex-direction: column; }
.tool-body { flex: 1; overflow-y: auto; padding: 12px; display: flex; justify-content: center; align-items: center; }
.credit-display { font-size: 14px; font-weight: 600; color: #52c41a; }
.loading-tool { display: flex; justify-content: center; align-items: center; height: 200px; color: #999; gap: 10px; }
.error-state { text-align: center; color: #ff4d4f; }
.error-state p { margin: 12px 0; font-size: 16px; }
</style>