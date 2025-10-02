<template>
  <!-- <div class="h-screen bg-gradient-primary py-10 px-6 font-sans"> -->
  <div class="h-screen bg-gradient-primary py-10 px-6 font-sans">
    <div
      v-if="flow_step === 1"
      class="flex mx-auto overflow-hidden gap-2.5 flex-grow h-full min-h-0"
    >
      <!-- Left panel -->
      <aside
        class="w-96 p-5 gap-10 bg-white flex flex-col justify-between flex-grow min-h-0 h-full rounded-xl"
      >
        <div class="flex flex-col gap-10">
          <div class="flex flex-col gap-10">
            <div
              :style="{
                backgroundImage: `url(${commonStore.partner?.logo?.full})`,
              }"
              class="h-7 w-full bg-contain bg-no-repeat bg-left flex-shrink-0"
            />
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
              <h2 class="text-4xl font-bold">{{ STEP_TITLE }}</h2>
              <p class="font-medium">{{ STEP_DESCRIPTIONS }}</p>
            </div>
          </div>

          <Transition
            name="fade-slide"
            mode="out-in"
            @after-enter="focusCompanyInput"
          >
            <div
              :key="current_step"
              class="flex flex-col gap-5 flex-grow min-h-0 overflow-hidden overflow-y-auto py-2"
            >
              <!-- Step 1: Industry -->
              <div v-if="current_step === 0">
                <div class="grid grid-cols-3 gap-5 px-4">
                  <button
                    v-for="option in OPTION_INDUSTRY"
                    :key="option"
                    :class="[
                      'border rounded-md py-3 px-5 text-center text-sm font-semibold transition-all',
                      SELECTED_INDUSTRY === option
                        ? 'bg-blue-700 border-blue-700 text-white'
                        : 'border-slate-500 bg-white hover:bg-blue-100',
                    ]"
                    @click="handleIndustry(option)"
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
                      'border rounded-md py-3 px-5 text-center text-sm font-semibold transition-all',
                      SELECTED_ROLE === option
                        ? 'bg-blue-700 border-blue-700 text-white'
                        : 'border-slate-500 bg-white hover:bg-blue-100',
                    ]"
                    @click="handleRole(option)"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>

              <!-- Step 3: Company name -->
              <div
                v-if="current_step === 2"
                class="flex flex-col gap-1 max-w-lg"
              >
                <label class="block text-gray-700 font-medium text-sm">
                  {{ $t('v1.view.onboarding.company_name')
                  }}<span class="text-red-500">*</span>
                </label>
                <input
                  ref="company_name_input_ref"
                  v-model="COMPANY_DETAILS.name"
                  type="text"
                  :placeholder="$t('v1.view.onboarding.enter_company_name')"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                />
              </div>

              <!-- Step 4: Preferences -->
              <div v-if="current_step === 3">
                <div class="grid grid-cols-3 gap-5 px-4">
                  <button
                    v-for="option in OPTION_PREFERENCES"
                    :key="option"
                    :class="[
                      'border rounded-md py-3 px-5 text-center font-semibold text-sm transition-all',
                      SELECTED_PREFERENCES === option
                        ? 'bg-blue-700 border-blue-700 text-white'
                        : 'border-slate-500 bg-white hover:bg-blue-100',
                    ]"
                    @click="handlePreference(option)"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>

              <!-- Step 5: Company details -->
              <div
                v-if="current_step === 4"
                class="flex flex-col max-w-lg gap-4"
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
                      ref="company_website_input_ref"
                      v-model="COMPANY_DETAILS.website"
                      type="text"
                      :placeholder="$t('v1.view.onboarding.enter_website')"
                      class="w-full rounded-r-md px-4 pl-1 py-2 font-semibold outline-none"
                      :class="
                        !IS_WEBSITE_VALID && COMPANY_DETAILS.website
                          ? 'border-red-500'
                          : ''
                      "
                    />
                    <!-- hiển thị lỗi -->
                  </div>
                  <p
                    v-if="COMPANY_DETAILS.website && !IS_WEBSITE_VALID"
                    class="text-red-500 text-xs"
                  >
                    {{ $t('v1.view.onboarding.validate_website') }}
                  </p>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="block text-gray-700 font-semibold text-sm">{{
                    $t('v1.view.onboarding.facebook_page')
                  }}</label>
                  <div
                    class="flex border rounded-md overflow-hidden items-center border-gray-200"
                  >
                    <div class="pl-3 pr-1 py-2.5 bg-slate-100">
                      facebook.com/
                    </div>
                    <input
                      v-model="COMPANY_DETAILS.facebook"
                      type="text"
                      :placeholder="$t('v1.view.onboarding.enter_facebook')"
                      class="w-full rounded-r-md px-4 pl-1 py-2 font-semibold outline-none"
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
                      class="w-full rounded-r-md px-4 pl-1 py-2 font-semibold outline-none"
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
                      class="w-full rounded-r-md px-4 pl-1 py-2 font-semibold outline-none"
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
                      class="w-full rounded-r-md px-4 pl-1 py-2 font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between items-center w-full">
          <button
            class="px-10 py-3 gap-4 rounded-md font-medium text-black focus:outline-none disabled:opacity-50"
            :class="[
              current_step === 0
                ? 'hover:bg-gray-200 bg-gray-200 cursor-not-allowed'
                : 'bg-gray-200 ',
            ]"
            :disabled="current_step === 0"
            @click="prevStep"
          >
            {{ $t('v1.view.onboarding.back') }}
          </button>

          <div class="flex items-center w-2/3 justify-end gap-4">
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

            <!-- chỉ hiện nút next ở step có input -->
            <template v-else>
              <button
                v-if="HAS_INPUT_STEP"
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
      v-model:COMPANY_DETAILS="COMPANY_DETAILS"
      :current-step="current_step"
      :total-steps="total_steps"
      :is-step-valid="IS_STEP_VALID"
      @next-step="nextStep"
      @prev-step="prevStep"
      @submit="submitForm"
    /> -->
    <!-- flow 2: loading tạo tài khoản -->
    <OnboardingLoading
      v-else-if="flow_step === 2"
      @complete="completeLoading"
    />

    <!-- flow 3: verify account -->
    <OnboardingVerify
      v-else-if="flow_step === 3"
      v-model:phone="phone"
      :current_step="current_step"
      :total_steps="total_steps"
      :STEP_TITLE="$t('v1.view.onboarding.verify_account')"
      :STEP_DESCRIPTIONS="$t('v1.view.onboarding.verify_account_description')"
      @resend="resendVerification"
      @back="backToLogin"
      @verify="verifyPhone"
    />

    <UpgradeModalV2
      v-else-if="flow_step === 4"
      @submit="submitPackage"
      :selected_preference="SELECTED_PREFERENCES"
    />
    <!-- flow 3: verify account -->
    <OnboardingQuickStarter
      v-else-if="flow_step === 5"
      v-model:phone="phone"
      :current_step="current_step_quick_start"
      :total_steps="2"
      @resend="resendVerification"
      @back="onPrevQuickStart"
      @next="onNextQuickStart"
      @skip_for_now="skipForNow"
    />
    <OnboardingCreatingAccount
      v-else-if="flow_step === 6"
      @complete="completeCreatingAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { useCommonStore } from '@/stores'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import OnboardingLoading from './OnboardingLoading.vue'
