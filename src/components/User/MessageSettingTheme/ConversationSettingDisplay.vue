<template>
  <div class="flex items-center gap-3 rounded-xl theme-active p-2 shadow-sm">
    <div class="relative size-11 shrink-0">
      <img
        :src="IMG_AVATAR_URL"
        class="size-full rounded-oval object-cover"
      />
      <div
        v-if="setting_conversation.is_page_icon"
        class="absolute -bottom-1 -right-1"
      >
        <img
          src="@/assets/imgs/chatbox.svg"
          class="size-4 object-cover"
          alt=""
        />
      </div>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-0.5">
          <img
            v-if="setting_conversation.is_staff_icon"
            :src="IMG_AVATAR_URL"
            class="size-4 shrink-0 rounded-full object-cover"
          />
          <ChevronRightIcon
            v-if="setting_conversation.is_staff_icon"
            class="size-4 shrink-0 text-slate-500"
          />
          <p class="truncate">{{ $t('Tên khách hàng') }}</p>
        </div>
        <span class="shrink-0 text-xs">11 {{ $t('giờ trước') }}</span>
      </div>

      <div class="mb-0.5 flex items-center justify-between">
        <p class="truncate text-xs text-slate-500">{{ $t('Nội dung tin nhắn') }}</p>
        <p
          class="flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white"
        >
          1
        </p>
      </div>

      <div class="flex items-end justify-between gap-3">
        <div
          v-if="show_preview_labels"
          class="flex min-w-0 flex-1 flex-wrap gap-1"
        >
          <span
            v-for="label in PREVIEW_LABELS"
            :key="label.title"
            :style="{ background: label.color }"
            :class="
              is_icon_label_mode
                ? 'size-2.5 rounded-full'
                : 'rounded-md px-1 text-[9px] text-white'
            "
            class="shrink-0"
          >
            <template v-if="!is_icon_label_mode">
              {{ label.title }}
            </template>
          </span>
        </div>
        <div
          v-else
          class="flex-1"
        />

        <div class="flex shrink-0 items-center gap-1">
          <img
            v-if="setting_conversation.is_phone_icon"
            src="@/assets/icons/phone.svg"
            class="size-3"
          />
          <img
            v-if="setting_conversation.is_page_source_icon"
            src="@/assets/icons/id.svg"
            class="size-3"
          />
          <SparklesIcon
            v-if="setting_conversation.is_ai_icon"
            class="size-3"
          />
          <FacebookIcon
            v-if="setting_conversation.is_page_source_icon"
            class="size-3"
          />
        </div>
      </div>
    </div>
  </div>

  <div class="space-y-1">
    <div
      v-for="option in OPTION_SHOW_CONVERSATION"
      :key="option.key"
      class="flex items-center justify-between gap-3 rounded-lg p-2 theme-hover"
    >
      <div class="flex min-w-0 items-center gap-2">
        <div class="rounded-md border p-1">
          <component
            :is="option.icon"
            class="size-4"
          />
        </div>
        <p class="font-medium">{{ option.label }}</p>
      </div>

      <Toggle
        :model-value="setting_conversation[option.key]"
        class_toggle="peer-checked:!bg-green-500"
        @update:model-value="handleToggleConversationOption(option.key, $event)"
      />
    </div>

    <div
      class="flex items-center justify-between gap-3 rounded-lg p-2 theme-hover"
    >
      <div class="flex min-w-0 items-center gap-2">
        <div class="rounded-md border p-1">
          <TagIcon class="size-4" />
        </div>
        <p class="font-medium">{{ $t('Nhãn') }}</p>
      </div>

      <div class="relative">
        <button
          class="flex items-center justify-end gap-1"
          @click="label_display_mode_dropdown_ref?.toggleDropdown($event)"
        >
          <span class="truncate">{{ current_label_display_mode_label }}</span>
          <ChevronDownIcon class="size-4 shrink-0" />
        </button>

        <Dropdown
          ref="label_display_mode_dropdown_ref"
          width="300px"
          height="auto"
          :is_fit="false"
          position="BOTTOM"
          class_container="z-50"
          class_content="flex flex-col gap-1 rounded-md border p-1"
        >
          <button
            v-for="option in LABEL_DISPLAY_MODE_OPTIONS"
            :key="option.value"
            class="flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left text-sm theme-hover"
            :class="{
              'theme-active-secondary font-medium':
                conversation_label_display_mode === option.value,
            }"
            @click="handleSelectLabelDisplayMode(option.value)"
          >
            <p>{{ option.label }}</p>
            <p class="text-xs text-slate-500">{{ option.description }}</p>
          </button>
        </Dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Component } from 'vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Dropdown from '@/components/Dropdown.vue'
