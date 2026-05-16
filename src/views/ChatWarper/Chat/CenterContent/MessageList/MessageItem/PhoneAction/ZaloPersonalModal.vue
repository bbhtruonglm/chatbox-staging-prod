<template>
  <Modal
    ref="modal_widget_ref"
    class_modal="w-[432px]"
    :class_body="`flex gap-2 ${
      view === 'SEARCH' || !view ? 'h-96' : 'h-[80dvh]'
    }`"
  >
    <template #header>
      {{
        view === 'SEARCH' ? $t('Thêm khách hàng') : $t('Hội thoại Zalo cá nhân')
      }}
    </template>
    <template #body>
      <ZaloPeronalCore
        v-model:view="view"
        :page_id="$props.message?.fb_page_id || ''"
        :actual_client_id="$props.message?.fb_client_id || ''"
        :actual_page_id="$props.message?.fb_page_id || ''"
        :message_id="$props.message?._id || ''"
        :phone="$props.message?.client_phone || ''"
      />
    </template>
  </Modal>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import Modal from '@/components/Modal.vue'

import type { MessageInfo } from '@/service/interface/app/message'
import ZaloPeronalCore from '@/views/ZaloPeronalCore.vue'

const $props = withDefaults(
  defineProps<{
    /**dữ liệu tin nhắn */
    message?: MessageInfo
  }>(),
  {}
)

/**ref của modal kết nối nền tảng */
const modal_widget_ref = ref<InstanceType<typeof Modal>>()

/** màn hiển thị */
const view = ref<'SEARCH' | 'CHAT' | 'FRIEND_REQUEST' | ''>('')

/**ẩn hiện modal của component */
function toggleModal() {
  view.value = ''
  modal_widget_ref.value?.toggleModal()
}

// cung cấp hàm toggle modal cho component cha
defineExpose({ toggleModal })
</script>
