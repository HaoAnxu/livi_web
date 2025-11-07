# SmartHomeMall - 智能家居购物商城 Web 应用
一个集「智能家居购物」「设备远程操控」「社区交流」于一体的 Web 应用，基于 Vue 3 + Vite 开发，提供便捷的智能家居体验。

## 项目功能
- 智能家居购物：浏览、搜索、购买各类智能设备（如灯具、传感器、家电等）
- 设备操控：绑定家庭智能设备，实现远程开关、参数调节等功能
- 社区聊天：与其他用户交流智能家居使用经验、分享搭配方案

## 技术栈
- 核心框架：Vue 3
- 构建工具：Vite
- UI 组件库：Element Plus + @element-plus/icons-vue
- 接口请求：Axios
- 语法支持：JSX/TSX（需依赖 @vitejs/plugin-vue-jsx）

## 环境准备
- Node.js 版本 ≥ 16.x（推荐 18.x）
- npm 或 yarn 包管理器

## 安装与启动
1. 克隆项目到本地

git clone [你的Gitee仓库SSH/HTTPS地址]
cd SmartHomeMall


2. 安装依赖

# 核心依赖
npm install axios element-plus @element-plus/icons-vue

# JSX语法支持插件（启动必需）
npm install @vitejs/plugin-vue-jsx -D


3. 启动开发服务器

npm run dev


4. 访问项目：启动成功后，浏览器打开终端提示的本地地址（默认通常是 http://127.0.0.1:5173）

## 备注
- 若启动报错 “找不到 @vitejs/plugin-vue-jsx”，请重新执行依赖安装命令
- 项目依赖均已指定生产/开发环境，无需额外手动分类
- 后续如需打包部署，执行 `npm run build` 即可生成 dist 目录
