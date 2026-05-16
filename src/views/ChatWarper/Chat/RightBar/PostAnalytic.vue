<template>
  <div
    class="flex-grow min-h-0 overflow-y-auto p-3 flex flex-col gap-8 relative"
  >
    <div
      v-if="is_initial_loading"
      class="flex flex-col gap-8"
    >
      <div class="flex flex-col gap-1">
        <div class="w-28 h-4 bg-slate-200 rounded-full animate-pulse" />
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="index in 3"
            :key="`post-analytic-overview-${index}`"
            class="flex gap-2 items-center py-1.5 px-2 rounded-lg bg-slate-100"
          >
            <div class="w-7 h-7 rounded-lg bg-slate-200 animate-pulse" />
            <div class="flex flex-col gap-1">
              <div class="w-14 h-3 bg-slate-200 rounded-full animate-pulse" />
              <div class="w-8 h-3 bg-slate-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="w-44 h-4 bg-slate-200 rounded-full animate-pulse" />
        <div class="flex items-center justify-between gap-2">
          <div
            v-for="index in 6"
            :key="`post-analytic-fb-emotion-${index}`"
            class="flex flex-col gap-1 items-center"
          >
            <div class="w-7 h-7 rounded-lg bg-slate-200 animate-pulse" />
            <div class="w-8 h-3 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="w-48 h-4 bg-slate-200 rounded-full animate-pulse" />
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="index in 4"
            :key="`post-analytic-ai-emotion-${index}`"
            class="flex gap-2 items-center py-1.5 px-2 rounded-lg bg-slate-100"
          >
            <div class="w-7 h-7 rounded-lg bg-slate-200 animate-pulse" />
            <div class="flex flex-col gap-1">
              <div class="w-16 h-3 bg-slate-200 rounded-full animate-pulse" />
              <div class="w-9 h-3 bg-slate-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="w-56 h-4 bg-slate-200 rounded-full animate-pulse" />
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="index in 6"
            :key="`post-analytic-conversion-${index}`"
            class="flex gap-2 items-center py-1.5 px-2 rounded-lg bg-slate-100"
          >
            <div class="w-7 h-7 rounded-lg bg-slate-200 animate-pulse" />
            <div class="flex flex-col gap-1">
              <div class="w-12 h-3 bg-slate-200 rounded-full animate-pulse" />
              <div class="w-8 h-3 bg-slate-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-3">
        <div class="w-28 h-4 bg-slate-200 rounded-full animate-pulse" />
        <div
          v-for="index in 5"
          :key="`post-analytic-info-${index}`"
          class="flex items-center gap-2"
        >
          <div class="w-20 h-3 bg-slate-200 rounded-full animate-pulse" />
          <div class="w-28 h-3 bg-slate-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
    <template v-else>
      <div class="flex flex-col gap-1">
        <div class="text-sm font-medium">{{ $t('Thống kê chung') }}:</div>
        <div class="flex flex-col gap-3">
          <!-- <div class="grid grid-cols-2 gap-3">
              <InsightItem
                :icon="UserGroupIcon"
                :title="$t('Số người tiếp cận')"
                :amount="123.2323"
              />
              <InsightItem
                :icon="CursorArrowRaysIcon"
                :title="$t('Lượt click vào link')"
                :amount="123.2323"
              />
            </div> -->
          <div class="grid grid-cols-3 gap-3">
            <InsightItem
              :icon="FireIcon"
              :title="$t('Reaction')"
              :amount="total_reaction"
            />
            <InsightItem
              :icon="ChatBubbleLeftRightIcon"
              :title="$t('Bình luận')"
              :amount="analytic?.total_comment"
            />
            <InsightItem
              :icon="ArrowUpOnSquareIcon"
              :title="$t('Chia sẻ')"
              :amount="analytic?.total_share"
            />
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="text-sm font-medium">
          {{ $t('Thống kê Cảm xúc từ Facebook') }}:
        </div>
        <div class="flex items-center justify-between">
          <FbEmotionInsightItem
            :icon="LikeIcon"
            v-tooltip="$t('Thích')"
            :amount="analytic?.total_reaction_like"
          />
          <FbEmotionInsightItem
            :icon="LoveIcon"
            v-tooltip="$t('Yêu thích')"
            :amount="analytic?.total_reaction_love"
          />
          <FbEmotionInsightItem
            :icon="WowIcon"
            v-tooltip="$t('Wow')"
            :amount="analytic?.total_reaction_wow"
          />
          <FbEmotionInsightItem
            :icon="HahaIcon"
            v-tooltip="$t('Haha')"
            :amount="analytic?.total_reaction_haha"
          />
          <FbEmotionInsightItem
            :icon="SadIcon"
            v-tooltip="$t('Buồn')"
            :amount="analytic?.total_reaction_sorry"
          />
          <FbEmotionInsightItem
            :icon="AngryIcon"
            v-tooltip="$t('Giận dữ')"
            :amount="analytic?.total_reaction_anger"
          />
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="text-sm font-medium">
          {{ $t('Thống kê Cảm xúc từ Bình luận (AI)') }}:
        </div>
        <div class="flex flex-col gap-3">
          <div class="grid grid-cols-2 gap-3">
            <InsightItem
              :icon="LikeIcon"
              :title="$t('Thích')"
              :amount="analytic?.total_emotion_like"
            />
            <InsightItem
              :icon="HahaIcon"
              :title="$t('Vui vẻ')"
              :amount="analytic?.total_emotion_happy"
            />
            <InsightItem
              :icon="SadIcon"
              :title="$t('Buồn')"
              :amount="analytic?.total_emotion_sad"
            />
            <InsightItem
              :icon="AngryIcon"
              :title="$t('Giận dữ')"
              :amount="analytic?.total_emotion_angry"
            />
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="text-sm font-medium">
          {{ $t('Thống kê Chuyển đổi từ Bình luận (AI)') }}:
        </div>
        <div class="flex flex-col gap-3">
          <div class="grid grid-cols-3 gap-3">
            <InsightItem
              :icon="ShoppingBagIcon"
              :title="$t('Lên đơn')"
              :amount="analytic?.total_cta_place_order"
            />
            <InsightItem
              :icon="CalendarDaysIcon"
              :title="$t('Lập lịch')"
              :amount="analytic?.total_cta_time"
            />
            <InsightItem
              :icon="LinkIcon"
              :title="$t('Liên kết')"
              :amount="analytic?.total_cta_link"
            />
            <InsightItem
              :icon="PhoneIcon"
              :title="$t('SĐT')"
              :amount="analytic?.total_cta_phone"
            />
            <InsightItem
              :icon="MapPinIcon"
              :title="$t('Địa chỉ')"
              :amount="analytic?.total_cta_address"
            />
            <InsightItem
              :icon="EnvelopeIcon"
              :title="$t('Email')"
              :amount="analytic?.total_cta_email"
            />
          </div>
        </div>
      </div>
      <ul class="list-disc list-inside text-sm">
        <span class="font-medium">
          {{ $t('Thông tin bài viết') }}
        </span>
        <li>
          {{ $t('ID bài viết') }}:
          {{ conversationStore.select_conversation_post?.post_id }}
        </li>
        <li>
          {{ $t('Ngày tạo') }}:
          {{
            $date_handle.format(
              conversationStore.select_conversation_post?.createdAt,
              'dd/MM/yyyy'
            )
          }}
        </li>
        <li>
          {{ $t('Người tạo') }}:
          {{ creator_name }}
        </li>
        <li>
          {{ $t('Ngày cập nhật') }}:
          {{
            $date_handle.format(
              conversationStore.select_conversation_post?.createdAt,
              'dd/MM/yyyy'
            )
          }}
        </li>
        <li>
          {{ $t('Người cập nhật') }}:
          {{ creator_name }}
        </li>
      </ul>
    </template>
  </div>
