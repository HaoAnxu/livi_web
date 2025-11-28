<script setup>
import {useRoute} from 'vue-router'
import {ref, onUnmounted, onMounted, watch, nextTick} from "vue";
import Message from "@/utils/MyMessage.js"
import {
  connectWebSocket,
  sendMessage,
  closeWebSocket,
  isConnected,
  subscribeMessage,
  unsubscribeMessage,
} from '@/utils/websocket';

const route = useRoute()
const communityId = Number(route.query.communityId);
const loginUser = JSON.parse(sessionStorage.getItem('loginUser') || '{}');
const userId = loginUser.userId;

// 核心变量
const messageList = ref([]);
const message = ref('');
const onlineStatus = ref('未连接');
let currentRealtimeCallback = null;
let currentOfflineCallback = null;
// 历史记录相关
const isFirstLoad = ref(true); // 标记是否首次加载
const lastMsgId = ref(sessionStorage.getItem(`community_last_msgid_${communityId}`) || 0);
const hasMore = ref(true);
const loading = ref(false);
let currentHistoryCallback = null;
// 消息列表DOM引用，控制滚动到底部
const msgListRef = ref(null);

// 处理实时消息：追加到列表尾部 + 滚动到底部
const realtimeMsg = (wrapperData) => {
  try {
    const innerData = JSON.parse(wrapperData.data);
    const newMsg = {
      msgType: 'realtime',
      content: innerData.content,
      fromUserId: innerData.fromUserId,
      communityId: innerData.communityId,
      msgId: innerData.msgId
    };
    messageList.value.push(newMsg);
    // 实时消息自动滚动到底部
    scrollToBottom();
  } catch (e) {
    console.error('解析嵌套消息数据失败：', e);
    Message.error('消息格式异常，请刷新重试');
  }
};

// 处理离线消息：追加到列表尾部 + 滚动到底部
const offlineMsg = (wrapperData) => {
  try {
    const innerData = JSON.parse(wrapperData.data);
    const newMsg = {
      msgType: 'offline',
      content: innerData.content,
      fromUserId: innerData.fromUserId,
      communityId: innerData.communityId,
      msgId: innerData.msgId
    };
    messageList.value.push(newMsg);
    scrollToBottom();
  } catch (e) {
    console.error('解析嵌套消息数据失败：', e);
    Message.error('消息格式异常，请刷新重试');
  }
};

// 连接WebSocket
const connectWebSocketCommunity = () => {
  if (!userId) {
    Message.error('请先登录！');
    return;
  }
  if (!communityId || isNaN(communityId)) {
    Message.error('缺少有效社区ID！');
    return;
  }
  // 取消旧订阅
  if (currentRealtimeCallback) unsubscribeMessage('realtime', currentRealtimeCallback);
  if (currentOfflineCallback) unsubscribeMessage('offline', currentOfflineCallback);
  if (currentHistoryCallback) unsubscribeMessage('chat_history_data', currentHistoryCallback);

  // 拼接WS路径
  const wsUrl = `/ws/community/${communityId}/${userId}`;
  connectWebSocket(userId, communityId, wsUrl);

  // 订阅消息
  subscribeMessage('realtime', realtimeMsg);
  subscribeMessage('offline', offlineMsg);
  subscribeMessage('chat_history_data', handleChatHistory);

  // 存储回调
  currentRealtimeCallback = realtimeMsg;
  currentOfflineCallback = offlineMsg;
  currentHistoryCallback = handleChatHistory;

  // 清空消息列表
  messageList.value = [];

  // 首次加载（包括刷新）
  if (isFirstLoad.value) {
    setTimeout(() => {
      requestChatHistory(true);
    }, 500);
  }
};

// 请求历史记录（isFirst默认是false）
const requestChatHistory = async (isFirst = false) => {
  if (!isConnected.value || loading.value || (!hasMore.value && !isFirst)) return;
  loading.value = true;
  try {
    const historyReq = {
      msgType: "request_chat_history",
      lastMsgId: isFirst ? 0 : lastMsgId.value,
      pageSize: 20,
      isFirst: isFirst
    };
    sendMessage(historyReq);
  } catch (e) {
    Message.error('加载历史记录失败，请重试');
    loading.value = false;
  }
};

