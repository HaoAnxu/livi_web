<script setup>
import { ref } from 'vue';

// 导航菜单数据
const navMenus = ref([
  { name: '小米商城', path: '/' },
  { name: 'MIUI', path: '/miui' },
  { name: 'IoT 平台', path: '/iot' },
  { name: '云服务', path: '/cloud' },
  { name: '金融', path: '/finance' },
  { name: '有品', path: '/youpin' },
  { name: '小爱开放平台', path: '/ai' },
  { name: '企业团购', path: '/group' },
  { name: '资质证照', path: '/license' },
  { name: '协议规则', path: '/agreement' },
  { name: '下载app', path: '/app' },
  { name: '智能生活', path: '/life' },
  { name: 'Select Region', path: '/region' }
]);

// 右侧功能菜单
const funcMenus = ref([
  { name: '登录', path: '/login' },
  { name: '注册', path: '/register' },
  { name: '购物车', path: '/cart' },
  { name: '我的订单', path: '/order' }
]);
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header class="mi-header">
        <!-- 顶部导航容器 -->
        <div class="mi-nav">
          <!-- 左侧导航菜单 -->
          <ul class="nav-left">
            <li v-for="(menu, index) in navMenus" :key="index">
              <a :href="menu.path" class="nav-link">{{ menu.name }}</a>
              <span class="split" v-if="index < navMenus.length - 1">|</span>
            </li>
          </ul>

          <!-- 右侧功能菜单 -->
          <ul class="nav-right">
            <li v-for="(menu, index) in funcMenus" :key="index">
              <a :href="menu.path" class="nav-link">{{ menu.name }}</a>
              <span class="split" v-if="index < funcMenus.length - 1">|</span>
            </li>
          </ul>
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
.mi-header {
  height: 40px;
  line-height: 40px;
  background-color: #333;
  color: #b0b0b0;
  font-size: 12px;
  padding: 0;
}

/* 导航容器 */
.mi-nav {
  width: 1226px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
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
  color: #b0b0b0;
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
  color: #424242;
  margin: 0 2px;
}
</style>