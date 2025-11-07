import axios from 'axios'
import router from '../router'

//创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 60000
})
//相应拦截器
request.interceptors.response.use(
    (response)=>{
        return response.data;
    },
    (error)=>{
        if(error.response.status === 401){
            return Promise.reject(error)
        }
    }
)

export default request