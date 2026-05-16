<template>
  <Modal
    ref="modal_widget_add_group_ref"
    class_modal="w-[432px]"
    :class_body="`flex flex-col gap-2 ${
      view === 'SEARCH' || !view ? 'h-[90dvh]' : 'h-[80dvh]'
    }`"
  >
    <template #header>
      {{ $t('v1.common.add_member') }}
    </template>

    <template #body>
      <div class="bg-white h-full w-full rounded-md p-2 flex flex-col gap-4">
        <div class="flex w-full gap-2">
          <button
            class="flex-1 bg-slate-200 font-semibold px-2 py-1 rounded-md text-sm"
            @click="handleRemoveSelect"
          >
            {{ $t('v1.common.reset_select') }}
          </button>

          <button
            v-if="!isEmpty(selected_members)"
            class="flex-1 bg-blue-700 font-semibold text-white px-2 py-1 rounded-md text-sm"
            @click="handleAddMember"
          >
            {{ $t('add _ member', { count: selected_members.length }) }}
          </button>

          <button
            v-else
            class="flex-1 cursor-not-allowed font-semibold bg-slate-600 text-white px-2 py-1 rounded-md text-sm"
            disabled
          >
            {{ $t('v1.common.add_member') }}
          </button>
        </div>

        <p
          v-if="error_select_members"
          class="text-red-500 text-xs mt-1"
        >
          {{ error_select_members }}
        </p>

        <!-- Search member -->
        <div class="relative">
          <MagnifyingGlassIcon
            class="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-slate-500"
          />
          <input
            v-model="search_conversation"
            class="w-full bg-slate-100 placeholder-slate-500 py-1.5 pl-9 pr-8 text-sm rounded-md"
            type="text"
            :placeholder="$t('v1.common.search_member')"
          />
          <XMarkIcon
            @click="search_conversation = undefined"
            v-if="search_conversation"
            class="absolute top-1/2 right-2 -translate-y-1/2 size-5 text-red-500 cursor-pointer"
          />
        </div>

        <!-- Selected info -->
        <div class="flex w-full gap-2 items-center justify-between text-xs">
          <span
            class="p-0.5 px-2 bg-blue-50 text-blue-700 font-semibold rounded-md"
          >
            {{ $t('v1.common.member_selected') }}
            {{ selected_members.length }}/100
          </span>
          <span
            class="p-0.5 px-2 bg-blue-50 text-blue-700 font-semibold rounded-md"
            >{{ count_conversation }}</span
          >
        </div>

        <!-- List conversation -->
        <div class="flex-1 overflow-y-auto border-t border-slate-200 pt-2">
          <div
            v-for="conv in filtered_conversation"
            :key="conv.fb_client_id + '_' + conv.fb_page_id"
            class="flex items-center justify-between p-2 border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
            @click="toggleMember(conv)"
          >
            <div class="flex items-center gap-4">
              <input
                type="checkbox"
                :checked="selected_members.includes(conv)"
                class="h-4 w-4 text-blue-600"
              />

              <img
                :src="conv.client_avatar"
                alt=""
                class="size-10 rounded-full"
              />
              <div>
                <p class="text-sm font-medium">{{ conv.client_name }}</p>
                <p class="text-xs text-slate-500">
                  {{ conv.client_phone || '-' }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="filtered_conversation.length === 0"
            class="p-2 text-slate-400 text-sm"
          >
            {{ $t('v1.common.no_data') }}
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { container } from 'tsyringe'
import { computed, ref } from 'vue'
import { Toast } from '@/utils/helper/Alert/Toast'
import type { IGroupMember } from '@/utils/api/N4Service/ZaloPersonal'
import Modal from '@/components/Modal.vue'
import type {
  FilterConversation,
  QueryConversationResponse,
} from '@/service/interface/app/conversation'
import {
  useConversationStore,
  useOrgStore,
  useZaloGroupMemberStore,
} from '@/stores'
import { N4SerivceAppConversation } from '@/utils/api/N4Service/Conversation'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { isEmpty } from 'lodash'
import { useI18n } from 'vue-i18n'
import { Format } from '@/utils/helper/Format'

/** Props nhận dữ liệu nhóm Zalo hiện tại từ UserInfo. */
const props = withDefaults(
  defineProps<{
    /** Danh sách thành viên nhóm hiện tại. */
    group_members?: IGroupMember[]
    /** Id trang Zalo cá nhân của nhóm. */
    page_id?: string
    /** Id nhóm Zalo hiện tại. */
    group_id?: string
  }>(),
  {
    /** Mặc định danh sách thành viên là mảng rỗng. */
    group_members: () => [],
  }
)

/** Emit báo thao tác thêm thành viên đã thành công. */
const emit = defineEmits(['success'])

const $format = container.resolve(Format)

/** Hàm dịch */
const $t = useI18n().t
/** Store quản lý tổ chức hiện tại. */
const orgStore = useOrgStore()
/** Thông tin conversation hiện tại. */
const conversationStore = useConversationStore()
/** Store cache danh sách thành viên nhóm Zalo. */
const zaloGroupMemberStore = useZaloGroupMemberStore()
/** Id trang Zalo cá nhân của nhóm. */
const page_id = computed(() => {
  // Ưu tiên page_id truyền từ UserInfo, fallback về conversation đang chọn.
  return props.page_id || conversationStore.select_conversation?.fb_page_id || ''
})
/** Id nhóm Zalo hiện tại. */
const group_id = computed(() => {
  // Ưu tiên group_id truyền từ UserInfo, fallback về client_id của conversation nhóm.
  return (
    props.group_id || conversationStore.select_conversation?.fb_client_id || ''
  )
})
/** UI state */
/** Tên group Zalo muốn tạo */
const group_name = ref('')
/** Từ khóa tìm kiếm conversation */
const search_conversation = ref<string>()
/** Ref tới component modal */
const modal_widget_add_group_ref = ref<InstanceType<typeof Modal>>()
/** View hiện tại: SEARCH, CHAT, FRIEND_REQUEST hoặc trống */
const view = ref<'SEARCH' | 'CHAT' | 'FRIEND_REQUEST' | ''>('')
/** Cờ kiểm tra modal đang mở */
const is_modal_open = ref(false)

/** Conversation data */
/** Danh sách conversation đang hiển thị */
const conversations = ref<any[]>([])
/** Danh sách thành viên được chọn để tạo group */
const selected_members = ref<any[]>([])
/** Tổng số conversation */
const count_conversation = ref<number>(0)
/** Cursor cho paging conversation */
const after_cursor = ref<number[] | undefined>(undefined)
/** Cờ kiểm tra đang fetch conversation */
const is_fetching = ref(false)

/** Validation */
/** Kiểm tra lỗi tên group */
const error_group_name = ref(false)
/** Kiểm tra lỗi chọn thành viên */
const error_select_members = ref('')

const $toast = container.resolve(Toast)

/**
 * @class Main
 * @description Chứa logic gọi API conversation, KHÔNG chứa store
 */
class Main {
  /**
   * @param API instance N4ServiceAppConversation
   */
  constructor(
    private readonly API = container.resolve(N4SerivceAppConversation)
  ) {}

  /**
   * Bật/tắt modal, nếu mở modal sẽ fetch toàn bộ conversation
   */
  toggleModal() {
    modal_widget_add_group_ref.value?.toggleModal()
    is_modal_open.value = !is_modal_open.value
    if (is_modal_open.value) {
      fetchAllConversations()
    } else {
      selected_members.value = []
      search_conversation.value = ''
      group_name.value = ''
    }
  }

  /**
   * Lấy conversation từ server
   * @param params - object chứa pageIds, orgId, filter, limit, sort, after
   * @returns kết quả bao gồm result[], after cursor, count
   */
  async getConversation(params: {
    page_ids: string[]
    org_id: string
    filter: FilterConversation
    limit: number
    sort: string
    after?: number[] | undefined
  }) {
    try {
      return await this.API.readConversations(
        params.page_ids,
        params.org_id,
        params.filter,
        params.limit,
        params.sort,
        params.after
      )
    } catch (err) {
      console.error('Lỗi getConversation:', err)
      return { result: [], after: null, count: 0 }
    }
  }

  /**
   * Lấy tổng số conversation theo filter
   * @param params object chứa pageIds và filter
   * @returns object { count }
   */
  async countConversation(params: {
    pageIds: string[]
    filter: FilterConversation
  }) {
    try {
      return await this.API.countConversation(params.pageIds, params.filter)
    } catch (err) {
      console.error('Lỗi countConversation:', err)
      return { count: 0 }
    }
  }
}

const $main = new Main()

/**
 * Fetch toàn bộ conversation theo cursor (paging)
 * Sử dụng while loop để fetch tới khi hết dữ liệu
 */
async function fetchAllConversations() {
  /** Nếu đang fetch thì return */
  if (is_fetching.value) return
  is_fetching.value = true
  /** Page hiện tại đang được chọn */
  const CURRENT_PAGE_ID = conversationStore?.select_conversation?.fb_page_id

  /** Filter mặc định */
  const FILTER: FilterConversation = {
    conversation_type: 'CHAT',
    display_style: 'FRIEND',
    is_spam_fb: 'NO',
  }
  /** Sắp xếp theo số lượng unread, sau đó thời gian tin nhắn cuối */
  const SORT = 'unread_message_amount:desc,last_message_time:desc'

  /** Reset dữ liệu trước khi fetch */
  conversations.value = []
  selected_members.value = []
  after_cursor.value = undefined
  /** Tạo trạng thái fetching = true */
  let keep_fetching = true
  while (keep_fetching) {
    /** Gọi API để fetch conversation */
    const RES: QueryConversationResponse | any = await $main.getConversation({
      page_ids: [CURRENT_PAGE_ID || ''],
      org_id: orgStore.selected_org_id || '',
      filter: FILTER,
      limit: 50,
      sort: SORT,
      after: after_cursor.value || undefined,
    })

    /** Nếu có dữ liệu, push vào list và update cursor */
    if (RES?.result?.length) {
      conversations.value.push(...RES.result)
      after_cursor.value = RES.after || undefined
      keep_fetching = !!after_cursor.value
    } else {
      /** Nếu không có dữ liệu nữa thì dừng loop */
      keep_fetching = false
    }

    count_conversation.value = RES?.count || conversations.value.length
  }

  /** Reset cờ fetch */
  is_fetching.value = false
}

/**
 * Computed filter conversation theo từ khóa name hoặc phone
 */
const filtered_conversation = computed(() => {
  /** Nếu không có key word thì trả về cả list */
  if (!search_conversation.value) return conversations.value
  /** Xử lý to lowercase và xóa dấu */
  const KEYWORD = $format.removeAccents(search_conversation.value).toLowerCase()

  /** Xử lý filter conversation phone và name */
  return conversations.value.filter(conv => {
    const NAME = $format.removeAccents(conv.client_name || '').toLowerCase()
    const PHONE = $format.removeAccents(conv.client_phone || '').toLowerCase()

    return NAME.includes(KEYWORD) || PHONE.includes(KEYWORD)
  })
})
/** Hàm reset các select */
async function handleRemoveSelect() {
  selected_members.value = []
}

/**
 * Xử lý Thêm thành viên vào nhóm trên Zalo
 */
async function handleAddMember() {
  // Reset error
  error_select_members.value = ''

  /** Id trang Zalo cá nhân của nhóm hiện tại. */
  const PAGE_ID = page_id.value

  /** Id nhóm Zalo hiện tại. */
  const GROUP_ID = group_id.value

  // Nếu thiếu page_id hoặc group_id thì không thêm thành viên.
  if (!PAGE_ID || !GROUP_ID) {
    // Hiển thị lỗi thiếu dữ liệu nhóm.
    error_select_members.value = $t(
      'Vui lòng chọn trang và khách hàng trước khi thực hiện'
    )

    // Kết thúc hàm khi dữ liệu nhóm không hợp lệ.
    return
  }

  try {
    /** Gọi store thêm member, store sẽ gọi API add và cập nhật cache local. */
    await zaloGroupMemberStore.addGroupMembers({
      page_id: PAGE_ID,
      group_id: GROUP_ID,
      members: selected_members.value,
    })
    /** Reset selected_members */
    selected_members.value = []
    /** Ẩn modal */
    modal_widget_add_group_ref.value?.toggleModal()
    /** Thông báo thành công */
    $toast.success($t('v1.common.add_member_success'))
    /** Emit sự kiện thành công */
    emit('success')
  } catch (err) {
    console.error('Lỗi khi thêm thành viên:', err)
  }
}

/**
 * Thêm/xóa thành viên trong danh sách selected_members
 * @param conv conversation object
 */
function toggleMember(conv: any) {
  /** Reset lỗi */
  error_select_members.value = ''

  /** Tìm index thành viên đã chọn */
  const INDEX = selected_members.value.findIndex(
    m =>
      m.fb_client_id === conv.fb_client_id && m.fb_page_id === conv.fb_page_id
  )

  /** Nếu đã chọn, xóa; nếu chưa chọn, push vào mảng */
  if (INDEX >= 0) {
    selected_members.value.splice(INDEX, 1)
  } else {
    selected_members.value.push(conv)
  }
}

/** Expose toggleModal ra component cha để gọi trực tiếp */
defineExpose({ toggleModal: $main.toggleModal.bind($main) })
</script>
