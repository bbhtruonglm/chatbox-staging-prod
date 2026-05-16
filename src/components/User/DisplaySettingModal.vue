<template>
  <BaseModal
    ref="base_modal"
    class_modal="max-h-[90dvh] gap-2 bg-glass p-2 text-sm"
    class_close="rounded-lg bg-slate-100"
    :class_body="`rounded-lg flex flex-col gap-2 ${view_setting ? 'w-[1080px]' : 'w-[400px]'}`"
    class_footer="flex justify-end"
  >
    <template #body>
      <header class="flex items-center justify-between">
        <p class="text-base font-medium">{{ $t('Thiết lập giao diện') }}</p>
        <button
          class="rounded-lg theme-active p-1.5"
          @click="toggleModal()"
        >
          <XIcon class="size-4" />
        </button>
      </header>

      <div
        v-if="!view_setting"
        class="space-y-2 theme-card rounded-lg p-2"
      >
        <p class="font-medium text-slate-500">{{ $t('Chung') }}</p>
        <div class="flex items-center gap-2 px-4 py-2">
          <p class="font-medium w-full">{{ $t('Chế độ') }}</p>
          <select 
            class="bg-transparent rounded-md border border-slate-200 p-1.5"
            :value="display_setting.mode"
            @change="updateModeTheme"
          >
            <option value="LIGHT" class="text-black">{{ $t('Sáng') }}</option>
            <!-- <option value="DARK" class="text-black">{{ $t('Tối') }}</option>
            <option value="AUTO" class="text-black">{{ $t('Tự động') }}</option> -->
          </select>
        </div>
        <p class="font-medium text-slate-500">{{ $t('Tin nhắn') }}</p>
        <div class="flex flex-col gap-2">
          <div
            class="flex w-full items-center gap-2 theme-card-secondary rounded-md px-3 py-2 cursor-pointer"
            @click="view_setting = 'MESSAGE_THEME'"
          >
            <div class="rounded-md border theme-card-secondary p-2">
              <PaintbrushIcon class="size-4" />
            </div>
            <p class="font-medium">{{ $t('Giao diện') }}</p>
          </div>
          <div
            class="flex w-full items-center gap-2 theme-card-secondary rounded-md px-3 py-2 "
          >
            <div class="rounded-md border theme-card-secondary p-2">
              <CircleUserIcon class="size-4" />
            </div>
            <p class="font-medium flex-1 truncate">Hiện avatar trang ở ô nhập tin nhắn</p>
            <Toggle
              class_toggle="peer-checked:!bg-green-500"
              v-model="display_setting.is_show_page_avatar"
            />
          </div>
        </div>
        <p class="font-medium text-slate-500">{{ $t('Hội thoại') }}</p>
        <ConversationSettingDisplay />
      </div>

      <div
        v-else-if="view_setting === 'MESSAGE_THEME'"
        class="flex flex-col gap-2 rounded-lg theme-card-secondary p-3"
      >
        <button
          class="flex cursor-pointer items-center gap-2"
          @click="view_setting = ''"
        >
          <span class="rounded-lg theme-active p-1.5">
            <ArrowLeftIcon class="size-4" />
          </span>

          <p class="font-medium">{{ $t('Quay lại') }}</p>
        </button>

        <MessageSettingTheme />
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BaseModal from '@/components/Base/BaseModal.vue'
import ConversationSettingDisplay from '@/components/User/MessageSettingTheme/ConversationSettingDisplay.vue'
import MessageSettingTheme from '@/components/User/MessageSettingTheme/MessageSettingTheme.vue'

import {
  ArrowLeftIcon,
  CircleUserIcon,
  PaintbrushIcon,
  XIcon
} from 'lucide-vue-next'
import { useCommonStore } from '@/stores'
import Toggle from '../Toggle.vue'

// store
const { display_setting } = useCommonStore()

/** modal hiển thị cài đặt giao diện */
const base_modal = ref<InstanceType<typeof BaseModal>>()

/** tab hiển thị cài đặt */
const view_setting = ref<'MESSAGE_THEME' | ''>('')

/** mở modal */
function toggleModal() {
  base_modal.value?.toggleModal()
}

/** hàm cập nhật mode theme */
function updateModeTheme(e: Event) {
  /** input của event */
  const TARGET = e.target as HTMLSelectElement
  /** giá trị đã được chọn */
  const VALUE = TARGET.value as 'LIGHT' | 'DARK'
  /** cập nhật mode theme */
  display_setting.mode = VALUE

  // nếu giá trị là LIGHT thì khởi tạo vị trí default cho pattern và background
  if (VALUE === 'LIGHT') {
    display_setting.background_index = 6
    display_setting.pattern = 'pattern-light-1'
    display_setting.pattern_opacity = 30
  } else {
    display_setting.background_index = 0
  }
}

defineExpose({ toggleModal })
</script>
