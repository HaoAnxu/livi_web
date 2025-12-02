import request from "@/utils/request.js";
//用户登录
export const loginApi = (data)=>{
    return request.post('/user/login',data)
}
//用户注册
export const registerApi = (data)=>{
    return request.post('/user/register',data)
}
//发送验证码
export const sendCodeApi =(email)=>{
    return request.post(`/user/sendCode?email=${email}`)
}
//验证验证码
export const verifyCodeApi =(email,code)=>{
    return request.post(`/user/verifyCode?email=${email}&code=${code}`)
}
//用户中心_信息查询
export const queryUserInfoApi =(userId)=>{
    return request.get(`/permission/user/userCenter/basicInfo?userId=${userId}`)
}
//检查用户名是否存在
export const checkUsernameApi =(username)=>{
    return request.post(`/user/checkUsername?username=${username}`)
}
