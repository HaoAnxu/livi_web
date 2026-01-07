<script setup>
import { queryUserInfoApi } from "@/api/user.js";
import { onMounted, ref, computed } from "vue";
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";
import { useRouter } from "vue-router";
import { verifyIsLoginApi } from "@/api/wecommunity.js";
import { queryOrderApi, queryLogisticsApi } from "@/api/shop.js";
import OrderComment from "@/components/order/OrderComment.vue";
import OrderDetail from "@/components/order/OrderDetail.vue";
import Logistics from "@/components/order/Logistics.vue";

const router = useRouter();
const userInfo = ref({})
const userId = ref(0)

const queryUserInfo = async () => {
  MyLoading.value = true;
  const loginUser = sessionStorage.getItem("loginUser");
  userId.value = JSON.parse(loginUser).userId
  try {
    const result = await queryUserInfoApi(userId.value);
    if (result.code) {
      userInfo.value = result.data;
    } else {
      MyMessage.error(result.msg);
    }
  } catch (e) {
    MyMessage.error('用户信息获取失败');
  } finally {
    MyLoading.value = false;
  }
}

const isLogin = async () => {
  const result = await verifyIsLoginApi();
  if (!result.code) {
    MyMessage.error('请先登录！');
    await router.push('/login');
  }
}

const orderList = ref([])
const sortRule = ref('all');
const DTO = ref({
  userId: '', 
  sortRule: '',
  page: 1,
  pageSize: 10,
})
const total = ref(0)
const queryOrderList = async () => {
  MyLoading.value = true;
  DTO.value.userId = userId.value;
  try {
    const result = await queryOrderApi(DTO.value);
    if (result.code) {
      orderList.value = result.data.rows || [];
      total.value = result.data.total || 0;
    } else {
      MyMessage.error(result.msg || '订单查询失败');
    }
  } catch (e) {
    MyMessage.error(e.message || '订单查询失败');
  } finally {
    MyLoading.value = false;
  }
};

const showDetail = ref(false);
const orderDetail = ref({})
const viewDetail = (order) => {
  orderDetail.value = orderList.value.find(item => item.orderId === order.orderId) || {};
  showDetail.value = true;
};

const confirmReceive = (order) => {
  MyMessage.success(`确认收货：${order.orderId}`);
};

//评价弹窗
const evaluateVisible = ref(false);
const evaluateDTO = ref({
  userId: 0,
  orderId: 0,
  goodsId: 0,
})
const evaluate = (orderId, goodsId, userId) => {
  evaluateVisible.value = true;
  evaluateDTO.value.orderId = orderId;
  evaluateDTO.value.goodsId = goodsId;
  evaluateDTO.value.userId = userId;
};

//物流弹窗
const logisticsVisible = ref(false);
const logisticsOrderNo = ref('')
const logisticsAddress = ref('')
const orderStatus = ref(0)
const viewLogistics = async (order) => {
  console.log('当前订单数据：', order);
  logisticsOrderNo.value = order.orderNo || '';
  logisticsAddress.value = order.orderAddress || '';
  orderStatus.value = order.orderStatus || 0;
  logisticsVisible.value = true;
  await queryLogisticsList();
};

//物流详情
const logisticsInfo = ref({})
const queryLogisticsList = async()=>{
  if (!logisticsOrderNo.value) {
    MyMessage.warn('订单号为空，无法查询物流');
    logisticsInfo.value = {};
    return;
  }
  console.log('查询物流的订单号：', logisticsOrderNo.value);
  MyLoading.value = true
  try{
    const result = await queryLogisticsApi(logisticsOrderNo.value)
    if(result.code){
      logisticsInfo.value = result.data || {};
    }else{
      MyMessage.error(result.msg || '物流信息查询失败');
      logisticsInfo.value = {};
    }
  }catch(error){
    MyMessage.error(error.message || '物流接口请求失败');
    logisticsInfo.value = {};
  }finally{
    MyLoading.value = false;
  }
}

