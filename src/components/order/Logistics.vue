<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  orderNo: {
    type: String,
    default: ''
  },
  orderAddress: {
    type: String,
    default: ''
  },
  orderStatus: {
    type: Number,
    default: 0
  },
  logisticsInfo: {
    type: Object,
    default: () => ({})
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
        <div class="order-status" :class="getStatusClass(orderStatus)">
          {{ getStatusText(orderStatus) }}
        </div>
        <div class="order-no">
          订单号：{{ orderNo }}
        </div>
      </div>

      <!-- 货车动画 -->
      <div class="car">
        <!-- From Uiverse.io by vinodjangid07 -->
        <div class="loader">
          <div class="truckWrapper">
            <div class="truckBody">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 198 93" class="trucksvg">
                <path stroke-width="3" stroke="#282828" fill="#F83D3D"
                  d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z">
                </path>
                <path stroke-width="3" stroke="#282828" fill="#7D7C7C"
                  d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z">
                </path>
                <path stroke-width="2" stroke="#282828" fill="#282828"
                  d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z">
                </path>
                <rect stroke-width="2" stroke="#282828" fill="#FFFCAB" rx="1" height="7" width="5" y="63" x="187">
                </rect>
                <rect stroke-width="2" stroke="#282828" fill="#282828" rx="1" height="11" width="4" y="81" x="193">
                </rect>
                <rect stroke-width="3" stroke="#282828" fill="#DFDFDF" rx="2.5" height="90" width="121" y="1.5" x="6.5">
                </rect>
                <rect stroke-width="2" stroke="#282828" fill="#DFDFDF" rx="2" height="4" width="6" y="84" x="1"></rect>
              </svg>
            </div>
            <div class="truckTires">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" class="tiresvg">
                <circle stroke-width="3" stroke="#282828" fill="#282828" r="13.5" cy="15" cx="15"></circle>
                <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" class="tiresvg">
                <circle stroke-width="3" stroke="#282828" fill="#282828" r="13.5" cy="15" cx="15"></circle>
                <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
              </svg>
            </div>
            <div class="road"></div>

            <svg xml:space="preserve" viewBox="0 0 453.459 453.459" xmlns:xlink="http://www.w3.org/1999/xlink"
              xmlns="http://www.w3.org/2000/svg" id="Capa_1" version="1.1" fill="#000000" class="lampPost">
              <path d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993
c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514
c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16
c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914
h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75
v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795
V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z
M232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017
h78.747C231.693,100.736,232.77,106.162,232.77,111.694z"></path>
            </svg>
          </div>
        </div>

      </div>

      <!-- 物流信息 -->
      <div>
        <div>
          {{ '收货地址：' + orderAddress }}
        </div>
        <div v-for="item in logisticsInfo" :key="item.id">
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 核心遮罩层样式 */
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

/* 弹窗主体核心样式 */
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

/* 订单头部（状态+订单号） */
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

/* 订单状态颜色（保留核心状态） */
.status-pending-pay {
  color: #e64340;
}

.status-pending-ship {
  color: #f97316;
}

.status-shipping {
  color: #38bdf8;
}

.status-signed,
.status-completed {
  color: #22c55e;
}

.status-pending-eval {
  color: #f97316;
}

.status-cancelled {
  color: #999;
}

.order-no {
  font-size: 13px;
  color: #999;
}

/* 核心动画（淡入+上滑） */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

/* 移动端适配（核心） */
@media (max-width: 480px) {
  .order-detail-modal {
    padding: 12px;
  }
}

/* 货车动画样式 */
.loader {
  width: fit-content;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
}

.truckWrapper {
  width: 200px;
  height: 100px;
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: center;
  justify-content: flex-end;
  overflow-x: hidden;
}

/* truck upper body */
.truckBody {
  width: 130px;
  height: fit-content;
  margin-bottom: 6px;
  animation: motion 1s linear infinite;
}

/* truck suspension animation*/
@keyframes motion {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(3px);
  }

  100% {
    transform: translateY(0px);
  }
}

/* truck's tires */
.truckTires {
  width: 130px;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 10px 0px 15px;
  position: absolute;
  bottom: 0;
}

.truckTires svg {
  width: 24px;
}

.road {
  width: 100%;
  height: 1.5px;
  background-color: #282828;
  position: relative;
  bottom: 0;
  align-self: flex-end;
  border-radius: 3px;
}

.road::before {
  content: "";
  position: absolute;
  width: 20px;
  height: 100%;
  background-color: #282828;
  right: -50%;
  border-radius: 3px;
  animation: roadAnimation 1.4s linear infinite;
  border-left: 10px solid white;
}

.road::after {
  content: "";
  position: absolute;
  width: 10px;
  height: 100%;
  background-color: #282828;
  right: -65%;
  border-radius: 3px;
  animation: roadAnimation 1.4s linear infinite;
  border-left: 4px solid white;
}

.lampPost {
  position: absolute;
  bottom: 0;
  right: -90%;
  height: 90px;
  animation: roadAnimation 1.4s linear infinite;
}

@keyframes roadAnimation {
  0% {
    transform: translateX(0px);
  }

  100% {
    transform: translateX(-350px);
  }
}
</style>