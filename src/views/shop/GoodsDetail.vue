<script setup>
import { useRoute } from 'vue-router'
import { queryGoodsDetailApi, queryGoodsCommentApi } from "@/api/shop.js";
import { onMounted, ref } from 'vue'
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";
import CreateOrder from '@/components/CreateOrder.vue'

const createOrderVisible = ref(false)
const route = useRoute()
const goodsId = ref(0)
const goodsDetail = ref({})
// 前选中的图片地址
const activeImageUrl = ref('')

const queryGoodsDetail = async () => {
    goodsId.value = route.query.goodsId
    MyLoading.value = true
    try {
        const result = await queryGoodsDetailApi(goodsId.value)
        if (result.code) {
            goodsDetail.value = result.data
            // 初始化大图：优先取第一张轮播图，没有则用商品缩略图
            if (goodsDetail.value.goodsImageVOList && goodsDetail.value.goodsImageVOList.length > 0) {
                activeImageUrl.value = goodsDetail.value.goodsImageVOList[0].imageUrl || '/default-goods.png'
            } else {
                activeImageUrl.value = goodsDetail.value.goodsThumbnail || '/default-goods.png'
            }
        } else {
            MyMessage.error(result.msg)
        }
    } catch (error) {
        MyMessage.error(error.message || '请求失败，请重试');
    } finally {
        MyLoading.value = false
    }
}

// 切换大图方法
const changeActiveImage = (imageUrl) => {
    activeImageUrl.value = imageUrl || '/default-goods.png'
}

const queryData = ref({
    id: 0,
    page: 1,
    pageSize: 15
})
const commentsList = ref([])
const commentsTotal = ref(0)
// 评论折叠状态（默认折叠）
const showComments = ref(false)

const queryGoodsComments = async () => {
    queryData.value.id = route.query.goodsId
    MyLoading.value = true
    try {
        const result = await queryGoodsCommentApi(queryData.value)
        if (result.code) {
            commentsList.value = result.data.rows
            commentsTotal.value = result.data.total
        } else {
            MyMessage.error(result.msg)
        }
    } catch (error) {
        MyMessage.error(error.message || '请求失败，请重试');
    } finally {
        MyLoading.value = false
    }
}

onMounted(() => {
    queryGoodsDetail()
    queryGoodsComments()
})
</script>

