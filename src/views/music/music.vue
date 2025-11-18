<script setup>
import { ref, onUnmounted } from 'vue';

//变量
const userId = ref('1'); // 默认用户ID（可修改）
const toUserId = ref('1002');
const sendMessage = ref(''); // 要发送的消息
const messageList = ref([]); // 消息记录
const isConnected = ref(false); // 是否已连接
let webSocket = null; // WebSocket实例（全局变量，方便操作）
//断线重连相关变量
let reconnectTimer = null; //断线重连定时器
let heartbeatTimer = null; //心跳定时器
const reconnectInterval = 5000; //断线重连间隔（5秒）
const heartbeatInterval = 5000; //心跳间隔（5秒）

//连接WebSocket
const connectWebSocket = () => {
  if (!userId.value) {
    alert('请输入用户ID！');
    return;
  }

  const wsUrl = `/ws/chat/${userId.value}`;

  // 创建WebSocket实例（浏览器原生API，不用装插件）
  webSocket = new WebSocket(wsUrl);

  //连接成功回调（和后端@OnOpen对应）
  webSocket.onopen = () => {
    console.log('WebSocket连接成功！');
    isConnected.value = true;
    // 添加连接成功的消息记录
    messageList.value.push({
      type: 'receive',
      time: new Date().toLocaleString(),
      content: '✅ 连接成功！'
    });
    //连接成功后，启动心跳检测
    startHeartbeat();
    // 清除重连定时器
    if(reconnectTimer){
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }
  };
  //收到后端消息回调（和后端@OnMessage对应）
  webSocket.onmessage = (event) => {
    console.log('收到后端消息：', event.data);
    if(event.data === 'pong'){
      return;
    }
    // 添加收到的消息记录
    messageList.value.push({
      type: 'receive',
      time: new Date().toLocaleString(),
      content: `后端回复：${event.data}`
    });
  };

  //连接断开回调（和后端@OnClose对应）
  webSocket.onclose = () => {
    console.log('WebSocket连接断开！');
    isConnected.value = false;
    messageList.value.push({
      type: 'receive',
      time: new Date().toLocaleString(),
      content: '❌ 连接已断开！正在自动尝试重连...'
    });
    //停止心跳定时器
    stopHeartbeat();
    //启动断线重连
    startReconnect();
  };

  //连接出错回调（和后端@OnError对应）
  webSocket.onerror = (error) => {
    console.error('WebSocket连接出错：', error);
    isConnected.value = false;
    messageList.value.push({
      type: 'receive',
      time: new Date().toLocaleString(),
      content: `❌ 连接出错：${error.message},正在自动尝试重连...`
    });
    stopHeartbeat();
    startReconnect();
  };
};

//发送消息给后端
const sendMessageToBackend = () => {
  if(!sendMessage.value || !toUserId.value) {
    alert('请输入消息内容和接收者ID！');
    return;
  }
  //构造JSON消息
  const jsonMessage = {
    fromUserId: userId.value,
    toUserId: toUserId.value,
    content: sendMessage.value
  }
  //把JSON消息转换为字符串并发送
  webSocket.send(JSON.stringify(jsonMessage));
  //添加到消息记录
  messageList.value.push({
    type: 'send',
    time: new Date().toLocaleString(),
    content: `我发给用户[${toUserId.value}]：${sendMessage.value}`
  });

  //清空输入框
  sendMessage.value = '';
};
//启动断线重连
const startReconnect =()=>{
  if(reconnectTimer) return;
  reconnectTimer = setInterval(()=>{
    console.log('尝试重新连接');
    connectWebSocket();
  }, reconnectInterval);
}
//启动心跳检测
const startHeartbeat =()=>{
  if(heartbeatTimer) return;
  heartbeatTimer = setInterval(()=>{
    console.log('发送心跳包');
    webSocket.send('ping');
  }, heartbeatInterval);
}
//停止心跳检测
const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
};
//断开WebSocket连接,并停止断线重连和心跳检测
const closeWebSocket = () => {
  if (webSocket) {
    webSocket.close();
    webSocket = null;
  }
  // 清除重连和心跳定时器
  if (reconnectTimer) {
    clearInterval(reconnectTimer);
    reconnectTimer = null;
  }
  stopHeartbeat();
};
//组件卸载时，关闭WebSocket连接
onUnmounted(() => {
  closeWebSocket();
});
</script>

<template>
  <div style="padding: 20px;">
    <h3>Vue3 WebSocket 升级版（JSON + 多用户聊天）</h3>

    <!-- 1. 用户ID和接收者ID -->
    <div style="margin-bottom: 10px;">
      <label>你的用户ID：</label>
      <input
          v-model="userId"
          type="text"
          placeholder="输入你的ID（比如1001）"
          style="padding: 5px; width: 150px; margin-right: 20px;"
      >
      <label>接收者ID：</label>
      <input
          v-model="toUserId"
          type="text"
          placeholder="输入对方ID（比如1002）"
          style="padding: 5px; width: 150px;"
      >
    </div>

    <!-- 2. 连接/断开按钮（不变） -->
    <button
        @click="connectWebSocket"
        style="margin-right: 10px; padding: 6px 15px; background: #42b983; color: white; border: none; border-radius: 4px;"
        :disabled="isConnected"
    >
      连接WebSocket
    </button>
    <button
        @click="closeWebSocket"
        style="padding: 6px 15px; background: #f56c6c; color: white; border: none; border-radius: 4px;"
        :disabled="!isConnected"
    >
      断开连接
    </button>

    <!-- 3. 消息输入和发送（不变，只是发送时构造JSON） -->
    <div style="margin: 20px 0;">
      <input
          v-model="sendMessage"
          type="text"
          placeholder="输入要发送的消息"
          style="padding: 5px; width: 300px; margin-right: 10px;"
          :disabled="!isConnected"
      >
      <button
          @click="sendMessageToBackend"
          style="padding: 6px 15px; background: #2c3e50; color: white; border: none; border-radius: 4px;"
          :disabled="!isConnected || !sendMessage || !toUserId"
      >
        发送消息
      </button>
    </div>

    <!-- 4. 消息记录展示（不变） -->
    <div style="margin-top: 20px; border: 1px solid #eee; padding: 10px; height: 300px; overflow-y: auto;">
      <h4>消息记录：</h4>
      <div v-for="(item, index) in messageList" :key="index" style="margin: 5px 0;">
        <span :style="item.type === 'send' ? 'color: blue;' : 'color: green;'">
          {{ item.time }} - {{ item.content }}
        </span>
      </div>
    </div>
  </div>
</template>