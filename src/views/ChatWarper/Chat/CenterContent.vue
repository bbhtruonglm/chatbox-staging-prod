<template>
  <Theme
    v-if="chatbotUserStore.chatbot_user && orgStore.selected_org_info"
    id="chat__center-content"
    class="h-full flex flex-col flex-grow min-w-0 w-full rounded-e-2.5xl overflow-hidden"
    :pattern="commonStore.display_setting.pattern"
    :mode="commonStore.display_setting.mode"
    :background_index="commonStore.display_setting.background_index"
    :pattern_opacity="commonStore.display_setting.pattern_opacity"
  >
    <UserInfo
      :host="{
        media_cdn: 'https://cdn.botbanhang.vn',
        img_host: 'https://chatbox-static-v3.botbanhang.vn/app/facebook/avatar',
      }"
      v-model:conversation="conversationStore.select_conversation"
      v-model:is_loading_full_screen="commonStore.is_loading_full_screen"
      v-model:keyboard_shortcut="commonStore.keyboard_shortcut"
      v-model:is_find_client_info="extensionStore.is_find_client_info"
      v-model:force_update_client_info="extensionStore.force_update_client_info"
      v-model:conversation_list="conversationStore.conversation_list"
      :list_os="orgStore.list_os"
      :external_link="commonStore.partner?.external_link"
      :default_external_link="DEFAULT_EXTERNAL_LINK"
      :chatbot_user="chatbotUserStore.chatbot_user"
      :page_data="
        pageStore.getPage(conversationStore.select_conversation?.fb_page_id)
      "
      :extension_status="commonStore.extension_status"
      :is_find_uid="extensionStore.is_find_uid"
      :org_info="orgStore.selected_org_info"
      :is_loading="is_loading"
      :events="{
        resetRead,
        setAssignStaffConversation,
        manageChatbot,
        getCallHistory,
        getGroupMembers,
        toggleSpamConversation,
        readConversations,
        addMemberZalo,
        removeMemberZalo,
        countConversation,
        readClient,
        readEvent,
        editAttribute,
        getContact,
        createContact,
        updateContact,
        deleteContact,
        getConversation,
        updateClientName,
        updateInfoConversation,
        resetReadConversation,
      }"
    >
      <template #right-actions>
        <button
          class="lg+:hidden p-1.5 flex justify-center items-center rounded-lg theme-button-icon"
          @click="commonStore.show_right_pane = !commonStore.show_right_pane"
        >
          <PanelRightOpenIcon class="size-5" />
        </button>
      </template>
    </UserInfo>
    <ChatProvide :chat="chat">
      <MessageList
        :messages="messageStore.list_message"
        :conversation="conversationStore.select_conversation"
        :page_data="
          pageStore.getPage(conversationStore.select_conversation?.fb_page_id)
        "
        :org_info="orgStore.selected_org_info"
        :is_loading="is_loading_message"
        :is_loading_init="is_loading"
        :is_done="is_done"
        :host="{
          media_cdn: 'https://cdn.botbanhang.vn',
          img_host:
            'https://chatbox-static-v3.botbanhang.vn/app/facebook/avatar',
          proxy_video:
            'https://chatbox-static-v3.botbanhang.vn/cdn/proxy/video',
        }"
        :events="{
          loadMessage,
          openForwardModal,
          undoMessage,
          toggleComment,
          getReplyComment,
          openViewMessageModal,
          handleAction,
          sendReaction,
          openCallCenter,
          openZaloPersonalModal,
          canOpenZaloPersonal: () => !!pageStore.zlp_oss?.length,
        }"
      >
        <template #post>
          <FullPost />
        </template>
        <template #labels>
          <ListLabel
            v-if="conversationStore.select_conversation"
            :conversation="conversationStore.select_conversation"
            :page_data="
              pageStore.getPage(
                conversationStore.select_conversation?.fb_page_id,
              )
            "
          />
        </template>
      </MessageList>
      <InputChat
        :host="{
          media_cdn: 'https://cdn.botbanhang.vn',
        }"
        :is_show_page_avatar="commonStore.display_setting.is_show_page_avatar"
        :messages="list_message"
        :client_id="$route.query.user_id?.toString() || ''"
        :conversation="conversationStore.select_conversation"
        :extension_status="commonStore.extension_status"
        :list_os="orgStore.list_os"
        :map_list_message_by_id="messageStore.map_list_message_by_id"
        :chatbot_user="chatbotUserStore.chatbot_user"
        :page_data="
          pageStore.getPage(conversationStore.select_conversation?.fb_page_id)
        "
        :all_page_list="pageStore.all_page_list"
        :is_loading="is_loading"
        :events="{
          openPageSettingQuickAnswer,
          readAnswer,
          textTranslate: text_translate,
          genAnswer: gen_answer,
          isAdminOrg: orgStore.isAdminOrg,
          getGroupMembers,
          clearAiAnswer,
          sendMessage,
          sendComment,
          sendPrivateReply,
          sendReplyMessage,
          getUploadTempFileUrl,
          uploadTempFile,
          uploadTempFileV2,
          updateConversationList: (path: string[], value?: string) => {
            set(conversationStore.conversation_list, path, value)
          },
          readFileAlbum,
          readFolderAlbum,
          updateFolderAlbum,
          deleteFolderAlbum,
          createFolderAlbum,
          deleteFileAlbum,
          uploadFileAlbum,
        }"
      />
    </ChatProvide>
  </Theme>
  <template>
    <!-- <AttachmentViewModal /> -->
    <StaffReadModal />
    <ZaloPersonalModal
      :message="message_data"
      ref="modal_zalo_personal_ref"
    />
    <ZaloCreateGroup
      :message="message_data"
      ref="modal_zalo_create_group_ref"
    />
    <ZaloShareMessage
      :message="message_data"
      ref="modal_zalo_share_message_ref"
    />
    <Widget
      ref="modal_widget_ref"
      :selected_widget="selected_widget"
      :ai="selected_widget_ai"
    />
  </template>
