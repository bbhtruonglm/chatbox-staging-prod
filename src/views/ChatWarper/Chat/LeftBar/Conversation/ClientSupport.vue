<template>
  <div class="flex items-center justify-between">
    <div class="flex min-w-1 flex-grow items-center gap-1 overflow-hidden">
      <img
        v-if="source?.last_message_type === 'page'"
        v-tooltip="$t('v1.view.main.dashboard.chat.action.has_reply')"
        class="h-3 w-3 flex-shrink-0"
        src="@/assets/icons/reply.svg"
      />
      <div class="flex h-[18px] w-full items-center gap-1 overflow-x-auto scroll-hidden">
        <Label
          v-for="label_id of getPreviewLabel()"
          :page_id="source?.fb_page_id"
          :label_id="label_id"
          class="shrink-0"
        />
      </div>
    </div>
    <div class="flex flex-shrink-0 items-center gap-1">
      <img
        v-if="setting_conversation.is_phone_icon && source?.client_phone"
        v-tooltip.bottom="source?.client_phone"
        src="@/assets/icons/phone.svg"
        class="h-3 w-3"
      />
      <template
        v-if="
          setting_conversation.is_page_source_icon &&
          (isFindUid() || source?.client_bio?.fb_uid)
        "
      >
        <Loading
          v-if="isFindUid()"
          v-tooltip.bottom="
            $t('v1.view.main.dashboard.chat.extension.findding_uid')
          "
          :size="12"
        />
        <img
          v-else
          v-tooltip.bottom="`Uid: ${source?.client_bio?.fb_uid}`"
          src="@/assets/icons/id.svg"
          class="h-3 w-3"
        />
      </template>
      <SparklesIcon
        v-if="
          setting_conversation.is_ai_icon &&
          calcStatus?.(source) &&
          getPageInfo(source?.fb_page_id)?.is_active_ai_agent
        "
        class="size-3"
        v-tooltip.bottom="$t('AI đang bật')"
      />
      <div
        v-if="setting_conversation.is_page_source_icon"
        v-tooltip.bottom="$t('v1.common.' + getPageInfo(source?.fb_page_id)?.type?.toLowerCase() as string)"
      >
        <PageTypeIcon
          :page_type="source?.platform_type"
          class="size-3 flex-shrink-0"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { composableService } from '@/views/ChatWarper/Chat/CenterContent/UserInfo/ChatbotStatus/service'
import { getLabelValid, getPageInfo } from '@/service/function'
import { storeToRefs } from 'pinia'
import { useChatbotUserStore, useExtensionStore } from '@/stores'

import Label from '@/views/ChatWarper/Chat/LeftBar/Conversation/Label.vue'
import Loading from '@/components/Loading.vue'
import PageTypeIcon from '@/components/Avatar/PageTypeIcon.vue'

import { SparklesIcon } from '@heroicons/vue/24/solid'

import type { ConversationInfo } from '@/service/interface/app/conversation'

const $props = withDefaults(
  defineProps<{
    source?: ConversationInfo
  }>(),
  {}
)

const extensionStore = useExtensionStore()
const chatbotUserStore = useChatbotUserStore()
const { setting_conversation } = storeToRefs(chatbotUserStore)

/** logic bật/tắt bot */
const { calcStatus } = composableService(true)

/**kiểm tra xem có đang tìm uid không */
function isFindUid() {
  /** chỉ loading tìm uid với hội thoại Facebook */
  if ($props.source?.platform_type !== 'FB_MESS') return false

  // nếu không có key thì dừng
  if (!$props.source?.data_key) return false

  // trả về trạng thái tìm uid
  return extensionStore.is_find_uid[$props.source?.data_key]
}
/**lấy toàn bộ label */
function getPreviewLabel() {
  return getLabelValid($props.source?.fb_page_id, $props.source?.label_id)
}
</script>
