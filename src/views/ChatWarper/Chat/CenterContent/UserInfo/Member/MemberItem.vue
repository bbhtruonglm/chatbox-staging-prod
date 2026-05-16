<template>
  <div class="flex items-center p-2 gap-3 hover:bg-gray-100 rounded-md group">
    <!-- avatar -->
    <div class="flex items-center flex-1 overflow-hidden gap-5">
      <img
        :src="props.avatar_member"
        alt="avatar"
        class="w-8 h-8 flex-shrink-0 rounded-full"
      />
      <!-- Tên thành viên -->
      <p
        class="flex flex-1 flex-col text-sm truncate overflow-hidden font-semibold flex-shrink-0"
      >
        {{ props.name_member }}
      </p>
    </div>
    <div
      @click="confirmDeleteMember()"
      class="opacity-0 group-hover:opacity-100"
      v-tooltip="$t('v1.common.remove_member')"
    >
      <TrashIcon class="size-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Toast } from '@/utils/helper/Alert/Toast'
import { TrashIcon } from '@heroicons/vue/24/outline'
import { confirm } from '@/service/helper/alert'
import { container } from 'tsyringe'
import { useI18n } from 'vue-i18n'
import { useZaloGroupMemberStore } from '@/stores'

/** Emit báo thao tác xóa thành viên đã thành công. */
const emit = defineEmits<{
  /** Báo component cha biết thao tác xóa đã hoàn tất. */
  (e: 'delete-success'): void
}>()

/** Props truyền thông tin thành viên và định danh nhóm. */
const props = defineProps<{
  /** Avatar thành viên. */
  avatar_member: string
  /** Tên thành viên. */
  name_member: string
  /** Id thành viên cần xóa. */
  member_id: string
  /** Id trang Zalo cá nhân của nhóm. */
  page_id: string
  /** Id nhóm Zalo hiện tại. */
  group_id: string
}>()

/** Hàm dịch nội dung giao diện. */
const $t = useI18n().t

/** Store cache danh sách thành viên nhóm Zalo. */
const zaloGroupMemberStore = useZaloGroupMemberStore()

/** Service hiển thị thông báo. */
const $toast = container.resolve(Toast)

/**
 * Xử lý xóa thành viên khỏi nhóm Zalo.
 * @param member_id - Id thành viên cần xóa khỏi nhóm.
 */
async function handleRemoveMember(member_id?: string) {
  // Nếu thiếu định danh nhóm hoặc thành viên thì dừng thao tác.
  if (!props.page_id || !props.group_id || !member_id) {
    // Hiển thị thông báo thiếu dữ liệu thao tác.
    $toast.error($t('Vui lòng chọn trang và khách hàng trước khi thực hiện'))

    // Kết thúc hàm khi dữ liệu không hợp lệ.
    return
  }

  try {
    // Gọi store xóa member, store sẽ gọi API remove và cập nhật cache local.
    await zaloGroupMemberStore.removeGroupMember({
      page_id: props.page_id,
      group_id: props.group_id,
      member_id,
    })

    // Hiển thị thông báo xóa thành viên thành công.
    $toast.success($t('v1.common.remove_member_success'))

    // Báo cho component cha biết thao tác xóa đã hoàn tất.
    emit('delete-success')
  } catch (ERROR) {
    // Hiển thị lỗi khi API xóa member thất bại.
    $toast.error(ERROR)
  }
}

/** Xác nhận trước khi xóa thành viên khỏi nhóm. */
function confirmDeleteMember() {
  // Mở hộp thoại xác nhận trước khi xóa thành viên.
  confirm('question', $t('v1.common.confirm_remove_member'), '', is_cancel => {
    // Nếu người dùng hủy thì không xóa.
    if (is_cancel) return

    // Gọi hàm xóa thành viên đã xác nhận.
    handleRemoveMember(props.member_id)
  })
}
</script>