</template>
<script setup lang="ts">
import { useConversationStore } from '@/stores'
import { container } from 'tsyringe'
import { computed, onMounted, ref, watch } from 'vue'
import { composableService } from '@/views/ChatWarper/Chat/CenterContent/MessageList/PostTemplate/service'
import { DateHandle } from '@/utils/helper/DateHandle'
import { N4SerivceAppPost } from '@/utils/api/N4Service/Post'
import { error } from '@/utils/decorator/Error'
import { loadingV2 } from '@/utils/decorator/Loading'

import InsightItem from '@/views/ChatWarper/Chat/RightBar/PostAnalytic/InsightItem.vue'
import FbEmotionInsightItem from '@/views/ChatWarper/Chat/RightBar/PostAnalytic/FbEmotionInsightItem.vue'
import Loading from '@/components/Loading.vue'

import LikeIcon from '@/components/Icons/Like.vue'
import LoveIcon from '@/components/Icons/Love.vue'
import WowIcon from '@/components/Icons/Wow.vue'
import HahaIcon from '@/components/Icons/Haha.vue'
import SadIcon from '@/components/Icons/Sad.vue'
import AngryIcon from '@/components/Icons/Angry.vue'
import {
  FireIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpOnSquareIcon,
  ShoppingBagIcon,
  CalendarDaysIcon,
  LinkIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
} from '@heroicons/vue/24/solid'
import { sum } from 'lodash'

