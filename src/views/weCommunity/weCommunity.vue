<script setup>
import { getCommunityListApi } from '@/api/wecommunity';
import { onMounted, ref, h } from "vue";
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";
import { joinCommunityApi, queryUserJoinCommunityApi, getCommunityDetailApi } from '@/api/wecommunity';
import { useRouter } from "vue-router";
import { ElNotification } from 'element-plus'

const router = useRouter();
const communityInfoList = ref([]);
const communityDetail = ref({});
const getCommunityInfoList = async () => {
  MyLoading.value = true;
  try {
    const result = await getCommunityListApi();
    if (result.code) {
      communityInfoList.value = result.data;
      MyLoading.value = false;
    } else {
      MyMessage.error(result.msg);
      MyLoading.value = false;
    }
  } catch (e) {
    MyLoading.value = false;
  }
}
// 加入社区
const handlejoinCommunity = async (communityId) => {
  const loginUser = JSON.parse(sessionStorage.getItem('loginUser'));
  if (!loginUser) {
    MyMessage.error('请先登录');
    return;
  }
  // 检查用户是否已经加入社区
  const isJoin = await queryUserJoinCommunityApi(communityId, loginUser.userId);
  if (isJoin.data === true) {
    await router.push({
      name: 'chatRoom',
      query: { communityId: communityId }
    });
    return;
  }
  const result = await joinCommunityApi(communityId, loginUser.userId);
  if (result.code) {
    MyMessage.success('加入社区成功,欢迎~');
    await router.push({
      name: 'chatRoom',
      query: { communityId: communityId }
    });
  } else {
    MyMessage.error(result.msg);
  }
}
//查看详情
const handleShowDetail = async (communityId) => {
  // 获取社区详情
  const result = await getCommunityDetailApi(communityId);
  if (result.code) {
    communityDetail.value = result.data;
    ElNotification({
      title: communityDetail.value.communityName,
      message: h('i', { style: 'color: #ff6700' }, communityDetail.value.communityDesc || '这是一个有趣的社区，快来加入吧～'),
    })
  } else {
    MyMessage.error(result.msg);
  }

}

//淡入
const showSplash = ref(sessionStorage.getItem('animation_WC') === 'true')
//淡出
const splashClass = ref('')

onMounted(() => {
  if (showSplash) {
    getCommunityInfoList();
    setTimeout(() => {
      splashClass.value = 'hidden'
      setTimeout(() => {
        showSplash.value = false
        sessionStorage.setItem('animation_WC', 'false');
      }, 800)
    }, 2700)
  }else{
    showSplash.value = false;
    getCommunityInfoList();
  }
})
</script>

<template>
  <!-- 开场动画 -->
  <div v-if="showSplash" :class="['splash-screen', splashClass]">
    <div class="splash-content">
      <div class="logo-container">
        <h1 class="logo-main">LiVi</h1>
        <p class="logo-tagline">WeCommunity · Easy Talk Easy Do</p>
      </div>
      <div class="logo-decoration">
        <span class="decor-text first-text">LiVi社群</span>
        <span class="decor-text second-text">简单说~简单做</span>
      </div>
    </div>
    <div class="decor-line top-line"></div>
    <div class="decor-line bottom-line"></div>
    <div class="grid-bg"></div>
  </div>

  <!-- 顶部导航栏 -->
  <div class="page-header">
    <div class="header-content">
      <h2 class="page-title">WeCommunity社群广场</h2>
      <div class="header-actions">
        <!-- 返回主页按钮 -->
        <button class="btn primary-btn" @click="router.push('/')">返回主页</button>
        <button class="btn secondary-btn" @click="getCommunityInfoList">刷新列表</button>
      </div>
    </div>
  </div>

  <!-- 页面说明区域 -->
  <div class="page-intro">
    <p class="intro-text">平台提供商家->客户的优质沟通平台，简单说~简单做</p>
  </div>

  <!--  ElNotification-通知  -->
  <div class="flex flex-wrap gap-1"></div>

  <!-- 社区卡片网格 -->
  <div class="app-container">
    <div class="community-container">
      <div class="card-grid">
        <div class="parent" v-for="(item, index) in communityInfoList" :key="item.id">
          <div class="card" :style="item.communityImage
            ? {
              backgroundImage: `url('${item.communityImage}')`,
              backgroundSize: '100% 100%',//破坏比例，强制铺满容器
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }
            : {}">
            <div class="content-box">
              <span class="card-title">{{ item.communityName }}</span>
              <!-- 按钮区域：加入/退出 -->
              <div class="btn-group">
                <button class="btn join-btn" @click="handlejoinCommunity(item.communityId)">
                  进入社区
                </button>
                <button class="btn more-btn" @click="handleShowDetail(item.communityId)">
                  显示详情
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
@import url('@/assets/CSS/WeCommunity/animation.css');

