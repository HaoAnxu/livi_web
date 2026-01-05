<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { payApi, queryOrderPriceApi } from '@/api/shop'
import MyMessage from '@/utils/MyMessage.js'

const route = useRoute()
const router = useRouter()
const price = ref(0)
const orderNo = ref('')
// 选中的支付方式
const selectedPayMethod = ref('')

const payMethods = ref([
  {
    id: 'wechat',
    name: '微信支付',
    icon: '<svg t="1767601126220" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M337.387283 341.82659c-17.757225 0-35.514451 11.83815-35.514451 29.595375s17.757225 29.595376 35.514451 29.595376 29.595376-11.83815 29.595376-29.595376c0-18.49711-11.83815-29.595376-29.595376-29.595375zM577.849711 513.479769c-11.83815 0-22.936416 12.578035-22.936416 23.6763 0 12.578035 11.83815 23.676301 22.936416 23.676301 17.757225 0 29.595376-11.83815 29.595376-23.676301s-11.83815-23.676301-29.595376-23.6763zM501.641618 401.017341c17.757225 0 29.595376-12.578035 29.595376-29.595376 0-17.757225-11.83815-29.595376-29.595376-29.595375s-35.514451 11.83815-35.51445 29.595375 17.757225 29.595376 35.51445 29.595376zM706.589595 513.479769c-11.83815 0-22.936416 12.578035-22.936416 23.6763 0 12.578035 11.83815 23.676301 22.936416 23.676301 17.757225 0 29.595376-11.83815 29.595376-23.676301s-11.83815-23.676301-29.595376-23.6763z" fill="#28C445"></path><path d="M510.520231 2.959538C228.624277 2.959538 0 231.583815 0 513.479769s228.624277 510.520231 510.520231 510.520231 510.520231-228.624277 510.520231-510.520231-228.624277-510.520231-510.520231-510.520231zM413.595376 644.439306c-29.595376 0-53.271676-5.919075-81.387284-12.578034l-81.387283 41.433526 22.936416-71.768786c-58.450867-41.433526-93.965318-95.445087-93.965317-159.815029 0-113.202312 105.803468-201.988439 233.803468-201.98844 114.682081 0 216.046243 71.028902 236.023121 166.473989-7.398844-0.739884-14.797688-1.479769-22.196532-1.479769-110.982659 1.479769-198.289017 85.086705-198.289017 188.67052 0 17.017341 2.959538 33.294798 7.398844 49.572255-7.398844 0.739884-15.537572 1.479769-22.936416 1.479768z m346.265896 82.867052l17.757225 59.190752-63.630058-35.514451c-22.936416 5.919075-46.612717 11.83815-70.289017 11.83815-111.722543 0-199.768786-76.947977-199.768786-172.393063-0.739884-94.705202 87.306358-171.653179 198.289017-171.65318 105.803468 0 199.028902 77.687861 199.028902 172.393064 0 53.271676-34.774566 100.624277-81.387283 136.138728z" fill="#28C445"></path></svg>'
  },
  {
    id: 'alipay',
    name: '支付宝支付',
    icon: '<svg t="1767601266649" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M230.771014 576.556522c-12.614493 9.646377-25.228986 23.744928-28.93913 42.295652-5.194203 24.486957-0.742029 55.652174 22.26087 80.13913 28.93913 28.93913 72.718841 37.101449 92.011594 38.585508 51.2 3.710145 106.110145-22.26087 147.663768-50.457971 16.324638-11.130435 43.77971-34.133333 70.492754-69.750725-59.362319-30.423188-133.565217-64.556522-212.22029-61.588406-41.553623 1.484058-70.492754 9.646377-91.269566 20.776812zM983.188406 712.347826c25.971014-61.588406 40.811594-129.113043 40.811594-200.347826 0-281.971014-230.028986-512-512-512S0 230.028986 0 512s230.028986 512 512 512c170.666667 0 321.298551-83.849275 414.794203-212.22029C838.492754 768.742029 693.797101 696.023188 604.011594 652.985507c-42.295652 48.973913-105.368116 97.205797-176.602898 117.982609-44.521739 13.356522-85.333333 18.550725-126.886957 9.646377-42.295652-8.904348-72.718841-28.197101-90.527536-47.489855-8.904348-10.388406-19.292754-22.26087-27.455073-37.843479 0.742029 0.742029 0.742029 2.226087 0.742029 2.968116 0 0-4.452174-7.42029-7.420289-19.292753-1.484058-5.936232-2.968116-11.872464-3.710145-17.808696-0.742029-4.452174-0.742029-8.904348 0-12.614493-0.742029-7.42029 0-15.582609 1.484058-23.744927 4.452174-20.776812 12.614493-43.77971 35.617391-65.298551 48.973913-48.231884 115.014493-50.457971 149.147826-50.457971 50.457971 0.742029 138.017391 22.26087 212.22029 48.973913 20.776812-43.77971 34.133333-89.785507 42.295652-121.692754H304.973913v-33.391304h158.052174v-66.782609H272.324638v-34.133333h190.701449v-66.782609c0-8.904348 2.226087-16.324638 16.324638-16.324637h74.944927v83.107246h207.026087v33.391304H554.295652v66.782609H719.768116S702.701449 494.933333 651.501449 586.202899c115.014493 40.811594 277.518841 104.626087 331.686957 126.144927z m0 0" fill="#06B4FD"></path></svg>'
  },
  {
    id: 'bankcard',
    name: '银行卡支付',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="20" height="14" rx="2" fill="#4080FF"/><circle cx="7" cy="11" r="1" fill="white"/><circle cx="11" cy="11" r="1" fill="white"/><rect x="5" y="15" width="14" height="2" rx="1" fill="white"/><path d="M4 5h16v2H4z" fill="white" opacity="0.3"/></svg>'
  }
])

