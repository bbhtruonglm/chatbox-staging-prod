<template>
  <div
    class="flex flex-row p-5 gap-2.5 cursor-pointer relative"
    :class="[
      selected
        ? 'bg-cyan-50 border-cyan-700 border-2 shadow-md'
        : 'bg-white border-gray-300 border-2',
      (is_popular && active_tab === 0 && title === 'Pro') ||
      (is_popular && active_tab === 1 && title === 'Enterprise')
        ? 'rounded-b-2xl'
        : 'rounded-2xl',
    ]"
    @click="onSelect"
  >
    <div
      v-if="is_sale_off"
      class="absolute flex justify-center items-center top-1 text-sm font-medium right-1 z-10 gap-1 py-0.5 px-2 rounded-md bg-blue-50 text-blue-600"
    >
      <GiftIcon class="size-4" />
      <h4>{{ is_sale_off }}</h4>
    </div>
    <div class="flex flex-col gap-3 cursor-pointer transition-all duration-200">
      <div
        v-if="
          (is_popular && active_tab === 0 && title === 'Pro') ||
          (is_popular && active_tab === 1 && title === 'Enterprise')
        "
        class="absolute flex justify-center items-center text-sm font-semibold text-white -top-8 left-0 z-10 h-9 rounded-t-lg bg-cyan-700"
        style="width: calc(100% + 4px); left: -2px"
      >
        {{ $t('v1.view.onboarding.popular') }}
      </div>
      <div class="pb-10 h-full">
        <!-- Title + price -->
        <div class="flex items-center gap-2 h-172">
          <div
            class="flex size-6 rounded-full justify-center items-center flex-shrink-0"
            :class="[selected ? 'bg-green-600' : 'bg-gray-400']"
          >
            <div
              class="flex bg-white rounded-full justify-center items-center"
              :class="[selected ? 'bg-green-600' : 'bg-gray-400']"
            >
              <CheckCircleIcon
                class="size-5 text-green-600"
                :class="[!selected ? 'text-white' : '']"
              />
            </div>
          </div>
          <h2 class="text-4xl font-bold">{{ title }}</h2>
        </div>

        <div
          v-if="title !== 'Enterprise'"
          class="py-3 flex gap-3"
          :class="locale === 'vn' ? 'flex-col' : 'flex-row'"
        >
          <span
            class="font-bold"
            :class="[locale === 'vn' ? 'text-4xl' : 'text-6xl']"
          >
            {{ price }}
          </span>
          <div>
            <span class="text-2xl font-semibold line-through text-slate-500">
              {{ original_price }}
            </span>
            <div
              v-if="code"
              class="p-1 py-0.5 bg-green-100 rounded-md text-xs text-green-700 w-fit"
            >
              {{ $t('v1.view.onboarding.code') }}
              <span class="font-semibold">
                {{ code }}
              </span>
              {{ discount }} {{ discount_percent }}
            </div>
          </div>
        </div>
        <div
          v-else
          class="size-20 my-0.5 text-black"
        >
          <img
            src="@/assets/icons/Enterprise.svg"
            alt="Logo"
            class="w-20 h-20"
          />
        </div>

        <p class="text-sm text-gray-800 font-medium">
          {{ subtitle }}
        </p>
      </div>
      <div class="flex items-center justify-center gap-2 w-full">
        <!-- CTA button -->
        <button
          @click="ctaOnClick && ctaOnClick()"
          class="px-4 py-2 text-sm uppercase font-semibold rounded-md border flex items-center justify-center gap-2 w-fit"
          :class="[
            selected
              ? 'bg-green-600 border-green-600 hover:bg-green-500 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-black',
          ]"
        >
          <EnvelopeIcon
            v-if="title === 'Enterprise'"
            class="size-5"
          />
          {{ ctaText }}
          <CheckBadgeIcon
            v-if="title === 'Free'"
            class="size-5"
          />
        </button>
      </div>

      <hr class="" />

      <p class="text-sm text-gray-800 font-medium py-5">
        {{ description }}
      </p>
      <!-- Sections -->
      <div
        v-for="section in sections"
        :key="section.heading"
        class="flex flex-col gap-3"
      >
        <h3 class="font-bold uppercase text-sm">{{ section.heading }}</h3>
        <ul class="space-y-2">
          <li
            v-for="item in section.items"
            :key="item.text"
            class="flex items-start gap-2 text-sm"
            :class="
              item.enabled ? 'text-gray-800' : 'text-slate-500 line-through'
            "
          >
            <div
              v-if="item.enabled"
              class="flex size-5 bg-green-600 rounded-full justify-center items-center"
            >
              <div
                class="flex size-6.5 bg-white rounded-full justify-center items-center"
              >
                <CheckCircleIcon class="w-4 h-4 text-green-600 shrink-0" />
              </div>
            </div>

            <div
              v-else
              class="flex size-5 bg-gray-400 rounded-full justify-center items-center"
            >
              <div
                class="flex size-5.5 bg-white rounded-full justify-center items-center"
              >
                <CheckCircleIcon class="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            </div>
            <span>{{ item.text }}</span>
          </li>
        </ul>
      </div>

      <!-- AI features -->
      <div
        v-if="aiFeatures.length"
        class="flex flex-col gap-3"
      >
        <h3 class="font-bold uppercase text-sm">AI-Powered</h3>
        <ul class="space-y-2">
          <li
            v-for="item in aiFeatures"
            :key="item.text"
            class="flex items-start gap-2 text-sm"
            :class="
              item.enabled ? 'text-gray-800' : 'text-gray-400 line-through'
            "
          >
            <div
              v-if="item.enabled"
              class="flex size-5 bg-slate-800 rounded-full justify-center items-center"
            >
              <div
                class="flex size-6.5 bg-white rounded-full justify-center items-center"
              >
                <CheckCircleIcon class="w-4 h-4 text-slate-800 shrink-0" />
              </div>
            </div>

            <div
              v-else
              class="flex size-5 bg-gray-400 rounded-full justify-center items-center"
            >
              <div
                class="flex size-6.5 bg-white rounded-full justify-center items-center"
              >
                <CheckCircleIcon class="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            </div>
            <span>{{ item.text }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div
      v-show="active_tab == 1 && title === 'Enterprise'"
      class="h-full w-full bg-white/60 rounded-xl p-5 space-y-6 border"
    >
      <!-- Title -->
      <div>
        <h2 class="text-xl font-semibold">
          Let’s talk about what Retion can do for you
        </h2>
        <p class="text-sm font-medium">
          Our team is here to answer any questions or tailor a solution for you.
        </p>
      </div>

      <!-- What you can expect -->
      <div class="flex flex-col gap-3 text-sm">
        <h3 class="font-semibold">What you can expect</h3>
        <ul class="text-gray-700 space-y-3">
          <li class="flex items-center gap-2">
            <span><BookOpenIcon class="size-5" /></span> Learn more about our
            advanced features
          </li>
          <li class="flex items-center gap-2">
            <span><UserCircleIcon class="size-5" /></span> Connect with an
            expert to discuss your specific needs
          </li>
          <li class="flex items-center gap-2">
            <span><CurrencyDollarIcon class="size-5" /></span> Discuss pricing
            and choose the right plan
          </li>
          <li class="flex items-center gap-2">
            <span><LockClosedIcon class="size-5" /></span> No commitment
            required
          </li>
        </ul>
      </div>

      <!-- Logos -->
      <div class="w-full flex flex-col justify-center items-center py-3 gap-3">
        <p class="text-gray-600 text-sm">
          TRUSTED BY MORE THAN
          <span class="font-bold">10,000</span> COMPANIES FROM 10+ COUNTRIES
        </p>
        <div class="flex flex-wrap items-center gap-6 text-gray-400">
          <!-- thay bằng <img> logos thực -->
          <span class="font-semibold">NPAY</span>
          <span class="font-semibold">Grab</span>
          <span class="font-semibold">Viettel</span>
          <span class="font-semibold">CocaCola</span>
          <span class="font-semibold">Cốc Cốc</span>
          <span class="font-semibold">PEPSI</span>
        </div>
      </div>
      <hr class="" />
      <!-- Form -->
      <div class="">
        <h3 class="font-semibold text-xl">Talk with a consultant</h3>
        <p class="text-gray-600 text-sm">
          We'll call you or email you at
          <a
            href="mailto:mike@botbanhang.vn"
            class="text-black font-semibold"
            >mike@botbanhang.vn</a
          >
          to arrange a time to chat.
        </p>

        <form class="mt-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium"
                >First name <span class="text-red-500">*</span></label
              >
              <input
                type="text"
                class="p-2 border block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium"
                >Last name <span class="text-red-500">*</span></label
              >
              <input
                type="text"
                class="p-2 border block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium"
                >Phone number <span class="text-red-500">*</span></label
              >
              <input
                type="text"
                class="p-2 border block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label class="block text-sm font-medium"
                >Company size <span class="text-red-500">*</span></label
              >
              <select
                class="p-2 border block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option>1-10</option>
                <option>11-20</option>
                <option>20-50</option>
                <option>50+</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium"
              >How can our team help you?
              <span class="text-red-500">*</span></label
            >
            <textarea
              rows="6"
              class="p-2 border block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Enter how can our team help you"
            ></textarea>
          </div>
          <div class="flex w-full justify-end">
            <button
              type="submit"
              class="bg-cyan-700 text-white px-6 py-2 rounded-md hover:bg-cyan-800"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CheckBadgeIcon,
  EnvelopeIcon,
  BookOpenIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  LockClosedIcon,
  GifIcon,
  GiftIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import Cookies from 'js-cookie'
import { withDefaults } from 'vue'

// --- Types ---
type SectionItem = { text: string; enabled: boolean }
type Section = { heading: string; items: SectionItem[] }
type AIFeature = { text: string; enabled: boolean }
/** Khai báo props */
const props = withDefaults(
  defineProps<{
    /** Tên gói */
    title?: string
    /** Giá gói */
    price?: string
    /** Tiêu đề phụ gói */
    subtitle?: string
    /** Mô tả gói */
    description?: string
    /** Title nút bấm */
    ctaText?: string
    /** Hàm CTA click */
    ctaOnClick?: (() => void) | undefined
    /** Trạng thái thẻ sale off */
    is_sale_off?: string
    /** Thẻ gói phổ biến */
    is_popular?: boolean
    /** Trạng thái highlight */
    highlight?: boolean
    /** Khai báo section */
    sections?: Section[]
    /** AI feature */
    aiFeatures?: AIFeature[]
    /** thao tác chọn gói */
    selected?: boolean
    /** Hàm xử lý chọn gói */
    onSelect?: (() => void) | undefined
    /** Active tab gói */
    active_tab?: number
    /** Giá gốc */
    original_price?: string
    /** Mã giảm giá */
    code?: string
    /** Tỉ lệ giảm giá */
    discount_percent?: string
    /** Mô tả giảm giá */
    discount?: string
  }>(),
  {
    title: '',
    price: '',
    subtitle: '',
    description: '',
    ctaText: 'Get started',
    ctaOnClick: undefined,
    is_popular: false,
    highlight: false,
    sections: () => [],
    aiFeatures: () => [],
    selected: false,
    onSelect: undefined,
    active_tab: undefined,
    original_price: '',
    code: '',
    discount_percent: '',
    discount: '',
  }
)
/** Lấy locale từ cookies */
const locale = Cookies.get('locale') || 'en'
</script>

<style scoped>
.absolute {
  transition: all 0.5s ease;
}
</style>
