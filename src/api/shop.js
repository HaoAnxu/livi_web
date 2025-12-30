import request from "@/utils/request.js";

//查询商品信息
export const queryGoodsApi = (data)=>{
    return request.post('/goods/queryGoods',data)
}

//查询商品详情
export const queryGoodsDetailApi = (goodsId)=>{
    return request.post(`/goods/queryGoodsDetail?goodsId=${goodsId}`)
}

//查询商品评论
export const queryGoodsCommentApi = (data)=>{
    return request.post('/goods/queryGoodsComment',data)
}