import FacebookIcon from '@/components/Icons/Facebook.vue'
import Toggle from '@/components/Toggle.vue'
import { useChatbotUserStore } from '@/stores'

import {
  FlagIcon,
  PhoneIcon,
  SparklesIcon,
  TagIcon,
  UserIcon,
} from '@heroicons/vue/24/solid'
import { ChevronDownIcon, ChevronRightIcon, LinkIcon } from 'lucide-vue-next'

import type { SettingConversation, SettingConversationLabelType } from '@/service/interface/app/chatbot_user'

/** key của toggle conversation */
type ConversationToggleKey =
  | 'is_page_icon'
  | 'is_staff_icon'
  | 'is_page_source_icon'
  | 'is_ai_icon'
  | 'is_phone_icon'

/** link ảnh đại diện khách hàng mặc định */
const IMG_AVATAR_URL = `${$env.img_host}/1111111111?width=40&height=40`

/** các nhãn mẫu */
const PREVIEW_LABELS = [
  { title: 'Lead', color: '#B91C1C' },
  { title: 'Nhãn 1', color: '#A21CAF' },
  { title: 'Nhãn 4', color: '#4D7C0F' },
]

const {t: $t} = useI18n()

/** các tùy chọn hiển thị cuộc trò chuyện */
const OPTION_SHOW_CONVERSATION: {
  key: ConversationToggleKey
  label: string
  icon: Component
}[] = [
  {
    key: 'is_page_icon',
    label: $t('Biểu tượng trang'),
    icon: FlagIcon,
  },
  {
    key: 'is_staff_icon',
    label: $t('Biểu tượng nhân viên'),
    icon: UserIcon,
  },
  {
    key: 'is_page_source_icon',
    label: $t('Biểu tượng nguồn trang'),
    icon: LinkIcon,
  },
  {
    key: 'is_ai_icon',
    label: $t('Biểu tượng AI'),
    icon: SparklesIcon,
  },
  {
    key: 'is_phone_icon',
    label: $t('Biểu tượng điện thoại'),
    icon: PhoneIcon,
  },
]

/** các chế độ hiển thị nhãn */
const LABEL_DISPLAY_MODE_OPTIONS: {
  value: SettingConversationLabelType
  label: string
  description: string
}[] = [
  { value: 'NOT_SHOW', label: $t('Không hiện'), description: $t('Không hiện thẻ') },
  {
    value: 'TOOLTIP',
    label: $t('Biểu tượng màu'),
    description: $t('Chỉ hiện biểu tượng, không hiện chữ'),
  },
  {
    value: 'FULL',
    label: $t('Đầy đủ'),
    description: $t('Hiện đầy đủ chữ và màu nền'),
  },
]

/** store */
const chatbotUserStore = useChatbotUserStore()
const { conversation_label_display_mode, setting_conversation } =
  storeToRefs(chatbotUserStore)

/** ref tới dropdown hiển thị chế độ hiển thị nhãn */
const label_display_mode_dropdown_ref = ref<InstanceType<typeof Dropdown>>()

/** nhãn của chế độ hiển thị nhãn */
const current_label_display_mode_label = computed(() => {
  /** tìm nhãn của chế độ hiển thị nhãn */
  const LABEL_DISPLAY_MODE = LABEL_DISPLAY_MODE_OPTIONS.find(option => {
    return option.value === conversation_label_display_mode.value
  })

  return LABEL_DISPLAY_MODE?.label || LABEL_DISPLAY_MODE_OPTIONS[0].label
})

/** hiển thị nhãn */
const show_preview_labels = computed(
  () => conversation_label_display_mode.value !== 'NOT_SHOW',
)

/** chế độ hiển thị nhãn là icon */
const is_icon_label_mode = computed(
  () => conversation_label_display_mode.value === 'TOOLTIP',
)

/** handle select label display mode */
async function handleSelectLabelDisplayMode(
  value: SettingConversationLabelType,
) {
  // update chế độ hiển thị nhãn
  await chatbotUserStore.updateConversationLabelDisplayMode(value)
  // ẩn dropdown
  label_display_mode_dropdown_ref.value?.immediatelyHide()
}

/** handle toggle conversation option */
async function handleToggleConversationOption(
  key: ConversationToggleKey,
  value: boolean | undefined,
) {
  // update setting conversation
  await chatbotUserStore.updateSettingConversation({
    [key]: !!value,
  } as Partial<SettingConversation>)
}
</script>
