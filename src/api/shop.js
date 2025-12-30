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

//查询商品规格
export const queryGoodsSpecApi = (goodsId)=>{
    return request.post(`/permission/goods/queryGoodsSpec?goodsId=${goodsId}`)
}

//创建订单
export const createOrderApi = (data)=>{
    return request.post('/permission/goods/createOrder',data)
}