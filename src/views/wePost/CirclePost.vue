<script setup>
import { queryPostListByCircleIdApi, queryCircleListApi, queryCircleDetailApi, queryNewsListApi } from "@/api/wepost.js";
import { onMounted, ref, watch } from "vue";
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";
import { useRouter, useRoute } from "vue-router";

const route = useRoute()
const router = useRouter();

const circleId = ref(0)
//查询圈子详情列表
const circleDetail = ref({})
const queryCircleDetail = async () => {
    // 先判断circleId是否有效，避免空查询
    if (!route.query.circleId) {
        MyMessage.warning('无效的圈子ID');
        return;
    }
    circleId.value = route.query.circleId;
    MyLoading.value = true;
    try {
        const result = await queryCircleDetailApi(circleId.value);
        if (result.code) {
            circleDetail.value = result.data;
            MyLoading.value = false;
        } else {
            MyMessage.error(result.msg);
            MyLoading.value = false;
        }
    } catch (e) {
        MyLoading.value = false;
        console.error('查询圈子详情失败：', e);
    }
}

// 根据圈子id查询帖子列表
const postList = ref([])
const query = ref({
    id: 0,
    page: 1,
    pageSize: 10,
})
const queryPostList = async () => {
    if (!route.query.circleId) {
        postList.value = [];
        return;
    }
    query.value.id = route.query.circleId;
    // 重置页码，避免切换圈子后页码残留
    query.value.page = 1;
    MyLoading.value = true;
    try {
        const result = await queryPostListByCircleIdApi(query.value)
        if (result.code) {
            postList.value = result.data;
            MyLoading.value = false;
        } else {
            MyMessage.error(result.msg);
            MyLoading.value = false;
        }
    } catch (e) {
        MyLoading.value = false;
        console.error('查询圈子帖子失败：', e);
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
    if (postList.value.length === 0) {
        MyMessage.error('没有更多了');
        query.value.page--;
        // 无需重复调用queryPostList，避免二次加载
    }
}
// 查询推荐圈子列表
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
        console.error('查询推荐圈子失败：', e);
    }
}

//跳转到对应的页面
const toPostDetail = (postId, userId) => {
    router.push({
        name: 'postDetail',
        query: { postId: postId, userId: userId }
    });
}

// 跳转圈子详情的方法
const toCircleDetail = (targetCircleId) => {
    // 判断是否是当前圈子，避免无效跳转
    const currentCircleId = route.query.circleId;
    if (targetCircleId === currentCircleId) {
        MyMessage.info('已经在当前圈子页面');
        return;
    }
    // 只跳转路由，不调用接口（接口通过watch监听路由变化触发）
    router.push({
        name: 'circlePost',
        query: { circleId: targetCircleId }
    });
}

const toUserDetail = (userId) => {
    router.push({
        name: 'userPost',
        query: { userId: userId }
    });
}

// 监听路由参数变化，自动刷新数据
watch(
    () => route.query.circleId,
    (newCircleId) => {
        if (newCircleId) {
            queryCircleDetail();
            queryPostList();
        }
    },
    { immediate: true }
)

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

//淡入
const showSplash = ref(sessionStorage.getItem('animation_WP') === 'true')
//淡出
const splashClass = ref('')

onMounted(() => {
    if (showSplash) {
        queryNewsList();
        queryCircleList();
        setTimeout(() => {
            splashClass.value = 'hidden'
            setTimeout(() => {
                showSplash.value = false
                sessionStorage.setItem('animation_WP', 'false');
            }, 800)
        }, 2700)
    } else {
        showSplash.value = false;
        queryCircleList();
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
        <div class="user-center-container">
            <!-- 左侧：信息区 -->
            <div class="user-info-sidebar">
                <div class="info-card basic-info">
                    <div class="avatar-box">
                        <div class="avatar"
                            :style="{ backgroundImage: circleDetail.circleAvatar ? `url(${circleDetail.circleAvatar})` : 'none' }">
                            <span v-if="!circleDetail.circleAvatar">{{ circleDetail.circleName ?
                                circleDetail.circleName.charAt(0) : '圈'
                            }}</span>
                        </div>
                    </div>
                    <div class="user-base">
                        <h3 class="username">{{ circleDetail.circleName || '未设置圈子名' }}</h3>
                        <p class="signature">{{ circleDetail.circleDesc || '这个圈子很懒，什么都没留下～' }}</p>
                    </div>
                </div>

                <!-- 热点话题 -->
                <div class="info-card account-info">
                    <div class="card-title">热点话题#</div>
                    <div class="info-list">
                        <div class="info-item" v-for="(item, index) in newsList" :key="item.postId"
                            @click="toPostDetail(item.postId,item.userId)">
                            <span class="label">
                                <span :style="{ color: index < 3 ? 'red' : '', fontSize: '16px' }">{{ index + 1
                                }}.</span>
                                {{ item.postTitle }}
                            </span>
                        </div>
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

            <!-- 右侧：帖子区 -->
            <div class="user-function-main">
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
                            @click="toCircleDetail(item.circleId)">
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
@import url('@/assets/CSS/WePost/leftInfo.css');
</style>