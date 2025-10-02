<template>
  <Alert
    ref="inc_quota_ref"
    class_modal="w-[507px]"
    class_body="text-sm"
  >
    <template #header>
      {{
        $t(
          `v1.view.main.dashboard.org.pay.inc_quota.${inc_quota_type?.toLowerCase()}`
        )
      }}
    </template>
    <template #body>
      <div class="py-3 flex flex-col gap-2.5">
        <div class="flex justify-between">
          <div v-if="inc_quota_type === 'PAGE'">
            {{
              $t('v1.view.main.dashboard.org.pay.inc_quota.price_page_month')
            }}
            <span class="font-semibold">60.000đ</span>
          </div>
          <div v-if="inc_quota_type === 'STAFF'">
            {{
              $t('v1.view.main.dashboard.org.pay.inc_quota.price_staff_month')
            }}
            <span class="font-semibold">30.000đ</span>
          </div>
          <div>
            {{ $t('v1.view.main.dashboard.org.pay.inc_quota.package') }}
            <span class="font-semibold">
              {{ orgStore.selected_org_info?.org_package?.org_package_type }}
            </span>
          </div>
        </div>
        <div v-if="inc_quota_type === 'PAGE'">
          {{ $t('v1.view.main.dashboard.org.pay.inc_quota.price_page_day') }}
          <span class="font-semibold"
            >2.000đ(60.000 / 30
            {{ $t('v1.view.main.dashboard.org.pay.inc_quota.day') }})</span
          >
        </div>
        <div v-if="inc_quota_type === 'STAFF'">
          {{ $t('v1.view.main.dashboard.org.pay.inc_quota.price_staff_day') }}
          <span class="font-semibold"
            >1.000đ(30.000 / 30
            {{ $t('v1.view.main.dashboard.org.pay.inc_quota.day') }})</span
          >
        </div>
        <div class="flex justify-between">
          <div>
            {{ $t('v1.view.main.dashboard.org.pay.inc_quota.end_date') }}
            <span class="font-semibold">{{ orgStore.calcNextPay() }}</span>
          </div>
          <div>
            {{ $t('v1.view.main.dashboard.org.pay.inc_quota.day_remaining') }}
            <span class="font-semibold">
              {{ orgStore.calcDayRemaining() }}
              {{ $t('v1.view.main.dashboard.org.pay.inc_quota.day') }}
            </span>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-md py-2 flex flex-col gap-1 relative">
        <div>
          <span v-if="inc_quota_type === 'PAGE'">{{
            $t('v1.view.main.dashboard.org.pay.inc_quota.amount_page')
          }}</span>
          <span v-if="inc_quota_type === 'STAFF'">{{
            $t('v1.view.main.dashboard.org.pay.inc_quota.amount_staff')
          }}</span>

          <span class="text-red-700">*</span>
        </div>
        <div
          v-if="is_loading"
          class="absolute top-0 left-1/2 -translate-x-1/2 flex justify-center items-center"
        >
          <Loading />
        </div>
        <input
          v-model="amount"
          type="number"
          class="focus:outline-orange-500 py-2 px-3 rounded-md border"
        />
      </div>
      <div class="py-3 flex flex-col gap-2.5">
        <div>
          {{ $t('v1.view.main.dashboard.org.pay.inc_quota.total') }}
          <span
            v-if="inc_quota_type === 'PAGE'"
            class="font-semibold"
          >
            {{ amount }}
            {{ $t('v1.view.main.dashboard.org.pay.inc_quota.a_page') }}
            x
            {{ orgStore.calcDayRemaining() }}
            {{ $t('v1.view.main.dashboard.org.pay.inc_quota.day') }}
            x 2.000đ
          </span>
          <span
            v-if="inc_quota_type === 'STAFF'"
            class="font-semibold"
          >
            {{ amount }}
            {{ $t('v1.view.main.dashboard.org.pay.inc_quota.a_staff') }}
            x
            {{ orgStore.calcDayRemaining() }}
            {{ $t('v1.view.main.dashboard.org.pay.inc_quota.day') }}
            x 1.000đ
          </span>
        </div>
        <div>
          {{ $t('v1.view.main.dashboard.org.pay.inc_quota.need_pay') }}
          <span class="font-semibold">
            <span v-if="inc_quota_type === 'PAGE'">
              {{ currency(amount * orgStore.calcDayRemaining() * 2000) || 0 }}
            </span>
            <span v-if="inc_quota_type === 'STAFF'">
              {{ currency(amount * orgStore.calcDayRemaining() * 1000) || 0 }}
            </span>
            đ
          </span>
        </div>
      </div>
      <div class="flex justify-between items-center">
        <button
          @click="inc_quota_ref?.toggleModal()"
          class="btn-custom bg-slate-100 text-slate-500"
        >
          {{ $t('v1.common.close') }}
        </button>
        <button
          @click="incQuota"
          :class="amount ? 'bg-blue-600' : 'bg-slate-600 cursor-not-allowed'"
          class="btn-custom text-white"
        >
          {{ $t('v1.view.main.dashboard.org.pay.inc_quota.purchase') }}
        </button>
      </div>
    </template>
  </Alert>
  <!-- <NotEnoughMoney ref="not_enough_money_ref" /> -->
  <AutoPaymentModal
    :is_confirm_open="auto_payment"
    :title="$t('v1.view.main.dashboard.org.pay.upgrade.confirm_title')"
    :selected_pack="
      $t(
        `v1.view.main.dashboard.org.pay.inc_quota.${inc_quota_type?.toLowerCase()}`
      )
    "
    :amount="TOTAL_AMOUNT.toString()"
    :wallet_balance="wallet_balance"
    @close="auto_payment = false"
    :SELECTED="amount?.toString() || '1'"
    :closeConfirmModal="closeConfirmModal"
    v-model:check_payment="check_payment"
    :is_success_open="is_success_open"
    :MONTHS="[]"
    :payment_type="inc_quota_type?.toUpperCase() as PAYMENT_TYPE || 'PAGE'"
    :meta="meta"
  />
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from '@/service/helper/alert'
import { inc_quota, read_wallet } from '@/service/api/chatbox/billing'
import { useOrgStore } from '@/stores'
import { useI18n } from 'vue-i18n'
import { currency } from '@/service/helper/format'

