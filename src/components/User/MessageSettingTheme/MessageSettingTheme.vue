<template>
  <div class="grid grid-cols-5 gap-6">
    <section class="col-span-3 max-h-[60dvh] space-y-6 overflow-auto">
      <div class="space-y-3">
        <p class="font-medium">
          {{ $t('Màu nền') }}
        </p>

        <div class="grid grid-cols-1 gap-3 lg:grid-cols-6">
          <button
            v-for="(bg, idx) in backgrounds"
            :key="bg"
            :style="{ background: bg }"
            class="relative aspect-square rounded"
            @click="display_setting.background_index = idx"
          >
            <div
              v-if="idx === display_setting.background_index"
              class="absolute right-1 top-1 rounded-full bg-green-600 p-1 text-white shadow-sm"
            >
              <CheckIcon class="size-3.5" />
            </div>
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <p class="font-medium">
          {{ $t('Chủ đề') }}
        </p>

        <div class="grid grid-cols-1 gap-3 lg:grid-cols-6">
          <button
            v-for="pattern in THEME_PATTERN_OPTIONS"
            :key="pattern.name"
            :style="{
              backgroundImage: `url(${pattern.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }"
            class="relative aspect-square rounded bg-white"
            @click="display_setting.pattern = pattern.name"
          >
            <div
              v-if="pattern.name === display_setting.pattern"
              class="absolute right-1 top-1 rounded-full bg-green-600 p-1 text-white shadow-sm"
            >
              <CheckIcon class="size-3.5" />
            </div>
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <label
          for="overlay-strength"
          class="font-medium"
        >
          {{ $t('Độ mờ') }} ({{ pattern_opacity_input }}%)
        </label>
        <input
          id="overlay-strength"
          :value="pattern_opacity_input"
          type="range"
          min="0"
          max="100"
          class="display-slider"
          @input="onInputPatternOpacity"
        />
      </div>
    </section>

    <section class="col-span-2 flex h-full flex-col space-y-3">
      <p class="font-medium">
        {{ $t('Xem trước') }}
      </p>
      <Theme
        :mode="display_setting.mode"
        :pattern="display_setting.pattern"
        :background_index="display_setting.background_index"
        :pattern_opacity="pattern_opacity_input"
        class="flex h-full flex-col justify-end gap-2 overflow-hidden rounded-xl p-2"
      >
        <div
          v-for="message in MESSAGE"
          :key="message.id"
          :class="message.is_me ? 'flex justify-end' : ''"
        >
          <p
            :class="message.is_me ? 'bg-[#FDF1BB] text-zinc-900' : 'theme-card-secondary'"
            class="relative max-w-56 rounded-md p-1 backdrop-blur-sm"
          >
            {{ message.content }}
            <span class="invisible">aaaaa</span>
            <span
              class="absolute bottom-0 right-1 flex items-center gap-1 text-[10px]"
              :class="message.is_me ? 'text-green-500' : ''"
            >
              {{ message.time }}
              <DoubleCheck
                v-if="message.is_read"
                class="size-2.5"
              />
            </span>
          </p>
        </div>
      </Theme>
    </section>
  </div>
</template>

<script setup lang="ts">
import DoubleCheck from '@/components/Icons/DoubleCheck.vue'
import { useCommonStore } from '@/stores'
import { BACKGROUND, DARK_BACKGROUND, Theme, THEME_PATTERN_OPTIONS } from '@bbhhainx/chat-core'
// import { BACKGROUND, DARK_BACKGROUND, Theme, THEME_PATTERN_OPTIONS } from '@chat'
import { debounce } from 'lodash'
import { CheckIcon } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

/** danh sách tin nhắn mẫu */
const MESSAGE = [
  {
    id: 1,
    content: 'Em vừa gửi lại báo giá bản mới, anh xem giúp em nhé.',
    time: '18:08',
    is_me: false,
    is_read: false,
  },
  {
    id: 2,
    content: 'Ok, để anh kiểm tra.',
    time: '18:09',
    is_me: true,
    is_read: true,
  },
  {
    id: 3,
    content: 'Dạ, phần timeline em đã cập nhật theo góp ý hôm sáng rồi ạ.',
    time: '18:08',
    is_me: false,
    is_read: false,
  },
  {
    id: 4,
    content: 'Ổn rồi, bố cục này rõ hơn nhiều. Mình chốt bản này nhé.',
    time: '18:11',
    is_me: true,
    is_read: true,
  },
]

// store
const { display_setting } = useCommonStore()
/** độ mờ của pattern */
const pattern_opacity_input = ref(display_setting.pattern_opacity)

/** danh sách màu nền */
const backgrounds = computed<string[]>(() => {
  // nếu là dark theme thì lấy dark mode, còn không thì lấy light mode
  if(display_setting.mode === 'DARK') return DARK_BACKGROUND
  return [...BACKGROUND]
})

/** watch pattern opacity */
watch(
  () => display_setting.pattern_opacity,
  value => {
    pattern_opacity_input.value = value
  }
)

/** debounce update pattern opacity */
const debounce_update_pattern_opacity = debounce((value: number) => {
  display_setting.pattern_opacity = value
}, 500)

/** handle input pattern opacity */
function onInputPatternOpacity($event: Event) {
  const { value } = $event.target as HTMLInputElement
  /** độ mờ của pattern */
  const OPACITY = Number(value)
  /** cập nhật độ mờ của pattern */
  pattern_opacity_input.value = OPACITY
  /** debounce update pattern opacity */
  debounce_update_pattern_opacity(OPACITY)
}

// trước khi unmount thì flush debounce
onBeforeUnmount(() => {
  debounce_update_pattern_opacity.flush()
})
</script>

<style scoped>
.display-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: #e2e8f0;
  outline: none;
}

.display-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border: 4px solid #ffffff;
  border-radius: 999px;
  background: #1e7c30;
  box-shadow: 0 4px 14px rgba(30, 124, 48, 0.25);
  cursor: pointer;
}

.display-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border: 4px solid #ffffff;
  border-radius: 999px;
  background: #1e7c30;
  box-shadow: 0 4px 14px rgba(30, 124, 48, 0.25);
  cursor: pointer;
}

.display-slider::-moz-range-track {
  height: 12px;
  border-radius: 999px;
  background: #e2e8f0;
}
</style>
