<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
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

// 点击菜单项后关闭下拉菜单
const closeDropdown = () => {
};

// 退出登录方法
const logout = () => {
  sessionStorage.removeItem('loginUser');
  router.push('/login');
};
//导航栏滚动控制
const lastScrollTop = ref(0)//记录上一次滚动位置
const headerVisible = ref(true);//导航栏是否可见
//滚动事件处理函数
const handleScroll = () => {
  if (window.innerWidth > 992) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop.value && scrollTop > 50) {
      headerVisible.value = false;
    } else {
      headerVisible.value = true;
    }
    lastScrollTop.value = scrollTop;
  }
}
// 组件挂载时添加滚动事件监听
onMounted(() => {
  const userInfo = sessionStorage.getItem('loginUser');
  loginUser.value = userInfo ? JSON.parse(userInfo).username : '';
  // 添加滚动事件监听
  window.addEventListener('scroll', handleScroll);
});
// 组件卸载时移除滚动事件监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="common-layout">
    <el-container>
      <!--“条件为真，就加类名；条件为假，就删类名”-->
      <el-header class="top-header" :class="{'hidden': !headerVisible}">
        <!-- PC端Menu -->
        <div class="top-nav-pc">
          <!-- 左侧导航菜单 -->
          <ul class="nav-list nav-left">
            <li v-for="(menu, index) in navMenus" :key="menu.path">
              <router-link :to="menu.path" class="nav-link">{{ menu.name }}</router-link>
              <span class="split" v-if="index < navMenus.length - 1"></span>
            </li>
          </ul>
          <!-- 右侧功能菜单 -->
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
              <li v-for="(menu, index) in commonFuncMenus" :key="menu.path">
                <router-link :to="menu.path" class="nav-link">{{ menu.name }}</router-link>
                <span class="split" v-if="index < commonFuncMenus.length - 1"></span>
              </li>
            </template>
            <!-- 已登录：显示用户名 + 退出登录 + 公共菜单 -->
            <template v-else>
              <li>
                <router-link to="/userCenter" class="nav-link user-name">{{ loginUser }}</router-link>
                <span class="split"></span>
              </li>
              <li>
                <a href="javascript:;" class="nav-link logout-btn" @click="logout">退出登录</a>
                <span class="split"></span>
              </li>
              <li v-for="(menu, index) in commonFuncMenus" :key="menu.path">
                <router-link :to="menu.path" class="nav-link">{{ menu.name }}</router-link>
                <span class="split" v-if="index < commonFuncMenus.length - 1"></span>
              </li>
            </template>
          </ul>
        </div>

        <!-- 移动端Menu -->
        <div class="top-nav-mobile">
          <!-- 移动端logo -->
          <div class="top-nav-mobile-logo">
            <router-link to="/" class="mobile-logo">Livi Unity</router-link>
          </div>
          <!-- 按钮容器：让两个按钮紧密排列 -->
          <div class="mobile-btn-group">
            <el-config-provider>
              <el-dropdown class="mobile-dropdown" size="large" trigger="click" @click.stop>
                <span><el-icon class="mobile-icon"><Menu/></el-icon></span>
                <template #dropdown>
                  <el-dropdown-menu class="custom-menu">
                    <el-dropdown-item v-for="(menu) in navMenus" :key="menu.path">
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
                    <el-dropdown-item v-for="(menu) in commonFuncMenus" :key="menu.path">
                      <router-link :to="menu.path" class="nav-link" @click="closeDropdown">{{ menu.name }}</router-link>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-config-provider>
          </div>
        </div>
      </el-header>

      <el-main class="bg">
        <router-view></router-view>
      </el-main>

      <el-footer class="app-footer">
        <div class="footer-container">
          <!-- 品牌信息 -->
          <div class="footer-brand">
            <h2 class="brand-name">Livi Unity</h2>
            <p class="brand-slogan">团结改造家 · 理想生活空间</p>
          </div>

          <!-- 版权信息 -->
          <div class="footer-copyright">
            <p>©2025 Livi Unity 团结改造家 版权所有 | 京ICP备12345678号</p>
          </div>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.bg {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  background-image: radial-gradient(rgba(121, 11, 82, 0.2) 2px, transparent 0);
  background-size: 30px 30px;
  background-position: -5px -5px;
}
/* 顶部导航 - 核心样式 */
.top-header {
  height: 60px;
  line-height: 60px;
  background: #fff;
  border-bottom: 1px solid #eaf5fb; /* 超淡蓝底部分隔线 */
  font-size: 14px;
  position: sticky;
  top: 0;
  z-index: 999;
  box-shadow: 0 1px 3px rgba(145, 200, 230, 0.08); /* 清新蓝浅阴影 */
  transition: transform 0.3s ease;
  transform: translateY(0);
}

