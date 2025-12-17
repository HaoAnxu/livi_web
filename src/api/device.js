import request from '@/utils/request'

//根据用户id获取其家庭信息
export const getAllFamilyInfoByUserIdApi =(userId)=>{
    return request.get(`/permission/device/queryMyFamilyList?userId=${userId}`)
}

//获取所有设备信息
export const getAllDeviceInfoListByUserIdApi =(familyId)=>{
    return request.get(`/permission/device/queryMyDeviceList?familyId=${familyId}`)
}

//根据家庭id获取其匹配房间信息
export const getRoomInfoByFamilyIdApi =(familyId)=>{
    return request.get(`/permission/device/queryMyRoomList?familyId=${familyId}`)
}

//获取单个设备信息
export const getDeviceInfoByDeviceIdApi =(deviceId)=>{
    return request.get(`/permission/device/queryMyDevice?deviceId=${deviceId}`)
}

//更改设备执行状态
export const changeDeviceStatusApi =(deviceId,deviceStatus)=>{
    return request.put(`/permission/device/changeStatus?deviceId=${deviceId}&deviceStatus=${deviceStatus}`)
}

//上传设备图片
export const uploadDeviceImgApi =(data)=>{
    return request.post('/permission/device/uploadImage',data)
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

//查询设备执行任务记录
export const getTaskListByTaskTypeApi =(deviceId,taskType)=>{
    return request.get(`/permission/device/queryTaskListByTaskType?deviceId=${deviceId}&taskType=${taskType}`)
}

//停止设备任务long类型
export const stopTaskApi =(deviceId)=>{
    return request.put(`/permission/device/stopRunningTask?deviceId=${deviceId}`)
}

//删除任务根据taskId
export const deleteTaskByTaskIdApi =(taskId)=>{
    return request.delete(`/permission/device/deleteTaskByTaskId?taskId=${taskId}`)
}
