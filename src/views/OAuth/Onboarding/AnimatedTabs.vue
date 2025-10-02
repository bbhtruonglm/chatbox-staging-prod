<template>
  <div class="p-4">
    <button
      @click="active = 0"
      class="px-3 py-1 bg-gray-200 m-2"
    >
      Tab 1
    </button>
    <button
      @click="active = 1"
      class="px-3 py-1 bg-gray-200 m-2"
    >
      Tab 2
    </button>

    <!-- flex container -->
    <TransitionGroup
      name="expand"
      tag="div"
      class="flex gap-4 relative mt-6 w-full"
    >
      <div
        v-for="box in filtered"
        :key="box"
        class="box h-20 flex items-center justify-center text-white font-bold transition-all duration-500"
        :class="boxClass(box)"
      >
        {{ box }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const active = ref(0)

const filtered = computed(() =>
  active.value === 0 ? ['A', 'B', 'C', 'D'] : ['C', 'D']
)

function boxClass(box) {
  if (box === 'D') {
    // D always order-last and ml-auto so it sticks to the right edge
    return active.value === 0
      ? 'order-last ml-auto flex-none w-1/4 bg-blue-500' // Tab1: small (25%)
      : 'order-last ml-auto flex-none w-3/4 bg-blue-500' // Tab2: big (75%)
  }
  // non-D boxes fill remaining space equally
  return 'flex-1 min-w-0 bg-red-500'
}
</script>

<style>
/* base to ensure flex items can shrink */
.box {
  min-width: 0; /* prevent overflow when shrinking */
}

/* TransitionGroup animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.45s cubic-bezier(0.2, 0.9, 0.3, 1);
}

/* enter: from outside left */
.expand-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}
.expand-enter-to {
  opacity: 1;
  transform: translateX(0);
}

/* leave: detach from flow then slide out */
.expand-leave-active {
  position: absolute;
  z-index: 40; /* so leaving items sit above others while animating */
}
.expand-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.expand-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* move (reorder) animations for remaining items */
.expand-move {
  transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1);
}
</style>
