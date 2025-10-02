<template>
  <Teleport to="body">
    <!-- v-if="IS_OPEN" -->
    <Transition
      enter-active-class="transition ease-in-out duration-500"
      leave-active-class="transition ease-in-out duration-500"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        @click="toggleModal"
        class="absolute top-0 left-0 w-screen h-screen bg-black/10 z-20 shadow-lg"
      >
        <div
          @click.stop
          class="w-full h-full p-3"
        >
          <div
            class="rounded-lg bg-slate-50 w-full flex flex-col shadow-lg gap-10 h-full"
          >
            <div
              class="flex flex-col w-full justify-between items-center p-5 pb-0 gap-1"
            >
              <div class="flex w-full justify-between items-center gap-5">
                <img
                  :src="COMMON_STORE.partner?.logo?.full"
                  class="h-8"
                />
                <div class="px-3 text-4xl font-bold flex-shrink-0 text-center">
                  {{ $t('v1.view.onboarding.package_title') }}
                </div>
                <div class="w-32"></div>
              </div>
              <div class="px-3 font-medium flex-shrink-0 text-center">
                {{ $t('v1.view.onboarding.select_your_package') }}
              </div>
            </div>
            <div class="flex flex-col bg-white rounded-b-lg overflow-hidden">
              <HeaderCustom
                :tabs="TABS"
                :active_index="ACTIVE_INDEX"
                @change-tab="handleTabChange"
              />

              <!-- <AnimatedTabs /> -->

              <div
                class="overflow-hidden flex flex-col flex-grow min-h-0 h-full overflow-y-auto gap-5 p-5 pt-12 border-b"
              >
                <!-- <div class="bg-red-500 w-full">
                  <div class="w-full relative h-full py-10">
                    <PricingCard
                      v-for="(pkg, index) in PACKAGES"
                      :key="pkg.title"
                      v-bind="pkg"
                      :selected="SELECTED_INDEX === pkg.title"
                      :onSelect="() => handleSelect(pkg.title)"
                      :active_tab="ACTIVE_INDEX"
                      class="absolute py-10"
                      ref="el => boxRefs[index] = el"
                    />
                  </div>
                </div> -->
                <!-- <TransitionGroup
                  name="expand"
                  tag="div"
                  :class="[
                    'gap-6',
                    ACTIVE_INDEX === 0
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                      : 'grid grid-cols-4'
                  ]"
                  >
                  <PricingCard
                    v-for="(pkg, index) in FILTERED_PACKAGES"
                    :key="pkg.title"
                    v-bind="pkg"
                    :selected="SELECTED_INDEX === pkg.title"
                    :onSelect="() => handleSelect(pkg.title)"
                    :active_tab="ACTIVE_INDEX"
                    :class="[
                      // 'transition-all duration-500 ease-in-out',
                      '',
                      ACTIVE_INDEX === 0
                        ? '' // All plans
                        : index === 0
                        ? 'col-span-1'
                        : pkg.title === 'Enterprise'
                        ? 'col-span-3'
                        : ''
                    ]"
                  />
              </TransitionGroup> -->
             <!-- <TransitionGroup
  name="expand"
  tag="div"
  class="flex gap-6 transition-all duration-500"
>
  <PricingCard
    v-for="(pkg, index) in FILTERED_PACKAGES"
    :key="pkg.title"
    v-bind="pkg"
    :selected="SELECTED_INDEX === pkg.title"
    :onSelect="() => handleSelect(pkg.title)"
    :active_tab="ACTIVE_INDEX"
    :class="[
      'transition-all duration-500',
      ACTIVE_INDEX === 0
        ? 'flex-1 basis-1/4' // 4 đều nhau
        : pkg.title === 'Enterprise'
        ? 'flex-[3] basis-3/4' // D mở rộng
        : 'flex-1 basis-1/4'
    ]"
  />
</TransitionGroup> -->

<!-- <TransitionGroup
  name="expand"
  tag="div"
  class="flex gap-6 relative"
