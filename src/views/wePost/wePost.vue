<script setup>
import { queryUserInfoApi } from "@/api/user.js";
import { onMounted, ref, onUnmounted } from "vue";
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";
import { useRouter } from "vue-router";
import { verifyIsLoginApi } from "@/api/wecommunity.js";

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

//淡入
const showSplash = ref(true)
//淡出
const splashClass = ref('')

onMounted(() => {
    queryUserInfo();
    isLogin();
    setTimeout(() => {
        splashClass.value = 'hidden'
        setTimeout(() => {
            showSplash.value = false
        }, 800)
    }, 2700)
})
</script>

<template>
    <!-- 开场动画 -->
    <div v-if="showSplash" :class="['splash-screen', splashClass]">
        <div class="splash-content">
            <div class="logo-container">
                <h1 class="logo-main">LiVi</h1>
                <p class="logo-tagline">WePost · Connect Everyone</p>
            </div>
            <div class="logo-decoration">
                <span class="decor-text first-text">LiVi社区</span>
                <span class="decor-text second-text">分享你的生活</span>
            </div>
        </div>
        <div class="decor-line top-line"></div>
        <div class="decor-line bottom-line"></div>
        <div class="grid-bg"></div>
    </div>

    <div class="page-wrapper">
        <!-- 背景容器：深色调网格背景 -->
        <div class="bg"></div>

        <!-- 回到首页按钮：深色调适配 -->
        <button class="home-btn" @click="router.push('/')">
            回到首页
        </button>

        <!-- 用户中心主容器 - 左右布局 -->
        <div class="user-center-container">
            <!-- 左侧：信息区 -->
            <div class="user-info-sidebar">
                <!-- 基础信息 -->
                <div class="info-card basic-info">
                    <div class="avatar-box">
                        <div class="avatar"
                            :style="{ backgroundImage: userInfo.avatar ? `url(${userInfo.avatar})` : 'none' }">
                            <span v-if="!userInfo.avatar">{{ userInfo.username ? userInfo.username.charAt(0) : '用'
                                }}</span>
                        </div>
                    </div>
                    <div class="user-base">
                        <h3 class="username">{{ userInfo.username || '未设置用户名' }}</h3>
                        <div class="gender-tag"
                            :class="{ 'male': userInfo.gender === 1, 'female': userInfo.gender === 0 }">
                            {{ userInfo.gender === 1 ? '男' : userInfo.gender === 0 ? '女' : '未设置' }}
                        </div>
                        <p class="signature">{{ userInfo.signature || '这个人很懒，什么都没留下～' }}</p>
                    </div>
                </div>

                <!-- 热门话题 -->
                <div class="info-card account-info">
                    <div class="card-title">热门话题</div>
                    <div class="info-list">
                        <div class="info-item">
                            <span class="label">@华为官方直营店入驻平台了！</span>
                        </div>
                        <div class="info-item">
                            <span class="label">@华为官方直营店入驻平台了！</span>
                        </div>
                        <div class="info-item">
                            <span class="label">@华为官方直营店入驻平台了！</span>
                        </div>
                    </div>
                </div>

                <!-- 左侧空余区域，响应式隐藏 -->
                <div class="info-card reserve-module">
                    <div class="card-title">预留模块</div>
                    <div class="reserve-content">
                        <p>可扩展其他个人信息</p>
                    </div>
                </div>
            </div>

            <!-- 右侧：帖子区 -->
            <div class="user-function-main">
                <!-- 公告区域 -->
                <div class="function-card menu-card">
                    <!-- 走马灯图片轮播区域，留空 -->
                </div>

                <!-- 圈子列表 -->
                <div class="function-card content-card">
                    <!-- 推荐圈子，分页查询 -->
                </div>

                <!-- 帖子区域 -->
                <div class="function-card content-card post-card">
                    <!-- 帖子列表区域，每个盒子之间没有间距，用线条隔开。下方有分页组件 -->
                    <div class="card-title">我的帖子</div>
                    
                    <!-- 帖子列表（假实现） -->
                    <div class="post-list">
                        <!-- 帖子项1 -->
                        <div class="post-item">
                            <h4 class="post-title">这是我的第一条帖子标题</h4>
                            <p class="post-content">这是帖子的简要内容，展示部分文本信息...</p>
                            <div class="post-meta">
                                <span class="post-time">2025-12-19</span>
                                <span class="post-read">阅读 123</span>
                            </div>
                        </div>
                        <!-- 帖子项2 -->
                        <div class="post-item">
                            <h4 class="post-title">这是我的第二条帖子标题</h4>
                            <p class="post-content">这是帖子的简要内容，展示部分文本信息...</p>
                            <div class="post-meta">
                                <span class="post-time">2025-12-18</span>
                                <span class="post-read">阅读 456</span>
                            </div>
                        </div>
                        <!-- 帖子项3 -->
                        <div class="post-item">
                            <h4 class="post-title">这是我的第三条帖子标题</h4>
                            <p class="post-content">这是帖子的简要内容，展示部分文本信息...</p>
                            <div class="post-meta">
                                <span class="post-time">2025-12-17</span>
                                <span class="post-read">阅读 789</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 分页组件（假实现） -->
                    <div class="pagination">
                        <button class="page-btn prev-btn">上一页</button>
                        <button class="page-btn active">1</button>
                        <button class="page-btn">2</button>
                        <button class="page-btn">3</button>
                        <button class="page-btn next-btn">下一页</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('@/assets/CSS/WePost/animation.css');

