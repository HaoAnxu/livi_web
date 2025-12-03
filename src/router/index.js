import { createRouter, createWebHistory } from 'vue-router'
// 导入页面组件
import IndexView from '@/views/index/index.vue'
import LayoutView from '@/views/layout/layout.vue'
import LoginView from '@/views/login/login.vue'
import RegisterView from '@/views/register/register.vue'
import CartView from '@/views/cart/cart.vue'
import WeCommunityView from '@/views/weCommunity/weCommunity.vue'
import ChatRoomView from "@/views/weCommunity/ChatRoom.vue";
import UserCenterView from '@/views/userCenter/userCenter.vue'
import SmartHomeView from '@/views/smartHome/smartHome.vue'
import ShopView from '@/views/shop/shop.vue'
import ShortVideoView from '@/views/shortVideo/shortVideo.vue'
import MusicView from '@/views/music/music.vue'
import AIView from '@/views/AI/ai.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path:'/',
            component:LayoutView,
            redirect:'/index',//重定向
            children:[
                {path:'index',name:'index',component:IndexView},
                {path:'cart',name:'cart',component:CartView},
                {path:'weCommunity',name:'weCommunity',component:WeCommunityView},
                {path:'chatRoom',name:'chatRoom',component:ChatRoomView},
                {path:'smartHome',name:'smartHome',component:SmartHomeView},
                {path:'shop',name:'shop',component:ShopView},
                {path:'shortVideo',name:'shortVideo',component:ShortVideoView},
                {path:'music',name:'music',component:MusicView},
                {path:'ai',name:'ai',component:AIView}
            ]
        },
        {path:'/userCenter',name:'userCenter',component:UserCenterView},
        {path:'/login',name:'login',component:LoginView},
        {path:'/register',name:'register',component:RegisterView}
    ],
})

export default router
