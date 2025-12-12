<script setup>
import {
  getDeviceInfoByDeviceIdApi,
  changeDeviceStatusApi,
  getAllFamilyInfoByUserIdApi,
  createTaskApi,
  getTaskListApi,
  stopTaskApi
} from "@/api/device.js"
import {ref, onMounted, watch} from "vue"
import {useRoute, useRouter} from 'vue-router'
import {MyLoading} from "@/utils/MyLoading.js"
import MyMessage from "@/utils/MyMessage.js"
import {ElNotification} from 'element-plus'

const route = useRoute()
const router = useRouter()
const selectTime = ref([])
const onceDate = ref('')
const deviceId = ref(null)
const userId = ref(null)

// 检查用户登录状态并获取userId
const checkUserLogin = () => {
  try {
    const loginUser = sessionStorage.getItem('loginUser')
    if (!loginUser) {
      MyMessage.error('请先登录')
      router.push('/login')
      return false
    }
    const userData = JSON.parse(loginUser)
    userId.value = userData.userId
    return true
  } catch (e) {
    MyMessage.error('用户信息异常')
    router.push('/login')
    return false
  }
}

// 添加设备ID验证和初始化
const validateAndInitDeviceId = () => {
  const id = route.query.deviceId
  if (!id) {
    MyMessage.error('设备ID不能为空')
    router.back()
    return false
  }

  const numId = Number(id)
  if (isNaN(numId)) {
    MyMessage.error('设备ID格式错误')
    router.back()
    return false
  }

  deviceId.value = numId
  return true
}

const taskInfo = ref({
  deviceId: 0,
  userId: 0,
  permit: 1,
  taskType: '',
  onceStartDate: '',
  forModel: '',
  beginTime: '',
  endTime: ''
})
const deviceDetail = ref({})
const isRightShow = ref(false)
const taskList = ref([])
const isRun = ref(false)

// 检查权限时先验证设备ID
const checkFamily = async () => {
  if (!deviceId.value || !userId.value) {
    MyMessage.error('设备信息或用户信息不完整')
    router.back()
    return
  }

  MyLoading.value = true;
  try {
    const [deviceResult, familyResult] = await Promise.all([
      getDeviceInfoByDeviceIdApi(deviceId.value),
      getAllFamilyInfoByUserIdApi(userId.value)
    ])

    if (deviceResult.code && familyResult.code) {
      deviceDetail.value = deviceResult.data
      // 设置设备状态
      isRun.value = deviceDetail.value.deviceStatus === 1

      const hasPermission = familyResult.data.some(item => {
        return item.familyId === deviceDetail.value.familyId;
      });

      if (!hasPermission) {
        MyMessage.error('您没有权限操作该设备');
        router.back();
      }
    } else {
      MyMessage.error(deviceResult.msg || familyResult.msg || '获取信息失败');
      router.back();
    }
  } catch (e) {
    console.error('权限检查失败:', e)
    MyMessage.error('权限校验失败，请重试');
    router.back();
  } finally {
    MyLoading.value = false;
  }
};

// 切换面板时重新获取数据
const toggleRightPanel = async () => {
  isRightShow.value = !isRightShow.value;
  await getDeviceDetail();
  await getTaskList()
};
// 获取设备详情
const getDeviceDetail = async () => {
  if (!deviceId.value) return

  MyLoading.value = true;
  try {
    const result = await getDeviceInfoByDeviceIdApi(deviceId.value);
    if (result.code) {
      deviceDetail.value = result.data;
      isRun.value = deviceDetail.value.deviceStatus === 1
    } else {
      MyMessage.error(result.msg);
    }
  } catch (e) {
    console.error('获取设备详情失败:', e)
    MyMessage.error('获取设备详情失败');
  } finally {
    MyLoading.value = false;
  }
}
// 获取任务列表
const getTaskList = async () => {
  if (!deviceId.value) return

  MyLoading.value = true;
  try {
    const result = await getTaskListApi(deviceId.value);
    if (result.code) {
      taskList.value = result.data;
    } else {
      MyMessage.error(result.msg);
    }
  } catch (e) {
    console.error('获取任务列表失败:', e)
    MyMessage.error('获取任务列表失败');
  } finally {
    MyLoading.value = false;
  }
}
// 通知用户设备状态更新
const notify = () => {
  ElNotification({
    title: '设备状态更新',
    message: '设备状态已更新，可能会有5s延时，请刷新页面查看最新状态',
    type: 'success',
  })
}

//监听设备状态变化
watch(() => deviceDetail.value.deviceStatus,
    (newVal) => {
      isRun.value = newVal === 1
    }
)
// 切换设备状态
const changeDeviceStatus = async () => {
  if (!deviceId.value) {
    MyMessage.warn('设备ID为空，无法修改状态')
    return
  }

  const oldStatus = deviceDetail.value.deviceStatus
  const newStatus = isRun.value ? 1 : 0

  // 如果状态没变化，不执行
  if (oldStatus === newStatus) return

  MyLoading.value = true
  try {
    const result = await changeDeviceStatusApi(deviceId.value, newStatus)
    if (result.code) {
      MyMessage.success(result.msg || '状态修改成功')
      deviceDetail.value.deviceStatus = newStatus

      // 开启时创建长效任务
      if (isRun.value) {
        await createLongTask()
      } else {
        await stopLongTask()
      }
      notify()
    } else {
      MyMessage.error(result.msg || '状态修改失败')
      isRun.value = oldStatus === 1
    }
  } catch (e) {
    console.error('修改设备状态失败:', e)
    MyMessage.error('网络异常，修改状态失败')
    isRun.value = oldStatus === 1
  } finally {
    MyLoading.value = false
  }
}

