<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import router from '@/router'
import { getHotGoodsApi } from '@/api'
import { MyLoading } from "@/utils/MyLoading.js"
import MyMessage from "@/utils/MyMessage.js"

// 设置全局动画显示状态存储,如果不存在则设置为true
if(!sessionStorage.getItem('animation_index')) {
  sessionStorage.setItem('animation_index',true)
}
if(!sessionStorage.getItem('animation_WC')) {
  sessionStorage.setItem('animation_WC',true)
}
if(!sessionStorage.getItem('animation_WP')) {
  sessionStorage.setItem('animation_WP',true)
}

// 控制开场动画显示状态
const showSplash = ref(sessionStorage.getItem('animation_index') === 'true')

// 观察者实例
let observer = null;

const products = ref([])
const getHotGoods = async () => {
  MyLoading.value = true
  try {
    const result = await getHotGoodsApi()
    if (result.code) {
      products.value = result.data
    } else {
      MyMessage.error(result.msg)
    }
  } catch (error) {
    MyMessage.error('获取热门商品失败，请稍后重试')
    console.error('获取热门商品接口报错：', error)
  } finally {
    MyLoading.value = false
  }
}

// 懒加载函数
const initModuleLazyLoad = () => {
  const modules = document.querySelectorAll('.module-row')
  const observerOptions = {
    root: null,
    rootMargin: '50px 0px',
    threshold: 0.1
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('module-animated')
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  modules.forEach(module => {
    observer.observe(module)
  })
}

// 页面挂载后执行动画逻辑
onMounted(() => {
  getHotGoods()

  if (showSplash.value) {
    // 首次加载
    setTimeout(() => {
      sessionStorage.setItem('animation_index', false)
      showSplash.value = false
      setTimeout(() => {
        initModuleLazyLoad()
      }, 500)
    }, 3500)
  } else {
    // 非首次加载
    showSplash.value = false
    initModuleLazyLoad()
  }
})

// 页面卸载后
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null;
  }
})
</script>

