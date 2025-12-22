<script setup>
import { queryPostListApi, queryCarouselImageListApi, queryCircleListApi, queryNewsListApi } from "@/api/wepost.js";
import { onMounted, ref, onUnmounted } from "vue";
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";

const loginUser = ref('');
const postList = ref([])
const query = ref({
    page: 1,
    pageSize: 10,
})
//查询帖子列表
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
// 分页
const prevPage = () => {
    if (query.value.page > 1) {
        query.value.page--;
        queryPostList();
    }else{
        MyMessage.error('已经是第一页了');
    }
}
const nextPage = async() => {
    query.value.page++;
    await queryPostList();
    console.log(postList.value.length);
    if(postList.value.length === 0){
        MyMessage.error('没有更多了');
        query.value.page--;
        await queryPostList();
    }
}
//查询轮播图片
const CarouselImageList = ref([])
const queryCarouselImageList = async () => {
    MyLoading.value = true;
    try {
        const result = await queryCarouselImageListApi();
        if (result.code) {
            CarouselImageList.value = result.data;
            MyLoading.value = false;
        } else {
            MyMessage.error(result.msg);
            MyLoading.value = false;
        }
    } catch (e) {
        MyLoading.value = false;
    }
}
// 查询圈子列表
const circleList = ref([])
const queryCircleList = async () => {
    MyLoading.value = true;
    try {
        const result = await queryCircleListApi()
        if (result.code) {
            circleList.value = result.data;
            MyLoading.value = false;
        } else {
            MyMessage.error(result.msg);
            MyLoading.value = false;
        }
    } catch (e) {
        MyLoading.value = false;
    }
}

// 查询热点新闻
const newsList = ref([])
const queryNewsList = async () => {
    MyLoading.value = true;
    try {
        const result = await queryNewsListApi()
        if (result.code) {
            newsList.value = result.data;
            MyLoading.value = false;
        } else {
            MyMessage.error(result.msg);
            MyLoading.value = false;
        }
    } catch (e) {
        MyLoading.value = false;
    }
}

//跳转到对应的页面
const toPostDetail = (postId) => {
    // 待开发
    MyMessage.error('待开发postId=' + postId);
}
const toCircleDetail = (circleId) => {
    // 待开发
    MyMessage.error('待开发circleId=' + circleId);
}


//淡入
const showSplash = ref(sessionStorage.getItem('animation_WP') === 'true')
//淡出
const splashClass = ref('')

