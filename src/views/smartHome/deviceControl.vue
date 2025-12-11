<script setup>
import {
  getDeviceInfoByDeviceIdApi,
  changeDeviceStatusApi,
  deleteDeviceByDeviceIdApi,
  createTaskApi,
  getTaskListApi,
  stopTaskApi
} from "@/api/device.js"
import {ref, onMounted, watch} from "vue"
import {useRoute} from 'vue-router'
import {MyLoading} from "@/utils/MyLoading.js"
import MyMessage from "@/utils/MyMessage.js"


const route = useRoute()
const selectTime = ref('')
const deviceId = Number(route.query.deviceId);
const userId = JSON.parse(sessionStorage.getItem('loginUser')).userId
const taskInfo = ref({
  deviceId: 0,
  userId: 0,
  permit: 1,
  taskType: '',//long，once，for
  onceStartDate: '',
  forModel: '',//循环任务执行模式，day，week，month
  beginTime: '',
  endTime: ''
})
// 右侧面板显示/隐藏状态
const isRightShow = ref(false);

// 切换右侧面板显示状态
const toggleRightPanel = () => {
  isRightShow.value = !isRightShow.value;
  getTaskList();
};
watch(selectTime, (newVal, oldVal) => {
  taskInfo.value.beginTime = newVal[0]
  taskInfo.value.endTime = newVal[1]
})
//查询设备详情
const deviceDetail = ref({});
const getDeviceDetail = async () => {
  MyLoading.value = true;
  try {
    const result = await getDeviceInfoByDeviceIdApi(deviceId);
    if (result.code) {
      deviceDetail.value = result.data;
      MyLoading.value = false;
    } else {
      MyMessage.error(result.msg);
      MyLoading.value = false;
    }
  } catch (e) {
    MyLoading.value = false;
  }
}

//查询设备执行记录
const taskList = ref([])
const getTaskList = async () => {
  MyLoading.value = true;
  try {
    const result = await getTaskListApi(deviceId);
    if (result.code) {
      taskList.value = result.data;
      MyLoading.value = false;
    } else {
      MyMessage.error(result.msg);
      MyLoading.value = false;
    }
  } catch (e) {
    MyLoading.value = false;
  }
}

//长效任务处理，值和状态同步
const isRun = ref(false)
watch(() => deviceDetail.value.deviceStatus,
    (newVal) => {
      isRun.value = newVal === 1
    },
    {deep: true}
)
const changeDeviceStatus = async () => {
  if (!deviceId) {
    MyMessage.warn('设备ID为空，无法修改状态')
    return
  }
  MyLoading.value = true
  try {
    let int = isRun.value ? 1 : 0
    const result = await changeDeviceStatusApi(deviceId, int)
    if (result.code) {
      MyMessage.success(result.msg || '状态修改成功')
      deviceDetail.value.deviceStatus = isRun.value ? 1 : 0
      //打开时创建一条long类型定时任务
      if (isRun.value) {
        await createLongTask()
      } else {
        //关闭时停止long类型定时任务
        await stopTaskApi()
      }
    } else {
      MyMessage.error(result.msg || '状态修改失败')
      // 失败时回滚isRun，和本地状态一致
      isRun.value = deviceDetail.value.deviceStatus === 1
    }
  } catch (e) {
    MyMessage.error('网络异常，修改状态失败')
    isRun.value = deviceDetail.value.deviceStatus === 1
  } finally {
    MyLoading.value = false
  }
}

//创建长效设备任务
const createLongTask = async () => {
  taskInfo.value.deviceId = deviceId
  taskInfo.value.userId = userId
  taskInfo.value.taskType = 'long'
  taskInfo.value.beginTime = new Date().toLocaleTimeString()
  const result = await createTaskApi(taskInfo.value)
  if (result.code) {
    MyMessage.success(result.msg || '任务创建成功')
  } else {
    MyMessage.error(result.msg || '任务创建失败')
  }
}
//创建一次性设备任务
const createOnceTask = async () => {
  taskInfo.value.deviceId = deviceId
  taskInfo.value.userId = userId
  taskInfo.value.taskType = 'once'
}
//创建循环定时设备任务
const createForTask = async () => {
  taskInfo.value.deviceId = deviceId
  taskInfo.value.userId = userId
  taskInfo.value.taskType = 'for'
}
const getStatusClass = (status) => {
  return `status-${status}`;
}
onMounted(() => {
  getDeviceDetail();
  getTaskList();
})
</script>