<template>
  <div class="app-container">
    <!-- 开场动画 -->
    <div v-if="showSplash" class="splash-screen">
      <div class="splash-content">
        <div class="logo-container">
          <h1 class="logo-main">LiVi</h1>
          <p class="logo-tagline">Smart Home · Intelligent Life</p>
        </div>
        <div class="logo-decoration">
          <span>智能生活的无限可能</span>
          <span>Simple & Elegant</span>
        </div>
      </div>
      <div class="decor-line top-line"></div>
      <div class="decor-line bottom-line"></div>
    </div>

    <!-- 主内容区 -->
    <div v-else class="main-wrapper">
      <!-- 页面标题 -->
      <header class="page-header">
        <div class="header-inner">
          <h1 class="main-title">LiVi Unity</h1>
          <p class="sub-title">团结改造家 · 定义智能新生活</p>
          <div class="title-divider"></div>
        </div>
      </header>

      <!-- 功能模块区域 -->
      <main class="main-content">
        <!-- LiVi商城模块 -->
        <div class="module-row mall-module">
          <div class="module-content">
            <!-- 商城模块标题 -->
            <div class="module-title mall-title">
              <h2 class="mall-main-title">LiVi商城</h2>
              <p class="mall-sub-title">精选智能好物 · 打造品质生活</p>
              <div class="title-decoration"></div>
            </div>
            <!-- 商品卡片容器 -->
            <div class="card-container">
              <!-- 商品卡片 -->
              <div class="product-card" v-for="product in products" :key="product.id">
                <div class="product-img-wrapper">
                  <img :src="`https://picsum.photos/180/120?random=${product.id}`" :alt="product.title"
                    class="product-img">
                </div>
                <div class="product-info">
                  <h3 class="product-title">
                    <span class="brand-tag">品牌</span>
                    {{ product.goodsName.length > 10 ? product.goodsName.substring(0, 10) + '...' : product.goodsName }}
                  </h3>
                  <div class="product-price">
                    <span class="price">¥{{ product.goodsPrice }}</span>
                    <span class="original-price">¥{{ product.goodsOriginalPrice }}</span>
                  </div>
                  <div class="product-sales">已售 {{ product.goodsSales }}</div>
                  <button class="btn" @click="router.push('/shop')">
                    <i class="animation"></i>查看详情<i class="animation"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 智能家居控制模块 -->
        <div class="module-row mall-module">
          <div class="module-content">
            <div class="module-title mall-title">
              <h2 class="mall-main-title">智能家居控制</h2>
              <p class="mall-sub-title">忙碌生活 · 多点简单</p>
              <div class="title-decoration"></div>
            </div>
            <div class="smart-control">
              <!-- 展示图片 -->
              <div class="stack">
                <div class="card">
                  <div class="image">
                    <img src="@/assets/image/control.png" alt="示例图片">
                  </div>
                </div>
              </div>
              <!-- 右侧气泡介绍框 -->
              <div class="control-intro">
                <div class="control-intro-area">
                  <h3>家庭智能设备信息</h3>
                  <p>属于您家庭的智能设备，只有您的家庭成员有权管理</p>
                  <button class="btn">立即体验</button>
                </div>
                <div class="control-intro-area">
                  <h3>智能设备操控</h3>
                  <p>您可以在平台上对其进行远程控制、定时设置、场景联动等操作。</p>
                  <button class="btn">立即体验</button>
                </div>
              </div>

            </div>
            <div class="smart-control">
              <!-- 展示图片 -->
              <div class="stack">
                <div class="card">
                  <div class="image">
                    <img src="@/assets/image/task.png" alt="示例图片">
                  </div>
                </div>
              </div>
              <!-- 右侧气泡介绍框 -->
              <div class="control-intro">
                <div class="control-intro-area">
                  <h3>定时任务</h3>
                  <p>您可以设置智能设备在特定时间自动执行任务，如打开灯、关闭空调等。</p>
                  <button class="btn">立即体验</button>
                </div>
                <div class="control-intro-area">
                  <h3>循环周期任务</h3>
                  <p>懒得每天设置？循环周期任务可以帮您自动完成。</p>
                  <button class="btn">立即体验</button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- WeCommunity -->
        <div class="module-row">
          <div class="module-content">
            <div class="module-title mall-title">
              <h2 class="mall-main-title">WeCommunity</h2>
              <p class="mall-sub-title">分享生活 · 连接世界</p>
              <div class="title-decoration"></div>
            </div>
          </div>
          <div class="WeCommunity">
            <!-- 社区介绍区域 -->
            <div class="community-intro">
              <h3 class="intro-title">LiVi Unity 社区</h3>
              <p class="intro-desc">
                这里是 LiVi 用户的专属交流空间，您可以分享使用心得、提出产品建议、解决设备问题，
                我们的客服团队也会实时在线为您解答疑惑。加入社区，与更多智能生活爱好者一起交流成长！
              </p>
            </div>

            <!-- 左侧聊天示例卡片 -->
            <div class="chat-card-wrapper">
              <div class="chat-card">
                <div class="chat-header">
                  <div class="h2">LiVi Unity官方一群</div>
                  <span class="online-tag">24小时在线</span> <!-- 新增：在线标识 -->
                </div>
                <div class="chat-body">
                  <div class="message incoming">
                    <p>所有用户都可以在这个群里交流，分享生活经验、问题和建议。</p>
                  </div>
                  <div class="message outgoing">
                    <p>我买的设备有点问题，怎么查询是否在保修期呢？</p>
                  </div>
                  <div class="message incoming">
                    <p>您提供订单号给我就好哦</p>
                  </div>
                  <div class="message outgoing"> <!-- 新增：补充对话，更真实 -->
                    <p>好的，订单号是LV20250518001，麻烦帮忙查一下~</p>
                  </div>
                  <div class="message incoming"> <!-- 新增：补充对话 -->
                    <p>查到啦！您的设备还在保修期内，可免费售后哦 😊</p>
                  </div>
                </div>
                <div class="chat-footer">
                  <input placeholder="说点什么？" type="text">
                  <button>发送</button>
                </div>
              </div>
            </div>

            <!-- 右侧按钮区域 -->
            <div class="community-actions">
              <ul>
                <li style="--i:#56CCF2;--j:#2F80ED;">
                  <span class="icon">💬</span>
                  <span class="title" @click="router.push('/weCommunity')">立刻出发！</span>
                </li>
                <li style="--i:#FF6B6B;--j:#FF8E8E;">
                  <span class="icon">📢</span>
                  <span class="title">查看公告</span>
                </li>
              </ul>
            </div>
          </div>
        </div>


        <div class="module-row"></div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('@/assets/CSS/index/main.css');
</style>