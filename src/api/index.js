import request from '@/utils/request'

export const getHotGoodsApi =()=>{
    return request.get('/goods/queryHotGoods')
}