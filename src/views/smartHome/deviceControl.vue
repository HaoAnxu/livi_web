<script setup>
import {
  getAllDeviceInfoListByUserIdApi,
  getDeviceInfoByDeviceIdApi,
  changeDeviceStatusApi,
  addNewDeviceApi,
  deleteDeviceByDeviceIdApi,
  createTaskApi
} from "@/api/device.js"
import {ref, onMounted, watch} from "vue"
import { useRouter } from 'vue-router'
import { MyLoading } from "@/utils/MyLoading.js"
import MyMessage from "@/utils/MyMessage.js"

const router = useRouter()
const time = ref('')
const taskInfo = ref({
  deviceId: '',
  userId:'',
  permit:'1',
  taskType:'',
  onceStartDate:'',
  forModel:'',
  beginTime:'',
  endTime:''
})
watch(time, (newVal, oldVal) => {
  taskInfo.value.beginTime = newVal[0]
  taskInfo.value.endTime = newVal[1]
})
</script>

<template>
  <h1>{{taskInfo.beginTime}}</h1>
  <h1>{{taskInfo.endTime}}</h1>
  <div class="demo-range">
    <el-time-picker
        v-model="time"
        is-range
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        value-format="HH:mm:ss"
    />
  </div>
</template>

<style scoped>

</style>
