<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import router from "@/router/index.js";
import { Menu, Avatar } from '@element-plus/icons-vue';

const loginUser = ref("");

// 导航菜单数据
const navMenus = ref([
  { name: '首页', path: '/' },
  { name: '智能家居', path: '/smartHome' },
  { name: '购物商城', path: '/shop' },
  { name: 'We社群', path: '/weCommunity' },
  { name: 'We社区', path: '/wePost' },
  { name: '短视频', path: '/shortVideo' },
  { name: '音乐', path: '/music' },
]);

// 右侧功能菜单
const commonFuncMenus = ref([
  { name: '购物车', path: '/cart' },
  { name: '待读消息', path: '/messages' },
  { name: '用户中心', path: '/userCenter' }
]);

// 点击菜单项后关闭下拉菜单
const closeDropdown = () => {
};

// 退出登录方法
const logout = () => {
  sessionStorage.removeItem('loginUser');
  router.push('/login');
};

const isTempHidden = ref(false);
const toggleNav = () => {
  isTempHidden.value = true;
};
//导航栏滚动控制
const lastScrollTop = ref(0)//记录上一次滚动位置
const headerVisible = ref(true);//导航栏是否可见
//滚动事件处理函数
const handleScroll = () => {
  if (window.innerWidth > 992) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (isTempHidden.value) {
      isTempHidden.value = false;
    }
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
      <el-header class="top-header" :class="{ 'hidden': !headerVisible || isTempHidden }">
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
            <li class="hide-nav-btn-item">
              <a href="javascript:;" class="nav-link hide-nav-btn" @click="toggleNav">
                <span class="triangle-down"></span>
              </a>
            </li>
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
                <span><el-icon class="mobile-icon">
                    <Menu />
                  </el-icon></span>
                <template #dropdown>
                  <el-dropdown-menu class="custom-menu">
                    <el-dropdown-item v-for="(menu) in navMenus" :key="menu.path">
                      <router-link :to="menu.path" class="nav-link" @click="closeDropdown">{{ menu.name }}</router-link>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-dropdown class="mobile-dropdown" size="large" trigger="click" @click.stop>
                <span><el-icon class="mobile-icon">
                    <Avatar />
                  </el-icon></span>
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
/* 背景纹理 - 银灰渐变替换原有粉色 + 动画 */
.bg {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  background-image: radial-gradient(rgba(160, 88, 219, 0.492) 2px, transparent 0);
  /* 银灰纹理 */
  background-size: 30px 30px;
  background-position: -5px -5px;
  animation: bgFadeIn 1s ease-out;
}

/* 顶部导航 - 核心样式 + 银白配色 + 增强动画 */
.top-header {
  height: 60px;
  line-height: 60px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  /* 银灰底部分隔线 */
  font-size: 14px;
  position: sticky;
  top: 0;
  z-index: 999;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  /* 银白风格浅阴影 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* 更顺滑的过渡 */
  transform: translateY(0);
  animation: headerFadeIn 0.6s ease-out;
  /* 导航栏入场动画 */
}

.top-header.hidden {
  transform: translateY(-100%);
  box-shadow: none;
  /* 隐藏时移除阴影 */
}

/* PC端导航容器（保留布局） */
.top-nav-pc {
  width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
}

/* 移动端导航容器（保留布局） */
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
  transition: transform 0.2s ease;
  /* logo轻微缩放 */
}

.top-nav-mobile-logo:hover {
  transform: scale(1.05);
}

/* 移动端按钮组（保留布局） */
.mobile-btn-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 核心主色：银灰（替换原淡蓝） + hover动画 */
.mobile-logo {
  color: #888888;
  /* 银灰主色 */
  text-decoration: none;
  transition: all 0.2s ease;
}

.mobile-logo:hover {
  color: #666666;
  /* 深灰hover */
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.03);
}

/* 移动端下拉菜单 + 动画 */
.mobile-dropdown {
  color: #333;
  font-size: 14px;
  transition: all 0.2s ease;
  padding: 0 8px;
  cursor: pointer;
}

.mobile-dropdown:hover {
  color: #666666;
  /* 深灰hover（替换原淡蓝） */
  transform: translateY(-1px);
}

.mobile-icon {
  font-size: 20px;
  transition: color 0.2s ease;
}

.mobile-dropdown:hover .mobile-icon {
  color: #666666;
}

/* 自定义下拉菜单样式 - 银白配色 */
.custom-menu {
  background-color: #fff !important;
  border: 1px solid #e0e0e0 !important;
  /* 银灰边框（替换原淡蓝） */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
  /* 银白风格阴影 */
  border-radius: 4px !important;
  animation: menuFadeIn 0.3s ease-out;
  /* 菜单淡入 */
}

