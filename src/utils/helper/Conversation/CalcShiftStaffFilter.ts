import { useChatbotUserStore, usePageStore } from '@/stores'
import { singleton } from 'tsyringe'
import { keys } from 'lodash'

import type { IShiftSlotConfig } from '@/service/interface/app/page'

//#region CalcShiftStaffFilter - Tính toán danh sách nhân viên cần lọc theo ca
// -----------------------------------------------------------------------------

/**mapping index ngày JS (0=CN) sang tên ngày trong shift config */
const DAY_INDEX_TO_NAME: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
}

/** giá trị filter cho hội thoại chưa được gán nhân sự */
const NOT_ASSIGN_STAFF_ID = 'NOT_ASSIGN'

/**kết quả tính toán ca làm việc */
export interface IShiftFilterResult {
  /**có đang kích hoạt lọc theo ca không */
  is_shift_active: boolean
  /**nhân viên hiện tại có đang trong ca không */
  is_current_staff_in_shift: boolean
  /**
   * danh sách id nhân viên KHÁC nằm cùng ca với nhân viên hiện tại
   * - dùng để loại bỏ hội thoại của họ khi nhận socket realtime
   */
  same_shift_other_staff_ids: string[]
  /**
   * danh sách tất cả staff_id được phép hiện hội thoại
   * - lấy từ staff_list sau khi loại bỏ nhân sự cùng ca (trừ bản thân)
   * - bổ sung NOT_ASSIGN để lấy thêm hội thoại chưa gán
   * - dùng để truyền vào API filter staff_id
   */
  allowed_staff_ids: string[]
}

/**tính toán lọc nhân viên theo ca làm việc */
export interface ICalcShiftStaffFilter {
  /**thực thi tính toán */
  exec(): IShiftFilterResult
}

/**tính toán lọc nhân viên theo ca làm việc */
@singleton()
export class CalcShiftStaffFilter implements ICalcShiftStaffFilter {
  /**
   * @param STORE_PAGE store của trang
   * @param STORE_CHATBOT_USER store của người dùng chatbot
   */
  constructor(
    private readonly STORE_PAGE = usePageStore(),
    private readonly STORE_CHATBOT_USER = useChatbotUserStore(),
  ) {}

  /**
   * parse thời gian dạng "HH:MM" thành tổng phút
   * @param time_str chuỗi thời gian dạng "HH:MM"
   * @returns tổng phút (0-1440)
   */
  private parseTimeToMinutes(time_str?: string): number {
    // nếu không có giá trị thì trả về 0
    if (!time_str) return 0

    /** tách giờ và phút từ chuỗi */
    const PARTS = time_str.split(':')
    /** giờ */
    const HOUR = Number(PARTS[0] ?? 0)
    /** phút */
    const MINUTE = Number(PARTS[1] ?? 0)

    // trả về tổng phút
    return HOUR * 60 + MINUTE
  }

  /**
   * kiểm tra thời gian hiện tại có nằm trong khoảng ca không
   * @param shift cấu hình ca làm việc
   */
  private isTimeInShift(shift: IShiftSlotConfig): boolean {
    /** tổng phút bắt đầu ca */
    const SHIFT_START = this.parseTimeToMinutes(shift.start_time)
    /** tổng phút kết thúc ca */
    const SHIFT_END = this.parseTimeToMinutes(shift.end_time)

    /** thời gian hiện tại */
    const NOW = new Date()
    /** tổng phút hiện tại */
    const CURRENT = NOW.getHours() * 60 + NOW.getMinutes()

    // kiểm tra thời gian hiện tại có nằm trong ca không
    return CURRENT >= SHIFT_START && CURRENT < SHIFT_END
  }

  /**
   * lấy tên ngày hiện tại theo format shift config
   * @returns tên ngày (monday, tuesday, ...)
   */
  private getCurrentDayName(): string {
    /** index ngày hiện tại (0 = CN, 1 = T2, ...) */
    const DAY_INDEX = new Date().getDay()

    // trả về tên ngày tương ứng
    return DAY_INDEX_TO_NAME[DAY_INDEX] || 'monday'
  }

  /**
   * thu thập tất cả staff_id từ mọi page đang chọn
   * @returns Set chứa tất cả staff_id
   */
  private collectAllStaffIds(): Set<string> {
    /** tập hợp tất cả staff_id */
    const ALL_STAFF_IDS = new Set<string>()

    /** danh sách page đang được chọn */
    const SELECTED_PAGES = this.STORE_PAGE.selected_page_list_info

    // duyệt qua từng page
    for (const PAGE_ID of keys(SELECTED_PAGES)) {
      /** danh sách nhân viên của page */
      const STAFF_LIST = SELECTED_PAGES[PAGE_ID]?.staff_list

      // bỏ qua nếu không có nhân viên
      if (!STAFF_LIST) continue

      // thu thập tất cả id nhân viên
      for (const STAFF_ID of keys(STAFF_LIST)) {
        ALL_STAFF_IDS.add(STAFF_ID)
      }
    }

    return ALL_STAFF_IDS
  }