/* 页面容器：深色调基础布局 */
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

/* 网格背景样式：深色调网格，适配深色主题 */
.bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    --grid-color: #333333; /* 深色网格线 */
    background-color: #121212; /* 深色背景主色 */
    background-image:
        linear-gradient(0deg, transparent 24%, var(--grid-color) 25%, var(--grid-color) 26%, transparent 27%, transparent 74%, var(--grid-color) 75%, var(--grid-color) 76%, transparent 77%, transparent),
        linear-gradient(90deg, transparent 24%, var(--grid-color) 25%, var(--grid-color) 26%, transparent 27%, transparent 74%, var(--grid-color) 75%, var(--grid-color) 76%, transparent 77%, transparent);
    background-size: 55px 55px;
    z-index: -1;
}

/* 回到首页按钮：深色调适配，橙色强调色 */
.home-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 17px 40px;
    border-radius: 50px;
    cursor: pointer;
    border: none;
    background-color: #1e1e1e; /* 深色按钮背景 */
    box-shadow: 0 0 8px rgba(249, 115, 22, 0.3); /* 橙色阴影增强 */
    font-size: 15px;
    font-weight: 600;
    color: #f97316; /* 橙色文字 */
    transition: all 0.3s ease;
    z-index: 10;
}

.home-btn:focus-visible {
    outline: 2px solid #f97316;
    outline-offset: 2px;
}

.home-btn:hover {
    letter-spacing: 3px;
    background: linear-gradient(135deg, #f97316, #e65100); /* 橙色渐变hover */
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

/* 通用卡片样式（左侧+右侧）：深色卡片背景 */
.info-card,
.function-card {
    background: #1e1e1e; /* 深色卡片背景 */
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3); /* 深色阴影增强 */
    border: 1px solid #333; /* 卡片边框增强层次感 */
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
    background-color: #f97316; /* 橙色头像背景 */
    color: #fff;
    font-size: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center;
    margin: 0 auto;
    border: 2px solid #333; /* 头像边框适配深色 */
}

.user-base .username {
    font-size: 20px;
    font-weight: 700;
    color: #e0e0e0; /* 浅灰色用户名 */
    margin: 0 0 8px 0;
}

/* 性别标签：深色适配 */
.gender-tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    margin-bottom: 12px;
}

.gender-tag.male {
    background: #1a365d; /* 深色系男性标签 */
    color: #3182ce;
}

.gender-tag.female {
    background: #4a1728; /* 深色系女性标签 */
    color: #e53e3e;
}

.gender-tag:not(.male):not(.female) {
    background: #2d2d2d; /* 未设置性别标签 */
    color: #999;
}

.signature {
    font-size: 14px;
    color: #999; /* 浅灰色个性签名 */
    line-height: 1.5;
    margin: 0;
}

/* 左侧：账号信息/预留模块通用标题 */
.card-title {
    font-size: 16px;
    font-weight: 700;
    color: #e0e0e0; /* 浅灰色标题 */
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #333; /* 深色分割线 */
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
    border-bottom: 1px solid #2d2d2d; /* 深色列表分割线 */
}

.info-item .label {
    font-size: 13px;
    color: #999; /* 浅灰色标签文字 */
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

/* 帖子卡片容器 */
.post-card {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.post-list {
    width: 100%;
    margin-bottom: 20px;
}

.post-item {
    padding: 16px 0;
    border-bottom: 1px solid #333; 
    margin: 0; 
}

.post-item:last-child {
    border-bottom: none;
}

.post-title {
    font-size: 16px;
    color: #e0e0e0;
    margin: 0 0 8px 0;
    font-weight: 600;
}

.post-content {
    font-size: 14px;
    color: #999;
    margin: 0 0 8px 0;
    line-height: 1.5;
}

.post-meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #666;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 16px 0 8px 0;
}

.page-btn {
    padding: 8px 16px;
    border-radius: 4px;
    border: 1px solid #333;
    background: #2d2d2d;
    color: #999;
    cursor: pointer;
    transition: all 0.2s ease;
}

.page-btn.active {
    background: #f97316;
    color: #fff;
    border-color: #f97316;
}

.page-btn:hover:not(.active) {
    border-color: #f97316;
    color: #f97316;
}

/* 移动端适配：左右布局转为上下布局，深色适配 */
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

    /* 移动端分页按钮适配 */
    .page-btn {
        padding: 6px 12px;
        font-size: 12px;
    }
}
</style>