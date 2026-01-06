import { createRouter, createWebHistory } from 'vue-router'
// 导入页面组件
import IndexView from '@/views/index/Index.vue'
import LayoutView from '@/views/layout/Layout.vue'
import LoginView from '@/views/login/Login.vue'
import RegisterView from '@/views/register/Register.vue'
import WeCommunityView from '@/views/weCommunity/WeCommunity.vue'
import ChatRoomView from "@/views/weCommunity/ChatRoom.vue"
import UserCenterView from '@/views/userCenter/UserCenter.vue'
import SmartHomeView from '@/views/smartHome/SmartHome.vue'
import ShopView from '@/views/shop/Shop.vue'
import WePostIndexView from '@/views/wePost/WePostIndex.vue'
import DeviceControlView from '@/views/smartHome/DeviceControl.vue'
import CirclePostView from '@/views/wePost/CirclePost.vue'
import UserPostView from '@/views/wePost/UserPost.vue'
import PostDetailView from '@/views/wePost/PostDetail.vue'
import GoodsDetailView from '@/views/shop/GoodsDetail.vue'
import PayView from '@/views/shop/Pay.vue'
import MessageView from '@/views/message/Message.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: LayoutView,
            redirect: '/index',//重定向
            children: [
                { path: 'index', name: 'index', component: IndexView },
                { path: 'smartHome', name: 'smartHome', component: SmartHomeView },
                { path: 'deviceControl', name: 'deviceControl', component: DeviceControlView },
                { path: 'shop', name: 'shop', component: ShopView },
                { path: 'message', name: 'message', component: MessageView }
            ]
        },
        { path: '/userCenter', name: 'userCenter', component: UserCenterView },
        { path: '/wePost', name: 'wePost', component: WePostIndexView },
        { path: '/wePost/circlePost', name: 'circlePost', component: CirclePostView },
        { path: '/wePost/userPost', name: 'userPost', component: UserPostView },
        { path: '/wePost/postDetail', name: 'postDetail', component: PostDetailView },
        { path: '/weCommunity', name: 'weCommunity', component: WeCommunityView },
        { path: '/weCommunity/chatRoom', name: 'chatRoom', component: ChatRoomView },
        { path: '/login', name: 'login', component: LoginView },
        { path: '/register', name: 'register', component: RegisterView },
        { path: '/goodsDetail', name: 'goodsDetail', component: GoodsDetailView },
        { path: '/pay', name: 'pay', component: PayView }
    ],
})

export default router
