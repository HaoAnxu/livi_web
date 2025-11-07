<script setup>
import {onMounted, ref} from 'vue'
import {queryGoodsApi} from "@/api/shop.js";
import {ElMessage} from "element-plus";

const form = ref({
  goodsName: '',
  goodsType: '',
  sortRule:'',
  page:1,
  pageSize:10
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
  '其他',
])
const goods_list = ref([])
const sort_rule_options = ref([
  {name:'便宜优先！',value:'by_price_desc'},
  {name:'我要贵的！',value:'by_price_asc'},
  {name:'卖的多的！',value:'by_sales'},
  {name:'好评多的！',value:'by_rating'},
])

const search = async () => {
  const result = await queryGoodsApi(form.value)
  if (result.code) {
    goods_list.value = result.data.rows
  }else {
    ElMessage.error(result.msg)
  }
}
const reset = () => {
  form.value = {
    goodsName: '',
    goodsType: '',
    sortRule:''
  }
  search()
}
onMounted(() => {
  search()
})
</script>

<template>
  <el-container class="page-container">
    <!--  搜索栏目-->
    <el-header class="search-header">
      <!--pc端搜索栏-->
      <div class="search-form-pc">
        <el-form :inline="true" :model="form" label-width="80px" class="search-form-pc">
        <!-- 商品名称输入框：增加宽度适配 -->
        <el-form-item label="商品名称:" class="form-item">
          <el-input v-model="form.goodsName" placeholder="大家都在搜:小米空调" class="search-input" @keyup.enter="search"/>
        </el-form-item>
        <!-- 商品类别选择器 -->
        <el-form-item label="商品类别:" class="form-item">
          <el-select v-model="form.goodsType" placeholder="请选择商品类别" class="select-item" @change="search">
            <el-option v-for="type in goods_type" :key="type" :label="type" :value="type" />
          </el-select>
        </el-form-item>
        <!-- 排序规则选择器 -->
        <el-form-item label="排序规则:" class="form-item">
          <el-select v-model="form.sortRule" placeholder="请选择排序规则" class="select-item" @change="search">
            <el-option v-for="rule in sort_rule_options" :key="rule.value" :label="rule.name" :value="rule.value" />
          </el-select>
        </el-form-item>
          <el-form-item class="form-item btn-group">
            <el-button type="info" @click="reset" size="small" class="reset-btn">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 移动端搜索栏（替换原有 search-form-mobile 区块） -->
      <div class="search-form-mobile">
        <el-form :model="form" label-width="70px">
          <div class="search-row-first">
            <el-form-item label="">
              <el-input
                  v-model="form.goodsName"
                  placeholder="搜索商品"
                  class="search-input"
                  @keyup.enter="search"
              />
            </el-form-item>
          </div>
          <!-- 第二行：商品类别 + 排序规则 并列 -->
          <div class="search-row-second">
            <el-form-item label="类别:">
              <el-select
                  v-model="form.goodsType"
                  placeholder="全部"
                  class="select-item"
                  @change="search"
              >
                <el-option v-for="type in goods_type" :key="type" :label="type" :value="type" />
              </el-select>
            </el-form-item>
            <el-form-item label="排序:">
              <el-select
                  v-model="form.sortRule"
                  placeholder="默认"
                  class="select-item"
                  @change="search"
              >
                <el-option v-for="rule in sort_rule_options" :key="rule.value" :label="rule.name" :value="rule.value" />
              </el-select>
            </el-form-item>
          </div>
          <!-- 第三行：重置按钮居中 -->
          <el-form-item class="btn-group">
            <el-button type="info" @click="reset" size="small" class="reset-btn">重置</el-button>
            <el-button type="primary" @click="search" size="small" class="search-btn">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-header>
    <el-main class="main-content">{{goods_list}}</el-main>
    <el-footer class="page-footer">yes</el-footer>
  </el-container>
</template>

<style scoped>
/* 页面整体容器 */
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.search-header {
  border-bottom: 1px solid #ebeef5;
}
.search-form-pc{
  display: flex;
  justify-content: center;
  margin-top: 5px;
}
/* 新增：移动端搜索栏整体样式 */
.search-form-mobile {
  display: none;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
}

/* 新增：移动端表单容器 - 按需求分行排列 */
.search-form-mobile .el-form {
  display: flex;
  flex-direction: column;
  gap: 12px; /* 行与行之间间距 */
  width: 100%;
}

/* 新增：移动端第一行 - 搜索框独占一行 */
.search-form-mobile .search-row-first {
  width: 100%;
}

/* 新增：移动端第二行 - 类别+排序并列 */
.search-form-mobile .search-row-second {
  display: flex;
  gap: 12px; /* 并列项间距 */
  width: 100%;
}

/* 新增：并列项占比均分 */
.search-form-mobile .search-row-second .el-form-item {
  flex: 1; /* 两个选择器各占一半宽度 */
}

/* 新增：移动端表单项通用样式 */
.search-form-mobile .el-form-item {
  margin-bottom: 0 !important; /* 清除默认边距 */
}

/* 新增：移动端标签宽度适配（更窄，节省空间） */
.search-form-mobile .el-form-item__label {
  width: 70px !important;
  min-width: 70px !important;
  font-size: 13px !important;
}

/* 新增：移动端输入框/选择器自适应宽度 */
.search-form-mobile .search-input,
.search-form-mobile .select-item {
  width: 100% !important;
  min-width: unset !important;
}

/* 新增：移动端按钮组 - 单独一行居中 */
.search-form-mobile .btn-group {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}

/* 修改：响应式切换逻辑（992px以下显示移动端布局） */
@media (max-width: 992px) {
  .search-form-pc {
    display: none;
  }
  .search-form-mobile {
    display: block;
  }
}

/* 保留原有基础样式，仅修改以下适配项 */
.search-input {
  width: 200px !important;
}
.select-item {
  width: 150px !important;
}

.search-input {
  width: 200px !important;
}
.select-item {
  width: 150px !important;
}
@media (max-width: 992px) {
  .search-form-pc{
    display: none;
  }
  .search-form-mobile{
    display: block;

  }
}
</style>