import Loading from '@/components/Loading.vue'
import Alert from '@/components/Alert.vue'
import NotEnoughMoney from '@/views/Dashboard/Org/Pay/PackInfo/NotEnoughMoney.vue'

import AutoPaymentModal from '@/views/Dashboard/Org/Pay/PackInfo/AutoPaymentModal.vue'

import type { QuotaType } from '@/service/interface/app/ai'
/** Hàm callback done */
const $emit = defineEmits(['done'])
/** Loại thanh toán */
type PAYMENT_TYPE = 'PAGE' | 'STAFF' | 'PACKAGE' | 'TOKEN'

const $props = withDefaults(
  defineProps<{
    /**class cho modal */
    inc_quota_type?: QuotaType
  }>(),
  {}
)
/** data tổ chức ở store */
const orgStore = useOrgStore()
/** Hàm dịch i18n */
const { t: $t } = useI18n()

/**có đang loading không */
const is_loading = ref<boolean>(false)
/**ref của modal kết nối nền tảng */
const inc_quota_ref = ref<InstanceType<typeof Alert>>()
/**ref của modal thông báo không đủ tiền */
const not_enough_money_ref = ref<InstanceType<typeof NotEnoughMoney>>()
/** Tính toán tổng số tiền */
const TOTAL_AMOUNT = computed(() => {
  /** Nếu k có amount thì trả về 0 */
  if (!amount.value) return 0
  /** Nếu loại thanh toán là PAGE */
  if ($props.inc_quota_type === 'PAGE') {
    return amount.value * orgStore.calcDayRemaining() * 2000
  }
  /** Nếu loại thanh toán là STAFF */
  if ($props.inc_quota_type === 'STAFF') {
    return amount.value * orgStore.calcDayRemaining() * 1000
  }
  return 0
})