</template>
<script setup lang="ts">
import {
  useChatbotUserStore,
  useCommonStore,
  useConversationStore,
  useExtensionStore,
  useMessageStore,
  useOrgStore,
  usePageStore,
  useZaloGroupMemberStore,
} from '@/stores'
import { ExternalSite } from '@/utils/helper/ExternalSite'
import { Parser } from '@/utils/helper/Parser'
import { storeToRefs } from 'pinia'
import { container } from 'tsyringe'
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  UserInfo,
  ChatProvide,
  createChat,
  InputChat,
  MessageList,
  Theme,
  triggerInputChatAiAnswer
} from '@bbhhainx/chat-core'
// import {
//   ChatProvide,
//   createChat,
//   InputChat,
//   MessageList,
//   Theme,
//   UserInfo,
//   triggerInputChatAiAnswer
// } from '@chat'
import { listenerEventBus } from '@/event'
import { gen_answer, text_translate } from '@/service/api/chatbox/ai'
import {
  read_message,
  reset_read_conversation,
  send_message,
  set_assign_staff_conversation,
  toggle_spam_conversation,
  undo_message,
  update_info_conversation,
} from '@/service/api/chatbox/n4-service'
import {
  create_folder_album,
  delete_file_album,
  delete_folder_album,
  read_file_album,
  read_folder_album,
  update_folder_album,
  upload_file_album,
} from '@/service/api/chatbox/n6-static'
import { getIframeUrl, getPageInfo, openNewTab } from '@/service/function'
import { toast, toastError } from '@/service/helper/alert'
import { copy } from '@/service/helper/format'
import { AiAppContact, AiAppOneContact, type ContactInfo } from '@/utils/api/Ai'
import { ChatbotAppClient, type ClientInfo } from '@/utils/api/Chatbot'
import { MerchantContact, type ICallHistory } from '@/utils/api/Merchant'
import { N13ZaloPersonal } from '@/utils/api/N13ZaloPersonal'
import { N4ServiceConversation } from '@/utils/api/N4Serivce'
import {
  N4SerivceAppConversation,
  N4SerivceAppMessage,
  N4SerivceAppOneConversation,
} from '@/utils/api/N4Service/Conversation'
import { N4SerivceAppPost } from '@/utils/api/N4Service/Post'
import { N6StaticAppUploadFileV2 } from '@/utils/api/N6StaticV2'
import { N9AnalyticAppAnalytic, type EventInfo } from '@/utils/api/N9Analytic'
import { QuickAnswer } from '@/utils/api/Widget'
import {
  BBH_CTA_PREFIX,
  CALL_CENTER_WIDGET_ID,
  CHAT_ACTION_TOAST_MESSAGE,
  CHAT_ACTION_TYPE,
  CTA_TYPE_TO_PAGE_CONFIG,
} from '@/views/ChatWarper/Chat/CenterContent/chatAction.constants'
import { remove, set, size, sortedIndexBy } from 'lodash'

import UserInfo2 from './CenterContent/UserInfo.vue'
import ListLabel from '@/views/ChatWarper/Chat/CenterContent/InputChat/ListLabel.vue'
import FullPost from '@/views/ChatWarper/Chat/CenterContent/MessageList/FullPost.vue'
import Widget from '@/views/ChatWarper/Chat/CenterContent/MessageList/MessageItem/MessageTemplate/Widget.vue'
import ZaloCreateGroup from '@/views/ChatWarper/Chat/CenterContent/MessageList/MessageItem/PhoneAction/ZaloCreateGroup.vue'
import ZaloPersonalModal from '@/views/ChatWarper/Chat/CenterContent/MessageList/MessageItem/PhoneAction/ZaloPersonalModal.vue'
import ZaloShareMessage from '@/views/ChatWarper/Chat/CenterContent/MessageList/MessageItem/PhoneAction/ZaloShareMessage.vue'
import SkeletonLoading from '@/views/ChatWarper/Chat/CenterContent/SkeletonLoading.vue'
import StaffReadModal from '@/views/ChatWarper/Chat/CenterContent/StaffReadModal.vue'

import { PanelRightOpenIcon } from 'lucide-vue-next'

