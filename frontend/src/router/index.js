import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/user/Login.vue'
import Join from '../views/user/Join.vue'
import FeedMain from '../views/feed/IndexFeed.vue'
import Components from '../views/Components.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/user/join',
    name: 'Join',
    component: Join,
  },
  {
    path: '/feed/main',
    name: 'FeedMain',
    component: FeedMain,
  },
  {
    path: '/components',
    name: 'Components',
    component: Components,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
