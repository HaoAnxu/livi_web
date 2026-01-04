<script setup>
import { CozeAPI } from '@coze/api';
import { ref } from 'vue';

// 1. 核心状态：用户输入、对话列表、加载状态、存储的code
const message = ref('');
const talkList = ref([]);
const isLoading = ref(false); // 正在回复的加载状态
const lastCode = ref(''); // 存储最新返回的code

// 2. 初始化 Coze 客户端
const apiClient = new CozeAPI({
  token: 'pat_d1wRbW7gj6hiJUiFlU1Wv3b4nRMRBszYnaQQd8VWJXAtQj2pzXea8DsQPEjaVjuM',
  baseURL: 'https://api.coze.cn',
  allowPersonalAccessTokenInBrowser: true// 允许在浏览器中使用个人访问令牌
});

// 3. 发送消息方法
const sendMessage = async () => {
  const inputValue = message.value.trim();
  if (!inputValue) return;
  
  // 添加用户消息到列表
  talkList.value.push({ 
    role: 'user', 
    content: inputValue,
    timestamp: new Date().toLocaleTimeString()
  });
  
  // 清空输入框并设置加载状态
  message.value = '';
  isLoading.value = true;
  
  try {
    // 调用 Coze 工作流
    const res = await apiClient.workflows.runs.stream({
      workflow_id: '7589829291808030729',
      parameters: { message: inputValue }
    });

    // 拼接机器人回复
    let botReply = '';
    let responseCode = '';
    
    for await (const item of res) {
      // 解析返回的数据格式
      const contentData = item.data || item;
      
      // 如果是JSON字符串，先解析
      let parsedContent = contentData.content || '';
      if (typeof parsedContent === 'string' && parsedContent.startsWith('{')) {
        try {
          const jsonContent = JSON.parse(parsedContent);
          parsedContent = jsonContent.reply || jsonContent.data;
          // 提取code字段
          if (jsonContent.code) {
            responseCode = jsonContent.code;
            lastCode.value = jsonContent.code; // 存储code
          }
          // 如果data还是JSON字符串，继续解析
          if (typeof parsedContent === 'string' && parsedContent.startsWith('{')) {
            const deepJson = JSON.parse(parsedContent);
            parsedContent = deepJson.reply || deepJson.data || '';
            if (deepJson.code) {
              responseCode = deepJson.code;
              lastCode.value = deepJson.code;
            }
          }
        } catch (e) {
          console.warn('JSON解析失败:', e);
        }
      }
      
      botReply += parsedContent;
    }

    // 添加机器人回复到列表
    talkList.value.push({ 
      role: 'assistant', 
      content: botReply || '暂无回复',
      code: responseCode,
      timestamp: new Date().toLocaleTimeString()
    });
    
  } catch (err) {
    console.error('请求失败:', err);
    // 添加错误提示
    talkList.value.push({ 
      role: 'assistant', 
      content: '请求失败，请重试',
      timestamp: new Date().toLocaleTimeString(),
      isError: true
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

// 4. 滚动到底部的辅助方法
const scrollToBottom = () => {
  const container = document.querySelector('.chat-container');
  if (container) {
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 100);
  }
};

// 5. 回车发送消息
const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
};
</script>

<template>
  <!-- 对话展示区 -->
  <div class="chat-wrapper">
    <!-- 头部信息 -->
    <div class="chat-header">
      <h3>智能客服助手</h3>
      <div class="code-info" v-if="lastCode">
        最新Code: <span>{{ lastCode }}</span>
      </div>
    </div>
    
    <!-- 对话列表 -->
    <div class="chat-container">
      <!-- 空状态 -->
      <div class="empty-state" v-if="talkList.length === 0 && !isLoading">
        <p>您好！有什么可以帮助您的吗？</p>
      </div>
      
      <!-- 对话消息 -->
      <div 
        v-for="(item, idx) in talkList" 
        :key="idx" 
        class="message-item"
        :class="[item.role, { 'error': item.isError }]"
      >
        <!-- 头像 -->
        <div class="avatar">
          <span v-if="item.role === 'user'">👤</span>
          <span v-else>🤖</span>
        </div>
        
        <!-- 消息内容 -->
        <div class="message-content">
          <div class="content-text">{{ item.content }}</div>
          <div class="message-time">{{ item.timestamp }}</div>
          <!-- 显示code（仅助手消息且有code时） -->
          <div class="message-code" v-if="item.role === 'assistant' && item.code">
            Code: {{ item.code }}
          </div>
        </div>
      </div>
      
      <!-- 加载中的状态 -->
      <div class="loading-state" v-if="isLoading">
        <div class="avatar">🤖</div>
        <div class="message-content">
          <div class="typing-animation">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入框区域 -->
    <div class="input-area">
      <input
        v-model="message"
        placeholder="请输入您的问题，按回车发送..."
        class="message-input"
        @keypress="handleKeyPress"
        :disabled="isLoading"
      >
      <button 
        @click="sendMessage" 
        class="send-btn"
        :disabled="!message.trim() || isLoading"
      >
        {{ isLoading ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 全局样式重置 */
.chat-wrapper {
  width: 700px;
  margin: 30px auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 头部样式 */
.chat-header {
  background: #409eff;
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.code-info {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
}

.code-info span {
  font-weight: 600;
}

/* 聊天容器 */
.chat-container {
  height: 500px;
  overflow-y: auto;
  background: #f9fafc;
  padding: 20px;
  box-sizing: border-box;
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
  font-size: 16px;
}

/* 消息项通用样式 */
.message-item {
  display: flex;
  margin-bottom: 16px;
  max-width: 85%;
  animation: fadeIn 0.3s ease;
}

/* 用户消息（右侧） */
.message-item.user {
  flex-direction: row-reverse;
  margin-left: auto;
}

/* 头像样式 */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e8f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message-item.user .avatar {
  background: #409eff;
  color: white;
}

/* 消息内容容器 */
.message-content {
  margin: 0 12px;
}

/* 消息文本 */
.content-text {
  padding: 10px 16px;
  border-radius: 18px;
  line-height: 1.5;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 助手消息样式 */
.message-item.assistant .content-text {
  background: white;
  color: #303133;
  border: 1px solid #ebeef5;
}

/* 用户消息样式 */
.message-item.user .content-text {
  background: #409eff;
  color: white;
}

/* 错误消息样式 */
.message-item.error .content-text {
  background: #fef0f0;
  color: #f56c6c;
  border-color: #fbc4c4;
}

/* 消息时间 */
.message-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
  text-align: right;
}

.message-item.user .message-time {
  text-align: left;
}

/* Code信息 */
.message-code {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

/* 打字动画 */
.typing-animation {
  display: flex;
  gap: 4px;
  padding: 10px 16px;
  background: white;
  border-radius: 18px;
  border: 1px solid #ebeef5;
}

.typing-animation span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-animation span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-animation span:nth-child(2) {
  animation-delay: -0.16s;
}

/* 输入区域 */
.input-area {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #ebeef5;
}

/* 输入框 */
.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.message-input:disabled {
  background: #f5f7fa;
  cursor: not-allowed;
}

/* 发送按钮 */
.send-btn {
  padding: 12px 24px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #66b1ff;
}

.send-btn:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 滚动条样式优化 */
.chat-container::-webkit-scrollbar {
  width: 6px;
}

.chat-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}
</style>