>
  <PricingCard
    v-for="(pkg, index) in FILTERED_PACKAGES"
    :key="pkg.title"
    v-bind="pkg"
    :selected="SELECTED_INDEX === pkg.title"
    :onSelect="() => handleSelect(pkg.title)"
    :active_tab="ACTIVE_INDEX"
    :class="[
      'transition-all duration-500',
      ACTIVE_INDEX === 0
        ? 'flex-1 basis-1/4'
        : pkg.title === 'Enterprise'
        ? 'flex-[3] basis-3/4'
        : 'flex-1 basis-1/4'
    ]"
  />
</TransitionGroup> -->
<!-- <TransitionGroup
  name="expand"
  tag="div"
  class="flex gap-6 relative"
>
  <PricingCard
    v-for="(pkg, index) in FILTERED_PACKAGES"
    :key="pkg.title"
    v-bind="pkg"
    :selected="SELECTED_INDEX === pkg.title"
    :onSelect="() => handleSelect(pkg.title)"
    :active_tab="ACTIVE_INDEX"
    :class="[
      'transition-all duration-500',
      pkg.title === 'Enterprise'
        ? ACTIVE_INDEX === 0
          ? 'flex-1 basis-1/4 order-4'              // Tab1: width nhỏ, luôn đứng cuối
          : 'flex-[3] basis-3/4 order-4 ml-auto'    // Tab2: width lớn, vẫn cuối, giữ mép phải
        : 'flex-1 basis-1/4'
    ]"
  />
</TransitionGroup> -->

<TransitionGroup
  name="expand"
  tag="div"
  class="flex gap-6 relative w-full"
>
  <PricingCard
    v-for="(pkg, index) in FILTERED_PACKAGES"
    :key="pkg.title"
    v-bind="pkg"
    :selected="SELECTED_INDEX === pkg.title"
    :onSelect="() => handleSelect(pkg.title)"
    :active_tab="ACTIVE_INDEX"
    :class="[
      'transition-all duration-500',
      pkg.title === 'Enterprise'
        ? (ACTIVE_INDEX === 0
            ? 'order-last ml-auto flex-none w-1/4'
            : 'order-last ml-auto flex-none w-3/4')
        : 'flex-1 min-w-0'
    ]"
  />
