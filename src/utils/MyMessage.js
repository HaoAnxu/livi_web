import { createVNode, render } from 'vue'
import MyMessage from '../components/MyMessage.vue'

// 挂载容器
const container = document.createElement('div')
document.body.appendChild(container)

let currentVNode = null // 控制单条消息显示

const MessageUtil = (options) => {
    // 简化参数处理：只支持字符串和对象两种调用
    const opts = typeof options === 'string' ? { message: options } : options

    // 关闭当前消息（简化关闭逻辑）
    const closeCurrent = () => {
        if (currentVNode) {
            render(null, container)
            currentVNode = null
        }
    }

    // 创建虚拟节点并传递参数
    const vnode = createVNode(MyMessage, { ...opts, close: closeCurrent })
    closeCurrent() // 覆盖旧消息
    currentVNode = vnode
    render(vnode, container)
}

// 简化快捷方法：只保留三种状态
['success', 'error', 'warn'].forEach(type => {
    MessageUtil[type] = (message) => {
        MessageUtil({ message, type })
    }
})

export default MessageUtil