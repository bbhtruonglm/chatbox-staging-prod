<template>
  <div class="flex flex-col gap-1">
    <div class="flex gap-3 items-center justify-between">
      <div class="text-xl font-bold">
        {{ content?.title }}
      </div>
      <slot name="toggle" />
    </div>
    <ul class="text-sm list-disc list-inside flex flex-col gap-1">
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.upgrade.price') }}
        <span class="font-bold">
          {{ content?.price }}
        </span>
      </li>
      <!-- <li
        v-if="is_full_year"
        v-html="content?.price_year"
        class="pl-2"
      /> -->
      <li
        v-if="Number(SELECTED) > 1"
        class="pl-2"
      >
        {{ $t('v1.view.main.dashboard.org.pay.upgrade.total_amount') }}
        <span class="font-bold">
          {{ formattedPrice }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.upgrade.page') }}
        <span class="font-semibold">
          {{ content?.page }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.upgrade.member') }}
        <span class="font-semibold">
          {{ content?.member }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.ai_text') }}:
        <span class="font-semibold">
          {{ content?.ai_text }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.ai_image') }}:
        <span class="font-semibold">
          {{ content?.ai_image }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.ai_sound') }}:
        <span class="font-semibold">
          {{ content?.ai_sound }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.bot') }}:
        <span class="font-semibold">
          {{ content?.fau }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.client') }}:
        <span class="font-semibold">
          {{ content?.client }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.chat_feature') }}:
        <span class="font-semibold">
          {{ content?.chat_feature }}
        </span>
        <slot name="chat_feature" />
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.ai_feature') }}:
        <span class="font-semibold">
          {{ content?.ai_feature }}
        </span>
        <slot name="ai_feature" />
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.company_name') }}:
        <span class="font-semibold">
          {{ content?.company_name }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.api_integrate') }}:
        <span class="font-semibold">
          {{ content?.api_integrate }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.domain_logo') }}:
        <span class="font-semibold">
          {{ content?.domain_logo }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.support') }}:
        <span class="font-semibold">
          {{ content?.support }}
        </span>
        <slot name="support" />
      </li>
      <li
        v-if="content?.note"
        class="pl-2 whitespace-pre-line break-words w-full font-semibold"
      >
        {{ $t('v1.view.main.dashboard.org.pay.note') }}
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { useOrgStore } from '@/stores'
import type { IContent } from './type'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()
const orgStore = useOrgStore()

const $props = withDefaults(
  defineProps<{
    content: IContent
    is_full_year?: boolean
    SELECTED?: string
  }>(),
  {}
)

const formattedPrice = computed(() => {
  const qty = Number($props.SELECTED) || 1 // phải dùng $props.SELECTED
  let price = 0
  console.log($props.content?.title, 'kkkkk')
  switch ($props.content?.title) {
    case $t('v1.view.main.dashboard.org.pay.lite'):
      price = 199000 * qty
      break
    case $t('v1.view.main.dashboard.org.pay.pro'):
      price = 480000 * qty
      break
    case $t('v1.view.main.dashboard.org.pay.business'):
      price = 2600000 * qty
      break
    default:
      price = 0
  }

  console.log($props.SELECTED, 'selected')
  console.log(qty, 'qty')

  console.log(price, 'price')

  return price.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
})
</script>
