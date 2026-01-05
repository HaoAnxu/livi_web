<script setup>
import { queryPostDetailApi, sendCommentApi, replyCommentApi, queryCommentListApi, deleteCommentApi, queryReplyCommentListApi, queryCommentCountApi } from "@/api/wepost.js";
import { queryUserInfoApi } from "@/api/user.js";
import { onMounted, ref } from "vue";
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";
import { useRouter, useRoute } from "vue-router";
import PutPost from "@/components/PutPost.vue";

// 基础显示控制
const showPutPost = ref(false)
const showPublishBtn = ref(true)
const route = useRoute()
const router = useRouter()
const showSplash = ref(sessionStorage.getItem('animation_WP') === 'true')
const splashClass = ref('')

// 统一用户信息（登录用户）
const loginUser = ref(JSON.parse(sessionStorage.getItem('loginUser')))
const loginUserId = ref(loginUser.value ? loginUser.value.userId : 0) // 登录用户ID
const loginUserName = ref(loginUser.value ? loginUser.value.username : '') // 登录用户名

// 帖子相关
const postId = ref(0)             
const postDetail = ref({})        
const postAuthorInfo = ref({})

// 查询帖子作者信息
const queryUserInfo = async () => {
    const targetUserId = Number(route.query.userId);
    try {
        const result = await queryUserInfoApi(targetUserId);
        if (result.code) postAuthorInfo.value = result.data;
    } catch (e) {
        console.error('查询用户信息失败：', e);
    }
}

// 查询帖子详情
const queryPostDetail = async () => {
    postId.value = Number(route.query.postId);
    try {
        const result = await queryPostDetailApi(postId.value);
        if (result.code) postDetail.value = result.data;
    } catch (e) {
        console.error('查询帖子详情失败：', e);
    }
}

// 根评论相关
const commentTree = ref([])               
const commentQuery = ref({                
    id: 0,             
    page: 1,           
    pageSize: 20       
})
const hasMoreRootComment = ref(true)      

// 查询根评论列表
const queryCommentList = async (loadMore = false) => {
    MyLoading.value = true;
    commentQuery.value.id = Number(route.query.postId);
    try {
        const result = await queryCommentListApi(commentQuery.value)
        if (result.code) {
            const newRootComments = result.data.rows.map(rootComment => ({
                ...rootComment,
                children: [],          
                replyCount: 0,         
                page: 1,               
                pageSize: 5,           
                hasMoreReply: true     
            }));

            if (newRootComments.length > 0) {
                const countResult = await queryCommentCountApi(newRootComments.map(item => item.commentId));
                if (countResult.code) {
                    const replyCountMap = countResult.data;
                    newRootComments.forEach(item => item.replyCount = replyCountMap[item.commentId] || 0);
                }
            }

            if (loadMore) {
                commentTree.value = [...commentTree.value, ...newRootComments];
            } else {
                commentTree.value = newRootComments;
            }
            hasMoreRootComment.value = newRootComments.length === commentQuery.value.pageSize;
        }
    } catch (e) {
        console.error('查询根评论失败：', e);
    } finally {
        MyLoading.value = false;
    }
}

// 加载更多根评论
const loadMoreRootComment = async () => {
    if (hasMoreRootComment.value && !MyLoading.value) {
        commentQuery.value.page += 1;
        await queryCommentList(true);
    }
}

// 回复评论相关
const expandedReplyIds = ref([]);         
const replyCommentId = ref(null);         
const replyContent = ref('');             

// 加载回复列表
const loadReplyComment = async (commentId, loadMore = false) => {
    const targetRootComment = commentTree.value.find(item => item.commentId === commentId);
    if (!targetRootComment) return;

    MyLoading.value = true;
    try {
        if (loadMore) {
            targetRootComment.page += 1;
        }
        const result = await queryReplyCommentListApi({
            id: commentId,
            page: targetRootComment.page,
            pageSize: targetRootComment.pageSize,
        });

        if (result.code) {
            const newReplyList = result.data.rows;
            if (loadMore) {
                targetRootComment.children = [...targetRootComment.children, ...newReplyList];
            } else {
                targetRootComment.children = newReplyList;
                targetRootComment.page = 1;
            }
            targetRootComment.hasMoreReply = newReplyList.length === targetRootComment.pageSize;
        }
    } catch (e) {
        console.error('加载回复列表失败：', e);
    } finally {
        MyLoading.value = false;
    }
};

