<script setup>
import {onMounted, ref} from 'vue';
import router from "@/router/index.js";
import {Menu, Avatar} from '@element-plus/icons-vue';

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
// 右侧功能菜单
const commonFuncMenus = ref([
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

// 退出登录方法
const logout = () => {
  closeDropdown();
  localStorage.removeItem('loginUser');
  router.push('/login');
};

onMounted(() => {
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
          <ul class="nav-list nav-left">
            <li v-for="(menu,index) in navMenus" :key="menu.path">
              <router-link :to="menu.path" class="nav-link">{{ menu.name }}</router-link>
              <span class="split" v-if="index < navMenus.length - 1"></span>
            </li>
          </ul>
          <!--右侧功能菜单-->
          <ul class="nav-list nav-right">
            <!-- 未登录：显示登录、注册 + 公共菜单 -->
            <template v-if="!loginUser">
              <li>
                <router-link to="/login" class="nav-link">登录</router-link>
                <span class="split"></span>
              </li>
              <li>
                <router-link to="/register" class="nav-link">注册</router-link>
                <span class="split"></span>
              </li>
              <li v-for="(menu,index) in commonFuncMenus" :key="menu.path">
                <router-link :to="menu.path" class="nav-link">{{ menu.name }}</router-link>
                <span class="split" v-if="index < commonFuncMenus.length - 1"></span>
              </li>
            </template>
            <!-- 已登录：显示用户名 + 退出登录 + 公共菜单 -->
            <template v-else>
              <li>
                <span class="nav-link user-name">{{ loginUser }}</span>
                <span class="split"></span>
              </li>
              开发者入驻
              <li>
                <a href="javascript:;" class="nav-link logout-btn" @click="logout">退出登录</a>
                <span class="split"></span>
              </li>
              <li v-for="(menu,index) in commonFuncMenus" :key="menu.path">
                <router-link :to="menu.path" class="nav-link">{{ menu.name }}</router-link>
                <span class="split" v-if="index < commonFuncMenus.length - 1"></span>
              </li>
            </template>
          </ul>
        </div>

        <!--移动端Menu-->
        <div class="top-nav-mobile">
          <!--移动端logo-->
          <div class="top-nav-mobile-logo">
            <router-link to="/" class="mobile-logo">Livi Unity</router-link>
          </div>
          <!-- 新增按钮容器：让两个按钮紧密排列 -->
          <div class="mobile-btn-group">
            <el-config-provider>
              <el-dropdown class="mobile-dropdown" size="large" trigger="click" @click.stop>
                <span><el-icon class="mobile-icon"><Menu/></el-icon></span>
                <template #dropdown>
                  <el-dropdown-menu class="custom-menu">
                    <el-dropdown-item v-for="(menu,index) in navMenus" :key="menu.path">
                      <router-link :to="menu.path" class="nav-link" @click="closeDropdown">{{ menu.name }}</router-link>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-dropdown class="mobile-dropdown" size="large" trigger="click" @click.stop>
                <span><el-icon class="mobile-icon"><Avatar/></el-icon></span>
                <template #dropdown>
                  <el-dropdown-menu class="custom-menu">
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
                        <span class="nav-link user-name">欢迎，{{ loginUser }}</span>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <a href="javascript:;" class="nav-link logout-btn" @click="logout">退出登录</a>
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
        </div>
      </el-header>

      <el-main>
        <router-view></router-view>
      </el-main>

      <el-footer class="app-footer">Livi Unity ©2025 智能家居商城</el-footer>
    </el-container>
  </div>
</template>

<style scoped>
/* 基础布局 - 小米风格橙白主调 */
.top-header {
  height: 60px;
  line-height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  font-size: 14px;
  position: sticky;
  top: 0;
  z-index: 999;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* PC端导航容器 */
.top-nav-pc {
  width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
}

/* 移动端导航容器 - 核心修复溢出问题 */
.top-nav-mobile {
  display: none;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px; /* 减少左右内边距，避免挤压空间 */
  height: 100%;
  width: 100%;
  box-sizing: border-box; /* 关键：内边距计入宽度，防止溢出 */
  max-width: 100vw; /* 限制最大宽度为屏幕宽度 */
}

.top-nav-mobile-logo {
  font-size: 22px; /* 缩小logo字体，减少宽度占用 */
  font-weight: 600;
}

/* 移动端按钮容器 - 紧凑排列+防溢出 */
.mobile-btn-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mobile-logo {
  color: #ff6700;
  text-decoration: none;
  transition: color 0.2s;
}

/* 移动端下拉菜单 - 缩小图标和按钮尺寸 */
.mobile-dropdown {
  color: #333;
  font-size: 14px; /* 缩小按钮文字尺寸 */
  transition: color 0.2s;
  padding: 0 8px; /* 给按钮加少量内边距，点击区域更友好 */
}

.mobile-dropdown:hover {
  color: #ff6700;
}

.mobile-icon {
  font-size: 20px; /* 缩小图标尺寸，减少宽度 */
}

/* 自定义下拉菜单样式 - 小米浅灰风格 */
.custom-menu {
  background-color: #fff !important;
  border: 1px solid #e5e5e5 !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
  border-radius: 4px !important;
}

/* 导航列表样式（合并重复） */
.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 导航链接基础样式（精简重复属性） */
.nav-link {
  color: #333;
  text-decoration: none;
  padding: 0 12px;
  transition: all 0.2s ease;
  display: inline-block;
  height: 60px;
  line-height: 60px;
  position: relative;
  box-sizing: border-box;
}

/* 链接hover效果 - 小米橙下划线+文字变色（合并伪类逻辑） */
.nav-link:hover {
  color: #ff6700;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background-color: #ff6700;
  transition: width 0.2s ease;
}

.nav-link:hover::after {
  width: 80%;
}

/* 用户名样式 */
.user-name {
  color: #ff6700;
  font-weight: 500;
}

/* 退出登录按钮特殊样式（复用伪类，仅覆盖颜色） */
.logout-btn:hover {
  color: #ff4400;
}

.logout-btn::after {
  background-color: #ff4400;
}

/* 分隔线样式 - 小米浅灰 */
.split {
  display: inline-block;
  height: 14px;
  width: 1px;
  background-color: #e5e5e5;
  margin: 0 8px;
  vertical-align: middle;
}

/* 移动端适配 */
@media (max-width: 1200px) {
  .top-nav-pc {
    width: 90%;
  }
}

@media (max-width: 992px) {
  .top-nav-pc {
    display: none;
  }

  .top-nav-mobile {
    display: flex;
  }

  .top-header {
    height: 55px;
    line-height: 55px;
    padding: 0;
    box-sizing: border-box;
  }

  .nav-link {
    height: 45px;
    line-height: 45px;
    padding: 0 8px;
  }

  /* 移动端下拉菜单链接hover（仅覆盖差异样式） */
  .custom-menu .nav-link:hover {
    background-color: #f5f5f5;
  }

  .custom-menu .nav-link::after {
    display: none;
  }
}

/* 页脚样式 - 小米浅灰底 */
.app-footer {
  background-color: #f5f5f5;
  color: #666;
  text-align: center;
  padding: 20px 0;
  font-size: 12px;
  border-top: 1px solid #e5e5e5;
}

/* 主内容区留白 */
.el-main {
  padding: 20px 0;
  min-height: 85vh;
}
</style>