import { createRouter, createWebHistory } from 'vue-router'
// 导入页面组件
import IndexView from '@/views/index/index.vue'
import LayoutView from '@/views/layout/layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
      {
          path:'/',
          component:LayoutView,
          redirect:'/index',//重定向
          children:[
              {path:'index',name:'index',component:IndexView}
          ]
      }
  ],
})

export default router
