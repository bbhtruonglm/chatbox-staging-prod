<template>
  <div class="max-w-full min-w-0">
    <div
      @click="openSelectGroup"
      class="flex max-w-full w-fit min-w-0 cursor-pointer items-center gap-1.5 px-2 text-2xl font-semibold"
      :class="{
        'text-blue-700 dark:text-blue-300': is_open,
      }"
    >
      <p class="min-w-0 truncate">{{ selected_label }}</p>
      <ChevronDownIcon
        :class="{ 'rotate-180': is_open }"
        class="size-4 flex-shrink-0"
      />
    </div>

    <Dropdown
      width="400px"
      height="auto"
      :is_fit="false"
      :position="'BOTTOM'"
      :distance="10"
      class_content="flex flex-col gap-2 text-sm"
      ref="dropdown_ref"
      @open_dropdown="is_open = true"
      @close_dropdown="is_open = false"
    >
      <div class="grid grid-cols-2 rounded-lg theme-active p-1 text-center">
        <div
          @click="selectTab('GROUP')"
          :class="
            active_tab === 'GROUP' ? 'theme-card shadow-sm' : 'text-zinc-500'
          "
          class="rounded-md py-1 font-medium cursor-pointer"
        >
          {{ t('Nhóm') }}
        </div>
        <div
          @click="selectTab('PAGE')"
          :class="
            active_tab === 'PAGE' ? 'theme-card shadow-sm' : 'text-zinc-500'
          "
          class="rounded-md py-1 font-medium cursor-pointer"
        >
          {{ t('v1.common.page') }}
        </div>
      </div>

      <input
        ref="input_search_ref"
        v-model.trim="search_keyword"
        type="text"
        :placeholder="t('Tìm kiếm theo tên trang hoặc nhóm')"
        class="border theme-border py-2 px-3 rounded-md theme-card-secondary outline-none"
      />

      <div
        v-if="active_tab === 'GROUP'"
        class="flex max-h-80 flex-col overflow-y-auto"
      >
        <div
          v-for="group of filtered_group_options"
          :key="group.group_id"
          @click="selectGroup(group.group_id)"
          :class="
            isSelectedGroup(group.group_id) ? 'theme-active' : 'theme-hover'
          "
          class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2"
        >
          <span
            class="p-1.5 flex-shrink-0 rounded-lg border theme-card-secondary"
            :class="
              isSelectedGroup(group.group_id)
                ? 'text-zinc-950'
                : 'text-zinc-500'
            "
          >
            <UserGroupIcon
              v-if="group.group_id === 'ALL'"
              class="size-5"
            />
            <UsersIcon
              v-else
              class="size-5"
            />
          </span>
          <div
            class="py-3 flex-1 flex justify-between items-center gap-2 border-b theme-border"
          >
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold">
                {{ group.group_name }}
              </span>
              <span
                class="mt-1 text-xs block truncate text-zinc-900 dark:text-zinc-200"
              >
                {{ getGroupLimitText(group) }}
              </span>
            </span>
            <CheckCircleIcon
              v-if="isSelectedGroup(group.group_id)"
              class="size-8 flex-shrink-0 text-green-500"
            />
          </div>
        </div>

        <div
          v-if="!group_options.length"
          class="px-3 py-8 text-center text-zinc-500"
        >
          {{ t('Không có nhóm') }}
        </div>
        <div
          v-else-if="!filtered_group_options.length"
          class="px-3 py-8 text-center text-zinc-500"
        >
          {{ t('Không tìm thấy nhóm') }}
        </div>
      </div>

      <div
        v-else
        class="flex max-h-80 flex-col overflow-y-auto"
      >
        <div
          v-for="page of filtered_current_org_pages"
          :key="page.page_id"
          @click="selectPage(page.page_id)"
          :class="
            isSelectedOnlyPage(page.page_id) ? 'theme-active' : 'theme-hover'
          "
          class="flex w-full items-center gap-3 rounded-lg px-2 cursor-pointer"
        >
          <PageAvatar
            class="size-8"
            :page_info="pageStore.all_page_list?.[page.page_id]?.page"
          />
          <div
            class="py-3 flex-1 flex justify-between items-center gap-2 border-b theme-border"
          >
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold">
                {{ page.name }}
              </span>
              <span class="mt-1 block truncate text-xs text-zinc-500">
                {{ page.page_id }}
              </span>
            </span>

            <CheckCircleIcon
              v-if="isSelectedOnlyPage(page.page_id)"
              class="size-8 flex-shrink-0 text-green-500"
            />
          </div>
        </div>

        <div
          v-if="!current_org_pages.length"
          class="px-3 py-8 text-center text-zinc-500"
        >
          {{ t('Không có trang') }}
        </div>
        <div
          v-else-if="!filtered_current_org_pages.length"
          class="px-3 py-8 text-center text-zinc-500"
        >
          {{ t('Không tìm thấy trang') }}
        </div>
      </div>

      <button class="flex justify-end border-t theme-border pt-3">
        <div
          @click="openGroupSetting"
          class="flex items-center gap-2 rounded-lg theme-active px-4 py-2 font-medium text-zinc-600 dark:text-zinc-200"
        >
          <Cog6ToothIcon class="size-5" />
          {{ t('Cài đặt nhóm') }}
        </div>
      </button>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import PageAvatar from '@/components/Avatar/PageAvatar.vue'
