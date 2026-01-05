<script setup>
import { queryPostByUserIdApi, queryCircleListByUserIdApi } from "@/api/wepost.js";
import { queryUserInfoApi } from "@/api/user.js";
import { onMounted, ref } from "vue";
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";
import { useRouter, useRoute } from "vue-router";
import PutPost from "@/components/PutPost.vue";

//是否展示发表弹窗
const showPutPost = ref(false)
//是否展示发布按钮
const showPublishBtn = ref(true)

const route = useRoute()
const router = useRouter()
// 初始化登录用户
const loginUser = ref('');
const postList = ref([])
const userId = ref(0)
const query = ref({
    page: 1,
    pageSize: 10,
})
// 查询用户信息
const userInfo = ref({})
const queryUserInfo = async () => {
    userId.value = Number(route.query.userId);
    MyLoading.value = true;
    try {
        const result = await queryUserInfoApi(userId.value);
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
const userData = ref({
    circleCount: 0,
    followCount: 0,
    fansCount: 0,
    likesCount: 0,
})
//查已加入的圈子列表
const circleList = ref([])
const total = ref(0)
const queryData = ref({
    id: 0,
    page: 1,
    pageSize: 4,
})
const queryCircleList = async () => {
    userId.value = Number(route.query.userId);
    MyLoading.value = true;
    try {
        queryData.value.id = userId.value;
        const result = await queryCircleListByUserIdApi(queryData.value);
        if (result.code) {
            circleList.value = result.data.rows;
            total.value = result.data.total;
            userData.value.circleCount = result.data.total;
            MyLoading.value = false;
        } else {
            MyMessage.error(result.msg);
            MyLoading.value = false;
        }
    } catch (e) {
        MyLoading.value = false;
    }
}
// 下一页
const nextPageCircle = async () => {
    if (total.value / queryData.value.pageSize <= queryData.value.page) {
        queryData.value.page = 1;
    }
    else {
        queryData.value.page++;
    }
    await queryCircleList();
};

// 查询用户发布的帖子
const queryPostListByUserId = async () => {
    userId.value = Number(route.query.userId);
    MyLoading.value = true;
    try {
        const result = await queryPostByUserIdApi({
            id: userId.value,
            page: query.value.page,
            pageSize: query.value.pageSize,
        });
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
        queryPostListByUserId();
    } else {
        MyMessage.error('已经是第一页了');
    }
}
const nextPage = async () => {
    query.value.page++;
    await queryPostListByUserId();
    console.log(postList.value.length);
    if (postList.value.length === 0) {
        MyMessage.error('没有更多了');
        query.value.page--;
        await queryPostListByUserId();
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
//淡入
const showSplash = ref(sessionStorage.getItem('animation_WP') === 'true')
//淡出
const splashClass = ref('')

onMounted(() => {
    const userInfo = sessionStorage.getItem('loginUser');
    if (!userInfo) {
        router.push('/login');
        MyMessage.warn('请先登录')
        return;
    }
    loginUser.value = JSON.parse(userInfo).username;
    userId.value = JSON.parse(userInfo).userId;
    if (userId.value === 0) {
        showPublishBtn.value = false
    }
    if (showSplash) {
        queryPostListByUserId();
        queryCircleList();
        queryUserInfo();
        setTimeout(() => {
            splashClass.value = 'hidden'
            setTimeout(() => {
                showSplash.value = false
                sessionStorage.setItem('animation_WP', 'false');
            }, 800)
        }, 2700)
    } else {
        showSplash.value = false;
        queryPostListByUserId();
        queryUserInfo();
        queryCircleList();
    }
})
</script>

<template>
    <PutPost :visible="showPutPost" @close="showPutPost = false" />
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
            <p class="login-user" @click="toHome" style="cursor: pointer;">
                首页
            </p>
            <p class="login-user" @click="toUserDetail(userId)" style="cursor: pointer;">
                {{ loginUser == null ? '未登录' : loginUser }}
            </p>
            <button class="button button-item" @click="showPutPost = true" v-if="showPublishBtn">
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

                <!-- 数据信息 -->
                <div class="info-card account-info">
                    <div class="info-list">
                        <div class="info-item">
                            <span class="label">圈子：{{ userData.circleCount }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">关注：{{ userData.followCount }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">粉丝：{{ userData.fansCount }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">获赞：{{ userData.likesCount }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧 -->
            <div class="user-function-main">
                <!-- 圈子列表 -->
                <div class="function-card content-card">
                    <div class="card-header">
                        <div class="card-title">已加入圈子</div>
                        <button class="refresh-btn" @click="nextPageCircle">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                viewBox="0 0 16 16">
                                <path
                                    d="M8.293 5.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L10.586 11H3a1 1 0 1 1 0-2h7.586L8.293 6.707a1 1 0 0 1 0-1.414z" />
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
                            <div class="post-user">
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