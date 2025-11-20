import axios from 'axios'
import router from '../router'
import Message from "@/utils/Message.js";

//创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 60000
})

//axios的请求 request 拦截器, 每次请求获取localStorage中的loginUser, 从中获取到token, 在请求头token中携带到服务端
request.interceptors.request.use(
    (config)=>{
        let loginUser = JSON.parse(localStorage.getItem('loginUser'));
        if(loginUser){
            config.headers.token = loginUser.token;
        }
        return config;
    }
)

//axios的响应 response 拦截器
request.interceptors.response.use(
    (response)=>{
        return response.data;
    },
    (error)=>{
        if(error.response.status === 401){
            Message.error("登录过期,请重新登录")
            router.push('/login')
        }
        return Promise.reject(error)
    }
)

export default request