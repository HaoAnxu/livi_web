<script setup>
import {queryUserInfoApi} from "@/api/user.js";
import {onMounted, ref, onUnmounted} from "vue";
import MyMessage from "@/utils/MyMessage.js";
import {MyLoading} from "@/utils/MyLoading.js";
import {useRouter} from "vue-router";
import {verifyIsLoginApi} from "@/api/wecommunity.js";
import Message from "@/utils/MyMessage.js";

const router = useRouter();
const userInfo = ref({})

const queryUserInfo = async () => {
  MyLoading.value = true;
  const loginUser = sessionStorage.getItem("loginUser");
  try {
    const result = await queryUserInfoApi(JSON.parse(loginUser).userId);
    if (result.code) {
      userInfo.value = result.data;
      MyLoading.value = false;
    } else {
      MyMessage.error(result.msg);
      MyLoading.value = false;
    }
  } catch (e) {
    MyLoading.value = false;
  }
}
const isLogin = async () => {
  const result = await verifyIsLoginApi();
  if (!result.code) {
    Message.error('请先登录！');
    await router.push('/login');
  }
}

onMounted(() => {
  queryUserInfo();
  isLogin();
})
</script>

<template>
  <div class="page-wrapper">
    <!-- 背景容器 -->
    <div class="bg"></div>

    <!-- 回到首页按钮 -->
    <button class="home-btn" @click="router.push('/')">
      回到首页
    </button>

    <!-- 用户中心主容器 - 左右布局 -->
    <div class="user-center-container">
      <!-- 左侧：用户信息区 -->
      <div class="user-info-sidebar">
        <!-- 基础信息模块 -->
        <div class="info-card basic-info">
          <div class="avatar-box">
            <div class="avatar" :style="{backgroundImage: userInfo.avatar ? `url(${userInfo.avatar})` : 'none'}">
              <span v-if="!userInfo.avatar">{{ userInfo.username ? userInfo.username.charAt(0) : '用' }}</span>
            </div>
          </div>
          <div class="user-base">
            <h3 class="username">{{ userInfo.username || '未设置用户名' }}</h3>
            <div class="gender-tag" :class="{'male': userInfo.gender === 1, 'female': userInfo.gender === 0}">
              {{ userInfo.gender === 1 ? '男' : userInfo.gender === 0 ? '女' : '未设置' }}
            </div>
            <p class="signature">{{ userInfo.signature || '这个人很懒，什么都没留下～' }}</p>
          </div>
        </div>

        <!-- 账号信息模块（预留） -->
        <div class="info-card account-info">
          <div class="card-title">账号信息</div>
          <div class="info-list">
            <div class="info-item">
              <span class="label">邮箱</span>
              <span class="value">{{ userInfo.email || '未绑定' }}</span>
            </div>
            <div class="info-item">
              <span class="label">注册时间</span>
              <span class="value">{{ userInfo.createTime ? userInfo.createTime.split('T')[0] : '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="label">最后更新</span>
              <span class="value">{{ userInfo.updateTime ? userInfo.updateTime.split('T')[0] : '未知' }}</span>
            </div>
          </div>
        </div>

        <!-- 左侧空余区域 -->
        <div class="info-card reserve-module">
          <div class="card-title">预留模块</div>
          <div class="reserve-content">
            <p>可扩展其他个人信息</p>
          </div>
        </div>
      </div>

      <!-- 右侧：功能操作区 -->
      <div class="user-function-main">
        <!-- 基础功能菜单 -->
        <div class="function-card menu-card">
          <div class="card-title">快捷功能</div>
          <div class="menu-list">
            <div class="menu-item">
              <span class="icon">✏️</span>
              <span class="text">编辑个人资料</span>
            </div>
            <div class="menu-item">
              <span class="icon">📸</span>
              <span class="text">更换头像</span>
            </div>
            <div class="menu-item">
              <span class="icon">📧</span>
              <span class="text">绑定/修改邮箱</span>
            </div>
            <div class="menu-item">
              <span class="icon">🔒</span>
              <span class="text">修改密码</span>
            </div>
            <div class="menu-item">
              <span class="icon">⚙️</span>
              <span class="text">账号设置</span>
            </div>
          </div>
        </div>

        <!-- 内容管理 -->
        <div class="function-card content-card">
          <div class="card-title">内容管理</div>
          <div class="content-list">
            <div class="content-item empty">
              <span class="empty-icon">📭</span>
              <span class="empty-text">暂无内容，快去发布吧～</span>
            </div>
          </div>
        </div>

        <!-- 系统服务 -->
        <div class="function-card service-card">
          <div class="card-title">系统服务</div>
          <div class="service-list">
            <div class="service-item">
              <span class="icon">❓</span>
              <span class="text">帮助中心</span>
            </div>
            <div class="service-item">
              <span class="icon">📞</span>
              <span class="text">联系客服</span>
            </div>
            <div class="service-item">
              <span class="icon">📝</span>
              <span class="text">意见反馈</span>
            </div>
            <div class="service-item">
              <span class="icon">🚪</span>
              <span class="text">退出登录</span>
            </div>
          </div>
        </div>

        <!-- 预留扩展模块 -->
        <div class="function-card reserve-card">
          <div class="card-title">预留功能区</div>
          <div class="reserve-content">
            <p>可扩展其他功能模块</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 页面容器 */
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
}

/* 网格背景样式 */
.bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  --grid-color: #E1E1E1;
  background-color: #F3F3F3;
  background-image:
      linear-gradient(0deg, transparent 24%, var(--grid-color) 25%, var(--grid-color) 26%, transparent 27%, transparent 74%, var(--grid-color) 75%, var(--grid-color) 76%, transparent 77%, transparent),
      linear-gradient(90deg, transparent 24%, var(--grid-color) 25%, var(--grid-color) 26%, transparent 27%, transparent 74%, var(--grid-color) 75%, var(--grid-color) 76%, transparent 77%, transparent);
  background-size: 55px 55px;
  z-index: -1;
}

