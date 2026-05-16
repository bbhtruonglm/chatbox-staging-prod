<template>
  <div class="flex justify-between items-center gap-2">
    <div class="w-full min-w-0 flex items-center">
      <SelectGroupChat />
      <p
        v-tooltip.top="$t('Tổng số hội thoại')"
        class="shrink-0 rounded-full bg-slate-200 text-slate-700 font-medium text-xs px-2 py-1 leading-[14px] max-w-20 truncate"
      >
        {{ $format.formatAbbreviationNumber(total_count) }}
      </p>
    </div>
    <button
      class="p-1.5 theme-button-icon rounded-lg"
      v-tooltip="$t('v1.common.add_customer')"
      @click="ref_dropdown?.toggleDropdown"
    >
      <PlusIcon class="size-5 flex-shrink-0" />
    </button>
    <Dropdown
      ref="ref_dropdown"
      height="auto"
      :is_fit="false"
      :position="'BOTTOM'"
      class_content="flex flex-col gap-1 text-sm p-2.5"
    >
      <button
        class="p-2 rounded-lg flex items-center gap-2 theme-hover"
        @click="
          () => {
            ref_dropdown?.toggleDropdown()
            modal_zalo_personal_ref?.toggleModal()
            message_data = undefined
          }
        "
      >
        <UserPlusIcon class="size-5 flex-shrink-0" />
        <p>{{ $t('Kết bạn') }}</p>
      </button>
      <button
        class="p-2 rounded-lg flex items-center gap-2 theme-hover"
        @click="
          () => {
            ref_dropdown?.toggleDropdown()
            modal_zalo_create_group_ref?.toggleModal()
            message_data = undefined
          }
        "
      >
        <UserGroupIcon class="size-5 flex-shrink-0" />
        <p>{{ $t('Tạo nhóm') }}</p>
      </button>
    </Dropdown>
  </div>
  <div class="flex-shrink-0 flex items-center justify-between">
    <template v-if="!is_search">
      <div class="text-sm gap-3 flex items-center h-8 min-w-0">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="
            () => {
              conversationStore.option_filter_page_data.tab = tab.value
            }
          "
          :class="{
            'theme-border-foreground':
              conversationStore.option_filter_page_data.tab === tab.value,
          }"
          class="h-full flex gap-1 items-center truncate font-semibold border-b-2 border-b-transparent"
        >
          <p>{{ tab.label }}</p>
          <!-- <template
            v-if="conversationStore.option_filter_page_data.tab === tab.value"
          >
            <p
              v-if="
                conversationStore.count_conversation?.chat &&
                conversationStore.option_filter_page_data.conversation_type ===
                  'CHAT'
              "
              class="rounded-full bg-slate-200 text-slate-700 font-medium text-xxs px-1 leading-[14px] max-w-20 truncate"
            >
              {{
                $format.formatAbbreviationNumber(
                  conversationStore.count_conversation?.chat,
                )
              }}
            </p>
            <p
              v-if="
                conversationStore.count_conversation?.post &&
                conversationStore.option_filter_page_data.conversation_type ===
                  'POST'
              "
              class="rounded-full bg-slate-200 text-slate-700 font-medium text-xxs px-1 leading-[14px] max-w-20 truncate"
            >
              {{
                $format.formatAbbreviationNumber(
                  conversationStore.count_conversation?.post,
                )
              }}
            </p>
          </template> -->
        </button>
      </div>
      <button
        @click="$main.toggleSearch()"
        v-tooltip="$t('v1.common.search')"
      >
        <SearchIcon class="size-4" />
      </button>
    </template>
    <div
      v-else
      class="relative w-full"
    >
      <SearchIcon
        class="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-slate-500"
      />
      <input
        v-model.trim="search_conversation"
        @blur="$main.toggleSearch()"
        ref="ref_search_conversation"
        class="w-full theme-active placeholder-slate-500 py-1.5 pl-9 pr-8 text-sm rounded-full"
        type="text"
        :placeholder="$t('v1.common.search')"
      />
      <XCircleIcon
        @mousedown.prevent
        @click="$main.clearSearchConversation()"
        v-if="search_conversation"
        class="absolute top-1/2 right-2 -translate-y-1/2 size-5 text-red-500 cursor-pointer"
      />
    </div>
  </div>
  <div
    v-if="isFilterActive()"
    class="theme-active rounded-lg py-1.5 px-2 text-xs flex gap-2 items-center"
    :class="{
      hidden: conversationStore.selected_quick_filter !== 'ALL',
    }"
  >
    <div class="flex gap-2 w-full min-w-0 items-center">
      <FunnelIcon class="w-3.5 h-3.5 flex-shrink-0" />
      <p class="truncate">{{ filter }}</p>
    </div>
    <button @click="$filter_service.clearAllFilter()">
      <XMarkIcon class="w-3.5 h-3.5 flex-shrink-0" />
    </button>
  </div>
  <!-- <QuickFilter /> -->