/* 页面顶部导航栏 */
.page-header {
  width: 100%;
  height: 60px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1600px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 防止导航栏内容换行导致溢出 */
  white-space: nowrap;
  overflow: hidden;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #334155;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 页面说明区域 */
.page-intro {
  max-width: 1600px;
  margin: 0 auto;
  padding: 15px 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #ffffff;
}

.intro-text {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.primary-btn {
  background-color: #38bdf8;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 40px;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(56, 189, 248, 0.15);
}

.primary-btn:hover {
  background-color: #0ea5e9;
  box-shadow: 0 4px 8px rgba(14, 165, 233, 0.25);
  transform: translateY(-1px);
}

.secondary-btn {
  background-color: #ffffff;
  color: #334155;
  border: 1px solid #e2e8f0;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 40px;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.secondary-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* 基础容器：全屏适配，隐藏横向滚动 */
.app-container {
  width: 100%;
  min-height: calc(100vh - 140px);
  /* 适配顶部导航+说明区域高度 */
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background-color: #f8fafc;
}

/* 社区容器：适配页脚高度，基础内边距 */
.community-container {
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: 20px;
}

/* 卡片网格：PC端5列，居中适配 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* 卡片父容器：3D透视基础布局 */
.parent {
  width: 100%;
  padding: 12px;
  perspective: 1000px;
  box-sizing: border-box;
}

/* 卡片核心样式：1:1比例，银灰科技风，3D交互 */
.card {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
  /* 固定1:1比例，让背景图有明确的铺满容器 */
  display: block;
  /* 重置为block，避免flex干扰 */
  border: 3px solid #e0e6ed;
  transform-style: preserve-3d;
  background-color: #f0f4f8;
  box-shadow: rgba(100, 116, 139, 0.15) 0px 20px 20px -8px;
  transition: all 0.5s ease-in-out;
  box-sizing: border-box;
  border-radius: 8px;
  overflow: hidden;
  /* 隐藏超出卡片的图片部分（如果有） */
}

/* 无背景图时显示银灰科技纹理 */
.card:not([style*="backgroundImage"]) {
  background: linear-gradient(135deg, #0000 18.75%, #e8ebf0 0 31.25%, #0000 0),
    repeating-linear-gradient(45deg, #e8ebf0 -6.25% 6.25%, #f5f7fa 0 18.75%);
  background-size: 50px 50px;
  background-position: 0 0, 0 0;
  background-color: #f0f4f8;
}

/* 卡片hover：3D旋转+阴影增强 */
.card:hover {
  background-position: var(--card-bg-position, -80px 80px, -80px 80px);
  transform: rotate3d(0.5, 1, 0, 15deg);
  box-shadow: rgba(100, 116, 139, 0.25) 0px 25px 25px -10px;
}

/* 卡片内容区：透明背景，3D布局，内容分布 */
.content-box {
  position: absolute;
  inset: 0;
  background: transparent;
  padding: 35px 12px 15px;
  transform-style: preserve-3d;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 卡片标题 */
.card-title {
  display: inline-block;
  color: #353535;
  font-size: 24px;
  font-weight: 900;
  transition: all 0.5s ease-in-out;
  transform: translate3d(0, 0, 50px);
  margin-bottom: 6px;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 按钮组布局 */
.btn-group {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

/* 按钮基础样式：3D层级，交互反馈 */
.btn {
  flex: 1;
  padding: 5px 0;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translate3d(0, 0, 20px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
  pointer-events: auto;
}

/* 加入按钮：更高3D层级 */
.join-btn {
  background: #fff;
  color: #64748b;
  transform: translate3d(0, 0, 30px);
}

/* 更多按钮：浅白边框增强质感 */
.more-btn {
  background: #fff;
  color: #64748b;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 按钮hover效果 */
.btn:hover {
  opacity: 0.9;
  transform: translate3d(0, 0, 30px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 社区元信息：右上角悬浮，3D层级 */
.community-meta {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: #fff;
  border: 1px solid #cbd5e1;
  padding: 5px;
  transform: translate3d(0, 0, 80px);
  box-shadow: rgba(100, 116, 139, 0.2) 0px 15px 10px -8px;
  box-sizing: border-box;
  border-radius: 4px;
}

/* 元信息标签/数值：银灰系配色 */
.meta-label {
  display: block;
  text-align: center;
  color: #64748b;
  font-size: 6px;
  font-weight: 700;
}

.meta-value {
  display: block;
  text-align: center;
  font-size: 14px;
  font-weight: 900;
  color: #475569;
  line-height: 1.2;
}

/* 响应式：平板（768-1199px）2列布局 */
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
    padding: 15px;
  }

  .card:not([style*="backgroundImage"]) {
    background-size: 60px 60px;
  }

  .card-title {
    font-size: 17px;
  }

  .btn {
    font-size: 11px;
    padding: 6px 0;
  }

  .community-meta {
    width: 40px;
    height: 40px;
  }

  .meta-label {
    font-size: 7px;
  }

  .meta-value {
    font-size: 16px;
  }

  /* 响应式适配顶部导航 */
  .page-title {
    font-size: 1rem;
  }

  .primary-btn,
  .secondary-btn {
    padding: 7px 16px;
    font-size: 0.9rem;
    height: 36px;
    min-width: 80px;
  }
}

/* 响应式：手机（≤767px）2列布局 */
@media (max-width: 767px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    max-width: 100%;
  }

  .community-container {
    padding: 10px;
    min-height: calc(100vh - 120px);
  }

  .parent {
    padding: 8px;
  }

  .card:not([style*="backgroundImage"]) {
    background-size: 50px 50px;
  }

  .content-box {
    padding: 30px 12px 15px;
  }

  .card-title {
    font-size: 16px;
  }

  .btn {
    padding: 5px 0;
  }

  .card {
    aspect-ratio: 1/1;
  }

  /* 响应式适配顶部导航 */
  .header-content {
    padding: 0 10px;
  }

  .page-title {
    font-size: 0.8rem;
  }

  .primary-btn,
  .secondary-btn {
    padding: 6px 12px;
    font-size: 0.85rem;
    height: 32px;
    width: 50px;
    gap: 8px;
  }

  .intro-text {
    font-size: 0.8rem;
  }
}
</style>