import type {
  CreateFolderInput,
  FileInfo,
  FolderInfo,
  FromFile,
  GetFileInput,
  GetFolderInput,
  UpdateFileInfo,
  UpdateFolderInput,
} from '@/service/interface/app/album'
import type {
  ConversationInfo,
  FilterConversation,
  QueryConversationResponse,
  QueryUpdateInfoConversation,
} from '@/service/interface/app/conversation'
import type {
  MessageAiData,
  MessageInfo,
  SendMesageInputHorizontal,
} from '@/service/interface/app/message'
import type { AppInstalledInfo } from '@/service/interface/app/widget'
import type { MessageListActionPayload } from '@/views/ChatWarper/Chat/CenterContent/chatAction.types'
import type { Handler } from 'mitt'
import { N6StaticAppUploadFile, type Uploadtype } from '@/utils/api/N6Static'

/** các link ngoại vi mặc định trong môi trường */
const DEFAULT_EXTERNAL_LINK = $env.external_link

// props
defineProps<{
  /** có nên hiển thị skeleton loading ko */
  is_loading?: boolean
}>()

/** Khởi tạo trực tiếp instance API Zalo */
const API_ZALO = new N13ZaloPersonal('app/page/group')
const $n4_service_app_post = container.resolve(N4SerivceAppPost)
const $n4_service_app_conversation = container.resolve(N4SerivceAppConversation)
const $n4_service_app_message = container.resolve(N4SerivceAppMessage)
const $n6_static_app_upload_file_v2 = container.resolve(N6StaticAppUploadFileV2)
const $external_site = container.resolve(ExternalSite)
const $merchant_contact = container.resolve(MerchantContact)
/** state */
const messageStore = useMessageStore()
const {
  modal_zalo_share_message_ref,
  message_data,
  list_message,
  send_message_list,
  modal_zalo_personal_ref,
  modal_zalo_create_group_ref,
  upload_file_list
} = storeToRefs(messageStore)
const modal_widget_ref = ref<InstanceType<typeof Widget>>()
const selected_widget = ref<AppInstalledInfo>()
const selected_widget_ai = ref<MessageAiData>()

const conversationStore = useConversationStore()
const chatbotUserStore = useChatbotUserStore()
const orgStore = useOrgStore()
const pageStore = usePageStore()
const commonStore = useCommonStore()
/** Store cache danh sách thành viên nhóm Zalo. */
const zaloGroupMemberStore = useZaloGroupMemberStore()
const extensionStore = useExtensionStore()

/** khởi tạo context chung của message list và chat */
const chat = createChat({
  send_message_list: send_message_list as any,
  upload_file_list:  upload_file_list as any,
})

/** Focus lại ô nhập chat sau khi UI đã render xong. */
function focusChatInput() {
  nextTick(() => {
    document.getElementById('chat-text-input-message')?.focus()
  })
}

/** router */
const $route = useRoute()

/**phân trang */
const skip = ref(0)
/**phân trang */
const LIMIT = 20
/**có đang load tin nhắn hay không */
const is_loading_message = ref(false)
/**gắn cờ đã load hết dữ liệu */
const is_done = ref(false)

/** chat-core set reply state nhưng chưa tự focus input như flow cũ. */
watch(
  () => chat.reply_message.value?.root_message_id,
  value => {
    if (!value) return
    focusChatInput()
  },
)

/** Tương tự ở trên nhưng dành cho reply comment/private reply. */
watch(
  () => chat.reply_comment.value?.root_comment_id,
  value => {
    if (!value) return
    focusChatInput()
  },
)

// lắng nghe sự kiện tin nhắn mới, tạm thời ép kiểu
listenerEventBus('chatbox_socket_message', socketNewMessage as Handler<unknown>)

// lắng nghe sự kiện cập nhật tin nhắn, tạm thời ép kiểu
listenerEventBus(
  'chatbox_socket_update_message',
  socketUpdateMssage as Handler<unknown>,
)

/**làm mới dữ liệu nhắn tin */
function resetMessage() {
  // * reset danh sách tin nhắn khi đổi khách hàng
  messageStore.list_message = []
  // reset map danh sách tin nhắn
  messageStore.map_list_message_by_id.clear()

  // * reset danh sách tin nhắn chờ
  messageStore.send_message_list = []

  // reset cờ đã load hết dữ liệu
  is_done.value = false

  // reset phân trang
  skip.value = 0
}

/**
 * Chèn tin nhắn vào danh sách tin nhắn theo đúng thời gian
 * - sử dụng binary search để tìm index cần chèn, tối ưu hiệu năng
 * - chèn đúng vị trí, không ảnh hưởng đến thứ tự của danh sách
 * - không loop cả mảng
 */
function insertMessageSorted(list_message: MessageInfo[], msg: MessageInfo) {
  /**binary search index cần chèn dựa trên field time */
  const INDEX = sortedIndexBy(
    list_message,
    msg,
    item => -new Date(item.createdAt).getTime(),
  )

  // Chèn đúng vị trí
  list_message.splice(INDEX, 0, msg)
}