<template>
    <!-- 引入创建订单组件 -->
    <CreateOrder ref="createOrderRef" :visible="createOrderVisible" :goodsId="goodsId"
        :goodsName="goodsDetail.goodsName" :goodsPrice="goodsDetail.goodsPrice"
        :goodsThumbnail="goodsDetail.goodsThumbnail" :goodsStock="goodsDetail.goodsStock"
        @close="createOrderVisible = false" />

    <div class="goods-detail-container">
        <div v-if="goodsDetail.goodsId" class="detail-wrapper">
            <div class="image-section">
                <div class="main-image">
                    <!-- 使用选中的图片地址 -->
                    <img :src="activeImageUrl" :alt="goodsDetail.goodsName">
                </div>
                <div class="image-gallery"
                    v-if="goodsDetail.goodsImageVOList && goodsDetail.goodsImageVOList.length > 0">
                    <div v-for="(img, index) in goodsDetail.goodsImageVOList" :key="index" class="thumbnail"
                        :class="{ active: activeImageUrl === (img.imageUrl) }" @click="changeActiveImage(img.imageUrl)">
                        <img :src="img.imageUrl" alt="商品图片">
                    </div>
                </div>
                <!-- 店铺信息栏 -->
                <div class="shop-info">
                    <!-- 店铺SVG图标 -->
                    <svg class="shop-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                            stroke="#FF6B6B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M9 22V12H15V22" stroke="#FF6B6B" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    <div class="shop-detail">
                        <h3 class="shop-name">{{ goodsDetail.goodsDept }}</h3>
                        <div class="shop-tag">
                            <span class="tag-item">品牌认证</span>
                            <span class="tag-item">7天无理由</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="info-section">
                <div class="basic-info">
                    <h1 class="goods-name">{{ goodsDetail.goodsName }}</h1>
                    <div class="goods-meta">
                        <span class="goods-type">{{ goodsDetail.goodsType }}</span>
                        <span class="goods-status" :class="{ offline: goodsDetail.goodsStatus === 0 }">
                            {{ goodsDetail.goodsStatus === 1 ? '热卖中！' : '已下架' }}
                        </span>
                        <span class="goods-status" :class="{ offline: goodsDetail.goodsStatus === 0 }">
                            LiVi审核
                        </span>
                    </div>
                </div>

                <div class="price-section">
                    <div class="price-wrapper">
                        <span class="price-label">价格</span>
                        <span class="price-value">¥{{ goodsDetail.goodsPrice }}</span>
                    </div>
                    <div class="sales-info">
                        <span class="sales-item">
                            <span class="label">销量</span>
                            <span class="value">{{ goodsDetail.goodsSales || 0 }}</span>
                        </span>
                        <span class="sales-item">
                            <span class="label">库存</span>
                            <span class="value">{{ goodsDetail.goodsStock || '充足' }}</span>
                        </span>
                    </div>
                    <!-- 立即购买 + 加入购物车按钮容器 -->
                    <div class="buy-btn-wrapper">
                        <div class="btn-group">
                            <button class="buy-btn" :disabled="goodsDetail.goodsStatus === 0"
                                @click.stop="createOrderVisible = true">
                                {{ goodsDetail.goodsStatus === 1 ? '立即购买' : '商品已下架' }}
                            </button>
                            <button class="cart-btn" :disabled="goodsDetail.goodsStatus === 0" @click.stop="addToCart">
                                <svg class="cart-icon" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M6 3H4C3.44772 3 3 3.44772 3 4V6M6 3H18M6 3V5M18 3V5M18 3H20C20.5523 3 21 3.44772 21 4V6M3 10C3 8.89543 3.89543 8 5 8H19C20.1046 8 21 8.89543 21 10V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V10Z"
                                        stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M8 14C8 15.1046 8.89543 16 10 16H14C15.1046 16 16 15.1046 16 14"
                                        stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <span class="cart-text">加入购物车</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="score-section">
                    <div class="score-wrapper">
                        <span class="score-label">商品评分</span>
                        <div class="score-stars">
                            <span v-for="i in 5" :key="i" class="star"
                                :class="{ active: i <= Math.round(goodsDetail.goodsScore || 0) }">★</span>
                            <span class="score-value">{{ goodsDetail.goodsScore || 5.0 }}分</span>
                        </div>
                    </div>
                </div>

                <div class="intro-section">
                    <h3>商品介绍</h3>
                    <div class="intro-content">{{ goodsDetail.goodsIntro || '暂无介绍' }}</div>
                </div>

                <div class="time-section">
                    <span class="time-label">上架时间</span>
                    <span class="time-value">{{ goodsDetail.createTime }}</span>
                </div>
            </div>
        </div>

        <div v-if="goodsDetail.goodsId" class="comment-section">
            <div class="comment-header" @click="showComments = !showComments">
                <h2 class="section-title">商品评论 ({{ commentsTotal }})</h2>
                <span class="toggle-icon" :class="{ expanded: showComments }">▼</span>
            </div>

            <!-- 评论 -->
            <div v-show="showComments" class="comment-content">
                <div v-if="commentsList && commentsList.length > 0" class="comment-list">
                    <div v-for="comment in commentsList" :key="comment.commentId" class="comment-item">
                        <div class="comment-header-user">
                            <img :src="comment.userAvatar || '/default-avatar.png'" alt="用户头像" class="comment-avatar">
                            <div class="comment-user-info">
                                <span class="username">{{ comment.userName }}</span>
                                <span class="comment-time">{{ comment.createTime }}</span>
                            </div>
                            <div class="comment-score">
                                <span v-for="i in 5" :key="i" class="mini-star"
                                    :class="{ active: i <= Math.round(comment.commentScore || 0) }">★</span>
                            </div>
                        </div>
                        <div class="comment-body">{{ comment.commentContent }}</div>
                    </div>
                </div>
                <div v-else class="no-comment">
                    <p>暂无评论</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.goods-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
}

.detail-wrapper {
    display: flex;
    gap: 40px;
    margin-bottom: 60px;
}

.image-section {
    flex: 1;
    max-width: 500px;
}

.main-image {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    background-color: #f5f5f5;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.main-image img {
    width: 100%;
    height: 400px;
    object-fit: cover;
    display: block;
}

.image-gallery {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    overflow-x: auto;
    padding: 4px 0;
}

.thumbnail {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.3s;
}

/* 店铺信息样式 */
.shop-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 50px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
}

.shop-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
}

