import type {
  MessageAiData,
  MessageInfo,
  MessageTemplateButton,
} from '@/service/interface/app/message'

/**
 * Mirror payload hiện tại của chat-core khi callback `events.handleAction`.
 * Tách riêng khỏi component để CenterContent.vue chỉ giữ phần xử lý logic.
 */
export interface MessageListActionPayload extends MessageTemplateButton {
  button?: MessageTemplateButton
  ai?: MessageAiData
  message_id?: string
  comment_id?: string
  message?: MessageInfo
}