const { PostService } = composableService()

const $post_service = container.resolve(PostService)
const $date_handle = container.resolve(DateHandle)
const conversationStore = useConversationStore()

/**loading lần đầu để hiển thị skeleton */
const is_initial_loading = ref<boolean>(false)

/**tên người tạo bài viết này */
const creator_name = computed(() =>
  $post_service.getCreatorName(conversationStore.select_conversation_post)
)
/**id của page */
const page_id = computed(
  () => conversationStore.select_conversation_post?.page_id
)
/**id của bài viết */
const post_id = computed(
  () => conversationStore.select_conversation_post?.post_id
)
/**thống kê của bài viết */
const analytic = computed(
  () => conversationStore.select_conversation_post_analytic?.post_analytic_data
)
/**tổng số lượng reaction */
const total_reaction = computed(() => {
  return sum([
    analytic.value?.total_reaction_like,
    analytic.value?.total_reaction_love,
    analytic.value?.total_reaction_wow,
    analytic.value?.total_reaction_haha,
    analytic.value?.total_reaction_sorry,
    analytic.value?.total_reaction_anger,
  ])
})

class Main {
  /**
   * @param API_POST API lấy dữ liệu bài post
   */
  constructor(
    private readonly API_POST: N4SerivceAppPost = container.resolve(
      N4SerivceAppPost
    )
  ) {}
  /**đọc thống kê của bài viết này */
  @loadingV2(is_initial_loading, 'value')
  @error()
  async getPostAnalytic(is_refresh_cache?: boolean) {
    const should_show_skeleton = !is_refresh_cache

    try {
      if (should_show_skeleton) is_initial_loading.value = true

      // xấc thực dữ liệu
      if (!page_id.value || !post_id.value) return

      // lấy dữ liệu
      conversationStore.select_conversation_post_analytic =
        await this.API_POST.getPostAnalytic(
          page_id.value,
          post_id.value,
          undefined,
          is_refresh_cache
        )
    } finally {
      if (should_show_skeleton) is_initial_loading.value = false
    }
  }
}
const $main = new Main()

// khi component được mount
onMounted(() => $main.getPostAnalytic())

// khi đổi bài viết
watch(
  () => post_id.value,
  () => $main.getPostAnalytic()
)

defineExpose({ getPostAnalytic: $main.getPostAnalytic.bind($main) })
</script>