</TransitionGroup>



                  <div class="flex flex-col gap-5">
                  <h2
                    class="text-3xl font-medium text-center pt-5 flex justify-center gap-2.5 items-center"
                    @click="toggleAll"
                  >
                    {{ COMPARE_DATA.title }}
                    <ChevronDownIcon
                      class="size-7 transition-transform duration-200"
                      :class="open_all ? 'rotate-180' : ''"
                    />
                  </h2>

                  <div v-show="open_all">
                    <!-- class="overflow-y-auto bg-white rounded-xl" -->
                    <!-- Header -->
                    <!-- class="grid font-semibold top-10 z-50 sticky" -->
                    <div
                      class="grid font-semibold sticky -top-12 bg-white z-20 shadow-sm"
                      :style="{ gridTemplateColumns: GRID_COLS }"
                    >
                      <div class="p-3 text-left"></div>
                      <div
                        v-for="(plan, planIdx) in COMPARE_DATA.plans"
                        :key="plan.key"
                        @click="handleSelect(plan.name)"
                        class="p-3 text-center cursor-pointer flex justify-center text-2xl rounded-t-xl"
                        :class="[
                          plan.name === SELECTED_INDEX
                            ? 'bg-gray-50 font-bold '
                            : 'font-semibold',
                        ]"
                      >
                        <div class="flex items-center gap-2">
                          <div
                            class="flex size-6 rounded-full justify-center items-center flex-shrink-0"
                            :class="[
                              plan.name === SELECTED_INDEX
                                ? 'bg-cyan-600'
                                : 'bg-gray-400',
                            ]"
                          >
                            <div
                              class="flex bg-white rounded-full justify-center items-center"
                              :class="[
                                plan.name !== SELECTED_INDEX
                                  ? 'bg-cyan-600'
                                  : 'bg-gray-400',
                              ]"
                            >
                              <CheckCircleIcon
                                class="size-5 text-cyan-600"
                                :class="[
                                  plan.name !== SELECTED_INDEX
                                    ? 'text-white'
                                    : '',
                                ]"
                              />
                            </div>
                          </div>
                          {{ plan.name }}
                        </div>
                      </div>
                    </div>

                    <!-- Sections -->
                    <div
                      v-for="(section, sectionIdx) in COMPARE_DATA.sections"
                      :key="section.title"
                    >
                      <!-- Section row (grid) -->
                      <div
                        class="grid font-semibold text-2xl text-gray-800"
                        :style="{ gridTemplateColumns: GRID_COLS }"
                      >
                        <!-- Cột feature name -->
                        <div class="pt-5">
                          {{ section.title }}
                        </div>
                        <!-- Cột tương ứng với mỗi gói -->
                        <div
                          v-for="(plan, planIdx) in COMPARE_DATA.plans"
                          :key="plan.key + section.title"
                          class="p-3 text-center"
                          :class="
                            plan.name === SELECTED_INDEX ? 'bg-gray-50' : ''
                          "
                          @click="handleSelect(plan.name)"
                        >
                          <!-- để màu nền tương ứng với gói -->
                        </div>
                      </div>

                      <div
                        v-for="(feature, idx) in section.features"
                        :key="section.title + idx"
                        class="grid items-center border-b border-slate-200 cursor-pointer"
                        :class="
                          isRowSelected(sectionIdx, idx)
                            ? 'bg-gray-50'
                            : 'hover:bg-gray-50'
                        "
                        :style="{ gridTemplateColumns: GRID_COLS }"
                        @click="onRowClick(sectionIdx, idx)"
                      >
                        <!-- Feature name cell -->
                        <div
                          class="p-3 flex justify-between items-center text-sm"
                        >
                          <span>
                            {{ feature.name }}
                          </span>
                          <InformationCircleIcon
                            class="size-4 text-slate-400"
                          />
                        </div>

                        <!-- Each plan cell -->
                        <div
                          v-for="(plan, planIdx) in COMPARE_DATA.plans"
                          :key="plan.key + idx"
                          class="p-3 flex justify-center items-center w-full text-sm"
                          :class="
                            plan.name === SELECTED_INDEX ? 'bg-gray-50' : ''
                          "
                          @click="handleSelect(plan.name)"
                        >
                          <template v-if="(feature.values as Record<string, any>)[plan.key] === true">
                            <span class="text-slate-800 text-center">
                              <CheckIcon class="size-5" />
                            </span>
                          </template>
                          <template v-else-if="(feature.values as Record<string, any>)[plan.key]">
                            {{ (feature.values as Record<string, any>)[plan.key]  }}
                          </template>
                          <template v-else>
                            <span class="text-gray-400">-</span>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <FAQ />
                </div>
              </div>
              <div class="flex px-8 py-3 w-full justify-between">
                <div class="flex items-center justify-center gap-5">
                  <img
                    src="@/assets/imgs/visa.png"
                    alt="Verified by Visa"
                    class="h-8 object-contain grayscale"
                  />
                  <img
                    src="@/assets/imgs/mastercard.png"
                    alt="MasterCard SecureCode"
                    class="h-8 object-contain grayscale"
                  />
                  <img
                    src="@/assets/imgs/secure.png"
                    alt="Secure SSL Encryption"
                    class="h-8 object-contain grayscale"
                  />
                </div>
                <div
                  @click="submitPackage"
                  class="flex items-center cursor-pointer bg-green-500 text-white gap-3 px-10 py-3 rounded-md"
                >
                  {{ $t('v1.view.onboarding.continue') }}
                  <span><ArrowRightIcon class="size-5" /></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
