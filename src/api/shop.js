import request from "@/utils/request.js";

//查询商品信息
export const queryGoodsApi = (data)=>{
    return request.post('/goods/queryGoods',data)
}