/* 回到首页按钮 */
.home-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 17px 40px;
  border-radius: 50px;
  cursor: pointer;
  border: none;
  background-color: #fff;
  box-shadow: 0 0 8px rgba(249, 115, 22, 0.2);
  font-size: 15px;
  font-weight: 600;
  color: #e65100;
  transition: all 0.3s ease;
  z-index: 10;
}

.home-btn:focus-visible {
  outline: 2px solid #f97316;
  outline-offset: 2px;
}

.home-btn:hover {
  letter-spacing: 3px;
  background: linear-gradient(135deg, #f97316, #e65100);
  color: #fff;
  box-shadow: 0 7px 29px rgba(249, 115, 22, 0.4);
  transform: translateY(-2px);
}

.home-btn:active {
  letter-spacing: 3px;
  background: #e65100;
  color: #fff;
  box-shadow: 0 0 0 rgba(249, 115, 22, 0.2);
  transform: translateY(1px);
  transition: all 0.1s ease;
}

/* 核心：用户中心左右布局容器 */
.user-center-container {
  width: 100%;
  max-width: 1100px;
  margin-top: 100px;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

/* 左侧：用户信息侧边栏 */
.user-info-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 通用卡片样式（左侧+右侧） */
.info-card, .function-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.08);
}

/* 左侧：基础信息卡片 */
.basic-info {
  text-align: center;
}

.avatar-box {
  margin-bottom: 16px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f97316;
  color: #fff;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  margin: 0 auto;
}

.user-base .username {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.gender-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  margin-bottom: 12px;
}

.gender-tag.male {
  background: #e1f5fe;
  color: #0288d1;
}

.gender-tag.female {
  background: #fce4ec;
  color: #e91e63;
}

.gender-tag:not(.male):not(.female) {
  background: #f5f5f5;
  color: #999;
}

.signature {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* 左侧：账号信息/预留模块通用标题 */
.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

/* 左侧：账号信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8f8f8;
}

.info-item .label {
  font-size: 13px;
  color: #999;
}

.info-item .value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 左侧：预留模块占位 */
.reserve-module .reserve-content {
  padding: 16px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 右侧：功能操作主区域 */
.user-function-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 右侧：基础功能菜单 */
.menu-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.menu-item:hover {
  background: #bce9ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.1);
}

.menu-item .icon {
  font-size: 18px;
  color: #f97316;
}

.menu-item .text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 右侧：内容管理模块（预留） */
.content-card .content-list {
  padding: 16px 0;
}

.content-item.empty {
  text-align: center;
  padding: 32px 0;
  color: #999;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 8px;
  display: block;
}

.empty-text {
  font-size: 14px;
}

/* 右侧：系统服务模块 */
.service-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.service-item:hover {
  background: #f8f9fa;
}

.service-item .icon {
  font-size: 16px;
  color: #666;
}

.service-item .text {
  font-size: 14px;
  color: #333;
}

/* 右侧：预留功能区占位 */
.reserve-card .reserve-content {
  padding: 32px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
  border: 1px dashed #e0e0e0;
  border-radius: 8px;
  margin-top: 8px;
}

/* 移动端适配：左右布局转为上下布局 */
@media (max-width: 768px) {
  .home-btn {
    padding: 14px 32px;
    font-size: 14px;
    top: 15px;
    right: 15px;
  }

  .user-center-container {
    grid-template-columns: 1fr;
    margin-top: 80px;
    padding: 0 10px;
  }

  .menu-list {
    grid-template-columns: 1fr;
  }
}
</style>