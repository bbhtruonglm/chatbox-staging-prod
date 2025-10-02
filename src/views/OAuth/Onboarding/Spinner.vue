<template>
  <!-- chỉ cần 1 div với class loader -->
  <div
    class="loader"
    aria-label="Loading"
  >
    Loading…
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.loader {
  font-size: 10px; /* chỉnh kích thước tổng thể */
  width: 1em; /* chiều rộng thanh */
  height: 4em; /* chiều cao thanh (thẻ dài) */
  /* bỏ bo tròn để thành thẻ dài */
  /* border-radius: 50%; */
  border-radius: 2px; /* nhẹ cho mềm thanh */
  position: relative;
  text-indent: -9999em; /* ẩn chữ Loading… */
  animation: mulShdSpin 1.1s infinite ease;
  transform: translateZ(0);
}

/* animation nhiều bóng mờ xoay */
@keyframes mulShdSpin {
  0%,
  100% {
    box-shadow: 0em -2.6em 0em 0em #ffffff,
      1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2),
      2.5em 0em 0 0em rgba(255, 255, 255, 0.2),
      1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2),
      0em 2.5em 0 0em rgba(255, 255, 255, 0.2),
      -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2),
      -2.6em 0em 0 0em rgba(255, 255, 255, 0.5),
      -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.7);
  }
  12.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.7),
      1.8em -1.8em 0 0em #ffffff, 2.5em 0em 0 0em rgba(255, 255, 255, 0.2),
      1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2),
      0em 2.5em 0 0em rgba(255, 255, 255, 0.2),
      -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2),
      -2.6em 0em 0 0em rgba(255, 255, 255, 0.2),
      -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.5);
  }
  /* …các keyframe còn lại copy nguyên như bạn đã có… */
}
</style>