const handleTabChange = (type) => {
  sortRule.value = type;
  DTO.value.sortRule = type;
  queryOrderList();
};

const getOrderStatusText = (status) => {
  switch (status) {
    case 0: return '待付款';
    case 1: return '待发货';
    case 2: return '待收货';
    case 3: return '已完成';
    case 4: return '待评价';
    case 5: return '已完成';
    case 6: return '已取消';
    default: return '未知状态';
  }
};

const hasMoreOrders = computed(() => {
  return DTO.value.page < Math.ceil(total.value / DTO.value.pageSize);
});
const loadMoreOrders = async () => {
  if (!hasMoreOrders.value) {
    MyMessage.warn('没有更多订单了');
    return;
  }
  DTO.value.page++;
  await queryOrderList();
};

onMounted(async () => {
  await isLogin();
  await queryUserInfo();
  await queryOrderList();
})
</script>

<template>

  <OrderDetail :order="orderDetail" :visible="showDetail" @close="showDetail = false" />
  <OrderComment :visible="evaluateVisible" :userId="evaluateDTO.userId" :orderId="evaluateDTO.orderId"
    :goodsId="evaluateDTO.goodsId" @close="evaluateVisible = false" />
  <Logistics :visible="logisticsVisible" :orderNo="logisticsOrderNo" :orderAddress="logisticsAddress"
        :orderStatus="orderStatus" :logisticsInfo="logisticsInfo"
        @close="logisticsVisible = false" />

  <div class="page-wrapper">
    <div class="bg"></div>
    <button class="home-btn" @click="router.push('/')">
      回到首页
    </button>

    <div class="user-center-container">
      <!-- 左侧 -->
      <div class="user-info-sidebar">
        <!-- 左侧基础信息 -->
        <div class="info-card basic-info">
          <div class="avatar-box">
            <div class="avatar" :style="{ backgroundImage: userInfo.avatar ? `url(${userInfo.avatar})` : 'none' }">
              <span v-if="!userInfo.avatar">{{ userInfo.username ? userInfo.username.charAt(0) : '用' }}</span>
            </div>
          </div>
          <div class="user-base">
            <h3 class="username">{{ userInfo.username || '未设置用户名' }}</h3>
            <div class="gender-tag" :class="{ 'male': userInfo.gender === 1, 'female': userInfo.gender === 0 }">
              {{ userInfo.gender === 1 ? '男' : userInfo.gender === 0 ? '女' : '未设置' }}
            </div>
            <p class="signature">{{ userInfo.signature || '这个人很懒，什么都没留下～' }}</p>
          </div>
        </div>
        <!-- 左侧账号信息 -->
        <div class="info-card account-info">
          <div class="card-title">账号信息</div>
          <div class="info-list">
            <div class="info-item">
              <span class="label">邮箱</span>
              <span class="value">{{ userInfo.email || '未绑定' }}</span>
            </div>
            <div class="info-item">
              <span class="label">注册时间</span>
              <span class="value">{{ userInfo.createTime ? userInfo.createTime.split('T')[0] : '未知' }}</span>
            </div>
          </div>
        </div>
        <!-- 左侧预留模块 -->
        <div class="info-card reserve-module">
          <div class="card-title">更多功能</div>
          <div class="reserve-content">
            <p>开发中</p>
          </div>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="user-function-main">
        <!-- 右侧快捷功能 -->
        <div class="function-card menu-card">
          <div class="card-title">快捷功能</div>
          <div class="menu-list">
            <div class="menu-item">
              <span class="icon">✏️</span>
              <span class="text">编辑个人资料</span>
            </div>
            <div class="menu-item">
              <span class="icon">📸</span>
              <span class="text">更换头像</span>
            </div>
            <div class="menu-item">
              <span class="icon">📧</span>
              <span class="text">绑定/修改邮箱</span>
            </div>
            <div class="menu-item">
              <span class="icon">🔒</span>
              <span class="text">修改密码</span>
            </div>
            <div class="menu-item">
              <span class="icon">⚙️</span>
              <span class="text">账号设置</span>
            </div>
          </div>
        </div>
        <!-- 右侧我的订单 -->
        <div class="function-card content-card">
          <div class="card-title">我的订单</div>

          <div class="order-tabs">
            <div class="tab-item" :class="{ active: sortRule === 'all' }" @click="handleTabChange('all')">
              全部
            </div>
            <div class="tab-item" :class="{ active: sortRule === 'pending_pay' }"
              @click="handleTabChange('pending_pay')">
              待付款
            </div>
            <div class="tab-item" :class="{ active: sortRule === 'pending_ship' }"
              @click="handleTabChange('pending_ship')">
              待发货
            </div>
            <div class="tab-item" :class="{ active: sortRule === 'shipping' }" @click="handleTabChange('shipping')">
              待收货
            </div>
            <div class="tab-item" :class="{ active: sortRule === 'signed' }" @click="handleTabChange('signed')">
              已完成
            </div>
            <div class="tab-item" :class="{ active: sortRule === 'pending_eval' }"
              @click="handleTabChange('pending_eval')">
              待评价
            </div>
            <div class="tab-item" :class="{ active: sortRule === 'cancelled' }" @click="handleTabChange('cancelled')">
              已取消
            </div>
          </div>

          <div class="order-list">
            <div class="order-item" v-for="order in orderList" :key="order.orderId">
              <div class="order-header">
                <div class="order-status">
                  {{ getOrderStatusText(order.orderStatus) }}
                </div>
                <div class="order-no">{{ order.orderNo }}</div>
              </div>

              <div class="order-goods">
                <img class="goods-img" :src="order.goodsDetailVO.goodsThumbnail" alt="商品图片">
                <div class="goods-info">
                  <div class="goods-detail">
                    <div class="goods-name">{{ order.goodsDetailVO.goodsName }}</div>
                    <div class="goods-model">{{ order.goodsModelName }}</div>
                    <div class="goods-style">{{ order.goodsStyleName }}</div>
                  </div>
                  <div class="shop-name"> <svg t="1767678269473" class="icon" viewBox="0 0 1024 1024" width="40"
                      height="40">
                      <path
                        d="M952.786158 352.800941c0-0.516042-0.172014-0.860071-0.172014-1.376113-0.344028-1.892155-0.860071-3.612296-1.548127-5.332437L875.895851 159.285066c-13.073072-38.703175-50.22812-62.441122-93.919704-62.613136L255.440954 96.67193c-44.207626 0-78.610449 23.565933-90.995464 60.720981L83.770872 347.984546c-0.344028 1.204099-0.860071 2.752226-1.204099 4.472367-5.84848 18.061482-8.77272 36.466991-8.77272 55.044515 0 65.193348 35.778935 124.71023 93.231648 155.328742 0 0 0 0 0 0s0 0 0 0l0 0c0 0 0 0 0 0 23.565933 12.55703 51.432219 18.921552 82.738787 18.921552 52.464304-0.172014 101.144297-23.221905 134.34302-62.78515 33.026709 39.219217 81.19066 62.097094 133.654964 62.441122 51.948261-0.344028 100.112212-23.393919 132.966907-62.613136 33.198723 39.563245 81.878717 62.441122 134.687049 62.441122 31.994625-0.172014 60.204939-6.880564 84.1149-19.953637 56.592642-30.96254 91.683521-90.135394 91.683521-154.640685C961.386864 388.235847 958.29061 369.658324 952.786158 352.800941zM839.084831 505.377457c-14.449185 7.912649-32.510667 12.040988-53.668402 12.040988-39.047203 0-74.48211-19.781623-95.295817-53.324374-1.548127-3.096254-3.956325-8.428691-8.600706-13.417101-5.332437-5.84848-14.793214-12.901058-30.618512-12.901058-12.729044 0-24.25399 5.160423-30.790526 13.245087-4.300353 4.816395-6.70855 9.63279-8.428691 13.245087-20.469679 33.198723-55.732572 53.15236-93.919704 53.324374-38.703175-0.172014-73.966068-20.125651-94.607761-53.496388-1.376113-2.92424-3.78431-7.912649-7.568621-12.040988-14.965228-17.889467-48.679993-17.029397-61.753066-1.376113-4.816395 5.332437-7.396607 10.664875-8.944734 14.277171-20.641693 33.198723-56.248614 52.980346-94.951789 53.15236-20.641693 0-38.359147-3.956325-52.636318-11.524945l0 0c0 0 0 0 0 0-36.639006-19.437594-59.344868-57.452713-59.344868-98.908114 0-12.213002 2.064169-24.598018 6.192508-36.639006 0.344028-0.860071 0.516042-1.892155 0.688056-2.752226l79.470519-187.839409c1.548127-4.816395 6.536536-19.437594 31.306568-19.437594l526.707206 0c10.148833 0.688056 27.694272 2.408198 33.88678 20.641693l74.310096 185.259197c0.344028 1.376113 0.688056 2.580212 1.032085 3.612296 4.128339 12.040988 6.192508 24.25399 6.192508 36.466991C897.397615 447.924744 875.03578 485.595834 839.084831 505.377457z"
                        fill="#f97316"></path>
                      <path
                        d="M862.994793 607.897867c-17.717453 0-31.994625 14.277171-31.994625 31.994625l0 174.594322c0 9.976818-8.084663 18.061482-18.061482 18.061482l-602.049387 0.344028c-9.976818 0-18.061482-8.084663-18.061482-17.889467l-0.172014-171.498068c0-17.717453-14.449185-31.994625-31.994625-31.994625 0 0 0 0 0 0-17.717453 0-31.994625 14.449185-31.994625 31.994625l0.172014 171.498068c0 45.067697 36.81102 81.878717 82.050731 81.878717l602.221401-0.344028c45.067697-0.172014 81.878717-36.81102 81.878717-82.050731l0-174.594322C894.989417 622.347052 880.712246 607.897867 862.994793 607.897867z"
                        fill="#f97316"></path>
                      <path
                        d="M768.043004 383.935495 255.956996 383.935495c-17.717453 0-31.994625-14.277171-31.994625-31.994625 0-17.717453 14.277171-31.994625 31.994625-31.994625l511.913993 0c17.717453 0 31.994625 14.277171 31.994625 31.994625C800.037628 369.658324 785.588443 383.935495 768.043004 383.935495z"
                        fill="#f97316"></path>
                    </svg>{{ order.goodsDetailVO.goodsDept }}</div>
                  <div class="price-num">
                    <div class="goods-price">¥{{ order.orderPrice }}</div>
                    <div class="goods-num">x{{ order.goodsNum }}</div>
                  </div>
                </div>
              </div>

              <div class="order-actions">
                <button class="order-btn" @click="viewLogistics(order)">查看物流</button>
                <button class="order-btn" @click="viewDetail(order)">查看详情</button>
                <button class="order-btn primary" v-if="order.orderStatus === 2" @click="confirmReceive(order)">
                  确认收货
                </button>
                <button class="order-btn primary" v-if="order.orderStatus === 4"
                  @click="evaluate(order.orderId, order.goodsId, order.userId)">
                  评价
                </button>
              </div>
            </div>

            <!-- 分页 -->
            <div class="load-more" v-if="hasMoreOrders">
              <button class="order-btn" @click="loadMoreOrders">加载更多</button>
            </div>

            <div class="empty" v-if="orderList.length === 0">
              <div class="empty-icon">📦</div>
              <div class="empty-text">暂无订单</div>
            </div>
          </div>
        </div>
        <!-- 右侧系统服务 -->
        <div class="function-card service-card">
          <div class="card-title">系统服务</div>
          <div class="service-list">
            <div class="service-item">
              <span class="icon">❓</span>
              <span class="text">帮助中心</span>
            </div>
            <div class="service-item">
              <span class="icon">📞</span>
              <span class="text">联系客服</span>
            </div>
            <div class="service-item">
              <span class="icon">📝</span>
              <span class="text">意见反馈</span>
            </div>
            <div class="service-item">
              <span class="icon">🚪</span>
              <span class="text">退出登录</span>
            </div>
          </div>
        </div>
        <!-- 右侧预留功能区 -->
        <div class="function-card reserve-card">
          <div class="card-title">更多功能</div>
          <div class="reserve-content">
            <p>开发中</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('@/assets/CSS/userCenter/homeBtn.css');
