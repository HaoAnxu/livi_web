<script setup>
import { queryUserInfoApi } from "@/api/user.js";
import { onMounted,ref } from "vue";
import Message from "@/utils/MyMessage.js";


const userInfo = ref({})

const queryUserInfo = async ()=>{
  const loginUser = localStorage.getItem("loginUser");
  const result = await queryUserInfoApi(JSON.parse(loginUser).userId);
  if(result.code){
    userInfo.value = result.data;
  }else {
    Message.error(result.msg);
  }
}
onMounted(()=>{
  queryUserInfo();
})
</script>

<template>
  <div>
    {{userInfo}}
  </div>
</template>

<style scoped>

</style>