// 加载更多回复
const loadMoreReply = async (commentId) => {
    const rootComment = commentTree.value.find(item => item.commentId === commentId);
    if (rootComment && rootComment.hasMoreReply && !MyLoading.value) {
        await loadReplyComment(commentId, true);
    }
};

// 展开/收起回复列表
const toggleReply = (commentId) => {
    const index = expandedReplyIds.value.indexOf(commentId);
    if (index > -1) {
        expandedReplyIds.value.splice(index, 1);
    } else {
        expandedReplyIds.value.push(commentId);
        loadReplyComment(commentId);
    }
};

// 发布根评论相关
const commentContent = ref('')    

// 发布根评论
const submitComment = async () => {
    if (!commentContent.value.trim()) return MyMessage.warning('请输入评论');
    MyLoading.value = true;
    try {
        const result = await sendCommentApi({
            postId: Number(route.query.postId),
            userId: loginUserId.value,
            toUserId: 0,
            parentId: 0,
            content: commentContent.value
        });
        if (result.code) {
            commentQuery.value.page = 1;
            await queryCommentList(false);
            commentContent.value = '';
        }
    } catch (e) {
        console.error('发布评论失败：', e);
    } finally {
        MyLoading.value = false;
    }
}

// 显示回复输入框
const showReplyInput = (commentId, toUserId, toUserName) => {
    replyCommentId.value = { commentId, toUserId, toUserName };
    replyContent.value = '';
};

// 取消回复
const cancelReply = () => {
    replyCommentId.value = null;
    replyContent.value = '';
};

// 提交回复
const submitReply = async () => {
    if (!replyContent.value.trim()) return MyMessage.warning('请输入回复');
    if (!replyCommentId.value) return MyMessage.warning('回复目标不存在');

    try {
        const result = await replyCommentApi({
            postId: Number(route.query.postId),
            userId: loginUserId.value,
            parentId: replyCommentId.value.commentId,
            toUserId: replyCommentId.value.toUserId,
            content: replyContent.value
        });
        if (result.code) {
            const target = commentTree.value.find(item => item.commentId === replyCommentId.value.commentId);
            if (target) {
                target.replyCount += 1;
                target.page = 1;
            }
            await loadReplyComment(replyCommentId.value.commentId);
            cancelReply();
        }
    } catch (e) {
        console.error('提交回复失败：', e);
    }
}

// 删除评论/回复
const deleteComment = async (commentId) => {
    MyLoading.value = true;
    try {
        const result = await deleteCommentApi(commentId);
        if (result.code) {
            expandedReplyIds.value = [];
            commentQuery.value.page = 1;
            await queryCommentList(false);
        }
    } catch (e) {
        console.error('删除评论失败：', e);
    } finally {
        MyLoading.value = false;
    }
}

// 跳转到用户详情页
const toUserDetail = (userId) => {
    router.push({ name: 'userPost', query: { userId } });
}

