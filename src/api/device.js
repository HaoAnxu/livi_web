import request from '@/utils/request'

//获取所有设备信息
export const getAllDeviceInfoListByUserIdApi =(userId)=>{
    return request.get(`/permission/device/queryMyDeviceList?userId=${userId}`)
}

//获取单个设备信息
export const getDeviceInfoByDeviceIdApi =(deviceId)=>{
    return request.get(`/permission/device/queryMyDevice?deviceId=${deviceId}`)
}

//更改设备执行状态
export const changeDeviceStatusApi =(deviceId,deviceStatus)=>{
    return request.put(`/permission/device/changeStatus?deviceId=${deviceId}&deviceStatus=${deviceStatus}`)
}

//添加新设备
export const addNewDeviceApi =(data)=>{
    return request.post('/permission/device/addDevice',data)
}

//删除设备
export const deleteDeviceByDeviceIdApi =(deviceId)=>{
    return request.delete(`/permission/device/deleteDevice?deviceId=${deviceId}`)
}

//创建任务执行任务
export const createTaskApi =(data)=>{
    return request.post('/permission/device/createTask',data)
}
