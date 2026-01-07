<script setup>
import { ref, watch } from 'vue'
import { commentOrderApi } from "@/api/shop.js";
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    userId: {
        type: Number,
        default: 0
    },
    orderId: {
        type: Number,
        default: 0
    },
    goodsId: {
        type: Number,
        default: 0
    }
})

// 定义自定义事件
const emit = defineEmits(['close'])

// 响应式DTO，避免props值未实时更新
const DTO = ref({
    userId: props.userId,
    orderId: props.orderId,
    goodsId: props.goodsId,
    commentContent: '',
    commentScore: 0
})

// 监听props变化更新DTO
watch([() => props.userId, () => props.orderId, () => props.goodsId], 
([newUserId, newOrderId, newGoodsId]) => {
    DTO.value.userId = newUserId
    DTO.value.orderId = newOrderId
    DTO.value.goodsId = newGoodsId
}, { immediate: true })

// 评分星级数组
const starList = ref([1, 2, 3, 4, 5])

// 选择评分
const selectScore = (score) => {
    DTO.value.commentScore = score
}

const commentOrder = async () => {
    // 基础校验
    if (DTO.value.commentScore === 0) {
        MyMessage.warning('请选择评分！')
        return
    }
    if (!DTO.value.commentContent.trim()) {
        MyMessage.warning('请输入评价内容！')
        return
    }
    
    MyLoading.value = true;
    try {
        const result = await commentOrderApi(DTO.value);
        if (result.code) {
            MyMessage.success('评价成功, 感谢您的反馈!');
            emit('close');
            // 重置表单
            DTO.value.commentContent = ''
            DTO.value.commentScore = 0
        } else {
            MyMessage.error(result.msg);
        }
    } catch (e) {
        MyMessage.error('评价失败');
    } finally {
        MyLoading.value = false;
    }
}

</script>
<template>
    <div class="modal-mask" v-if="visible" @click="emit('close')">
        <!-- 订单详情弹窗主体 -->
        <div class="order-detail-modal" @click.stop>
            <!-- 关闭按钮 -->
            <div class="close-btn" @click="emit('close')">✕</div>

            <!-- 评价标题 -->
            <div class="comment-title">
                <h3>评价商品</h3>
                <p>您的评价将帮助其他用户更好地选择商品</p>
            </div>

            <!-- 评分区域 -->
            <div class="score-section">
                <div class="score-label">您的评分：</div>
                <div class="star-container">
                    <span 
                        class="star-item" 
                        v-for="star in starList" 
                        :key="star"
                        @click="selectScore(star)"
                        :class="{ active: DTO.commentScore >= star }"
                    >★</span>
                </div>
            </div>

            <!-- 评价内容输入 -->
            <div class="content-section">
                <div class="content-label">评价内容：</div>
                <textarea 
                    v-model="DTO.commentContent"
                    placeholder="请输入您的评价（不少于10个字）"
                    class="comment-input"
                    rows="5"
                ></textarea>
                <div class="word-count">{{ DTO.commentContent.length }}/200</div>
            </div>

            <!-- 提交按钮 -->
            <div class="submit-section">
                <button class="submit-btn" @click="commentOrder">提交评价</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 遮罩层 */
.modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    z-index: 1000;
    animation: fadeIn 0.3s ease forwards;
    backdrop-filter: blur(2px);
}

/* 弹窗主体 */
.order-detail-modal {
    width: 100%;
    max-width: 750px;
    background-color: #fff;
    border-radius: 16px 16px 0 0;
    padding: 16px;
    max-height: 85vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease forwards;
    position: relative; /* 给关闭按钮定位用 */
}

/* 关闭按钮 */
.close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    color: #666;
    z-index: 10;
}

.close-btn:hover {
    background-color: #e8e8e8;
}

/* 评价标题 */
.comment-title {
    padding: 16px 0;
    border-bottom: 1px solid #f5f5f5;
    margin-bottom: 20px;
}

.comment-title h3 {
    font-size: 18px;
    color: #333;
    margin: 0 0 8px 0;
}

.comment-title p {
    font-size: 14px;
    color: #999;
    margin: 0;
}

/* 评分区域 */
.score-section {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.score-label {
    font-size: 16px;
    color: #333;
    margin-right: 16px;
}

.star-container {
    display: flex;
    gap: 8px;
}

.star-item {
    font-size: 24px;
    color: #ddd;
    cursor: pointer;
    transition: color 0.2s;
}

.star-item.active {
    color: #f97316;
}

/* 评价内容输入 */
.content-section {
    margin-bottom: 24px;
}

.content-label {
    font-size: 16px;
    color: #333;
    margin-bottom: 8px;
    display: block;
}

.comment-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    font-size: 14px;
    color: #333;
    box-sizing: border-box;
    resize: none;
}

.comment-input::placeholder {
    color: #999;
}

.word-count {
    font-size: 12px;
    color: #999;
    text-align: right;
    margin-top: 8px;
}

/* 提交按钮 */
.submit-section {
    padding: 16px 0;
    border-top: 1px solid #f5f5f5;
}

.submit-btn {
    width: 100%;
    padding: 12px 0;
    background-color: #f97316;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
}

.submit-btn:hover {
    background-color: #ea580c;
}

/* 动画 */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}
</style>