.top-header.hidden {
  transform: translateY(-100%);
}

/* PC端导航容器 */
.top-nav-pc {
  width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
}

/* 移动端导航容器 */
.top-nav-mobile {
  display: none;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  max-width: 100vw;
}

.top-nav-mobile-logo {
  font-size: 22px;
  font-weight: 600;
}

/* 移动端按钮组 */
.mobile-btn-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 核心主色：清新淡蓝（主视觉） */
.mobile-logo {
  color: #5cadf0;
  text-decoration: none;
  transition: color 0.2s;
}

/* 移动端下拉菜单 */
.mobile-dropdown {
  color: #333;
  font-size: 14px;
  transition: color 0.2s;
  padding: 0 8px;
}

.mobile-dropdown:hover {
  color: #5cadf0; /* 主色hover */
}

.mobile-icon {
  font-size: 20px;
}

/* 自定义下拉菜单样式 */
.custom-menu {
  background-color: #fff !important;
  border: 1px solid #eaf5fb !important; /* 超淡蓝边框 */
  box-shadow: 0 2px 12px rgba(92, 173, 240, 0.12) !important; /* 清新蓝阴影 */
  border-radius: 4px !important;
}

/* 导航列表 */
.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 导航链接 */
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

.nav-link:hover {
  color: #5cadf0; /* 主色hover */
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background-color: #5cadf0; /* 主色下划线 */
  transition: width 0.2s ease;
}

.nav-link:hover::after {
  width: 80%;
}

/* 用户名样式：稍深的清新蓝强调 */
.user-name {
  color: #4a98e8;
  font-weight: 500;
}

/* 退出按钮：略深的清新蓝（保证对比度） */
.logout-btn:hover {
  color: #3a87d8;
}

.logout-btn::after {
  background-color: #3a87d8;
}

/* 分隔线 */
.split {
  display: inline-block;
  height: 14px;
  width: 1px;
  background-color: #eaf5fb; /* 超淡蓝分隔线 */
  margin: 0 8px;
  vertical-align: middle;
}

/* 主体内容区 */
.el-main {
  padding: 20px 0;
  min-height: 85vh;
}

/* 页脚核心样式：极淡的清新蓝背景 */
.app-footer {
  background-color: #f5faff;
  color: #666;
  padding: 40px 0 20px;
  font-size: 14px;
  border-top: 2px solid #5cadf0; /* 主色顶部边框 */
}

.footer-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  box-sizing: border-box;
}

/* 页脚品牌信息 */
.footer-brand {
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #eaf5fb; /* 超淡蓝底部分隔线 */
  width: 100%;
  max-width: 600px;
}

.brand-name {
  font-size: 24px;
  color: #5cadf0; /* 主色品牌名 */
  margin: 0 0 10px;
  font-weight: 700;
}

.brand-slogan {
  font-size: 16px;
  color: #333;
  margin: 0;
  font-weight: 500;
}

/* 页脚版权信息 */
.footer-copyright {
  text-align: center;
  padding-top: 10px;
  font-size: 12px;
  color: #8eb8e5; /* 灰调清新蓝（保证可读性） */
  width: 100%;
}

.footer-copyright p {
  margin: 0;
  line-height: 1.5;
}

/* 响应式适配 */
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
  .custom-menu .nav-link:hover {
    background-color: #f5faff; /* 极淡蓝hover背景 */
  }
  .custom-menu .nav-link::after {
    display: none;
  }

  .footer-brand {
    padding-bottom: 10px;
  }
  .brand-name {
    font-size: 22px;
  }
  .brand-slogan {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .app-footer {
    padding: 30px 0 15px;
  }
  .footer-container {
    gap: 15px;
  }
  .footer-brand {
    padding-bottom: 8px;
  }
  .brand-name {
    font-size: 20px;
  }
  .brand-slogan {
    font-size: 13px;
  }
  .footer-copyright {
    padding-top: 8px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .app-footer {
    padding: 20px 0 10px;
  }
  .brand-name {
    font-size: 18px;
  }
  .brand-slogan {
    font-size: 12px;
  }
  .footer-copyright p {
    padding: 0 10px;
    word-break: break-all;
  }
}
</style>