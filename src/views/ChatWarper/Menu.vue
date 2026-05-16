<template>
  <div class="h-full flex-shrink-0 flex flex-col justify-between">
    <div class="flex flex-col gap-1 overflow-y-auto">
      <NavItem
        id="interact"
        v-if="!is_post_tab"
        :is_disable_tooltip="true"
        @dblclick="filter_interact?.filter_dropdown_ref?.toggleDropdown"
        @mouseover="filter_interact?.filter_popover_ref?.mouseover"
        @mouseleave="filter_interact?.filter_popover_ref?.mouseleave"
        @click="filter_interact?.clearThisFilter()"
        :is_active="!!conversationStore.option_filter_page_data.display_style"
        :icon="InboxIcon"
        :title="$t('v1.view.main.dashboard.chat.filter.interact.title')"
      />
      <NavItem
        id="message"
        v-if="!is_post_tab"
        :is_disable_tooltip="true"
        @dblclick="filter_message?.filter_dropdown_ref?.toggleDropdown"
        @mouseover="filter_message?.filter_popover_ref?.mouseover"
        @mouseleave="filter_message?.filter_popover_ref?.mouseleave"
        @click="filter_message?.clearThisFilter()"
        :is_active="isActiveMessageFilter()"
        :icon="ChatDotIcon"
        :title="$t('v1.view.main.dashboard.chat.filter.message.title')"
      />
      <NavItem
        id="phone"
        v-if="!is_post_tab"
        @dblclick="filter_phone?.filter_dropdown_ref?.toggleDropdown"
        :is_disable_tooltip="true"
        @mouseover="filter_phone?.filter_popover_ref?.mouseover"
        @mouseleave="filter_phone?.filter_popover_ref?.mouseleave"
        @click="filter_phone?.clearThisFilter()"
        :is_active="isActiveFilter('phone')"
        :icon="PhoneIcon"
        :title="$t('v1.view.main.dashboard.chat.filter.phone.title')"
      />
      <NavItem
        id="date"
        :is_disable_tooltip="true"
        @dblclick="filter_date?.filter_dropdown_ref?.toggleDropdown"
        @mouseover="filter_date?.filter_popover_ref?.mouseover"
        @mouseleave="filter_date?.filter_popover_ref?.mouseleave"
        @click="filter_date?.clearThisFilter()"
        :is_active="isActiveFilter('date')"
        :icon="DateIcon"
        :title="$t('v1.view.main.dashboard.chat.filter.time.title')"
      />
      <NavItem
        id="tag"
        v-if="!is_post_tab"
        :is_disable_tooltip="true"
        @dblclick="filter_tag?.filter_dropdown_ref?.toggleDropdown"
        @mouseover="filter_tag?.filter_popover_ref?.mouseover"
        @mouseleave="filter_tag?.filter_popover_ref?.mouseleave"
        @click="filter_tag?.clearThisFilter()"
        :is_active="!!conversationStore.option_filter_page_data.label_id"
        :icon="TagIcon"
        :title="$t('v1.view.main.dashboard.chat.filter.label.title')"
      />
      <NavItem
        id="not_tag"
        v-if="!is_post_tab"
        :is_disable_tooltip="true"
        @dblclick="filter_not_tag?.filter_dropdown_ref?.toggleDropdown"
        @mouseover="filter_not_tag?.filter_popover_ref?.mouseover"
        @mouseleave="filter_not_tag?.filter_popover_ref?.mouseleave"
        @click="filter_not_tag?.clearThisFilter()"
        :is_active="!!conversationStore.option_filter_page_data.not_label_id"
        :icon="TagNotIcon"
        :title="$t('v1.view.main.dashboard.chat.filter.exclude_label.title')"
      />
      <NavItem
        id="staff"
        v-if="!is_post_tab && $main.isShowStaffFilter()"
        :is_disable_tooltip="true"
        @dblclick="filter_staff?.filter_dropdown_ref?.toggleDropdown"
        @mouseover="filter_staff?.filter_popover_ref?.mouseover"
        @mouseleave="filter_staff?.filter_popover_ref?.mouseleave"
        @click="filter_staff?.clearThisFilter()"
        :is_active="!!conversationStore.option_filter_page_data.staff_id"
        :icon="UsersIcon"
        :title="$t('v1.view.main.dashboard.chat.filter.staff.title')"
      />
      <NavItem
        id="post"
        :is_disable_tooltip="true"
        @dblclick="filter_post?.filter_dropdown_ref?.toggleDropdown"
        @mouseover="filter_post?.filter_popover_ref?.mouseover"
        @mouseleave="filter_post?.filter_popover_ref?.mouseleave"
        @click="filter_post?.clearThisFilter()"
        :is_active="!!conversationStore.option_filter_page_data.post_id"
        :icon="NewSpaperIcon"
        :title="$t('v1.view.main.dashboard.chat.filter.post.title')"
      />
      <NavItem
        v-if="isFilterActive()"
        @click="$main.clearAllFilter()"
        :icon="CloseBoldIcon"
        class_icon="text-red-600"
        :title="$t('v1.view.main.dashboard.chat.filter.un_filter')"
      />
    </div>
    <div class="flex flex-col gap-1">
      <NavItem
        id="qr-retion-app"
        :is_disable_tooltip="true"
        @mouseover="qr_retion_app?.mouseover"
        @mouseleave="qr_retion_app?.mouseleave"
        :icon="QrCodeIcon"
        :title="$t('Tải ứng dụng Retion')"
      />
      <NavItem
        id="support-center"
        :is_disable_tooltip="true"
        @click="support_center?.dropdown_ref?.toggleDropdown"
        :icon="SupportCenterIcon"
        :title="$t('Support Center') || 'Support Center'"
      />
    </div>
  </div>
  <FilterInteract ref="filter_interact" />
  <FilterMessage ref="filter_message" />
  <FilterPhone ref="filter_phone" />
  <FilterDate ref="filter_date" />
  <FilterTag ref="filter_tag" />
  <FilterNotTag ref="filter_not_tag" />
  <FilterStaff ref="filter_staff" />
  <FilterPost ref="filter_post" />
  <QrRetionApp ref="qr_retion_app" />
  <SupportCenter ref="support_center" />