import { purchase_package, read_wallet } from '@/service/api/chatbox/billing'
import { toast, toastError } from '@/service/helper/alert'
import { useCommonStore, useOrgStore } from '@/stores'
import { ArrowRightIcon } from '@heroicons/vue/24/solid'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import PricingCard from '@/components/PricingCard/PricingCard.vue'
import FAQ from './FAQ.vue'

import HeaderCustom from '@/views/Dashboard/Org/Pay/PackInfo/Header/HeaderCustom.vue'

import ComparePlans from '@/views/Dashboard/Org/Pay/PackInfo/Header/ComparePlans.vue'
import Cookies from 'js-cookie'
import { currency } from '@/service/helper/format'

import {
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
} from '@heroicons/vue/24/solid'
import AnimatedTabs from './AnimatedTabs.vue'

/** Kiểu dữ liệu plans */
interface Plan {
  /** key của plans */
  key: string
  /** Tên của plans */
  name: string
}
/** Kiểu dữ liệu chức năng */
interface Feature {
  /** Tên của tính năng */
  name: string
  /** Giá trị features */
  values: Record<string, string | number | boolean | null | undefined>
}
/** Kiểu dữ liệu section */
interface Section {
  /** Title section */
  title: string
  /** chức năng */
  features: Feature[]
}
/** Kiểu dữ liệu Data phần compare plans & feature */
interface CompareData {
  /** Title của plan */
  title: string
  /** Data plan */
  plans: Plan[]
  /** data section */
  sections: Section[]
}

/** Lấy giá trị trong store */
const COMMON_STORE = useCommonStore()
/** Lấy giá trị org */
const orgStore = useOrgStore()
/** Hàm dịch */
const { t: $t } = useI18n()

const props = defineProps<{
  selected_preference: string | null
}>()

/** Hàm click */
function handleClick(pkg_title: string) {
  // alert(`Bạn chọn gói ${pkg_title}`)
  console.log('title', pkg_title)
}
/** Hàm emit */
const $emit = defineEmits<{
  (e: 'submit'): void
}>()
/** Hàm submit */
const submitPackage = () => {
  $emit('submit')
}
/** Filter list package
 * All plans hiện all
 * Business chỉ hiện pro và business
 */
const FILTERED_PACKAGES = computed(() => {
  if (ACTIVE_INDEX.value === 0) {
    /** Tab 0 = All plans */
    return PACKAGES
  } else {
    /** Tab 1 = Business & Enterprise */
    return PACKAGES.filter(pkg =>
      ['Business', 'Enterprise'].includes(pkg.title)
    )
  }
})
/** tab đang được chọn */
const SELECTED_INDEX = ref('Lite')
/** Hàm thay đổi index */
function handleSelect(index: string) {
  /** Nếu enterpise thì chuyển sang tab 1 */
  if (index === 'Enterprise') {
    // ACTIVE_INDEX.value = 1
    setTab2()
    ACTIVE_INDEX.value = 1
  }
  /**Chọn gói */
  SELECTED_INDEX.value = index
}
/** Khai báo các tab đăng ký */
// const TABS = ref(['All plans', 'Business & Enterprise'])
const TABS = ref(['All plans', 'Business & Enterprise'])
/** Tab active hiện tại */
const ACTIVE_INDEX = ref(0)
/** Lấy locale từ cookies */
const LOCALE = Cookies.get('locale') || 'en'

