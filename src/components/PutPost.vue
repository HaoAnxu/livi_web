<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { sendPostApi, queryCircleListByUserIdApi } from '@/api/wepost'
import MyMessage from '@/utils/MyMessage.js'
import { MyLoading } from '@/utils/MyLoading.js'
import { useRouter } from 'vue-router'

const router = useRouter();
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])

const loginUser = ref('')
const userId = ref(0)

const title = ref('')
const content = ref('')
const topicValue = ref('')
const circleValue = ref('')
const showTopicDropdown = ref(false)
const showCircleDropdown = ref(false)
const topicLabel = ref('')
const circleLabel = ref('')
const circleList = ref([])
const topicOptions = ref([])

watch(() => props.visible, (newVal) => {
    if (newVal) {
        queryCircleList()
    } else {
        resetForm()
        closeDropdowns()
    }
})

const filteredTopicOptions = computed(() => {
    if (!topicLabel.value) return topicOptions.value
    return topicOptions.value.filter(option =>
        option.label.toLowerCase().includes(topicLabel.value.toLowerCase()) ||
        option.value.toString().toLowerCase().includes(topicLabel.value.toLowerCase())
    )
})

const filteredCircleOptions = computed(() => {
    if (!circleLabel.value) return circleList.value
    return circleList.value.filter(option =>
        option.label.toLowerCase().includes(circleLabel.value.toLowerCase()) ||
        option.value.toString().toLowerCase().includes(circleLabel.value.toLowerCase())
    )
})

const canSubmit = computed(() => {
    return content.value.trim() && circleValue.value
})

const selectTopic = (option) => {
    topicLabel.value = option.label
    topicValue.value = option.value
    showTopicDropdown.value = false
}

const selectCircle = (option) => {
    circleLabel.value = option.label
    circleValue.value = option.value
    showCircleDropdown.value = false
}

const closeDropdowns = () => {
    showTopicDropdown.value = false
    showCircleDropdown.value = false
}

const handleClickOutside = (event) => {
    const topicInput = event.target.closest('.topic-input-wrapper')
    const circleInput = event.target.closest('.circle-input-wrapper')
    const dropdownMenu = event.target.closest('.dropdown-menu')

    if (!topicInput && !circleInput && !dropdownMenu) {
        closeDropdowns()
    }
}

const resetForm = () => {
    title.value = ''
    content.value = ''
    topicValue.value = ''
    circleValue.value = ''
    topicLabel.value = ''
    circleLabel.value = ''
}

const queryCircleList = async () => {
    MyLoading.value = true
    try {
        const result = await queryCircleListByUserIdApi({
            id: userId.value,
            page: 1,
            pageSize: 100
        })
        if (result.code) {
            circleList.value = result.data.rows.map(item => ({
                label: item.circleName,
                value: item.circleId
            }))
        } else {
            MyMessage.error(result.msg)
        }
    } catch (e) {
        MyMessage.error('查询圈子列表失败')
    } finally {
        MyLoading.value = false
    }
}

const publishPost = async () => {
    MyLoading.value = true
    try {
        const result = await sendPostApi({
            userId,
            circleId: circleValue.value,
            postTitle: title.value,
            postContent: content.value,
            postImage: ''
        })
        if (result.code) {
            MyMessage.success('发表成功')
            emit('close')
            // 刷新页面
            window.location.reload(true);
        } else {
            MyMessage.error(result.msg)
        }
    } catch (e) {
        MyMessage.error('发表失败')
    } finally {
        MyLoading.value = false
    }
}

const handlePublish = async () => {
    if (!content.value.trim()) {
        MyMessage.warning('请输入内容')
        return
    }
    if (!circleValue.value) {
        MyMessage.warning('请选择圈子')
        return
    }
    await publishPost()
}

const handleCancel = () => {
    emit('close')
}