/**ref của modal thanh toán tự động */
const auto_payment = ref<boolean>(false)
/**số quota muốn thêm */
const amount = ref<number>(0)

/** Check trạng thái payment */
const check_payment = ref(false)
/** trạng thái payment modal */
const is_success_open = ref(false)

/** Số tiền sau khi giảm giá */
const wallet_balance = ref<number>(0)

/**ẩn hiện modal của component */
function toggleModal() {
  inc_quota_ref.value?.toggleModal()
}

/** Khai báo meta cho việc tự động mua gói */
const meta = ref<{
  type: 'PURCHASE' | 'INCREASE' | 'TOP_UP_WALLET'
  product: QuotaType
}>({
  type: 'INCREASE', // giá trị mặc định
  product: ($props.inc_quota_type?.toUpperCase() as QuotaType) || 'PAGE',
})

/** đóng modal xác nhận thanh toán */
function closeConfirmModal() {
  /** Đóng modal xác nhận */
  auto_payment.value = false
  /** reset thông tin gói đã chọn */
  // selected_pack.value = undefined
  /** reset thông tin xác thực */
  // verify_voucher.value = {}
  // /** Reset thông tin mã giảm giá */
  // voucher_code.value = ''
}

/** Theo dõi trạng thái payment */
watch(check_payment, value => {
  if (value) {
    /** Bật modal báo success */
    is_success_open.value = true
    /** sau khi thanh toán thành công */
    setTimeout(() => {
      /** Tắt modal báo nạp tiền thành công */
      is_success_open.value = false
      /** sau 1s thì tắt */
      auto_payment.value = false
      /** Tăt modal */
      toggleModal()
      /** thông báo mua gói thành công */
      toast('success', $t(`v1.view.main.dashboard.org.pay.inc_quota.success`))
    }, 1000)
    setTimeout(() => {
      /** refresh lại trang */
      window.location.reload()
    }, 2000)
  }
})
/**mua thêm quota */
async function incQuota() {
  /** nếu đang loading thì không làm gì */
  if (
    !orgStore.selected_org_id ||
    is_loading.value ||
    !$props.inc_quota_type ||
    !amount.value
  )
    return

  /** mở loading */
  is_loading.value = true

  try {
    /** TODO check amount trước khi thêm */

    /**dữ liệu của ví */
    const WALLET = await read_wallet(orgStore.selected_org_id)
    /** Lưu số dư ví */
    wallet_balance.value = WALLET.wallet_balance || 0

    /** nếu không có ví thì thông báo lỗi */
    if (!WALLET?.wallet_id)
      throw $t('v1.view.main.dashboard.org.pay.recharge.wrong_wallet_id')

    meta.value.product = $props.inc_quota_type
    /** thêm quota */
    await inc_quota(
      orgStore.selected_org_id,
      WALLET?.wallet_id,
      $props.inc_quota_type,
      amount.value
    )

    /** thông báo mua gói thành công */
    toast('success', $t(`v1.view.main.dashboard.org.pay.inc_quota.success`))

    /** chờ 1s */
    await new Promise(cb => setTimeout(cb, 1000))

    /** reload lại trang */
    window.location.reload()
  } catch (e) {
    /** thông báo lỗi */
    // not_enough_money_ref.value?.toggleModal()
    auto_payment.value = true
  }

  /** tắt loading */
  is_loading.value = false
}

/** cung cấp hàm toggle modal cho component cha */
defineExpose({ toggleModal })
</script>
<style scoped lang="scss">
.btn-custom {
  @apply text-sm font-medium rounded-md py-2 px-4 flex items-center gap-2 hover:brightness-90;
}
</style>
