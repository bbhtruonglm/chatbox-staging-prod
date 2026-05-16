<template>
  <CardItem
    v-if="$main.countPage()"
    id="all-org__org-item"
    :class="{
      'opacity-50':
        orgStore.selected_org_id !== org_id &&
        !isEmpty(pageStore.selected_page_id_list) &&
        selectPageStore.is_group_page_mode,
    }"
    class="group/org-item pt-0"
    class_title="flex items-center gap-2 flex-grow min-w-0 w-full overflow-hidden"
    class_content="!gap-0"
    class_header_content="!py-3 sticky top-0 bg-white z-10"
  >
    <template #icon>
      <div class="sticky top-0 pt-3">
        <img
          v-if="
            pageStore.map_orgs?.map_org_info?.[org_id]?.org_info?.org_avatar
          "
          :src="
            pageStore.map_orgs?.map_org_info?.[org_id]?.org_info?.org_avatar
          "
          class="w-5 h-5 rounded-oval object-cover"
        />
        <BriefCaseIcon
          v-else
          class="w-5 h-5 text-slate-700"
        />
      </div>
    </template>
    <template #title>
      <div class="flex-shrink-0">
        {{ pageStore.map_orgs?.map_org_info?.[org_id]?.org_info?.org_name }}
      </div>
      <Group :org_id />
    </template>
    <template #action>
      <OrgTitleAction
        v-if="size(active_page_list)"
        :org_id
        :active_page_list
      />
    </template>
    <template #item>
      <OrgPages
        :active_page_list="active_page_list"
        :org_id
      />
    </template>
  </CardItem>
</template>
<script setup lang="ts">
import {
  useOrgStore,
  usePageStore,
  useSelectPageStore,
} from '@/stores'
import { isEmpty, size } from 'lodash'

import CardItem from '@/components/Main/Dashboard/CardItem.vue'
import Group from '@/views/Dashboard/SelectPage/AllOrg/Org/Group.vue'
import OrgPages from '@/views/Dashboard/SelectPage/AllOrg/Org/OrgPages.vue'
import OrgTitleAction from '@/views/Dashboard/SelectPage/AllOrg/Org/OrgTitleAction.vue'

import BriefCaseIcon from '@/components/Icons/BriefCase.vue'

import type { PageData } from '@/service/interface/app/page'

const $props = withDefaults(
  defineProps<{
    /** id tổ chức */
    org_id: string
    /** số lượng page của org trước khi filter group */
    visible_page_count?: number
    /** danh sách page đã được lọc/sort sẵn cho tổ chức hiện tại */
    active_page_list: PageData[]
  }>(),
  {
    visible_page_count: 0,
    active_page_list: () => [],
  }
)

const orgStore = useOrgStore()
const pageStore = usePageStore()
const selectPageStore = useSelectPageStore()

class Main {
  /** đếm số page của tổ chức hiện tại với nền tảng đang được lọc */
  countPage(): number {
    return $props.visible_page_count || 0
  }
}
const $main = new Main()

defineExpose({ countPage: $main.countPage.bind($main) })
</script>
