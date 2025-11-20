<script setup>
import {onMounted, ref} from 'vue';
import router from "@/router/index.js";

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
  loginUser.value = JSON.parse(localStorage.getItem('loginUser')).username;
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
              <span class="split" v-if="index < navMenus.length - 1">|</span>
            </li>
          </ul>
          <!--右侧功能菜单-->
          <ul class="nav-right">
            <!-- 未登录：显示登录、注册 + 公共菜单 -->
            <template v-if="!loginUser">
              <li>
                <a href="/login" class="nav-link">登录</a>
                <span class="split">|</span>
              </li>
              <li>
                <a href="/register" class="nav-link">注册</a>
                <span class="split">|</span>
              </li>
              <li v-for="(menu,index) in commonFuncMenus" :key="menu.path">
                <a :href="menu.path" class="nav-link">{{ menu.name }}</a>
                <span class="split" v-if="index < commonFuncMenus.length - 1">|</span>
              </li>
            </template>
            <!-- 已登录：显示用户名 + 退出登录 + 公共菜单 -->
            <template v-else>
              <li>
                <span class="nav-link" style="cursor: default;">{{ loginUser }}</span>
                <span class="split">|</span>
              </li>
              <li>
                <a href="javascript:;" class="nav-link" @click="logout">退出登录</a>
                <span class="split">|</span>
              </li>
              <li v-for="(menu,index) in commonFuncMenus" :key="menu.path">
                <a :href="menu.path" class="nav-link">{{ menu.name }}</a>
                <span class="split" v-if="index < commonFuncMenus.length - 1">|</span>
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
            <el-dropdown class="mobile-dropdown" size="large" trigger="click">
              <span><el-icon class="mobile-icon"><Menu /></el-icon></span>
              <template #dropdown>
                <el-dropdown-menu class="custom-dark-menu">
                  <el-dropdown-item v-for="(menu,index) in navMenus" :key="menu.path">
                    <a :href="menu.path" class="nav-link">{{ menu.name }}</a>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-dropdown class="mobile-dropdown" size="large" trigger="click">
              <span><el-icon class="mobile-icon"><Avatar /></el-icon></span>
              <template #dropdown>
                <el-dropdown-menu class="custom-dark-menu">
                  <!-- 移动端：未登录显示登录、注册 -->
                  <template v-if="!loginUser">
                    <el-dropdown-item>
                      <a href="/login" class="nav-link" @click="closeDropdown">登录</a>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <a href="/register" class="nav-link" @click="closeDropdown">注册</a>
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
                    <a :href="menu.path" class="nav-link" @click="closeDropdown">{{ menu.name }}</a>
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
/* 顶部导航整体样式 */
.top-header {
  height: 50px;
  line-height: 50px;
  background: linear-gradient(to left, rgb(51, 51, 51), rgb(80, 80, 80));
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
  color: #d3d3d3;
  text-decoration: none;
}
.mobile-dropdown {
  color: #b0b0b0;
  font-size: 15px;
  margin-top: 2vh;
  margin-right: 7vw;
}
.mobile-icon {
  font-size: 20px;
}
.custom-dark-menu {
  background-color: #333 !important; /* 与顶部导航背景一致 */
  border: 1px solid #444 !important; /* 暗色边框 */
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
  color: #afafaf;
  text-decoration: none;
  padding: 0 5px;
  transition: color 0.3s;
}

/*  hover 效果 */
.nav-link:hover {
  color: #fff;
}

/* 分隔线样式 */
.split {
  color: #606060;
  margin: 0 3px;
}

@media (max-width: 992px) {
  .top-nav-pc {
    display: none;
  }
  .top-header {
    background: linear-gradient(to left, rgb(51, 51, 51), rgba(99, 99, 99, 0.84));
  }
  .top-nav-mobile {
    display: flex;
    justify-content: right;
  }
}
</style>