/** Mock các gói */
const PACKAGES = [
  {
    title: 'Lite',
    price: LOCALE === 'en' ? '$8' : currency(199000) + 'đ',
    is_sale_off: $t('v1.view.onboarding.is_sale_off'),
    original_price: LOCALE === 'en' ? '$10' : currency(270000) + 'đ',
    code: 'BBH',
    discount_percent: '40%',
    discount: $t('v1.view.onboarding.discount'),
    subtitle: $t('v1.view.onboarding.lite_subtitle'),
    ctaText: $t('v1.view.onboarding.use_trial_7_day'),
    ctaOnClick: () => handleClick('Free'),
    description: $t('v1.view.onboarding.lite_description'),
    style: {},
    sections: [
      {
        heading: 'LIMITS',
        items: [
          { text: '1,000 Active contacts & deals', enabled: true },
          { text: '1 Custom dashboard', enabled: true },
          { text: '5 Columns per board max', enabled: true },
          { text: 'Custom automation', enabled: false },
          { text: 'Guest', enabled: false },
        ],
      },
      {
        heading: 'ADVANCES',
        items: [
          { text: 'Centralized comms hub', enabled: true },
          { text: 'iOS & Android apps', enabled: true },
          { text: 'Send mass emails', enabled: false },
          { text: 'Email sequences', enabled: false },
          { text: 'Quotes & invoices', enabled: false },
        ],
      },
    ],
    aiFeatures: [
      { text: 'AI Automation', enabled: false },
      { text: 'AI Writing', enabled: false },
      { text: 'AI Research', enabled: false },
    ],
  },
  {
    title: 'Pro',
    price: LOCALE === 'en' ? '$18' : currency(480000) + 'đ',
    is_sale_off: $t('v1.view.onboarding.is_sale_off'),
    original_price: LOCALE === 'en' ? '$20' : currency(540000) + 'đ',
    code: 'BBH',
    discount_percent: '40%',
    discount: $t('v1.view.onboarding.discount'),
    subtitle: $t('v1.view.onboarding.pro_subtitle'),
    ctaText: $t('v1.view.onboarding.use_trial_7_day'),
    ctaOnClick: () => handleClick('Lite'),
    is_popular: true,
    style: {},
    description: $t('v1.view.onboarding.pro_description'),
    sections: [
      {
        heading: 'LIMITS',
        items: [
          { text: '1,000 Active contacts & deals', enabled: true },
          { text: '1 Custom dashboard', enabled: true },
          { text: '5 Columns per board max', enabled: true },
          { text: 'Custom automation', enabled: false },
          { text: 'Guest', enabled: false },
        ],
      },
      {
        heading: 'ADVANCES',
        items: [
          { text: 'Centralized comms hub', enabled: true },
          { text: 'iOS & Android apps', enabled: true },
          { text: 'Send mass emails', enabled: false },
          { text: 'Email sequences', enabled: false },
          { text: 'Quotes & invoices', enabled: false },
        ],
      },
    ],
    aiFeatures: [
      { text: 'AI Automation', enabled: true },
      { text: 'AI Writing', enabled: true },
      { text: 'AI Research', enabled: false },
    ],
  },
  {
    title: 'Business',
    price: LOCALE === 'en' ? '$90' : currency(2200000) + 'đ',
    is_sale_off: $t('v1.view.onboarding.is_sale_off'),
    original_price: LOCALE === 'en' ? '$99' : currency(2600000) + 'đ',
    code: 'BBH',
    discount_percent: '40%',
    discount: $t('v1.view.onboarding.discount'),
    subtitle: $t('v1.view.onboarding.business_subtitle'),
    ctaText: $t('v1.view.onboarding.use_trial_7_day'),
    ctaOnClick: () => handleClick('Pro'),
    style: {},
    description: $t('v1.view.onboarding.business_description'),
    sections: [
      {
        heading: 'LIMITS',
        items: [
          { text: '1,000 Active contacts & deals', enabled: true },
          { text: '1 Custom dashboard', enabled: true },
          { text: '5 Columns per board max', enabled: true },
          { text: 'Custom automation', enabled: false },
          { text: 'Guest', enabled: false },
        ],
      },
      {
        heading: 'ADVANCES',
        items: [
          { text: 'Centralized comms hub', enabled: true },
          { text: 'iOS & Android apps', enabled: true },
          { text: 'Send mass emails', enabled: false },
          { text: 'Email sequences', enabled: false },
          { text: 'Quotes & invoices', enabled: false },
        ],
      },
    ],
    aiFeatures: [
      { text: 'AI Automation', enabled: true },
      { text: 'AI Writing', enabled: true },
      { text: 'AI Research', enabled: true },
    ],
  },
  {
    title: 'Enterprise',
    price: '$0',

    subtitle: $t('v1.view.onboarding.enterprise_subtitle'),
    ctaText: $t('v1.view.onboarding.free_consultation'),
    ctaOnClick: () => handleClick('Enterprise'),
    is_popular: true,
    style: {},
    description: $t('v1.view.onboarding.enterprise_description'),
    sections: [
      {
        heading: 'LIMITS',
        items: [
          { text: '1,000 Active contacts & deals', enabled: true },
          { text: '1 Custom dashboard', enabled: true },
          { text: '5 Columns per board max', enabled: true },
          { text: 'Custom automation', enabled: false },
          { text: 'Guest', enabled: false },
        ],
      },
      {
        heading: 'ADVANCES',
        items: [
          { text: 'Centralized comms hub', enabled: true },
          { text: 'iOS & Android apps', enabled: true },
          { text: 'Send mass emails', enabled: false },
          { text: 'Email sequences', enabled: false },
          { text: 'Quotes & invoices', enabled: false },
        ],
      },
    ],
    aiFeatures: [
      { text: 'AI Automation', enabled: true },
      { text: 'AI Writing', enabled: true },
      { text: 'AI Research', enabled: true },
    ],
  },
]

