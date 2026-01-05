<script setup>
import { onMounted, ref } from 'vue'
import { queryGoodsApi } from "@/api/shop.js";
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";
import { useRouter } from 'vue-router';

const router = useRouter();
const form = ref({
  goodsName: '',
  goodsType: '',
  sortRule: '',
  page: 1,
  pageSize: 24
})

const goods_type = ref([
  '基础家具类',
  '厨房电器类',
  '生活电器类',
  '影音娱乐类',
  '照明灯具类',
  '安防监控类',
  '智能控制类',
  '厨卫五金类',
  '其它'])
const goodsList = ref([])

const total = ref(0)

const totalPages = ref(0)

const sort_rule_options = ref([
  { name: '卖的多的！', value: 'by_sales' },
  { name: '好评多的！', value: 'by_rating' }
])

const search = async () => {
  MyLoading.value = true;
  try {
    const result = await queryGoodsApi(form.value)
    if (result.code) {
      total.value = result.data.total || 0;
      totalPages.value = Math.ceil(total.value / form.value.pageSize);

      if (result.data.rows.length === 0) {
        const tip = form.value.page === 1 ? '暂无商品信息' : '暂无更多商品信息';
        MyMessage.warn(tip);
        MyLoading.value = false;
        return
      }
      goodsList.value = result.data.rows;
      MyLoading.value = false;
    } else {
      MyMessage.error(result.msg);
      MyLoading.value = false;
    }
  } catch (error) {
    MyMessage.error(error.message || '请求失败，请重试');
    MyLoading.value = false;
  }
}

const next = () => {
  if (form.value.page >= totalPages.value) {
    MyMessage.warn('已到最后一页');
    return
  }
  form.value.page++
  search()
}

const last = () => {
  if (form.value.page === 1) {
    MyMessage.warn('已到第一页');
    return
  }
  form.value.page--;
  search()
}

const reset = () => {
  form.value = {
    goodsName: '',
    goodsType: '',
    sortRule: '',
    page: 1,
    pageSize: 24
  }
  total.value = 0;
  totalPages.value = 0;
  search()
}

const viewDetail = (goodsId) => {
  router.push({
    path: 'goodsDetail',
    query: {
      goodsId: goodsId
    }
  })
}

onMounted(() => {
  search()
})
</script>

<template>
  <el-container class="page-container">
    <el-header class="search-header">
      <div class="search-scroll-container">
        <div class="search-form-wrapper">
          <el-form :inline="true" :model="form" label-width="80px" class="search-form">
            <el-form-item label="搜索:" class="form-item">
              <el-input v-model="form.goodsName" placeholder="大家都在搜:智能台灯" class="search-input" @keyup.enter="search" />
            </el-form-item>

            <el-form-item label="类别:" class="form-item">
              <el-select v-model="form.goodsType" placeholder="请选择商品类别" class="select-item" @change="search">
                <el-option v-for="type in goods_type" :key="type" :label="type" :value="type" />
              </el-select>
            </el-form-item>

            <el-form-item label="排序:" class="form-item">
              <el-select v-model="form.sortRule" placeholder="请选择排序规则" class="select-item" @change="search">
                <el-option v-for="rule in sort_rule_options" :key="rule.value" :label="rule.name" :value="rule.value" />
              </el-select>
            </el-form-item>

            <el-form-item class="form-item btn-group">
              <el-button type="info" @click="reset" size="small" class="reset-btn">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-header>

    <el-main class="main-content">
      <div class="card-container">
        <div class="product-card" v-for="goods in goodsList" :key="goods.id">
          <div class="product-img-wrapper">
            <img :src="goods.goodsThumbnail" alt="商品图片" class="product-img">
          </div>
          <div class="product-info">
            <h3 class="product-title">
              <span class="brand-tag">品牌</span>
              {{ goods.goodsName }}
            </h3>
            <div class="product-price">
              <span class="price">¥{{ goods.goodsPrice }}</span>
              <span class="original-price">¥{{ goods.goodsOriginalPrice }}</span>
            </div>
            <div class="product-sales">已售 {{ goods.goodsSales }}</div>
            <button class="btn" @click="viewDetail(goods.goodsId)">
              <i class="animation"></i>查看详情<i class="animation"></i>
            </button>
          </div>
        </div>
      </div>
    </el-main>

    <el-footer class="page-footer">
      <div class="page-nav">
        <button type="button" class="credit-button" @click="last">
          <span class="credit-button__fold"></span>
          <div class="credit-button__points-wrapper">
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
          </div>
          <span class="credit-button__inner">
            <svg class="credit-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5">
              <polyline points="13.18 1.37 13.18 9.64 21.45 9.64 10.82 22.63 10.82 14.36 2.55 14.36 13.18 1.37">
              </polyline>
            </svg>
            上一页
            <span class="goods-count">LiVi</span>
          </span>
        </button>

        <button type="button" class="credit-button" @click="next">
          <span class="credit-button__fold"></span>
          <div class="credit-button__points-wrapper">
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
            <i class="credit-button__point"></i>
          </div>
          <span class="credit-button__inner">
            <svg class="credit-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5">
              <polyline points="13.18 1.37 13.18 9.64 21.45 9.64 10.82 22.63 10.82 14.36 2.55 14.36 13.18 1.37">
              </polyline>
            </svg>
            下一页
            <span class="goods-count">LiVi</span>
          </span>
        </button>
      </div>
    </el-footer>
  </el-container>
