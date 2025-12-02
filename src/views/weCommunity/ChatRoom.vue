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
import {MyLoading} from "@/utils/MyLoading.js";
import {getCommunityDetailApi} from "@/api/wecommunity.js";

const route = useRoute()
// 从路由参数中获取communityId
const communityId = Number(route.query.communityId);
const loginUser = JSON.parse(sessionStorage.getItem('loginUser') || '{}');
const userId = loginUser.userId;

// 核心变量
const messageList = ref([]);
const message = ref(''); // 输入框绑定的变量
const onlineStatus = ref('未连接');
let currentRealtimeCallback = null;
let currentOfflineCallback = null;
// 历史记录相关
const isFirstLoad = ref(true); // 标记是否首次加载
const lastMsgId = ref(sessionStorage.getItem(`community_last_msgid_${communityId}`) || 0);
const hasMore = ref(true);
const loading = ref(false);
let currentHistoryCallback = null;
// 消息列表DOM引用，控制滚动到底部（关键：绑定到模板的chat-content）
const msgListRef = ref(null);
//社区基础信息查询
const communityInfo = ref({});
const getCommunityInfo = async () => {
  MyLoading.value = true;
  try {
    const result = await getCommunityDetailApi(communityId);
    if (result.code) {
      communityInfo.value = result.data;
      MyLoading.value = false;
    } else {
      MyMessage.error(result.msg);
      MyLoading.value = false;
    }
  } catch (e) {
    MyLoading.value = false;
  }
}

