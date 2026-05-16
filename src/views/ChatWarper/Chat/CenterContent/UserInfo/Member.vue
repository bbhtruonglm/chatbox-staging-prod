<template>
  <Dropdown
    ref="member_ref"
    width="280px"
    height="auto"
    :is_fit="false"
    position="BOTTOM"
    :distance="9"
    class_content="flex flex-col  gap-1 max-h-[210px] "
  >
    <div class="flex justify-between gap-2 p-2 text-right items-center">
      <div class="size-5"></div>
      <span>{{ $t('v1.common.list_member') }}</span>
      <div
        class="bg-slate-100 p-1 rounded-full cursor-pointer"
        v-tooltip="$t('Thêm thành viên')"
        @click="emit('add-member')"
      >
        <UserPlusIcon class="size-4" />
      </div>
    </div>
    <div
      v-if="is_loading"
      class="relative z-10"
    >
      <div class="absolute top-6 left-[43%] translate-x-1/2">
        <Loading class="mx-auto" />
      </div>
    </div>
    <div class="overflow-hidden overflow-y-auto">
      <!-- Lặp qua member_lists và hiển thị từng memberItem -->
      <MemberItem
        v-for="(item, index) in member_lists"
        :key="item.client_id || index"
        :avatar_member="item.client_avatar || ''"
        :name_member="item.client_name || ''"
        :member_id="item.client_id || ''"
        :page_id="props.page_id || ''"
        :group_id="props.group_id || ''"
      />

      <!-- Nếu không có thành viên nào thì hiển thị thông báo -->
      <div
        v-if="member_lists.length === 0"
        class="text-gray-500 text-center py-8"
      >
        <p v-if="!is_loading">{{ $t('Chưa có thành viên nào') }}</p>
      </div>
    </div>
  </Dropdown>
</template>

<script setup lang="ts">
import type { IGroupMember } from '@/utils/api/N4Service/ZaloPersonal'
import { computed, ref } from 'vue'
import { useZaloGroupMemberStore } from '@/stores'

/**component*/
import Dropdown from '@/components/Dropdown.vue'
import Loading from '@/components/Loading.vue'

import { UserPlusIcon } from '@heroicons/vue/24/outline'

/**component con*/
import MemberItem from '@/views/ChatWarper/Chat/CenterContent/UserInfo/Member/MemberItem.vue'

import { useI18n } from 'vue-i18n'

/** Props truyền danh sách thành viên và định danh nhóm từ component cha. */
const props = withDefaults(
  defineProps<{
    /** Danh sách thành viên nhóm đang hiển thị. */
    members?: IGroupMember[]
    /** Trạng thái loading danh sách thành viên nhóm. */
    is_loading?: boolean
    /** Id trang Zalo cá nhân của nhóm. */
    page_id?: string
    /** Id nhóm Zalo hiện tại. */
    group_id?: string
  }>(),
  {
    /** Mặc định danh sách thành viên là mảng rỗng. */
    members: () => [],
    /** Mặc định trạng thái loading là false. */
    is_loading: false,
  }
)

/** Emit thao tác mở modal thêm thành viên. */
const emit = defineEmits<{
  /** Báo component cha mở modal thêm thành viên. */
  (e: 'add-member'): void
}>()

const { t: $t } = useI18n()

/** Store cache danh sách thành viên nhóm Zalo. */
const zaloGroupMemberStore = useZaloGroupMemberStore()

/**ref của dropdown danh sách thành viên nhóm */
const member_ref = ref<InstanceType<typeof Dropdown>>()

/** Danh sách thành viên nhóm lấy từ props. */
const member_lists = computed(() => {
  // Trả về danh sách thành viên để template render.
  return props.members
})

/** Trạng thái loading danh sách thành viên nhóm lấy từ props. */
const is_loading = computed(() => {
  // Trả về trạng thái loading để template hiển thị loading.
  return props.is_loading
})

/**
 * Ẩn hoặc hiện dropdown danh sách thành viên nhóm.
 * @param event - Sự kiện click mở dropdown từ nút thành viên.
 */
function toggle(event?: MouseEvent) {
  // Gọi dropdown để đổi trạng thái hiển thị.
  member_ref.value?.toggleDropdown(event)

  // Nếu thiếu page_id hoặc group_id thì không tải member.
  if (!props.page_id || !props.group_id) return

  // Đảm bảo danh sách member đã có trong store, cache sẽ tránh gọi lại API.
  zaloGroupMemberStore.ensureGroupMembers({
    page_id: props.page_id,
    group_id: props.group_id,
  }).catch(ERROR => {
    // Ghi log lỗi tải danh sách member khi mở dropdown.
    console.error('Lỗi tải danh sách thành viên nhóm:', ERROR)
  })
}

defineExpose({
  toggle,
})
</script>
