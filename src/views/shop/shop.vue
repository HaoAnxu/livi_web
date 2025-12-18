<script setup>
import {onMounted, ref} from 'vue'
import {queryGoodsApi} from "@/api/shop.js";
import MyMessage from "@/utils/MyMessage.js";
import {MyLoading} from "@/utils/MyLoading.js";

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
  MyLoading.value = true;
  try {
    const result = await queryGoodsApi(form.value)
    if (result.code) {
      goods_list.value = result.data.rows
      MyLoading.value = false;
    } else {
      MyMessage.error(result.msg)
      MyLoading.value = false;
    }
  } catch (error) {
    console.log('请求失败：', error);
    let errorMsg = '请求失败，请稍后重试';
    if (error.message.includes('timeout')) {
      errorMsg = '请求超时，请检查网络或联系管理员';
    } else if (error.message.includes('Network Error')) {
      errorMsg = '网络错误，无法连接服务器';
    }
    MyMessage.error(errorMsg);
    MyLoading.value = false;
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
    </el-header>

    <el-main class="main-content">

    </el-main>

    <el-footer class="page-footer">yes</el-footer>
  </el-container>
</template>

<style scoped>

</style>