import request from "@/utils/request.js";

export const loginApi = (data)=>{
    return request.post('/user/login',data)
}

export const registerApi = (data)=>{
    return request.post('/user/register',data)
}
export const sendCodeApi =(email)=>{
    return request.post(`/user/sendCode?email=${email}`)
}
export const verifyCodeApi =(email,code)=>{
    return request.post(`/user/verifyCode?email=${email}&code=${code}`)
}
