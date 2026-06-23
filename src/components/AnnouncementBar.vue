<template>
  <div class="announcement-bar" v-if="announcements.length > 0" @click="showDetail">
    <span class="icon">📢</span>
    <van-swipe class="swipe" vertical :autoplay="3000" :touchable="false">
      <van-swipe-item v-for="item in announcements" :key="item.id">
        <span class="text">{{ item.title }}</span>
      </van-swipe-item>
    </van-swipe>
    <span class="more">详情 ></span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showDialog } from 'vant'

// 模拟公告数据（后期由后台API获取）
const announcements = ref([
  { id: 1, title: '🎉 报销会计工具已升级V2.0，支持批量识别！' },
  { id: 2, title: '📢 图片生成工具（第三方）已上架，欢迎体验！' },
  { id: 3, title: '⚠️ 智能翻译工具将于下月下架，请留意。' }
])

const showDetail = () => {
  const content = announcements.value.map((a, i) => `${i+1}. ${a.title}`).join('\n')
  showDialog({
    title: '公告栏',
    message: content,
    confirmButtonText: '知道了'
  })
}
</script>

<style lang="scss" scoped>
.announcement-bar {
  display: flex;
  align-items: center;
  background: #f0f5ff;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
  border: 1px solid #d6e4ff;
  .icon {
    font-size: 16px;
    margin-right: 8px;
    flex-shrink: 0;
  }
  .swipe {
    flex: 1;
    height: 22px;
    .text {
      font-size: 14px;
      color: #1677ff;
      line-height: 22px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .more {
    font-size: 12px;
    color: #1677ff;
    flex-shrink: 0;
    cursor: pointer;
  }
}
</style>