import Dropdown from '@/components/Dropdown.vue'
import { formatLimit, nonAccentVn } from '@/service/helper/format'
import {
  useChatbotUserStore,
  useOrgStore,
  usePageManagerStore,
  usePageStore,
} from '@/stores'
import { BillingAppGroup } from '@/utils/api/Billing'
import {
  CheckCircleIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/vue/24/solid'
import { ChevronDownIcon } from 'lucide-vue-next'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

/** các loại tab */
type SelectTab = 'GROUP' | 'PAGE'

/** tab nhóm */
interface SelectGroupOption {
  /** id nhóm */
  group_id: string
  /** tên nhóm */
  group_name: string
  /** danh sách id trang */
  group_pages?: string[]
  /** danh sách id nhân viên */
  group_staffs?: string[]
  /** có phải là tất cả không */
  is_all?: boolean
}

/** tab trang */
interface SelectPageOption {
  /** id trang */
  page_id: string
  /** tên trang */
  name: string
  /** ảnh đại diện */
  avatar?: string
}
/** i18n */
const { t } = useI18n()
/** route */
const $router = useRouter()

/** store */
const orgStore = useOrgStore()
const pageStore = usePageStore()
const pageManagerStore = usePageManagerStore()
const chatbotUserStore = useChatbotUserStore()

/** tham chiếu vào component dropdown */
const dropdown_ref = ref<InstanceType<typeof Dropdown>>()
/** tham chiếu vào input tìm kiếm */
const input_search_ref = ref<HTMLInputElement>()
/** trạng thái mở của dropdown */
const is_open = ref(false)
/** từ khóa tìm kiếm trang hoặc nhóm */
const search_keyword = ref('')
/** tab đang được chọn */
const active_tab = ref<SelectTab>('GROUP')
/** danh sách nhóm */
const groups = ref<IGroup[]>([])

/** danh sách trang thuộc tổ chức */
const current_org_pages = computed<SelectPageOption[]>(() => {
  /** id tổ chức hiện tại */
  const ORG_ID = orgStore.selected_org_id
  /** nếu không có id tổ chức thì return [] */
  if (!ORG_ID) return []
  /** danh sách tất cả trang */
  const ALL_PAGE_LIST = pageStore.all_page_list || {}

  return Object.keys(ALL_PAGE_LIST)
    .map(page_id => ALL_PAGE_LIST[page_id])
    .filter(item => {
      const PAGE_ID = item?.page?.fb_page_id
      return PAGE_ID && pageStore.map_orgs?.map_page_org?.[PAGE_ID] === ORG_ID
    })
    .map(item => ({
      page_id: item.page?.fb_page_id || '',
      name: item.page?.name || item.page?.fb_page_id || '',
      avatar: item.page?.avatar,
    }))
    .filter(page => !!page.page_id)
})
/** danh sách trang đã được chọn */
const selected_page_ids = computed(() =>
  Object.keys(pageStore.selected_page_id_list || {}).filter(
    id => !!pageStore.selected_page_id_list?.[id],
  ),
)

/** kiểm tra tất cả các trang của tổ chức hiện tại đã được chọn hay chưa */
const is_all_current_org_pages_selected = computed(() => {
  /** danh sách id trang của tổ chức hiện tại */
  const CURRENT_ORG_PAGE_IDS = current_org_pages.value
    .map(page => page.page_id)
    .sort()
  /** danh sách id trang đã được chọn */
  const SELECTED_PAGE_IDS = [...selected_page_ids.value].sort()

  /** nếu không có trang nào được chọn thì return false */
  if (!CURRENT_ORG_PAGE_IDS.length) return false
  /** nếu số lượng trang không bằng nhau thì return false */
  if (CURRENT_ORG_PAGE_IDS.length !== SELECTED_PAGE_IDS.length) return false

  /** kiểm tra tất cả các trang của tổ chức hiện tại đã được chọn hay chưa */
  return CURRENT_ORG_PAGE_IDS.every((page_id, index) => {
    return page_id === SELECTED_PAGE_IDS[index]
  })
})

/** nhóm có quyền truy cập */
const access_groups = computed(() => {
  /** id nhân viên */
  const USER_ID = chatbotUserStore.chatbot_user?.user_id || ''
  /** id tổ chức hiện tại */
  const ORG_ID = orgStore.selected_org_id

  /** lọc danh sách nhóm có quyền truy cập */
  return (groups.value || []).filter(group => {
    /** nếu có org_id và không bằng với org_id hiện tại thì return false */
    if (group?.org_id && group.org_id !== ORG_ID) return false
    /** nếu là admin thì return true */
    if (orgStore.selected_org_info?.current_ms?.ms_role === 'ADMIN') return true
    /** nếu có group_staffs và bao gồm id nhân viên hiện tại thì return true */
    return group?.group_staffs?.includes(USER_ID)
  })
})

/** danh sách tùy chọn nhóm */
const group_options = computed<SelectGroupOption[]>(() => {
  /** lọc danh sách nhóm */
  const SELECTABLE_GROUPS = access_groups.value
    .filter(group => {
      /** nếu không có group_id hoặc group_name thì return false */
      if (!group?.group_id || !group?.group_name) return false
      /** nếu có group_pages và bao gồm page_id thì return true */
      return group.group_pages?.some(
        page_id => !!pageStore.all_page_list?.[page_id],
      )
    })
    .map(group => ({
      group_id: group.group_id || '',
      group_name: group.group_name || '',
      group_pages: group.group_pages || [],
      group_staffs: group.group_staffs || [],
    }))

  /** return danh sách tùy chọn nhóm */
  return [
    /** tab tất cả nhóm */
    {
      /** id nhóm */
      group_id: 'ALL',
      /** tên nhóm */
      group_name: t('Tất cả nhóm'),
      /** danh sách id trang */
      group_pages: current_org_pages.value.map(page => page.page_id),
      /** danh sách id nhân viên */
      group_staffs: [],
      /** có phải là tất cả không */
      is_all: true,
    },
    ...SELECTABLE_GROUPS,
  ]
})

/** danh sách tùy chọn nhóm đã được lọc theo tìm kiếm */
const filtered_group_options = computed<SelectGroupOption[]>(() => {
  /** từ khóa tìm kiếm không dấu */
  const SEARCH = nonAccentVn(search_keyword.value || '').trim()

  /** nếu không có tìm kiếm thì return toàn bộ danh sách */
  if (!SEARCH) return group_options.value

  return group_options.value.filter(group => {
    /** tên nhóm không dấu */
    const GROUP_NAME = nonAccentVn(group.group_name || '')

    /** return true nếu tìm thấy tên nhóm */
    return GROUP_NAME.includes(SEARCH)
  })
})

/** danh sách trang đã được lọc theo tìm kiếm */
const filtered_current_org_pages = computed<SelectPageOption[]>(() => {
  /** từ khóa tìm kiếm không dấu */
  const SEARCH = nonAccentVn(search_keyword.value || '').trim()

  /** nếu không có tìm kiếm thì return toàn bộ danh sách */
  if (!SEARCH) return current_org_pages.value

  return current_org_pages.value.filter(page => {
    /** tên trang không dấu */
    const PAGE_NAME = nonAccentVn(page.name || '')

    /** return true nếu tìm thấy tên trang */
    return PAGE_NAME.includes(SEARCH)
  })
})

/** id nhóm được chọn */
const selected_group_id = computed(() => {
  /** id tổ chức hiện tại */
  const ORG_ID = orgStore.selected_org_id || ''
  /** nếu có group_id và bằng với org_id hiện tại thì return true */
  /** nếu có group_id và bằng với org_id hiện tại thì return true */
  if (orgStore.selected_org_group?.[ORG_ID])
    return orgStore.selected_org_group[ORG_ID]
  /** nếu tất cả các trang của tổ chức hiện tại đã được chọn thì return true */
  if (is_all_current_org_pages_selected.value) return 'ALL'

  return ''
})

/** tên được hiển thị trên dropdown */
const selected_label = computed(() => {
  /** tìm nhóm được chọn */
  const SELECTED_GROUP = group_options.value.find(
    group => group.group_id === selected_group_id.value,
  )

  /** nếu có nhóm được chọn thì return tên nhóm */
  if (SELECTED_GROUP) return SELECTED_GROUP.group_name

  /** nếu chỉ có 1 trang được chọn */
  if (selected_page_ids.value.length === 1) {
    const SELECTED_PAGE = current_org_pages.value.find(
      page => page.page_id === selected_page_ids.value[0],
    )

    if (SELECTED_PAGE) return SELECTED_PAGE.name
  }

  return t('Tất cả nhóm')
})

onMounted(readGroup)

watch(
  () => orgStore.selected_org_id,
  () => readGroup(),
)

/** chuyển tab */
function selectTab(tab: SelectTab) {
  /** clear tìm kiếm */
  search_keyword.value = ''
  /** change tab */
  active_tab.value = tab
  /** focus vào input tìm kiếm sau khi tab được chuyển */
  nextTick(() => {
    input_search_ref.value?.focus()
  })
}

/** mở dropdown */
function openSelectGroup($event: MouseEvent) {
  dropdown_ref.value?.toggleDropdown($event)
  // tự động mở tab có chứa cái được chọn
  if (selected_group_id.value) {
    active_tab.value = 'GROUP'
  } else {
    active_tab.value = 'PAGE'
  }

  /** focus vào input tìm kiếm sau khi dropdown được mở */
  nextTick(() => {
    input_search_ref.value?.focus()
  })
}

/** kiểm tra có phải nhóm đã chọn hay không */
function isSelectedGroup(group_id: string) {
  return group_id === selected_group_id.value
}

/** lấy text giới hạn nhóm */
function getGroupLimitText(group: SelectGroupOption) {
  /** nếu là tất cả nhóm */
  if (group.is_all) {
    const PACKAGE = orgStore.selected_org_info?.org_package
    return `${formatLimit(PACKAGE?.org_current_page)} ${t('v1.common.page')} - ${formatLimit(
      PACKAGE?.org_current_staff,
    )} ${t('v1.view.main.dashboard.org_staff.member')}`
  }
  /** nếu không phải là tất cả nhóm thì return tên nhóm */
  return `${formatLimit(group?.group_pages?.length)} ${t('v1.common.page')} - ${formatLimit(
    group?.group_staffs?.length,
  )} ${t('v1.view.main.dashboard.org_staff.member')}`
}

/** build danh sách trang được chọn */
function buildSelectedPageList(group_id: string) {
  /** danh sách id trang được chọn */
  const NEXT_SELECTED_PAGE_ID_LIST: Record<string, boolean> = {}

  /** nếu là tab tất cả */
  if (group_id === 'ALL') {
    current_org_pages.value.forEach(page => {
      NEXT_SELECTED_PAGE_ID_LIST[page.page_id] = true
    })

    return NEXT_SELECTED_PAGE_ID_LIST
  }
  /** nếu không phải là tab tất cả thì return tên nhóm */
  const GROUP = group_options.value.find(group => group.group_id === group_id)
  /** nếu có nhóm thì return danh sách trang */
  GROUP?.group_pages?.forEach(page_id => {
    if (pageStore.all_page_list?.[page_id])
      NEXT_SELECTED_PAGE_ID_LIST[page_id] = true
  })

  /** return danh sách id trang được chọn */
  return NEXT_SELECTED_PAGE_ID_LIST
}

/** chọn nhóm */
function selectGroup(group_id: string) {
  /** id tổ chức hiện tại */
  const ORG_ID = orgStore.selected_org_id || ''
  /** nếu không có org_id thì return false */
  if (!ORG_ID) return

  /** nếu là tab tất cả thì xóa group_id */
  if (group_id === 'ALL') delete orgStore.selected_org_group[ORG_ID]
  /** nếu không phải là tab tất cả thì set group_id */ else
    orgStore.selected_org_group[ORG_ID] = group_id

  /** build danh sách id trang được chọn */
  pageStore.selected_page_id_list = buildSelectedPageList(group_id)
  /** ẩn dropdown */
  dropdown_ref.value?.immediatelyHide()
  /** đóng tab chọn nhóm */
  is_open.value = false
}

/** kiểm tra có phải chỉ chọn 1 trang hay không */
function isSelectedOnlyPage(page_id: string) {
  return (
    selected_page_ids.value.length === 1 &&
    selected_page_ids.value[0] === page_id
  )
}

/** chọn trang */
function selectPage(page_id: string) {
  /** id tổ chức hiện tại */
  const ORG_ID = orgStore.selected_org_id
  /** nếu không có org_id hoặc page_id thì return false */
  if (!ORG_ID || !page_id) return

  /** xóa group_id */
  delete orgStore.selected_org_group[ORG_ID]
  /** set page_id */
  pageStore.selected_page_id_list = { [page_id]: true }
  /** ẩn dropdown */
  dropdown_ref.value?.immediatelyHide()
  /** đóng tab chọn nhóm */
  is_open.value = false
}

/** đồng bộ map trang - nhóm */
function syncPageGroupMap() {
  /** reset map trang - nhóm */
  pageManagerStore.pape_to_group_map = {}

  /** duyệt qua từng nhóm */
  groups.value.forEach(group => {
    /** duyệt qua từng trang */
    group?.group_pages?.forEach(page_id => {
      /** nếu không có page_id hoặc group_id thì return false */
      if (!page_id || !group?.group_id) return

      /** set map trang - nhóm */
      pageManagerStore.pape_to_group_map[page_id] = [
        ...(pageManagerStore.pape_to_group_map[page_id] || []),
        group.group_id,
      ]
    })
  })
}

/** đọc danh sách nhóm */
async function readGroup() {
  /** id tổ chức hiện tại */
  const ORG_ID = orgStore.selected_org_id || ''
  /** nếu không có org_id thì return false */
  if (!ORG_ID) return

  try {
    /** đọc danh sách nhóm */
    groups.value = await new BillingAppGroup().readGroup(
      orgStore.selected_org_id,
    )

    /** set danh sách nhóm */
    orgStore.list_group = groups.value
    /** đồng bộ map trang - nhóm */
    syncPageGroupMap()
  } catch {
    /** reset danh sách nhóm */
    groups.value = []
    /** reset danh sách nhóm */
    orgStore.list_group = []
  }
}

/** mở cài đặt nhóm */
function openGroupSetting() {
  /** ẩn dropdown */
  dropdown_ref.value?.immediatelyHide()
  /** đóng tab chọn nhóm */
  is_open.value = false
  /** chuyển sang trang cài đặt nhóm */
  $router.replace('/dashboard/org/setting').then(() => {
    setTimeout(() => {
      /** block cài đặt nhóm */
      const EL = document.getElementById('org--group')
      // nếu có thì scroll tới
      if (EL) EL.scrollIntoView()
    }, 300)
  })
}
</script>