/** Hàm chuyển đổi tab */
function handleTabChange(index: number) {
  /**Gán tab đã chọn */

  ACTIVE_INDEX.value = ACTIVE_INDEX.value === 0 ? 1 : 0

  /** Mở tab business thì tự độgn chọn gói Enterprise */
  if (index === 1) {
    // setTab2()
    SELECTED_INDEX.value = 'Enterprise'
    /** Nếu chuyển lại all plans thì auto chọn gói Lite */
  } else {
    // setTab1()
    SELECTED_INDEX.value = 'Pro'
  }
}
// Gap = 1.5rem = 24px
const GAP = 24
const boxRefs = ref<Array<HTMLElement | null>>([])

const containerWidth = 100 // tính % cho responsive

function setTab1() {
  // const width = (containerWidth - 3 * (GAP / 16)) / 4 // 4 phần tử, GAP tính rem → % approx
  // PACKAGES[0].style = {
  //   top: '0%',
  //   left: '0%',
  //   width: `${width}%`,
  //   height: '100%',
  //   opacity: 1,
  //   transform: 'translateX(0)',
  // }
  // PACKAGES[1].style = {
  //   top: '0%',
  //   left: `${width + GAP / 16}%`,
  //   width: `${width}%`,
  //   height: '100%',
  //   opacity: 1,
  //   transform: 'translateX(0)',
  // }
  // PACKAGES[2].style = {
  //   top: '0%',
  //   left: `${2 * (width + GAP / 16)}%`,
  //   width: `${width}%`,
  //   height: '100%',
  //   opacity: 1,
  //   transform: 'translateX(0)',
  // }
  // PACKAGES[3].style = {
  //   top: '0%',
  //   left: `${3 * (width + GAP / 16)}%`,
  //   width: `${width}%`,
  //   height: '100%',
  //   opacity: 1,
  //   transform: 'translateX(0)',
  // }
}

