<template>
  <div
    id="select-page__all-org"
    class="overflow-y-auto flex flex-col gap-6 pb-16"
  >
    <SkeletonGroupPage v-if="selectPageStore.is_loading" />
    <template v-else>
      <template
        v-for="org of sortBy(orgStore.list_org, 'org_info.org_name')"
        class="flex flex-col gap-2"
      >
        <Org
          v-if="org?.org_id && $main.isVisibleOrg(org?.org_id)"
          :key="org?.org_id"
          :org_id="org?.org_id"
          :active_page_list="active_pages_of_orgs[org?.org_id] || []"
          :visible_page_count="visible_page_count_by_org[org?.org_id] || 0"
        />
      </template>
      <EmptyPage
        v-if="$main.isVisibleEmptyPage() && !selectPageStore.is_loading"
      />
    </template>
  </div>
</template>
<script setup lang="ts">
import {
  useOrgStore,
  usePageStore,
  useSelectPageStore,
  usePageManagerStore,
} from '@/stores'
import { usePageManager } from '@/views/Dashboard/composables/usePageManager'
import { isEmpty, omitBy, sortBy } from 'lodash'
import { computed, provide, watch } from 'vue'
import { KEY_ADVANCE_SELECT_AGE_FUNCT } from './symbol'

import Org from '@/views/Dashboard/SelectPage/AllOrg/Org.vue'
import EmptyPage from '@/views/Dashboard/SelectPage/EmptyPage.vue'
import SkeletonGroupPage from '@/views/Dashboard/SkeletonGroupPage.vue'

import type { PageData, PageList } from '@/service/interface/app/page'
import { BillingAppGroup } from '@/utils/api/Billing'

const selectPageStore = useSelectPageStore()
const pageStore = usePageStore()
const orgStore = useOrgStore()
const pageManagerStore = usePageManagerStore()
const { sortListPage } = usePageManager()

/**
 * Tính toán danh sách các trang đang hoạt động được gom nhóm theo từng tổ chức.
 * Gom page theo org một lần để tránh mỗi Org tự quét lại toàn bộ list.
 */
const active_pages_of_orgs = computed<Record<string, PageData[]>>(() => {
  // khởi tạo biến chứa kết quả danh sách trang đã gom nhóm theo tổ chức
  let grouped_pages_by_org: Record<string, PageData[]> = {}
  
  // lấy toàn bộ các trang đang hoạt động từ store
  let current_active_pages = pageStore.active_page_list || {}
  
  // lấy ánh xạ để tìm tổ chức từ id trang
  let map_page_to_org = pageStore.map_orgs?.map_page_org || {}
  
  // lấy ánh xạ để tìm nhóm từ id trang
  let map_page_to_group = pageManagerStore.pape_to_group_map || {}
  
  // lấy thông tin nhóm đã chọn của từng tổ chức
  let selected_group_of_org = orgStore.selected_org_group || {}

  // lặp qua từng trang trong danh sách đang hoạt động để phân loại
  for (let page_key in current_active_pages) {
    // lấy thông tin chi tiết của trang hiện tại
    let current_page = current_active_pages[page_key]
    
    // trích xuất id của trang hiện tại
    let current_page_id = current_page?.page?.fb_page_id

    // nếu không tồn tại id trang thì bỏ qua vòng lặp này
    if (!current_page_id) continue

    // lấy id tổ chức quản lý trang này
    let current_org_id = map_page_to_org[current_page_id]
    
    // nếu không có tổ chức quản lý hoặc tổ chức đang bị ẩn thì bỏ qua
    if (!current_org_id || !$main.isVisibleOrg(current_org_id)) continue

    // lấy id nhóm đang được chọn của tổ chức hiện tại
    let active_group_id = selected_group_of_org[current_org_id]
    
    // kiểm tra nếu người dùng có chọn nhóm nhưng trang không nằm trong nhóm đó thì bỏ qua
    if (
      active_group_id &&
      !map_page_to_group[current_page_id]?.includes(active_group_id)
    )
      continue

    // nếu tổ chức này chưa có mảng lưu trữ trang thì tạo mới
    if (!grouped_pages_by_org[current_org_id]) grouped_pages_by_org[current_org_id] = []
    
    // đẩy trang hợp lệ vào mảng của tổ chức tương ứng
    grouped_pages_by_org[current_org_id].push(current_page)
  }

  // lặp qua kết quả đã phân loại để tiến hành sắp xếp lại danh sách trang
  for (let org_id in grouped_pages_by_org) {
    // khởi tạo đối tượng chứa các trang của tổ chức để chuẩn bị sắp xếp
    let pages_of_current_org: PageList = {}

    // duyệt qua từng trang của tổ chức để chuyển thành dạng đối tượng
    grouped_pages_by_org[org_id].forEach(org_page => {
      // trích xuất id của trang
      let fb_page_id = org_page?.page?.fb_page_id
      
      // nếu không lấy được id thì thoát khỏi hàm lặp này
      if (!fb_page_id) return

      // gán trang vào đối tượng với khóa là id trang
      pages_of_current_org[fb_page_id] = org_page
    })

    // gọi hàm sắp xếp và gán lại danh sách đã sắp xếp cho tổ chức
    grouped_pages_by_org[org_id] = sortListPage(pages_of_current_org)
  }

  // trả về đối tượng chứa danh sách trang đã được nhóm và sắp xếp
  return grouped_pages_by_org
})

