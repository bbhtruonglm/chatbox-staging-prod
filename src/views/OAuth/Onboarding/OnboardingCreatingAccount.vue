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

        <div class="h-full flex flex-col items-center gap-5 w-full">
          <img
            src="@/assets/imgs/creating_account.png"
            alt=""
            class="size-64"
          />
          <label class="text-xl font-semibold">
            {{ $t('v1.view.onboarding.completing_quick_setup') }}
          </label>

          <!-- 3 bước theo cột -->
          <div
            class="h-full flex flex-col items-center justify-center gap-2 mx-auto"
          >
            <div
              v-for="(step, index) in STEPS"
              :key="index"
              class="flex items-center gap-3 w-full"
            >
              <!-- Icon -->
              <div class="flex items-center justify-center size-6">
                <VueSpinnerIos
                  v-if="index === current_step && !step.done"
                  size="20"
                  color="gray"
                />
                <CheckCircleIcon
                  v-else-if="step.done"
                  class="size-6 text-slate-700"
                />
                <ClockIcon
                  v-else
                  class="size-6 text-slate-400"
                />
              </div>
              <!-- Title -->
              <span class="text-sm font-medium">{{ step.text }}</span>
            </div>
          </div>
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
import { onMounted, ref } from 'vue'
import trialBg from '@/assets/imgs/trial_bg_cover.webp'
import { VueSpinnerIos } from 'vue3-spinners'
import { CheckCircleIcon, ClockIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'

/** Hàm dịch ngôn ngữ */
const { t: $t } = useI18n()
/** Common store */
const commonStore = useCommonStore()
/** Hàm emit complete */
const $emit = defineEmits<{
  (e: 'complete'): void
}>()

/** Danh sách bước */
const STEPS = ref([
  { text: $t('v1.view.onboarding.applying_preference'), done: false },
  { text: $t('v1.view.onboarding.config_ai'), done: false },
  { text: $t('v1.view.onboarding.finalizing_Retion'), done: false },
])

/** Bước hiện tại */
const current_step = ref(0)

onMounted(() => {
  /** Khai báo index step */
  let step_index = 0
  /** Tạo 1 interval */
  const INTERVAL = setInterval(() => {
    /** đánh dấu xong step hiện tại */
    STEPS.value[step_index].done = true
    /** chuyển sang step tiếp theo */
    step_index++
    current_step.value = step_index
    /** Nếu hoàn thành thì chuyển đến bước tiếp theo */
    if (step_index >= STEPS.value.length) {
      clearInterval(INTERVAL)
      setTimeout(() => $emit('complete'), 500)
    }
  }, 1000)
})
</script>
