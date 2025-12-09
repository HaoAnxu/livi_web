<script setup>
import MyMessage from "@/utils/MyMessage.js"
import YZcode from "@/components/YZcode.vue";
import { loginApi } from "@/api/user.js";
import { ref, watch, onUnmounted } from "vue";
import { useRouter } from 'vue-router'
import { MyLoading } from "@/utils/MyLoading.js";

const router = useRouter();
const userInfo = ref({
  username: "",
  password: ""
})
const YZcodeRef = ref(null);
const YZcodeText = ref("");
const isLogining = ref(false);

const login = async()=>{
  if (isLogining.value) return;

  // 校验表单
  if(!userInfo.value.username || !userInfo.value.password){
    MyMessage.warn("请填写完整信息");
    return;
  }

  // 先校验验证码
  if(!YZcodeRef.value?.checkCode(YZcodeText.value)){ // 新增：可选链防止null调用
    MyMessage.error("验证码错误");
    YZcodeRef.value.refreshCode();
    YZcodeText.value = "";
    return;
  }

  try {
    // 显示加载动画
    MyLoading.value = true;
    // 标记登录中状态
    isLogining.value = true;

    // 再校验用户名和密码
    const result = await loginApi(userInfo.value);
    if(result.code){
      MyMessage.success("登录成功");
      const userInfoData = {
        userId: result.data.userId,
        username: result.data.username,
        token: result.data.token
      }
      sessionStorage.setItem('loginUser', JSON.stringify(userInfoData));
      await router.push('/');
    } else {
      MyMessage.error(result.msg);
      YZcodeRef.value.refreshCode();
      YZcodeText.value = "";
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
    isLogining.value = false;
  }
}

const register =()=>{
  router.push('/register');
}

const reset =()=>{
  userInfo.value.username = "";
  userInfo.value.password = "";
  YZcodeText.value = "";
  // 重置登录按钮样式
  const loginBtn = document.querySelector('.button-submit');
  if (loginBtn) {
    loginBtn.style.backgroundColor = '#d7edfa';
  }
}

const goIndex =()=>{
  router.push('/');
}

const contactAdmin =()=>{
  router.push('/');
}

// 表单校验通过，让登录按钮颜色变成绿
watch(
    () => [userInfo.value.username, userInfo.value.password, YZcodeText.value],
    ([newName, newPwd, newCode]) => {
      const loginBtn = document.querySelector('.button-submit');
      if (loginBtn) {
        // 登录中时强制禁用样式
        if (isLogining.value) {
          loginBtn.style.backgroundColor = '#d7edfa';
          loginBtn.style.cursor = 'not-allowed';
          return;
        }
        if (newName.trim() && newPwd.trim() && newCode.trim().length === 4) {
          loginBtn.style.backgroundColor = 'rgba(125, 250, 122, 0.89)';
          loginBtn.style.cursor = 'pointer';
        } else {
          loginBtn.style.backgroundColor = '#d7edfa';
          loginBtn.style.cursor = 'not-allowed';
        }
      }
    },
    { immediate: true }
)

onUnmounted(() => {
  MyLoading.value = false;
  isLogining.value = false;
});
</script>

<template>
  <div class="bg">
    <!-- 背景文字添加响应式类名 -->
    <div class="fade-text responsive-hidden">团结改造家</div>
    <div class="fade-text responsive-hidden">Livi Unity</div>
    <div class="fade-text responsive-hidden">团结改造家</div>
    <div class="fade-text responsive-hidden">Livi Unity</div>
    <div class="fade-text responsive-hidden">团结改造家</div>
    <div class="fade-text responsive-hidden">Livi Unity</div>

    <!-- 表单容器添加响应式样式 -->
    <div class="form-container">
      <form class="form">
        <h1 class="title">Livi Unity</h1>
        <div class="flex-column">
          <label>用户名</label></div>
        <div class="inputForm">
          <el-icon><User /></el-icon>
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
          <el-icon><Hide /></el-icon>
          <input type="password" class="input" placeholder="(6-12)位任意字符"
                 v-model="userInfo.password"
                 required
                 minlength="6"
                 maxlength="12"
                 title="密码长度6-12位">
        </div>

        <div class="flex-column">
          <label>验证码</label></div>
        <div class="inputForm">
          <YZcode ref="YZcodeRef" difficulty="10"></YZcode>
          <input type="text" class="input" placeholder="请输入验证码(注意大小写)" v-model="YZcodeText" required>
        </div>
        <div class="flex-row">
          <div>
            <input type="checkbox">
            <label>记住密码</label>
          </div>
          <button @click="reset" class="reset">重置</button>
          <span class="span">忘记密码？</span>
        </div>
        <button class="button-submit" @click.prevent="login">登录</button>
        <p class="p">没有账号？ <span class="span" @click="register">注册~</span></p>
        <p class="p line">或者？</p>
        <div class="flex-row">
          <button class="btn" @click="goIndex">
            <el-icon><ChatLineSquare /></el-icon>我就逛逛不登陆~
          </button>
          <button class="btn" @click="contactAdmin">
            <el-icon><CoffeeCup /></el-icon>联系管理员
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/CSS/Login_Register/bg.css';

/* 响应式表单容器 - 核心优化 */
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0 auto; /* 居中 */
  padding: 20px; /* 添加工厂边距，防止表单贴边 */
  box-sizing: border-box;
  max-width: 1200px; /* 限制最大宽度，避免超大屏拉伸 */
}

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

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 30px;
  width: 500px;
  border: 1px solid rgba(14, 14, 14, 0.3);
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  box-sizing: border-box; /* 确保padding不影响宽度 */
}

.form button {
  align-self: flex-end;
}
.reset {
  border: none;
  background-color: transparent;
  color: #878787;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
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

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}

.flex-row > div > label {
  font-size: 14px;
  color: black;
  font-weight: 400;
}

.span {
  font-size: 14px;
  margin-left: 5px;
  color: rgb(68, 255, 57);
  font-weight: 500;
  cursor: pointer;
}
.button-submit {
  margin: 20px 0 10px 0;
  background-color: #d7edfa;
  border: none;
  color: #2d3748; /* 深色文字提高可读性 */
  font-size: 15px;
  font-weight: 500;
  border-radius: 10px;
  height: 50px;
  width: 100%;
  cursor: pointer;
  transition:
      background-color 0.5s ease-in-out;
}
.button-submit:hover {
  background-color: rgba(125, 250, 122, 0.89);
}

.p {
  text-align: center;
  color: black;
  font-size: 14px;
  margin: 5px 0;
}

.btn {
  margin-top: 10px;
  width: 100%;
  height: 50px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  gap: 10px;
  border: 1px solid #ededef;
  background-color: white;
  cursor: pointer;
  transition: 0.2s ease-in-out;
}

.btn:hover {
  border: 1px solid rgb(68, 255, 57);
}

/* 响应式样式  */
/* 小屏幕下禁用背景文字 + 表单自适应 */
@media (max-width: 768px) {
  .responsive-hidden {
    display: none !important;
  }
  /* 小屏幕表单宽度自适应 */
  .form {
    width: 100%;
    max-width: 450px; /* 最大不超过原有宽度 */
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

/* 确保body和html占满全屏 */
:deep(html), :deep(body) {
  margin: 0;
  padding: 0;
  height: 100%;
}

/* 确保bg容器占满全屏 */
.bg {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
}
</style>