import request from '@/utils/request';

//校验是否登录
export function verifyIsLoginApi(){
    return request.get('/permission/isLogin')
}
//获取社区列表
export function getCommunityListApi(){
    return request.get('/permission/wecommunity/getCommunityList')
}
//获取群成员列表
export function getCommunityMemberListApi(communityId){
    return request.get(`/permission/wecommunity/getCommunityMemberList?communityId=${communityId}`)
}
//查看社区详情
export function getCommunityDetailApi(communityId){
    return request.get(`/permission/wecommunity/getCommunityDetail?communityId=${communityId}`)
}
//查询用户是否已经加入社区
export function queryUserJoinCommunityApi(communityId,userId){
    return request.post(`/permission/wecommunity/isJoinCommunity?communityId=${communityId}&userId=${userId}`)
}
//加入社区
export function joinCommunityApi(communityId,userId){
    return request.post(`/permission/wecommunity/joinCommunity?communityId=${communityId}&userId=${userId}`)
}
//退出社区
export function exitCommunityApi(communityId,userId){
    return request.delete(`/permission/wecommunity/exitCommunity?communityId=${communityId}&userId=${userId}`)
}

