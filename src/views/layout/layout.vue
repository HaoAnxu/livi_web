<script setup>
import {ref} from 'vue';

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

// 右侧功能菜单
const funcMenus = ref([
  {name: '登录', path: '/login'},
  {name: '注册', path: '/register'},
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
            <li v-for="(menu,index) in funcMenus" :key="menu.path">
              <a :href="menu.path" class="nav-link">{{ menu.name }}</a>
              <span class="split" v-if="index < funcMenus.length - 1">|</span>
            </li>
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
                  <el-dropdown-item v-for="(menu,index) in funcMenus" :key="menu.path">
                    <a :href="menu.path" class="nav-link">{{ menu.name }}</a>
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