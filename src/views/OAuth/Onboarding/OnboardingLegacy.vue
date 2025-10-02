<template>
  <div class="h-screen bg-gradient-secondary py-10 px-6 font-sans">
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
              {{ total_steps }}
            </div>
            <div>
              <!-- Step title -->
              <h2 class="text-4xl font-bold">{{ STEP_TITLE }}</h2>
              <p class="font-medium">{{ STEP_DESCRIPTIONS }}</p>
            </div>
          </div>
          <div class="flex flex-col gap-5">
            <!-- Step content -->

            <!-- Step 1: Industry -->
            <div v-if="current_step === 0">
              <div class="grid grid-cols-3 gap-5 px-4">
                <button
                  v-for="option in OPTION_INDUSTRY"
                  :key="option"
                  :class="[
                    'border rounded-md py-3 px-5 text-center text-sm font-semibold shadow-sm',
                    SELECTED_INDUSTRY === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-500 bg-white',
                  ]"
                  @click="SELECTED_INDUSTRY = option"
                >
                  {{ option }}
                </button>
              </div>
            </div>

            <!-- Step 2: Role -->
            <div v-if="current_step === 1">
              <div class="grid grid-cols-3 gap-5 px-4">
                <button
                  v-for="option in OPTION_ROLE"
                  :key="option"
                  :class="[
                    'border rounded-md py-3 px-5 text-center text-sm font-semibold shadow-sm',
                    SELECTED_ROLE === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-500 bg-white',
                  ]"
                  @click="SELECTED_ROLE = option"
                >
                  {{ option }}
                </button>
              </div>
            </div>

            <!-- Step 3: Company name input -->
            <div
              v-if="current_step === 2"
              class="flex flex-col gap-1 max-w-lg"
            >
              <label class="block text-gray-700 font-medium text-sm">
                {{ $t('v1.view.onboarding.company_name') }}
                <span class="text-red-500">*</span></label
              >
              <input
                v-model="COMPANY_DETAILS.name"
                type="text"
                :placeholder="$t('v1.view.onboarding.enter_company_name')"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <!-- Step 4: Preferences -->
            <div v-if="current_step === 3">
              <div class="grid grid-cols-3 gap-5 px-4">
                <button
                  v-for="option in OPTION_PREFERENCES"
                  :key="option"
                  :class="[
                    'border rounded-md py-3 px-5 text-center font-semibold text-sm shadow-sm',
                    SELECTED_PREFERENCES === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-500 bg-white',
                  ]"
                  @click="SELECTED_PREFERENCES = option"
                >
                  {{ option }}
                </button>
              </div>
            </div>

            <!-- Step 5: Company details -->
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
                    v-model="COMPANY_DETAILS.website"
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
                    v-model="COMPANY_DETAILS.facebook"
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
                  <div class="pl-3 pr-1 py-2.5 bg-slate-100">
                    instagram.com/
                  </div>
                  <input
                    v-model="COMPANY_DETAILS.instagram"
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
                    v-model="COMPANY_DETAILS.tiktok"
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
                    v-model="COMPANY_DETAILS.zalo"
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
          <button
            class="px-10 py-3 gap-4 rounded-md bg-gray-200 font-medium text-black focus:outline-none disabled:opacity-50"
            :disabled="current_step === 0"
            @click="prevStep"
          >
            {{ $t('v1.view.onboarding.back') }}
          </button>

          <!-- Khi chưa đến step 5 -->
          <div class="flex items-center w-2/3 justify-end gap-4">
            <!-- Khi step 5 -->
            <template v-if="current_step === total_steps - 1">
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
                :disabled="!IS_STEP_VALID"
                :class="[
                  'px-10 py-3 rounded-md font-medium focus:outline-none flex-shrink-0',
                  IS_STEP_VALID
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-600',
                ]"
                @click="submitForm"
              >
                {{ $t('v1.view.onboarding.create_account') }}
              </button>
            </template>

            <!-- Khi chưa đến step 5 -->
            <template v-else>
              <button
                :disabled="!IS_STEP_VALID"
                :class="[
                  'px-10 py-3 rounded-md font-medium focus:outline-none',
                  IS_STEP_VALID
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-600',
                ]"
                @click="nextStep"
              >
                {{ $t('v1.view.onboarding.next') }}
              </button>
            </template>
          </div>
        </div>
      </main>
    </div>
    <!-- <OnboardingForm
      v-if="flow_step === 1"
      v-model:industry="SELECTED_INDUSTRY"
      v-model:role="SELECTED_ROLE"
      v-model:companyName="COMPANY_DETAILS.name"
      v-model:preferences="SELECTED_PREFERENCES"
      v-model:companyDetails="COMPANY_DETAILS"
      :current-step="current_step"
      :total-steps="total_steps"
      :is-step-valid="IS_STEP_VALID"
      @next-step="nextStep"
      @prev-step="prevStep"
      @submit="submitForm"
    /> -->
    <!-- flow 2: loading tạo tài khoản -->

    <!-- flow 3: verify account -->
    <!-- <OnboardingVerify
      v-else-if="flow_step === 3"
      :email="email"
      @resend="resendVerification"
      @back="backToLogin"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import OnboardingForm from './OnboardingFormLegacy.vue'
