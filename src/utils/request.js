import axios from 'axios'
import router from '../router'
import Message from "@/utils/MyMessage.js";
import md5 from 'js-md5';

//创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 60000,//请求超时时间10秒
})

//axios的请求 request 拦截器, 每次请求获取sessionStorage中的loginUser, 从中获取到token, 在请求头token中携带到服务端
request.interceptors.request.use(
    (config)=>{
        let loginUser = JSON.parse(sessionStorage.getItem('loginUser'));
        if(loginUser){
            config.headers.token = loginUser.token;
        }
        //生成签名，和后端逻辑一致，进行校验
        const timestamp = Date.now().toString()
        const nonce = Math.random().toString(36).substring(2,12);
        const signSecret = import.meta.env.VITE_SIGN_SECRET;//从环境变量中获取
        const sign = md5(timestamp + nonce + signSecret);
        config.headers.timestamp = timestamp;
        config.headers.nonce = nonce;
        config.headers.sign = sign;
        return config;
    },
    (error)=>{
        return Promise.reject(error)
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
            //清除sessionStorage中的loginUser
            sessionStorage.removeItem('loginUser')
            router.push('/login')
        }
        return Promise.reject(error)
    }
)

export default request