// 页面初始化
onMounted(async () => {
    // 校验登录状态
    const userInfo = sessionStorage.getItem('loginUser');
    if (!userInfo) {
        router.push('/login');
        MyMessage.warn('请先登录')
        return;
    }
    // 统一初始化登录用户信息
    loginUser.value = JSON.parse(userInfo);
    loginUserId.value = loginUser.value.userId;
    loginUserName.value = loginUser.value.username;

    try {
        if (showSplash.value) {
            await Promise.all([queryPostDetail(), queryUserInfo(), queryCommentList()]);
            setTimeout(() => {
                splashClass.value = 'hidden';
                setTimeout(() => {
                    showSplash.value = false;
                    sessionStorage.setItem('animation_WP', 'false');
                }, 800);
            }, 2700);
        } else {
            showSplash.value = false;
            await Promise.all([queryUserInfo(), queryPostDetail(), queryCommentList()]);
        }
    } catch (e) {
        console.error('页面初始化失败：', e);
    }
})
</script>
<template>
    <PutPost :visible="showPutPost" @close="showPutPost = false" />
    <div class="page-wrapper">
        <div class="bg"></div>

        <div class="top-header">
            <div class="search-container">
                <div class="group">
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="search-icon">
                        <g>
                            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                        </g>
                    </svg>
                    <input id="query" class="input" type="search" placeholder="搜索话题/用户/帖子..." name="searchbar" />
                </div>
            </div>
            <p class="login-user" @click="toHome" style="cursor: pointer;">
                首页
            </p>
            <p class="login-user" @click="toUserDetail(loginUserId)" style="cursor: pointer;">
                {{ loginUserName || '未登录' }}
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
            <div class="user-info-sidebar">
                <div class="info-card basic-info">
                    <div class="avatar-box">
                        <div class="avatar" :style="{ backgroundImage: postAuthorInfo.avatar ? `url(${postAuthorInfo.avatar})` : 'none' }">
                            <span v-if="!postAuthorInfo.avatar">{{ postAuthorInfo.username ? postAuthorInfo.username.charAt(0) : '用' }}</span>
                        </div>
                    </div>
                    <div class="user-base">
                        <h3 class="username">{{ postAuthorInfo.username || '未设置用户名' }}</h3>
                        <div class="gender-tag" :class="{ 'male': postAuthorInfo.gender === 1, 'female': postAuthorInfo.gender === 0 }">
                            {{ postAuthorInfo.gender === 1 ? '男' : postAuthorInfo.gender === 0 ? '女' : '未设置' }}
                        </div>
                        <p class="signature">{{ postAuthorInfo.signature || '这个人很懒，什么都没留下～' }}</p>
                    </div>
                </div>

                <div class="info-card account-info ad-card">
                    <div class="card-title">推荐推广</div>
                    <div class="info-list ad-list">
                        <div class="ad-item">
                            <div class="ad-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#f97316" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>
                                </svg>
                            </div>
                            <div class="ad-content">
                                <div class="ad-title">LiVi会员特权</div>
                                <div class="ad-desc">解锁更多社区功能</div>
                            </div>
                            <div class="ad-tag">推广</div>
                        </div>
                        <div class="ad-item">
                            <div class="ad-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#3182ce" viewBox="0 0 24 24">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
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

            <div class="user-function-main">
                <div class="function-card content-card post-card">
                    <div class="card-title">动态详情</div>
                    <div class="post-detail" v-if="postDetail.postId">
                        <h4 class="post-title">{{ postDetail.postTitle }}</h4>
                        <div class="post-content">{{ postDetail.postContent }}</div>
                        <div class="post-image-wrap" v-if="postDetail.postImage">
                            <img class="post-image" :src="postDetail.postImage" alt="帖子图片">
                        </div>
                        <div class="post-meta">
                            <span class="post-time">{{ postDetail.createTime }}</span>
                            <span class="post-circle">{{ postDetail.circleName }}</span>
                            <span class="post-comment">评论 {{ commentTree.length }}</span>
                        </div>
                    </div>
                    <div class="post-empty" v-else>
                        暂无帖子详情
                    </div>
                </div>

                <div class="function-card content-card comment-card">
                    <div class="card-title">评论区 ({{ commentTree.length }})</div>

                    <div class="comment-list" v-if="commentTree.length">
                        <div class="comment-item root-comment" v-for="rootComment in commentTree" :key="rootComment.commentId">
                            <div class="comment-avatar" @click="toUserDetail(rootComment.userId)" style="cursor: pointer;">
                                <div class="avatar-small" :style="{ backgroundImage: rootComment.userAvatar ? `url(${rootComment.userAvatar})` : 'none' }">
                                    <span v-if="!rootComment.userAvatar">{{ rootComment.userName?.charAt(0) || '用' }}</span>
                                </div>
                            </div>
                            <div class="comment-content-wrap">
                                <div class="comment-header">
                                    <div class="comment-user">{{ rootComment.userName || '匿名用户' }}</div>
                                    <span class="comment-time">{{ rootComment.createTime }}</span>
                                </div>
                                <div class="comment-text">{{ rootComment.content }}</div>

                                <div class="comment-actions">
                                    <button class="action-btn reply-btn" @click="showReplyInput(rootComment.commentId, rootComment.userId, rootComment.userName)" title="回复评论">
                                        回复
                                    </button>
                                    <button class="action-btn delete-btn" v-if="rootComment.userId === loginUserId" @click="deleteComment(rootComment.commentId)" title="删除评论">
                                        删除
                                    </button>
                                    <button class="action-btn toggle-btn" v-if="rootComment.replyCount > 0" @click="toggleReply(rootComment.commentId)">
                                        {{ expandedReplyIds.includes(rootComment.commentId) ? `收起${rootComment.replyCount}条回复` : `查看${rootComment.replyCount}条回复` }}
                                    </button>
                                </div>

                                <div class="reply-input-wrap" v-if="replyCommentId?.commentId === rootComment.commentId">
                                    <div class="reply-input-tip">@{{ replyCommentId.toUserName }}</div>
                                    <input v-model="replyContent" class="input comment-input-custom" placeholder="输入你的回复..." />
                                    <div class="reply-btn-group">
                                        <button class="reply-btn cancel-btn" @click="cancelReply">取消</button>
                                        <button class="reply-btn submit-btn" @click="submitReply">发送</button>
                                    </div>
                                </div>

                                <div class="reply-list" v-if="expandedReplyIds.includes(rootComment.commentId)">
                                    <div class="reply-loading" v-if="MyLoading.value">
                                        加载回复中...
                                    </div>
                                    <div class="reply-empty" v-else-if="rootComment.children.length === 0">
                                        暂无回复，快来第一条回复～
                                    </div>
                                    <div class="reply-item" v-else v-for="reply in rootComment.children" :key="reply.commentId">
                                        <div class="reply-avatar" @click="toUserDetail(reply.userId)" style="cursor: pointer;">
                                            <div class="avatar-small" :style="{ backgroundImage: reply.userAvatar ? `url(${reply.userAvatar})` : 'none' }">
                                                <span v-if="!reply.userAvatar">{{ reply.userName?.charAt(0) || '用' }}</span>
                                            </div>
                                        </div>
                                        <div class="reply-content-wrap">
                                            <div class="reply-header">
                                                <div class="reply-user">{{ reply.userName || '匿名用户' }}</div>
                                                <span class="reply-time">{{ reply.createTime }}</span>
                                            </div>
                                            <div class="reply-text">
                                                <span class="reply-to" v-if="reply.toUserName">@{{ reply.toUserName }}：</span>
                                                {{ reply.content }}
                                            </div>
                                            <div class="reply-actions">
                                                <button class="action-btn reply-btn" @click="showReplyInput(rootComment.commentId, reply.userId, reply.userName)" title="回复TA">
                                                    回复
                                                </button>
                                                <button class="action-btn delete-btn" v-if="reply.userId === loginUserId" @click="deleteComment(reply.commentId)" title="删除回复">
                                                    删除
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="load-more-btn" v-if="rootComment.hasMoreReply" @click="loadMoreReply(rootComment.commentId)">
                                        <button class="btn">
                                            加载更多回复
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="load-more-btn" v-if="hasMoreRootComment" @click="loadMoreRootComment">
                            <button class="btn" :disabled="MyLoading.value">
                                {{ MyLoading.value ? '加载中...' : '加载更多评论' }}
                            </button>
                        </div>
                    </div>

                    <div class="comment-empty" v-else>
                        暂无评论，快来抢沙发～
                    </div>

                    <div class="comment-input-wrap">
                        <input v-model="commentContent" class="input comment-input-custom" placeholder="说点什么..." />
                        <button class="comment-submit-btn" @click="submitComment">发布评论</button>
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
@import url('@/assets/CSS/WePost/comment.css');

.load-more-btn {
    text-align: center;
    padding: 10px 0;
}

.load-more-btn .btn {
    padding: 6px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
}

.load-more-btn .btn:disabled {
    cursor: not-allowed;
    color: #9ca3af;
}

.load-more-btn .btn:hover:not(:disabled) {
    background: #f9fafb;
}
</style>