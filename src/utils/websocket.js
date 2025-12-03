import {ref} from 'vue';
import Message from "./MyMessage.js"
import md5 from "js-md5";

//定义全局变量
let wsInstance = null; // WebSocket实例
const isConnected = ref(false); // 连接状态（响应式，供组件使用）

//定义配置变量
const WS_CONFIG = {
    baseUrl: import.meta.env.VITE_WS_BASE_URL || '',
    userId: '', // 登录用户ID
    reconnectInterval: 5000, // 重连间隔
    heartbeatInterval: 5000, // 心跳间隔
    maxReconnectTimes: 10, // 最大重连次数（避免无限重连）
    signSecret: import.meta.env.VITE_SIGN_SECRET // 从环境变量拿签名密钥（和 Axios 一致）
}

//定时器变量（管理重连和心跳）
let reconnectTimer = null;
let heartbeatTimer = null;
let reconnectCount = 0; // 重连计数器
// 定义指令消息类型列表, 用于判断是否需要特殊处理

// 定义指令消息类型列表, 用于判断是否需要特殊处理
const COMMAND_MSG_TYPES = [
    'request_chat_history', // 查询历史记录指令
];
// 导出连接状态
export {isConnected}

// 拼接WebSocket完整URL,因为WebSocket没有header，所以只能在URL中拼接安全校验所需参数
const buildWsUrl = (baseWsUrl, userId, communityId, token) => {
    const timestamp = Date.now().toString();
    const nonce = Math.random().toString(36).substring(2, 12);
    const sign = md5(timestamp + nonce + WS_CONFIG.signSecret);

    const params = new URLSearchParams();
    params.append('token', encodeURIComponent(token));
    params.append('timestamp', encodeURIComponent(timestamp));
    params.append('nonce', encodeURIComponent(nonce));
    params.append('sign', encodeURIComponent(sign));

    return `${baseWsUrl}?${params.toString()}`;
};

// 连接WebSocket（接受组件传递的参数）
export function connectWebSocket(userId, communityId, wsUrl) {
    if (!userId || !communityId || !wsUrl) {
        Message.error('缺少必要参数，无法建立WebSocket连接');
        return;
    }
    // Token简单判断
    const loginUser = JSON.parse(sessionStorage.getItem('loginUser') || '{}');
    if (!loginUser.token) {
        Message.error('未登录，无法建立WebSocket连接');
        return;
    }
    // 关闭旧连接
    if (wsInstance) {
        wsInstance.close(1000, '重新连接'); // 正常关闭码
        wsInstance = null;
    }
    //使用参数，构建完整的WebSocketUrl
    const fullWsUrl = buildWsUrl(wsUrl, userId, communityId, loginUser.token);
    WS_CONFIG.userId = userId;

    // 建立WebSocket连接
    try {
        wsInstance = new WebSocket(fullWsUrl);
        // 连接成功-@onOpen
        wsInstance.onopen = () => {
            isConnected.value = true;
            reconnectCount = 0;
            stopReconnect();
            startHeartbeat();
        };
        // 接收消息-@onMessage
        wsInstance.onmessage = (event) => {
            if (event.data === 'pong') return; // 忽略心跳响应
            handleReceivedMessage(event.data); // 业务消息处理
        };

        // 连接错误-@onError
        wsInstance.onerror = (error) => {
            // 仅在未连接状态下提示，避免重复报错
            if (!isConnected.value) {
                Message.error(`连接出错：${error.message || '网络异常，请检查服务端状态'}`);
            }
            isConnected.value = false;
            stopHeartbeat();
            //后续丢给onclose处理
        };

        // 连接关闭-@onClose
        wsInstance.onclose = (event) => {
            // 主动关闭（code=1000）：不提示、不重连
            if (event.code === 1000) {
                isConnected.value = false;
                stopHeartbeat();
                stopReconnect();
                return;
            }

            // 被动关闭：区分重连中/首次断开
            const tipText = reconnectCount === 0
                ? `连接异常断开（状态码：${event.code}）`
                : `重连失败（状态码：${event.code}）`;
            Message.error(tipText);

            isConnected.value = false;
            stopHeartbeat();
            startReconnect(userId, communityId, wsUrl); // 触发重连
        };
    } catch (e) {
        Message.error(`服务器连接失败：${e.message}`);
    }
}

