<script setup>
import { onMounted, ref } from 'vue';
import router from "@/router/index.js";
import { Menu, Avatar } from '@element-plus/icons-vue'; // 导入缺失的图标组件

const loginUser = ref("");

// 导航菜单数据
const navMenus = ref([
  {name: '首页', path: '/'},
  {name: '智能家居', path: '/smartHome'},
  {name: '购物商城', path: '/shop'},
  {name: 'We社区', path: '/weCommunity'},
  {name: '豆包AI', path: '/ai'},
  {name: '短视频', path: '/shortVideo'},
  {name: '音乐', path: '/music'},
]);
// 右侧功能菜单（拆分：公共菜单+登录相关菜单）
const commonFuncMenus = ref([ // 始终显示的公共菜单
  {name: '购物车', path: '/cart'},
  {name: '待读消息', path: '/messages'},
  {name: '用户中心', path: '/userCenter'}
]);
const isDropdownOpen = ref(false);

// 切换下拉菜单
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};
// 点击菜单项后关闭下拉菜单
const closeDropdown = () => {
  isDropdownOpen.value = false;
};

// 退出登录方法（空置，你后续补充）
const logout = () => {
  closeDropdown();
  // 清除localStorage中的登录用户信息
  localStorage.removeItem('loginUser');
  // 跳转登录页
  router.push('/login');
};

onMounted(()=>{
  // 处理localStorage为空的情况，避免报错
  const userInfo = localStorage.getItem('loginUser');
  loginUser.value = userInfo ? JSON.parse(userInfo).username : '';
})
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header class="top-header">
        <!--PC端Menu-->
        <div class="top-nav-pc">
          <!--左侧导航菜单-->
          <ul class="nav-left">
            <li v-for="(menu,index) in navMenus" :key="menu.path">
              <a :href="menu.path" class="nav-link">{{ menu.name }}</a>
              <span class="split" v-if="index < navMenus.length - 1"></span>
            </li>
          </ul>
          <!--右侧功能菜单-->
          <ul class="nav-right">
            <!-- 未登录：显示登录、注册 + 公共菜单 -->
            <template v-if="!loginUser">
              <li>
                <a href="/login" class="nav-link">登录</a>
                <span class="split"></span>
              </li>
              <li>
                <a href="/register" class="nav-link">注册</a>
                <span class="split"></span>
              </li>
              <li v-for="(menu,index) in commonFuncMenus" :key="menu.path">
                <a :href="menu.path" class="nav-link">{{ menu.name }}</a>
                <span class="split" v-if="index < commonFuncMenus.length - 1"></span>
              </li>
            </template>
            <!-- 已登录：显示用户名 + 退出登录 + 公共菜单 -->
            <template v-else>
              <li>
                <span class="nav-link" style="cursor: default;">{{ loginUser }}</span>
                <span class="split"></span>
              </li>
              <li>
                <a href="javascript:;" class="nav-link" @click="logout">退出登录</a>
                <span class="split"></span>
              </li>
              <li v-for="(menu,index) in commonFuncMenus" :key="menu.path">
                <a :href="menu.path" class="nav-link">{{ menu.name }}</a>
                <span class="split" v-if="index < commonFuncMenus.length - 1"></span>
              </li>
            </template>
          </ul>
        </div>

        <!--移动端Menu-->
        <div class="top-nav-mobile">
          <!--移动端logo-->
          <div class="top-nav-mobile-logo">
            <a href="/" class="mobile-logo">Livi Unity</a>
          </div>
          <el-config-provider theme="dark">
            <!-- 添加@click.stop阻止事件冒泡，确保菜单可点击 -->
            <el-dropdown class="mobile-dropdown" size="large" trigger="click" @click.stop>
              <span><el-icon class="mobile-icon"><Menu /></el-icon></span>
              <template #dropdown>
                <el-dropdown-menu class="custom-dark-menu">
                  <el-dropdown-item v-for="(menu,index) in navMenus" :key="menu.path">
                    <!-- 使用router-link替代a标签，配合Vue Router跳转，同时保留closeDropdown -->
                    <router-link :to="menu.path" class="nav-link" @click="closeDropdown">{{ menu.name }}</router-link>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <!-- 添加@click.stop阻止事件冒泡 -->
            <el-dropdown class="mobile-dropdown" size="large" trigger="click" @click.stop>
              <span><el-icon class="mobile-icon"><Avatar /></el-icon></span>
              <template #dropdown>
                <el-dropdown-menu class="custom-dark-menu">
                  <!-- 移动端：未登录显示登录、注册 -->
                  <template v-if="!loginUser">
                    <el-dropdown-item>
                      <router-link to="/login" class="nav-link" @click="closeDropdown">登录</router-link>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <router-link to="/register" class="nav-link" @click="closeDropdown">注册</router-link>
                    </el-dropdown-item>
                  </template>
                  <!-- 移动端：已登录显示用户名、退出登录 -->
                  <template v-else>
                    <el-dropdown-item disabled>
                      <span class="nav-link">欢迎，{{ loginUser }}</span>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <a href="javascript:;" class="nav-link" @click="logout">退出登录</a>
                    </el-dropdown-item>
                  </template>
                  <!-- 移动端公共菜单 -->
                  <el-dropdown-item v-for="(menu,index) in commonFuncMenus" :key="menu.path">
                    <router-link :to="menu.path" class="nav-link" @click="closeDropdown">{{ menu.name }}</router-link>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-config-provider>
        </div>
      </el-header>

      <el-main>
        <router-view></router-view>
      </el-main>

      <el-footer>Footer</el-footer>
    </el-container>
  </div>
