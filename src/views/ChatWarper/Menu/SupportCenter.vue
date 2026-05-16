<template>
  <Dropdown
    ref="dropdown_ref"
    :is_fit="false"
    width="354px"
    height="75dvh"
    max_height="auto"
    position="RIGHT"
    class_content="!p-0 !bg-white !border-0 !rounded-lg overflow-hidden"
  >
    <div class="relative flex flex-col h-full gap-2 p-3">
      <XIcon class="absolute top-2 right-2 cursor-pointer"
        @click="dropdown_ref?.toggleDropdown"
      />
      <p class="text-xl font-semibold">
        {{ $t('Trung tâm hỗ trợ khách hàng') }}
      </p>
      <div class="h-full rounded-xl overflow-hidden">
        <iframe
      :src="support_center_url"
      title="Support Center"
      class="h-full w-full border-0"
      allow="clipboard-write"
    />
      </div>
    </div>
  </Dropdown>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getItem } from '@/service/helper/localStorage'
import { useChatbotUserStore } from '@/stores'

import Dropdown from '@/components/Dropdown.vue'
import { XIcon } from 'lucide-vue-next'

/** domain của support center */
const SUPPORT_CENTER_URL = 'https://cs.retion.ai/'

/** page_id của page hỗ trợ */
const SUPPORT_CENTER_PAGE_ID = '794843540615423'

const chatbotUserStore = useChatbotUserStore()

const { locale } = useI18n()

/** tham chiếu tới component Dropdown */
const dropdown_ref = ref<InstanceType<typeof Dropdown>>()

/** link iframe hỗ trợ */
const support_center_url = computed(() => {
  /** thông tin người dùng hiện tại */
  const USER = chatbotUserStore.chatbot_user

  /** tạo params */
  const PARAMS = new URLSearchParams({
    page_id: SUPPORT_CENTER_PAGE_ID,
    from: 'parent-app',
    user_name: USER?.full_name || '',
    client_id: USER?.user_id || USER?.fb_staff_id || '',
    user_phone: '',
    user_email: USER?.email || '',
    token_user: getItem('access_token') || '',
    locale: locale.value,
  })

  return `${SUPPORT_CENTER_URL}?${PARAMS.toString()}`
})

defineExpose({
  dropdown_ref,
})
</script>
