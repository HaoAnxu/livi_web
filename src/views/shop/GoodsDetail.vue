<script setup>
import {useRoute} from 'vue-router'
import { queryGoodsDetailApi } from "@/api/shop.js";
import { onMounted, ref } from 'vue'
import MyMessage from "@/utils/MyMessage.js";
import { MyLoading } from "@/utils/MyLoading.js";

const route = useRoute()
const goodsId = ref(0)
const goodsDetail = ref({})

const queryGoodsDetail = async ()=>{
    goodsId.value = route.query.goodsId
    MyLoading.value = true
    try{
        const result = await queryGoodsDetailApi(goodsId.value)
        if(result.code){
            goodsDetail.value = result.data
        }else{
            MyMessage.error(result.msg)
            MyLoading.value = false
        }
    } catch (error) {
    MyMessage.error(error.message || '请求失败，请重试');
    MyLoading.value = false;
  }
}

onMounted(() => {
    queryGoodsDetail()
})
</script>

<template>

</template>

<style scoped>

</style>
