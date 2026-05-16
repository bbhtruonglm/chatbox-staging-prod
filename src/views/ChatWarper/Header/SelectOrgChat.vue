<template>
  <div>
    <div
      @click="openSelectOrg"
      class="flex max-w-64 items-center gap-1.5 px-2.5 py-1.5 text-lg font-semibold cursor-pointer"
      :class="{
        'text-blue-700 dark:text-blue-300': is_open,
      }"
    >
      <p
        v-if="current_org_name"
        class="min-w-0 truncate"
      >
        {{ current_org_name }}
      </p>
      <p
        v-else
        class="min-w-0 truncate"
      >
        {{ $t('Chọn tổ chức') }}
      </p>

      <ChevronDownIcon
        :class="{ 'rotate-180': is_open }"
        class="size-4 flex-shrink-0 transition-transform"
      />
    </div>
    <Dropdown
      width="400px"
      height="auto"
      :is_fit="false"
      :position="'BOTTOM'"
      :distance="10"
      class_content="flex flex-col gap-1 text-sm px-3 pb-2 pt-0"
      ref="dropdown_ref"
      @open_dropdown="is_open = true"
      @close_dropdown="is_open = false"
    >
      <div class="pt-2 sticky top-0 theme-card-secondary !border-0">
        <input
          ref="input_search_ref"
          v-model.trim="search_org"
          type="text"
          placeholder="Tìm kiếm theo tên và id tổ chức"
          class="bg-transparent w-full border theme-border py-2 px-3 rounded-md outline-none"
        />
      </div>
      <div
        v-for="org of filtered_orgs"
        :key="org.org_id"
        @click="selectOrg(org)"
        class="flex w-full items-center gap-4 rounded-md px-2 cursor-pointer"
        :class="[
          isSelectedOrg(org) ? 'theme-active' : 'theme-hover'
        ]"
      >
        <div
          class="flex size-8 flex-shrink-0 items-center theme-hover justify-center rounded-lg border p-1.5 theme-card-secondary"
        >
          <img
            v-if="org?.org_info?.org_avatar"
            :src="org.org_info.org_avatar"
            class="h-full w-full object-cover rounded-md"
          />
          <BriefcaseIcon
            v-else
            class="size-5 rounded-md"
          />
        </div>

        <div class="py-3 flex-1 flex justify-between items-center gap-2 border-b theme-border">
          <div class="min-w-0 flex-1 flex flex-col">
          <span class="flex min-w-0 items-center gap-2">
            <span class="truncate font-semibold leading-5">
              {{ org?.org_info?.org_name || 'Không tên' }}
            </span>
            <Badge v-if="org?.org_package?.org_package_type !== 'FREE'" />
          </span>
          <p class="mt-0.5 truncate text-xs leading-5 text-zinc-900 dark:text-zinc-200">
            {{ getOrgLimitText(org) }}
          </p>
        </div>
        <CheckCircleIcon
          v-if="isSelectedOrg(org)"
          class="text-green-500 size-8"
        />
        </div>

      </div>

      <div
        v-if="!filtered_orgs.length"
        class="px-3 py-6 text-center text-zinc-500"
      >
        {{ $t('Không tìm thấy tổ chức') }}
      </div>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import { UNLIMITED_VALUE } from '@/configs/constants/billing'
import { preGoToChat } from '@/service/function'
import { formatLimit, nonAccentVn } from '@/service/helper/format'
import { useOrgStore, usePageStore } from '@/stores'
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Dropdown from '@/components/Dropdown.vue'
import Badge from '@/components/Main/Dashboard/SelectOrg/Badge.vue'

import { BriefcaseIcon, CheckCircleIcon } from '@heroicons/vue/24/solid'
import { ChevronDownIcon } from 'lucide-vue-next'

import type { OrgInfo } from '@/service/interface/app/billing'

/** i18n */
const { t } = useI18n()

/** store */
const orgStore = useOrgStore()
const pageStore = usePageStore()

