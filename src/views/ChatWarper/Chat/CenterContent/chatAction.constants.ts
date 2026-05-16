import type { IPageAiCtaConfig } from '@/service/interface/app/page'

export const CHAT_ACTION_TYPE = {
  WEB_URL: 'web_url',
  ZLP_ACCEPT: 'zlp_accept',
  ZLP_DECLINE: 'zlp_decline',
} as const

export const BBH_CTA_PREFIX = 'bbh_'

export const CALL_CENTER_WIDGET_ID = '680f3335ff2c365808e08ec0'

export const CTA_TYPE_TO_PAGE_CONFIG: Record<string, keyof IPageAiCtaConfig> = {
  bbh_place_order: 'ai_cta_place_order',
  bbh_create_transaction: 'ai_cta_payment_transaction',
  bbh_schedule_appointment: 'ai_cta_schedule_appointment',
  bbh_address: 'ai_cta_address',
  bbh_document: 'ai_cta_identify_document',
  bbh_email: 'ai_cta_email',
  bbh_link: 'ai_cta_link',
  bbh_phone: 'ai_cta_phone',
  bbh_sale: 'ai_cta_invoice',
  bbh_shipping: 'ai_cta_transportation',
}

export const CHAT_ACTION_TOAST_MESSAGE = {
  ACCEPT_FRIEND_SUCCESS: 'Đã đồng ý kết bạn',
  ACCEPT_FRIEND_DUPLICATED: 'Đã đồng ý kết bạn rồi',
  DECLINE_FRIEND_SUCCESS: 'Đã từ chối kết bạn',
} as const
