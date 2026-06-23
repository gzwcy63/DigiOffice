import MainLayout from '@/layouts/MainLayout.vue'
import HomePage from '@/views/HomePage.vue'
import ToolContainer from '@/views/ToolContainer.vue'
import SettingsPage from '@/views/SettingsPage.vue'
import DeveloperCenter from '@/views/DeveloperCenter.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'Home', component: HomePage },
      { path: 'settings', name: 'Settings', component: SettingsPage }
    ]
  },
  {
    path: '/tool/:toolId',
    name: 'ToolContainer',
    component: ToolContainer,
    meta: { hideTab: true }
  },
  {
    path: '/developer',
    name: 'DeveloperCenter',
    component: DeveloperCenter,
    meta: { hideTab: true }
  }
]

export default routes