onMounted(() => {
    // 初始化登录用户
    const userInfo = sessionStorage.getItem('loginUser');
    loginUser.value = userInfo ? JSON.parse(userInfo).username : '';
    //查询轮播图片
    queryCarouselImageList();
    //查询圈子列表
    queryCircleList();
    //查询热点新闻
    queryNewsList();
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

        <!-- 顶部搜索栏 -->
        <div class="top-header">
            <!-- 搜索框 -->
            <div class="search-container">
                <div class="group">
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="search-icon">
                        <g>
                            <path
                                d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z">
                            </path>
                        </g>
                    </svg>
                    <input id="query" class="input" type="search" placeholder="搜索话题/用户/帖子..." name="searchbar" />
                </div>
            </div>
            <p class="login-user">{{ loginUser == null ? '未登录' : loginUser }}</p>
        </div>

        <!-- 核心布局容器 -->
        <div class="user-center-container">
            <!-- 左侧 -->
            <div class="user-info-sidebar">
                <!-- 热点话题 -->
                <div class="info-card account-info">
                    <div class="card-title">热点话题#</div>
                    <div class="info-list">
                        <div class="info-item" v-for="(item, index) in newsList" :key="item.postId" @click="toPostDetail(item.postId)">
                            <span class="label">
                                <span :style="{ color: index < 3 ? 'red' : '', fontSize: '16px' }">{{ index + 1 }}.</span>
                                {{ item.postTitle }}
                            </span>
                        </div>
                    </div>
                </div>
                <!-- 社区公约 -->
                <div class="info-card reserve-module">
                    <div class="card-title">WePost社区公约</div>
                    <div class="reserve-content">
                        <p>1. 遵守社区公约，不发布违规内容。</p>
                        <p>2. 尊重其他用户，不进行人身攻击或人身伤害。</p>
                        <p>3. 分享有趣的日常，不发布广告或推广产品。</p>
                    </div>
                </div>
            </div>

            <!-- 右侧 -->
            <div class="user-function-main">
                <!-- 公告轮播区 -->
                <div class="function-card menu-card carousel-card">
                    <el-carousel height="320px" motion-blur>
                        <el-carousel-item v-for="item in CarouselImageList" :key="item.carouselImageId" interval="5000">
                            <img class="carousel-image" :src="item.image" alt="轮播图片">
                        </el-carousel-item>
                    </el-carousel>
                </div>

                <!-- 圈子列表 -->
                <div class="function-card content-card">
                    <div class="card-header">
                        <div class="card-title">推荐圈子</div>
                        <!-- 刷新按钮 -->
                        <button class="refresh-btn" @click="queryCircleList">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                viewBox="0 0 16 16">
                                <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                                <path
                                    d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                            </svg>
                        </button>
                    </div>
                    <!-- 圈子列表 -->
                    <div class="circle-list">
                        <div class="circle-item" v-for="item in circleList" :key="item.circleId" @click="toCircleDetail(item.circleId)">
                            <img :src="item.circleAvatar || '/default-circle-avatar.png'" alt="圈子头像"
                                class="circle-avatar">
                            <span class="circle-name">{{ item.circleName }}</span>
                        </div>
                    </div>
                </div>

                <!-- 帖子列表+分页 -->
                <div class="function-card content-card post-card">
                    <div class="card-title">动态</div>
                    <div class="post-list">
                        <div class="post-item" v-for="item in postList" :key="item.postId" @click="toPostDetail(item.postId)">
                            <!-- 发帖用户信息：头像+用户名 -->
                            <div class="post-user">
                                <img class="user-avatar" :src="item.userAvatar || '/default-avatar.png'" alt="用户头像"
                                    onerror="this.src='/default-avatar.png'">
                                <span class="user-name">{{ item.userName }}</span>
                            </div>
                            <h4 class="post-title">{{ item.postTitle }}</h4>
                            <p class="post-content">{{ item.postContent }}</p>
                            <!-- 帖子图片 -->
                            <div class="post-image-wrap" v-if="item.postImage">
                                <img class="post-image" :src="item.postImage" alt="帖子图片">
                            </div>
                            <!-- 帖子元信息 -->
                            <div class="post-meta">
                                <span class="post-time">{{ item.createTime }}</span>
                                <span class="post-circle">{{ item.circleName }}</span>
                                <span class="post-comment">评论 {{ item.commentCount || 0 }}</span>
                                <span class="post-like">点赞 {{ item.likeCount || 0 }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 分页组件 -->
                    <div class="pagination">
                        <button class="page-btn prev-btn" @click="prevPage">上一页</button>
                        <button class="page-btn next-btn" @click="nextPage">下一页</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('@/assets/CSS/WePost/animation.css');

/* 轮播图样式 */
.carousel-image {
    width: 100%;
    height: 100%;
    object-fit: fill;
    display: block;
    margin: 0 auto;
}

/* 登录用户 */
.login-user {
    color: #fff;
    font-size: 14px;
    cursor: pointer;
}

/* 全局页面容器：基础布局+深色背景 */
.page-wrapper {
    width: 100%;
    min-height: 100vh;
    padding: 20px 24px;
    /* 屏幕两侧保留间距 */
    box-sizing: border-box;
    overflow-x: hidden;
}

/* 背景网格：深色主题适配 */
.bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    --grid-color: #333333;
    background-color: #121212;
    background-image:
        linear-gradient(0deg, transparent 24%, var(--grid-color) 25%, var(--grid-color) 26%, transparent 27%, transparent 74%, var(--grid-color) 75%, var(--grid-color) 76%, transparent 77%, transparent),
        linear-gradient(90deg, transparent 24%, var(--grid-color) 25%, var(--grid-color) 26%, transparent 27%, transparent 74%, var(--grid-color) 75%, var(--grid-color) 76%, transparent 77%, transparent);
    background-size: 55px 55px;
    z-index: -1;
}

/* 顶部头部区域：搜索框+简约按钮 */
.top-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(18, 18, 18, 0.95);
    border-bottom: 1px solid #333;
    z-index: 10;
    box-sizing: border-box;
}

/* 搜索容器：调整宽度适配顶部 */
.search-container {
    margin: 0 auto;
    width: 100%;
    max-width: 400px;
}

.group {
    display: flex;
    line-height: 28px;
    align-items: center;
    position: relative;
    width: 100%;
    max-width: 400px;
}

.input {
    font-family: "Montserrat", sans-serif;
    width: 100%;
    height: 45px;
    padding-left: 2.5rem;
    box-shadow: 0 0 0 1.5px #2b2c37, 0 0 25px -17px #000;
    border: 0;
    border-radius: 12px;
    background-color: #16171d;
    outline: none;
    color: #bdbecb;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
    cursor: text;
    z-index: 0;
}

.input::placeholder {
    color: #bdbecb;
}

.input:hover {
    box-shadow: 0 0 0 2.5px #2f303d, 0px 0px 25px -15px #000;
}

.input:active {
    transform: scale(0.95);
}

.input:focus {
    box-shadow: 0 0 0 2.5px #2f303d;
}

.search-icon {
    position: absolute;
    left: 1rem;
    fill: #bdbecb;
    width: 1rem;
    height: 1rem;
    pointer-events: none;
    z-index: 1;
}

/* 核心布局：左侧侧边栏+右侧内容区 */
.user-center-container {
    width: 100%;
    max-width: 1100px;
    margin: 60px auto 0;
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 12px;
}

/* 左侧侧边栏容器：取消自定义宽度，占满网格列 */
.user-info-sidebar {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 通用卡片样式：左侧+右侧统一风格 */
.info-card,
.function-card {
    background: #1e1e1e;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
    border: 1px solid #333;
}

/* 卡片标题通用样式 */
.card-title {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #444;
}

/* 左侧热门话题列表 */
.info-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.info-item {
    padding: 8px 0;
    border-bottom: 1px solid #2d2d2d;
}

/* 提升文字对比度 */
.info-item .label {
    font-size: 14px;
    color: #e0e0e0;
    cursor: pointer;
}

/* 左侧预留模块 */
.reserve-module .reserve-content {
    padding: 16px 0;
    text-align: left;
    color: #e0e0e0;
    font-size: 13px;
    line-height: 1.6;
}

.user-function-main {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

/* 刷新按钮样式 */
.refresh-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid #444;
    background-color: #2d2d2d;
    color: #e0e0e0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    padding: 0;
}

.refresh-btn:hover {
    border-color: #f97316;
    color: #f97316;
    background-color: #1e1e1e;
}

.refresh-btn:active {
    transform: scale(0.95);
}

/* 圈子列表容器 */
.circle-list {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

/* 单个圈子项 */
.circle-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 150px;
    cursor: pointer;
}

/* 圈子头像 */
.circle-avatar {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid #444;
    margin-bottom: 6px;
    background-color: #2d2d2d;
}

/* 圈子名称 */
.circle-name {
    font-size: 12px;
    color: #ffffff;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
}

/* 帖子列表容器 */
.post-list {
    width: 100%;
    margin-bottom: 20px;
}

/* 单个帖子项样式 */
.post-item {
    padding: 16px;
    border-bottom: 1px solid #333;
    background-color: #1a1a1a;
    border-radius: 8px;
    margin-bottom: 12px;
}

.post-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

/* 发帖用户信息：头像+用户名 */
.post-user {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #444;
}

.user-name {
    font-size: 14px;
    color: #ffffff;
    font-weight: 500;
}

/* 帖子内容样式*/
.post-title {
    font-size: 16px;
    color: #ffffff;
    margin: 0 0 8px 0;
    font-weight: 600;
    line-height: 1.4;
}

.post-content {
    font-size: 14px;
    color: #e0e0e0;
    margin: 0 0 12px 0;
    line-height: 1.5;
}

/* 帖子图片容器 */
.post-image-wrap {
    margin: 0 0 12px 0;
    border-radius: 6px;
    overflow: hidden;
}

.post-image {
    width: 150px;
    height: 150px;
    object-fit: cover;
    cursor: pointer;
}

/* 帖子元信息 */
.post-meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #cccccc;
    align-items: center;
}

.post-time {
    color: #cccccc;
}

.post-circle {
    color: #f97316;
}

/* 分页组件样式 */
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
    color: #e0e0e0;
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

/* 响应式适配 */
@media (max-width: 768px) {
    .login-user {
        display: none;
    }

    .carousel-card {
        display: none;
    }

    .top-header {
        flex-direction: column;
        gap: 12px;
        padding: 12px 16px;
        height: 65px;
    }

    .search-container {
        margin: 0 auto;
        max-width: 100%;
    }

    /* 移动端页面容器 */
    .page-wrapper {
        padding: 15px 16px;
    }

    .user-center-container {
        grid-template-columns: 1fr;
        margin-top: 70px;
        padding: 0;
        gap: 16px;
    }

    .page-btn {
        padding: 6px 12px;
        font-size: 12px;
    }

    .post-image {
        width: 100%;
        height: auto;
        max-height: 250px;
    }

    .circle-list {
        display: flex;
        gap: 16px;
    }

    .circle-item {
        width: 55px;
        flex-shrink: 0;
    }

    .circle-avatar {
        width: 45px;
        height: 45px;
    }
}
</style>