/**xử lý socket tin nhắn mới */
function socketNewMessage({ detail }: CustomEvent) {
  // nếu không có dữ liệu thì thôi
  if (!detail) return

  // trigger gen ai answer
  triggerInputChatAiAnswer(detail)

  // nếu không phải của khách hàng đang chọn thì chặn
  if (
    detail.fb_page_id !== conversationStore.select_conversation?.fb_page_id ||
    detail.fb_client_id !== conversationStore.select_conversation?.fb_client_id
  )
    return

  // nếu là tin nhắn của khách thì gửi cho toàn bộ các widget
  if (detail?.message_type === 'client' && detail?.message_text) {
    document.querySelectorAll('iframe')?.forEach(iframe => {
      iframe?.contentWindow?.postMessage(
        {
          from: 'CHATBOX',
          type: 'CLIENT_MESSAGE',
          payload: { message: detail?.message_text },
        },
        '*',
      )
    })
  }

  // nếu là dạng comment bài post thì loại bỏ các post cũ, để post mới sẽ lên đầu
  if (size(detail.comment)) {
    remove(messageStore.list_message, message => message._id === detail._id)
    insertMessageSorted(messageStore.list_message, detail)
  }

  // lấy div chứa danh sách tin nhắn
  const LIST_MESSAGE = document.getElementById(messageStore.list_message_id)

  /** vị trí scroll */
  const SCROLL_POSITION =
    (LIST_MESSAGE?.scrollTop || 0) + (LIST_MESSAGE?.clientHeight || 0)

  /** có đang scroll xuống dưới cùng không? */
  const IS_BOTTOM = SCROLL_POSITION === LIST_MESSAGE?.scrollHeight

  // nếu có message_mid và chưa có trong mảng thì mới thêm
  if (
    detail.message_mid &&
    !messageStore.map_list_message_by_id.has(detail.message_mid)
  ) {
    // thêm tin nhắn vào danh sách
    insertMessageSorted(messageStore.list_message, detail)

    // thêm tin nhắn vào map
    messageStore.map_list_message_by_id.set(detail.message_mid, detail)
  }

  // xử lý khi gặp trường hợp phát hiện tin nhắn chờ
  if (detail?.message_mid && messageStore.send_message_list?.length) {
    // xóa tin nhắn tạm
    remove(messageStore.send_message_list, message => {
      /**có phải tin nhắn tạm cần xóa không */
      const IS_MATCH =
        message.message_id === detail?.message_mid ||
        (message.replay_mid && message.replay_mid === detail?.replay_mid)

      // trả về kết quả
      return IS_MATCH
    })
  }

  // nếu đang ở vị trí bottom thì dùng scrollToBottomMessage
  // if (IS_BOTTOM) scrollToBottomMessage(messageStore.list_message_id)
}
/**xử lý socket cập nhật tin nhắn hiện tại */
function socketUpdateMssage({ detail }: CustomEvent) {
  // nếu không có dữ liệu thì thôi
  if (!detail) return

  // nếu không phải của khách hàng đang chọn thì chặn
  if (
    detail.fb_page_id !== conversationStore.select_conversation?.fb_page_id ||
    detail.fb_client_id !== conversationStore.select_conversation?.fb_client_id
  )
    return

  // cập nhật dữ liệu của tin nhắn
  messageStore.list_message?.forEach(message => {
    // tìm đến tin nhắn bằng id, sau đó sao chép dữ liệu mới vào object cũ
    if (message._id === detail._id) Object.assign(message, detail)
  })
}

/** hàm load thêm dữ liệu tin nhắn */
async function loadMessage({ load_more = false }: { load_more?: boolean }) {
  try {
    // nếu không phải load more thì reset dữ liệu
    if (!load_more) {
      // set loading to true
      is_loading_message.value = true
      resetMessage()
    }

    /** id trang */
    const PAGE_ID = conversationStore.select_conversation?.fb_page_id
    /** id khách hàng */
    const CLIENT_ID = conversationStore.select_conversation?.fb_client_id

    await new Promise((resolve, reject) => {
      read_message(
        {
          page_id: PAGE_ID,
          client_id: CLIENT_ID,
          skip: skip.value,
          limit: LIMIT,
        },
        (e, r) => {
          /** nếu lỗi thì thôi */
          if (e) return reject(e)

          // nếu không phải khách đang chọn thì thôi
          if (
            CLIENT_ID !== conversationStore.select_conversation?.fb_client_id
          ) {
            return resolve(undefined)
          }

          /** không có kết quả thì thôi hoặc đã lấy hết dữ liệu thì thôi */
          if (!r || !r.length) {
            is_done.value = true
            return reject()
          }

          /** thêm vào danh sách lên đầu */
          messageStore.list_message.push(...r)

          // lặp qua các tin nhắn để lưu vào map list_message_by_id
          r?.forEach(message => {
            // nếu không có message_mid thì thôi
            if (!message.message_mid) return
            // lưu lại vào map
            messageStore.map_list_message_by_id.set(
              message.message_mid,
              message,
            )
          })

          /** trang tiếp theo */
          skip.value += LIMIT

          // resolve
          resolve(undefined)
        },
      )
    })
  } catch (e) {
  } finally {
    is_loading_message.value = false
  }
}

/** hàm mở modal chuyển tiếp tin nhắn */
function openForwardModal(message: MessageInfo) {
  modal_zalo_share_message_ref.value?.toggleModal()
  message_data.value = message
}