// 处理历史记录返回
const handleChatHistory = (jsonString) => {
  loading.value = false;
  try {
    const jsonObject = JSON.parse(jsonString);
    const {historyList, hasMore: hasMoreData, currentLastMsgId} = jsonObject;
    //如果历史聊天记录有数据
    if (historyList && historyList.length > 0) {
      if (isFirstLoad.value) {
        // 首次加载，直接把历史聊天记录添加到消息列表
        messageList.value = historyList;
        // 标记“首次加载完成”：后续再加载就是“上拉加载更多”了
        isFirstLoad.value = false;
        // 首次加载完成后滚动到底部（显示最新消息）
        nextTick(() => {
          scrollToBottom();
        });
      } else {
        // 上拉加载：追加到列表头部（更早的消息）
        // 先记录当前滚动高度，避免加载后跳屏
        const scrollTop = msgListRef.value?.scrollTop || 0;
        messageList.value = [...ascHistory, ...messageList.value];
        // 保持滚动位置（加载更多后不自动跳到底部）
        nextTick(() => {
          if (msgListRef.value) {
            msgListRef.value.scrollTop = msgListRef.value.scrollTop + scrollTop;
          }
        });
      }
      lastMsgId.value = currentLastMsgId;
      sessionStorage.setItem(`community_last_msgid_${communityId}`, currentLastMsgId);
    }
    hasMore.value = hasMoreData;
  } catch (e) {
    console.error('解析历史记录失败：', e);
    Message.error('解析历史记录失败，请刷新');
  }
};

// 发送消息
const handleSendMessage = () => {
  if (!message.value.trim()) {
    Message.error('请输入消息内容！');
    return;
  }
  if (!isConnected.value) {
    Message.error('WebSocket未连接，无法发送消息！');
    return;
  }

  const msg = {
    content: message.value.trim(),
    msgType: 'text',
  };

  sendMessage(msg);
  message.value = '';
};

// 加载更多历史
const loadMoreHistory = () => {
  if (hasMore.value && !loading.value && !isFirstLoad.value) {
    requestChatHistory(false);
  }
};

// 滚动监听：上拉加载（滚动到顶部时加载更多）
const handleScroll = (e) => {
  const {scrollTop} = e.target;
  // 滚动到顶部（距离顶部<10px）时加载更多
  if (scrollTop <= 10) {
    loadMoreHistory();
  }
};

// 滚动视口到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (msgListRef.value) {
      // 滚动到最大高度（底部）
      msgListRef.value.scrollTop = msgListRef.value.scrollHeight;
    }
  });
};

// 监听连接状态
const unwatchStatus = watch(() => isConnected.value, (newVal) => {
  onlineStatus.value = newVal ? '已连接' : '已断开';
}, {immediate: true});

onMounted(() => {
  connectWebSocketCommunity();
});

onUnmounted(() => {
  // 取消所有订阅
  if (currentRealtimeCallback) unsubscribeMessage('realtime', currentRealtimeCallback);
  if (currentOfflineCallback) unsubscribeMessage('offline', currentOfflineCallback);
  if (currentHistoryCallback) unsubscribeMessage('chat_history_data', currentHistoryCallback);
  // 关闭连接
  closeWebSocket();
  // 取消监听
  unwatchStatus();
});
</script>

<template>
  <!-- From Uiverse.io by 0xnihilism -->
  <div class="input-wrapper">
    <input class="input" name="text" placeholder="Type here..." type="text" />
  </div>

  <!-- 消息列表容器：固定高度 + 滚动监听 + 引用绑定 -->
  <div
      class="message-list"
      @scroll="handleScroll"
      ref="msgListRef"
  >
    <!-- 每条消息 -->
    <div
        v-for="(item, index) in messageList"
        :key="index"
        class="message-item"
    >
      <!-- 区分自己和他人消息 -->
      <div
          :class="['msg-content', item.fromUserId === userId ? 'self' : 'other']"
      >
        {{ item.content }}
      </div>
    </div>
    <!-- 加载中提示 -->
    <div v-if="loading" class="loading">加载中...</div>
  </div>

  <!-- 发送框 -->
  <div class="send-area">
    <input
        v-model="message"
        type="text"
        placeholder="输入消息..."
    >
    <button @click="handleSendMessage">发送</button>
  </div>
</template>

