<template>
  <section class="max-w-3xl mx-auto">
    <!-- Tiêu đề -->
    <h2
      class="text-3xl font-medium text-center pt-5 flex justify-center gap-2.5 items-center cursor-pointer"
      @click="toggleAll"
    >
      {{ $t('v1.view.onboarding.FAQ') }}
      <ChevronDownIcon
        class="size-7 transition-transform duration-200"
        :class="openAll ? 'rotate-180' : ''"
      />
    </h2>

    <div
      v-show="openAll"
      class="divide-y"
    >
      <!-- ẩn/hiện toàn bộ -->
      <!-- Câu hỏi 1 -->
      <div class="py-4">
        <button
          class="w-full flex justify-between items-center text-left"
          @click="toggle(1)"
        >
          <span class="text-lg font-medium">Question 1</span>
          <svg
            class="w-5 h-5 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="openIndex === 1 ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'"
            />
          </svg>
        </button>
        <div
          v-show="openIndex === 1"
          class="mt-2 text-gray-700"
        >
          Content of question 1 here.
        </div>
      </div>

      <!-- Câu hỏi 2 -->
      <div class="py-4">
        <button
          class="w-full flex justify-between items-center text-left"
          @click="toggle(2)"
        >
          <span class="text-lg font-medium">Question 2</span>
          <svg
            class="w-5 h-5 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="openIndex === 2 ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'"
            />
          </svg>
        </button>
        <div
          v-show="openIndex === 2"
          class="mt-2 text-gray-700"
        >
          Yes. It adheres to the WAI-ARIA design pattern.
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/24/solid'
import { ref } from 'vue'

const openIndex = ref<number | null>(null)
const openAll = ref(true) // mặc định hiện

const toggle = (index: number) => {
  // chỉ cho mở từng cái khi openAll true
  if (openAll.value) {
    openIndex.value = openIndex.value === index ? null : index
  }
}

const toggleAll = () => {
  openAll.value = !openAll.value
  if (!openAll.value) {
    openIndex.value = null // đóng tất cả
  }
}
</script>