/** hàm thu hồi tin nhắn */
async function undoMessage(data: {
  page_id: string
  client_id: string
  message_mid: string
}) {
  try {
    /** gọi API hoàn tác tin nhắn */
    await new Promise((resolve, reject) => {
      undo_message(
        {
          page_id: data.page_id,
          client_id: data.client_id,
          message_mid: data?.message_mid || '',
        },
        (e, r) => {
          if (e) return reject(e)
          resolve(r)
        },
      )
    })
  } catch (error) {
    toastError(error)
  }
}

/** hàm toggle ẩn hiện bình luận */
async function toggleComment(data: {
  fb_page_id: string
  fb_client_id: string
  fb_post_id: string
  comment_id: string
  is_hidden: boolean
}) {
  try {
    /** gọi API hoàn tác tin nhắn */
    await $n4_service_app_post.toggleComment(
      data.fb_page_id,
      data.fb_client_id,
      data.fb_post_id,
      data.comment_id,
      data.is_hidden,
    )
  } catch (error) {
    toastError(error)
  }
}

/** hàm lấy danh sách bình luận */
async function getReplyComment(data: {
  fb_page_id: string
  fb_client_id: string
  comment_id: string
  skip: number
  limit: number
}) {
  try {
    return await $n4_service_app_post.getMainComment(
      data.fb_page_id,
      data.fb_client_id,
      data.comment_id,
      data.skip,
      data.limit,
    )
  } catch (error) {
    throw error
  }
}
/** hàm mở modal xem chi tiết các nhân sự xem tin nhắn */
function openViewMessageModal(staff_id: string[]) {
  messageStore.select_staff_read_id = [...staff_id]
}

/**
 * Thực hiện gửi cảm xúc (reaction) cho một tin nhắn cụ thể.
 * Tại sao: Giúp nhân sự có thể tương tác nhanh với khách hàng qua biểu tượng cảm xúc, tăng tính sinh động và thân thiện cho cuộc hội thoại.
 */
async function sendReaction(input: {
  page_id: string
  client_id: string
  message_mid: string
  reaction: string
}) {
  // call api gửi reaction
  await $n4_service_app_message.sendReaction(
    input.page_id,
    input.client_id,
    input.reaction,
    input.message_mid,
  )
}

/** hàm lấy thông tin tải lên tập tin tạm */
function openPageSettingQuickAnswer() {
  $external_site.openPageSetting('quick-reply')
}

async function getUploadTempFileUrl(data: {
  file_name: string
  content_type: string
}) {
  return await $n6_static_app_upload_file_v2.getUploadTempFileUrl({
    file_name: data.file_name,
    content_type: data.content_type,
  })
}

/** hàm upload tập tin tạm */
async function uploadTempFile(data: { file: File | Blob; upload_url: string }) {
  return await $n6_static_app_upload_file_v2.uploadTempFile({
    file: data.file,
    upload_url: data.upload_url,
  })
}

/** hàm update tập tin tạm version cũ */
async function uploadTempFileV2(
  data: { type: Uploadtype; file: File; page_id: string },
) {
  return await new N6StaticAppUploadFile(data.page_id).uploadTempFile(
    data.type,
    data.file,
  )
}

/** hàm lấy dữ liệu trả lời nhanh */
async function readAnswer(input: {
  skip: number
  limit: number
  page_id: string
  search?: string
}) {
  return await new QuickAnswer(input.page_id).readAnswer(
    input.skip,
    input.limit,
    input.search,
  )
}

/** hàm reply tin nhắn bình luận */
async function sendPrivateReply(input: {
  page_id: string
  client_id: string
  post_id: string
  target_id: string
  text: string
}) {
  return await $n4_service_app_post.sendPrivateReply(
    input.page_id,
    input.client_id,
    input.post_id,
    input.target_id,
    input.text,
  )
}

/** hàm reply tin nhắn */
async function sendReplyMessage(input: {
  page_id: string
  client_id: string
  message: string
  message_mid: string
  org_id: string
}) {
  try {
    return await $n4_service_app_message.sendReplyMessage(
      input.page_id,
      input.client_id,
      input.message,
      input.message_mid,
      input.org_id,
    )
  } catch (e) {
    toastError(e)
    throw e
  }
}

/** hàm reply bình luận */
async function sendComment(input: {
  page_id: string
  target_id: string
  text: string
}) {
  return await $n4_service_app_post.sendComment(
    input.page_id,
    input.target_id,
    input.text,
  )
}

/** hàm xóa dữ liệu trả lời nhanh */
async function clearAiAnswer(input: { page_id: string; client_id: string }) {
  return await $n4_service_app_conversation.clearAiAnswer(
    input.page_id,
    input.client_id,
  )
}

/** gửi tin nhắn */
async function sendMessage(data: SendMesageInputHorizontal) {
  return await new Promise<{ message_id: string }>((resolve, reject) => {
    send_message(data, (e, r) => {
      if (e) reject(e)
      resolve(r)
    })
  })
}

/**
 * Hàm lấy danh sách thành viên nhóm qua store cache.
 * @param input - Dữ liệu page_id và group_id của nhóm cần lấy member.
 */
async function getGroupMembers(input: { page_id: string; group_id: string }) {
  // Trả danh sách member từ cache hoặc gọi API lần đầu nếu chưa có cache.
  return await zaloGroupMemberStore.ensureGroupMembers(input)
}