import OnboardingVerify from './OnboardingVerify.vue'

import UpgradeModalV2 from '@/views/OAuth/Onboarding/UpgradeModalV2.vue'
import OnboardingCreatingAccount from './OnboardingCreatingAccount.vue'
import OnboardingQuickStarter from './OnboardingQuickStarter.vue'
/** Hàm dịch ngôn ngữ */
const { t: $t } = useI18n()
/** Common store */
const commonStore = useCommonStore()
/** 1: 5 bước cơ bản, 2: loading, 3: verify */
const flow_step = ref<1 | 2 | 3 | 4 | 5 | 6>(1)

/** email để verify ở flow 3 */
const email = ref('user@example.com')
/** Số điện thoại */
const phone = ref('')

/** Hàm verify phone */
const verifyPhone = () => {
  console.log('verify phone')
  flow_step.value = 4
}
/** Hàm next trong quick start */
const onNextQuickStart = () => {
  /** NẾu đang ở step 1, thì chuyền step */
  if (current_step_quick_start.value < 1) {
    current_step_quick_start.value++
    return
  }
  /** Nếu step 2 -> chuyển sang màn onboarding */
  if (current_step_quick_start.value === 1) {
    /** Chuyển sang step cuối */
    flow_step.value = 6
  }
}
/** Hàm back trong quick start */
const onPrevQuickStart = () => {
  if (current_step_quick_start.value > 0) current_step_quick_start.value--
}
/** Hàm skip bước quick start*/
const skipForNow = () => {
  /** NẾu đang ở step 1, thì chuyền step */
  if (current_step_quick_start.value < 1) {
    current_step_quick_start.value++
    return
  }
  /** Nếu step 2 -> chuyển sang màn onboarding */
  if (current_step_quick_start.value === 1) {
    /** Chuyển sang step cuối */
    flow_step.value = 6
  }
}

/** Hàm verify phone */
const submitPackage = () => {
  console.log('submitPackage')
  /** Chuyển sang step 5 quick step */
  flow_step.value = 5
}

