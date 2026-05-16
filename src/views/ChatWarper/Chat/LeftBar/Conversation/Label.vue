<template>
  <div
    v-tooltip.bottom="getILabel(page_id, label_id)?.title"
    v-if="
      conversation_label_display_mode !== 'NOT_SHOW' && getILabel(page_id, label_id)
    "
    :style="{ background: getILabel(page_id, label_id)?.bg_color }"
    :class="{
      'w-3 h-3 px-0': conversation_label_display_mode === 'TOOLTIP',
    }"
    class="min-w-7 max-w-14 w-auto truncate rounded-md px-1 text-xs- leading-4.5 text-white"
  >
    <template v-if="conversation_label_display_mode === 'FULL'">
      {{ getILabel(page_id, label_id)?.title }}
    </template>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { getILabel } from '@/service/function'
import { useChatbotUserStore } from '@/stores'

const $props = withDefaults(
  defineProps<{
    /**id trang */
    page_id?: string
    /**id nhãn */
    label_id: string
  }>(),
  {}
)

const chatbotUserStore = useChatbotUserStore()
const { conversation_label_display_mode } = storeToRefs(chatbotUserStore)
</script>