/** hàm mở modal xem thông tin cá nhân zalo */
function openZaloPersonalModal(message: MessageInfo) {
  // lưu dữ liệu tin nhắn
  message_data.value = message
  // mở modal
  modal_zalo_personal_ref?.value?.toggleModal()
}

/** Đồng bộ state modal widget ở host app với action payload từ chat-core. */
function openWidgetModal(widget: AppInstalledInfo, ai?: MessageAiData) {
  // lưu widget
  selected_widget.value = widget
  // lưu ai
  selected_widget_ai.value = ai
  // mở modal
  modal_widget_ref.value?.toggleModal()
}

/** hàm mở modal trung tâm cuộc gọi */
function openCallCenter(message: MessageInfo) {
  // lấy widget trung tâm cuộc gọi
  const widget = pageStore.market_widgets?.[CALL_CENTER_WIDGET_ID]
  // nếu không có widget thì thôi
  if (!widget) return

  /** tạo query string */
  const QUERY = Parser.toQueryString({
    partner_token:
      pageStore.selected_page_list_info?.[
        conversationStore.select_conversation?.fb_page_id || ''
      ]?.partner_token,
    client_id: conversationStore.select_conversation?.fb_client_id,
    message_id: message?._id,
    message_phone: message?.client_phone,
  })

  /** mở modal widget */
  openWidgetModal({
    url: widget.url_app + `?${QUERY}`,
    snap_app: widget,
  })
}

/** Xử lý CTA từ thư viện chat-core bằng đúng payload context mà thư viện gửi ra. */
async function handleAction(data?: MessageListActionPayload) {
  /** Type là đầu mối phân luồng chính: web_url, zlp_* hoặc bbh_*. */
  const TYPE = data?.type
  /** nếu không có type thì return */
  if (!TYPE) return

  /** ID page */
  const PAGE_ID = conversationStore.select_conversation?.fb_page_id
  /** ID khách hàng */
  const CLIENT_ID = conversationStore.select_conversation?.fb_client_id
  // nếu không đủ dữ liệu thì dừng lại
  if (!PAGE_ID || !CLIENT_ID) return

  /** dữ liệu tin nhắn */
  const MESSAGE = data.message
  /** id tin nhắn */
  const MESSAGE_ID = data.message_id || MESSAGE?._id
  /** id bình luận */
  const COMMENT_ID = data.comment_id || MESSAGE?.comment_id
  /** số điện thoại */
  const MESSAGE_PHONE =
    MESSAGE?.client_phone ||
    conversationStore.select_conversation?.client_phone ||
    conversationStore.select_conversation?.client_bio?.fb_info?.phone

  // Link thường không mở modal, chỉ mở tab mới rồi kết thúc flow.
  if (TYPE === CHAT_ACTION_TYPE.WEB_URL && data.url) {
    openNewTab(data.url)
    return
  }

  // Nhóm action Zalo OA không mở widget mà gọi API xác nhận/từ chối trực tiếp.
  if (
    TYPE === CHAT_ACTION_TYPE.ZLP_ACCEPT ||
    TYPE === CHAT_ACTION_TYPE.ZLP_DECLINE
  ) {
    try {
      // Chấp nhận hoặc từ chối lời mời kết bạn ngay trên server.
      if (TYPE === CHAT_ACTION_TYPE.ZLP_ACCEPT) {
        await $n4_service_app_conversation.acceptFriendRequest(
          PAGE_ID,
          CLIENT_ID,
        )
        toast('success', CHAT_ACTION_TOAST_MESSAGE.ACCEPT_FRIEND_SUCCESS)
      } else {
        await $n4_service_app_conversation.declineFriendRequest(
          PAGE_ID,
          CLIENT_ID,
        )
        toast('success', CHAT_ACTION_TOAST_MESSAGE.DECLINE_FRIEND_SUCCESS)
      }
    } catch (error) {
      // Với nút accept, backend có thể trả lỗi nếu trước đó đã chấp nhận rồi.
      // Mình giữ nguyên UX cũ: show message riêng thay vì quăng lỗi thô.
      if (TYPE === CHAT_ACTION_TYPE.ZLP_ACCEPT) {
        toastError(CHAT_ACTION_TOAST_MESSAGE.ACCEPT_FRIEND_DUPLICATED)
        return
      }
      toastError(error)
    }
    return
  }

  // Chỉ các CTA mang prefix bbh_ mới đi theo luồng mở widget.
  if (!TYPE.includes(BBH_CTA_PREFIX)) return

  // Map type của button sang key cấu hình CTA trên page.
  // Ví dụ: bbh_email -> ai_cta_email.
  /** key cấu hình CTA */
  const CTA_KEY = CTA_TYPE_TO_PAGE_CONFIG[TYPE]
  // nếu không có key thì dừng lại
  if (!CTA_KEY) return

  // Đọc cấu hình CTA của page đang chat để biết CTA đó có bật hay không và đang trỏ tới widget nào.
  const pageInfo = getPageInfo(PAGE_ID)
  const ctaConfig = pageInfo?.[CTA_KEY]

  // Nếu CTA chưa active hoặc chưa gán widget thì không thể mở popup.
  if (!ctaConfig?.is_active || !ctaConfig.widget_id) return

  // Query này là payload đầu vào cho widget.
  // Nó giữ đủ context để widget biết user click CTA nào, từ message nào và của client nào.
  /** query string */
  const QUERY = Parser.toQueryString({
    partner_token: pageStore.selected_page_list_info?.[PAGE_ID]?.partner_token,
    client_id: CLIENT_ID,
    message_id: MESSAGE_ID,
    comment_id: COMMENT_ID,
    message_phone: MESSAGE_PHONE,
  })

  /** widget đã được cài */
  const INSTALLED_APP = pageStore.widget_list?.find(
    item => item.app_id === ctaConfig.widget_id,
  )

  // Nếu widget chưa được cài ở page hiện tại, dùng dữ liệu từ market widget để mở tạm theo url_app.
  if (!INSTALLED_APP) {
    /** widget */
    const WIDGET = pageStore.market_widgets?.[ctaConfig.widget_id]
    // nếu không có widget thì dừng lại
    if (!WIDGET) return
    /** mở modal widget */
    openWidgetModal(
      {
        url: `${WIDGET.url_app}?${QUERY}`,
        snap_app: WIDGET,
      },
      data.ai,
    )
    return
  }

  // Nếu widget đã được cài, clone cấu hình widget đã cài rồi build lại iframe url mới.
  // getIframeUrl trả token/runtime url của widget đã cài; sau đó nối thêm message/comment context
  // để tránh việc widget mở ra nhưng không biết CTA được click xuất phát từ đâu.
  /** widget đã được cài */
  const WIGET_INSTALLED = copy(INSTALLED_APP)
  /** url của widget */
  WIGET_INSTALLED.url =
    getIframeUrl(WIGET_INSTALLED) +
    `&message_id=${MESSAGE_ID || ''}&comment_id=${COMMENT_ID || ''}`

  // data.ai được thư viện truyền kèm theo button. Widget email/phone/address...
  // có thể dùng trực tiếp AI payload này để prefill form trong iframe.
  openWidgetModal(WIGET_INSTALLED, data.ai)
}

