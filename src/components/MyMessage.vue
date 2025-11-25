<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success',
    validator: val => ['success', 'error', 'warn'].includes(val) // 只允许三种类型
  }
});
const emit = defineEmits(['close'])
const isShow = ref(false)

onMounted(() => {
  // 触发显示动画
  setTimeout(() => isShow.value = true, 10)
  // 1.5秒后自动关闭（简化定时器逻辑）
  setTimeout(() => close(), 1500)
})

const close = () => {
  isShow.value = false
  // 等待动画结束移除组件
  setTimeout(() => emit('close'), 300)
}
</script>

<template>
  <div class="message-bubble" :class="[type, { show: isShow, hide: !isShow }]">
    {{ message }}
  </div>
</template>

<style scoped>
.message-bubble {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  z-index: 9999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

/* 显示/隐藏动画 */
.message-bubble.show {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, 0);
}
.message-bubble.hide {
  opacity: 0;
  visibility: hidden;
  transform: translate(-50%, 20px);
}

/* 成功：浅绿系 */
.success {
  background: #f0f9f4;
  color: #00b42a;
  border: 1px solid #d7f2e3;
  box-shadow: 0 4px 12px rgba(0, 180, 42, 0.08);
}
/* 错误：浅红系 */
.error {
  background: #fef2f2;
  color: #f53f3f;
  border: 1px solid #fcd5d5;
  box-shadow: 0 4px 12px rgba(245, 63, 63, 0.08);
}
/* 警告：浅橙系 */
.warn {
  background: #fff7e6;
  color: #ff7d00;
  border: 1px solid #ffdba0;
  box-shadow: 0 4px 12px rgba(255, 125, 0, 0.08);
}

/* 响应式简化 */
@media (max-width: 768px) {
  .message-bubble {
    width: 50%;
    font-size: 14px;
    padding: 12px 18px;
    bottom: 40px;
  }
}
</style>