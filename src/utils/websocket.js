import { ref, onUnmounted } from 'vue';
import Message from "./Message.js"

//定义全局变量
let wsInstance = null; // WebSocket实例
const isConnected = ref(false); // 连接状态（响应式，供组件使用）

//定义配置变量，从组件传递
const WS_CONFIG ={
    baseUrl: import.meta.env.VITE_WS_BASE_URL || '',
    userId: '', // 登录用户ID
    reconnectInterval: 5000, // 重连间隔
    heartbeatInterval: 5000, // 心跳间隔
    maxReconnectTimes: 10, // 最大重连次数（避免无限重连）
}

//定时器变量（管理重连和心跳）
let reconnectTimer = null;
let heartbeatTimer = null;
let reconnectCount = 0; // 重连计数器

export {isConnected}

//连接WebSocket（接受组件传递的userId）
export function connectWebSocket(userId,wsUrl){
    if(!userId){
        Message.error('用户ID不能为空')
        return;
    }
    if(!wsUrl){
        Message.error('请传入完整的WebSocket地址（如 /ws/chat/1）');
        return;
    }
    //存储用户id到配置变量
    WS_CONFIG.userId = userId;
    // 已连接则先关闭旧连接，避免重复创建
    if (wsInstance) {
        wsInstance.close();
        wsInstance = null;
    }
    // 创建WebSocket实例
    wsInstance = new WebSocket(wsUrl);
    //1.连接成功回调->@OnOpen
    wsInstance.onopen = () => {
        Message.success('WebSocket连接成功！');
        isConnected.value = true;
        reconnectCount = 0; // 重置重连计数器
        clearInterval(reconnectTimer); // 清除重连定时器
        // 启动心跳检测
        startHeartbeat();
    }
    //2.收到后端消息回调（根据type进行消息分发）
    wsInstance.onmessage = (event) => {
        if(event.data === 'pong'){
            return;
        }
        handleReceivedMessage(event.data);
    }
    //3.连接失败回调->@OnError
    wsInstance.onerror = (error) => {
        Message.error('WebSocket连接出错：' + error.message);
        isConnected.value = false;
        stopHeartbeat();

        // 启动重连（限制最大重连次数）
        if (reconnectCount < WS_CONFIG.maxReconnectTimes) {
            startReconnect(() => {
                connectWebSocket(userId, wsUrl); // 重连时传入原参数
            });
        } else {
            Message.error('已达最大重连次数，停止重连');
        }
    }
    //4.连接断开回调->@OnClose
    wsInstance.onclose = () => {
        Message.error('WebSocket连接断开！');
        isConnected.value = false;
        stopHeartbeat(); // 停止心跳

        // 启动重连（限制最大重连次数，重连时复用之前的 userId 和 wsUrl）
        if (reconnectCount < WS_CONFIG.maxReconnectTimes) {
            startReconnect(() => {
                connectWebSocket(userId, wsUrl); // 重连时传入原参数
            });
        } else {
            Message.error('已达最大重连次数，停止重连');
        }
    }
}

//启动断线重连
function startReconnect(){
    if(reconnectTimer) return;
    reconnectTimer = setInterval(()=>{
        connectWebSocket();
    },WS_CONFIG.reconnectInterval);
}
//停止断线重连
function stopReconnect(){
    if(reconnectTimer){
        clearInterval(reconnectTimer);
        reconnectTimer = null;
    }
}
//启动心跳监测
function startHeartbeat(){
    if(heartbeatTimer) return;
    heartbeatTimer = setInterval(()=>{
        wsInstance.send('ping');
    },WS_CONFIG.heartbeatInterval);
}
//停止心跳监测
function stopHeartbeat(){
    if(heartbeatTimer){
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}
//断开WebSocket连接，停止心跳监测和断线重连
export function closeWebSocket(){
    if(wsInstance){
        wsInstance.close(1000,'正常关闭');
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
export function subscribeMessage(type, callback) {
    if (!subscribeMap.has(type)) {
        subscribeMap.set(type, []);
    }
    // 把组件的回调函数存入对应类型的列表
    subscribeMap.get(type).push(callback);
}

// 取消订阅（供组件卸载时调用：避免内存泄漏）
export function unsubscribeMessage(type, callback) {
    // has() 是 Map 的原生方法：判断 key（这里是 type）是否存在，存在返回 true，否则 false
    if (!subscribeMap.has(type)) return;
    // get() 是 Map 的原生方法：根据 key 取 value
    const callbacks = subscribeMap.get(type);
    // 过滤掉要取消的回调, 保留其他回调
    subscribeMap.set(type, callbacks.filter(cb => cb !== callback));
}

//分发消息给订阅的组件
function handleReceivedMessage(rawData) {
    if (rawData === 'pong') return;
    try {
        // 后端返回的是 JSON 格式
        const data = JSON.parse(rawData);
        // 解构赋值：从 data 对象里「直接取出 type 字段」，相当于 const type = data.type;
        const { type } = data;
        if (!type) {
            Message.error('JSON数据格式错误：缺少 type 字段');
            return;
        }
        // 把消息分发给所有订阅了该类型的组件
        if (subscribeMap.has(type)) {
            const callbacks = subscribeMap.get(type);
            // 遍历数组，逐个调用里面的函数（把消息data传进去）
            callbacks.forEach(callback => {
                // callback 就是数组里的函数本身
                callback(data); //后面+(data)意思就是执行这个函数
            });
        }
    } catch (error) {
        Message.error('JSON数据格式错误：' + (error.message || '未知错误'));
    }
}
//发送消息（供组件调用：复用组件的消息格式）
export function sendMessage(message) {
    // 校验：未连接/无实例 直接返回（组件已锁定按钮，这里做双重保险）
    if (!isConnected.value || !wsInstance) {
        Message.error('WebSocket未连接，无法发送消息');
        return;
    }

    try {
        // 校验消息格式（必须包含 fromUserId、toUserId、content、type）
        const { fromUserId, toUserId, content, type } = message;
        if (!fromUserId || !toUserId || !content || !type) {
            Message.error('消息格式错误：缺少必填字段');
            return;
        }
        //发送JSON字符串
        wsInstance.send(JSON.stringify(message));
    } catch (error) {
        Message.error('发送WebSocket消息失败：' + (error.message || '未知错误'));
    }
}