import { createRouter, createWebHistory } from 'vue-router'
// 导入页面组件
import IndexView from '@/views/index/index.vue'
import LayoutView from '@/views/layout/layout.vue'
import LoginView from '@/views/login/login.vue'
import RegisterView from '@/views/register/register.vue'
import CartView from '@/views/cart/cart.vue'
import WeCommunityView from '@/views/weCommunity/weCommunity.vue'
import UserCenterView from '@/views/userCenter/userCenter.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
      {
          path:'/',
          component:LayoutView,
          redirect:'/index',//重定向
          children:[
              {path:'index',name:'index',component:IndexView},
              {path:'login',name:'login',component:LoginView},
              {path:'register',name:'register',component:RegisterView},
              {path:'cart',name:'cart',component:CartView},
              {path:'weCommunity',name:'weCommunity',component:WeCommunityView},
              {path:'userCenter',name:'userCenter',component:UserCenterView}
          ]
      }
  ],
})

export default router
