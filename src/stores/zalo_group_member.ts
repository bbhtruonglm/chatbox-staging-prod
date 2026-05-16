import type { IGroupMember } from '@/utils/api/N4Service/ZaloPersonal'
import { N13ZaloPersonal } from '@/utils/api/N13ZaloPersonal'
import { N4SerivceAppZaloPersonal } from '@/utils/api/N4Service/ZaloPersonal'
import { container } from 'tsyringe'
import { defineStore } from 'pinia'
import { ref } from 'vue'

/** Dữ liệu đầu vào để định danh nhóm Zalo. */
interface ZaloGroupMemberInput {
  /** Id trang Zalo cá nhân. */
  page_id?: string
  /** Id nhóm Zalo. */
  group_id?: string
}

/** Dữ liệu conversation được chọn để thêm vào nhóm Zalo. */
interface ZaloGroupMemberConversation {
  /** Id khách hàng trong conversation. */
  fb_client_id?: string
  /** Id trang trong conversation. */
  fb_page_id?: string
  /** Tên khách hàng trong conversation. */
  client_name?: string
  /** Avatar khách hàng trong conversation. */
  client_avatar?: string
}

/** Dữ liệu đầu vào để thêm thành viên nhóm Zalo. */
interface AddGroupMembersInput extends ZaloGroupMemberInput {
  /** Danh sách conversation được chọn để thêm vào nhóm. */
  members: ZaloGroupMemberConversation[]
}

/** Dữ liệu đầu vào để xóa thành viên nhóm Zalo. */
interface RemoveGroupMemberInput extends ZaloGroupMemberInput {
  /** Id thành viên cần xóa khỏi nhóm. */
  member_id?: string
}

