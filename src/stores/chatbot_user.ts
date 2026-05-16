import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { saveIndexedDB, getIndexedDB } from '@/service/helper/store'
import { getItem, setItem } from '@/service/helper/localStorage'
import { saveLocal, getLocal } from '@/service/helper/store'

import type {
  ChatbotUserInfo,
  PersonalSettings,
  SettingConversation,
  SettingConversationLabelType,
} from '@/service/interface/app/chatbot_user'
import { N4SerivceAppUser } from '@/utils/api/N4Service/User'
import { toastError } from '@/service/helper/alert'

/** default setting conversation */
const DEFAULT_SETTING_CONVERSATION: SettingConversation = {
  is_page_icon: true,
  is_staff_icon: true,
  is_page_source_icon: true,
  is_phone_icon: true,
  is_ai_icon: true,
  type_label: 'FULL',
}

/** normalize setting conversation */
function normalizeSettingConversation(
  setting?: Partial<SettingConversation>
): SettingConversation {
  return {
    ...DEFAULT_SETTING_CONVERSATION,
    ...setting,
  }
}

/**lưu trữ các dữ liệu liên quan đến user hiện tại đang đăng nhập */
export const useChatbotUserStore = defineStore('chatbot_user_store', () => {
  /** api user */
  const $user_api = new N4SerivceAppUser()

  /** ------------ STAGE ----------- */
  /**lưu dữ liệu của user hiện tại đang đăng nhập */
  const chatbot_user = ref<ChatbotUserInfo>()

  // * đọc dữ liệu được lưu ở indexeddb
  getIndexedDB('chatbot_user', undefined, (e, r) => (chatbot_user.value = r))

  /** ghi đè lại setting của page */
  const personal_settings = ref<PersonalSettings>(
    getLocal('personal_settings', {
      is_enable_personal_setting: false,
      is_hide_page_avatar: false,
      display_label_type: 'ICON_TOOLTIP',
    })
  )

  // lưu dữ liệu xuống local khi có thay đổi
  saveLocal(personal_settings, 'personal_settings')

  // lưu dữ liệu xuống indexed khi có thay đổi
  saveIndexedDB(chatbot_user, 'chatbot_user')

  /** setting conversation */
  const setting_conversation = computed(() =>
    normalizeSettingConversation(chatbot_user.value?.user_info?.setting_conversation)
  )

  /** hiển thị nhãn hội thoại */
  const conversation_label_display_mode =
    computed<SettingConversationLabelType>(() =>
      setting_conversation.value.type_label
    )

  /** ------------ GETTER ----------- */
  /**đọc id của nhân viên hiện tại đang đăng nhập */
  function getStaffId() {
    return chatbot_user.value?.user_id || chatbot_user.value?.fb_staff_id
  }

  /** cập nhật setting conversation */
  function patchSettingConversation(next_setting: SettingConversation) {
    // * kiểm tra user có tồn tại không
    if (!chatbot_user.value) return

    // * cập nhật setting conversation
    chatbot_user.value = {
      ...chatbot_user.value,
      user_info: {
        ...chatbot_user.value.user_info,
        setting_conversation: next_setting,
      },
    }
  }

  /** ------------ ACTION ----------- */
  /**có phải là thành viên của bbh không */
  function isBbhMember(): boolean {
    return ['ADMIN', 'MEMBER', 'AFFILIATE'].includes(
      chatbot_user.value?.role || ''
    )
  }

  /** cập nhật setting conversation */
  async function updateSettingConversation(
    patch: Partial<SettingConversation>
  ) {
    // * kiểm tra user có tồn tại không
    if (!chatbot_user.value) return

    // * lấy setting conversation trước đó
    const PREVIOUS_SETTING = normalizeSettingConversation(
      chatbot_user.value.user_info?.setting_conversation
    )

    // * cập nhật setting conversation
    const NEXT_SETTING = normalizeSettingConversation({
      ...PREVIOUS_SETTING,
      ...patch,
    })

    // * cập nhật setting conversation
    patchSettingConversation(NEXT_SETTING)

    try {
      // * gọi api cập nhật setting conversation
      await $user_api.updateUserInfo({
        setting_conversation: NEXT_SETTING,
      })
    } catch (e) {
      // * cập nhật lại setting conversation trước đó
      patchSettingConversation(PREVIOUS_SETTING)
      toastError(e)
    }
  }

  /** cập nhật hiển thị nhãn hội thoại */
  async function updateConversationLabelDisplayMode(
    mode: SettingConversationLabelType
  ) {
    await updateSettingConversation({
      type_label: mode,
    })
  }

  return {
    chatbot_user,
    personal_settings,
    setting_conversation,
    conversation_label_display_mode,

    getStaffId,
    isBbhMember,
    updateSettingConversation,
    updateConversationLabelDisplayMode,
  }
})
