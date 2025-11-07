<script setup>
import {onMounted, ref} from 'vue'
import {queryGoodsApi} from "@/api/shop.js";
import {ElMessage} from "element-plus";

const form = ref({
  goods_name: '',
  goods_type: '',
})
const sort_rule = ref('')

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
    goods_list.value = result.data
  }else {
    ElMessage.error(result.msg)
  }
}

onMounted(() => {
  search()
})
</script>

<template>
  <el-container class="page-container">
    <!--  搜索栏目-->
    <el-header class="search-header">
      <div class="search-form">
        <el-form
            :inline="true"
            :model="form"
            label-width="80px"
        class="search-form"
        >
        <!-- 商品名称输入框：增加宽度适配 -->
        <el-form-item label="商品名称" class="form-item">
          <el-input
              v-model="form.goods_name"
              placeholder="大家都在搜:小米空调"
              class="search-input"
          />
        </el-form-item>
        <!-- 商品类别选择器 -->
        <el-form-item label="商品类别" class="form-item">
          <el-select v-model="form.goods_type" placeholder="请选择商品类别" class="select-item">
            <el-option v-for="type in goods_type" :key="type" :label="type" :value="type" />
          </el-select>
        </el-form-item>
        <!-- 排序规则选择器 -->
        <el-form-item label="排序规则" class="form-item">
          <el-select v-model="sort_rule" placeholder="请选择排序规则" class="select-item">
            <el-option v-for="rule in sort_rule_options" :key="rule.value" :label="rule.name" :value="rule.value" />
          </el-select>
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
.search-form{
  display: flex;
  justify-content: center;
  margin-top: 5px;
}
.search-input {
  width: 200px !important;
}
.select-item {
  width: 150px !important;
}
</style>