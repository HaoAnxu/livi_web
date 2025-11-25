<script setup>
import {ref, onUnmounted, onMounted} from "vue";
import Message from "@/utils/MyMessage.js"
import {verifyIsLogin} from "@/api/wecommunity"
import {
  connectWebSocket,
  sendMessage,
  closeWebSocket,
  isConnected,
  subscribeMessage,
  unsubscribeMessage,
} from '@/utils/websocket';
import router from "@/router/index.js";

// 变量
const userId = ref('1'); // 默认用户ID（可修改）
const toUserId = ref('2');
const sendContent = ref(''); // 要发送的消息
const messageList = ref([]); // 消息记录
let currentChatCallback = null; // 存储聊天消息回调（单独存，避免混乱）
let currentSystemCallback = null; // 存储系统消息回调

// 1. 定义聊天消息回调（只处理type：'chat_msg'的消息）
const handleChatMsg = (data) => {
  messageList.value.push({
    type: 'receive', // 和发送的'send'区分，方便样式控制
    time: new Date().toLocaleString(),
    content: `用户[${data.fromUserId}]：${data.content}`
  });
};

// 2. 定义系统消息回调（处理后端的'success'/'error'类型消息）
const handleSystemMsg = (data) => {
  messageList.value.push({
    type: 'system', // 系统提示类型，灰色显示
    time: new Date().toLocaleString(),
    content: data.msg // 后端返回的提示内容（比如“连接成功”“发送成功”）
  });
};

// 3. 手动连接WebSocket
const handleConnect = () => {
  if (!userId.value) {
    Message.error('请先输入你的用户ID！');
    return;
  }

  // 切换用户时：先取消之前的所有订阅（避免消息错乱）
  if (currentChatCallback) {
    unsubscribeMessage('chat_msg', currentChatCallback);
  }
  if (currentSystemCallback) {
    unsubscribeMessage('success', currentSystemCallback);
    unsubscribeMessage('error', currentSystemCallback);
  }

  // 拼接当前用户的WS地址
  const wsUrl = `/ws/permission/chat/${userId.value}`;
  // 连接WebSocket
  connectWebSocket(userId.value, wsUrl);

  // 订阅聊天消息和系统消息
  subscribeMessage('chat_msg', handleChatMsg);
  subscribeMessage('success', handleSystemMsg); // 订阅成功提示
  subscribeMessage('error', handleSystemMsg); // 订阅错误提示

  // 记录当前回调，方便后续取消
  currentChatCallback = handleChatMsg;
  currentSystemCallback = handleSystemMsg;

  // 清空之前的消息记录（切换用户时清空）
  messageList.value = [];
};

// 4. 手动断开WebSocket
const handleDisconnect = () => {
  closeWebSocket();

  // 断开时取消所有订阅
  if (currentChatCallback) {
    unsubscribeMessage('chat_msg', currentChatCallback);
    currentChatCallback = null;
  }
  if (currentSystemCallback) {
    unsubscribeMessage('success', currentSystemCallback);
    unsubscribeMessage('error', currentSystemCallback);
    currentSystemCallback = null;
  }

  Message.success('WebSocket已断开连接');
};

// 5. 发送聊天消息
const sendMessageToSpring = () => {
  if (!sendContent.value || !toUserId.value) {
    Message.error('请输入消息内容和接收者ID！');
    return;
  }
  const message = {
    type: 'chat_msg',
    fromUserId: userId.value,
    toUserId: toUserId.value,
    content: sendContent.value
  };
  sendMessage(message);
  // 自己发送的消息添加到列表
  messageList.value.push({
    type: 'send',
    time: new Date().toLocaleString(),
    content: `我发给[${toUserId.value}]：${sendContent.value}`,
  });
  sendContent.value = '';
};

// 6. 组件卸载时：确保断开连接+取消所有订阅
onUnmounted(() => {
  if (currentChatCallback) {
    unsubscribeMessage('chat_msg', currentChatCallback);
  }
  if (currentSystemCallback) {
    unsubscribeMessage('success', currentSystemCallback);
    unsubscribeMessage('error', currentSystemCallback);
  }
  closeWebSocket();
});
//监测是否登录
const isLogin =async ()=>{
  const result = await verifyIsLogin();
  if(!result.code){
    Message.error('请先登录！');
    await router.push('/login');
  }
}
onMounted(()=>{
  isLogin();
})
</script>

<template>
  <div style="padding: 20px;">
    <!-- 1. 用户ID和接收者ID -->
    <div style="margin-bottom: 10px;">
      <label>你的用户ID：</label>
      <input
          v-model="userId"
          type="text"
          placeholder="输入你的ID（比如1001）"
          style="padding: 5px; width: 150px; margin-right: 20px;"
          :disabled="isConnected"
      >
      <label>接收者ID：</label>
      <input
          v-model="toUserId"
          type="text"
          placeholder="输入对方ID（比如1002）"
          style="padding: 5px; width: 150px;"
      >
    </div>

    <!-- 2. 连接/断开按钮 -->
    <button
        @click="handleConnect"
        style="margin-right: 10px; padding: 6px 15px; background: #42b983; color: white; border: none; border-radius: 4px;"
        :disabled="isConnected"
    >
      连接WebSocket
    </button>
    <button
        @click="handleDisconnect"
        style="padding: 6px 15px; background: #f56c6c; color: white; border: none; border-radius: 4px;"
        :disabled="!isConnected"
    >
      断开连接
    </button>

    <!-- 3. 消息输入和发送 -->
    <div style="margin: 20px 0;">
      <input
          v-model="sendContent"
          type="text"
          placeholder="输入要发送的消息"
          :disabled="!isConnected"
          :style="{
            padding: '5px',
            width: '300px',
            marginRight: '10px',
            cursor: !isConnected ? 'not-allowed' : 'text'
          }"
      />
      <button
          @click="sendMessageToSpring"
          :style="{
            padding: '6px 15px',
            background: '#2c3e50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !isConnected || !sendContent || !toUserId ? 'not-allowed' : 'pointer'
          }"
          :disabled="!isConnected || !sendContent || !toUserId"
      >
      发送消息
      </button>
    </div>

    <!-- 4. 消息记录展示（新增系统消息灰色样式） -->
    <div style="margin-top: 20px; border: 1px solid #eee; padding: 10px; height: 300px; overflow-y: auto;">
      <h4>消息记录：</h4>
      <div v-for="(item, index) in messageList" :key="index" style="margin: 5px 0;">
        <span
            :style="item.type === 'send' ? 'color: blue;' :
                    item.type === 'receive' ? 'color: green;' :
                    'color: #999;'"> <!-- 系统消息灰色 -->
          {{ item.time }} - {{ item.content }}
        </span>
      </div>
    </div>
  </div>
</template>