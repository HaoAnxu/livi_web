<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { createOrderApi, queryPriceApi } from '@/api/shop.js'
import MyMessage from '@/utils/MyMessage.js'
import { MyLoading } from '@/utils/MyLoading.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    goodsId: {
        type: Number,
        required: true
    },
    goodsName: {
        type: String,
        default: '未命名商品'
    },
    goodsThumbnail: {
        type: String,
        default: ''
    },
    goodsStock: {
        type: Number,
        default: 999
    },
    goodsModelVOList: {
        type: Array,
        default: () => []
    },
    goodsStyleVOList: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['close'])

const orderNumber = ref(1)
const orderDes = ref('')
const orderAddress = ref('')
const selectedSpec = ref(0)
const selectedStyle = ref(0)
const goodsPrice = ref(0)

// 初始化默认选中的规格和款式
const initDefaultSelection = () => {
    // 默认选中第一个规格
    if (props.goodsModelVOList.length > 0) {
        const firstModel = props.goodsModelVOList[0]
        selectedSpec.value = firstModel.modelId || 0
    } else {
        selectedSpec.value = 0
    }

    // 默认选中第一个款式
    if (props.goodsStyleVOList.length > 0) {
        const firstStyle = props.goodsStyleVOList[0]
        selectedStyle.value = firstStyle.styleId || 0
    } else {
        selectedStyle.value = 0
    }

    // 初始化后立即查询价格
    nextTick(() => {
        queryPrice()
    })
}

// 查询价格
const queryPrice = async () => {
    if (!props.goodsId) return

    const DTO = {
        goodsId: props.goodsId,
        goodsModelId: selectedSpec.value || 0,
        goodsStyleId: selectedStyle.value || 0
    }
    try {
        const result = await queryPriceApi(DTO.goodsModelId, DTO.goodsStyleId, DTO.goodsId)
        if (result.code) {
            goodsPrice.value = result.data || 0
        } else {
            MyMessage.error(result.msg || '价格查询失败')
        }
    } catch (error) {
        console.error('价格查询异常：', error)
        MyMessage.error('价格查询失败')
    }
}

// 监听弹窗显示状态重置数据
watch(() => props.visible, (newVal) => {
    if (newVal) {
        orderNumber.value = 1
        orderDes.value = ''
        orderAddress.value = ''

        // 等待DOM更新后初始化默认选择
        nextTick(() => {
            initDefaultSelection()
        })
    }
}, { immediate: true })

// 监听规格/款式变化，重新查询价格（无论值是否为0）
watch([() => selectedSpec.value, () => selectedStyle.value], () => {
    if (props.visible) { // 仅弹窗显示时查询
        queryPrice()
    }
}, { immediate: false })

// 监听规格/款式列表变化，重新初始化并查询价格
watch([() => props.goodsModelVOList, () => props.goodsStyleVOList], () => {
    if (props.visible) {
        initDefaultSelection()
    }
}, { deep: true })

// 数量增减
const decreaseNumber = () => {
    if (orderNumber.value > 1) {
        orderNumber.value--
    }
}
const increaseNumber = () => {
    if (orderNumber.value < props.goodsStock) {
        orderNumber.value++
    }
}

// 规格/款式选择
const selectSpec = (modelId) => {
    selectedSpec.value = modelId
}

const selectStyle = (styleId) => {
    selectedStyle.value = styleId
}

// 加入购物车（空方法保留）
const handleAddToCart = () => {
    // 后续自行实现
}

// 阻止遮罩层冒泡
const handleMaskClick = (e) => {
    e.stopPropagation()
}

