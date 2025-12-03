<script setup>
import {useRoute} from 'vue-router'
import {ref, onUnmounted, onMounted, watch, nextTick} from "vue";
import MyMessage from "@/utils/MyMessage.js"
import {connectWebSocket, sendMessage, closeWebSocket, isConnected, subscribeMessage, unsubscribeMessage,} from '@/utils/websocket';
import {MyLoading} from "@/utils/MyLoading.js";
import {getCommunityDetailApi, getCommunityMemberListApi} from "@/api/wecommunity.js";

const route = useRoute()
// 从路由参数中获取communityId
const communityId = Number(route.query.communityId);
const loginUser = JSON.parse(sessionStorage.getItem('loginUser') || '{}');
const userId = loginUser.userId;

// 核心变量-websocket相关
const messageList = ref([]);
const message = ref(''); // 输入框绑定的变量
const onlineStatus = ref('未连接');
let currentRealtimeCallback = null;
let currentOfflineCallback = null;
// 历史记录相关
const isFirstLoad = ref(true); // 标记是否首次加载
const lastMsgId = ref(sessionStorage.getItem(`community_last_msgid_${communityId}`) || 0);
const hasMore = ref(true);
//防止多次触发请求
const loading = ref(false);
let currentHistoryCallback = null;
// 消息列表DOM引用，控制滚动到底部
const msgListRef = ref(null);
//社区基础信息
const communityInfo = ref({});
//群成员列表
const memberList = ref([]);

// 获取社区信息
const getCommunityInfo = async () => {
  MyLoading.value = true;
  try {
    const result = await getCommunityDetailApi(communityId);
    if (result.code) {
      communityInfo.value = result.data;
    } else {
      MyMessage.error(result.msg);
    }
  } catch (e) {
    console.error('获取社区信息失败：', e);
  } finally {
    MyLoading.value = false;
  }
}

// 获取群成员信息列表
const getMemberList = async () => {
  MyLoading.value = true;
  try {
    const result = await getCommunityMemberListApi(communityId);
    if (result.code) {
      memberList.value = result.data;
    } else {
      MyMessage.error(result.msg);
    }
  } catch (e) {
    console.error('获取群成员信息列表失败：', e);
  } finally {
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
    MyMessage.error('消息格式异常，请刷新重试');
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
    MyMessage.error('消息格式异常，请刷新重试');
  }
};

// 连接WebSocket
const connectWebSocketCommunity = () => {
  if (!userId) {
    MyMessage.error('请先登录！');
    return;
  }
  if (!communityId || isNaN(communityId)) {
    MyMessage.error('缺少有效社区ID！');
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

// 请求历史记录（isFirst默认是false，页面刷新或者首次进入，isFirst=true，查询最新的5条）
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
    MyMessage.error('加载历史记录失败，请重试');
    loading.value = false;
  }
};

// 处理历史记录响应
const handleChatHistory = (wrapperData) => {
  loading.value = false;
  try {
    const jsonObject = JSON.parse(wrapperData.data);
    const {historyList, hasMore: hasMoreData} = jsonObject;
    //判断是否有历史记录
    if (historyList && historyList.length > 0) {
      const formattedHistory = historyList.map(item => ({
        ...item,
        id: item.msgId,
        isSelf: item.fromUserId === userId,
        avatar: item.avatar,
        name: item.name,
      }))

      if (isFirstLoad.value) {
        // 首次加载：赋值消息列表 + 反转顺序
        messageList.value = formattedHistory.reverse(); // 反转后72、73、74、75、76（最新在底部）
        isFirstLoad.value = false;
        // 取本次列表中最小的msgId,作为下一次的lastMsgId
        //...展开数组，取最小值
        lastMsgId.value = Math.min(...formattedHistory.map(item=>(item.msgId)));
        sessionStorage.setItem(`community_last_msgid_${communityId}`, lastMsgId.value);
        // 异步滚动到底部（nextTick确保DOM更新后再滚动）
        nextTick(() => scrollToBottom());
      } else {
        // 加载更多（点击“加载更多”按钮），把查询到的数据放在列表上方，因为是历史数据，不能放在下面
        messageList.value = [...formattedHistory.reverse(), ...messageList.value];
        //取本次列表中最小的msgId,作为下一次的lastMsgId
        lastMsgId.value = Math.min(...formattedHistory.map(item => item.msgId));
        sessionStorage.setItem(`community_last_msgid_${communityId}`, lastMsgId.value);
      }
    }
    // 更新是否有更多历史记录,这个值由后端返回
    hasMore.value = hasMoreData;
  } catch (e) {
    console.error('解析历史记录失败：', e);
    hasMore.value = false;
    MyMessage.error('解析历史记录失败，请刷新');
  }
};

// 手动加载更多历史记录（按钮点击触发）
const manualLoadMore = () => {
  if (hasMore.value && !loading.value && !isFirstLoad.value) {
    requestChatHistory(false);
  }
};

// 发送消息
const handleSendMessage = () => {
  if (!message.value.trim()) {
    MyMessage.error('请输入消息内容！');
    return;
  }
  if (!isConnected.value) {
    MyMessage.error('WebSocket未连接，无法发送消息！');
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

// 滚动视口到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (msgListRef.value) {
      //把滚动条的垂直位置设为最大，即到底部
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
  getMemberList();
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
  <div class="pc-chat-room">
    <!-- 左侧群聊信息栏 -->
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <div class="group-avatar">
          <img src="https://smarthomeunity.oss-cn-beijing.aliyuncs.com/image/CommunityLogo.png" alt="群聊头像"/>
        </div>
        <h2 class="group-name">{{ communityInfo.communityName }}</h2>
        <p class="group-desc">{{ communityInfo.communityDesc }}</p>
      </div>

      <div class="member-list">
        <h3 class="member-title">群成员 ({{ communityInfo.communityMembers || 0 }})</h3>
        <div class="member-item" v-for="member in memberList" :key="member.id">
          <img :src="member.avatar" alt="成员头像"/>
          <span class="member-name">{{ member.username }}</span>
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

      <!-- 聊天内容区域 -->
      <div
          class="chat-content"
          id="chatContentScroll"
          ref="msgListRef"
      >
        <!-- 手动加载更多按钮（淘宝风格） -->
        <button
            v-if="hasMore && !loading && messageList.length > 0"
            class="load-more-btn"
            @click="manualLoadMore"
        >
          加载更多历史消息
        </button>

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

      <!-- 输入框+发送按钮区域 -->
      <div class="chat-input-area">
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