/** Store quản lý cache danh sách thành viên nhóm Zalo. */
export const useZaloGroupMemberStore = defineStore(
  'zalo_group_member_store',
  () => {
    /** Danh sách thành viên nhóm được cache theo page_id và group_id. */
    const group_members_map = ref<Record<string, IGroupMember[]>>({})

    /** Trạng thái loading danh sách thành viên theo page_id và group_id. */
    const loading_map = ref<Record<string, boolean>>({})

    /** API đọc danh sách thành viên nhóm Zalo. */
    const API_ZALO_PERSONAL = container.resolve(N4SerivceAppZaloPersonal)

    /** API thêm hoặc xóa thành viên nhóm Zalo. */
    const API_ZALO_GROUP = new N13ZaloPersonal('app/page/group')

    /** Danh sách request đang chạy để tránh gọi trùng API. */
    const PENDING_REQUESTS = new Map<string, Promise<IGroupMember[]>>()

    /**
     * Tạo key cache cho danh sách thành viên nhóm.
     * @param page_id - Id trang Zalo cá nhân.
     * @param group_id - Id nhóm Zalo.
     */
    function getGroupMemberKey(page_id?: string, group_id?: string) {
      // Ghép page_id và group_id để tạo key duy nhất cho từng nhóm.
      return `${page_id || ''}_${group_id || ''}`
    }

    /**
     * Kiểm tra cache đã có dữ liệu của nhóm hay chưa.
     * @param key - Key cache của nhóm Zalo.
     */
    function hasGroupMembersCache(key: string) {
      // Trả về trạng thái cache có chứa key của nhóm hay không.
      return Object.prototype.hasOwnProperty.call(group_members_map.value, key)
    }

    /**
     * Lấy danh sách thành viên nhóm từ cache.
     * @param page_id - Id trang Zalo cá nhân.
     * @param group_id - Id nhóm Zalo.
     */
    function getGroupMembers(page_id?: string, group_id?: string) {
      /** Key cache của nhóm Zalo hiện tại. */
      const KEY = getGroupMemberKey(page_id, group_id)

      // Trả về danh sách thành viên trong cache hoặc mảng rỗng.
      return group_members_map.value[KEY] || []
    }

    /**
     * Lấy trạng thái loading danh sách thành viên nhóm.
     * @param page_id - Id trang Zalo cá nhân.
     * @param group_id - Id nhóm Zalo.
     */
    function isLoadingGroupMembers(page_id?: string, group_id?: string) {
      /** Key cache của nhóm Zalo hiện tại. */
      const KEY = getGroupMemberKey(page_id, group_id)

      // Trả về trạng thái loading theo key của nhóm.
      return !!loading_map.value[KEY]
    }

    /**
     * Đảm bảo danh sách thành viên nhóm đã được tải vào cache.
     * @param input - Dữ liệu page_id và group_id cần tải.
     */
    async function ensureGroupMembers(input: ZaloGroupMemberInput) {
      /** Id trang Zalo cá nhân cần lấy member. */
      const PAGE_ID = input.page_id

      /** Id nhóm Zalo cần lấy member. */
      const GROUP_ID = input.group_id

      // Nếu thiếu page_id hoặc group_id thì trả về danh sách rỗng.
      if (!PAGE_ID || !GROUP_ID) return []

      /** Key cache của nhóm Zalo hiện tại. */
      const KEY = getGroupMemberKey(PAGE_ID, GROUP_ID)

      // Nếu đã có cache thì dùng cache, không gọi lại API.
      if (hasGroupMembersCache(KEY)) return group_members_map.value[KEY]

      // Nếu request đang chạy thì chờ request cũ, không tạo request mới.
      if (PENDING_REQUESTS.has(KEY)) return await PENDING_REQUESTS.get(KEY)!

      /** Request lấy danh sách thành viên nhóm từ API. */
      const REQUEST = fetchGroupMembers(PAGE_ID, GROUP_ID, KEY)

      // Lưu request đang chạy để tránh gọi API trùng.
      PENDING_REQUESTS.set(KEY, REQUEST)

      try {
        // Chờ request lấy danh sách thành viên hoàn tất.
        return await REQUEST
      } finally {
        // Xóa request khỏi map sau khi hoàn tất hoặc lỗi.
        PENDING_REQUESTS.delete(KEY)
      }
    }

    /**
     * Gọi API lấy danh sách thành viên nhóm và lưu vào cache.
     * @param page_id - Id trang Zalo cá nhân.
     * @param group_id - Id nhóm Zalo.
     * @param key - Key cache của nhóm Zalo.
     */
    async function fetchGroupMembers(
      page_id: string,
      group_id: string,
      key: string
    ) {
      // Bật loading cho nhóm đang tải.
      loading_map.value[key] = true

      try {
        /** Danh sách thành viên nhóm trả về từ API. */
        const GROUP_MEMBERS = await API_ZALO_PERSONAL.getGroupMenbers(
          page_id,
          group_id
        )

        // Nếu API trả mảng thì lưu mảng đó, nếu không thì lưu mảng rỗng.
        group_members_map.value[key] = Array.isArray(GROUP_MEMBERS)
          ? GROUP_MEMBERS
          : []

        // Trả về danh sách thành viên đã được lưu vào cache.
        return group_members_map.value[key]
      } catch (ERROR) {
        // Xóa cache lỗi để lần sau có thể retry.
        delete group_members_map.value[key]

        // Ném lỗi ra ngoài để caller tự xử lý.
        throw ERROR
      } finally {
        // Tắt loading cho nhóm đang tải.
        loading_map.value[key] = false
      }
    }

    /**
     * Thêm thành viên vào nhóm và cập nhật cache local sau khi API thành công.
     * @param input - Dữ liệu nhóm và danh sách thành viên cần thêm.
     */
    async function addGroupMembers(input: AddGroupMembersInput) {
      /** Id trang Zalo cá nhân cần thêm member. */
      const PAGE_ID = input.page_id

      /** Id nhóm Zalo cần thêm member. */
      const GROUP_ID = input.group_id

      /** Danh sách id thành viên cần thêm vào nhóm. */
      const MEMBER_IDS = input.members
        .map(MEMBER => MEMBER.fb_client_id)
        .filter((MEMBER_ID): MEMBER_ID is string => !!MEMBER_ID)

      // Nếu thiếu page_id, group_id hoặc danh sách member thì không thao tác.
      if (!PAGE_ID || !GROUP_ID || !MEMBER_IDS.length) return

      // Gọi API thêm thành viên vào nhóm Zalo.
      await API_ZALO_GROUP.addMemberZalo({
        member_id: MEMBER_IDS,
        page_id: PAGE_ID,
        group_id: GROUP_ID,
      })

      /** Key cache của nhóm Zalo hiện tại. */
      const KEY = getGroupMemberKey(PAGE_ID, GROUP_ID)

      /** Danh sách thành viên hiện có trong cache. */
      const CURRENT_MEMBERS = group_members_map.value[KEY] || []

      /** Tập id thành viên hiện có để tránh thêm trùng. */
      const CURRENT_MEMBER_IDS = new Set<string>(
        CURRENT_MEMBERS.map(MEMBER => MEMBER.client_id).filter(
          (MEMBER_ID): MEMBER_ID is string => !!MEMBER_ID
        )
      )

      /** Danh sách thành viên mới được map về định dạng IGroupMember. */
      const NEW_MEMBERS = input.members
        .map(MEMBER => mapConversationToGroupMember(MEMBER))
        .filter((MEMBER): MEMBER is IGroupMember => !!MEMBER?.client_id)
        .filter(MEMBER => {
          /** Id thành viên mới cần kiểm tra trùng. */
          const MEMBER_ID = MEMBER.client_id as string

          // Nếu thành viên đã có trong cache thì bỏ qua.
          if (CURRENT_MEMBER_IDS.has(MEMBER_ID)) return false

          // Lưu id thành viên mới để chống trùng trong cùng batch.
          CURRENT_MEMBER_IDS.add(MEMBER_ID)

          // Giữ lại thành viên mới hợp lệ.
          return true
        })

      // Cập nhật cache local, không gọi lại API lấy danh sách.
      group_members_map.value[KEY] = [...CURRENT_MEMBERS, ...NEW_MEMBERS]
    }

    /**
     * Xóa thành viên khỏi nhóm và cập nhật cache local sau khi API thành công.
     * @param input - Dữ liệu nhóm và thành viên cần xóa.
     */
    async function removeGroupMember(input: RemoveGroupMemberInput) {
      /** Id trang Zalo cá nhân cần xóa member. */
      const PAGE_ID = input.page_id

      /** Id nhóm Zalo cần xóa member. */
      const GROUP_ID = input.group_id

      /** Id thành viên cần xóa khỏi nhóm. */
      const MEMBER_ID = input.member_id

      // Nếu thiếu page_id, group_id hoặc member_id thì không thao tác.
      if (!PAGE_ID || !GROUP_ID || !MEMBER_ID) return ''

      // Gọi API xóa thành viên khỏi nhóm Zalo.
      const RES = await API_ZALO_GROUP.removeMemberZalo({
        member_id: MEMBER_ID,
        page_id: PAGE_ID,
        group_id: GROUP_ID,
      })

      /** Key cache của nhóm Zalo hiện tại. */
      const KEY = getGroupMemberKey(PAGE_ID, GROUP_ID)

      // Nếu chưa có cache thì không cần cập nhật local.
      if (!hasGroupMembersCache(KEY)) return RES

      // Xóa member khỏi cache local, không gọi lại API lấy danh sách.
      group_members_map.value[KEY] = group_members_map.value[KEY].filter(
        MEMBER => MEMBER.client_id !== MEMBER_ID
      )

      return RES
    }

    /**
     * Chuyển conversation đã chọn thành dữ liệu member nhóm.
     * @param member - Conversation được chọn trong modal thêm thành viên.
     */
    function mapConversationToGroupMember(
      member: ZaloGroupMemberConversation
    ): IGroupMember | undefined {
      // Nếu conversation không có fb_client_id thì không thể map member.
      if (!member.fb_client_id) return undefined

      // Trả về dữ liệu member nhóm theo định dạng API member.
      return {
        client_id: member.fb_client_id,
        client_name: member.client_name,
        client_avatar: member.client_avatar,
      }
    }

    // Trả về state và action cho các component sử dụng.
    return {
      group_members_map,
      loading_map,
      getGroupMemberKey,
      getGroupMembers,
      isLoadingGroupMembers,
      ensureGroupMembers,
      addGroupMembers,
      removeGroupMember,
    }
  }
)
