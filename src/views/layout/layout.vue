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

      <el-main>
        <router-view></router-view>
      </el-main>

      <el-footer class="app-footer">
        <!-- 重构页脚内容 - 围绕Livi Unity团结改造家主题 -->
        <div class="footer-container">
          <!-- 品牌核心信息 -->
          <div class="footer-brand">
            <h2 class="brand-name">Livi Unity 团结改造家</h2>
            <p class="brand-slogan">用团结的力量，改造理想生活空间</p>
          </div>

          <!-- 快捷链接 -->
          <div class="footer-links">
            <div class="link-group">
              <h3 class="link-title">关于我们</h3>
              <ul>
                <li><a href="javascript:;">品牌故事</a></li>
                <li><a href="javascript:;">团队介绍</a></li>
                <li><a href="javascript:;">加入我们</a></li>
              </ul>
            </div>
            <div class="link-group">
              <h3 class="link-title">服务支持</h3>
              <ul>
                <li><a href="javascript:;">售后保障</a></li>
                <li><a href="javascript:;">常见问题</a></li>
                <li><a href="javascript:;">联系客服</a></li>
              </ul>
            </div>
            <div class="link-group">
              <h3 class="link-title">法律声明</h3>
              <ul>
                <li><a href="javascript:;">隐私政策</a></li>
                <li><a href="javascript:;">用户协议</a></li>
                <li><a href="javascript:;">版权声明</a></li>
              </ul>
            </div>
          </div>

          <!-- 联系方式 -->
          <div class="footer-contact">
            <div class="contact-item">
              <i class="el-icon-phone"></i>
              <span>400-123-4567</span>
            </div>
            <div class="contact-item">
              <i class="el-icon-mail"></i>
              <span>service@liviunity.com</span>
            </div>
            <div class="contact-item">
              <i class="el-icon-location"></i>
              <span>北京市朝阳区团结湖路88号改造家创意中心</span>
            </div>
          </div>

          <!-- 版权信息 -->
          <div class="footer-copyright">
            <p>©2025 Livi Unity 团结改造家 版权所有 | 京ICP备12345678号</p>
            <p>本网站支持IPv6访问 | 营业执照：91110105XXXXXXXXXX</p>
          </div>
        </div>
      </el-footer>
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
  transition: transform 0.3s ease; /* 动画过渡 */
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

/* 移动端导航容器 - 核心修复溢出问题 */
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
  font-size: 14px;
  transition: color 0.2s;
  padding: 0 8px;
}

.mobile-dropdown:hover {
  color: #ff6700;
}

.mobile-icon {
  font-size: 20px;
}

/* 自定义下拉菜单样式 - 小米浅灰风格 */
.custom-menu {
  background-color: #fff !important;
  border: 1px solid #e5e5e5 !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
  border-radius: 4px !important;
}

/* 导航列表样式 */
.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 导航链接基础样式 */
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

/* 链接hover效果 - 小米橙下划线+文字变色 */
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

/* 退出登录按钮特殊样式 */
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

  .footer-container {
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

  /* 移动端下拉菜单链接hover */
  .custom-menu .nav-link:hover {
    background-color: #f5f5f5;
  }

  .custom-menu .nav-link::after {
    display: none;
  }
}

/* 主内容区留白 */
.el-main {
  padding: 20px 0;
  min-height: 85vh;
}

/* 重构页脚样式 - Livi Unity团结改造家主题 */
.app-footer {
  background-color: #f8f8f8;
  color: #666;
  padding: 40px 0 20px;
  font-size: 14px;
  border-top: 2px solid #ff6700;
}

.footer-container {
  width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 品牌核心信息 */
.footer-brand {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e5e5;
}

.brand-name {
  font-size: 24px;
  color: #ff6700;
  margin: 0 0 10px;
  font-weight: 700;
}

.brand-slogan {
  font-size: 16px;
  color: #333;
  margin: 0;
  font-weight: 500;
}

/* 快捷链接 */
.footer-links {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.link-group {
  flex: 1;
  min-width: 200px;
}

.link-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 15px;
  font-weight: 600;
  position: relative;
  padding-bottom: 8px;
}

.link-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 30px;
  height: 2px;
  background-color: #ff6700;
}

.footer-links ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #ff6700;
}

/* 联系方式 */
.footer-contact {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
  padding: 20px 0;
  border-top: 1px solid #e5e5e5;
  border-bottom: 1px solid #e5e5e5;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
}

.contact-item i {
  font-size: 18px;
  color: #ff6700;
}

/* 版权信息 */
.footer-copyright {
  text-align: center;
  padding-top: 20px;
  font-size: 12px;
  color: #999;
}

.footer-copyright p {
  margin: 5px 0;
}

/* 页脚移动端适配 */
@media (max-width: 768px) {
  .footer-links {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .link-title::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .footer-contact {
    gap: 20px;
    flex-direction: column;
    align-items: center;
  }

  .app-footer {
    padding: 30px 0 15px;
  }
}
</style>