/**
 * Đếm số lượng trang gốc theo từng tổ chức.
 * Giữ số page gốc theo org để Org vẫn hiện khung ngay cả khi group hiện tại rỗng.
 */
const visible_page_count_by_org = computed<Record<string, number>>(() => {
  // khởi tạo biến chứa số lượng trang theo từng tổ chức
  let org_page_count: Record<string, number> = {}
  
  // lấy toàn bộ các trang đang hoạt động từ store
  let current_active_pages = pageStore.active_page_list || {}
  
  // lấy ánh xạ để tìm tổ chức từ id trang
  let map_page_to_org = pageStore.map_orgs?.map_page_org || {}

  // lặp qua từng trang trong danh sách đang hoạt động để đếm
  for (let page_key in current_active_pages) {
    // lấy thông tin chi tiết của trang hiện tại
    let current_page = current_active_pages[page_key]
    
    // trích xuất id của trang
    let current_page_id = current_page?.page?.fb_page_id

    // nếu không có id trang thì bỏ qua vòng lặp này
    if (!current_page_id) continue

    // lấy id tổ chức quản lý trang
    let current_org_id = map_page_to_org[current_page_id]
    
    // nếu không có tổ chức hoặc tổ chức đang bị ẩn thì bỏ qua
    if (!current_org_id || !$main.isVisibleOrg(current_org_id)) continue

    // tăng số lượng trang của tổ chức lên 1
    org_page_count[current_org_id] = (org_page_count[current_org_id] || 0) + 1
  }

  // trả về số lượng trang của từng tổ chức
  return org_page_count
})

class Main {
  /**có hiện ui không có page không */
  isVisibleEmptyPage() {
    for (const org_id in active_pages_of_orgs.value) {
      if (active_pages_of_orgs.value[org_id]?.length) return false
    }

    return true
  }
  /**lọc ra các trang thuộc 1 tổ chức nào đó */
  filterOrgPageOnly(page: PageData): boolean {
    /**id trang */
    const PAGE_ID = page?.page?.fb_page_id

    // nếu không có id trang thì ẩn
    if (!PAGE_ID) return false

    /**id tổ chức của trang này */
    const ORG_ID = pageStore.map_orgs?.map_page_org?.[PAGE_ID]

    // nếu không có tổ chức thì ẩn
    if (!ORG_ID) return false

    // hiện
    return true
  }
  /**xử lý khi trang được chọn ở chế độ nhiều */
  triggerSelectPage(page: PageData): void {
    // nếu không có page thì không chọn
    if (!page?.page?.fb_page_id) return

    // chọn lại tổ chức đang chọn
    orgStore.selected_org_id =
      pageStore.map_orgs?.map_page_org?.[page?.page?.fb_page_id!]

    // loại bỏ tất cả trang đang chọn khác tổ chức này
    pageStore.selected_page_id_list = omitBy(
      pageStore.selected_page_id_list,
      (v, page_id) => {
        /**id tổ chức của trang này */
        const ORG_ID = pageStore.map_orgs?.map_page_org?.[page_id]

        // nếu tổ chức không phải tổ chức đang chọn thì loại bỏ
        return ORG_ID !== orgStore.selected_org_id
      }
    )
  }

  /** có hiện ui của tổ chức hay không */
  isVisibleOrg(org_id?: string) {
    // nếu là chọn tất cả thì hiện
    if (orgStore.is_selected_all_org) return true

    // chọn 1 tố tổ chức thì chỉ hiện tổ chức đã chọn
    return org_id === orgStore.selected_org_id
  }

  /**đọc danh sách nhóm */
  async readGroup(): Promise<void> {
    /** danh sách các tổ chức */
    const LIST_ORG = orgStore.list_org || []
    /** Lấy list org id */
    const ORG_IDS = LIST_ORG.map(item => item.org_id || '')
    if (isEmpty(ORG_IDS)) return
    /** toàn bộ nhóm từ server */
    const RES = await new BillingAppGroup().readAllGroup(ORG_IDS)

    /** Lưu list vào store */
    orgStore.list_group = RES

    // reset lại map
    pageManagerStore.pape_to_group_map = {}

    // lặp qua các nhóm lưu lại ánh xạ id của từng page với id nhóm của page đó
    RES?.forEach(group => {
      group?.group_pages?.forEach(page_id => {
        // nếu không có id page hoặc id nhóm thì thôi
        if (!page_id || !group?.group_id || !group?.org_id) return
        // lưu ánh xạ từ id page tới id nhóm
        pageManagerStore.pape_to_group_map[page_id] = [
          ...(pageManagerStore.pape_to_group_map[page_id] || []),
          group?.group_id,
        ]
      })
    })
  }
}
const $main = new Main()

watch(
  () => orgStore.list_org,
  list => {
    if (list && list.length) {
      $main.readGroup()
    }
  },
  { immediate: true }
)

// cung cấp hàm xử lý khi chọn trang
provide(KEY_ADVANCE_SELECT_AGE_FUNCT, $main.triggerSelectPage)
</script>
