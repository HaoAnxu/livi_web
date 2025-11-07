<script setup>
import { ref } from 'vue';

// 导航菜单数据
const navMenus = ref([
  { name: '首页', path: '/' },
  { name: '智能家居', path: '/smartHome' },
  { name: '购物商城', path: '/shop' },
  { name: 'We社区', path: '/weCommunity' },
  { name: '豆包AI', path: '/ai' },
  { name: '短视频', path: '/video' },
  { name: '音乐', path: '/music' },
]);

// 右侧功能菜单
const funcMenus = ref([
  { name: '登录', path: '/login' },
  { name: '注册', path: '/register' },
  { name: '购物车', path: '/cart' },
  { name: '待读消息', path: '/messages' },
  { name: '用户中心', path: '/userCenter' }
]);
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header class="top-header">
        <div class="top-nav">
          <!--左侧导航菜单-->
          <ul class="nav-left">
            <li v-for="(menu,index) in navMenus" :key="index">
              <a :href="menu.path" class="nav-link">{{menu.name}}</a>
              <span class="split" v-if="index < navMenus.length - 1">|</span>
            </li>
          </ul>
          <!--右侧功能菜单-->
          <ul class="nav-right">
            <li v-for="(menu,index) in funcMenus" :key="index">
              <a :href="menu.path" class="nav-link">{{menu.name}}</a>
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
.top-header {
  height: 40px;
  line-height: 40px;
  background-color: #333;
  color: #b0b0b0;
  font-size: 12px;
  padding: 0;
}

/* 导航容器 */
.top-nav {
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