</template>
<script setup lang="ts">
import { isFilterActive } from '@/service/function'
import {
  useCommonStore,
  useConversationStore,
  useMessageStore,
  useOrgStore,
  usePageManagerStore,
  usePageStore,
} from '@/stores'
import { FilterService } from '@/utils/helper/Filter'
import { Format } from '@/utils/helper/Format'
import { format } from 'date-fns'
import { debounce, forEach, map } from 'lodash'
import { storeToRefs } from 'pinia'
import { container } from 'tsyringe'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import SearchIcon from '@/components/Icons/Search.vue'
import SelectGroupChat from '@/views/ChatWarper/Header/SelectGroupChat.vue'
import {
  FunnelIcon,
  UserGroupIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { XCircleIcon } from '@heroicons/vue/24/solid'
import { PlusIcon } from 'lucide-vue-next'

import type { ILabel } from '@/service/interface/app/label'
import type { StaffInfo } from '@/service/interface/app/staff'
import Dropdown from '@/components/Dropdown.vue'

// store
const conversationStore = useConversationStore()
const commonStore = useCommonStore()
const pageStore = usePageStore()
const pageManagerStore = usePageManagerStore()
const orgStore = useOrgStore()
// i18n
const { t: $t } = useI18n()

/** danh sách các tab */
const TAB: { value: 'UNREAD' | 'UNREPLIED' | undefined; label: string }[] = [
  { value: undefined, label: $t('Mới nhất') },
  // { value: 'UNREAD', label: $t('Chưa đọc') },
  // { value: 'UNREPLIED', label: $t('Chưa trả lời') },
]

const { modal_zalo_personal_ref, message_data, modal_zalo_create_group_ref } =
  storeToRefs(useMessageStore())

const $format = container.resolve(Format)
const $filter_service = container.resolve(FilterService)

/**giá trị của ô tìm kiếm hội thoại */
const search_conversation = ref<string>()
/**trạng thái tìm kiếm */
const is_search = ref<boolean>(
  !!conversationStore.option_filter_page_data.search,
)
/**tham chiếu đến ô tìm kiếm */
const ref_search_conversation = ref<HTMLInputElement>()
/** tham chiếu đến dropdown */
const ref_dropdown = ref<InstanceType<typeof Dropdown>>()

/**delay tìm kiếm hội thoại */
const onSearchConversation = debounce((value?: string) => {
  // lưu giá trị search vào biến
  conversationStore.option_filter_page_data.search = value
}, 500)

/** dữ liệu lọc thể hiện ra dạng chuỗi */
const filter = computed(() => {
  /** dữ liệu lọc chung */
  const FILTER_GENERAL: string[] = []
  /** lọc gắn nhãn */
  const FILTER_TAG: string[] = []
  /** lọc trừ nhãn */
  const FILTER_NOT_TAG: string[] = []
  /** lọc thời gian */
  const FITLER_TIME: string[] = []
  /** lọc nhân sự */
  const FILTER_STAFF: string[] = []

  /** nếu là lọc tương tác từ tin nhắn */
  if (conversationStore.option_filter_page_data.display_style === 'INBOX') {
    FILTER_GENERAL.push(
      $t('v1.view.main.dashboard.chat.filter.interact.message'),
    )
  }
  /** nếu là lọc tương tác từ bình luận */
  if (conversationStore.option_filter_page_data.display_style === 'COMMENT') {
    FILTER_GENERAL.push(
      $t('v1.view.main.dashboard.chat.filter.interact.comment'),
    )
  }
  /** nếu là lọc tương tác từ bạn bè */
  if (conversationStore.option_filter_page_data.display_style === 'FRIEND') {
    FILTER_GENERAL.push(
      $t('v1.view.main.dashboard.chat.filter.interact.friend'),
    )
  }
  /** nếu là lọc tương tác từ nhóm */
  if (conversationStore.option_filter_page_data.display_style === 'GROUP') {
    FILTER_GENERAL.push($t('v1.view.main.dashboard.chat.filter.interact.group'))
  }

  /** nếu là lọc chưa đọc */
  if (conversationStore.option_filter_page_data.unread_message === 'true') {
    FILTER_GENERAL.push($t('v1.view.main.dashboard.chat.filter.message.unread'))
  }
  /** nếu là lọc chưa phản hồi */
  if (
    conversationStore.option_filter_page_data.not_response_client === 'true'
  ) {
    FILTER_GENERAL.push(
      $t('v1.view.main.dashboard.chat.filter.message.not_reply'),
    )
  }
  /** nếu là lọc tin nhắn chứa gắn nhãn */
  if (conversationStore.option_filter_page_data.not_exist_label === 'true') {
    FILTER_GENERAL.push(
      $t('v1.view.main.dashboard.chat.filter.message.not_tag'),
    )
  }
  /** nếu là lọc tin nhắn spam */
  if (conversationStore.option_filter_page_data.is_spam_fb === 'YES') {
    FILTER_GENERAL.push($t('v1.view.main.dashboard.chat.filter.message.spam'))
  }
  /** nếu là lọc có số điện thoại */
  if (conversationStore.option_filter_page_data.have_phone === 'YES') {
    FILTER_GENERAL.push(
      $t('v1.view.main.dashboard.chat.filter.phone.include_phone'),
    )
  }
  /** nếu là lọc không có số điện thoại */
  if (conversationStore.option_filter_page_data.have_phone === 'NO') {
    FILTER_GENERAL.push(
      $t('v1.view.main.dashboard.chat.filter.phone.exclude_phone'),
    )
  }
  /** nếu là lọc ngày */
  if (conversationStore.option_filter_page_data.time_range) {
    /** thời điểm bắt đầu lọc */
    const START = conversationStore.option_filter_page_data?.time_range?.gte
    /** thời điểm kết thúc lọc */
    const END = conversationStore.option_filter_page_data?.time_range?.lte

    // nếu có thì mới thêm vào
    if (START && END) {
      FITLER_TIME.push(
        `${format(START, 'HH:mm, dd/MM/yyyy')} - ${format(
          END,
          'HH:mm, dd/MM/yyyy',
        )}`,
      )
    }
  }
  /** nếu là lọc nhãn */
  if (conversationStore.option_filter_page_data.label_id?.length) {
    /** danh sách các tiêu đề nhãn đã chọn */
    const TITLE_TAGS = conversationStore.option_filter_page_data.label_id?.map(
      id => tags.value?.[id]?.title || '',
    )

    FILTER_TAG.push(...TITLE_TAGS)
  }
  /** nếu là lọc trừ nhãn */
  if (conversationStore.option_filter_page_data.not_label_id?.length) {
    /** danh sách các tiêu đề nhãn trừ nhãn */
    const TITLE_NOT_TAGS =
      conversationStore.option_filter_page_data.not_label_id?.map(
        id => tags.value?.[id]?.title || '',
      )

    FILTER_NOT_TAG.push(...TITLE_NOT_TAGS)
  }
  /** nếu là lọc nhân sự */
  if (conversationStore.option_filter_page_data.staff_id?.length) {
    /** danh sách tên các nhân sự được lọc */
    const STAFF_NAMES = conversationStore.option_filter_page_data.staff_id?.map(
      id => staffs.value?.[id]?.name || '',
    )

    FILTER_STAFF.push(...STAFF_NAMES)
  }

  /** nội dung của các bộ lọc */
  const RESULT: string[] = []
  // thêm nội dung lọc chung
  addContent(
    RESULT,
    FILTER_GENERAL,
    $t('v1.view.main.dashboard.chat.filter.post.filter'),
  )
  // thêm nội dung lọc nhãn
  addContent(RESULT, FILTER_TAG, $t('Nhãn'))
  // thêm nội dung lọc trừ nhãn
  addContent(RESULT, FILTER_NOT_TAG, $t('Trừ nhãn'))
  // thêm nội dung lọc thời gian
  addContent(RESULT, FITLER_TIME, $t('Thời gian'))
  // thêm nội dung lọc nhân sự
  addContent(RESULT, FILTER_STAFF, $t('Nhân viên'))
  // thêm lọc bài viết
  if (conversationStore.option_filter_page_data.post_id) {
    RESULT.push($t('Lọc bài viết'))
  }
  return RESULT.join(', ')
})

/** danh sách các tab để lọc hội thoại */
const tabs = computed(()=>{
  switch (orgStore.selected_org_info?.org_config?.org_sort_conversation){
    case 'UNREAD':
      return [{ value: undefined, label: $t('Chưa đọc') }]
    case 'NEWEST':
      return [
        { value: undefined, label: $t('Mới nhất') },
      ]
  }
})

/** danh sách nhãn của các trang đã chọn */
const tags = computed(() => {
  /** các nhãn lưu dưới dạng hash table */
  let tags: Record<string, ILabel> = {}

  // lặp qua các trang được chọn để gộp các nhãn của các trang lại 1 danh sách
  map(pageStore.selected_page_list_info, item => {
    tags = { ...tags, ...item.label_list }
  })

  return tags
})

/** danh sách các nhân sự của các trang đã chọn */
const staffs = computed(() => {
  /** các nhãn lưu dưới dạng hash table */
  let staffs: Record<string, StaffInfo> = {}

  // lặp qua các trang được chọn để gộp các nhãn của các trang lại 1 danh sách
  map(pageStore.selected_page_list_info, item => {
    staffs = { ...staffs, ...item.staff_list }
  })

  return staffs
})

/** tổng số hội thoại */
const total_count = computed(() => {
  if (conversationStore.option_filter_page_data.conversation_type === 'CHAT') {
    return conversationStore.count_conversation?.chat
  } else if(conversationStore.option_filter_page_data.conversation_type === 'POST') {
    return conversationStore.count_conversation?.post
  }

})

/** thêm nội dung bộ lọc */
function addContent(result: string[], content: string[], title: string) {
  // nếu không có thì thôi
  if (!content.length) return
  // nếu có thì thêm vào kết quả
  result.push(`${title}: ${content.join(', ')}`)
}

class Main {
  /**chuyển đổi trạng thái tìm kiếm */
  async toggleSearch() {
    // nếu đang tìm kiếm và có giá trị ô tìm kiếm thì không cho đóng ô tìm kiếm
    if (is_search.value && search_conversation.value) return

    // toggle trạng thái tìm kiếm
    is_search.value = !is_search.value

    // nếu là mở ô tìm kiếm
    if (is_search.value) {
      // chờ render xong
      await nextTick()

      // focus vào ô tìm kiếm
      ref_search_conversation.value?.focus()
    }
  }
  /**xoá giá trị và focus vào ô tìm kiếm */
  async clearSearchConversation() {
    search_conversation.value = undefined

    await nextTick()
    ref_search_conversation.value?.focus()
  }

  /**build danh sách page được chọn theo group */
  buildSelectedPageList(group_id: string) {
    /** lấy ra id của tổ chức hiện tại */
    const ORG_ID = orgStore.selected_org_id
    /** danh sách page được chọn theo group */
    const NEXT_SELECTED_PAGE_ID_LIST: Record<string, boolean> = {}

    /** nếu không có id tổ chức thì không làm gì */
    if (!ORG_ID) return NEXT_SELECTED_PAGE_ID_LIST

    forEach(pageStore.all_page_list, item => {
      /** id page */
      const PAGE_ID = item.page?.fb_page_id

      /** không có id page thì không làm gì */
      if (!PAGE_ID) return

      /** không có page trong danh sách page của tổ chức hiện tại thì không làm gì */
      if (pageStore.map_orgs?.map_page_org?.[PAGE_ID] !== ORG_ID) return

      /** nếu là group ALL thì không làm gì */
      if (
        group_id !== 'ALL' &&
        !pageManagerStore.pape_to_group_map?.[PAGE_ID]?.includes(group_id)
      )
        return

      /** thêm vào danh sách page được chọn */
      NEXT_SELECTED_PAGE_ID_LIST[PAGE_ID] = true
    })

    return NEXT_SELECTED_PAGE_ID_LIST
  }

  /** so sánh danh sách page được chọn có giống nhau không */
  isSameSelectedPageList(target: Record<string, boolean>) {
    /** danh sách id page được chọn hiện tại */
    const CURRENT_PAGE_IDS = Object.keys(pageStore.selected_page_id_list || {})
      .filter(page_id => !!pageStore.selected_page_id_list?.[page_id])
      .sort()
    /** danh sách id page được chọn theo group */
    const TARGET_PAGE_IDS = Object.keys(target).sort()

    /** nếu danh sách id page được chọn không giống nhau thì không làm gì */
    if (CURRENT_PAGE_IDS.length !== TARGET_PAGE_IDS.length) return false

    /** kiểm tra xem từng id page có giống nhau không */
    return TARGET_PAGE_IDS.every((page_id, index) => {
      return page_id === CURRENT_PAGE_IDS[index]
    })
  }

  /**áp dụng danh sách page đã chọn */
  applySelectedPage(group_id: string) {
    /** danh sách page được chọn theo group */
    const NEXT_SELECTED_PAGE_ID_LIST = this.buildSelectedPageList(group_id)

    /** nếu danh sách page được chọn không thay đổi thì không làm gì */
    if (this.isSameSelectedPageList(NEXT_SELECTED_PAGE_ID_LIST)) return

    /** áp dụng danh sách page đã chọn */
    pageStore.selected_page_id_list = NEXT_SELECTED_PAGE_ID_LIST
  }
}

const $main = new Main()

onMounted(() => {
  if (conversationStore.option_filter_page_data.search) {
    // load giá trị search được lưu từ local vào biến khi load lại trang
    search_conversation.value = conversationStore.option_filter_page_data.search
  }
})

// theo dõi giá trị ô tìm kiếm
watch(() => search_conversation.value, onSearchConversation)

// läng nghe trạng thái của phím tắt
watch(
  () => commonStore.keyboard_shortcut,
  value => {
    // nếu không phải tìm kiếm thì bỏ qua
    if (value !== 'search_conversation') return

    // nếu chưa search thì bật chế độ search
    if (!is_search.value) $main.toggleSearch()
    // nếu đã có search rồi thi focus vào ô tìm kiếm
    else ref_search_conversation.value?.focus()

    // clear data
    commonStore.keyboard_shortcut = ''
  },
)
</script>
