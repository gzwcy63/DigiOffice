import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
// Vant 样式在 Vant 4.x 中直接引入组件会自动加载样式，不需要手动引入 index.scss
import Vant from 'vant'
import 'vant/lib/index.css' // 用 CSS 版本替代 SCSS

import App from './App.vue'
import routes from './router'

const app = createApp(App)
const pinia = createPinia()
const router = createRouter({
  history: createWebHistory(),
  routes
})

app.use(pinia)
app.use(router)
app.use(Vant)

app.config.errorHandler = (err) => {
  console.error('全局错误:', err)
}

app.mount('#app')