import { useOrgStore } from '@/stores'
import { singleton } from 'tsyringe'
import { container } from 'tsyringe'

import type { ISortConversation } from '@/service/interface/app/page'
import {
  CalcShiftStaffFilter,
  type ICalcShiftStaffFilter,
  type IShiftFilterResult,
} from './CalcShiftStaffFilter'

/**thiết lập đặc biết của trang cần tính toán */
export interface ISpecialPageConfigs {
  /**sort hội thoại */
  sort_conversation?: ISortConversation
  /**
   * hiện hội thoại theo nhân viên chỉ định
   * - true: chỉ hiện hội thoại của nhân viên đó
   * - false, undefined: hiện hội thoại của tất cả nhân viên
   */
  is_only_visible_client_of_staff?: boolean
  /**kết quả tính toán phân ca làm việc */
  shift_filter?: IShiftFilterResult
}

/**tính toán một số thiết lập trang đặc biết */
export interface ICalcSpecialPageConfigs {
  /**thực thi */
  exec(): ISpecialPageConfigs
}

/**tính toán một số thiết lập trang đặc biết */
@singleton()
export class CalcSpecialPageConfigs implements ICalcSpecialPageConfigs {
  /**
   * @param STORE_ORG store của tổ chức
   * @param SERVICE_SHIFT_FILTER tính toán lọc theo ca làm việc
   */
  constructor(
    private readonly STORE_ORG = useOrgStore(),
    private readonly SERVICE_SHIFT_FILTER: ICalcShiftStaffFilter = container.resolve(
      CalcShiftStaffFilter,
    ),
  ) {}

  exec(): ISpecialPageConfigs {
    /**thiết lập sort hội thoại của tổ chức */
    const SORT_CONVERSATION =
      this.STORE_ORG.selected_org_info?.org_config?.org_sort_conversation

    /**chỉ hiện hội thoại của nhân viên đang xem */
    let is_only_visible_client_of_staff =
      this.STORE_ORG.selected_org_info?.org_config
        ?.org_is_only_visible_client_of_staff

    // nếu là admin của tổ chức, thì cho hiện toàn bộ không chặn
    if (this.STORE_ORG.isAdminOrg()) is_only_visible_client_of_staff = false

    /**kết quả tính toán phân ca */
    const SHIFT_FILTER = this.SERVICE_SHIFT_FILTER.exec()

    // trả về kết quả
    return {
      sort_conversation: SORT_CONVERSATION,
      is_only_visible_client_of_staff,
      shift_filter: SHIFT_FILTER,
    }
  }
}