// 处理实时消息：追加到列表尾部 + 滚动到底部
const realtimeMsg = (wrapperData) => {
  try {
    const jsonObject = JSON.parse(wrapperData.data);
    const newMsg = {
      id: jsonObject.msgId,
      msgType: 'realtime',
      content: jsonObject.content,
      fromUserId: jsonObject.fromUserId,
      communityId: jsonObject.communityId,
      msgId: jsonObject.msgId,
      isSelf: jsonObject.fromUserId === userId, // 核心：判断是否是自己发的消息
      avatar: jsonObject.avatar,
      name: jsonObject.name,
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
    const jsonObject = JSON.parse(wrapperData.data);
    const newMsg = {
      id: jsonObject.msgId, // 补充id用于v-for
      msgType: 'offline',
      content: jsonObject.content,
      fromUserId: jsonObject.fromUserId,
      communityId: jsonObject.communityId,
      msgId: jsonObject.msgId,
      isSelf: jsonObject.fromUserId === userId, // 判断是否是自己的消息
      avatar: jsonObject.avatar,
      name: jsonObject.name,
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
const handleChatHistory = (wrapperData) => { // 注意参数名改为wrapperData（更语义化）
  loading.value = false;
  try {
    // 第一步：如果wrapperData是对象，直接取；如果是字符串，先解析外层
    const wrapperObj = typeof wrapperData === 'string'
        ? JSON.parse(wrapperData)
        : wrapperData;

    // 第二步：解析内层的data字段（后端返回的JSON字符串）
    const jsonObject = JSON.parse(wrapperObj.data); // 关键：解析嵌套的data

    const {historyList, hasMore: hasMoreData, currentLastMsgId} = jsonObject;
    //如果历史聊天记录有数据
    if (historyList && historyList.length > 0) {
      // 补全历史消息的isSelf/avatar/name字段
      const formattedHistory = historyList.map(item => ({
        ...item,
        id: item.msgId,
        isSelf: item.fromUserId === userId,
        avatar: item.avatar,
        name: item.name,
      }));

      if (isFirstLoad.value) {
        // 首次加载，直接把历史聊天记录添加到消息列表
        messageList.value = formattedHistory;
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
        messageList.value = [...formattedHistory, ...messageList.value];
        // 保持滚动位置（加载更多后不自动跳到底部）
        nextTick(() => {
          if (msgListRef.value) {
            msgListRef.value.scrollTop = msgListRef.value.scrollHeight - (msgListRef.value.scrollHeight - scrollTop);
          }
        });
      }
      lastMsgId.value = currentLastMsgId;
      sessionStorage.setItem(`community_last_msgid_${communityId}`, currentLastMsgId);
    }
    hasMore.value = hasMoreData;
  } catch (e) {
    console.error('解析历史记录失败：', e);
    // 友好提示：区分空列表和解析错误
    if (e.message.includes('currentLastMsgId')) {
      // 实际是历史记录为空，非真正的解析错误
      hasMore.value = false;
      Message.info('暂无历史聊天记录');
    } else {
      Message.error('解析历史记录失败，请刷新');
    }
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
    fromUserId: userId,
    communityId: communityId,
  };

  sendMessage(msg);
  message.value = '';
  scrollToBottom();
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

// 回车发送消息
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
};

// 监听连接状态
const unwatchStatus = watch(() => isConnected.value, (newVal) => {
  onlineStatus.value = newVal ? '已连接' : '已断开';
}, {immediate: true});

onMounted(() => {
  connectWebSocketCommunity();
  getCommunityInfo();
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
  <!-- PC端淘宝风格群聊主容器 -->
  <div class="pc-chat-room">
    <!-- 左侧群聊信息栏 -->
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <div class="group-avatar">
          <img src="https://smarthomeunity.oss-cn-beijing.aliyuncs.com/image/CommunityLogo.png" alt="群聊头像"/>
        </div>
        <h2 class="group-name">{{ communityInfo.communityName }}</h2>
        <p class="group-desc">{{ communityInfo.communityDesc }}</p>
        <p class="online-status">连接状态：{{ onlineStatus }}</p> <!-- 显示WS连接状态 -->
      </div>

      <div class="member-list">
        <h3 class="member-title">群成员 ({{ communityInfo.communityMembers || 0 }})</h3>
        <div class="member-item" v-for="i in 8" :key="i">
          <img src="https://smarthomeunity.oss-cn-beijing.aliyuncs.com/image/CommunityLogo.png" alt="成员头像"/>
          <span class="member-name">群成员{{ i }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧聊天主区域 -->
    <div class="chat-main">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="header-left">
          <h2>{{ communityInfo.communityName }}</h2>
        </div>
        <div class="header-right">
          <button class="header-btn">设置</button>
          <button class="header-btn">清空记录</button>
        </div>
      </div>

      <!-- 聊天内容区域：绑定ref + 滚动监听 + 加载状态 -->
      <div
          class="chat-content"
          id="chatContentScroll"
          ref="msgListRef"
          @scroll="handleScroll"
      >
        <!-- 加载中提示 -->
        <div v-if="loading" class="loading-tip">加载中...</div>
        <!-- 无更多数据提示 -->
        <div v-if="!hasMore && messageList.length > 0" class="no-more-tip">没有更多历史消息了</div>
        <!-- 无消息提示 -->
        <div v-if="!loading && messageList.length === 0" class="no-msg-tip">暂无聊天记录</div>

        <!-- 每条消息 -->
        <div
            class="chat-message"
            :class="{ 'self-message': msg.isSelf }"
            v-for="msg in messageList"
            :key="msg.id"
        >
          <!-- 头像 -->
          <div class="message-avatar">
            <img :src="msg.avatar" :alt="msg.name"/>
          </div>

          <!-- 消息内容 -->
          <div class="message-content-wrapper">
            <div class="message-name">{{ msg.name }}</div>
            <div class="message-content">
              {{ msg.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- 输入框+发送按钮区域：绑定脚本变量和方法 -->
      <div class="chat-input-area">
        <!-- 输入框容器 -->
        <div class="input-container">
          <div class="input-wrapper">
            <input
                class="input"
                name="text"
                placeholder="说点儿啥？"
                type="text"
                v-model="message"
                @keydown="handleKeydown"
            />
          </div>
          <button
              class="send-btn"
              @click="handleSendMessage"
          >
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
</style>