const createLongTask = async () => {
  if (!deviceId.value || !userId.value) {
    MyMessage.error('设备或用户信息不完整')
    return
  }

  const taskData = {
    deviceId: deviceId.value,
    userId: userId.value,
    permit: 1,
    taskType: 'long',
    beginTime: new Date().toLocaleTimeString('zh-CN', {hour12: false})
  }

  try {
    const result = await createTaskApi(taskData)
    if (result.code) {
      MyMessage.success(result.msg || '长效任务创建成功')
    } else {
      MyMessage.error(result.msg || '长效任务创建失败')
    }
  } catch (e) {
    console.error('创建长效任务失败:', e)
    MyMessage.error('创建长效任务失败')
  }
}

const stopLongTask = async () => {
  if (!deviceId.value) return
  try {
    const result = await stopTaskApi()
    if (result.code) {
      MyMessage.success(result.msg || '任务已停止')
    }
  } catch (e) {
    console.error('停止任务失败:', e)
  }
}

//一次性任务规则
const onceRules = ref({
  onceStartDate: [
    {required: true, message: '请选择日期', trigger: 'change'}
  ],
  selectTime: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (!value || value.length < 2) {
          callback(new Error('请选择完整的执行时间段'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})

//创建一次性任务
const createOnceTask = async () => {
  if (!deviceId.value || !userId.value) {
    MyMessage.error('设备或用户信息不完整')
    return
  }
  if (!onceDate.value) {
    MyMessage.warn('请选择执行日期')
    return
  }
  if (!selectTime.value || selectTime.value.length < 2) {
    MyMessage.warn('请选择完整的执行时间段')
    return
  }
  MyLoading.value = true
  try {
    const taskData = {
      deviceId: deviceId.value,
      userId: userId.value,
      permit: 1,
      taskType: 'once',
      onceStartDate: onceDate.value,
      beginTime: selectTime.value[0],
      endTime: selectTime.value[1]
    }
    const result = await createTaskApi(taskData)
    if (result.code) {
      MyMessage.success('单次定时任务创建成功')
      // 重置表单
      onceDate.value = ''
      selectTime.value = []
      // 重新获取任务列表
      await getTaskList()
    } else {
      MyMessage.error(result.msg || '任务创建失败')
    }
  } catch (e) {
    console.error('创建单次任务异常：', e)
    MyMessage.error('创建任务时发生异常，请重试')
  } finally {
    MyLoading.value = false
  }
}

const createForTask = async () => {
  // TODO: 实现循环任务创建
  MyMessage.warn('循环任务功能暂未实现')
}

const getStatusClass = (status) => {
  return `status-${status}`
}

const resetTaskInfo = () => {
  taskInfo.value = {
    deviceId: 0,
    userId: 0,
    permit: 1,
    taskType: '',
    onceStartDate: '',
    forModel: '',
    beginTime: '',
    endTime: ''
  }
  onceDate.value = ''
  selectTime.value = []
}

onMounted(async () => {
  if (!checkUserLogin()) return

  if (!validateAndInitDeviceId()) return

  await checkFamily()

  await getTaskList()

  await getDeviceDetail()
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
        <div class="radio-inputs" v-if="isRightShow" @click="resetTaskInfo">
          <label class="radio">
            <input type="radio" name="radio" checked=""/>
            <span class="name">
              <span class="pre-name"></span>
              <span class="pos-name"></span>
              <span> 长效任务 </span>
            </span>
            <div class="content">
              <div class="long-term-task">
                <div class="task-desc">
                  <p class="desc-title">设备长效执行控制</p>
                  <p class="desc-tip">开启后设备将持续执行任务，关闭则终止所有长效任务</p>
                </div>
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
              <div class="once-term-task-wrap">
                <div class="task-intro">
                  <h3 class="intro-title">单次定时任务配置</h3>
                  <p class="intro-desc">
                    配置设备的单次执行任务，选择指定日期和时间段，设备将在该时段内自动执行任务，执行完成后任务自动终止。
                  </p>
                </div>

                <!-- 表单区域 -->
                <div class="once_term_task">
                  <el-form :model="taskInfo" :rules="oncerules" label-width="120px" class="once-task-form">
                    <el-form-item label="执行日期">
                      <el-date-picker
                          v-model="onceDate"
                          type="date"
                          placeholder="请选择日期"
                          format="YYYY年MM月DD日"
                          value-format="YYYY-MM-DD"
                          class="form-input-full"
                      />
                    </el-form-item>
                    <el-form-item label="执行时间">
                      <el-time-picker
                          v-model="selectTime"
                          is-range
                          range-separator="至"
                          start-placeholder="开始时间"
                          end-placeholder="结束时间"
                          format="HH时mm分ss秒"
                          value-format="HH:mm:ss"
                          class="form-input-full"
                      />
                    </el-form-item>
                    <el-form-item class="form-btn-item">
                      <button class="fresh-blue-btn" @click="createOnceTask">
                        创建定时任务
                      </button>
                    </el-form-item>
                  </el-form>
                </div>
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
                    item.taskType === 'long' ? '长效任务' : item.taskType === 'once' ? '单次定时任务' : '循环定时任务'
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
                <td colspan="7" class="empty-cell">暂无任务记录</td>
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
</style>