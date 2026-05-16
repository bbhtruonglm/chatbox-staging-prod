<template>
  <header
    class="theme-card flex items-center w-full shadow-lg py-2.5 px-5 gap-4"
  >
    <div class="flex items-center">
      <div class="group">
        <div class="size-8 peer group-hover:hidden">
          <img
            v-if="
              isShowOrgLogo() &&
              orgStore.selected_org_info?.org_info?.org_avatar
            "
            :src="orgStore.selected_org_info?.org_info?.org_avatar"
            class="w-full h-full rounded-full object-cover"
          />
          <img
            v-else
            :src="commonStore.partner?.logo?.icon"
            class="w-full h-full"
          />
        </div>
        <div
          @click="$router.push('/dashboard/select-page')"
          v-tooltip.right="$t('Quay lại Trình quản lý Trang')"
          class="cursor-pointer hidden group-hover:flex justify-center items-center size-8 bg-black rounded-full"
        >
          <ArrowLeftIcon class="size-5 text-white" />
        </div>
      </div>
      <div
        v-if="!orgStore.selected_org_info"
        class="h-8 w-40 bg-slate-200 rounded animate-pulse"
      ></div>
      <SelectOrgChat v-else />
    </div>
    <div class="flex-1 flex items-center gap-2 font-medium">
      <!-- <button
        class="theme-hover flex items-center gap-2 py-2.5 px-3 rounded-lg"
        @click="activeTab('INTERNAL')"
        :class="current_tab === 'INTERNAL' ? 'theme-active' : ''"
      >
        <ChatBubbleLeftRightIcon class="size-4" />
        <p>{{ $t('Chat Nội bộ') }}</p>
      </button> -->
      <button
        class="theme-hover flex items-center gap-2 py-2.5 px-3 rounded-lg"
        @click="activeTab('CHAT')"
        :class="current_tab === 'CHAT' ? 'theme-active' : ''"
      >
        <ChatBubbleLeftRightIcon class="size-4" />
        <p>{{ $t('Chat khách hàng') }}</p>
        <!-- <Badge :value="conversationStore.count_conversation.chat" /> -->
      </button>
      <button
        class="theme-hover flex items-center gap-2 py-2.5 px-3 rounded-lg"
        @click="activeTab('POST')"
        :class="current_tab === 'POST' ? 'theme-active' : ''"
      >
        <NewspaperIcon class="size-4" />
        <p>{{ $t('Bài viết') }}</p>
        <!-- <Badge :value="conversationStore.count_conversation.post" /> -->
      </button>
      <button
        v-if="!commonStore.in_merchant"
        class="theme-hover hidden xl:flex  items-center gap-2 py-2.5 px-3 rounded-lg"
        @click="$external_site.openMerchant('login', 'a/order')"
      >
        <ShoppingBagIcon class="size-4" />
        <p class="flex items-center">
          {{ $t('v1.common.order') }}
          <ArrowUpRightIcon class="size-4" />
        </p>
      </button>
      <button
        class="theme-hover hidden xl:flex items-center gap-2 py-2.5 px-3 rounded-lg"
        :class="current_tab === 'ANALYTIC' ? 'theme-active' : ''"
        @click="
          () => {
            commonStore.analytic_url = $external_site.createAnalyticUrl()
          }
        "
      >
        <ChartBarSquareIcon class="size-4" />
        <p class="flex items-center">
          {{ $t('v1.view.main.dashboard.nav.analytic') }}
        </p>
      </button>
      <button
        class="theme-hover flex items-center gap-2 py-2.5 px-3 rounded-lg"
        @mouseover="attach_ref?.attach_ref?.mouseover"
        @mouseleave="attach_ref?.attach_ref?.mouseleave"
      >
        <SquaresPlusIcon class="size-4" />
        <p>{{ $t('Thêm') }}</p>
        <ChevronDownIcon class="size-4" />
      </button>
    </div>
    <User
      position="BOTTOM"
      :size="20"
      :show_name="true"
    />
    <Attach ref="attach_ref" />
  </header>
</template>

<script setup lang="ts">
import {
  useCommonStore,
  useConversationStore,
  useOrgStore,
  usePageStore,
} from '@/stores'
import { ExternalSite } from '@/utils/helper/ExternalSite'
import { container } from 'tsyringe'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import Badge from '@/components/Badge.vue'
import User from '@/components/User.vue'
import SelectOrgChat from '@/views/ChatWarper/Header/SelectOrgChat.vue'
import Attach from '@/views/ChatWarper/Menu/Attach.vue'

import type { FilterConversation } from '@/service/interface/app/conversation'
import {
  ChartBarSquareIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  NewspaperIcon,
  ShoppingBagIcon,
  SquaresPlusIcon,
} from '@heroicons/vue/24/outline'
import { ArrowLeftIcon, ArrowUpRightIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const $router = useRouter()
const $external_site = container.resolve(ExternalSite)
const { t: $t } = useI18n()

/**store */
const commonStore = useCommonStore()
const conversationStore = useConversationStore()
const orgStore = useOrgStore()
const pageStore = usePageStore()

/**ref của menu đính kèm */
const attach_ref = ref<InstanceType<typeof Attach>>()

/** tab đang được chọn */
const current_tab = computed(() => {
  if (commonStore.analytic_url) return 'ANALYTIC'
  return conversationStore.option_filter_page_data.conversation_type
})

watch(
  () => pageStore.selected_page_id_list,
  () => {
    // nếu đang chọn tab thống kê thì render lại link
    if (current_tab.value === 'ANALYTIC') {
      commonStore.analytic_url = $external_site.createAnalyticUrl()
    }
  },
)

/**kiểm tra xem có hiển thị logo tổ chức không */
function isShowOrgLogo() {
  return orgStore.isBusinessPack()
}

/**chuyển đổi tab đang kích hoạt */
function activeTab(
  tab: FilterConversation['conversation_type'] | 'ORDER' | 'ANALYTIC',
) {
  // nếu là tab thống kê
  if (tab === 'ANALYTIC') {
    return (commonStore.analytic_url = $external_site.createAnalyticUrl())
  } else {
    commonStore.analytic_url = ''
  }

  // nếu là tab đơn hàng
  if (tab === 'ORDER') {
    return $external_site.openMerchant('login', 'a/order')
  }

  // thay đổi cờ
  conversationStore.option_filter_page_data.conversation_type = tab

  // nếu tab là dạng bài biết thì thêm param lên url
  $router.push({
    query: {
      ...$router.currentRoute.value.query,
      tab: tab === 'POST' ? 'POST' : undefined,
    },
  })
}
</script>
