import { ref, watch } from 'vue';
import { createVNode, render } from "vue";
import Loading from '../components/MyLoading.vue';

// 创建临时DOM容器（用于挂载组件）
const loadingContainer = document.createElement('div');
document.body.appendChild(loadingContainer);

// 创建虚拟节点
const vnode = createVNode(Loading);

// 遮罩状态
export const MyLoading = ref(false);

// 标记是否已渲染，避免重复render
let isRendered = false;

// 监视遮罩状态变化
watch(MyLoading, (isShow) => {
    if (isShow) {
        // 打开遮罩：仅当未渲染时才render，避免重复挂载
        if (!isRendered) {
            render(vnode, loadingContainer);
            isRendered = true;
        }
    } else {
        // 关闭遮罩：卸载组件，重置标记
        if (isRendered) {
            render(null, loadingContainer); // 卸载组件
            isRendered = false;
        }
    }
}, { immediate: false });