// 启动断线重连
function startReconnect(userId, communityId, wsUrl) {
    // 已达最大重连次数：终止并重置状态
    if (reconnectCount >= WS_CONFIG.maxReconnectTimes) {
        Message.error(`重连失败：已尝试${WS_CONFIG.maxReconnectTimes}次，请检查网络连接稍后再次尝试`);
        stopReconnect();
        reconnectCount = 0; // 重置计数器，方便后续手动重连
        return;
    }
    // 避免重复触发重连
    if (reconnectTimer) return;
    reconnectCount++;
    Message.warn(`连接断开，第${reconnectCount}/${WS_CONFIG.maxReconnectTimes}次重连`);
    // setTimeout：每次重连完成后再触发下一次
    reconnectTimer = setTimeout(() => {
        connectWebSocket(userId, communityId, wsUrl);
        // 重连后清空定时器（connect里会处理成功/失败）
        reconnectTimer = null;
    }, WS_CONFIG.reconnectInterval);
}

//停止断线重连
function stopReconnect() {
    if (reconnectTimer) {
        clearInterval(reconnectTimer);
        reconnectTimer = null;
    }
}

//启动心跳监测
function startHeartbeat() {
    if (heartbeatTimer) return;
    heartbeatTimer = setInterval(() => {
        // 心跳发送前校验连接状态
        if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
            wsInstance.send('ping');
        } else {
            stopHeartbeat();
        }
    }, WS_CONFIG.heartbeatInterval);
}

//停止心跳监测
function stopHeartbeat() {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}

//断开WebSocket连接，停止心跳监测和断线重连
export function closeWebSocket() {
    if (wsInstance) {
        wsInstance.close(1000, '正常关闭');
        wsInstance = null;
    }
    //清除重连和心跳定时器
    stopReconnect();
    stopHeartbeat();
    isConnected.value = false;
}

//消息订阅者列表（key：消息场景/类型，value：组件的回调函数数组）
const subscribeMap = new Map();

// 订阅消息（供组件调用：比如组件想接收「chat」类型的消息）
export function subscribeMessage(msgType, callback) {
    if (!subscribeMap.has(msgType)) {
        subscribeMap.set(msgType, []);
    }
    // 把组件的回调函数存入对应类型的列表
    subscribeMap.get(msgType).push(callback);
}

// 取消订阅（供组件卸载时调用：避免内存泄漏）
export function unsubscribeMessage(msgType, callback) {
    if (!subscribeMap.has(msgType)) return;
    const callbacks = subscribeMap.get(msgType);
    // 过滤掉要取消的回调函数，保留其他
    subscribeMap.set(msgType, callbacks.filter(cb => cb !== callback));
}

// 分发消息给订阅的组件
function handleReceivedMessage(jsonString) {
    if (jsonString === 'pong') return;
    try {
        // 解析后端返回的WebSocketResult完整格式
        const websocketResultJsonObject = JSON.parse(jsonString);
        const {msgType: msgType, data: data} = websocketResultJsonObject;

        //错误类型直接提示
        if (msgType === 'error') {
            Message.error(`服务端错误：${data}`);
            return;
        }

        //分发消息给订阅者()
        if (subscribeMap.has(msgType)) {
            const callbacks = subscribeMap.get(msgType);
            callbacks.forEach(callback => {
                // 传递完整的JSON对象，方便前端解析
                callback(websocketResultJsonObject);
            });
        }
    } catch (error) {
        Message.error('解析WebSocket消息失败：' + (error.message || '未知错误'));
    }
}

// 发送消息（适配后端：补充字段，确保JSON格式正确）
export function sendMessage(message) {
    if (!isConnected.value || !wsInstance) {
        Message.error('服务端未连接，无法发送消息');
        return;
    }
    try {
        // 第一步：统一解析为对象
        let sendDataObj = {};
        if (typeof message === 'string') {
            sendDataObj = JSON.parse(message);
        } else if (typeof message === 'object' && message !== null) {
            sendDataObj = {...message};
        } else {
            Message.error('消息格式错误：必须是JSON对象或JSON字符串');
            return;
        }
        // 区分指令类消息（msgType在白名单）和普通消息，指令类消息不需要发送
        const isCommandMsg = COMMAND_MSG_TYPES.includes(sendDataObj.msgType);

        // 普通消息：校验content + msgType（统一用msgType）
        if (!isCommandMsg) {
            const {content, msgType} = sendDataObj;
            if (!content || !msgType) {
                Message.error('消息格式错误：缺少必填字段（content/msgType）');
                return;
            }
            sendDataObj.content = content.trim();
        }
        //发送JSON字符串
        const sendData = JSON.stringify(sendDataObj);
        wsInstance.send(sendData);
    } catch (error) {
        Message.error('发送WebSocket消息失败：' + (error.message || '未知错误'));
    }
}