.shop-detail {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.shop-name {
    font-size: 16px;
    font-weight: 600;
    /*渐变 */
    background: linear-gradient(135deg, #ff0000 0%, #0033ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
}

.shop-tag {
    display: flex;
    gap: 8px;
}

.tag-item {
    font-size: 12px;
    padding: 2px 8px;
    background-color: #fef0f0;
    color: #ff6b6b;
    border-radius: 4px;
}

/* 新增：选中的缩略图样式 */
.thumbnail.active {
    border-color: #ff6b6b;
}

.thumbnail:hover {
    border-color: #ff6b6b;
    transform: translateY(-2px);
}

.thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.info-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.basic-info {
    padding-bottom: 20px;
    border-bottom: 1px solid #e8e8e8;
}

.goods-name {
    font-size: 28px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 12px 0;
    line-height: 1.4;
}

.goods-meta {
    display: flex;
    gap: 12px;
    align-items: center;
}

.goods-type {
    padding: 6px 14px;
    background-color: #f0f2f5;
    border-radius: 6px;
    font-size: 13px;
    color: #666;
}

.goods-status {
    padding: 6px 14px;
    background-color: #ff8741;
    color: #fff;
    border-radius: 6px;
    font-size: 13px;
}

.goods-status.offline {
    background-color: #999;
}

.price-section {
    background: linear-gradient(135deg, #fff7f0 0%, #fff5f0 100%);
    padding: 24px;
    border-radius: 12px;
    border-left: 4px solid #ff6b6b;
}

.price-wrapper {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 16px;
}

.price-label {
    font-size: 16px;
    color: #666;
}

.price-value {
    font-size: 42px;
    font-weight: 700;
    color: #ff6b6b;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.sales-info {
    display: flex;
    gap: 40px;
    margin-bottom: 20px;
    /* 给购买按钮留出空间 */
}

.sales-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.sales-item .label {
    font-size: 14px;
    color: #999;
}

.sales-item .value {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

/* 按钮组样式 */
.btn-group {
    display: flex;
    gap: 12px;
    width: 100%;
}

/* 购物车按钮样式 */
.cart-btn {
    flex: 1;
    padding: 16px 0;
    background: linear-gradient(135deg, #ff9f43 0%, #ff6b6b 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.cart-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 107, 107, 0.3);
}

.cart-btn:disabled {
    background: #999;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* 购物车图标样式 */
.cart-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

.cart-text {
    font-size: 16px;
}

/* 立即购买按钮适配 */
.buy-btn {
    flex: 2;
    padding: 16px 0;
}

/* 立即购买按钮样式 */
.buy-btn-wrapper {
    width: 100%;
}

.buy-btn {
    width: 100%;
    padding: 16px 0;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
}

.buy-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 107, 107, 0.3);
}

.buy-btn:disabled {
    background: #999;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.score-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
}

.score-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
}

.score-label {
    font-size: 14px;
    color: #666;
}

.score-stars {
    display: flex;
    align-items: center;
    gap: 3px;
}

.star {
    font-size: 22px;
    color: #d9d9d9;
    transition: color 0.2s;
}

.star.active {
    color: #ffc107;
}

.score-value {
    margin-left: 10px;
    font-size: 16px;
    color: #333;
    font-weight: 600;
}

.intro-section h3 {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 12px 0;
}

.intro-content {
    font-size: 14px;
    line-height: 1.8;
    color: #666;
    background-color: #fafafa;
    padding: 16px;
    border-radius: 8px;
    white-space: pre-wrap;
}

.time-section {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
}

.time-label {
    color: #999;
}

.time-value {
    color: #666;
}

.comment-section {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    margin-top: 20px;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.comment-header:hover {
    background-color: #fafafa;
}

.section-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.toggle-icon {
    font-size: 14px;
    color: #999;
    transition: transform 0.3s;
}

/* 评论区域展开/折叠动画 */
.toggle-icon.expanded {
    transform: rotate(180deg);
}

.comment-content {
    padding: 0 24px 24px;
}

.comment-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.comment-item {
    padding: 20px;
    background-color: #fafafa;
    border-radius: 10px;
    transition: all 0.2s;
    border-left: 3px solid #e8e8e8;
}

.comment-item:hover {
    background-color: #f5f5f5;
    border-left-color: #ff6b6b;
    transform: translateX(4px);
}

.comment-header-user {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.comment-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.comment-user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.username {
    font-size: 15px;
    font-weight: 600;
    color: #333;
}

.comment-time {
    font-size: 12px;
    color: #999;
}

.comment-score {
    display: flex;
    gap: 2px;
}

.mini-star {
    font-size: 16px;
    color: #d9d9d9;
}

.mini-star.active {
    color: #ffc107;
}

.comment-body {
    font-size: 14px;
    line-height: 1.6;
    color: #666;
    padding-left: 56px;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;
}

.no-comment {
    text-align: center;
    padding: 60px 20px;
    color: #999;
    font-size: 14px;
}

/* 响应式适配 - 全面优化 */
@media (max-width: 768px) {

    /* 容器整体适配 */
    .goods-detail-container {
        padding: 16px 12px;
        width: 100%;
        box-sizing: border-box;
    }

    /* 商品详情布局改为纵向堆叠 */
    .detail-wrapper {
        flex-direction: column;
        gap: 20px;
        margin-bottom: 30px;
        padding: 0;
    }

    /* 图片区域适配 */
    .image-section {
        max-width: 100%;
        width: 100%;
    }

    .main-image {
        width: 100%;
        border-radius: 8px;
    }

    .main-image img {
        height: auto;
        /* 取消固定高度，自适应宽度 */
        max-height: 350px;
        /* 限制最大高度 */
        object-fit: contain;
        /* 保证图片完整显示 */
    }

    /* 缩略图适配 */
    .image-gallery {
        gap: 8px;
        margin-top: 12px;
    }

    .thumbnail {
        width: 60px;
        height: 60px;
    }

    /* 店铺信息适配 */
    .shop-info {
        margin-top: 20px;
        gap: 8px;
        padding-bottom: 8px;
    }

    .shop-icon {
        width: 28px;
        height: 28px;
    }

    .shop-name {
        font-size: 14px;
    }

    .tag-item {
        font-size: 10px;
        padding: 1px 6px;
    }

    /* 商品基础信息适配 */
    .basic-info {
        padding-bottom: 16px;
    }

    .goods-name {
        font-size: 20px;
        line-height: 1.3;
        margin-bottom: 8px;
    }

    .goods-meta {
        flex-wrap: wrap;
        /* 标签过多时自动换行 */
        gap: 8px;
    }

    .goods-type,
    .goods-status {
        padding: 4px 10px;
        font-size: 12px;
    }

    /* 价格区域适配 */
    .price-section {
        padding: 16px 12px;
        border-radius: 8px;
    }

    .price-wrapper {
        margin-bottom: 12px;
        gap: 8px;
    }

    .price-label {
        font-size: 14px;
    }

    .price-value {
        font-size: 28px;
    }

    /* 销量库存适配 */
    .sales-info {
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
    }

    .sales-item .label {
        font-size: 12px;
    }

    .sales-item .value {
        font-size: 16px;
    }

    /* 按钮组适配 - 核心优化 */
    .btn-group {
        gap: 8px;
        flex-wrap: nowrap;
        /* 强制并排，不换行 */
    }

    .buy-btn {
        flex: 2;
        /* 立即购买占比2/3 */
        padding: 12px 0;
        font-size: 14px;
        border-radius: 6px;
    }

    .cart-btn {
        flex: 1;
        /* 购物车占比1/3 */
        padding: 12px 0;
        font-size: 12px;
        border-radius: 6px;
        gap: 4px;
        /* 图标和文字间距缩小 */
    }

    /* 购物车图标适配 */
    .cart-icon {
        width: 16px;
        height: 16px;
    }

    .cart-text {
        font-size: 12px;
        white-space: nowrap;
        /* 文字不换行 */
    }

    /* 评分区域适配 */
    .score-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 12px 0;
    }

    .score-label {
        font-size: 12px;
    }

    .star {
        font-size: 18px;
    }

    .score-value {
        font-size: 14px;
        margin-left: 6px;
    }

    /* 商品介绍适配 */
    .intro-section h3 {
        font-size: 14px;
        margin-bottom: 8px;
    }

    .intro-content {
        padding: 12px;
        font-size: 12px;
        line-height: 1.6;
    }

    /* 上架时间适配 */
    .time-section {
        gap: 8px;
        font-size: 12px;
        padding-top: 12px;
    }

    /* 评论区域适配 */
    .comment-section {
        margin-top: 16px;
        border-radius: 8px;
    }

    .comment-header {
        padding: 12px 16px;
    }

    .section-title {
        font-size: 16px;
    }

    .toggle-icon {
        font-size: 12px;
    }

    .comment-content {
        padding: 0 16px 16px;
    }

    .comment-item {
        padding: 12px;
        border-radius: 6px;
    }

    .comment-avatar {
        width: 36px;
        height: 36px;
    }

    .username {
        font-size: 13px;
    }

    .comment-time {
        font-size: 10px;
    }

    .mini-star {
        font-size: 14px;
    }

    .comment-body {
        font-size: 12px;
        padding-left: 0;
        margin-top: 8px;
        padding-top: 8px;
    }

    .no-comment {
        padding: 30px 10px;
        font-size: 12px;
    }
}

/* 补充小屏手机适配（小于480px） */
@media (max-width: 480px) {
    .main-image img {
        max-height: 280px;
    }

    .btn-group {
        gap: 4px;
    }

    .buy-btn {
        font-size: 12px;
        padding: 10px 0;
    }

    .cart-btn {
        font-size: 10px;
        padding: 10px 0;
    }

    .cart-text {
        display: none;
    }

    .cart-icon {
        width: 18px;
        height: 18px;
    }
}
</style>