/** đọc danh sách file trong album */
async function readFileAlbum(input: GetFileInput): Promise<FileInfo[]> {
  return await new Promise<FileInfo[]>((resolve, reject) => {
    read_file_album(input, (e, r) => {
      if (e) return reject(e)
      resolve(r || [])
    })
  })
}

/** đọc danh sách các thư mục trong album */
async function readFolderAlbum(input: GetFolderInput): Promise<FolderInfo[]> {
  return await new Promise<FolderInfo[]>((resolve, reject) => {
    read_folder_album(input, (e, r) => {
      if (e) return reject(e)
      resolve(r || [])
    })
  })
}

/** cập nhật album */
async function updateFolderAlbum(input: UpdateFolderInput) {
  return await new Promise((resolve, reject) => {
    update_folder_album(input, (e, r) => {
      if (e) return reject(e)
      resolve(r)
    })
  })
}

/** xóa thư mục */
async function deleteFolderAlbum(input: FromFile) {
  return await new Promise((resolve, reject) => {
    delete_folder_album(input, (e, r) => {
      if (e) return reject(e)
      resolve(r)
    })
  })
}

/** tạo mới thư mục */
async function createFolderAlbum(input: CreateFolderInput) {
  return await new Promise((resolve, reject) => {
    create_folder_album(input, (e, r) => {
      if (e) return reject(e)
      resolve(r)
    })
  })
}

/** xóa file trong album */
async function deleteFileAlbum(input: UpdateFileInfo) {
  return await new Promise((resolve, reject) => {
    delete_file_album(input, (e, r) => {
      if (e) return reject(e)
      resolve(r)
    })
  })
}

/** cập nhật file trong album */
async function uploadFileAlbum(input: { qs: FromFile; body: FormData }) {
  return await new Promise<FileInfo>((resolve, reject) => {
    upload_file_album(input.qs, input.body, (e, r) => {
      if (e) return reject(e)
      resolve(r as FileInfo)
    })
  })
}

/** api thêm thành viên zalo */
async function addMemberZalo(param: {
  page_id: string
  group_id: string
  member_id: string[]
  member?: {
    fb_client_id?: string
    fb_page_id?: string
    client_name?: string
    client_avatar?: string
  }[]
}): Promise<string> {
  await zaloGroupMemberStore.addGroupMembers({
    page_id: param.page_id,
    group_id: param.group_id,
    members: param.member || [],
  })

  return ''
}

/** api reset read tất cả tin nhắn trong hội thoại */
async function resetRead(param: {
  page_id: string
  client_id: string
  unread_message_amount: number
}) {
  /** gọi api đánh dấu hội thoại chưa đọc */
  return await new N4SerivceAppOneConversation(
    param.page_id,
    param.client_id,
  ).resetRead(param.unread_message_amount)
}

/**api tạo mới liên hệ */
async function createContact(param: {
  page_id: string
  client_id: string
  contact_id: string
  contact_type: ContactInfo['contact_type']
  contact_value: string
}): Promise<ContactInfo> {
  await new AiAppOneContact(
    param.page_id,
    param.client_id,
  ).createContact(param.contact_type, param.contact_value)

  return {
    _id: param.contact_id,
    contact_type: param.contact_type,
    contact_value: param.contact_value,
  }
}