  exec(): IShiftFilterResult {
    /** kết quả mặc định: không lọc theo ca */
    const DEFAULT_RESULT: IShiftFilterResult = {
      is_shift_active: false,
      is_current_staff_in_shift: false,
      same_shift_other_staff_ids: [],
      allowed_staff_ids: [],
    }

    /** id mới của nhân viên hiện tại */
    const CURRENT_USER_ID = this.STORE_CHATBOT_USER.chatbot_user?.user_id
    /** id cũ của nhân viên hiện tại */
    const CURRENT_FB_STAFF_ID =
      this.STORE_CHATBOT_USER.chatbot_user?.fb_staff_id

    // nếu không có id nhân viên thì không lọc
    if (!CURRENT_USER_ID && !CURRENT_FB_STAFF_ID) return DEFAULT_RESULT

    /** danh sách page đang được chọn */
    const SELECTED_PAGES = this.STORE_PAGE.selected_page_list_info

    /** tên ngày hiện tại */
    const CURRENT_DAY = this.getCurrentDayName()

    /**
     * tập hợp id nhân viên KHÁC nằm CÙNG ca với nhân viên hiện tại
     * - chỉ loại trừ nhân viên cùng ca, KHÔNG loại trừ nhân viên ở ca khác
     */
    const SAME_SHIFT_OTHER_STAFF = new Set<string>()
    /** nhân viên hiện tại có nằm trong bất kỳ ca nào không */
    let is_current_staff_in_any_shift = false
    /** có bất kỳ page nào bật phân ca không */
    let has_any_active_shift = false

    // duyệt qua từng page đang được chọn
    for (const PAGE_ID of keys(SELECTED_PAGES)) {
      /** cấu hình phân ca của page này */
      const SHIFT_CONFIG =
        SELECTED_PAGES[PAGE_ID]?.page?.assign_staffs_by_shift
      // console.log('SHIFT_CONFIG', SHIFT_CONFIG)
      // bỏ qua nếu page không bật phân ca
      if (!SHIFT_CONFIG?.is_active) continue

      // đánh dấu có ít nhất 1 page bật phân ca
      has_any_active_shift = true

      /** dữ liệu ca của ngày hiện tại */
      const TODAY_CONFIG =
        SHIFT_CONFIG.days?.[CURRENT_DAY as keyof typeof SHIFT_CONFIG.days]

      /** danh sách ca trong ngày */
      const SHIFTS = TODAY_CONFIG?.shifts
      // console.log('SHIFTS', SHIFTS)
      // console.log('CURRENT_DAY', CURRENT_DAY)

      // bỏ qua nếu ngày hiện tại không có ca
      if (!SHIFTS?.length) continue

      // duyệt qua từng ca trong ngày
      for (const SHIFT of SHIFTS) {
        // console.log('SHIFT 1', SHIFT)
        // bỏ qua ca không có danh sách nhân viên
        if (!SHIFT?.staff_ids?.length) continue
        // console.log('SHIFT 2', SHIFT)
        // bỏ qua ca không thuộc thời gian hiện tại
        if (!this.isTimeInShift(SHIFT)) continue
        // console.log('SHIFT 3', SHIFT)

        /** nhân viên hiện tại có trong ca này không */
        const IS_CURRENT_IN_THIS_SHIFT = SHIFT.staff_ids.some(
          staff_id =>
            staff_id === CURRENT_USER_ID || staff_id === CURRENT_FB_STAFF_ID,
        )

        // chỉ xử lý ca mà nhân viên hiện tại ĐANG THUỘC
        if (!IS_CURRENT_IN_THIS_SHIFT) continue

        // đánh dấu nhân viên có trong ca
        is_current_staff_in_any_shift = true

        // thu thập id nhân viên KHÁC trong CÙNG ca (loại trừ bản thân)
        for (const STAFF_ID of SHIFT.staff_ids) {
          // bỏ qua bản thân
          if (
            STAFF_ID === CURRENT_USER_ID ||
            STAFF_ID === CURRENT_FB_STAFF_ID
          )
            continue

          // thêm vào tập hợp nhân viên cùng ca
          SAME_SHIFT_OTHER_STAFF.add(STAFF_ID)
        }
      }
    }

    // nếu không có page nào bật phân ca thì không lọc
    if (!has_any_active_shift) return DEFAULT_RESULT

    // nếu nhân viên hiện tại không thuộc ca nào → không lọc theo ca
    if (!is_current_staff_in_any_shift) return DEFAULT_RESULT

    /** tất cả staff_id từ mọi page */
    const ALL_STAFF_IDS = this.collectAllStaffIds()

    /**
     * danh sách staff_id được phép hiện hội thoại
     * = tất cả nhân viên - nhân viên khác cùng ca + NOT_ASSIGN
     */
    const ALLOWED_STAFF_IDS: string[] = []

    // lọc ra những staff KHÔNG nằm trong cùng ca
    for (const STAFF_ID of ALL_STAFF_IDS) {
      // bỏ qua nhân viên khác cùng ca
      if (SAME_SHIFT_OTHER_STAFF.has(STAFF_ID)) continue

      // thêm vào danh sách cho phép
      ALLOWED_STAFF_IDS.push(STAFF_ID)
    }

    // thêm option hội thoại chưa gán nhân sự
    if (!ALLOWED_STAFF_IDS.includes(NOT_ASSIGN_STAFF_ID)) {
      ALLOWED_STAFF_IDS.push(NOT_ASSIGN_STAFF_ID)
    }

    /** chuyển Set thành Array cho same_shift */
    const SAME_SHIFT_IDS = Array.from(SAME_SHIFT_OTHER_STAFF)

    // trả về kết quả
    return {
      is_shift_active: true,
      is_current_staff_in_shift: is_current_staff_in_any_shift,
      same_shift_other_staff_ids: SAME_SHIFT_IDS,
      allowed_staff_ids: ALLOWED_STAFF_IDS,
    }
  }
}
// -----------------------------------------------------------------------------
//#endregion