onMounted(() => {
    const userInfo = sessionStorage.getItem('loginUser');
    if (!userInfo) {
        router.push('/login')
        MyMessage.warn('请先登录')
        return;
    }
    userId.value = JSON.parse(userInfo).userId;
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div class="modal-mask" @click.self="handleCancel" v-if="visible">
        <!-- 阻止事件冒泡 -->
        <div class="post-modal" @click.stop>
            <h3 class="modal-title">发表动态</h3>

            <textarea class="content-input" placeholder="标题" v-model="title" maxlength="20"
                style="height: 60px;"></textarea>
            <textarea class="content-input" placeholder="这一刻的想法..." v-model="content" maxlength="500"
                style="height: 150px;"></textarea>

            <div class="upload-section">
                <div class="upload-btn" title="上传图片">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                </div>
                <div class="upload-btn" title="上传视频">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                </div>
            </div>

            <div class="select-group">
                <div class="select-item topic-input-wrapper">
                    <label>话题</label>
                    <div class="select-wrapper">
                        <input type="text" class="search-select" v-model="topicLabel" placeholder="请输入或选择话题"
                            @focus="showTopicDropdown = true">
                        <div class="dropdown-menu" :class="{ show: showTopicDropdown }">
                            <div v-for="item in filteredTopicOptions" :key="item.value" class="dropdown-item"
                                @click.stop="selectTopic(item)">
                                <span class="item-label">{{ item.label }}</span>
                                <span class="item-value">{{ item.value }}</span>
                            </div>
                            <div v-if="filteredTopicOptions.length === 0" class="dropdown-empty">
                                无匹配结果
                            </div>
                        </div>
                    </div>
                </div>

                <div class="select-item circle-input-wrapper">
                    <label>圈子</label>
                    <div class="select-wrapper">
                        <input type="text" class="search-select" v-model="circleLabel" placeholder="请输入或选择圈子"
                            @focus="showCircleDropdown = true">
                        <div class="dropdown-menu" :class="{ show: showCircleDropdown }">
                            <!-- 阻止事件冒泡 -->
                            <div v-for="item in filteredCircleOptions" :key="item.value" class="dropdown-item"
                                @click.stop="selectCircle(item)">
                                <span class="item-label">{{ item.label }}</span>
                                <span class="item-value">{{ item.value }}</span>
                            </div>
                            <div v-if="filteredCircleOptions.length === 0" class="dropdown-empty">
                                无匹配结果
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <a href="#" class="declaration">创作声明 ></a>

            <div class="btn-group">
                <button class="cancel-btn" @click="handleCancel">取消</button>
                <button class="confirm-btn" :class="{ disabled: !canSubmit }" @click="handlePublish"
                    :disabled="!canSubmit">
                    确认
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ====== 基础布局 ====== */
.modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 16px;
    box-sizing: border-box;
}

.post-modal {
    width: 100%;
    max-width: 600px;
    background-color: #2c2c2c;
    border-radius: 12px;
    padding: 24px;
    color: #fff;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    box-sizing: border-box;
    animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.modal-title {
    text-align: center;
    font-size: 18px;
    margin: 0 0 20px 0;
    padding-bottom: 16px;
    border-bottom: 1px solid #444;
    font-weight: 500;
}

/* ====== 内容输入框 ====== */
.content-input {
    width: 100%;
    max-height: 200px;
    background-color: #3a3a3a;
    border: 1px solid #444;
    border-radius: 8px;
    color: #fff;
    padding: 14px;
    resize: none;
    margin-bottom: 16px;
    box-sizing: border-box;
    transition: border-color 0.3s ease;
    font-size: 14px;
    line-height: 1.6;
}

.content-input::placeholder {
    color: #888;
}

.content-input:focus {
    outline: none;
    border-color: #ff7a00;
}

/* ====== 上传按钮区域 ====== */
.upload-section {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.upload-btn {
    width: 44px;
    height: 44px;
    border: 1px dashed #444;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: transparent;
}

.upload-btn:hover {
    border-color: #ff7a00;
    color: #ff7a00;
    background-color: rgba(255, 122, 0, 0.05);
}

/* ====== 选择组 ====== */
.select-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
}

.select-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
}

.select-item label {
    font-size: 13px;
    color: #888;
    font-weight: 400;
}

.select-wrapper {
    position: relative;
}

.search-select {
    width: 100%;
    height: 42px;
    background-color: #3a3a3a;
    border: 1px solid #444;
    border-radius: 8px;
    color: #fff;
    padding: 0 12px;
    box-sizing: border-box;
    transition: border-color 0.3s ease;
    font-size: 14px;
}

.search-select:focus {
    outline: none;
    border-color: #ff7a00;
}

/* ====== 自定义下拉菜单 ====== */
.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #3a3a3a;
    border: 1px solid #444;
    border-radius: 8px;
    margin-top: 4px;
    max-height: 240px;
    overflow-y: auto;
    z-index: 100;
    display: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    animation: dropdownFadeIn 0.2s ease;
}

.dropdown-menu.show {
    display: block;
}

