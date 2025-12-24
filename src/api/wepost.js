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
export const queryPostDetailApi =(postId)=>{
    return request.post(`/wePost/queryPostDetail?postId=${postId}`)
}

//发帖子
export const sendPostApi =(postData)=>{
    return request.post('/permission/wePost/createPost',postData)
}

//分页查询帖子根评论列表
export const queryCommentListApi =(data)=>{
    return request.post('/wePost/comment/queryCommentList',data)
}

//分页查询帖子子评论列表
export const queryReplyCommentListApi =(data)=>{
    return request.post('/wePost/comment/queryReplyCommentList',data)
}

//查询帖子评论数
export const queryCommentCountApi =(data)=>{
    return request.post('/wePost/comment/queryReplyCount',data)
}

//发评论
export const sendCommentApi =(commentData)=>{
    return request.post('/permission/wePost/createComment',commentData)
}

//回复评论
export const replyCommentApi =(replyData)=>{
    return request.post('/permission/wePost/replyComment',replyData)
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

//查询用户加入的圈子列表
export const queryCircleListByUserIdApi =(data)=>{
    return request.post('/wePost/queryCircleListByUserId',data)
}

//根据圈子id查询帖子列表
export const queryPostListByCircleIdApi =(data)=>{
    return request.post('/wePost/queryPostListByCircleId',data)
}
