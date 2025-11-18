import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                secure: false,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
            '/ws': { // 匹配以 /ws 开头的路径
                target: 'ws://localhost:8080', // 注意：这里是 ws:// 协议
                secure: false,
                changeOrigin: true,
                ws: true, // 关键：开启 WebSocket 代理
                rewrite: (path) => path // 不用重写路径
            }
        }
    }
})