<style scoped>
/* From Uiverse.io by 0xnihilism */
/* Fancy-ass Input Styling 10.0 - The Emoji Extravaganza */
.input-wrapper {
  position: relative;
  width: 50%;
  max-width: 300px;
  padding: 3px;
  border-radius: 1.7rem;
  overflow: hidden;
}

.input-wrapper input {
  background-color: #f5f5f5;
  border: 2px solid #ddd;
  padding: 1.2rem 1rem 1.2rem 3rem; /* Increased left padding for emoji */
  font-size: 1.1rem;
  width: 100%;
  border-radius: 1.5rem;
  color: #ff7f7f;
  box-shadow: 0 0.4rem #dfd9d9, inset 0 0 0 transparent;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  z-index: 2;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #4a90e2; /* Changed to blue */
  box-shadow: 0 0.6rem #dfd9d9, 0 0 15px rgba(74, 144, 226, 0.7); /* Blue glow */
  transform: translateY(-3px) scale(1.01);
}

.input-wrapper input::placeholder {
  color: #a0c0e8; /* Lighter blue for placeholder */
  transition: all 0.3s ease;
}

.input-wrapper input:focus::placeholder {
  opacity: 0;
  transform: translateX(10px);
}

/* Emoji styles */
.input-wrapper::after {
  content: "😎";
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  z-index: 3;
  transition: all 0.3s ease;
}

/* Emoji animations */
@keyframes dance {
  0%,
  100% {
    transform: translateY(-50%) rotate(0deg);
  }
  25% {
    transform: translateY(-50%) rotate(-20deg) scale(1.1);
  }
  75% {
    transform: translateY(-50%) rotate(20deg) scale(1.1);
  }
}

.input-wrapper:hover::after {
  animation: dance 0.5s ease infinite;
}

.input-wrapper:focus-within::after {
  content: "😂";
  animation: dance 0.3s ease infinite;
}

.input-wrapper input::placeholder {
  color: #ccc;
  transition: all 0.3s ease;
}

.input-wrapper input:focus::placeholder {
  opacity: 0;
  transform: translateX(10px);
}

/* Psychedelic background effect */
.input-wrapper::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
      from 0deg,
      #4a90e2,
      #6aa9e9,
      #8bc1f0,
      #add9f7,
      #d0f0ff,
      #add9f7,
      #8bc1f0,
      #6aa9e9,
      #4a90e2
  );
  animation: rotate 4s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.input-wrapper:hover::before,
.input-wrapper:focus-within::before {
  opacity: 1;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

/* Shockwave effect on focus */
@keyframes shockwave {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 127, 127, 0.4);
  }
  70% {
    transform: scale(1.02);
    box-shadow: 0 0 0 20px rgba(255, 127, 127, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 127, 127, 0);
  }
}

.input-wrapper:focus-within {
  animation: shockwave 0.5s ease-out;
}

/* Floating label effect */
.input-wrapper {
  --label-size: 0.8rem;
  --label-transform: translateY(-170%) scale(0.8);
}

.input-wrapper input:placeholder-shown + label {
  transform: translateY(-50%);
  font-size: 1rem;
}

.input-wrapper label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: var(--label-transform);
  font-size: var(--label-size);
  color: #ff7f7f;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 3;
}

.input-wrapper input:not(:placeholder-shown) + label,
.input-wrapper input:focus + label {
  transform: var(--label-transform);
  font-size: var(--label-size);
}

.message-list {
  height: 600px; /* 可根据页面调整 */
  overflow-y: auto;
  border: 1px solid #eee;
  padding: 10px;
  margin-bottom: 20px;
}

/* 消息项：区分自己和他人 */
.message-item {
  margin-bottom: 10px;
}

.msg-content {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 8px;
}

/* 他人消息：左对齐 */
.other {
  background-color: #f5f5f5;
  float: left;
  clear: both;
}

/* 自己消息：右对齐 */
.self {
  background-color: #0088ff;
  color: white;
  float: right;
  clear: both;
}

/* 加载中提示 */
.loading {
  text-align: center;
  color: #999;
  padding: 5px 0;
}

/* 发送区域 */
.send-area {
  display: flex;
  gap: 10px;
}

.send-area input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.send-area button {
  padding: 8px 20px;
  background-color: #0088ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>