function setTab2() {
  // C = 1/4, D = 3/4, gap giữa C-D = GAP
  // const widthC = (containerWidth - GAP / 16) * 0.25
  // const widthD = (containerWidth - GAP / 16) * 0.75
  // PACKAGES[0].style = {
  //   top: '0%',
  //   left: `-${widthC}%`,
  //   width: `${widthC}%`,
  //   height: '50%',
  //   opacity: 0,
  //   transform: 'translateX(-100%)',
  // }
  // PACKAGES[1].style = {
  //   top: '0%',
  //   left: `-${widthC}%`,
  //   width: `${widthC}%`,
  //   height: '50%',
  //   opacity: 0,
  //   transform: 'translateX(-100%)',
  // }
  // PACKAGES[2].style = {
  //   top: '0%',
  //   left: '0%',
  //   width: `${widthC}%`,
  //   height: '50%',
  //   opacity: 1,
  //   transform: 'translateX(0)',
  // }
  // PACKAGES[3].style = {
  //   top: '0%',
  //   left: `${widthC + GAP / 16}%`,
  //   width: `${widthD}%`,
  //   height: '50%',
  //   opacity: 1,
  //   transform: 'translateX(0)',
  // }
}
/** selected rơ */
const SELECTED_ROW = ref<{ sectionIndex: number; rowIndex: number } | null>(
  null
)
/** hàm selected row */
function handleRowSelect(payload: { sectionIndex: number; rowIndex: number }) {
  SELECTED_ROW.value = payload
}

/** Dữ liệu mock data compare plans và features */
const COMPARE_DATA = {
  title: $t('v1.view.onboarding.plans_and_feature'),
  plans: [
    { key: 'lite', name: 'Lite' },
    { key: 'pro', name: 'Pro' },
    { key: 'business', name: 'Business' },
    { key: 'enterprise', name: 'Enterprise' },
  ],
  sections: [
    {
      title: 'Essentials',
      features: [
        {
          name: 'Active contacts & deals (limit)',
          values: {
            lite: '1,000',
            pro: '10,000',
            business: '10,000',
            enterprise: 'Unlimited',
          },
        },
        {
          name: 'Feature A',
          values: { lite: true, pro: true, business: true, enterprise: true },
        },
        {
          name: 'Feature B',
          values: { lite: false, pro: false, business: true, enterprise: true },
        },
      ],
    },
    {
      title: 'Essentials',
      features: [
        {
          name: 'Active contacts & deals (limit)',
          values: {
            lite: '1,000',
            pro: '10,000',
            business: '10,000',
            enterprise: 'Unlimited',
          },
        },
        {
          name: 'Feature A',
          values: { lite: true, pro: true, business: true, enterprise: true },
        },
        {
          name: 'Feature B',
          values: { lite: false, pro: false, business: true, enterprise: true },
        },
      ],
    },
    {
      title: 'Essentials',
      features: [
        {
          name: 'Active contacts & deals (limit)',
          values: {
            lite: '1,000',
            pro: '10,000',
            business: '10,000',
            enterprise: 'Unlimited',
          },
        },
        {
          name: 'Feature A',
          values: { lite: true, pro: true, business: true, enterprise: true },
        },
        {
          name: 'Feature B',
          values: { lite: false, pro: false, business: true, enterprise: true },
        },
      ],
    },
    {
      title: 'Retion AI',
      features: [
        {
          name: 'AI credits (monthly)',
          values: {
            lite: '1,000',
            pro: '10,000',
            business: '10,000',
            enterprise: 'Unlimited',
          },
        },
        {
          name: 'AI assistant',
          values: { lite: true, pro: true, business: true, enterprise: true },
        },
      ],
    },
    {
      title: 'Automation',
      features: [
        {
          name: 'Workflow automations',
          values: { lite: false, pro: true, business: true, enterprise: true },
        },
      ],
    },
  ],
}

/**ẩn hiện modal */
const IS_OPEN = ref(false)
/**mua gói Pro 1 năm */
const IS_FULL_YEAR = ref(false)

/**ẩn hiện modal */
function toggleModal() {
  IS_OPEN.value = !IS_OPEN.value
}

