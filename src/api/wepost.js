import request from '@/utils/request'

//查询圈子详情
export const queryCircleDetailApi =(circleId)=>{
    return request.post(`/wePost/queryCircleDetail?circleId=${circleId}`)
}

//查询帖子列表
export const queryPostListApi =(data)=>{
    return request.post('/wePost/queryPostList',data)
}

//根据userId查询帖子列表
export const queryPostByUserIdApi =(data)=>{
    return request.post('/wePost/queryPostListByUserId',data)
}

//根据postId查询帖子详情
export const queryPostDetailApi =(data)=>{
    return request.post('/wePost/queryPostDetail',data)
}

//分页查询帖子评论列表
export const queryCommentListApi =(data)=>{
    return request.post('/wePost/comment/queryCommentList',data)
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

//查询3个轮播图片
export const queryCarouselImageListApi =()=>{
    return request.post('/wePost/queryCarouselImageList')
}

//查询随机4个圈子列表
export const queryCircleListApi =()=>{
    return request.post('/wePost/queryCircleList')
}

//查询五条热点新闻
export const queryNewsListApi =()=>{
    return request.post('/wePost/queryHotNewsList')
}
