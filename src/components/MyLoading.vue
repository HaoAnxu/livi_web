<script setup>

</script>

<template>
  <div class="loading-page" @click.stop>
    <div class="loading-container">
      <div class="ring"></div>
      <div class="ring"></div>
      <div class="ring"></div>
      <div class="ring"></div>
      <div class="loading-text">loading</div>
    </div>
  </div>
</template>

<style scoped>
.loading-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(27, 27, 27, 0.58);
  z-index: 9999;
  pointer-events: auto;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: clamp(120px, 25vw, 190px);
  height: clamp(120px, 25vw, 190px);
  z-index: 10000;
}

.loading-text {
  color: #8aabff;
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: 500;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  z-index: 1;
  position: relative; /* 确保文字在环形上方 */
}

.ring {
  width: 100%;
  height: 100%;
  border: 1px solid transparent;
  border-radius: 50%;
  position: absolute;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  z-index: 0;
}

.ring:nth-child(1) {
  border-bottom: clamp(4px, 1vw, 8px) solid rgb(255, 141, 249);
  animation: rotate1 2s linear infinite forwards;
}

.ring:nth-child(2) {
  border-bottom: clamp(4px, 1vw, 8px) solid rgb(255, 65, 106);
  animation: rotate2 2s linear infinite forwards;
}

.ring:nth-child(3) {
  border-bottom: clamp(4px, 1vw, 8px) solid rgb(0, 255, 255);
  animation: rotate3 2s linear infinite forwards;
}

.ring:nth-child(4) {
  border-bottom: clamp(4px, 1vw, 8px) solid rgb(252, 183, 55);
  animation: rotate4 2s linear infinite forwards;
}

/* 动画关键帧不变 */
@keyframes rotate1 {
  from { transform: rotateX(50deg) rotateZ(110deg); }
  to { transform: rotateX(50deg) rotateZ(470deg); }
}

@keyframes rotate2 {
  from { transform: rotateX(20deg) rotateY(50deg) rotateZ(20deg); }
  to { transform: rotateX(20deg) rotateY(50deg) rotateZ(380deg); }
}

@keyframes rotate3 {
  from { transform: rotateX(40deg) rotateY(130deg) rotateZ(450deg); }
  to { transform: rotateX(40deg) rotateY(130deg) rotateZ(90deg); }
}

@keyframes rotate4 {
  from { transform: rotateX(70deg) rotateZ(270deg); }
  to { transform: rotateX(70deg) rotateZ(630deg); }
}
</style>