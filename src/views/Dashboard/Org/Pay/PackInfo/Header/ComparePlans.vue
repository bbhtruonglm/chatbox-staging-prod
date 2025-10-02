<template>
  <div class="flex flex-col gap-5">
    <h2
      class="text-3xl font-medium text-center pt-5 flex justify-center gap-2.5 items-center"
      @click="toggleAll"
    >
      {{ data.title }}
      <ChevronDownIcon
        class="size-7 transition-transform duration-200"
        :class="open_all ? 'rotate-180' : ''"
      />
    </h2>

    <div
      v-show="open_all"
      class="overflow-y-auto bg-white rounded-xl"
    >
      <!-- Header -->
      <!-- class="grid font-semibold top-10 z-50 sticky" -->
      <div
        class="grid font-semibold sticky top-0 bg-white z-20 shadow-sm"
        :style="{ gridTemplateColumns: GRID_COLS }"
      >
        <div class="p-3 text-left"></div>
        <div
          v-for="(plan, planIdx) in data.plans"
          :key="plan.key"
          @click="onPlanClick(plan.name)"
          class="p-3 text-center cursor-pointer flex justify-center text-2xl rounded-t-xl"
          :class="[
            plan.name === selected_plan_index
              ? 'bg-gray-50 font-bold '
              : 'font-semibold',
          ]"
        >
          <div class="flex items-center gap-2">
            <div
              class="flex size-6 rounded-full justify-center items-center flex-shrink-0"
              :class="[
                plan.name === selected_plan_index
                  ? 'bg-cyan-600'
                  : 'bg-gray-400',
              ]"
            >
              <div
                class="flex bg-white rounded-full justify-center items-center"
                :class="[
                  plan.name !== selected_plan_index
                    ? 'bg-cyan-600'
                    : 'bg-gray-400',
                ]"
              >
                <CheckCircleIcon
                  class="size-5 text-cyan-600"
                  :class="[
                    plan.name !== selected_plan_index ? 'text-white' : '',
                  ]"
                />
              </div>
            </div>
            {{ plan.name }}
          </div>
        </div>
      </div>

      <!-- Sections -->
      <div
        v-for="(section, sectionIdx) in data.sections"
        :key="section.title"
      >
        <!-- Section row (grid) -->
        <div
          class="grid font-semibold text-2xl text-gray-800"
          :style="{ gridTemplateColumns: GRID_COLS }"
        >
          <!-- Cột feature name -->
          <div class="pt-5">
            {{ section.title }}
          </div>
          <!-- Cột tương ứng với mỗi gói -->
          <div
            v-for="(plan, planIdx) in data.plans"
            :key="plan.key + section.title"
            class="p-3 text-center"
            :class="plan.name === selected_plan_index ? 'bg-gray-50' : ''"
          >
            <!-- để màu nền tương ứng với gói -->
          </div>
        </div>

        <div
          v-for="(feature, idx) in section.features"
          :key="section.title + idx"
          class="grid items-center border-b border-slate-200 cursor-pointer"
          :class="
            isRowSelected(sectionIdx, idx) ? 'bg-gray-50' : 'hover:bg-gray-50'
          "
          :style="{ gridTemplateColumns: GRID_COLS }"
          @click="onRowClick(sectionIdx, idx)"
        >
          <!-- Feature name cell -->
          <div class="p-3 flex justify-between items-center text-sm">
            <span>
              {{ feature.name }}
            </span>
            <InformationCircleIcon class="size-4 text-slate-400" />
          </div>

          <!-- Each plan cell -->
          <div
            v-for="(plan, planIdx) in data.plans"
            :key="plan.key + idx"
            class="p-3 flex justify-center items-center w-full text-sm"
            :class="plan.name === selected_plan_index ? 'bg-gray-50' : ''"
          >
            <template v-if="feature.values[plan.key] === true">
              <span class="text-slate-800 text-center">
                <CheckIcon class="size-5" />
              </span>
            </template>
            <template v-else-if="feature.values[plan.key]">
              {{ feature.values[plan.key] }}
            </template>
            <template v-else>
              <span class="text-gray-400">-</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
} from '@heroicons/vue/24/solid'
import { InformationCircleIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

/** Kiểu dữ liệu plans */
interface Plan {
  /** key của plans */
  key: string
  /** Tên của plans */
  name: string
}
/** Kiểu dữ liệu chức năng */
interface Feature {
  /** Tên của tính năng */
  name: string
  /** Giá trị features */
  values: Record<string, string | number | boolean | null | undefined>
}
/** Kiểu dữ liệu section */
interface Section {
  /** Title section */
  title: string
  /** chức năng */
  features: Feature[]
}
/** Kiểu dữ liệu Data phần compare plans & feature */
interface CompareData {
  /** Title của plan */
  title: string
  /** Data plan */
  plans: Plan[]
  /** data section */
  sections: Section[]
}

/** mặc định hiện */
const open_all = ref(true)
/** Hàm bật tắt content */
const toggleAll = () => {
  open_all.value = !open_all.value
}
/** Selected row kiểu object để phân biệt theo section */
type SelectedRow = { sectionIndex: number; rowIndex: number } | null

/** Định nghĩa props */
const props = defineProps<{
  /** Dữ liệu */
  data: CompareData
  /** gói được highlight (ở bạn dùng plan.name so sánh) */
  selected_plan_index?: string
  /** giờ là object {sectionIndex, rowIndex} */
  selected_row?: SelectedRow
}>()

/** Khai báo hàm emit để component con phát sự kiện 'rowSelect' kèm {sectionIndex,rowIndex} cho cha */
// Phát sự kiện: emit('rowSelect', { sectionIndex: number, rowIndex: number })
const emit = defineEmits<{
  (e: 'rowSelect', payload: { sectionIndex: number; rowIndex: number }): void
  (e: 'planSelect', payload: string): void // emit khi chọn plan
}>()

/** tạo call  */
const GRID_COLS = `416px repeat(${props.data.plans.length}, minmax(120px,1fr))`

/** helper: kiểm tra row đang được chọn (theo section) */
function isRowSelected(sectionIdx: number, rowIdx: number) {
  /** Trả về trạng thái row select*/
  return (
    props.selected_row?.sectionIndex === sectionIdx &&
    props.selected_row?.rowIndex === rowIdx
  )
}

/** on click row -> emit payload có sectionIndex & rowIndex
 * @param sectionIndex
 * @param rowIdx
 */
function onRowClick(sectionIdx: number, rowIdx: number) {
  /** Hàm emit select row */
  emit('rowSelect', { sectionIndex: sectionIdx, rowIndex: rowIdx })
}
/** click plan header
 * @param planKey
 */
function onPlanClick(planKey: string) {
  /** hàm emit plan select */
  emit('planSelect', planKey)
}
</script>
