<script setup>
// 按钮点击事件（空置，仅作展示）
const viewDetail = () => {
  console.log('查看详情按钮被点击，暂未实现功能');
};

// 模拟商品数据（方便展示多行多列效果）
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
</script>

<template>
  <!-- 卡片容器：实现一行6个、上下两排布局 -->
  <div class="card-container">
    <!-- 循环渲染商品卡片 -->
    <div class="product-card" v-for="product in products" :key="product.id">
      <!-- 商品图片区域 -->
      <div class="product-img-wrapper">
        <img
            src="https://picsum.photos/180/120?random=1"
            alt="商品图片"
            class="product-img"
        >
      </div>
      <!-- 商品信息区域 -->
      <div class="product-info">
        <!-- 标题 + 品牌标签 -->
        <h3 class="product-title">
          <span class="brand-tag">品牌</span>
          {{ product.title }}
        </h3>
        <div class="product-price">
          <span class="price">¥{{ product.price }}</span>
          <span class="original-price">¥{{ product.originalPrice }}</span>
        </div>
        <div class="product-sales">已售 {{ product.sales }}</div>
        <!-- 查看详情按钮 -->
        <button class="btn" @click="viewDetail">
          <i class="animation"></i>查看详情<i class="animation"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 卡片容器：实现一行6列布局，响应式适配 */
.card-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  /* 一行6个，自动计算列宽，保留间距 */
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
  padding: 20px;
  box-sizing: border-box;
}

/* 卡片整体样式：缩小尺寸适配6列布局 */
.product-card {
  width: 100%;
  height: 280px; /* 整体高度缩小 */
  padding: 8px;
  /* 透明底色 + 淡蓝渐变装饰 */
  background: linear-gradient(135deg, rgba(187, 225, 250, 0.1) 0%, rgba(240, 248, 255, 0.3) 100%);
  /* 灰色边框装饰 */
  border: 1px solid rgba(200, 200, 200, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.product-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* 商品图片容器：缩小尺寸 */
.product-img-wrapper {
  width: 100%;
  height: 120px; /* 图片高度缩小 */
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 6px;
  background-color: rgba(245, 245, 245, 0.5);
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-img {
  transform: scale(1.02);
}

/* 商品信息区域 */
.product-info {
  padding: 0 2px;
}

/* 品牌标签：金底黑边 VIP风格 */
.brand-tag {
  display: inline-block;
  padding: 1px 4px;
  margin-right: 4px;
  background-color: #FFD700; /* 金色底色 */
  color: #000; /* 黑色文字 */
  border: 1px solid #000; /* 黑边 */
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  line-height: 1;
  vertical-align: middle;
}

/* 商品标题：适配缩小后的卡片 */
.product-title {
  font-size: 12px;
  color: #333;
  line-height: 1.3;
  height: 30px; /* 标题高度缩小 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 4px;
}

/* 价格样式：缩小字体 */
.product-price {
  display: flex;
  align-items: center;
  margin-bottom: 3px;
}

.price {
  font-size: 14px;
  font-weight: bold;
  color: #e64340;
  margin-right: 4px;
}

.original-price {
  font-size: 10px;
  color: #999;
  text-decoration: line-through;
}

.product-sales {
  font-size: 10px;
  color: #999;
  margin-bottom: 8px;
}

/* 按钮样式：适配缩小后的卡片 */
.btn {
  outline: 0;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  background: #5B9BD5;
  width: 100%;
  border: 0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .1);
  box-sizing: border-box;
  padding: 8px 10px; /* 按钮内边距缩小 */
  color: #fff;
  font-size: 10px; /* 按钮字体缩小 */
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  overflow: hidden;
  cursor: pointer;
}

.btn:hover {
  opacity: .95;
  background: #4A89DC;
}

.btn .animation {
  border-radius: 100%;
  animation: ripple 0.6s linear infinite;
}

@keyframes ripple {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.1), 0 0 0 10px rgba(255, 255, 255, 0.1), 0 0 0 20px rgba(255, 255, 255, 0.1), 0 0 0 30px rgba(255, 255, 255, 0.1);
  }

  100% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.1), 0 0 0 20px rgba(255, 255, 255, 0.1), 0 0 0 30px rgba(255, 255, 255, 0.1), 0 0 0 40px rgba(255, 255, 255, 0);
  }
}

/* 响应式适配：屏幕较小时自动调整列数 */
@media (max-width: 1200px) {
  .card-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .card-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>