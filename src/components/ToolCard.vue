<template>
  <div class="tool-card" @click="handleClick">
    <!-- 来源标签（官方/第三方） -->
    <span class="source-tag" :class="tool.category === 'official' ? 'official' : 'third'">
      {{ tool.category === 'official' ? '官方' : '第三方' }}
    </span>

    <!-- 状态徽标（新上线/新升级） -->
    <span class="tag-badge" v-if="tool.tags && tool.tags.length > 0">
      {{ tool.tags[0] }}
    </span>

    <!-- 内容 -->
    <div class="card-body">
      <div class="card-icon">{{ tool.icon || '🧩' }}</div>
      <div class="card-name">{{ tool.name }}</div>
      <div class="card-desc">{{ tool.description }}</div>
    </div>

    <!-- 底部：生产者 + 日期 -->
    <div class="card-footer">
      <span class="developer">{{ tool.developer || '深圳数智元' }}</span>
      <span class="date">{{ currentDate }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  tool: { type: Object, required: true },
  disabled: { type: Boolean, default: false }
})

const router = useRouter()

const currentDate = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
})

const handleClick = () => {
  if (props.disabled) return
  router.push(`/tool/${props.tool.id}`)
}
</script>

<style lang="scss" scoped>
$primary: #4A90D9;
$card-shadow: 0 2px 12px rgba(74, 144, 217, 0.08);

.tool-card {
  position: relative;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px 16px 14px;
  box-shadow: $card-shadow;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid rgba(74, 144, 217, 0.06);
  display: flex;
  flex-direction: column;
  min-height: 140px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(74, 144, 217, 0.12);
  }

  &:active {
    transform: scale(0.97);
  }

  .source-tag {
    position: absolute;
    top: 12px;
    left: 12px;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 12px;
    border-radius: 12px;
    color: #fff;
    letter-spacing: 0.3px;
    &.official {
      background: $primary;
    }
    &.third {
      background: #FA8C16;
    }
  }

  .tag-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 12px;
    border-radius: 12px;
    color: #fff;
    background: #FF6B6B;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
    animation: pulse-glow 2s infinite;
  }

  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 8px;
    padding: 4px 0;

    .card-icon {
      font-size: 36px;
      line-height: 1.2;
      margin-bottom: 6px;
    }

    .card-name {
      font-size: 16px;
      font-weight: 700;
      color: #2C3E50;
      letter-spacing: 0.5px;
    }

    .card-desc {
      font-size: 13px;
      color: #5A6C7D;
      text-align: center;
      margin-top: 4px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid #F0F2F5;

    .developer {
      font-size: 12px;
      color: #8C9DAB;
    }

    .date {
      font-size: 11px;
      color: #BCC8D4;
    }
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    filter: grayscale(0.5);
  }
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.85; }
}
</style>