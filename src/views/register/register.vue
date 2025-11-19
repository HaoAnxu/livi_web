<script setup>
import Message from "@/utils/Message"
import {registerApi, sendCodeApi, verifyCodeApi} from "@/api/user.js";
import {ref, onMounted, watch} from "vue";
import {useRouter} from 'vue-router'
import { ElLoading } from 'element-plus'

//全屏加载遮罩动画
const fullscreenLoading = ref(false)
const openFullScreen = () => {
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  setTimeout(() => {
    loading.close()
  }, 2000)
}

const router = useRouter();
const codeText = ref("");
const userInfo = ref({
  username: "",
  password: "",
  email: ""
})
const isVerifyCode = ref(false);
const isRightEmail = ref(false);
const isEmailValid = (email) => {
  const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/;
  return reg.test(email.trim());
};
// 发送验证码方法
const sendCode = async () => {
  if (!isEmailValid(userInfo.value.email)) {
    Message.warn("请输入正确的邮箱格式");
    return;
  }
  // 显示全屏加载动画
  fullscreenLoading.value = true;
  openFullScreen();
  const result = await sendCodeApi(userInfo.value.email);
  if (result.code) {
    Message.success("验证码发送成功");
  } else {
    Message.error(result.msg);
  }
  // 隐藏全屏加载动画
  fullscreenLoading.value = false;
}
//注册
const register = async () => {
  //校验表单
  if (!userInfo.value.username || !userInfo.value.password || !userInfo.value.email) {
    Message.warn("请填写完整信息");
    return;
  }
  if (!isEmailValid(userInfo.value.email)) {
    Message.warn("请输入正确的邮箱格式");
    return;
  }
  //校验验证码
  if (!codeText.value) {
    Message.warn("请输入验证码");
    return;
  }
  const verifyResult = await verifyCodeApi(userInfo.value.email, codeText.value);
  if (verifyResult.code) {
    Message.success("验证码验证成功");
    isVerifyCode.value = true;
    const registerResult = await registerApi(userInfo.value);
    if (registerResult.code) {
      Message.success("注册成功");
      router.push("/login");
    } else {
      Message.error(registerResult.msg);
      return;
    }
  } else {
    Message.error(verifyResult.msg);
    isVerifyCode.value = false;
    return;
  }
}
watch(() => [userInfo.value.username, userInfo.value.password, userInfo.value.email, codeText.value], () => {
  const registerBtn = document.querySelector('.button-submit');
  if (!registerBtn) return;
  const isFormComplete = userInfo.value.username.trim() && userInfo.value.password.trim() && userInfo.value.email.trim() && codeText.value.trim();
  if (isFormComplete) {
    registerBtn.disabled = false;
    registerBtn.style.backgroundColor = 'rgba(125, 250, 122, 0.89)';
    registerBtn.style.cursor = 'pointer';
  } else {
    registerBtn.disabled = true;
    registerBtn.style.backgroundColor = '#d7edfa';
    registerBtn.style.cursor = 'not-allowed';
  }
}, { immediate: true })

watch(() => userInfo.value.email, () => {
  const sendBtn = document.querySelector('.code_button');
  if (sendBtn) { // 确保元素存在
    if (isEmailValid(userInfo.value.email)) {
      isRightEmail.value = true;
      sendBtn.style.cursor = 'pointer';
      sendBtn.style.backgroundColor = 'rgba(125, 250, 122, 0.89)';
    } else {
      isRightEmail.value = false;
      sendBtn.style.cursor = 'not-allowed';
      sendBtn.style.backgroundColor = '#d7edfa';
    }
  }
}, {immediate: true})
</script>