@import url('@/assets/CSS/userCenter/main.css');

.icon {
  vertical-align: middle;
  /* 对齐文字 */
  width: 20px;
  height: 20px;
  padding-right: 5px;
}

/* 右侧功能操作区 */
.user-function-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 右侧快捷功能菜单 */
.menu-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.menu-item:hover {
  background: #bce9ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.1);
}

.menu-item .icon {
  font-size: 18px;
  color: #f97316;
}

.menu-item .text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 右侧系统服务模块 */
.service-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.service-item:hover {
  background: #f8f9fa;
}

.service-item .icon {
  font-size: 16px;
  color: #666;
}

.service-item .text {
  font-size: 14px;
  color: #333;
}

/* 右侧预留功能区 */
.reserve-card .reserve-content {
  padding: 32px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
  border: 1px dashed #e0e0e0;
  border-radius: 8px;
  margin-top: 8px;
}

/* 订单模块样式 */
.content-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 订单分类标签 */
.order-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.tab-item {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: #666;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-item.active {
  color: #e64340;
  border-bottom-color: #e64340;
  font-weight: 600;
}

.tab-item:hover {
  color: #e64340;
}

/* 订单列表 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 1600px;
  padding: 16px 0;
}

/* 单个订单条目 */
.order-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

/* 订单头部 */
.order-header {
  padding: 12px 16px;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-status {
  font-size: 14px;
  font-weight: 600;
  color: #e64340;
}

.order-no {
  font-size: 12px;
  color: #999;
}

/* 订单商品信息 */
.order-goods {
  padding: 5px;
  display: flex;
  gap: 12px;
}

.goods-img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
  background-color: #f5f5f5;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-detail {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.goods-model {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.goods-style {
  font-size: 12px;
  color: #999;
  margin-left: 5px;
}