</template>

<script setup lang="ts">
import {
  isActiveFilter,
  isActiveMessageFilter,
  isFilterActive,
  resetConversationFilter,
} from '@/service/function'
import { useCommonStore, useConversationStore } from '@/stores'
import {
  CalcSpecialPageConfigs,
  type ICalcSpecialPageConfigs,
} from '@/utils/helper/Conversation/CalcSpecialPageConfigs'
import { container } from 'tsyringe'
import { computed, ref, watch } from 'vue'

import Attach from '@/views/ChatWarper/Menu/Attach.vue'
import FilterDate from '@/views/ChatWarper/Menu/FilterModal/FilterDate.vue'
import FilterInteract from '@/views/ChatWarper/Menu/FilterModal/FilterInteract.vue'
import FilterMessage from '@/views/ChatWarper/Menu/FilterModal/FilterMessage.vue'
import FilterNotTag from '@/views/ChatWarper/Menu/FilterModal/FilterNotTag.vue'
import FilterPhone from '@/views/ChatWarper/Menu/FilterModal/FilterPhone.vue'
import FilterPost from '@/views/ChatWarper/Menu/FilterModal/FilterPost.vue'
import FilterStaff from '@/views/ChatWarper/Menu/FilterModal/FilterStaff.vue'
import FilterTag from '@/views/ChatWarper/Menu/FilterModal/FilterTag.vue'
import NavItem from '@/views/ChatWarper/Menu/NavItem.vue'
import QrRetionApp from '@/views/ChatWarper/Menu/QrRetionApp.vue'
import SupportCenter from '@/views/ChatWarper/Menu/SupportCenter.vue'

import ChatDotIcon from '@/components/Icons/ChatDot.vue'
import CloseBoldIcon from '@/components/Icons/CloseBold.vue'
import DateIcon from '@/components/Icons/Date.vue'
import InboxIcon from '@/components/Icons/Inbox.vue'
import NewSpaperIcon from '@/components/Icons/NewSpaper.vue'
import PhoneIcon from '@/components/Icons/Phone.vue'
import SupportCenterIcon from '@/components/Icons/SupportCenterIcon.vue'
import TagIcon from '@/components/Icons/Tag.vue'
import TagNotIcon from '@/components/Icons/TagNot.vue'
import UsersIcon from '@/components/Icons/Users.vue'
import { QrCodeIcon } from '@heroicons/vue/24/outline'

const conversationStore = useConversationStore()
const commonStore = useCommonStore()

/**ref của menu đính kèm */
const attach_ref = ref<InstanceType<typeof Attach>>()
/** Lọc theo tương tác */
const filter_interact = ref<InstanceType<typeof FilterInteract>>()
/** Lọc theo trạng thái tin nhắn */
const filter_message = ref<InstanceType<typeof FilterMessage>>()
/** Lọc số điện thoại */
const filter_phone = ref<InstanceType<typeof FilterPhone>>()
/** Lọc theo thời gian */
const filter_date = ref<InstanceType<typeof FilterDate>>()
/** Lọc theo nhãn */
const filter_tag = ref<InstanceType<typeof FilterTag>>()
/** Lọc theo loại trừ nhãn */
const filter_not_tag = ref<InstanceType<typeof FilterNotTag>>()
/** Lọc theo nhân viên */
const filter_staff = ref<InstanceType<typeof FilterStaff>>()
/** Lọc theo bài post */
const filter_post = ref<InstanceType<typeof FilterPost>>()
/**  QR của Retion App */
const qr_retion_app = ref<InstanceType<typeof QrRetionApp>>()
const support_center = ref<InstanceType<typeof SupportCenter>>()

