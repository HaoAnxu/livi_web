<script setup>
const props = defineProps({
  order: {
    type: Object,
    default: () => ({
      goodsDetailVO: {},
      goodsModelName: '',
      goodsStyleName: '',
      orderStatus: 0
    })
  },
  visible: {
    type: Boolean,
    default: false
  }
})

// 定义自定义事件
const emit = defineEmits(['close'])

// 订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待付款',
    1: '待发货',
    2: '待收货',
    3: '已签收',
    4: '待评价',
    5: '已完成',
    6: '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 订单状态样式类
const getStatusClass = (status) => {
  const classMap = {
    0: 'status-pending-pay',
    1: 'status-pending-ship',
    2: 'status-shipping',
    3: 'status-signed',
    4: 'status-pending-eval',
    5: 'status-completed',
    6: 'status-cancelled'
  }
  return classMap[status] || ''
}
</script>
<template>
  <div class="modal-mask" v-if="visible" @click="emit('close')">
    <!-- 订单详情弹窗主体 -->
    <div class="order-detail-modal" @click.stop>
      <!-- 关闭按钮 -->
      <div class="close-btn" @click="emit('close')">✕</div>

      <!-- 订单头部：状态+订单号 -->
      <div class="order-header">
        <div class="order-status" :class="getStatusClass(order.orderStatus)">
          {{ getStatusText(order.orderStatus) }}
        </div>
        <div class="order-no">
          订单号：{{ order.orderNo }}
        </div>
      </div>

      <!-- 商品信息区域 -->
      <div class="goods-section">
        <div class="goods-item">
          <img 
            class="goods-img" 
            :src="order.goodsDetailVO.goodsThumbnail" 
            alt="商品图片"
          >
          <div class="goods-info">
            <div class="goods-name">{{ order.goodsDetailVO.goodsName }}</div>
            <div class="goods-spec">
              <span>规格：{{ order.goodsModelName }} / {{ order.goodsStyleName }}</span>
              <span>数量：x{{ order.goodsNum }}</span>
            </div>
            <div class="shop-name">
              <svg class="shop-icon" viewBox="0 0 1024 1024" width="16" height="16">
                <path d="M839.08 505.38c-14.45 7.91-32.51 12.04-53.67 12.04-39.05 0-74.48-19.78-95.3-53.32-1.55-3.1-3.96-8.43-8.6-13.42-5.33-5.85-14.79-12.9-30.62-12.9-12.73 0-24.25 5.16-30.79 13.25-4.3 4.82-6.71 9.63-8.43 13.25-20.47 33.2-55.73 53.15-93.92 53.32-38.7-0.17-73.97-20.13-94.61-53.5-1.38-2.92-3.78-7.91-7.57-12.04-14.97-17.89-48.68-17.03-61.75-1.38-4.82 5.33-7.4 10.66-8.94 14.28-20.64 33.2-56.25 52.98-94.95 53.15-20.64 0-38.36-3.96-52.64-11.52-36.64-19.44-59.34-57.45-59.34-98.91 0-12.21 2.06-24.6 6.19-36.64l79.47-187.84c1.55-4.82 6.54-19.44 31.31-19.44l526.71 0c10.15 0.69 27.69 2.41 33.89 20.64l74.31 185.26c0.34 1.38 0.69 2.58 1.03 3.61 4.13 12.04 6.19 24.25 6.19 36.47 0 57.45-21.96 95.09-58.3 114.72z" fill="#f97316"/>
              </svg>
              {{ order.goodsDetailVO.goodsDept }}
            </div>
          </div>
        </div>
      </div>

      <!-- 订单信息区域 -->
      <div class="order-info-section">
        <div class="info-title">订单信息</div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">下单时间</span>
            <span class="value">{{ order.createTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">收货地址</span>
            <span class="value">{{ order.orderAddress || '未填写' }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单总价</span>
            <span class="value">¥{{ order.orderPrice }}</span>
          </div>
        </div>
      </div>

      <!-- 金额汇总 -->
      <div class="amount-summary">
        <div class="summary-item">
          <span>实付金额</span>
          <span class="amount">¥{{ order.orderPrice }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 遮罩层 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
  animation: fadeIn 0.3s ease forwards;
  backdrop-filter: blur(2px);
}

/* 弹窗主体 */
.order-detail-modal {
  width: 100%;
  max-width: 750px;
  background-color: #fff;
  border-radius: 16px 16px 0 0;
  padding: 16px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease forwards;
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  color: #666;
  z-index: 10;
}

.close-btn:hover {
  background-color: #e8e8e8;
}

/* 订单头部 */
.order-header {
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 16px;
  position: relative;
  padding-right: 40px;
}

.order-status {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

/* 状态颜色 */
.status-pending-pay { color: #e64340; }
.status-pending-ship { color: #f97316; }
.status-shipping { color: #38bdf8; }
.status-signed { color: #22c55e; }
.status-pending-eval { color: #f97316; }
.status-cancelled { color: #999; }
.status-completed { color: #22c55e; }

.order-no {
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-btn {
  font-size: 12px;
  color: #3182ce;
  cursor: pointer;
  padding: 2px 8px;
  background-color: #f0f9ff;
  border-radius: 4px;
}

/* 商品区域 */
.goods-section {
  margin-bottom: 20px;
}

.goods-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.goods-img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 15px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-spec {
  font-size: 13px;
  color: #999;
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.shop-name {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

.shop-icon {
  fill: #f97316;
}

.goods-price {
  font-size: 16px;
  font-weight: 600;
  color: #e64340;
  align-self: flex-start;
  margin-top: auto;
}

/* 订单信息区域 */
.order-info-section {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.info-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-item .label {
  color: #666;
}

.info-item .value {
  color: #333;
  text-align: right;
  flex: 1;
  margin-left: 16px;
}

/* 金额汇总 */
.amount-summary {
  padding: 16px;
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}

.summary-item .amount {
  font-weight: 700;
  color: #e64340;
}

/* 底部操作按钮 */
.order-actions {
  display: flex;
  gap: 8px;
  padding: 16px 0;
  justify-content: flex-end;
}

.action-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #ddd;
  background: #fff;
  color: #666;
  transition: all 0.2s;
}

.action-btn:hover {
  opacity: 0.9;
}

/* 按钮样式区分 */
.cancel-btn {
  border-color: #e64340;
  color: #e64340;
}

.pay-btn {
  background: #e64340;
  color: #fff;
  border-color: #e64340;
}

.confirm-btn {
  background: #f97316;
  color: #fff;
  border-color: #f97316;
}

.contact-btn {
  border-color: #3182ce;
  color: #3182ce;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* 移动端适配 */
@media (max-width: 480px) {
  .order-detail-modal {
    padding: 12px;
  }
  
  .goods-img {
    width: 100px;
    height: 100px;
  }
  
  .order-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .action-btn {
    flex: 1;
    min-width: 120px;
    text-align: center;
  }

  .goods-spec {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    font-size: 12px;
  }
}
</style>