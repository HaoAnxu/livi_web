<script setup>
import { queryPostDetailApi } from "@/api/wepost.js";
import { queryUserInfoApi } from "@/api/user.js";
import { onMounted, ref } from "vue";
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";
import { useRouter, useRoute } from "vue-router";

const route = useRoute()
const router = useRouter()
const userId = ref(0)
const postId = ref(0)
const loginUser = ref('');
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

// 查询帖子详情
const postDetail = ref({})
const queryPostDetail = async () => {
    postId.value = Number(route.query.postId);
    MyLoading.value = true;
    try {
        const result = await queryPostDetailApi(postId.value);
        if (result.code) {
            postDetail.value = result.data;
            MyLoading.value = false;
        } else {
            MyMessage.error(result.msg);
            MyLoading.value = false;
        }
    } catch (e) {
        MyLoading.value = false;
    }
}

// 评论区相关（空实现，仅UI）
const commentContent = ref('') // 评论输入框内容
const commentList = ref([ // 模拟评论数据，仅用于展示效果
    {
        commentId: 1,
        userName: '游客1',
        userAvatar: '',
        commentContent: '这个帖子内容很有价值！',
        createTime: '2025-12-20 10:30:00'
    },
    {
        commentId: 2,
        userName: '游客2',
        userAvatar: '',
        commentContent: '支持楼主，期待更多分享～',
        createTime: '2025-12-20 11:15:00'
    }
])

// 空实现：提交评论（仅提示）
const submitComment = () => {
    if (!commentContent.value.trim()) {
        MyMessage.warning('请输入评论内容');
        return;
    }
    MyMessage.info('评论提交功能暂未实现');
    commentContent.value = '';
}

// 空实现：取消评论
const cancelComment = () => {
    commentContent.value = '';
}

//跳转到对应的页面
const toPostDetail = (postId) => {
    router.push({
        name: 'postDetail',
        query: { postId: postId }
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
    if (showSplash) {
        queryPostDetail();
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
        queryUserInfo();
        queryPostDetail();
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
                <!-- 单个帖子详情展示 -->
                <div class="function-card content-card post-card">
                    <div class="card-title">动态详情</div>
                    <!-- 空值判断 -->
                    <div class="post-detail" v-if="postDetail.postId">
                        <!-- 帖子标题 -->
                        <h4 class="post-title">{{ postDetail.postTitle }}</h4>
                        <!-- 帖子内容 -->
                        <div class="post-content">{{ postDetail.postContent }}</div>
                        <!-- 帖子图片 -->
                        <div class="post-image-wrap" v-if="postDetail.postImage">
                            <img class="post-image" :src="postDetail.postImage" alt="帖子图片">
                        </div>
                        <!-- 帖子元信息 -->
                        <div class="post-meta">
                            <span class="post-time">{{ postDetail.createTime }}</span>
                            <span class="post-circle">{{ postDetail.circleName }}</span>
                            <span class="post-comment">评论 {{ postDetail.commentCount || 0 }}</span>
                            <span class="post-like">点赞 {{ postDetail.likeCount || 0 }}</span>
                        </div>
                    </div>
                    <!-- 空状态提示 -->
                    <div class="post-empty" v-else>
                        暂无帖子详情
                    </div>
                </div>

                <!-- 评论区（空实现仅UI） -->
                <div class="function-card content-card comment-card">
                    <div class="card-title">评论区 ({{ commentList.length }})</div>

                    <!-- 评论输入框 -->
                    <div class="comment-input-wrap">
                        <textarea v-model="commentContent" class="comment-input" placeholder="说点什么..."
                            rows="3"></textarea>
                        <div class="comment-btn-group">
                            <button class="comment-btn cancel-btn" @click="cancelComment">取消</button>
                            <button class="comment-btn submit-btn" @click="submitComment">发布评论</button>
                        </div>
                    </div>

                    <!-- 评论列表 -->
                    <div class="comment-list" v-if="commentList.length">
                        <div class="comment-item" v-for="item in commentList" :key="item.commentId">
                            <!-- 评论用户头像 -->
                            <div class="comment-avatar">
                                <div class="avatar-small"
                                    :style="{ backgroundImage: item.userAvatar ? `url(${item.userAvatar})` : 'none' }">
                                    <span v-if="!item.userAvatar">{{ item.userName.charAt(0) }}</span>
                                </div>
                            </div>
                            <!-- 评论内容 -->
                            <div class="comment-content-wrap">
                                <div class="comment-user">{{ item.userName }}</div>
                                <div class="comment-text">{{ item.commentContent }}</div>
                                <div class="comment-time">{{ item.createTime }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 评论空状态 -->
                    <div class="comment-empty" v-else>
                        暂无评论，快来抢沙发～
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

/* 帖子详情样式 */
.post-detail {
    padding: 16px 0;
}

.post-title {
    font-size: 24px !important;
    /* 标题放大 */
    font-weight: 700;
    color: #e0e0e0;
    margin: 0 0 16px 0;
    line-height: 1.4;
}

.post-content {
    font-size: 18px !important;
    /* 内容放大 */
    color: #d0d0d0;
    line-height: 1.6;
    margin: 0 0 20px 0;
    white-space: pre-wrap;
    /* 保留换行 */
}

.post-image-wrap {
    margin: 20px 0;
    text-align: center;
}

.post-image {
    max-width: 800px;
    /* 图片最大宽度 */
    max-height: 600px;
    /* 图片最大高度 */
    width: 100%;
    /* 自适应宽度 */
    height: auto;
    /* 高度自动缩放 */
    border-radius: 8px;
    object-fit: contain;
    /* 保持图片比例 */
}

.post-meta {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #999;
    padding-top: 12px;
    border-top: 1px solid #333;
}

.post-empty {
    text-align: center;
    padding: 40px 0;
    color: #999;
    font-size: 16px;
}

/* 评论区样式（空实现） */
.comment-card {
    margin-top: 20px;
}

.comment-input-wrap {
    margin-bottom: 24px;
}

.comment-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #444;
    border-radius: 8px;
    background-color: #222;
    color: #e0e0e0;
    font-size: 14px;
    resize: none;
    box-sizing: border-box;
}

.comment-input::placeholder {
    color: #666;
}

.comment-btn-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
}

.comment-btn {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    border: none;
}

.cancel-btn {
    background-color: #444;
    color: #e0e0e0;
}

.submit-btn {
    background-color: #f97316;
    color: #fff;
}

.comment-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.comment-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #333;
}

.avatar-small {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #f97316;
    color: #fff;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center;
}

.comment-content-wrap {
    flex: 1;
}

.comment-user {
    font-size: 14px;
    font-weight: 600;
    color: #e0e0e0;
    margin-bottom: 4px;
}

.comment-text {
    font-size: 14px;
    color: #d0d0d0;
    line-height: 1.5;
    margin-bottom: 4px;
}

.comment-time {
    font-size: 12px;
    color: #666;
}

.comment-empty {
    text-align: center;
    padding: 40px 0;
    color: #999;
    font-size: 16px;
}
</style>