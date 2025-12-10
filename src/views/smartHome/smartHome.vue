<script setup>
import {ref, reactive, onMounted, watch} from "vue"
import {useRouter} from 'vue-router'
import {MyLoading} from "@/utils/MyLoading.js"
import MyMessage from "@/utils/MyMessage.js"
import {
  getAllDeviceInfoListByUserIdApi,
  deleteDeviceByDeviceIdApi,
  addNewDeviceApi,
  getRoomInfoByFamilyIdApi,
  getAllFamilyInfoByUserIdApi
} from "@/api/device.js"

const router = useRouter()
const deviceInfoList = ref([])
const userId = ref(0) // 改为数字类型，匹配后端Integer
// 默认设备图片
const defaultDeviceImg = ref("https://smarthomeunity.oss-cn-beijing.aliyuncs.com/image/LiVi%20Unity.png");
const familyInfoList = ref([])
const currentFamilyId = ref(0) // 改为数字类型，初始值0

// 获取用户家庭信息列表
const getFamilyInfoList = async () => {
  try {
    MyLoading.value = true;
    const loginUser = JSON.parse(sessionStorage.getItem('loginUser'));
    if (!loginUser) {
      MyMessage.error('请先登录');
      await router.push('/login');
      return;
    }
    userId.value = loginUser.userId;
    const result = await getAllFamilyInfoByUserIdApi(userId.value);
    if (result.code) {
      familyInfoList.value = result.data || [];
      // 有家庭数据则赋值，否则置0
      currentFamilyId.value = familyInfoList.value.length > 0 ? familyInfoList.value[0].familyId : 0;
    } else {
      MyMessage.error(result.msg);
      familyInfoList.value = [];
      currentFamilyId.value = 0;
    }
  } catch (error) {
    MyMessage.error('获取家庭信息失败：' + error.message);
    familyInfoList.value = [];
    currentFamilyId.value = 0;
  } finally {
    MyLoading.value = false; // 无论成功失败都关闭loading
  }
}

