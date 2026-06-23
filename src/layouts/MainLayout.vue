<template>
  <div class="main-layout">
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
.main-content {
  flex: 1;
  overflow-y: auto;
}
</style>