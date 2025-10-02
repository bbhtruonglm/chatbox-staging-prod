<template>
  <div
    class="flex max-full mx-auto overflow-hidden gap-2.5 flex-grow h-full min-h-0"
  >
    <!-- Left panel -->
    <aside
      class="w-96 p-5 gap-10 bg-white flex flex-col justify-between flex-grow min-h-0 h-full rounded-xl"
    >
      <div class="flex flex-col gap-10">
        <div class="flex items-start gap-3">
          <div
            class="size-8 rounded-full bg-black text-white flex items-center justify-center font-bold"
          ></div>
          <div class="text-2xl font-semibold">Retion</div>
        </div>
        <div class="flex flex-col gap-3">
          <h1 class="text-5xl leading-tight font-semibold">
            {{ $t('v1.view.onboarding.personal_experience') }}
          </h1>
          <p class="text-black text-sm font-medium">
            {{ $t('v1.view.onboarding.two_minutes') }}
          </p>
        </div>
      </div>
    </aside>

    <!-- Right panel -->
    <main
      class="flex w-full flex-grow min-h-0 h-full gap-3 px-3 py-5 rounded-xl bg-white flex-col justify-between"
    >
      <div class="flex flex-col flex-grow min-h-0 h-full gap-8 border-b">
        <!-- Step header -->
        <div class="flex flex-col justify-between gap-3">
          <div
            class="flex w-fit items-center bg-slate-300 text-gray-700 px-3 py-1 rounded-full text-sm"
          >
            {{ current_step + 1 }} {{ $t('v1.view.onboarding.step_of') }}
            {{ totalSteps }}
          </div>
          <div>
            <h2 class="text-4xl font-bold">{{ STEP_TITLE }}</h2>
            <p class="font-medium">{{ STEP_DESCRIPTIONS }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <!-- Step 1 -->
          <div v-if="current_step === 0">
            <div class="grid grid-cols-3 gap-5 px-4">
              <button
                v-for="option in OPTION_INDUSTRY"
                :key="option"
                :class="[
                  'border rounded-md py-3 px-5 text-center text-sm font-semibold shadow-sm',
                  localIndustry === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-500 bg-white',
                ]"
                @click="localIndustry = option"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- Step 2 -->
          <div v-if="current_step === 1">
            <div class="grid grid-cols-3 gap-5 px-4">
              <button
                v-for="option in OPTION_ROLE"
                :key="option"
                :class="[
                  'border rounded-md py-3 px-5 text-center text-sm font-semibold shadow-sm',
                  localRole === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-500 bg-white',
                ]"
                @click="localRole = option"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- Step 3 -->
          <div
            v-if="current_step === 2"
            class="flex flex-col gap-1 max-w-lg"
          >
            <label class="block text-gray-700 font-medium text-sm">
              {{ $t('v1.view.onboarding.company_name') }}
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="localCompanyName"
              type="text"
              :placeholder="$t('v1.view.onboarding.enter_company_name')"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <!-- Step 4 -->
          <div v-if="current_step === 3">
            <div class="grid grid-cols-3 gap-5 px-4">
              <button
                v-for="option in OPTION_PREFERENCES"
                :key="option"
                :class="[
                  'border rounded-md py-3 px-5 text-center font-semibold text-sm shadow-sm',
                  localPreferences === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-500 bg-white',
                ]"
                @click="localPreferences = option"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- Step 5 -->
          <div
            v-if="current_step === 4"
            class="flex flex-col max-w-lg gap-8"
          >
            <div class="flex flex-col gap-1">
              <label class="block text-gray-700 font-semibold text-sm">{{
                $t('v1.view.onboarding.website_company')
              }}</label>
              <div
                class="flex border rounded-md overflow-hidden items-center border-gray-200"
              >
                <div class="pl-3 pr-1 py-2.5 bg-slate-100">www.</div>
                <input
                  v-model="localCompanyDetails.website"
                  type="text"
                  :placeholder="$t('v1.view.onboarding.enter_website')"
                  class="w-full rounded-r-md px-4 pl-1 py-2 font-semibold"
                />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <label class="block text-gray-700 font-semibold text-sm">{{
                $t('v1.view.onboarding.facebook_page')
              }}</label>
              <div
                class="flex border rounded-md overflow-hidden items-center border-gray-200"
              >
                <div class="pl-3 pr-1 py-2.5 bg-slate-100">facebook.com/</div>
                <input
                  v-model="localCompanyDetails.facebook"
                  type="text"
                  :placeholder="$t('v1.view.onboarding.enter_facebook')"
                  class="w-full rounded-r-md px-4 pl-1 py-2 font-semibold"
                />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <label class="block text-gray-700 font-semibold text-sm">{{
                $t('v1.view.onboarding.instagram_page')
              }}</label>
              <div
                class="flex border rounded-md overflow-hidden items-center border-gray-200"
              >
                <div class="pl-3 pr-1 py-2.5 bg-slate-100">instagram.com/</div>
                <input
                  v-model="localCompanyDetails.instagram"
                  type="text"
                  :placeholder="$t('v1.view.onboarding.enter_instagram')"
                  class="w-full rounded-r-md px-4 pl-1 py-2 font-semibold"
                />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <label class="block text-gray-700 font-semibold text-sm">{{
                $t('v1.view.onboarding.tiktok_page')
              }}</label>
              <div
                class="flex border rounded-md overflow-hidden items-center border-gray-200"
              >
                <div class="pl-3 pr-1 py-2.5 bg-slate-100">tiktok.com/</div>
                <input
                  v-model="localCompanyDetails.tiktok"
                  type="text"
                  :placeholder="$t('v1.view.onboarding.enter_tiktok')"
                  class="w-full rounded-r-md px-4 pl-1 py-2 font-semibold"
                />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <label class="block text-gray-700 font-semibold text-sm">{{
                $t('v1.view.onboarding.zalo')
              }}</label>
              <div
                class="flex border rounded-md overflow-hidden items-center border-gray-200"
              >
                <div class="pl-3 pr-1 py-2.5 bg-slate-100">zalo.me/</div>
                <input
                  v-model="localCompanyDetails.zalo"
                  type="text"
                  :placeholder="$t('v1.view.onboarding.enter_zalo')"
                  class="w-full rounded-r-md px-4 pl-1 py-2 font-semibold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex justify-between items-center w-full">
        <!-- Back -->
        <button
          class="px-10 py-3 gap-4 rounded-md bg-gray-200 font-medium text-black focus:outline-none disabled:opacity-50"
          :disabled="current_step === 0"
          @click="$emit('prev-step')"
        >
          {{ $t('v1.view.onboarding.back') }}
        </button>

        <!-- Right content -->
        <div class="flex items-center w-2/3 justify-end gap-4">
          <!-- Step 5 -->
          <template v-if="current_step === totalSteps - 1">
            <p class="text-xs text-left">
              {{ $t('v1.view.onboarding.step_5_description') }}
              <a
                class="underline text-black"
                href="https://retion.ai"
                target="_blank"
              >
                {{ $t('v1.view.onboarding.step_5_description_2') }}
              </a>
            </p>
            <button
              :disabled="!isStepValid"
              :class="[
                'px-10 py-3 rounded-md font-medium focus:outline-none flex-shrink-0',
                isStepValid
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-600',
              ]"
              @click="$emit('submit')"
            >
              {{ $t('v1.view.onboarding.create_account') }}
            </button>
          </template>

          <!-- Not step 5 -->
          <template v-else>
            <button
              :disabled="!isStepValid"
              :class="[
                'px-10 py-3 rounded-md font-medium focus:outline-none',
                isStepValid
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-600',
              ]"
              @click="$emit('next-step')"
            >
              {{ $t('v1.view.onboarding.next') }}
            </button>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