/** id của bộ lọc đã bật gần nhất */
const filter_show_with_shortcut = ref('')
/** trạng thái tab bài viết */
const is_post_tab = computed(
  () => conversationStore.option_filter_page_data.conversation_type === 'POST'
)

/** lắng nghe trạng thái của bộ lọc */
watch(
  () => commonStore.keyboard_shortcut,
  new_value => {
    // nếu là xóa bộ lọc và đang lọc thì xóa hết các bộ lọc
    if (new_value === 'clear_all_filter' && isFilterActive()) {
      $main.clearAllFilter()
    }

    /** map từ key shortcut sang ref của dropdown */
    const FILTER_MAP: Record<
      string,
      | {
          filter_dropdown_ref?: { is_open: boolean }
        }
      | undefined
    > = {
      interact: filter_interact.value,
      message: filter_message.value,
      phone: filter_phone.value,
      date: filter_date.value,
      tag: filter_tag.value,
      not_tag: filter_not_tag.value,
      staff: filter_staff.value,
      post: filter_post.value,
    }

    // nếu không liên quan đến lọc thì thôi
    if (!FILTER_MAP[new_value] || !new_value) {
      // xóa sự kiện phím tắt
      commonStore.keyboard_shortcut = ''
      return
    }

    /** id của bộ lọc đang bật */
    let old_value = ''

    /** id của bộ lọc đã bật gần nhất */
    const KEY = filter_show_with_shortcut.value

    /** bộ lọc gần nhất đã bật */
    const FITLER = FILTER_MAP[KEY]

    // nếu filter tồn tại và đang mở thì gán lại old_value
    if (FITLER?.filter_dropdown_ref?.is_open) {
      old_value = KEY
    }

    /** sự kiện nhấn doubles click */
    const DBL_CLICK_EVENT = new MouseEvent('dblclick', {
      view: window,
      bubbles: true,
      cancelable: true,
    })

    /** Nút cần nhấn của bộ lọc đang bật */
    const BUTTON_CURRENT = document.getElementById(old_value) as HTMLElement

    /** Nút cần nhấn của bộ lọc cần mở */
    const BUTTON_NEW = document.getElementById(new_value) as HTMLElement

    // trigger nhấn sự kiện nhấn double click của bộ lọc hiện tại
    BUTTON_CURRENT?.dispatchEvent(DBL_CLICK_EVENT)

    // trigger nhấn sự kiện nhấn double click của bộ lọc cần mở
    BUTTON_NEW?.dispatchEvent(DBL_CLICK_EVENT)

    // lưu lại id bộ lọc cần mở
    filter_show_with_shortcut.value = new_value

    // clear data
    commonStore.keyboard_shortcut = ''
  }
)
// logic khi chuyển sang tab POST
watch(
  () => conversationStore.option_filter_page_data.conversation_type,
  (value, old_value) => {
    // nếu không phải chuyển sang post thì thôi
    if (value !== 'POST' || old_value === 'POST') return

    // clear data của các bộ lọc chỉ có trong tab chat
    clearChatOnlyFiltersForPost()
  }
)
// clear các filter cho tab post
function clearChatOnlyFiltersForPost() {
  // clear các filter không dùng trong bài post
  filter_interact.value?.clearThisFilter()
  filter_message.value?.clearThisFilter()
  filter_phone.value?.clearThisFilter()
  filter_tag.value?.clearThisFilter()
  filter_not_tag.value?.clearThisFilter()
  filter_staff.value?.clearThisFilter()
  resetConversationFilter()
  // xóa filter label_and
  delete conversationStore.option_filter_page_data.label_and
}

class Main {
  /**
   * @param SERVICE_CALC_SPECIAL_PAGE_CONFIGS tính toán cấu hình trang đặc biệt
   */
  constructor(
    private readonly SERVICE_CALC_SPECIAL_PAGE_CONFIGS: ICalcSpecialPageConfigs = container.resolve(
      CalcSpecialPageConfigs
    )
  ) {}

  /**có hiện lọc nhân viên không */
  isShowStaffFilter() {
    /**cấu hình trang đặc biệt */
    const SPECIAL_PAGE_CONFIG = this.SERVICE_CALC_SPECIAL_PAGE_CONFIGS.exec()

    // nếu chỉ cho nv xem của mình thì không hiện lọc nhân viên
    return !SPECIAL_PAGE_CONFIG.is_only_visible_client_of_staff
  }

  /** Xóa toàn bộ lọc đã chọn */
  clearAllFilter() {
    filter_interact.value?.clearThisFilter()
    filter_message.value?.clearThisFilter()
    filter_phone.value?.clearThisFilter()
    filter_date.value?.clearThisFilter()
    filter_tag.value?.clearThisFilter()
    filter_not_tag.value?.clearThisFilter()
    filter_staff.value?.clearThisFilter()
    filter_post.value?.clearThisFilter()
    resetConversationFilter()
  }
}
const $main = new Main()
</script>