/* 导航列表（保留布局） */
.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 导航链接 - 增强动画 + 银白配色 */
.nav-link {
  color: #333;
  text-decoration: none;
  padding: 0 12px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  /* 顺滑过渡 */
  display: inline-block;
  height: 60px;
  line-height: 60px;
  position: relative;
  box-sizing: border-box;
}

.nav-link:hover {
  color: #75dbff;
  transform: translateY(-1px);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background-color: #75dbff;
  /* 银灰下划线（替换原淡蓝） */
  transition: width 0.25s ease;
  border-radius: 1px;
}

.nav-link:hover::after {
  width: 80%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 用户名样式：深灰强调（替换原淡蓝） */
.user-name {
  color: #ffa9a9;
  font-weight: 500;
  position: relative;
}

.user-name::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #e0e0e0;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.nav-link:hover .user-name::before {
  opacity: 1;
}

/* 退出按钮：深灰（替换原淡蓝） + 动画 */
.logout-btn:hover {
  color: #555555;
  /* 更深灰hover（替换原淡蓝） */
}

.logout-btn::after {
  background-color: #666666;
  /* 深灰下划线（替换原淡蓝） */
}

/* 分隔线 - 银灰配色 */
.split {
  display: inline-block;
  height: 14px;
  width: 1px;
  background-color: #e0e0e0;
  /* 银灰分隔线（替换原淡蓝） */
  margin: 0 8px;
  vertical-align: middle;
  transition: background-color 0.2s ease;
}

.nav-list:hover .split {
  background-color: #d0d0d0;
  /* hover加深 */
}

/* 页脚核心样式 */
.app-footer {
  background-color: #f9f9f9;
  /* 浅灰背景（替换原淡蓝） */
  color: #75dbff;
  padding: 40px 0 20px;
  font-size: 14px;
  border-top: 2px solid #aeeaff;
  /* 银灰顶部边框（替换原淡蓝） */
  animation: footerFadeIn 0.8s ease-out 0.2s;
  /* 页脚延迟淡入 */
  animation-fill-mode: both;
  opacity: 0;
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

/* 页脚品牌信息 + 动画 */
.footer-brand {
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #aeeaff;
  width: 100%;
  max-width: 600px;
  transition: all 0.3s ease;
}

.footer-brand:hover {
  border-bottom-color: #aeeaff;
  ;
}

.brand-name {
  font-size: 24px;
  color: #75dbff;
  margin: 0 0 10px;
  font-weight: 700;
  transition: all 0.3s ease;
  position: relative;
}

.brand-name:hover {
  color: #75dbff;
  transform: scale(1.02);
}

/* 品牌名轻微呼吸动画 */
.brand-name::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: -5px;
  left: 0;
  background-color: #aeeaff;
  border-radius: 1px;
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: center;
}

.footer-brand:hover .brand-name::after {
  transform: scaleX(1);
}

.brand-slogan {
  font-size: 16px;
  color: #75dbff;
  margin: 0;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-brand:hover .brand-slogan {
  color: #75dbff;
}

/* 页脚版权信息 - 银白配色 + 动画 */
.footer-copyright {
  text-align: center;
  padding-top: 10px;
  font-size: 12px;
  color: #888888;
  /* 银灰版权文字（替换原淡蓝） */
  width: 100%;
  transition: color 0.2s ease;
}

.footer-copyright:hover {
  color: #666666;
}

.footer-copyright p {
  margin: 0;
  line-height: 1.5;
}
.hide-nav-btn-item {
  margin-left: 5px;
}
.hide-nav-btn {
  padding: 0 8px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}
.triangle-down {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #888;
  transition: all 0.2s ease;
}
.hide-nav-btn:hover .triangle-down {
  border-top-color: #666;
  transform: scale(1.1);
}
/* ===================== 新增动画关键帧 ===================== */
/* 背景淡入 */
@keyframes bgFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* 导航栏入场 */
@keyframes headerFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 下拉菜单淡入 */
@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translateY(5px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 主体内容淡入 */
@keyframes mainFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 页脚入场 */
@keyframes footerFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式适配 - 保留原有逻辑 + 银白配色调整 */
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

  /* 移动端菜单hover背景 - 银白风格 */
  .custom-menu .nav-link:hover {
    background-color: #f5f5f5;
    /* 浅灰hover背景（替换原淡蓝） */
    color: #666666;
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