</template>

<style scoped>
/* 顶部导航整体样式 - 清新蓝绿色渐变+流动动画 */
.top-header {
  height: 50px;
  line-height: 50px;
  /* 清新淡雅蓝绿色渐变（从浅到深自然过渡） */
  background: linear-gradient(90deg, #e6f7f5, #b3e8df, #80d8cc);
  background-size: 200% 200%; /* 动画所需背景尺寸 */
  animation: gradientFlow 15s ease infinite; /* 流动动画，15秒循环 */
  font-size: 12px;
}

/* 导航容器 */
.top-nav-pc {
  width: 70%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
}

.top-nav-mobile {
  display: none;
}
.top-nav-mobile-logo {
  margin: 0 auto;
  padding-left: 20vw;
  font-size: 20px;
}
.mobile-logo {
  color: #2d7d74; /* 蓝绿色系文字，适配清新风格 */
  text-decoration: none;
}
.mobile-dropdown {
  color: #2d7d74; /* 移动端图标颜色统一 */
  font-size: 15px;
  margin-top: 2vh;
  margin-right: 7vw;
}
.mobile-icon {
  font-size: 20px;
}
.custom-dark-menu {
  background-color: #f0faf8 !important; /* 浅蓝绿色背景，保持清新 */
  border: 1px solid #b3e8df !important; /* 同色系边框，呼应渐变 */
}

/* 列表样式重置 */
.nav-left, .nav-right {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 导航链接样式 */
.nav-link {
  color: #2d7d74; /* 深一点的蓝绿色，保证可读性 */
  text-decoration: none;
  padding: 0 5px;
  transition: color 0.3s;
}

/* hover 效果 - 文字加深，增强交互感 */
.nav-link:hover {
  color: #1a5e57; /* 更深的蓝绿色，hover时突出 */
}

/* 分隔线样式 - 蓝绿色系浅色调，不突兀 */
.split {
  display: inline-block;
  height: 12px;
  width: 1px;
  background-color: #8fd8ce; /* 浅蓝绿色分隔线，适配整体风格 */
  margin: 0 8px;
  vertical-align: middle;
}

/* 移动端适配样式 */
@media (max-width: 992px) {
  .top-nav-pc {
    display: none;
  }
  .top-header {
    /* 移动端同步PC端渐变和动画，风格统一 */
    background: linear-gradient(90deg, #e6f7f5, #b3e8df, #80d8cc);
    background-size: 200% 200%;
    animation: gradientFlow 15s ease infinite;
  }
  .top-nav-mobile {
    display: flex;
    justify-content: right;
  }
}

/* 渐变流动动画关键帧 - 自然左右平移 */
@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>