// 获取用户设备列表
const getDeviceInfoList = async () => {
  try {
    MyLoading.value = true;
    const loginUser = JSON.parse(sessionStorage.getItem('loginUser'));
    if (!loginUser) {
      MyMessage.error('请先登录');
      await router.push('/login');
      return;
    }
    userId.value = loginUser.userId;

    // 校验familyId是否有效，无效则提示
    if (currentFamilyId.value === 0 || !currentFamilyId.value) {
      MyMessage.warning('暂无可用家庭，请先添加家庭');
      deviceInfoList.value = [];
      return;
    }

    const result = await getAllDeviceInfoListByUserIdApi(currentFamilyId.value);
    if (result.code) {
      deviceInfoList.value = result.data || [];
    } else {
      MyMessage.error(result.msg);
      deviceInfoList.value = [];
    }
  } catch (error) {
    MyMessage.error('获取设备列表失败：' + error.message);
    deviceInfoList.value = [];
  } finally {
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

// 删除设备
const deleteDevice = async (deviceId) => {
  try {
    MyLoading.value = true;
    const result = await deleteDeviceByDeviceIdApi(deviceId);
    if (result.code) {
      MyMessage.success(result.msg);
      await getDeviceInfoList(); // 刷新列表
    } else {
      MyMessage.error(result.msg);
    }
  } catch (error) {
    MyMessage.error('删除设备失败：' + error.message);
  } finally {
    MyLoading.value = false;
  }
}

// 对话框相关
const dialogFormVisible = ref(false)
const deviceInfo = reactive({
  deviceName: '',
  deviceType: '',
  roomId: '',
  deviceImage: '',
  familyId: 0 // 关联当前家庭ID
})
const deviceFormRef = ref(null)
const formRules = {
  deviceName: [{required: true, message: '请输入设备名称', trigger: 'blur'}],
  deviceType: [{required: true, message: '请选择设备类型', trigger: 'change'}],
  roomId: [{required: true, message: '请选择所属房间', trigger: 'change'}],
  deviceImage: [{required: false}]
}
// 添加新设备
const addDevice = async () => {
  try {
    MyLoading.value = true;
    // 校验前先赋值当前家庭ID
    deviceInfo.familyId = currentFamilyId.value;
    //赋值userId
    deviceInfo.userId = userId.value;
    // 将validate转为Promise，适配async/await
    const valid = await new Promise((resolve) => {
      deviceFormRef.value.validate((isValid) => {
        resolve(isValid);
      });
    });
    if (!valid) {
      MyMessage.error('请填写完整信息');
      return;
    }
    const result = await addNewDeviceApi(deviceInfo);
    if (result.code) {
      MyMessage.success(result.msg);
      await getDeviceInfoList(); // 刷新列表
      dialogFormVisible.value = false;
      // 重置表单，清空脏数据
      deviceFormRef.value.resetFields();
      // 重置表单对象
      Object.assign(deviceInfo, {
        deviceName: '',
        deviceType: '',
        roomId: '',
        deviceImage: '',
        familyId: currentFamilyId.value
      });
    } else {
      MyMessage.error(result.msg);
    }
  } catch (error) {
    MyMessage.error('添加设备失败：' + error.message);
  } finally {
    MyLoading.value = false;
  }
}

//查询家庭匹配房间
const roomInfoList = ref([])
const getRoomInfoList = async () => {
  try {
    MyLoading.value = true;
    const result = await getRoomInfoByFamilyIdApi(currentFamilyId.value);
    if (result.code) {
      roomInfoList.value = result.data || [];
    } else {
      MyMessage.error(result.msg);
      roomInfoList.value = [];
    }
  } catch (error) {
    MyMessage.error('获取房间列表失败：' + error.message);
    roomInfoList.value = [];
  } finally {
    MyLoading.value = false;
  }
}

// 页面挂载
onMounted(() => {
  getFamilyInfoList();
});

watch(currentFamilyId, (newVal) => {
  if (newVal !== 0) {
    getDeviceInfoList();
  }
}, {immediate: true});
</script>

<template>
  <!-- 添加设备对话框 -->
  <el-dialog
      v-model="dialogFormVisible"
      title="添加智能设备"
      width="90%"
      max-width="550px"
      :close-on-click-modal="false"
      class="device-add-dialog"
  >
    <el-form
        ref="deviceFormRef"
        :model="deviceInfo"
        :rules="formRules"
        label-position="top"
        label-width="auto"
        class="device-form"
    >
      <!-- 设备名称 -->
      <el-form-item label="设备名称" prop="deviceName">
        <el-input v-model="deviceInfo.deviceName" placeholder="请输入设备名称" class="form-input"/>
      </el-form-item>

      <!-- 设备类型 -->
      <el-form-item label="设备类型" prop="deviceType">
        <el-select v-model="deviceInfo.deviceType" placeholder="请选择设备类型" class="form-select">
          <el-option label="基础家具类" value="基础家具类"/>
          <el-option label="厨房电器类" value="厨房电器类"/>
          <el-option label="生活电器类" value="生活电器类"/>
          <el-option label="影音娱乐类" value="影音娱乐类"/>
          <el-option label="照明灯具类" value="照明灯具类"/>
          <el-option label="安防监控类" value="安防监控类"/>
          <el-option label="智能控制类" value="智能控制类"/>
          <el-option label="厨卫五金类" value="厨卫五金类"/>
          <el-option label="其它" value="其它"/>
        </el-select>
      </el-form-item>

      <!-- 所属房间 -->
      <el-form-item label="所属房间" prop="roomId">
        <el-select v-model="deviceInfo.roomId" placeholder="请选择所属房间" class="form-select" @click="getRoomInfoList">
          <el-option v-for="room in roomInfoList" :key="room.roomId" :label="room.roomName" :value="room.roomId"/>
        </el-select>
      </el-form-item>

      <!-- 设备图片上传 -->
      <el-form-item label="设备图片" prop="deviceImage">
        <el-upload
            :limit="1"
            accept="image/png,image/jpg,image/jpeg"
            list-type="picture-card"
            class="avatar-uploader"
        >
          <div class="upload-placeholder">
            <el-icon class="upload-icon">
              <Plus/>
            </el-icon>
            <div class="upload-text">点击上传<br/>设备图片</div>
          </div>
          <img
              v-if="deviceInfo.deviceImage"
              :src="deviceInfo.deviceImage"
              class="uploaded-image"
              alt="设备图片"
          />
        </el-upload>
        <div class="upload-tip">
          <span>支持PNG/JPG/JPEG格式，建议尺寸200*200px</span>
        </div>
      </el-form-item>
    </el-form>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
        <el-button type="primary" @click="addDevice">确认添加</el-button>
      </div>
    </template>
  </el-dialog>

  <div class="device-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title-gradient">智能设备</h2>
      <div class="header-btn-group">
        <!--添加设备按钮-->
        <el-button type="primary" @click="dialogFormVisible = true">添加设备</el-button>
        <div>
          <el-dropdown trigger="click">
            <el-button type="primary" @click="getRoomInfoList">
              选择家庭组
              <el-icon class="el-icon--right">
                <arrow-down/>
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="family in familyInfoList" :key="family.familyId" :value="family.familyId"
                                  @click="currentFamilyId = family.familyId">
                  {{ family.familyName }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    <!-- 设备列表区 -->
    <div class="device-list">
      <div class="device-card" v-for="device in deviceInfoList" :key="device.deviceId">
        <!-- 设备图片 -->
        <div class="device-img">
          <img :src="device.deviceImage || defaultDeviceImg" alt="设备图片">
          <!-- 状态色点 -->
          <div class="status-dot" v-if="device.deviceStatus === 0" style="background-color: #ff4d4f;"></div>
          <div class="status-dot" v-else-if="device.deviceStatus === 1" style="background-color: #52c41a;"></div>
          <div class="status-dot" v-else-if="device.deviceStatus === 2" style="background-color: #faad14;"></div>
          <div class="status-dot" v-else-if="device.deviceStatus === 3" style="background-color: #1890ff;"></div>
          <div class="status-dot" v-else style="background-color: #999;"></div>
        </div>

        <!-- 设备信息模块 -->
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
        <p>暂无智能设备</p>
      </div>
    </div>
  </div>

</template>

<style>
@import '@/assets/CSS/SmartHome/main.css';

</style>