</template>

<style scoped>
@import url('@/assets/CSS/Shop/header.css');
@import url('@/assets/CSS/Shop/plant.css');

.page-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.card-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
  padding: 20px;
  box-sizing: border-box;
}

.product-card {
  width: 100%;
  flex-shrink: 0;
  min-width: 0;
  min-height: 280px;
  padding: 8px;
  background: rgba(237, 242, 255, 0.801);
  border: 1px solid rgba(200, 200, 200, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.product-img-wrapper {
  width: 100%;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.product-info {
  padding: 0 2px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand-tag {
  display: inline-block;
  padding: 1px 4px;
  margin-right: 4px;
  background-color: #FFD700;
  color: #000;
  border: 1px solid #000;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  line-height: 1;
  vertical-align: middle;
}

.card-tag {
  position: relative;
  left: 30px;
  font-size: 15px;
  font-weight: bold;
  line-height: 1;
  color: rgba(0, 0, 0, 0.099);
}

.product-title {
  font-size: 12px;
  color: #333;
  line-height: 1.3;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: auto;
  margin-bottom: 4px;
}

.product-price {
  display: flex;
  align-items: center;
  margin-bottom: 3px;
}

.price {
  font-size: 14px;
  font-weight: bold;
  color: #e64340;
  margin-right: 4px;
}

.original-price {
  font-size: 10px;
  color: #999;
  text-decoration: line-through;
}

.product-sales {
  font-size: 10px;
  color: #999;
  margin-bottom: 8px;
}

.btn {
  outline: 0;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  background: #5B9BD5;
  width: 100%;
  border: 0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .1);
  box-sizing: border-box;
  padding: 8px 10px;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  overflow: hidden;
  cursor: pointer;
}

.btn:hover {
  opacity: .95;
  background: #4A89DC;
}

.btn .animation {
  border-radius: 100%;
  animation: ripple 0.6s linear infinite;
}

.page-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  background-color: #f9f9f9;
  position: relative;
  margin-top: 20px;
}

.page-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  max-width: 500px;
}

.credit-button {
  margin: 20px;
}

@keyframes ripple {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.1), 0 0 0 10px rgba(255, 255, 255, 0.1), 0 0 0 20px rgba(255, 255, 255, 0.1), 0 0 0 30px rgba(255, 255, 255, 0.1);
  }

  100% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.1), 0 0 0 20px rgba(255, 255, 255, 0.1), 0 0 0 30px rgba(255, 255, 255, 0.1), 0 0 0 40px rgba(255, 255, 255, 0);
  }
}

@media (max-width: 768px) {
  .card-tag {
    position: relative;
    left: 10px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.193);
  }

  .card-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .product-img-wrapper {
    height: 100px;
  }

  .product-card {
    min-height: 240px;
  }

  .product-title {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
  }
}
</style>