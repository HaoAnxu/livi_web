<script setup>
import { ref, nextTick } from 'vue'

// 模拟聊天消息列表
const messageList = ref([
  {
    id: 1,
    avatar: 'https://smarthomeunity.oss-cn-beijing.aliyuncs.com/image/CommunityLogo.png',
    name: '淘宝群助手',
    content: '欢迎加入本群，有问题随时问哦～',
    time: '09:30',
    isSelf: false
  },
  {
    id: 2,
    avatar: 'https://smarthomeunity.oss-cn-beijing.aliyuncs.com/image/CommunityLogo.png',
    name: '我',
    content: '请问这个商品有优惠吗？想给公司采购一批，大概50件左右',
    time: '09:32',
    isSelf: true
  },
  {
    id: 3,
    avatar: 'https://smarthomeunity.oss-cn-beijing.aliyuncs.com/image/CommunityLogo.png',
    name: '店铺客服-小橙',
    content: '有的亲，今天下单立减20元/件，50件的话额外再送5件同款，还包邮哦～',
    time: '09:33',
    isSelf: false
  },
  {
    id: 4,
    avatar: 'https://smarthomeunity.oss-cn-beijing.aliyuncs.com/image/CommunityLogo.png',
    name: '店铺客服-小橙',
    content: '另外如果需要开发票的话，下单后联系我备注即可，电子普票和专票都可以开',
    time: '09:34',
    isSelf: false
  },
  {
    id: 5,
    avatar: 'https://smarthomeunity.oss-cn-beijing.aliyuncs.com/image/CommunityLogo.png',
    name: '我',
    content: '太好了！那我现在就去下单，麻烦留一下库存哈',
    time: '09:35',
    isSelf: true
  }
])

// 输入框内容
const inputValue = ref('')

// 发送消息方法
const sendMessage = () => {
  if (!inputValue.value.trim()) return

  messageList.value.push({
    id: Date.now(),
    avatar: 'https://smarthomeunity.oss-cn-beijing.aliyuncs.com/image/CommunityLogo.png',
    name: '我',
    content: inputValue.value.trim(),
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: true
  })

  inputValue.value = ''

  // 自动滚动到底部
  nextTick(() => {
    const chatContent = document.querySelector('.chat-content')
    chatContent.scrollTop = chatContent.scrollHeight
  })
}

// 回车发送
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <!-- PC端淘宝风格群聊主容器 -->
  <div class="pc-chat-room">
    <!-- 左侧群聊信息栏 -->
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <div class="group-avatar">
          <img src="https://smarthomeunity.oss-cn-beijing.aliyuncs.com/image/CommunityLogo.png" alt="群聊头像" />
        </div>
        <h2 class="group-name">淘宝粉丝福利群</h2>
        <p class="group-desc">本群专属福利 · 限时优惠 · 一对一解答</p>
      </div>

      <div class="member-list">
        <h3 class="member-title">群成员 (500)</h3>
        <div class="member-item" v-for="i in 8" :key="i">
          <img src="https://smarthomeunity.oss-cn-beijing.aliyuncs.com/image/CommunityLogo.png" alt="成员头像" />
          <span class="member-name">群成员{{i}}</span>
        </div>
      </div>
    </div>

    <!-- 右侧聊天主区域 -->
    <div class="chat-main">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="header-left">
          <h2>淘宝粉丝福利群</h2>
          <p>388人在线 · 群主：店铺客服-小橙</p>
        </div>
        <div class="header-right">
          <button class="header-btn">设置</button>
          <button class="header-btn">清空记录</button>
        </div>
      </div>

      <!-- 聊天内容区域 -->
      <div class="chat-content" id="chatContentScroll">
        <!-- 每条消息 -->
        <div
            class="chat-message"
            :class="{ 'self-message': msg.isSelf }"
            v-for="msg in messageList"
            :key="msg.id"
        >
          <!-- 头像 -->
          <div class="message-avatar">
            <img :src="msg.avatar" :alt="msg.name" />
          </div>

          <!-- 消息内容 -->
          <div class="message-content-wrapper">
            <div class="message-name">{{ msg.name }}</div>
            <div class="message-content">
              {{ msg.content }}
            </div>
            <div class="message-time">{{ msg.time }}</div>
          </div>
        </div>
      </div>

      <!-- 输入框+发送按钮区域 -->
      <div class="chat-input-area">
        <!-- 输入框容器 -->
        <div class="input-container">
          <div class="input-wrapper">
            <input
                class="input"
                name="text"
                placeholder="说点儿啥？"
                type="text"
                v-model="inputValue"
                @keydown="handleKeydown"
            />
          </div>
          <button class="send-btn" @click="sendMessage">
            <span class="back"></span>
            <span class="front">发送</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/CSS/ChatRoom/input.css';
@import '@/assets/CSS/ChatRoom/main.css';
/* 通用滚动条样式 - 隐藏箭头 + 橙色主题 */
/* 聊天内容区域 + 群成员区域 通用基础样式 */
:deep(.chat-content),
:deep(.member-list) {
  /* 基础滚动配置 */
  overflow-y: auto;
  overflow-x: hidden;
  /* 火狐浏览器适配 */
  scrollbar-width: thin; /* 纤细滚动条 */
  scrollbar-color: #ff7e22 #f8f8f8; /* 滑块颜色/轨道颜色 */
  /* 隐藏火狐滚动条箭头（火狐本身无箭头，仅需控制宽度） */
}

/* Webkit内核（Chrome/Edge/Safari）- 滚动条整体 */
:deep(.chat-content::-webkit-scrollbar),
:deep(.member-list::-webkit-scrollbar) {
  width: 6px; /* 垂直滚动条宽度 */
  height: 6px; /* 水平滚动条高度（备用） */
}

/* Webkit - 滚动条轨道 */
:deep(.chat-content::-webkit-scrollbar-track),
:deep(.member-list::-webkit-scrollbar-track) {
  background: #f8f8f8; /* 浅灰轨道，贴近淘宝背景 */
  border-radius: 3px;
}

/* Webkit - 滚动条滑块（核心橙色） */
:deep(.chat-content::-webkit-scrollbar-thumb),
:deep(.member-list::-webkit-scrollbar-thumb) {
  background-color: #ff7e22; /* 指定橙色 */
  border-radius: 3px; /* 圆角更柔和 */
  border: none; /* 去除默认边框 */
  transition: background-color 0.2s ease; /*  hover过渡 */
}

/* Webkit - 滑块hover状态（加深橙色） */
:deep(.chat-content::-webkit-scrollbar-thumb:hover),
:deep(.member-list::-webkit-scrollbar-thumb:hover) {
  background-color: #e86a10; /* 略深的橙色 */
}

/* Webkit - 滑块点击激活状态 */
:deep(.chat-content::-webkit-scrollbar-thumb:active),
:deep(.member-list::-webkit-scrollbar-thumb:active) {
  background-color: #d45d00; /* 更深的橙色 */
}

/* Webkit - 隐藏滚动条箭头 + 角落样式 */
:deep(.chat-content::-webkit-scrollbar-button), /* 隐藏上下箭头 */
:deep(.member-list::-webkit-scrollbar-button) {
  display: none;
}
:deep(.chat-content::-webkit-scrollbar-corner),
:deep(.member-list::-webkit-scrollbar-corner) {
  background: #f8f8f8; /* 角落与轨道同色 */
}

/* 补充：确保群成员区域高度适配，触发滚动 */
:deep(.member-list) {
  max-height: calc(100vh - 120px); /* 根据布局自适应高度 */
}
</style>