/** Hàm dịch */
const { t: $t } = useI18n()

/** Props từ cha */
const props = defineProps<{
  /** Bước hiện tại */
  current_step: number
  /** Tổng só */
  totalSteps: number
  isStepValid: boolean
  industry: string | null
  role: string | null
  companyName: string
  preferences: string | null
  companyDetails: any
}>()

const emit = defineEmits([
  'update:industry',
  'update:role',
  'update:companyName',
  'update:preferences',
  'update:companyDetails',
  'next-step',
  'prev-step',
  'submit',
])

// Local state
const localIndustry = ref(props.industry)
const localRole = ref(props.role)
const localCompanyName = ref(props.companyName)
const localPreferences = ref(props.preferences)
const localCompanyDetails = ref({ ...props.companyDetails })

console.log(localCompanyDetails.value, 'kkkkkk')

// Đồng bộ props xuống local
watch(
  () => props.industry,
  v => (localIndustry.value = v)
)
watch(
  () => props.role,
  v => (localRole.value = v)
)
watch(
  () => props.companyName,
  v => (localCompanyName.value = v)
)
watch(
  () => props.preferences,
  v => (localPreferences.value = v)
)
watch(
  () => props.companyDetails,
  v => (localCompanyDetails.value = { ...v })
)

// Emit khi local thay đổi
watch(localIndustry, v => emit('update:industry', v))
watch(localRole, v => emit('update:role', v))
watch(localCompanyName, v => emit('update:companyName', v))
watch(localPreferences, v => emit('update:preferences', v))
watch(localCompanyDetails, v => emit('update:companyDetails', v))