// 创建订单
const createOrder = async () => {
    const loginUser = JSON.parse(sessionStorage.getItem('loginUser'))
    if (!loginUser) {
        MyMessage.error('请先登录')
        return
    }

    // 验证规格/款式选择
    if (props.goodsModelVOList.length > 0 && selectedSpec.value === 0) {
        MyMessage.warn('请选择商品规格')
        return
    }
    if (props.goodsStyleVOList.length > 0 && selectedStyle.value === 0) {
        MyMessage.warn('请选择商品款式')
        return
    }

    // 验证收货地址
    if (!orderAddress.value.trim()) {
        MyMessage.warn('请输入收货地址')
        return
    }

    const DTO = {
        goodsId: props.goodsId,
        userId: loginUser.userId,
        goodsNum: orderNumber.value,
        goodsModel: selectedSpec.value,
        goodsStyle: selectedStyle.value,
        orderAddress: orderAddress.value.trim(),
        orderPrice: goodsPrice.value
    }
    try {
        MyLoading.value = true
        const result = await createOrderApi(DTO)
        if (result.code) {
            router.replace({
                path: '/pay',
                query: {
                    orderNo: result.msg || ''
                }
            })
            console.log(result.msg || '')
            emit('close')
        } else {
            MyMessage.error(result.msg || '订单创建失败')
        }
    } catch (error) {
        console.error('创建订单异常：', error)
        MyMessage.error('订单创建失败')
    } finally {
        MyLoading.value = false
    }
}
</script>

<template>
    <div class="modal-mask" v-if="visible" @click="emit('close')">
        <div class="order-popup" @click="handleMaskClick">
            <div class="close-btn" @click="emit('close')">✕</div>
            <div class="price">
                ¥{{ goodsPrice || 0 }}
            </div>
            <div class="goods-info">
                <img :src="goodsThumbnail" alt="商品图片" class="goods-image">
                <div class="goods-detail">
                    <div class="goods-name">{{ goodsName }}</div>
                    <div class="stock">库存: {{ goodsStock }}件</div>
                </div>
            </div>

            <!-- 规格选择 -->
            <div class="spec-section" v-if="goodsModelVOList.length > 0">
                <div class="section-title">规格选择</div>
                <div class="spec-options">
                    <span v-for="model in goodsModelVOList" :key="model.id" class="spec-item"
                        :class="{ active: selectedSpec === model.modelId }" @click="selectSpec(model.modelId)">
                        {{ model.goodsModel }}
                    </span>
                </div>
            </div>

            <!-- 款式选择 -->
            <div class="spec-section" v-if="goodsStyleVOList.length > 0">
                <div class="section-title">款式选择</div>
                <div class="spec-options">
                    <span v-for="style in goodsStyleVOList" :key="style.id" class="spec-item"
                        :class="{ active: selectedStyle === style.styleId }" @click="selectStyle(style.styleId)">
                        {{ style.goodsStyle }}
                    </span>
                </div>
            </div>

            <!-- 数量选择 -->
            <div class="number-section">
                <div class="section-title">购买数量</div>
                <div class="number-control">
                    <button class="control-btn minus" @click="decreaseNumber" :disabled="orderNumber <= 1">
                        -
                    </button>
                    <span class="number-value">{{ orderNumber }}</span>
                    <button class="control-btn plus" @click="increaseNumber" :disabled="orderNumber >= goodsStock">
                        +
                    </button>
                </div>
            </div>

            <!-- 收货地址 -->
            <div class="remark-section">
                <div class="section-title">收货地址</div>
                <textarea class="remark-input" v-model="orderAddress" placeholder="请输入收货地址" maxlength="100"></textarea>
                <div class="remark-count">{{ orderAddress.length }}/100</div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
                <button class="btn btn-cart" @click="handleAddToCart">
                    加入购物车
                </button>
                <button class="btn btn-buy" @click="createOrder" :disabled="goodsPrice <= 0">
                    立即购买
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 遮罩层样式 */
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

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* 弹窗主体 */
.order-popup {
    background-color: #fff;
    width: 100%;
    max-width: 600px;
    border-radius: 16px 16px 0 0;
    padding: 20px 20px 30px;
    position: relative;
    animation: slideUp 0.3s ease forwards;
    box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
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
    transition: all 0.3s ease;
    user-select: none;
}

