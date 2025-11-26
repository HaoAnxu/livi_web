import request from '@/utils/request';

//校验是否登录
export function verifyIsLogin(){
    return request.get('/permission/isLogin')
}
//获取社区列表
export function getCommunityList(){
    return request.get('/permission/wecommunity/getCommunityList')
}
//加入社区
export function joinCommunity(communityId,userId){
    return request.post(`/permission/wecommunity/joinCommunity?communityId=${communityId}&userId=${userId}`)
}
//退出社区
export function exitCommunity(communityId,userId){
    return request.delete(`/permission/wecommunity/exitCommunity?communityId=${communityId}&userId=${userId}`)
}
