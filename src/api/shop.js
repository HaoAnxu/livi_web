import request from "@/utils/request.js";

export const queryGoodsApi = (data)=>{
    return request.post('/goods/queryGoods',data)
}