.close-btn:hover {
    background-color: #e8e8e8;
    color: #333;
}

/* 移除 close-btn.disabled 样式 */

/* 商品信息区域 */
.goods-info {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
    align-items: center;
}

.goods-image {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid #f0f0f0;
    background-color: #fafafa;
}

.goods-image.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 12px;
}

.goods-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.goods-name {
    font-size: 16px;
    color: #333;
    font-weight: 500;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.price {
    font-size: 24px;
    font-weight: bold;
    color: #e02e24;
}

.stock {
    font-size: 13px;
    color: #999;
}

/* 通用区域标题 */
.section-title {
    font-size: 15px;
    color: #333;
    margin-bottom: 12px;
    font-weight: 500;
}

/* 规格选择区域 */
.spec-section {
    margin-bottom: 24px;
}

.spec-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.spec-item {
    padding: 8px 20px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: #fff;
    user-select: none;
}

.spec-item:hover {
    border-color: #e02e24;
    color: #e02e24;
}

.spec-item.active {
    border-color: #e02e24;
    background-color: #fff0f0;
    color: #e02e24;
    font-weight: 500;
}

/* 移除 spec-item.disabled 样式 */

/* 数量选择区域 */
.number-section {
    margin-bottom: 24px;
}

.number-control {
    display: flex;
    align-items: center;
    gap: 0;
    width: 120px;
}

.control-btn {
    width: 36px;
    height: 36px;
    border: 1px solid #ddd;
    background-color: #f8f8f8;
    font-size: 18px;
    color: #333;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.control-btn.minus {
    border-radius: 6px 0 0 6px;
    border-right: none;
}

.control-btn.plus {
    border-radius: 0 6px 6px 0;
    border-left: none;
}

.control-btn:hover:not(:disabled) {
    background-color: #e8e8e8;
    color: #e02e24;
}

.control-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    color: #999;
}

.number-value {
    width: 48px;
    height: 36px;
    border: 1px solid #ddd;
    font-size: 14px;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
}

.number-tip {
    margin-top: 8px;
    font-size: 13px;
    color: #999;
}

/* 备注区域 */
.remark-section {
    margin-bottom: 30px;
}

.remark-input {
    width: 100%;
    height: 80px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    color: #333;
    resize: none;
    box-sizing: border-box;
    transition: border-color 0.2s ease;
}

.remark-input:focus {
    outline: none;
    border-color: #e02e24;
}

/* 移除 remark-input:disabled 样式 */

.remark-count {
    text-align: right;
    font-size: 12px;
    color: #999;
    margin-top: 4px;
}

/* 操作按钮区域 */
.action-buttons {
    display: flex;
    gap: 12px;
    width: 100%;
}

.btn {
    flex: 1;
    height: 48px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
}

.btn-cart {
    background-color: #fff;
    color: #e02e24;
    border: 1px solid #e02e24;
}

.btn-cart:hover:not(:disabled) {
    background-color: #fff0f0;
}

.btn-buy {
    background-color: #e02e24;
    color: #fff;
}

.btn-buy:hover:not(:disabled) {
    background-color: #c91919;
}

.btn:disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

/* 响应式适配 */
@media (max-width: 480px) {
    .order-popup {
        padding: 16px 16px 24px;
    }

    .goods-info {
        gap: 12px;
        margin-bottom: 20px;
        padding-bottom: 16px;
    }

    .goods-image {
        width: 80px;
        height: 80px;
    }

    .price {
        font-size: 20px;
    }

    .spec-item {
        padding: 6px 16px;
        font-size: 13px;
    }

    .btn {
        height: 44px;
        font-size: 15px;
    }

    .remark-input {
        height: 70px;
        padding: 10px;
        font-size: 13px;
    }
}
</style>