.goods-name {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.shop-name {
  font-size: 13px;
  color: #ff8c27;
  margin-bottom: 8px;
}

.price-num {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  font-size: 16px;
  font-weight: 600;
  color: #e64340;
}

.goods-num {
  font-size: 12px;
  color: #999;
}

/* 订单操作按钮 */
.order-actions {
  padding: 12px 16px;
  border-top: 1px solid #f5f5f5;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.order-btn {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #ddd;
  background: #fff;
  color: #666;
}

.order-btn.primary {
  border-color: #e64340;
  background: #e64340;
  color: #fff;
}

.order-btn:hover {
  opacity: 0.9;
}

/* 空订单状态 */
.empty {
  padding: 48px 0;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: #ddd;
  display: block;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.load-more {
  padding: 12px 0;
  text-align: center;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .page-wrapper {
    padding: 0;
  }

  .home-btn {
    padding: 14px 32px;
    font-size: 14px;
    top: 15px;
    right: 15px;
  }

  .user-center-container {
    grid-template-columns: 1fr;
    margin-top: 50px;
    gap: 16px;
  }

  .menu-list {
    grid-template-columns: 1fr;
  }

  .reserve-module {
    display: none;
  }

  /* 移动端订单样式 */
  .content-card {
    border-radius: 0;
    padding: 12px;
    margin: 0;
  }

  .order-item {
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
  }

  .goods-img {
    width: 70px;
    height: 70px;
  }

  .order-actions {
    padding: 10px 12px;
  }

  .order-btn {
    padding: 5px 12px;
    font-size: 11px;
  }

  .page-wrapper {
    width: 100%;
    overflow-x: hidden;
  }
}
</style>