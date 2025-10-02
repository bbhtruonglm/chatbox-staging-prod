<template>
  <!-- container -->
  <div
    class="relative flex flex-row gap-5 items-center justify-between overflow-hidden bg-slate-50"
  >
    <!-- white seam, chỉ bằng width tabs -->
    <div class="flex">
      <!-- filler trái -->
      <div class="first-tab w-12 bg-slate-50 z-20"></div>

      <!-- tabs -->
      <div class="flex relative">
        <div
          v-for="(label, index) in tabs"
          :key="index"
          class="tab whitespace-nowrap px-10 py-4 font-medium grid place-items-center text-black text-xl relative z-20 cursor-pointer select-none first:ml-0"
          :class="[
            index === active_index
              ? 'bg-white z-30 rounded-t-xl'
              : 'bg-yellow-50',
            index === active_index - 1 ? 'rounded-br-xl' : '',
            index === active_index + 1 ? 'rounded-bl-xl' : '',
            index === 0 ? 'rounded-tl-xl' : '',
            index === tabs.length - 1 ? 'rounded-tr-xl' : '',
          ]"
          @click="selectTab(index)"
        >
          {{ label }}
        </div>
        <div
          class="absolute top-0 left-0 h-4 w-full bg-yellow-50 z-20 rounded-t-2xl"
        ></div>
        <div class="absolute bottom-0 left-0 h-2 w-full bg-white z-10"></div>
      </div>
      <div class="last-tab w-12 bg-slate-50 z-20"></div>
    </div>

    <div class="flex gap-5 justify-center items-center px-6">
      <div
        class="flex items-center justify-end w-full h-full gap-4 bg-gray-50 rounded-lg"
      >
        <span class="font-medium truncate">{{
          $t('v1.view.onboarding.employees')
        }}</span>
        <ShadcnSelectPopper
          v-model="SELECTED_EMPLOYEES"
          :options="EMPLOYEES"
          :placeholder="$t('v1.view.onboarding.select_employee')"
          width="180px"
        />
      </div>
      <div
        class="flex items-center justify-end w-full h-full gap-4 bg-gray-50 rounded-lg"
      >
        <span class="font-medium">{{ $t('v1.view.onboarding.month') }}</span>
        <ShadcnSelectPopper
          v-model="SELECTED"
          :options="MONTHS"
          :placeholder="$t('v1.view.onboarding.select_month')"
          width="180px"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ShadcnSelectPopper from '@/components/Select/ShadcnSelectPopper.vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
/** Hàm dịch i18n */
const { t: $t } = useI18n()

const props = defineProps<{
  active_index: number
  tabs: string[]
}>()

const emit = defineEmits<{
  (e: 'change-tab', index: number): void
}>()

function selectTab(index: number) {
  emit('change-tab', index)
}
/** Các option chọn tháng */
const MONTHS = [
  { value: '1', label: $t('v1.view.main.dashboard.org.pay.upgrade._1_month') },
  { value: '3', label: $t('v1.view.main.dashboard.org.pay.upgrade._3_months') },
  { value: '6', label: $t('v1.view.main.dashboard.org.pay.upgrade._6_months') },
  { value: '9', label: $t('v1.view.main.dashboard.org.pay.upgrade._9_months') },
  {
    value: '12',
    label: $t('v1.view.main.dashboard.org.pay.upgrade._12_months'),
  },
  {
    value: '15',
    label: $t('v1.view.main.dashboard.org.pay.upgrade._15_months'),
  },
  {
    value: '18',
    label: $t('v1.view.main.dashboard.org.pay.upgrade._18_months'),
  },
  {
    value: '21',
    label: $t('v1.view.main.dashboard.org.pay.upgrade._21_months'),
  },
  {
    value: '24',
    label: $t('v1.view.main.dashboard.org.pay.upgrade._24_months'),
  },
  {
    value: '27',
    label: $t('v1.view.main.dashboard.org.pay.upgrade._27_months'),
  },
  {
    value: '30',
    label: $t('v1.view.main.dashboard.org.pay.upgrade._30_months'),
  },
  {
    value: '33',
    label: $t('v1.view.main.dashboard.org.pay.upgrade._33_months'),
  },
  {
    value: '36',
    label: $t('v1.view.main.dashboard.org.pay.upgrade._36_months'),
  },
]
/** các option nhân viên */
const EMPLOYEES = [
  { value: '1', label: '1' },
  {
    value: '2to5',
    label: '2 - 5',
  },
  {
    value: '6to10',
    label: '6 - 10',
  },
  {
    value: '11to25',
    label: '11 - 25',
  },
  {
    value: '26to50',
    label: '26 - 50',
  },
  {
    value: '51to200',
    label: '51 - 200',
  },
  {
    value: '201to1000',
    label: '201 - 1,000',
  },
  {
    value: 'over1000',
    label: '1,001+',
  },
]
/** giá trị mặc định */
const SELECTED = ref('12')
/** giá trị lựa chọn nhân viên */
const SELECTED_EMPLOYEES = ref('11to25')
</script>