<template>
  <!-- 整体容器 -->
  <div class="layout-container">
    <!-- 左右分栏核心布局 -->
    <div class="layout-wrapper">
      <!-- 左侧区域 -->
      <div class="left-panel">
        <div class="device-img-wrapper">
          <div class="device-img-container">
            <img
                v-if="deviceDetail.deviceImage"
                :src="deviceDetail.deviceImage"
                alt="设备图片"
                class="device-img"
            >
            <div v-else class="no-img-placeholder">暂无设备图片</div>
          </div>
        </div>
        <div class="device-info-list">
          <div class="info-row">
            <div class="info-item">
              <span class="label"><el-icon><InfoFilled/></el-icon>设备名称：</span>
              <span class="value">{{ deviceDetail.deviceName }}</span>
            </div>
            <div class="info-item">
              <span class="label"><el-icon><Menu/></el-icon>设备类型：</span>
              <span class="value">{{ deviceDetail.deviceType }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label"><el-icon><Tools/></el-icon>设备状态：</span>
              <span
                  class="value"
                  :class="getStatusClass(deviceDetail.deviceStatus)"
                  :style="{ color: deviceDetail.deviceStatus === 0 ? '#d1d1d1': deviceDetail.deviceStatus === 1 ? '#5dff44': deviceDetail.deviceStatus === 2 ? '#ff4d53': '#79baff'}">
  {{
                  deviceDetail.deviceStatus === 0 ? '关闭' : deviceDetail.deviceStatus === 1 ? '执行中' : deviceDetail.deviceStatus === 2 ? '异常' : '等待执行'
                }}
              </span>
            </div>
            <div class="info-item">
              <span class="label"><el-icon><Avatar/></el-icon>所属用户：</span>
              <span class="value">{{ deviceDetail.userName }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label"><el-icon><HomeFilled/></el-icon>所属家庭：</span>
              <span class="value">{{ deviceDetail.familyName }}</span>
            </div>
            <div class="info-item">
              <span class="label"><el-icon><HomeFilled/></el-icon>所属房间：</span>
              <span class="value">{{ deviceDetail.roomName }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item full-width">
              <span class="label"><el-icon><BellFilled/></el-icon>创建时间：</span>
              <span class="value">{{ deviceDetail.createTime }}</span>
            </div>
          </div>
        </div>
        <div class="button-container">
          <button class="animated-button" @click="toggleRightPanel">
            <svg xmlns="http://www.w3.org/2000/svg" class="arr-2" viewBox="0 0 24 24">
              <path
                  d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
              ></path>
            </svg>
            <span class="text">{{ isRightShow ? '查看任务' : '控制设备' }}</span>
            <span class="circle"></span>
            <svg xmlns="http://www.w3.org/2000/svg" class="arr-1" viewBox="0 0 24 24">
              <path
                  d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- 右侧区域-->
      <div class="right-panel">
        <div class="radio-inputs" v-if="isRightShow">
          <label class="radio">
            <input type="radio" name="radio" checked=""/>
            <span class="name">
              <span class="pre-name"></span>
              <span class="pos-name"></span>
              <span> 长效任务 </span>
            </span>
            <div class="content">
              <div>
                <div>控制设备执行状态</div>
                <!--长效任务开启/关闭开关，值变化就触发方法-->
                <div class="custom-reactor-widget">
                  <div class="custom-reactor-switch">
                    <input type="checkbox" id="custom-reactor" v-model="isRun" @change="changeDeviceStatus"/>
                    <label for="custom-reactor" aria-label="Reactor toggle">
                      <span class="custom-reactor-switch__core"></span>
                      <span class="custom-reactor-switch__beam"></span>
                      <span class="custom-reactor-switch__thumb"></span>
                      <span class="custom-reactor-switch__state custom-reactor-switch__state--off">OFF</span>
                      <span class="custom-reactor-switch__state custom-reactor-switch__state--on">ON</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </label>
          <label class="radio">
            <input type="radio" name="radio"/>
            <span class="name">
              <span class="pre-name"></span>
              <span class="pos-name"></span>
              <span> 循环定时任务 </span>
            </span>
            <div class="content">
              <div>
                <div>请创建设备任务</div>

              </div>
            </div>
          </label>
          <label class="radio">
            <input type="radio" name="radio"/>
            <span class="name">
              <span class="pre-name"></span>
              <span class="pos-name"></span>
              <span> 单次定时任务 </span>
            </span>
            <div class="content">
              <div>
                <div>请创建设备任务</div>
              </div>
            </div>
          </label>
        </div>

        <!-- 表格 -->
        <div class="task_detail" v-if="!isRightShow">
          <div class="task_title">
            <h2>设备任务记录</h2>
          </div>
          <!-- 表格容器 -->
          <div class="task-table-container">
            <table class="task-table">
              <!-- 表头 -->
              <thead>
              <tr>
                <th>序号</th>
                <th>任务类型</th>
                <th>任务状态</th>
                <th>循环模式</th>
                <th>开始时间</th>
                <th>结束时间</th>
                <th>创建时间</th>
              </tr>
              </thead>
              <!-- 表体 -->
              <tbody>
              <tr v-for="(item, index) in taskList" :key="index" class="task-table-row">
                <td>{{ index + 1 }}</td>
                <td>{{
                    item.taskType === 'for' ? '长效任务' : item.taskType === 'once' ? '单次定时任务' : '循环定时任务'
                  }}
                </td>
                <td>
                    <span class="status-tag" :class="getStatusClass(item.taskStatus)">
                      {{
                        item.taskStatus === 0 ? '终止' : item.taskStatus === 1 ? '待执行' : item.taskStatus === 2 ? '执行中' : '异常'
                      }}
                    </span>
                </td>
                <td>{{
                    item.taskType === 'for' ? (item.forModel === 'daily' ? '每天' : item.forModel === 'week' ? '每周' : '每月') : '-'
                  }}
                </td>
                <td>{{ item.beginTime }}</td>
                <td>{{ item.endTime }}</td>
                <td>{{ item.createTime }}</td>
              </tr>
              <!-- 空数据提示 -->
              <tr v-if="!taskList || taskList.length === 0" class="empty-row">
                <td colspan="8" class="empty-cell">暂无任务记录</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/CSS/DeviceControl/Switch.css";
@import "@/assets/CSS/DeviceControl/Button.css";
@import "@/assets/CSS/DeviceControl/main.css";

/* 整体布局容器 */
.layout-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

/* 左右分栏外层容器 */
.layout-wrapper {
  display: flex;
  gap: 20px;
  width: 100%;
  min-height: 500px; /* 最小高度，避免布局塌陷 */
}


/* 右侧区域 - 基础样式 + 淡入淡出动画 + 银白配色 */
.right-panel {
  flex: 2;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

  animation: rightPanelFadeIn 0.7s ease-out 0.2s;
  animation-fill-mode: both;
  opacity: 0;
}

.radio-inputs > .radio > .content {
  display: none;
  /* 新增：内容区域初始状态 */
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.radio-inputs > label.radio > input:checked ~ div.content {
  display: block;
  /* 新增：选中后内容淡入 */
  opacity: 1;
  transform: translateY(0);
}

.radio-inputs > label.radio > input:checked ~ div.content div * {
  animation: content-activated 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; /* 增强动画曲线 */
}

.content {
  background-color: #c0c0c0; /* 银色内容边框底色 */
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  margin-top: -1px;
  z-index: 5;
  /* 新增：内容容器过渡 */
  transition: all 0.3s ease;
}

.content > div {
  background-color: #ffffff; /* 白色内容底色 */
  border-radius: 0 0 0.5rem 0.5rem;
  padding: 1.2rem 1.5rem;
  border: 4px solid #c0c0c0; /* 银色边框 */
  border-top-width: 0;
  min-height: 120px;
  /* 新增：内容内层过渡 */
  transition: all 0.3s ease;
}

/* 新增：内容hover效果 */
.content > div:hover {
  box-shadow: inset 0 0 0 1px #d0d0d0;
}

@keyframes content-activated {
  from {
    opacity: 0;
    transform: translateY(8px); /* 调整偏移量更自然 */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>