/** api phân công nhân viên */
async function setAssignStaffConversation(param: {
  page_id: string
  client_id: string
  new_staff_id: string | undefined
  old_staff_id: string | undefined
}): Promise<void> {
  return await new Promise((resolve, reject) => {
    set_assign_staff_conversation(param, (e, r) => {
      if (e) return reject(e)
      resolve(r)
    })
  })
}
/** api tắt bật chatbot */
async function manageChatbot(param: {
  page_id: string
  client_id: string
  is_disable: boolean
  bot_resume_after?: number
}): Promise<ConversationInfo> {
  return await $n4_service_app_conversation.manageChatbot(
    param.page_id,
    param.client_id,
    param.is_disable,
    param.bot_resume_after,
  )
}
/** api lấy lịch sử cuộc gọi */
async function getCallHistory(param: {
  org_id: string
  page_id: string
  client_id: string
}): Promise<ICallHistory[]> {
  return await $merchant_contact.getCallHistory(
    param.org_id,
    param.page_id,
    param.client_id,
  )
}
/**thay đổi gắn cờ spam cho khách hàng */
async function toggleSpamConversation(param: {
  page_id: string
  client_id: string
  is_spam: boolean
}): Promise<void> {
  return await new Promise((resolve, reject) => {
    toggle_spam_conversation(param, (e, r) => {
      if (e) return reject(e)
      resolve(r)
    })
  })
}
/** lấy danh sách hội thoại */
async function readConversations(param: {
  page_ids: string[]
  org_id: string
  filter: FilterConversation
  limit?: number
  sort?: string
  after?: number[]
}): Promise<QueryConversationResponse> {
  return await $n4_service_app_conversation.readConversations(
    param.page_ids,
    param.org_id,
    param.filter,
    param.limit,
    param.sort,
    param.after,
  )
}
/** api xóa thành viên zalo */
async function removeMemberZalo(param: {
  page_id: string
  group_id: string
  member_id: string
}): Promise<string> {
  return await zaloGroupMemberStore.removeGroupMember(param)
}
/** api đếm số hội thoại */
async function countConversation(param: {
  page_ids: string[]
  filter: FilterConversation
}): Promise<number> {
  return await $n4_service_app_conversation.countConversation(
    param.page_ids,
    param.filter,
  )
}
/** api đọc dữ liệu khách hàng */
async function readClient(param: {
  page_id: string
  client_id: string
}): Promise<ClientInfo> {
  return await new ChatbotAppClient(param.page_id, param.client_id).readClient()
}
/** api đọc dữ liệu thống kê gốc */
async function readEvent(param: {
  event: string[]
  skip: number
  limit: number
  page_id: string
  client_id: string
}): Promise<EventInfo[]> {
  return await new N9AnalyticAppAnalytic(
    param.page_id,
    param.client_id,
  ).readEvent(param.event, param.skip, param.limit)
}
/**sửa thuộc tính tuỳ biến của người dùng này */
async function editAttribute(param: {
  page_id: string
  client_id: string
  list_attribute: Record<string, any>
}): Promise<void> {
  return await new ChatbotAppClient(
    param.page_id,
    param.client_id,
  ).editAttribute(param.list_attribute)
}
/** lấy danh sách liên lạc */
async function getContact(
  param: {
    page_id: string
    client_id: string
  } & BaseQuery,
): Promise<ContactInfo[]> {
  return await new AiAppContact(param.page_id, param.client_id).getContact()
}
/** sửa liên hệ */
async function updateContact(param: {
  page_id: string
  client_id: string
  contact_id: string
  contact_value: string
}): Promise<void> {
  return await new AiAppOneContact(
    param.page_id,
    param.client_id,
    param.contact_id,
  ).updateContact(param.contact_value)
}
/** xóa liên hệ */
async function deleteContact(data: {
  page_id: string
  client_id: string
  contact_id: string
}): Promise<void> {}
/**đọc data liên lạc của khách hàng */
async function getConversation(
  param: {
    page_id: string
    client_id: string
  } & BaseQuery,
): Promise<ConversationInfo> {
  return await new N4ServiceConversation(
    param.page_id,
    param.client_id,
  ).getConversation()
}
/**sửa tên khách hàng */
async function updateClientName(data: {
  page_id: string
  client_id: string
  client_name: string
}): Promise<void> {
  return await new N4SerivceAppOneConversation(
    data.page_id,
    data.client_id,
  ).updateClientName(data.client_name)
}
/**cập nhật thông tin khách hàng */
async function updateInfoConversation(
  param: QueryUpdateInfoConversation,
): Promise<void> {
  return await new Promise((resolve, reject) => {
    update_info_conversation(param, (e, r) => {
      if (e) return reject(e)
      resolve(r)
    })
  })
}
/** đánh dấu hội thoại đã đọc */
async function resetReadConversation(data: {
  page_id: string
  client_id: string
}): Promise<void> {
  return await new Promise((resolve, reject) => {
    reset_read_conversation(data, (e, r) => {
      if (e) return reject(e)
      resolve(r)
    })
  })
}
</script>
