<script setup>
import {ref, onMounted, onUnmounted} from 'vue'
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

const initModuleLazyLoad =()=>{

}

// 页面挂载后执行动画逻辑
onMounted(() => {
  // 3.5秒后隐藏开场动画
  setTimeout(() => {
    showSplash.value = false
    setTimeout(()=>{
      initModuleLazyLoad()
    },500)
  }, 3500)
})
// 页面卸载后
onUnmounted(()=>{
  if(observer){
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
                  <img
                      :src="`https://picsum.photos/180/120?random=${product.id}`"
                      :alt="product.title"
                      class="product-img"
                  >
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

        <!-- 其他模块占位 -->
        <div class="module-row"></div>
        <div class="module-row"></div>
        <div class="module-row"></div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/CSS/Index/farmwork.css";
@import "@/assets/CSS/Index/animation.css";

/* 商城模块专属样式 */
.mall-title {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  padding: 15px 0;
}

.mall-main-title {
  font-size: 32px;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.mall-sub-title {
  font-size: 14px;
  color: #95a5a6;
  font-weight: 400;
}

.title-decoration {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #5B9BD5 50%, transparent 100%);
}

/* 商品卡片容器 */
.card-container {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  padding: 10px 0;
}

/* 商品卡片样式 */
.product-card {
  width: 100%;
  height: 280px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(187, 225, 250, 0.1) 0%, rgba(240, 248, 255, 0.3) 100%);
  border: 1px solid rgba(200, 200, 200, 0.2);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.product-card:hover {
  box-shadow: 0 8px 20px rgba(91, 155, 213, 0.15);
  transform: translateY(-5px);
  border-color: rgba(91, 155, 213, 0.3);
}

/* 商品图片样式 */
.product-img-wrapper {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  background-color: rgba(245, 245, 245, 0.6);
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

/* 商品信息样式 */
.product-info {
  padding: 0 4px;
}

.brand-tag {
  display: inline-block;
  padding: 2px 6px;
  margin-right: 6px;
  background-color: #FFD700;
  color: #000;
  border: 1px solid #000;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  line-height: 1;
  vertical-align: middle;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.product-title {
  font-size: 12px;
  color: #2c3e50;
  line-height: 1.4;
  height: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 6px;
  font-weight: 500;
}

.product-price {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.price {
  font-size: 15px;
  font-weight: 700;
  color: #e64340;
  margin-right: 5px;
}

.original-price {
  font-size: 10px;
  color: #95a5a6;
  text-decoration: line-through;
}

.product-sales {
  font-size: 10px;
  color: #7f8c8d;
  margin-bottom: 10px;
}

/* 按钮样式 */
.btn {
  outline: 0;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #5B9BD5 0%, #4A89DC 100%);
  width: 100%;
  border: 0;
  border-radius: 6px;
  box-shadow: 0 3px 8px rgba(91, 155, 213, 0.2);
  box-sizing: border-box;
  padding: 10px 12px;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover {
  background: linear-gradient(90deg, #4A89DC 0%, #3b79d0 100%);
  box-shadow: 0 5px 12px rgba(91, 155, 213, 0.3);
}

.btn .animation {
  border-radius: 100%;
  animation: ripple 0.6s linear infinite;
}
</style>