<template>
  <div class="bg">
    <form class="form">
      <h1 class="title">Livi Unity</h1>

      <div class="flex-column">
        <label>用户名</label></div>
      <div class="inputForm">
        <el-icon>
          <User/>
        </el-icon>
        <input type="text" class="input" placeholder="请输入用户名"
               v-model="userInfo.username"
               required
               minlength="1"
               maxlength="12"
               pattern="^[a-zA-Z0-9_]+$"
               title="用户名只能包含字母、数字或下划线，长度3-16位">
      </div>

      <div class="flex-column">
        <label>密码</label></div>
      <div class="inputForm">
        <el-icon>
          <Hide/>
        </el-icon>
        <input type="password" class="input" placeholder="(6-12)位任意字符"
               v-model="userInfo.password"
               required
               minlength="6"
               maxlength="12"
               title="密码长度6-12位">
      </div>

      <div class="flex-column">
        <label>邮箱</label></div>
      <div class="inputForm">
        <el-icon>
          <Hide/>
        </el-icon>
        <input type="email" class="input" placeholder="请输入邮箱"
               v-model="userInfo.email"
               required
               title="请输入正确的邮箱格式">
      </div>

      <div class="flex-column">
        <label>邮箱验证码</label></div>
      <div class="inputForm">
        <button @click="sendCode" class="code_button" type="button" :disabled="!isRightEmail">发送</button>
        <input type="text" class="input" placeholder="请输入邮箱验证码" v-model="codeText" required>
      </div>
      <button class="button-submit" @click.prevent="register" :disabled="!isVerifyCode">注册</button>
    </form>
  </div>
</template>

<style scoped>
.title {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ff6b6b);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: breathColor 8s ease-in-out infinite;
  text-align: center;
}

/* 定义动画关键帧 */
@keyframes breathColor {
  0% {
    background-position: 0% 50%;
    opacity: 0.9; /* 初始透明度 */
  }
  50% {
    background-position: 100% 50%;
    opacity: 1; /* 中间最亮 */
  }
  100% {
    background-position: 0% 50%;
    opacity: 0.9; /* 回到初始状态 */
  }
}

.bg {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 30px;
  width: 450px;
  border: 1px solid rgba(14, 14, 14, 0.3);
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
}

.form button {
  align-self: flex-end;
}

.flex-column > label {
  color: #151717;
  font-weight: 600;
}

.inputForm {
  border: 1.5px solid #ecedec;
  border-radius: 10px;
  height: 50px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  transition: 0.2s ease-in-out;
}

.input {
  margin-left: 10px;
  border-radius: 10px;
  border: none;
  width: 85%;
  height: 100%;
}

.input:focus {
  outline: none;
}

.inputForm:focus-within {
  border: 1.5px solid rgb(68, 255, 57);
}

.flex-row > div > label {
  font-size: 14px;
  color: black;
  font-weight: 400;
}

/* 注册按钮：非禁用时文字正常色，hover 优化 */
.button-submit {
  margin: 20px 0 10px 0;
  background-color: #d7edfa;
  border: none;
  font-size: 15px;
  font-weight: 500;
  border-radius: 10px;
  height: 50px;
  width: 100%;
  transition: background-color 0.5s ease-in-out, color 0.3s ease; /* 增加文字颜色过渡 */
  cursor: not-allowed;
  color: #888; /* 禁用时淡灰色 */
}

.button-submit:not(:disabled) {
  color: #151717; /* 非禁用时正常文字色 */
  cursor: pointer;
}

.button-submit:not(:disabled):hover {
  background-color: rgba(125, 250, 122, 0.89);
}

/* 发送验证码按钮：非禁用时文字正常色 */
.code_button {
  width: 80px;
  height: 50px;
  border-radius: 10px;
  border: 1px solid #eeeef1;
  background-color: #d7edfa;
  cursor: pointer;
  transition: 0.2s ease-in-out;
  color: #888; /* 禁用时淡灰色 */
}

.code_button:not(:disabled) {
  color: #151717; /* 非禁用时正常文字色 */
  cursor: pointer;
}

.code_button:not(:disabled):hover {
  background-color: rgba(125, 250, 122, 0.89);
}

.code_button:disabled {
  cursor: not-allowed;
}
</style>