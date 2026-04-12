import {
  format as data_format,
  isToday,
  isThisYear,
  formatDistanceToNow,
  formatDistanceStrict,
} from 'date-fns'
import { isDate } from 'lodash'
import { container, singleton } from 'tsyringe'
import viLocale from 'date-fns/locale/vi'
import enLocale from 'date-fns/locale/en-US'
import { Locale, type ILocale } from './Locale'

/** giá trị locale tiếng Việt */
const LOCALE_VN = 'vn'

/**thời gian đầu vào */
export type IDateInput = Date | string | number
/**các hàm hỗ trợ cho ngày tháng */
export interface IDateHandle {
  /**
   * chuyển đổi ngày tháng sang chuỗi theo định dạng
   * @param date dữ liệu ngày tháng
   * @param format định dạng chuỗi
   */
  format(date?: IDateInput, format?: string): string
  /**
   * chuyển đổi ngày tháng sang chuỗi so sánh với ngày hiện tại
   * @param date dữ liệu ngày tháng
   */
  formatCompareCurrentYear(date?: IDateInput): string
  /**
   * tính toán thời gian giữa 2 tin nhắn
   * @param current_date thời gian tin nhắn hiện tại
   * @param next_date thời gian tin nhắn tiếp theo
   */
  calcDuration(current_date: IDateInput, next_date: IDateInput): string
}

/**các hàm hỗ trợ cho ngày tháng */
@singleton()
export class DateHandle implements IDateHandle {
  /**
   * SERVICE_LOCALE dịch vụ locale
   * */
  constructor(
    private readonly SERVICE_LOCALE: ILocale = container.resolve(Locale)
  ) {}

  /**
   * lấy locale date-fns tương ứng với locale hiện tại
   * @returns locale date-fns phù hợp (vi hoặc en-US)
   */
  private getDateFnsLocale() {
    /** locale hiện tại từ cookie */
    const CURRENT_LOCALE = this.SERVICE_LOCALE.get()

    // nếu là tiếng Việt thì dùng viLocale, ngược lại dùng enLocale
    return CURRENT_LOCALE === LOCALE_VN ? viLocale : enLocale
  }

  /**20 phút trước, 2 ngày trước, ... (hỗ trợ đa ngôn ngữ) */
  private genAgoDate(date: Date) {
    /** locale hiện tại */
    const CURRENT_LOCALE = this.SERVICE_LOCALE.get()

    /** chuỗi thời gian dạng "x ago" / "x trước" */
    let result = formatDistanceToNow(date, {
      includeSeconds: true,
      addSuffix: true,
      locale: this.getDateFnsLocale(),
    })

    // chỉ clean text khi locale là tiếng Việt vì date-fns/vi trả về chuỗi thừa
    if (CURRENT_LOCALE === LOCALE_VN) {
      // loại bỏ từ "khoảng" không cần thiết (vd: "khoảng 5 phút trước" → "5 phút trước")
      result = result?.replace('khoảng', '')
      // loại bỏ từ "dưới" không cần thiết (vd: "dưới 1 phút trước" → "1 phút trước")
      result = result?.replace('dưới', '')
      // sửa "nữa" thành "trước" cho đúng ngữ cảnh (vd: "5 phút nữa" → "5 phút trước")
      result = result?.replace('nữa', 'trước')
    }

    // loại bỏ khoảng trắng thừa
    return result?.trim()
  }
  /**chuyển đổi thành đối tượng Date */
  private toDate(date: IDateInput) {
    return isDate(date) ? date : new Date(date)
  }

  format(
    date: IDateInput = new Date(),
    format: string = 'HH:mm:ss dd/MM/yyyy'
  ): string {
    /**dữ liệu ngày tháng */
    const DATE = this.toDate(date)

    return data_format(DATE, format)
  }
  formatCompareCurrentYear(date: IDateInput = new Date()) {
    /**dữ liệu ngày tháng */
    const DATE = this.toDate(date)

    // nếu thời gian trong ngày thì chỉ hiện ago
    if (isToday(DATE)) return this.genAgoDate(DATE)

    // nếu trong năm thì hiện ngày tháng
    if (isThisYear(DATE)) return data_format(DATE, 'dd/MM')

    // nếu khác năm thì hiện full
    return data_format(DATE, 'dd/MM/yy')
  }
  formatShort(date: IDateInput = new Date()) {
    /**dữ liệu ngày tháng */
    const DATE = this.toDate(date)

    // nếu trong năm thì hiện ngày tháng
    if (isThisYear(DATE)) return data_format(DATE, 'HH:mm - dd/MM')

    // nếu khác năm thì hiện full
    return data_format(DATE, 'HH:mm - dd/MM/yyyy')
  }
  calcDuration(
    current_date?: IDateInput,
    next_date?: IDateInput,
    options?: Record<string, any>
  ): string {
    // nếu không có thời gian thì thôi
    if (!current_date || !next_date) return ''

    // trả về thời gian giữa 2 tin nhắn với locale phù hợp
    return formatDistanceStrict(
      this.toDate(current_date),
      this.toDate(next_date),
      { locale: this.getDateFnsLocale(), ...options }
    )
  }
}