/** tham chiếu vào component dropdown */
const dropdown_ref = ref<InstanceType<typeof Dropdown>>()
/** tham chiếu vào input tìm kiếm */
const input_search_ref = ref<HTMLInputElement>()
/** trạng thái mở của dropdown */
const is_open = ref(false)
const search_org = ref('')
/** tên hiển thị của tổ chức */
const current_org_name = computed(
  () => orgStore.selected_org_info?.org_info?.org_name,
)
/** danh sách tổ chức đã được lọc theo tìm kiếm */
const filtered_orgs = computed(() => {
  /** tìm kiếm */
  const SEARCH = nonAccentVn(search_org.value || '').trim()
  /** danh sách tổ chức */
  const LIST_ORG = orgStore.list_org || []

  return LIST_ORG
    .filter(org => {
      /** nếu không có tìm kiếm thì return true */
      if (!SEARCH) return true
      /** tên tổ chức không dấu */
      const ORG_NAME = nonAccentVn(org?.org_info?.org_name || '')
      /** id tổ chức không dấu */
      const ORG_ID = nonAccentVn(org?.org_id || '')

      /** return true nếu tìm thấy tên hoặc id tổ chức */
      return ORG_NAME.includes(SEARCH) || ORG_ID.includes(SEARCH)
    })
    /** sắp xếp danh sách tổ chức */
    .sort((org_a, org_b) => {
      /** nếu org_a được chọn thì return -1 */
      if (isSelectedOrg(org_a)) return -1
      /** nếu org_b được chọn thì return 1 */
      if (isSelectedOrg(org_b)) return 1

      /** return 0 nếu không có gì đặc biệt */
      return 0
    })
})

/** hàm mở dropdown */
const openSelectOrg = ($event: MouseEvent) => {
  dropdown_ref.value?.toggleDropdown($event)
  /** focus vào input tìm kiếm sau khi dropdown được mở */
  nextTick(() => {
    input_search_ref.value?.focus()
  })
}
/** hàm kiểm tra xem tổ chức đã được chọn hay chưa */
function isSelectedOrg(org: OrgInfo) {
  return org?.org_id === orgStore.selected_org_id
}

/** hàm lấy số lượng trang và thành viên */
function getOrgLimitText(org: OrgInfo) {
  /** số lượng trang */
  const PAGE_LIMIT = org?.org_package?.org_current_page
  /** số lượng thành viên */
  const STAFF_LIMIT = org?.org_package?.org_current_staff

  /** trả về chuỗi số lượng trang và thành viên */
  return `${formatLimit(PAGE_LIMIT)} ${t('v1.common.page')} - ${formatLimit(
    STAFF_LIMIT,
  )} ${t('v1.view.main.dashboard.org_staff.member')}`
}

/** hàm chọn tổ chức */
function selectOrg(org: OrgInfo) {
  /** nếu không có org_id hoặc đã chọn tổ chức thì return */
  if (!org?.org_id || isSelectedOrg(org)) return

  /** ẩn dropdown */
  dropdown_ref.value?.immediatelyHide()
  /** tắt trạng thái mở */
  is_open.value = false
  /** reset tìm kiếm */
  search_org.value = ''

  /** set selected_org_id */
  orgStore.selected_org_id = org.org_id
  /** set selected_org_info */
  orgStore.selected_org_info = org
  /** set selected_page_id_list */
  pageStore.selected_page_id_list = {}

  /** lấy tất cả danh sách page */
  const ALL_PAGE_LIST = pageStore.all_page_list || {}
  /** set selected_page_id_list */
  for (const page_id in ALL_PAGE_LIST) {
    /** page */
    const PAGE = ALL_PAGE_LIST[page_id]
    /** page_id */
    const PAGE_ID = PAGE?.page?.fb_page_id
    /** nếu page_id tồn tại và map_page_org[page_id] bằng org_id thì set selected_page_id_list */
    if (PAGE_ID && pageStore.map_orgs?.map_page_org?.[PAGE_ID] === org.org_id) {
      pageStore.selected_page_id_list[PAGE_ID] = true
    }
  }
  /** chuyển đến trang chat */
  preGoToChat(() => {})
}
</script>
