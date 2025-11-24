import request from '@/utils/request';

export function verifyIsLogin(){
    return request.get('/permission/isLogin')
}