/** verify actions */
const resendVerification = () => {
  console.log('Gửi lại email verify')
}
/** Hàm trợ lại trang login */
const backToLogin = () => {
  console.log('Quay lại trang login')
}
/** Hàm hoàn thành loading */
const completeLoading = () => {
  /** Chuyển sang màn verify */
  flow_step.value = 3
}
/** Hàm hoàn thành loading */
const completeCreatingAccount = () => {
  /** Chuyển sang màn đăng nhập */
}
/**Bước hiện tại */
const current_step = ref(0)
/** Tổng số bước */
const total_steps = 5

/** step hiện tại mà bắt đầu nhanh */
const current_step_quick_start = ref(0)

/** ref tới input */
const company_name_input_ref = ref<HTMLInputElement | null>(null)

/** company website ref */
const company_website_input_ref = ref<HTMLInputElement | null>(null)

/** callback khi transition hoàn tất */
const focusCompanyInput = () => {
  /** Nếu có giá trị ref */
  if (company_name_input_ref.value) {
    /** Mới focus */
    company_name_input_ref.value.focus()
    console.log('Focused input', company_name_input_ref.value)
  }
  /** Nếu có giá trị ref chọn website công ty */
  if (company_website_input_ref.value) {
    /** tự độgn focus */
    company_website_input_ref.value.focus()
  }
}

/** regex cơ bản validate domain hoặc url */
const WEBSITE_REGEX = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/

/** computed check hợp lệ */
// const IS_WEBSITE_VALID = computed(() => {
//   /** rỗng thì false */
//   if (!COMPANY_DETAILS.value.website) return false
//   return WEBSITE_REGEX.test(COMPANY_DETAILS.value.website)
// })

// Computed kiểm tra website hợp lệ
const IS_WEBSITE_VALID = computed(() => {
  /** Kiểm tra giá trị website */
  const WEBSITE = COMPANY_DETAILS.value.website.trim()
  /** không nhập thì coi như valid */
  if (!WEBSITE) return true
  /** Trả về website đã check regex */
  return WEBSITE_REGEX.test(WEBSITE)
})

/** Tổng số bước  */
const total_steps_verify = 3

/** Lựa chọn ngành nghề */
const SELECTED_INDUSTRY = ref<string | null>(null)
/** Role đang được chọn */
const SELECTED_ROLE = ref<string | null>(null)
/** Hàm quy mô đang được chọn */
const SELECTED_PREFERENCES = ref<string | null>(null)

/** computed step có input */
const HAS_INPUT_STEP = computed(() => {
  return current_step.value === 2 || current_step.value === 4
})

/** validation step hiện tại */
const IS_STEP_VALID = computed(() => {
  /** Step 3: check tên công ty */
  if (current_step.value === 2) {
    /** Trả về tên đã trim */
    return COMPANY_DETAILS.value.name.trim() !== ''
  }

  /** Step 4: website phải đúng định dạng nếu có */
  if (current_step.value === 4) {
    /** lấy các giá trị từ platform */
    const { website, facebook, instagram, tiktok, zalo } = COMPANY_DETAILS.value
    /** Cần ghép đủ thông tin bảo gom domain của từng nền tảng */
    /** website hợp lệ và có nhập */
    const WEBSITE_VALID_AND_FILLED =
      website.trim() !== '' && IS_WEBSITE_VALID.value

    /**  hoặc website trống nhưng có ít nhất 1 field khác*/
    const OTHER_FILLED =
      facebook.trim() !== '' ||
      instagram.trim() !== '' ||
      tiktok.trim() !== '' ||
      zalo.trim() !== ''
    /** Trả về các điều kiện check valid */
    return WEBSITE_VALID_AND_FILLED || OTHER_FILLED
  }

  return true
})

/** methods chuyển step Flow1 */
const nextStep = () => {
  /** Tăng giá trị step */
  if (current_step.value < total_steps - 1) current_step.value++
}
/** Methods Lùi step Flow1 */
const prevStep = () => {
  /** Giảm giá trị step */
  if (current_step.value > 0) current_step.value--
}

/** auto next khi click chọn option */
const handleIndustry = (option: string) => {
  /** Lưu giá trị ngành */
  SELECTED_INDUSTRY.value = option
  nextStep()
}
/** Auto next khi click chọn Role */
const handleRole = (option: string) => {
  /** Chọn role của admin */
  SELECTED_ROLE.value = option
  nextStep()
}
/** Auto next khi click chọn Quy mô công ty */
const handlePreference = (option: string) => {
  /** Chọn quy mô công ty */
  SELECTED_PREFERENCES.value = option
  nextStep()
}
/** Hàm submit form tạo tài khoản */
const submitForm = () => {
  /** Nếu k valid thì return luôn */
  if (!IS_STEP_VALID) return
  /** Chuyển sang step 2 */
  flow_step.value = 2
}

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
</script>

<style scoped>
html,
body,
/** Các khai báo css chung */
#app {
  height: 100%;
}
button:focus {
  outline: none;
  /* box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); */
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease; /* tốc độ */
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.fade-slide-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
