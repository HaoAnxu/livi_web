import request from '@/utils/request'

//查询帖子列表
export const queryPostListApi =(page,pageSize)=>{
    return request.post(`/wePost/queryPostList?page=${page}&pageSize=${pageSize}`)
}
//根据userId查询帖子列表
export const queryPostByUserIdApi =(userId,page,pageSize)=>{
    return request.post(`/wePost/queryPostListByUserId?userId=${userId}&page=${page}&pageSize=${pageSize}`)
}
//根据postId查询帖子详情
export const queryPostDetailApi =(postId)=>{
    return request.post(`/wePost/queryPostDetail?postId=${postId}`)
}
//分页查询帖子评论列表
export const queryCommentListApi =(postId,page,pageSize)=>{
    return request.post(`/wePost/comment/queryCommentList?postId=${postId}&page=${page}&pageSize=${pageSize}`)
}
//发帖子
export const sendPostApi =(postData)=>{
    return request.post('/permission/wePost/createPost',postData)
}
//发评论
export const sendCommentApi =(commentData)=>{
    return request.post('/permission/wePost/createComment',commentData)
}
//删帖子
export const deletePostApi =(postId)=>{
    return request.post(`/permission/wePost/deletePostByPostId?postId=${postId}`)
}
//删评论
export const deleteCommentApi =(commentId)=>{
    return request.post(`/permission/wePost/deleteCommentByCommentId?commentId=${commentId}`)
}
