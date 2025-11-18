Message.vue<script setup>
import { ref, onMounted } from 'vue'

// 定义画布需要的参数，这些参数是从父组件传来的
const props = defineProps({
    width:{type:Number,default:120},//验证码画布宽度
    height:{type:Number,default:40},//验证码画布高度
    length:{type:Number,default:4},//几位验证码
    difficulty:{type:Number,default:10}//干扰线的数量
})
// 拿到canvas元素
const canvasRef = ref(null)
// 储存验证码
let YZcode = ''

// 根据长度随机生成验证码,至少要有一位数字
const generateCode = ()=>{
    // 字符集
    const chars1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const chars2 = '0123456789'
    // 验证码临时
    let code = ''
    
    for(let i=0;i<props.length-1;i++){
        const randomIndex = Math.floor(Math.random()*chars1.length)
        code += chars1.charAt(randomIndex)
    }
    
    // 验证码的随机位置插入一个数字
    const randomDigit = chars2.charAt(Math.floor(Math.random() * chars2.length));
    // 生成一个随机位置插入这个数字
    const insertPosition = Math.floor(Math.random() * (code.length + 1));
    // 在随机位置插入数字
    code = code.slice(0, insertPosition) + randomDigit + code.slice(insertPosition);

    // 保存验证码
    YZcode = code;
    return code;
}

// 生成随机颜色rgb(1,2,3)
const randomColor =()=>{
    const r = Math.floor(Math.random()*256)
    const g = Math.floor(Math.random()*256)
    const b = Math.floor(Math.random()*256)
    return `rgb(${r},${g},${b})`
}

// 绘制验证码到画布上
const drawCode =()=>{
    const canvas = canvasRef.value
    if(!canvas){
        return
    }
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0,0,props.width,props.height)// 清空画布
    
    ctx.fillStyle = '#ababab'
    ctx.fillRect(0,0,props.width,props.height)

    // 绘制干扰元素
    for(let i=0;i<props.difficulty;i++){
        ctx.beginPath()
        ctx.moveTo(Math.random()*props.width,Math.random()*props.height)
        ctx.lineTo(Math.random()*props.width,Math.random()*props.height)
        ctx.strokeStyle = randomColor()
        ctx.stroke()
    }

    // 绘制验证码字符
    const charWidth = props.width/props.length;
    const chars = generateCode().split('');

    chars.forEach((char,index)=>{
        ctx.font = '24px "微软雅黑"'
        ctx.fillStyle=randomColor()

        // 计算绘制的位置
        const x = charWidth*index+charWidth/2
        const y = props.height/2+12

        ctx.fillText(char,x,y)
    })
}

// 刷新验证码
const refreshCode =()=>{
    drawCode();
}

// 组件挂载后执行
onMounted(() => {
    refreshCode();  // 初始化绘制验证码
});

// 暴露出去
defineExpose({
    refreshCode,
    // 检查输入的验证码是不是对的
    checkCode:(userInput)=>{
        return userInput === YZcode
    }
})
</script>

<template>
    <div class="YZcode" @click="refreshCode">
        <canvas ref="canvasRef" :width="props.width" :height="props.height"></canvas>
    </div>
</template>

<style scoped>
    .YZcode{
        width: 120px;
        height: 40px;
        border: 1px solid #ccc;
    }
</style>
