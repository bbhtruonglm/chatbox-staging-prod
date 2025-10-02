<template>
  <div class="flex mx-auto overflow-hidden gap-2.5 flex-grow h-full min-h-0">
    <div
      class="flex w-full flex-grow min-h-0 h-full rounded-xl bg-white flex-col justify-between"
    >
      <div class="p-5 flex flex-col gap-5">
        <div class="flex flex-col gap-10">
          <div
            :style="{
              backgroundImage: `url(${commonStore.partner?.logo?.full})`,
            }"
            class="h-7 w-full bg-contain bg-no-repeat bg-left flex-shrink-0"
          />
        </div>
        <div class="h-full flex flex-col items-center gap-3 w-full">
          <img
            src="@/assets/imgs/loading_img.png"
            alt=""
            class="size-64"
          />
          <label class="text-xl font-semibold">{{
            $t('v1.view.onboarding.you_are_doing_great')
          }}</label>
          <p class="font-medium">
            {{ $t('v1.view.onboarding.loading_description') }}
          </p>
          <VueSpinnerIos
            size="60"
            color="gray"
            slot="10"
          />
        </div>
      </div>
      <div
        :style="{ backgroundImage: `url(${trialBg})` }"
        class="relative h-40 md:h-96 w-full -top-40 bg-cover bg-center bg-no-repeat flex-shrink-0"
      ></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useCommonStore } from '@/stores'
import { onMounted } from 'vue'
import trialBg from '@/assets/imgs/trial_bg_cover.webp' // import ảnh
import { VueSpinnerIos } from 'vue3-spinners'

/** Khai báo common store */
const commonStore = useCommonStore()
/** Emit sự kiện hoàn thành tạo tài khoản */
const $emit = defineEmits<{
  (e: 'complete'): void
}>()
/** Giả lập sau 5s sẽ tạo tk thành công và chuyển qua màn xác thức */
onMounted(() => {
  /** Simulate API call with a 5-second delay */
  setTimeout(() => {
    $emit('complete')
  }, 1000)
})
</script>

<style scoped>
/** Css phần spin */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