import OnboardingLoading from './OnboardingLoading.vue'
import OnboardingVerify from './OnboardingVerify.vue'

const { t: $t } = useI18n()
/** 1: 5 bước cơ bản, 2: loading, 3: verify */
const flow_step = ref<1 | 2 | 3>(1)

/** email để verify ở flow 3 */
const email = ref('user@example.com')
/** verify actions */
const resendVerification = () => {
  console.log('Gửi lại email verify')
}
const backToLogin = () => {
  console.log('Quay lại trang login')
}

/**Bước hiện tại */
const current_step = ref(0)
/** Tổng số bước */
const total_steps = 5

/** Step 1 */
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
/** Lựa chọn ngành nghề */
const SELECTED_INDUSTRY = ref<string | null>(null)

/** Step 2 */
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
const SELECTED_ROLE = ref<string | null>(null)

/** Step 3 */
const company_name = ref('')

/** Step 4 */
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
const SELECTED_PREFERENCES = ref<string | null>(null)

/** Step 5 */
const COMPANY_DETAILS = ref({
  name: '',
  website: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  zalo: '',
})

/** Title + description theo step */
const STEP_TITLE = computed(() => {
  return [
    $t('v1.view.onboarding.step_industry'),
    $t('v1.view.onboarding.step_role'),
    $t('v1.view.onboarding.company_question'),
    $t('v1.view.onboarding.company_preferences'),
    $t('v1.view.onboarding.company_summary'),
  ][current_step.value]
})
/** description các màn */
const STEP_DESCRIPTIONS = computed(() => {
  return [
    $t('v1.view.onboarding.step_industry_description'),
    $t('v1.view.onboarding.step_role_description'),
    $t('v1.view.onboarding.company_question_description'),
    $t('v1.view.onboarding.company_preferences_description'),
    $t('v1.view.onboarding.company_summary_description'),
  ][current_step.value]
})

/** Điều kiện hợp lệ mỗi bước */
const IS_STEP_VALID = computed(() => {
  switch (current_step.value) {
    case 0:
      return !!SELECTED_INDUSTRY.value
    case 1:
      return !!SELECTED_ROLE.value
    case 2:
      return COMPANY_DETAILS.value.name.trim().length > 0
    case 3:
      return !!SELECTED_PREFERENCES.value
    case 4:
      /** Step cuối yêu cầu phải nhập website ít nhất */
      return COMPANY_DETAILS.value.website.trim().length > 0
    default:
      return false
  }
})

/** Navigation */
const nextStep = () => {
  if (IS_STEP_VALID.value && current_step.value < total_steps - 1) {
    current_step.value++
  }
}
/** Previous step */
const prevStep = () => {
  if (current_step.value > 0) current_step.value--
}

/** Submit */
const submitForm = () => {
  if (!IS_STEP_VALID.value) return
  console.log('Industry:', SELECTED_INDUSTRY.value)
  console.log('Role:', SELECTED_ROLE.value)
  console.log('Company name step 3:', company_name.value)
  console.log('Preferences:', SELECTED_PREFERENCES.value)
  console.log('Company details step 5:', COMPANY_DETAILS.value)
  alert('Form đã submit!')
}
</script>

<style scoped>
html,
body,
#app {
  height: 100%;
}
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
</style>
