<script setup>
import {queryUserInfoApi} from "@/api/user.js";
import {onMounted, ref} from "vue";
import MyMessage from "@/utils/MyMessage.js";
import {MyLoading} from "@/utils/MyLoading.js";
import {useRouter} from "vue-router";
import {verifyIsLoginApi} from "@/api/wecommunity.js";
import Message from "@/utils/MyMessage.js";

const router = useRouter();
const userInfo = ref({})

const queryUserInfo = async () => {
  MyLoading.value = true;
  const loginUser = sessionStorage.getItem("loginUser");
  try {
    const result = await queryUserInfoApi(JSON.parse(loginUser).userId);
    if (result.code) {
      userInfo.value = result.data;
      MyLoading.value = false;
    } else {
      MyMessage.error(result.msg);
      MyLoading.value = false;
    }
  } catch (e) {
    MyLoading.value = false;
  }
}
const isLogin = async () => {
  const result = await verifyIsLoginApi();
  if (!result.code) {
    Message.error('请先登录！');
    await router.push('/login');
  }
}
onMounted(() => {
  queryUserInfo();
  isLogin();
})
</script>

<template>
  <div>
    {{ userInfo }}
  </div>
</template>

<style scoped>

</style>