@keyframes dropdownFadeIn {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.dropdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.dropdown-item:hover {
    background-color: #4a4a4a;
}

.item-label {
    color: #fff;
    font-size: 14px;
}

.item-value {
    color: #888;
    font-size: 12px;
}

.dropdown-empty {
    padding: 16px;
    text-align: center;
    color: #888;
    font-size: 13px;
}

/* 下拉菜单滚动条：完全隐藏 */
.dropdown-menu::-webkit-scrollbar {
    width: 0;
    height: 0;
}

.dropdown-menu {
    /* 兼容非webkit内核浏览器 */
    scrollbar-width: none;
    /* firefox */
    -ms-overflow-style: none;
    /* IE/Edge */
}

/* ====== 创作声明 ====== */
.declaration {
    font-size: 12px;
    color: #888;
    text-decoration: none;
    display: inline-block;
    margin-bottom: 16px;
    transition: color 0.3s ease;
}

.declaration:hover {
    color: #ff7a00;
}

/* ====== 操作按钮 ====== */
.btn-group {
    display: flex;
    gap: 12px;
}

.cancel-btn,
.confirm-btn {
    flex: 1;
    border: none;
    border-radius: 8px;
    color: #fff;
    padding: 12px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
}

.cancel-btn {
    background-color: #444;
}

.cancel-btn:hover {
    background-color: #555;
}

.confirm-btn {
    background-color: #ff7a00;
    font-weight: 500;
}

.confirm-btn:hover:not(.disabled) {
    background-color: #ff8c28;
    transform: translateY(-1px);
}

.confirm-btn.disabled {
    background-color: #444;
    color: #888;
    cursor: not-allowed;
}

/* ====== 响应式设计 ====== */

/* 平板设备 (768px - 1024px) */
@media (max-width: 1024px) {
    .post-modal {
        max-width: 500px;
        padding: 22px;
    }
}

/* 手机设备 (≤768px) */
@media (max-width: 768px) {
    .modal-mask {
        padding: 12px;
        align-items: flex-end;
        /* 底部对齐 */
    }

    .post-modal {
        max-width: none;
        border-radius: 16px 16px 0 0;
        padding: 20px;
        max-height: 90vh;
        overflow-y: auto;
    }

    .select-group {
        grid-template-columns: 1fr;
        /* 单列布局 */
        gap: 14px;
    }

    .dropdown-menu {
        max-height: 200px;
    }

    .content-input {
        min-height: 120px;
        font-size: 15px;
        /* 移动端字体稍大 */
    }

    .upload-section {
        gap: 10px;
    }

    .upload-btn {
        width: 48px;
        /* 移动端加大点击区域 */
        height: 48px;
    }

    .search-select {
        height: 46px;
        /* 移动端加大输入框高度 */
        font-size: 15px;
    }

    .btn-group {
        gap: 10px;
    }

    .cancel-btn,
    .confirm-btn {
        padding: 14px;
        font-size: 15px;
    }
}

/* 小屏手机 (≤480px) */
@media (max-width: 480px) {
    .post-modal {
        padding: 16px;
        border-radius: 20px 20px 0 0;
    }

    .modal-title {
        font-size: 16px;
        margin-bottom: 16px;
        padding-bottom: 14px;
    }

    .content-input {
        min-height: 100px;
        padding: 12px;
    }

    .upload-section {
        gap: 8px;
    }

    .upload-btn {
        width: 44px;
        height: 44px;
    }

    .select-group {
        gap: 12px;
    }

    .select-item label {
        font-size: 12px;
    }

    .dropdown-item {
        padding: 12px;
    }

    .item-label {
        font-size: 15px;
    }

    .item-value {
        font-size: 13px;
    }

    .preview-text {
        font-size: 15px;
    }

    .content-preview {
        padding: 12px;
    }
}

/* 超小屏手机 (≤360px) */
@media (max-width: 360px) {
    .modal-mask {
        padding: 8px;
    }

    .post-modal {
        padding: 14px;
    }

    .search-select {
        height: 42px;
    }

    .dropdown-menu {
        max-height: 180px;
    }

    .upload-btn {
        width: 40px;
        height: 40px;
    }
}

/* 横屏手机 */
@media (max-height: 500px) and (max-width: 768px) {
    .modal-mask {
        align-items: center;
        padding: 16px;
    }

    .post-modal {
        border-radius: 12px;
        max-height: 95vh;
    }

    .content-input {
        min-height: 80px;
    }
}

/* 暗色模式下的输入框占位符颜色优化 */
@media (prefers-color-scheme: dark) {
    .content-input::placeholder {
        color: #666;
    }
}
</style>