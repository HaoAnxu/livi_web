<script setup>
import { ref, onMounted } from 'vue'

// 核心状态管理
const showSplash = ref(true) // 控制开场动画显示

// 初始化动画逻辑
onMounted(() => {
  // 开场动画持续3秒后隐藏
  setTimeout(() => {
    showSplash.value = false
    // 主内容模块入场动画，排队显示
    setTimeout(() => {
      const modules = document.querySelectorAll('.module-row')
      modules.forEach((row, index) => {
        setTimeout(() => {
          row.style.opacity = '1'
          row.style.transform = 'translateY(0)'
        }, 400 * index)
      })
    }, 500)
  }, 3000)
})
</script>

<template>
  <div class="app-container">
    <!-- 开场动画 -->
    <div v-if="showSplash" class="splash-screen">
      <div class="splash-content">
        <div class="logo-container">
          <h1 class="logo-main">LiVi</h1>
          <p class="logo-tagline">Smart Home · Intelligent Life</p>
        </div>
        <div class="logo-decoration">
          <span>智能生活的无限可能</span>
          <span>Simple & Elegant</span>
        </div>
      </div>
      <div class="decor-line top-line"></div>
      <div class="decor-line bottom-line"></div>
    </div>

    <!-- 主内容区（动画结束后显示） -->
    <div v-else class="main-wrapper">
      <!-- 页面标题 -->
      <header class="page-header">
        <div class="header-inner">
          <h1 class="main-title">LiVi Unity</h1>
          <p class="sub-title">团结改造家 · 定义智能新生活</p>
          <div class="title-divider"></div>
        </div>
      </header>

      <!-- 功能模块区域 -->
      <main class="main-content">
        <div class="module-row">
          <div class="module-content">
          </div>
        </div>
        <div class="module-row">
          <div class="module-content">
          </div>
        </div>
        <div class="module-row">
          <div class="module-content">
          </div>
        </div>
        <div class="module-row">
          <div class="module-content">
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/CSS/Index/farmwork.css";
@import "@/assets/CSS/Index/animation.css";

</style>