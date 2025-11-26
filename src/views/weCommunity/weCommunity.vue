<script setup>
import {getCommunityList} from '@/api/wecommunity';
import {onMounted, ref} from "vue";
import MyMessage from "@/utils/MyMessage.js";
import {MyLoading} from "@/utils/MyLoading.js";
import {joinCommunity, exitCommunity} from '@/api/wecommunity';

const communityInfoList = ref([]);
const getCommunityInfoList = async () => {
  MyLoading.value = true;
  try {
    const result = await getCommunityList();
    if (result.code) {
      communityInfoList.value = result.data;
    } else {
      MyMessage.error(result.msg);
    }
    MyLoading.value = false;
  } catch (e) {
    MyMessage.error('获取社区列表失败，请稍后重试');
    MyLoading.value = false;
  }
}
// 加入社区
const handlejoinCommunity = async (communityId) => {
  const loginUser = JSON.parse(localStorage.getItem('loginUser'));
  if (!loginUser) {
    MyMessage.error('请先登录');
    return;
  }
  try {
    const result = await joinCommunity(communityId, loginUser.id);
    if (result.code) {
      MyMessage.success('加入社区成功');
      getCommunityInfoList(); // 刷新列表
    } else {
      MyMessage.error(result.msg);
    }
  } catch (error) {
    MyMessage.error('操作失败，请稍后重试');
  }
}

// 退出社区
const handleExitCommunity = async (communityId) => {
  const loginUser = JSON.parse(localStorage.getItem('loginUser'));
  if (!loginUser) {
    MyMessage.error('请先登录');
    return;
  }
  try {
    const result = await exitCommunity(communityId, loginUser.id);
    if (result.code) {
      MyMessage.success('退出社区成功');
      getCommunityInfoList(); // 刷新列表
    } else {
      MyMessage.error(result.msg);
    }
  } catch (error) {
    MyMessage.error('操作失败，请稍后重试');
  }
}

onMounted(() => {
  getCommunityInfoList();
})
</script>

