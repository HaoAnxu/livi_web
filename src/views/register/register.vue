<script setup>
import MyMessage from "@/utils/MyMessage.js"
import {checkUsernameApi, registerApi, sendCodeApi, verifyCodeApi} from "@/api/user.js";
import { ref,watch } from "vue";
import { useRouter } from 'vue-router'
import { MyLoading } from "@/utils/MyLoading.js";

const router = useRouter();
const codeText = ref("");
const userInfo = ref({
  username: "",
  password: "",
  email: ""
})
const isVerifyCode = ref(false);
const isRightEmail = ref(false);
// 验证码发送状态锁定 + 冷却倒计时
const isSendingCode = ref(false);
const codeCountdown = ref(0);
let countdownTimer = null; // 倒计时定时器
// 邮箱格式校验
const isEmailValid = (email) => {
  const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/;
  return reg.test(email.trim());
};

// 发送验证码方法
const sendCode = async () => {
  // 邮箱无效/发送中/冷却中 直接返回
  if (!isEmailValid(userInfo.value.email) || isSendingCode.value || codeCountdown.value > 0) {
    return;
  }

  // 锁定发送状态
  isSendingCode.value = true;
  // 显示全屏加载动画
  MyLoading.value = true;

  try {
    const result = await sendCodeApi(userInfo.value.email);
    if (result.code) {
      MyMessage.success("验证码发送成功");
      // 启动60秒冷却倒计时
      codeCountdown.value = 60;
      countdownTimer = setInterval(() => {
        codeCountdown.value--;
        if (codeCountdown.value <= 0) {
          clearInterval(countdownTimer);
          countdownTimer = null;
        }
      }, 1000);
    } else {
      MyMessage.error(result.msg);
    }
  } catch (error) {
    console.log('请求失败：', error);
    let errorMsg = '请求失败，请稍后重试';
    if (error.message.includes('timeout')) {
      errorMsg = '请求超时，请检查网络或联系管理员';
    } else if (error.message.includes('Network Error')) {
      errorMsg = '网络错误，无法连接服务器';
    }
    MyMessage.error(errorMsg);
  } finally {
    MyLoading.value = false;
    isSendingCode.value = false;
  }
}

// 注册方法
const register = async () => {
  // 校验表单
  if (!userInfo.value.username || !userInfo.value.password || !userInfo.value.email) {
    MyMessage.warn("请填写完整信息");
    return;
  }
  if (!isEmailValid(userInfo.value.email)) {
    MyMessage.warn("请输入正确的邮箱格式");
    return;
  }
  // 校验验证码
  if (!codeText.value) {
    MyMessage.warn("请输入验证码");
    return;
  }

  // 显示全屏加载动画
  MyLoading.value = true;

  try {
    //先判断用户名是否存在
    const checkUsernameResult = await checkUsernameApi(userInfo.value.username);
    if (checkUsernameResult.code === 0) {
      MyMessage.warn("用户名已存在");
      return;
    }
    const verifyResult = await verifyCodeApi(userInfo.value.email, codeText.value);
    if (verifyResult.code) {
      MyMessage.success("验证码验证成功");
      isVerifyCode.value = true;
      const registerResult = await registerApi(userInfo.value);
      if (registerResult.code) {
        MyMessage.success("注册成功");
        await router.push("/login");
        MyMessage.success("注册成功，即将跳转到登录页");
      } else {
        MyMessage.error(registerResult.msg);
        isVerifyCode.value = false; // 修复：注册失败重置验证码状态
      }
    } else {
      MyMessage.error(verifyResult.msg);
      isVerifyCode.value = false;
    }
  } catch (error) {
    console.log('请求失败：', error);
    let errorMsg = '请求失败，请稍后重试';
    if (error.message.includes('timeout')) {
      errorMsg = '请求超时，请检查网络或联系管理员';
    } else if (error.message.includes('Network Error')) {
      errorMsg = '网络错误，无法连接服务器';
    }
    MyMessage.error(errorMsg);
    isVerifyCode.value = false;
  } finally {
    MyLoading.value = false;
  }
}

// 保留原有Watch逻辑
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

// 优化邮箱Watch：新增发送中/冷却状态判断
watch(() => [userInfo.value.email, isSendingCode.value, codeCountdown.value], () => {
  const sendBtn = document.querySelector('.code_button');
  if (sendBtn) {
    // 邮箱有效 + 非发送中 + 非冷却中
    const canSend = isEmailValid(userInfo.value.email) && !isSendingCode.value && codeCountdown.value <= 0;
    if (canSend) {
      isRightEmail.value = true;
      sendBtn.style.cursor = 'pointer';
      sendBtn.style.backgroundColor = 'rgba(125, 250, 122, 0.89)';
    } else {
      isRightEmail.value = false;
      sendBtn.style.cursor = 'not-allowed';
      sendBtn.style.backgroundColor = '#d7edfa';
    }
    // 更新按钮文字（显示倒计时）
    sendBtn.innerText = codeCountdown.value > 0 ? `${codeCountdown.value}s后重发` : '发送';
  }
}, {immediate: true})

// 组件卸载时清理定时器
import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<template>
  <div class="bg">
    <!-- 背景文字添加响应式隐藏类名 -->
    <div class="fade-text responsive-hidden">团结</div>
    <div class="fade-text responsive-hidden">Livi</div>
    <div class="fade-text responsive-hidden">改造家</div>
    <div class="fade-text responsive-hidden">Unity</div>
    <div class="fade-text responsive-hidden">团结改造家</div>
    <div class="fade-text responsive-hidden">Livi Unity</div>

    <!-- 表单容器：居中 + 边距优化 -->
    <div class="form-container">
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
          <!-- 修复：按钮禁用逻辑增加发送中/冷却判断 -->
          <button @click="sendCode" class="code_button" type="button"
                  :disabled="!isRightEmail || isSendingCode || codeCountdown > 0">
            {{ codeCountdown > 0 ? `${codeCountdown}s后重发` : '发送' }}
          </button>
          <input type="text" class="input" placeholder="请输入邮箱验证码" v-model="codeText" required>
        </div>
        <button class="button-submit" @click.prevent="register" :disabled="!isVerifyCode">注册</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/CSS/Login_Register/bg.css';
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

/* 表单容器：居中 + 边距优化 */
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0 auto;
  padding: 20px; /* 添加工厂边距，防止表单贴边 */
  box-sizing: border-box;
  max-width: 1200px; /* 限制最大宽度 */
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 30px;
  width: 500px; /* PC端固定500px宽度 */
  border: 1px solid rgba(14, 14, 14, 0.3);
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  box-sizing: border-box; /* 确保padding不影响宽度 */
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

/* 响应式样式 */
/* 小屏幕下隐藏背景文字 + 表单自适应 */
@media (max-width: 768px) {
  .responsive-hidden {
    display: none !important;
  }
  /* 小屏幕表单宽度自适应 */
  .form {
    width: 100%;
    max-width: 500px; /* 最大不超过原有500px宽度 */
  }
}

@media (max-width: 480px) {
  .form {
    padding: 20px 15px;
  }

  .form-container {
    padding: 10px;
  }
}

/* 确保页面容器占满全屏 */
:deep(html), :deep(body) {
  margin: 0;
  padding: 0;
  height: 100%;
}

.bg {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
}
</style>