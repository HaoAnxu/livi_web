<script setup>
import { queryPostListApi } from "@/api/wepost.js";
import { onMounted, ref, onUnmounted } from "vue";
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";
import { useRouter } from "vue-router";

const router = useRouter();
const userInfo = ref({})
const postList = ref([])

const query = ref({
    page: 1,
    pageSize: 10,
})
const queryPostList = async () => {
    MyLoading.value = true;
    try {
        const result = await queryPostListApi(query.value);
        if (result.code) {
            postList.value = result.data;
            MyLoading.value = false;
        } else {
            MyMessage.error(result.msg);
            MyLoading.value = false;
        }
    } catch (e) {
        MyLoading.value = false;
    }
}

//淡入
const showSplash = ref(sessionStorage.getItem('animation_WP') === 'true')
//淡出
const splashClass = ref('')

onMounted(() => {
    if (showSplash) {
        queryPostList();
        setTimeout(() => {
            splashClass.value = 'hidden'
            setTimeout(() => {
                showSplash.value = false
                sessionStorage.setItem('animation_WP', 'false');
            }, 800)
        }, 2700)
    } else {
        showSplash.value = false;
        queryPostList();
    }
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
        <!-- 背景容器 -->
        <div class="bg"></div>

        <div class="btn-group">
            <button class="home-btn" @click="router.push('/')">
                回到首页
            </button>
            <button class="home-btn share-btn">
                分享日常
            </button>
        </div>

        <div class="user-center-container">
            <!-- 左侧：信息区 -->
            <div class="user-info-sidebar">
                <!-- 基础信息 -->
                <!-- <div class="info-card basic-info">
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
                </div> -->

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
                    <div class="card-title">动态</div>
                    <!-- 帖子列表 -->
                    <div class="post-list">
                        <!-- 帖子项 -->
                        <div class="post-item" v-for="item in postList" :key="item.postId">
                            <!-- 新增：用户信息区域（头像+用户名） -->
                            <div class="post-user">
                                <img class="user-avatar" :src="item.avatar || '/default-avatar.png'" 
                                alt="用户头像"
                                onerror="this.src='/default-avatar.png'"
                                >
                                <span class="user-name">{{ item.username }}</span>
                            </div>

                            <!-- 帖子标题 -->
                            <h4 class="post-title">{{ item.postTitle }}</h4>

                            <!-- 帖子内容 -->
                            <p class="post-content">{{ item.postContent }}</p>

                            <!-- 帖子图片 -->
                            <div class="post-image-wrap" v-if="item.postImage">
                                <img class="post-image" :src="item.postImage" alt="帖子图片">
                            </div>

                            <!-- 帖子元信息（时间/阅读量/圈子名） -->
                            <div class="post-meta">
                                <span class="post-time">{{ item.createTime }}</span>
                                <span class="post-read">阅读 {{ item.readCount }}</span>
                                <span class="post-circle">{{ item.circleName }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 分页组件 -->
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
    --grid-color: #333333;
    /* 深色网格线 */
    background-color: #121212;
    /* 深色背景主色 */
    background-image:
        linear-gradient(0deg, transparent 24%, var(--grid-color) 25%, var(--grid-color) 26%, transparent 27%, transparent 74%, var(--grid-color) 75%, var(--grid-color) 76%, transparent 77%, transparent),
        linear-gradient(90deg, transparent 24%, var(--grid-color) 25%, var(--grid-color) 26%, transparent 27%, transparent 74%, var(--grid-color) 75%, var(--grid-color) 76%, transparent 77%, transparent);
    background-size: 55px 55px;
    z-index: -1;
}

/* 按钮组容器 - 只给容器设置fixed定位 */
.btn-group {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    /* 垂直排列 */
    gap: 20px;
    align-items: flex-end;
}

/* 回到首页/分享按钮通用样式 - 移除fixed，保留其他样式 */
.home-btn {
    padding: 17px 40px;
    border-radius: 50px;
    cursor: pointer;
    border: none;
    background-color: #1e1e1e;
    box-shadow: 0 0 8px rgba(249, 115, 22, 0.3);
    font-size: 15px;
    font-weight: 600;
    color: #f97316;
    transition: all 0.3s ease;
}

.home-btn:focus-visible {
    outline: 2px solid #f97316;
    outline-offset: 2px;
}

.home-btn:hover {
    letter-spacing: 3px;
    background: linear-gradient(135deg, #f97316, #e65100);
    /* 橙色渐变hover */
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
    background: #1e1e1e;
    /* 深色卡片背景 */
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
    /* 深色阴影增强 */
    border: 1px solid #333;
    /* 卡片边框增强层次感 */
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
    /* 橙色头像背景 */
    color: #fff;
    font-size: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center;
    margin: 0 auto;
    border: 2px solid #333;
    /* 头像边框适配深色 */
}

.user-base .username {
    font-size: 20px;
    font-weight: 700;
    color: #e0e0e0;
    /* 浅灰色用户名 */
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
    background: #1a365d;
    /* 深色系男性标签 */
    color: #3182ce;
}

.gender-tag.female {
    background: #4a1728;
    /* 深色系女性标签 */
    color: #e53e3e;
}

.gender-tag:not(.male):not(.female) {
    background: #2d2d2d;
    /* 未设置性别标签 */
    color: #999;
}

.signature {
    font-size: 14px;
    color: #999;
    /* 浅灰色个性签名 */
    line-height: 1.5;
    margin: 0;
}

/* 左侧：账号信息/预留模块通用标题 */
.card-title {
    font-size: 16px;
    font-weight: 700;
    color: #e0e0e0;
    /* 浅灰色标题 */
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #333;
    /* 深色分割线 */
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
    border-bottom: 1px solid #2d2d2d;
    /* 深色列表分割线 */
}

.info-item .label {
    font-size: 13px;
    color: #999;
    /* 浅灰色标签文字 */
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
    padding: 16px;  /* 增加内边距，提升视觉舒适度 */
    border-bottom: 1px solid #333;
    margin: 0;
    background-color: #1a1a1a;  /* 增加背景色，区分每个帖子项 */
    border-radius: 8px;  /* 圆角优化 */
    margin-bottom: 12px;  /* 帖子项之间增加间距 */
}

.post-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

/* 新增：用户信息区域样式 */
.post-user {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;  /* 圆形头像 */
    object-fit: cover;  /* 头像裁剪，避免变形 */
    border: 1px solid #444;  /* 头像边框，增加层次感 */
}

.user-name {
    font-size: 14px;
    color: #e0e0e0;
    font-weight: 500;
}

.post-title {
    font-size: 16px;
    color: #e0e0e0;
    margin: 0 0 8px 0;
    font-weight: 600;
    line-height: 1.4;
}

.post-content {
    font-size: 14px;
    color: #999;
    margin: 0 0 12px 0;  /* 增加底部间距，区分内容和图片 */
    line-height: 1.5;
}

/* 新增：帖子图片区域样式 */
.post-image-wrap {
    margin: 0 0 12px 0;
    border-radius: 6px;
    overflow: hidden;  /* 裁剪图片圆角 */
}

.post-image {
    width: 100%;
    max-height: 300px;  /* 限制图片最大高度，避免过长 */
    object-fit: cover;  /* 图片自适应，保持比例 */
    cursor: pointer;  /* 鼠标悬浮变手型，提示可点击（可选） */
    transition: transform 0.2s ease;
}

.post-image:hover {
    transform: scale(1.01);  /* 悬浮轻微放大，提升交互感 */
}

.post-meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #666;
    align-items: center;
}

/* 优化元信息文字颜色，区分不同维度 */
.post-time {
    color: #777;
}
.post-read {
    color: #888;
}
.post-circle {
    color: #f97316;  /* 圈子名用主题色，突出显示 */
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