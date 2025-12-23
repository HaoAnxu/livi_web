<script setup>
import { queryPostListApi, queryCarouselImageListApi, queryCircleListApi, queryNewsListApi } from "@/api/wepost.js";
import { onMounted, ref } from "vue";
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";
import { useRouter } from "vue-router";

const router = useRouter();
const loginUser = ref('');
const userId = ref('');
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
    } else {
        MyMessage.error('已经是第一页了');
    }
}
const nextPage = async () => {
    query.value.page++;
    await queryPostList();
    console.log(postList.value.length);
    if (postList.value.length === 0) {
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
const toPostDetail = (postId, userId) => {
    router.push({
        name: 'postDetail',
        query: { postId: postId, userId: userId }
    });
}
const toCircleDetail = (circleId) => {
    router.push({
        name: 'circlePost',
        query: { circleId: circleId }
    });
}
const toUserDetail = (userId) => {
    router.push({
        name: 'userPost',
        query: { userId: userId }
    });
}


//淡入
const showSplash = ref(sessionStorage.getItem('animation_WP') === 'true')
//淡出
const splashClass = ref('')

onMounted(() => {
    // 初始化登录用户
    const userInfo = sessionStorage.getItem('loginUser');
    loginUser.value = userInfo ? JSON.parse(userInfo).username : '';
    userId.value = userInfo ? JSON.parse(userInfo).userId : '';
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
            <p class="login-user" @click="toUserDetail(userId)" style="cursor: pointer;">
                {{ loginUser == null ? '未登录' : loginUser }}
            </p>
            <button class="button button-item">
                <span class="button-bg">
                    <span class="button-bg-layers">
                        <span class="button-bg-layer button-bg-layer-1 -purple"></span>
                        <span class="button-bg-layer button-bg-layer-2 -turquoise"></span>
                        <span class="button-bg-layer button-bg-layer-3 -yellow"></span>
                    </span>
                </span>
                <span class="button-inner">
                    <span class="button-inner-static">发布</span>
                </span>
            </button>
        </div>

        <!-- 核心布局容器 -->
        <div class="user-center-container">
            <!-- 左侧 -->
            <div class="user-info-sidebar">
                <!-- 热点话题 -->
                <div class="info-card account-info">
                    <div class="card-title">热点话题#</div>
                    <div class="info-list">
                        <div class="info-item" v-for="(item, index) in newsList" :key="item.postId"
                            @click="toPostDetail(item.postId, item.userId)">
                            <span class="label">
                                <span :style="{ color: index < 3 ? 'red' : '', fontSize: '16px' }">{{ index + 1
                                }}.</span>
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

                <!-- 广告区域 -->
                <div class="info-card account-info ad-card">
                    <div class="card-title">推荐推广</div>
                    <div class="info-list ad-list">
                        <!-- 广告项1 -->
                        <div class="ad-item">
                            <div class="ad-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#f97316"
                                    viewBox="0 0 24 24">
                                    <path
                                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                </svg>
                            </div>
                            <div class="ad-content">
                                <div class="ad-title">LiVi会员特权</div>
                                <div class="ad-desc">解锁更多社区功能</div>
                            </div>
                            <div class="ad-tag">推广</div>
                        </div>
                        <!-- 广告项2 -->
                        <div class="ad-item">
                            <div class="ad-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#3182ce"
                                    viewBox="0 0 24 24">
                                    <path
                                        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                </svg>
                            </div>
                            <div class="ad-content">
                                <div class="ad-title">热门圈子推荐</div>
                                <div class="ad-desc">加入感兴趣的社区</div>
                            </div>
                            <div class="ad-tag">推广</div>
                        </div>
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
                        <div class="circle-item" v-for="item in circleList" :key="item.circleId"
                            @click="toCircleDetail(item.circleId, item.userId)">
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
                        <div class="post-item" v-for="item in postList" :key="item.postId">
                            <!-- 发帖用户信息：头像+用户名 -->
                            <div class="post-user" @click="toUserDetail(item.userId)" style="cursor: pointer;">
                                <img class="user-avatar" :src="item.userAvatar || '/default-avatar.png'" alt="用户头像"
                                    onerror="this.src='/default-avatar.png'">
                                <span class="user-name">{{ item.userName }}</span>
                            </div>
                            <div @click="toPostDetail(item.postId, item.userId)" style="cursor: pointer;">
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
@import url('@/assets/CSS/WePost/main.css');
</style>