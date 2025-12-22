<script setup>

</script>

<template>
  <!-- 整体容器：左侧栏+右侧内容区 -->
  <div class="update-card">
    <!-- 左侧蓝色标题栏 -->
    <div class="left-bar">
      <div class="logo">LiVi</div>
      <div class="title">近日更新</div>
      <!-- 装饰线条 -->
      <div class="line" v-for="i in 3" :key="i"></div>
    </div>
    <!-- 右侧内容区（丰富版） -->
    <div class="content-area">
      <!-- 更新列表标题 -->
      <div class="content-title">LiVi日常更新</div>
      <!-- 更新内容列表 -->
      <div class="update-list">
        <div class="update-item">
          <span class="tag optimize">优化</span>
          <span class="text">教训了搜索算法，让它更听话</span>
          <span class="time">12-20</span>
        </div>
        <div class="update-item">
          <span class="tag new">新增</span>
          <span class="text">让智能烤箱安了个家，现在支持烤箱智能操控了</span>
          <span class="time">12-18</span>
        </div>
        <div class="update-item">
          <span class="tag fix">修复</span>
          <span class="text">修复了一些小问题，让用户体验更顺畅</span>
          <span class="time">12-15</span>
        </div>
        <div class="update-item">
          <span class="tag optimize">优化</span>
          <span class="text">请几个Bug放了个假，其实是开除了~</span>
          <span class="time">12-12</span>
        </div>
      </div>
      <!-- 查看更多按钮 -->
      <div class="more-btn" @click="handleMore">查看全部更新记录 →</div>
    </div>
  </div>
</template>

<script setup>
// 查看更多逻辑（空实现，可自行扩展）
const handleMore = () => {
  // 可跳转至更新日志页面/弹出详情弹窗
  console.log('查看全部更新记录');
};
</script>

<style scoped>
/* 整体卡片容器：边框+圆角+阴影 */
.update-card {
  width: 500px; /* 加宽适配丰富内容 */
  height: 300px; /* 加高适配内容 */
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  overflow: hidden; /* 防止子元素超出圆角 */
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* 轻微阴影提升质感 */
}

/* 左侧蓝色标题栏 */
.left-bar {
  width: 90px;
  background: linear-gradient(180deg, #0066cc 0%, #0088ff 100%); /* 渐变蓝更有层次 */
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

/* Logo样式 */
.logo {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

/* 标题样式 */
.title {
  font-size: 13px;
  margin-bottom: 12px;
  opacity: 0.9;
}

/* 装饰线条（灰色细横线） */
.line {
  width: 55px;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.4);
  margin: 4px 0;
}

/* 右侧内容区 */
.content-area {
  flex: 1; /* 占满剩余宽度 */
  padding: 15px 20px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

/* 内容区标题 */
.content-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

/* 更新列表容器 */
.update-list {
  flex: 1; /* 占满剩余高度 */
  display: flex;
  flex-direction: column;
  gap: 8px; /* 列表项间距 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 单个更新项 */
.update-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  justify-content: space-between;
}

/* 标签样式 */
.tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: #fff;
  margin-right: 8px;
  min-width: 30px;
  text-align: center;
}
.tag.new {
  background-color: #00cc66; /* 新增-绿色 */
}
.tag.optimize {
  background-color: #ff9900; /* 优化-橙色 */
}
.tag.fix {
  background-color: #ff6666; /* 修复-红色 */
}

/* 更新文本 */
.text {
  flex: 1; /* 占满中间宽度 */
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 时间戳 */
.time {
  color: #999;
  font-size: 11px;
}

/* 查看更多按钮 */
.more-btn {
  font-size: 12px;
  color: #0088ff;
  cursor: pointer;
  margin-top: 8px;
  text-align: right;
  transition: color 0.2s;
}
.more-btn:hover {
  color: #0066cc;
}
</style>
