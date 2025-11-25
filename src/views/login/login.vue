<script setup>
import Message from "@/utils/MyMessage.js"
import YZcode from "@/utils/YZcode.vue";
import { loginApi } from "@/api/user.js";
import { ref,watch } from "vue";
import { useRouter } from 'vue-router'
import { MyLoading } from "@/utils/MyLoading.js";

const router = useRouter();
const userInfo = ref({
  username: "",
  password: ""
})
const YZcodeRef = ref(null);
const YZcodeText = ref("");

const login = async()=>{
  //校验表单
  if(!userInfo.value.username || !userInfo.value.password){
    Message.warn("请填写完整信息");
    return;
  }
  //先校验验证码
  if(!YZcodeRef.value.checkCode(YZcodeText.value)){
    Message.error("验证码错误");
    return;
  }
  //再校验用户名和密码
  MyLoading.value = true;
  const result = await loginApi(userInfo.value);
  if(result.code){
    Message.success("登录成功");
    const userInfo ={
      userId: result.data.userId,
      username: result.data.username,
      token: result.data.token
    }
    localStorage.setItem('loginUser',JSON.stringify(userInfo));
    await router.push('/');
    MyLoading.value = false;
  }else {
    Message.error(result.msg);
  }
}
const register =()=>{
  router.push('/register');
}

const reset =()=>{
  userInfo.value.username = "";
  userInfo.value.password = "";
  YZcodeText.value = "";
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
      if (loginBtn) { // 确保元素存在
        if (newName.trim() && newPwd.trim() && newCode.trim().length === 4) {
          loginBtn.style.backgroundColor = 'rgba(125, 250, 122, 0.89)';
        } else {
          loginBtn.style.backgroundColor = '#d7edfa';
        }
      }
    },
    { immediate: true } // 初始加载时执行一次
)
</script>

<template>
  <div class="bg">
    <div class="fade-text">团结改造家</div>
    <div class="fade-text">Livi Unity</div>
    <div class="fade-text">团结改造家</div>
    <div class="fade-text">Livi Unity</div>
    <div class="fade-text">团结改造家</div>
    <div class="fade-text">Livi Unity</div>
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

</style>