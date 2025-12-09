<script setup>
import {ref, onMounted} from "vue"
import {useRouter} from 'vue-router'
import {MyLoading} from "@/utils/MyLoading.js"
import MyMessage from "@/utils/MyMessage.js"
import {
  getAllDeviceInfoListByUserIdApi,
  deleteDeviceByDeviceIdApi,
} from "@/api/device.js"

const router = useRouter()
const deviceInfoList = ref([])
const userId = ref('')

// 默认设备图片（device.deviceImage为空时显示）
const defaultDeviceImg = ref("https://img07.360buyimg.com/n1/jfs/t1/195432/36/26345/105678/64836f57Fe5f6a7b8/0e1f2a3b4c5d6e7f.jpg");

// 获取用户设备列表
const getDeviceInfoList = async () => {
  MyLoading.value = true;
  const loginUser = JSON.parse(sessionStorage.getItem('loginUser'));
  if (!loginUser) {
    MyMessage.error('请先登录');
    router.push('/login');
    MyLoading.value = false;
    return;
  }
  userId.value = loginUser.userId;
  const result = await getAllDeviceInfoListByUserIdApi(userId.value);
  if (result.code) {
    deviceInfoList.value = result.data || [];
    MyLoading.value = false;
  } else {
    MyMessage.error(result.msg);
    deviceInfoList.value = [];
    MyLoading.value = false;
  }
}

// 跳转设备控制页
const toDeviceControl = (deviceId) => {
  router.push({
    name: 'deviceControl',
    query: {deviceId: deviceId}
  })
}

// 删除设备（带确认弹窗）
const deleteDevice = async (deviceId) => {
  MyLoading.value = true;
  const result = await deleteDeviceByDeviceIdApi(deviceId);
  if (result.code) {
    MyMessage.success(result.msg);
    await getDeviceInfoList();
    MyLoading.value = false;
  } else {
    MyMessage.error(result.msg);
    MyLoading.value = false;
  }
}

// 页面挂载时加载设备列表
onMounted(() => {
  getDeviceInfoList();
})
</script>

<template>
  <div class="device-container">
    <!-- 页面标题区 -->
    <div class="page-header">
      <h2>我的智能设备</h2>
    </div>

    <!-- 设备列表区（含空状态） -->
    <div class="device-list">
      <div class="device-card" v-for="device in deviceInfoList" :key="device.deviceId">
        <!-- 设备图片（直接用device.deviceImage） -->
        <div class="device-img">
          <img :src="device.deviceImage || defaultDeviceImg" alt="设备图片">
          <!-- 状态色点（v-if判断） -->
          <div class="status-dot" v-if="device.deviceStatus === 0" style="background-color: #ff4d4f;"></div>
          <div class="status-dot" v-else-if="device.deviceStatus === 1" style="background-color: #52c41a;"></div>
          <div class="status-dot" v-else-if="device.deviceStatus === 2" style="background-color: #faad14;"></div>
          <div class="status-dot" v-else-if="device.deviceStatus === 3" style="background-color: #1890ff;"></div>
          <div class="status-dot" v-else style="background-color: #999;"></div>
        </div>

        <!-- 设备信息模块（状态v-if直接显示） -->
        <div class="device-info">
          <h3 class="device-name">{{ device.deviceName }}</h3>
          <div class="info-row">
            <span class="label">设备类型：</span>
            <span class="value">{{ device.deviceType }}</span>
          </div>
          <div class="info-row">
            <span class="label">设备状态：</span>
            <span class="value" v-if="device.deviceStatus === 0" style="color: #ff4d4f;">关闭</span>
            <span class="value" v-else-if="device.deviceStatus === 1" style="color: #52c41a;">执行中</span>
            <span class="value" v-else-if="device.deviceStatus === 2" style="color: #faad14;">异常</span>
            <span class="value" v-else-if="device.deviceStatus === 3" style="color: #1890ff;">待执行</span>
            <span class="value" v-else style="color: #999;">未知状态</span>
          </div>
          <div class="info-row">
            <span class="label">添加时间：</span>
            <span class="value">{{ device.createTime || '暂无' }}</span>
          </div>
        </div>

        <!-- 操作按钮模块 -->
        <div class="device-actions">
          <button class="control-btn" @click="toDeviceControl(device.deviceId)">
            控制设备
          </button>
          <el-popconfirm
              title="确定要删除吗？"
              @confirm="deleteDevice(device.deviceId)"
          >
            <template #reference>
              <button class="delete-btn">
                删除
              </button>
            </template>
          </el-popconfirm>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div class="empty-state" v-if="deviceInfoList.length === 0">
        <img
            src="https://img11.360buyimg.com/imagetools/jfs/t1/215743/33/25289/101784/647e1337F6b6a0044/8f093d4d2f590e85.png"
            alt="暂无设备">
        <p>暂无智能设备</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 核心样式 */
.device-container {
  width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 页面标题区 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.page-header h2 {
  font-size: 20px;
  color: #333;
  font-weight: 600;
}

/* 设备列表区 */
.device-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.device-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.device-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 设备图片区 */
.device-img {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.device-img img {
  width: 100%;
  height: 100%;
  object-fit: fill;
  transition: transform 0.3s;
}

.device-card:hover .device-img img {
  transform: scale(1.05);
}

/* 状态色点 */
.status-dot {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

/* 设备信息区 */
.device-info {
  padding: 16px;
}

.device-name {
  font-size: 16px;
  color: #333;
  font-weight: 600;
  margin-bottom: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-row {
  display: flex;
  font-size: 13px;
  margin-bottom: 8px;
  color: #666;
}

.info-row .label {
  width: 70px;
  color: #999;
}

.info-row .value {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 操作按钮区 */
.device-actions {
  display: flex;
  padding: 0 16px 16px;
  gap: 8px;
}

.control-btn {
  flex: 1;
  background-color: #fff;
  color: #ff4400;
  border: 1px solid #ff4400;
  padding: 8px 0;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.control-btn:hover {
  background-color: #fff6f2;
}

.delete-btn {
  width: 60px;
  background-color: #fff;
  color: #999;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-btn:hover {
  color: #ff4d4f;
  border-color: #ffccc7;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #999;
  font-size: 14px;
}

.empty-state img {
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
  opacity: 0.6;
  object-fit: fill;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .device-container {
    width: 95%;
  }
}

@media (max-width: 768px) {
  .device-list {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  .device-img {
    height: 150px;
  }
}
</style>