const getOrderPrice = async () => {
  orderNo.value = route.query.orderNo || ''
  if (!orderNo.value) {
    MyMessage.error('订单号不能为空')
    return
  }
  try {
    const result = await queryOrderPriceApi(orderNo.value)
    if (result.code) {
      price.value = result.data || 0
    } else {
      MyMessage.error(result.msg || '订单金额查询失败')
    }
  } catch (error) {
    MyMessage.error(error.message || '订单金额查询失败')
  }
}

// 选择支付方式
const selectPayMethod = (methodId) => {
  selectedPayMethod.value = methodId
}

const pay = async () => {
  // 验证是否选择了支付方式
  if (!selectedPayMethod.value) {
    MyMessage.error('请选择支付方式')
    return
  }
  
  try {
    const result = await payApi(orderNo.value, selectedPayMethod.value)
    if (result.code) {
      MyMessage.success(result.msg || '支付成功')
      router.replace({
        path: '/shop'
      })
    } else {
      MyMessage.error(result.msg || '支付失败')
    }
  } catch (error) {
    MyMessage.error(error.message || '支付请求失败')
  }
}

onMounted(() => {
  getOrderPrice()
})
</script>

<template>
  <div class="payment-container">
    <!-- 订单金额区域 -->
    <div class="order-amount">
      <p class="amount-label">订单金额</p>
      <p class="amount-value">¥{{ price }}</p>
    </div>

    <!-- 支付方式选择区域 -->
    <div class="pay-method">
      <p class="method-title">选择支付方式</p>
      <div class="method-list">
        <div 
          v-for="method in payMethods" 
          :key="method.id"
          class="method-item"
          :class="{ active: selectedPayMethod === method.id }"
          @click="selectPayMethod(method.id)"
        >
          <div class="method-icon" v-html="method.icon"></div>
          <div class="method-name">{{ method.name }}</div>
          <div class="method-check" v-if="selectedPayMethod === method.id">✓</div>
        </div>
      </div>
    </div>

    <!-- 支付按钮 - 选择支付方式后显示 -->
    <button 
      class="pay-btn" 
      @click="pay"
      v-show="selectedPayMethod"
    >
      立即支付
    </button>
    
    <!-- 未选择支付方式时的占位提示 -->
    <div class="pay-btn placeholder" v-show="!selectedPayMethod">
      请选择支付方式
    </div>
  </div>
</template>

<style scoped>
.payment-container {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 订单金额样式 */
.order-amount {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 20px;
}

.amount-label {
  font-size: 16px;
  color: #666;
  margin: 0 0 10px 0;
}

.amount-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

/* 支付方式样式 */
.pay-method {
  margin-bottom: 30px;
}

.method-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.method-item.active {
  border-color: #ff5a2c;
  background-color: #fff8f6;
}

.method-item:hover {
  border-color: #ff997a;
  background-color: #fffbf9;
}

.method-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.method-name {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.method-check {
  font-size: 18px;
  color: #ff5a2c;
  font-weight: bold;
  flex-shrink: 0;
}

/* 支付按钮样式 - 橙红色 */
.pay-btn {
  width: 100%;
  padding: 15px 0;
  background-color: #ff5a2c;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.pay-btn:hover {
  background-color: #e84a1f;
}

.pay-btn:active {
  background-color: #d13f17;
}

/* 占位按钮样式 */
.pay-btn.placeholder {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  pointer-events: none;
}

.pay-btn.placeholder:hover {
  background-color: #f5f5f5;
}
</style>