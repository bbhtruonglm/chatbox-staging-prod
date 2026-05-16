<template>
  <div class="relative flex-shrink-0">
    <ClientAvatar
      :conversation="source"
      class="w-10 h-10"
    />
    <PageAvatar
      v-tooltip.bottom="getPageName(getPageInfo(source?.fb_page_id))"
      :page_info="getPageInfo(source?.fb_page_id)"
      :class="controlPageAvatarVisible()"
      class="w-5 h-5 absolute -bottom-1 -right-1"
    />
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useChatbotUserStore } from '@/stores'
import { getPageInfo, getPageName } from '@/service/function'

import ClientAvatar from '@/components/Avatar/ClientAvatar.vue'
import PageAvatar from '@/components/Avatar/PageAvatar.vue'

import type { ConversationInfo } from '@/service/interface/app/conversation'
/** Props */
const $props = withDefaults(
  defineProps<{
    source?: ConversationInfo
    is_hide_page_avatar?: boolean
  }>(),
  {}
)

/** user store */
const chatbotUserStore = useChatbotUserStore()
const { setting_conversation } = storeToRefs(chatbotUserStore)

/** kiểm soát hiển thị avatar page */
function controlPageAvatarVisible() {
  // nếu không hiển thị avatar page thì ẩn
  if (!setting_conversation.value.is_page_icon) return 'hidden'
}
</script>
