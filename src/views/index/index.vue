<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import router from '@/router'
// 控制开场动画显示状态
const showSplash = ref(true)

//观察者实例
let observer = null;

// 商品列表数据
const products = [
  { id: 1, title: '家用多功能料理锅 不粘锅底', price: 89.9, originalPrice: 129.9, sales: '2.3万' },
  { id: 2, title: '无线蓝牙耳机 超长续航降噪', price: 79.9, originalPrice: 159.9, sales: '5.8万' },
  { id: 3, title: '纯棉短袖T恤 宽松百搭男女款', price: 29.9, originalPrice: 89.9, sales: '10.2万' },
  { id: 4, title: '迷你加湿器 办公室桌面静音', price: 39.9, originalPrice: 69.9, sales: '1.5万' },
  { id: 5, title: '快充数据线 适用苹果安卓', price: 9.9, originalPrice: 29.9, sales: '8.7万' },
  { id: 6, title: '厨房置物架 多层收纳省空间', price: 59.9, originalPrice: 99.9, sales: '3.1万' },
  { id: 7, title: '保温杯 316不锈钢大容量', price: 49.9, originalPrice: 89.9, sales: '4.2万' },
  { id: 8, title: '懒人抹布 一次性吸水不掉毛', price: 19.9, originalPrice: 39.9, sales: '6.5万' },
  { id: 9, title: '手机支架 折叠升降多角度', price: 15.9, originalPrice: 35.9, sales: '7.8万' },
  { id: 10, title: '防雾眼镜布 清洁湿巾一次性', price: 12.9, originalPrice: 25.9, sales: '2.9万' },
  { id: 11, title: '车载香薰 持久淡香除异味', price: 25.9, originalPrice: 49.9, sales: '1.8万' },
  { id: 12, title: '收纳箱 大号加厚整理储物', price: 35.9, originalPrice: 69.9, sales: '5.3万' }
];

//懒加载核心函数
const initModuleLazyLoad = () => {
  // 获取所有模块元素
  const modules = document.querySelectorAll('.module-row')

  // 配置观察者选项（语法：对象字面量）
  const observerOptions = {
    root: null, // 使用浏览器视口作为根容器（null 是默认值）
    rootMargin: '50px 0px', // 触发阈值外扩50px（提前触发动画），语法："上 右 下 左"
    threshold: 0.1 // 元素10%进入视口时触发回调，取值 0-1
  }

  // 创建 IntersectionObserver 实例（核心API）
  // 语法：new IntersectionObserver(回调函数, 配置选项)
  observer = new IntersectionObserver((entries) => {
    // entries 是被观察元素的状态数组
    entries.forEach(entry => {
      // entry.isIntersecting：布尔值，元素是否进入视口
      if (entry.isIntersecting) {
        // 给元素添加动画类（触发CSS动画）
        entry.target.classList.add('module-animated')
        // 只触发一次：停止观察当前元素
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // 遍历所有模块，开启观察（语法：observer.observe(元素)）
  modules.forEach(module => {
    observer.observe(module)
  })
}

// 页面挂载后执行动画逻辑
onMounted(() => {
  // 3.5秒后隐藏开场动画
  setTimeout(() => {
    showSplash.value = false
    setTimeout(() => {
      initModuleLazyLoad()
    }, 500)
  }, 3500)
})
// 页面卸载后
onUnmounted(() => {
  if (observer) {
    observer.disconnect()//断开观察者连接
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
                    {{ product.title }}
                  </h3>
                  <div class="product-price">
                    <span class="price">¥{{ product.price }}</span>
                    <span class="original-price">¥{{ product.originalPrice }}</span>
                  </div>
                  <div class="product-sales">已售 {{ product.sales }}</div>
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