/**kích hoạt gói dùng thử hoặc gói pro */
async function activeTrialOrProPack(pack: 'LITE' | 'PRO' | 'BUSINESS') {
  /**  nếu chưa chọn org thì không làm gì */
  if (!orgStore.selected_org_id || orgStore.is_loading) return

  /**  nếu đã mua gói lite thì không làm gì */
  if (orgStore.isLitePack() && pack === 'LITE') return
  /**  nếu đã mua gói thì không làm gì */
  if (orgStore.isProPack() && pack === 'PRO') return
  /**  nếu đã mua gói doanh nghiệp thì không làm gì */
  if (orgStore.isBusinessPack() && pack === 'BUSINESS') return

  /**  kích hoạt loading */
  orgStore.is_loading = true

  try {
    /**
     * tính toán gói cần mua
     * - nếu chưa mua bao giờ mà mua gói PRO, thì cho dùng thử trước
     * - nếu đã dùng thử rồi thì mua đúng
     */
    const PACKAGE = !orgStore.hasTrial() && pack === 'PRO' ? 'TRIAL' : pack

    /**dữ liệu của ví */
    const WALLET = await read_wallet(orgStore.selected_org_id)

    /**  nếu không có ví thì thông báo lỗi */
    if (!WALLET?.wallet_id)
      throw $t('v1.view.main.dashboard.org.pay.recharge.wrong_wallet_id')

    /**số tháng mua */
    const MONTHS = IS_FULL_YEAR.value ? 12 : 1

    /**  yêu cầu mua gói */
    await purchase_package(
      orgStore.selected_org_id,
      WALLET?.wallet_id,
      PACKAGE,
      MONTHS
    )

    /**  thông báo mua gói thành công */
    toast('success', $t('v1.view.main.dashboard.org.pay.upgrade.success'))

    /**  chờ 1s */
    await new Promise(cb => setTimeout(cb, 1000))

    /**  reload lại trang */
    window.location.reload()
  } catch (e) {
    if (e === 'WALLET.NOT_ENOUGH_MONEY')
      toastError($t('v1.view.main.dashboard.org.pay.upgrade.not_enough_money'))
    /**  nếu có lỗi thì hiện thông báo lỗi */ else toastError(e)
  }

  /**  tắt loading */
  orgStore.is_loading = false
}
/**hạ xuống gói free */
function downgradeFreePack() {}

/** mặc định hiện */
const open_all = ref(true)
/** Hàm bật tắt content */
const toggleAll = () => {
  open_all.value = !open_all.value
}
/** tạo call  */
const GRID_COLS = `416px repeat(${COMPARE_DATA.plans.length}, minmax(120px,1fr))`

/** helper: kiểm tra row đang được chọn (theo section) */
function isRowSelected(sectionIdx: number, rowIdx: number) {
  /** Trả về trạng thái row select*/
  return (
    SELECTED_ROW.value?.sectionIndex === sectionIdx &&
    SELECTED_ROW.value?.rowIndex === rowIdx
  )
}

/** on click row -> emit payload có sectionIndex & rowIndex
 * @param sectionIndex
 * @param rowIdx
 */
function onRowClick(sectionIdx: number, rowIdx: number) {
  /** Hàm emit select row */
  const DATA = { sectionIndex: sectionIdx, rowIndex: rowIdx }
}

/** click plan header
 * @param planKey
 */
function onPlanClick(planKey: string) {
  /** hàm emit plan select */
}
// Initialize Tab1
setTab1()

defineExpose({ toggleModal })
</script>
<style scoped lang="scss">
.item {
  @apply bg-slate-100 p-2 rounded-lg flex flex-col justify-between gap-8;
}
.btn {
  @apply py-2 px-4 rounded-md hover:brightness-90 text-sm font-semibold;
}
.expand-enter-active,
.expand-leave-active {
  transition: all 0.45s cubic-bezier(.2,.9,.3,1);
}

/* enter: từ ngoài trái */
.expand-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}
.expand-enter-to {
  opacity: 1;
  transform: translateX(0);
}

/* leave: tách khỏi flow */
.expand-leave-active {
  position: absolute;
  z-index: 40;
}
.expand-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.expand-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* reorder mượt */
.expand-move {
  transition: transform 0.45s cubic-bezier(.2,.9,.3,1);
}


</style>