<template>
  <div class="app-container">
    <div class="community-container">
      <div class="card-grid">
        <div class="parent" v-for="(item, index) in communityInfoList" :key="item.id">
          <div class="card">
            <div class="content-box">
              <span class="card-title">{{ item.communityName }}</span>
              <p class="card-content">
                {{ item.communityDesc || '这是一个有趣的社区，快来加入吧～' }}
              </p>
              <!-- 按钮区域：加入/退出 -->
              <div class="btn-group">
                <button
                    class="btn join-btn"
                    @click="handlejoinCommunity(item.id)"
                    v-if="!item.joined"
                >
                  加入社区
                </button>
                <button
                    class="btn exit-btn"
                    @click="handleExitCommunity(item.id)"
                    v-if="item.joined"
                >
                  退出社区
                </button>
                <button class="btn more-btn" @click="() => console.log('查看详情', item.id)">
                  查看详情
                </button>
              </div>
            </div>
            <!-- 社区人数元信息 -->
            <div class="community-meta">
              <span class="meta-label">人数</span>
              <span class="meta-value">{{ item.communityMembers || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 清除全局默认边距（关键：解决横向溢出根源） */
.app-container {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  overflow-x: hidden; /* 强制隐藏横向滚动条 */
  background-color: #f3f3f3;
}

/* 社区容器：撑满屏幕，底部留空（避免被页脚遮挡） */
.community-container {
  width: 100%;
  min-height: calc(100vh - 80px); /* 假设页脚高度80px，根据实际调整 */
  box-sizing: border-box;
  padding: 20px;
}

/* 卡片网格：PC端一行5列，无溢出 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 改为一行5列 */
  gap: 18px; /* 缩小间距，适配5列布局 */
  width: 100%;
  max-width: 1600px; /* 扩大最大宽度，适配5列 */
  margin: 0 auto; /* 水平居中 */
  box-sizing: border-box;
}

/* 卡片父容器：固定宽高比，PC端缩小卡片 */
.parent {
  width: 100%;
  padding: 12px; /* 缩小内边距，减小卡片整体尺寸 */
  perspective: 1000px;
  box-sizing: border-box;
}

/* 卡片：高级银灰色主体，1:1比例不变 */
.card {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 宽高比1:1不变 */
  border: 3px solid #e0e6ed; /* 边框：浅银灰，精致不突兀 */
  transform-style: preserve-3d;
  /* 银灰科技纹理：低对比度，不花哨 */
  background: linear-gradient(135deg, #0000 18.75%, #e8ebf0 0 31.25%, #0000 0),
  repeating-linear-gradient(45deg, #e8ebf0 -6.25% 6.25%, #f5f7fa 0 18.75%);
  background-size: 50px 50px; /* 缩小纹理尺寸，适配小卡片 */
  background-position: 0 0, 0 0;
  background-color: #f0f4f8; /* 卡片底色：浅银蓝灰 */
  box-shadow: rgba(100, 116, 139, 0.15) 0px 20px 20px -8px; /* 缩小阴影，适配小卡片 */
  transition: all 0.5s ease-in-out;
  box-sizing: border-box;
}

/* 卡片内容区：深银灰渐变，科技感十足 */
.content-box {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 渐变：深银灰→浅银灰，高级感 */
  background: linear-gradient(135deg, #475569 0%, #64748b 100%);
  padding: 35px 12px 15px; /* 缩小内边距，适配小卡片 */
  transform-style: preserve-3d;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.1); /* 内边框：增强层次 */
}

/* 卡片标题：PC端缩小字体 */
.card-title {
  display: inline-block;
  color: #ffffff; /* 标题白色，醒目不刺眼 */
  font-size: 24px; /* PC端缩小字体，适配小卡片 */
  font-weight: 900;
  transition: all 0.5s ease-in-out;
  transform: translate3d(0px, 0px, 50px);
  margin-bottom: 6px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 轻微阴影，增强3D感 */
}

/* 卡片描述：PC端缩小字体 */
.card-content {
  font-size: 16px; /* PC端缩小字体，适配小卡片 */
  font-weight: 500; /* 减轻字重，更简约 */
  color: #e2e8f0; /* 描述色：浅银灰，不抢焦点 */
  transition: all 0.5s ease-in-out;
  transform: translate3d(0px, 0px, 30px);
  line-height: 1.4;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制最多2行，避免内容过长拉长卡片 */
  -webkit-box-orient: vertical;
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

/* 按钮：移除蓝色，改为银灰系配色 */
.btn {
  flex: 1;
  padding: 5px 0; /* 缩小内边距，适配小卡片 */
  border: none;
  border-radius: 4px;
  font-size: 10px; /* 缩小字体 */
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translate3d(0px, 0px, 20px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.join-btn {
  background: #ffffff; /* 按钮白底 */
  color: #64748b; /* 文字：深银灰，贴合整体风格 */
}

.more-btn {
  background: rgba(255, 255, 255, 0.2); /* 半透明白底，融合背景 */
  color: #ffffff; /* 白色文字 */
  border: 1px solid rgba(255, 255, 255, 0.3); /* 浅白边框，增强质感 */
}

.btn:hover {
  opacity: 0.9;
  transform: translate3d(0px, 0px, 30px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 社区元信息：移除蓝色，改为银灰系 */
.community-meta {
  position: absolute;
  top: 12px;
  right: 12px;
  height: 36px; /* 缩小尺寸，适配小卡片 */
  width: 36px;
  background: #ffffff; /* 白底，突出信息 */
  border: 1px solid #cbd5e1; /* 银灰边框 */
  padding: 5px;
  transform: translate3d(0px, 0px, 80px);
  box-shadow: rgba(100, 116, 139, 0.2) 0px 15px 10px -8px;
  box-sizing: border-box;
  border-radius: 4px;
}

.meta-label {
  display: block;
  text-align: center;
  color: #64748b; /* 标签色：深银灰 */
  font-size: 6px; /* 缩小字体 */
  font-weight: 700;
}

.meta-value {
  display: block;
  text-align: center;
  font-size: 14px; /* 缩小字体 */
  font-weight: 900;
  color: #475569; /* 数值色：深银灰，贴合整体风格 */
  line-height: 1.2;
}

/* 卡片hover效果：增强科技感 */
.card:hover {
  background-position: -80px 80px, -80px 80px;
  transform: rotate3d(0.5, 1, 0, 15deg);
  box-shadow: rgba(100, 116, 139, 0.25) 0px 25px 25px -10px; /* hover阴影加深 */
}

.card:hover .card-title {
  transform: translate3d(0px, 0px, 60px);
  color: #f0f9ff; /* hover标题色：浅蓝白，更亮 */
}

.card:hover .card-content {
  transform: translate3d(0px, 0px, 40px);
  color: #f8fafc; /* hover描述色：更白，增强对比 */
}

/* 响应式：平板（768px-1199px）一行2列（大小不变） */
@media (max-width: 1199px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    max-width: 800px;
  }

  .community-container {
    padding: 15px;
  }

  .parent {
    padding: 15px; /* 恢复原内边距，保持响应式大小不变 */
  }

  .card {
    background-size: 60px 60px; /* 恢复原纹理尺寸 */
  }

  .card-title {
    font-size: 17px; /* 保持原响应式字体大小 */
  }

  .card-content {
    font-size: 14px; /* 保持原响应式字体大小 */
  }

  .btn {
    font-size: 11px; /* 保持原响应式字体大小 */
    padding: 6px 0;
  }

  .community-meta {
    height: 40px;
    width: 40px;
  }

  .meta-label {
    font-size: 7px;
  }

  .meta-value {
    font-size: 16px;
  }
}

/* 响应式：手机（≤767px）一行2列（大小不变） */
@media (max-width: 767px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    max-width: 100%;
  }

  .community-container {
    padding: 10px;
    min-height: calc(100vh - 60px);
  }

  .parent {
    padding: 8px; /* 保持原响应式内边距 */
  }

  .card {
    padding-top: 100%;
    background-size: 50px 50px;
  }

  .content-box {
    padding: 30px 12px 15px;
  }

  .card-title {
    font-size: 16px; /* 保持原响应式字体大小 */
  }

  .card-content {
    font-size: 14px; /* 保持原响应式字体大小 */
    -webkit-line-clamp: 1;
  }

  .btn {
    font-size: 10px; /* 保持原响应式字体大小 */
    padding: 5px 0;
  }
}

/* 修复可能的body默认边距 */
:deep(body) {
  margin: 0;
  padding: 0;
}
</style>