// OPTIONS
const OPTION_INDUSTRY = [
  $t('v1.view.onboarding.industry_1'),
  $t('v1.view.onboarding.industry_2'),
  $t('v1.view.onboarding.industry_3'),
  $t('v1.view.onboarding.industry_4'),
  $t('v1.view.onboarding.industry_5'),
  $t('v1.view.onboarding.industry_6'),
  $t('v1.view.onboarding.industry_7'),
  $t('v1.view.onboarding.industry_8'),
  $t('v1.view.onboarding.industry_9'),
]
const OPTION_ROLE = [
  $t('v1.view.onboarding.role_1'),
  $t('v1.view.onboarding.role_2'),
  $t('v1.view.onboarding.role_3'),
  $t('v1.view.onboarding.role_4'),
  $t('v1.view.onboarding.role_5'),
  $t('v1.view.onboarding.role_6'),
  $t('v1.view.onboarding.role_7'),
  $t('v1.view.onboarding.role_8'),
]
const OPTION_PREFERENCES = [
  $t('v1.view.onboarding.preference_1'),
  $t('v1.view.onboarding.preference_2'),
  $t('v1.view.onboarding.preference_3'),
  $t('v1.view.onboarding.preference_4'),
  $t('v1.view.onboarding.preference_5'),
  $t('v1.view.onboarding.preference_6'),
  $t('v1.view.onboarding.preference_7'),
  $t('v1.view.onboarding.preference_8'),
]

// Title + desc
const STEP_TITLE = computed(() => {
  return [
    $t('v1.view.onboarding.step_industry'),
    $t('v1.view.onboarding.step_role'),
    $t('v1.view.onboarding.company_question'),
    $t('v1.view.onboarding.company_preferences'),
    $t('v1.view.onboarding.company_summary'),
  ][props.current_step]
})
const STEP_DESCRIPTIONS = computed(() => {
  return [
    $t('v1.view.onboarding.step_industry_description'),
    $t('v1.view.onboarding.step_role_description'),
    $t('v1.view.onboarding.company_question_description'),
    $t('v1.view.onboarding.company_preferences_description'),
    $t('v1.view.onboarding.company_summary_description'),
  ][props.current_step]
})
</script>
