<template>
  <div class="inline-block text-left">
    <!-- Trigger -->
    <button
      ref="TRIGGER_REF"
      type="button"
      :style="{ width: typeof width === 'number' ? width + 'px' : width }"
      :class="[
        'inline-flex items-center justify-between px-3 py-2  rounded-l-md focus:outline-none bg-slate-100',
        props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ]"
      @click="toggle"
      aria-haspopup="listbox"
      :aria-expanded="open"
    >
      <span class="truncate">
        <template v-if="SELECTED_LABEL">{{ SELECTED_LABEL }}</template>
        <template
          v-else
          class="text-gray-500"
          >{{ placeholder }}</template
        >
      </span>

      <template v-if="!open">
        <ChevronDownIcon class="w-4 h-4 ml-2 text-gray-500" />
      </template>
      <template v-else>
        <ChevronUpIcon class="w-4 h-4 ml-2 text-gray-500" />
      </template>
    </button>

    <!-- panel teleported to body so it's never clipped by modal overflow -->
    <teleport to="body">
      <div
        v-if="open"
        ref="PANEL_REF"
        class="z-[9999] mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
        role="listbox"
      >
        <div>
          <div
            v-for="opt in NORMALIZED_OPTIONS"
            :key="String(opt.value)"
            @click="selectOption(opt)"
            class="px-3 py-2 cursor-pointer hover:bg-gray-100"
            :class="{
              'bg-gray-100': String(opt.value) === String(props.modelValue),
            }"
            role="option"
            :aria-selected="String(opt.value) === String(props.modelValue)"
          >
            {{ opt.label }}
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>
<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { createPopper } from '@popperjs/core'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/24/outline'

/** khai báo props + emits */
const props = defineProps({
  options: { type: Array, default: () => [] }, // string[] or { value, label }[]
  modelValue: { type: [String, Number, null], default: null },
  placeholder: { type: String, default: 'Select' },
  width: { type: [String, Number], default: '180px' },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

/** Trạng thái open */
const open = ref(false)
/** Ref nút trigger */
const TRIGGER_REF = ref(null)
/** Ref Panel */
const PANEL_REF = ref(null)
/** Poper instance */
let popper_instance = null

/** normalize options xử lý options*/
const NORMALIZED_OPTIONS = computed(() =>
  props.options.map(o =>
    o && typeof o === 'object' ? o : { value: o, label: String(o) }
  )
)
/** Xử lý selected Label */
const SELECTED_LABEL = computed(() => {
  /** Tìm kiếm trong option */
  const FOUND = NORMALIZED_OPTIONS.value.find(
    o => String(o.value) === String(props.modelValue)
  )
  return FOUND ? FOUND.label : ''
})

/** create / destroy popper */
function createPopperInstance() {
  /** Nếu k có Trigger ref hoặc panel ref thì return luôn */
  if (!TRIGGER_REF.value || !PANEL_REF.value) return
  destroyPopperInstance()

  /** ensure the panel is visible for measurement */
  PANEL_REF.value.style.minWidth = `${TRIGGER_REF.value.offsetWidth}px`
  /** Tạo popper mới */
  popper_instance = createPopper(TRIGGER_REF.value, PANEL_REF.value, {
    placement: 'bottom-start',
    strategy: 'fixed', // important: make it immune to ancestor transforms
    modifiers: [
      { name: 'offset', options: { offset: [0, 6] } },
      { name: 'preventOverflow', options: { padding: 8 } },
      {
        name: 'flip',
        options: { fallbackPlacements: ['top-start', 'bottom-end'] },
      },
      // you can add a sameWidth custom modifier if needed
    ],
  })
}

/** Hàm huỷ popper instance */
function destroyPopperInstance() {
  if (popper_instance) {
    popper_instance.destroy()
    popper_instance = null
  }
}

/** open/close and outside click */
function toggle() {
  if (props.disabled) return
  open.value = !open.value
}
function close() {
  open.value = false
}
/** Hàm check hướng pointer */
function onDocPointerDown(e) {
  const t = TRIGGER_REF.value
  const p = PANEL_REF.value
  if (!t || !p) return
  if (t.contains(e.target) || p.contains(e.target)) return
  close()
}
/** Theo dõi instance thay đổi */
watch(open, async val => {
  if (val) {
    await nextTick()
    createPopperInstance()
    document.addEventListener('pointerdown', onDocPointerDown)
    window.addEventListener('resize', () => popper_instance?.update?.())
    window.addEventListener('scroll', () => popper_instance?.update?.(), true)
  } else {
    destroyPopperInstance()
    document.removeEventListener('pointerdown', onDocPointerDown)
    // note: removing resize/scroll listeners above is optional since we attached anonymous fns,
    // but destroying popper is the main thing. If you want to remove those specific listeners, store references.
  }
})
/** Hàm remove pointer, popper khỏi DOM */
onBeforeUnmount(() => {
  destroyPopperInstance()
  document.removeEventListener('pointerdown', onDocPointerDown)
})
/** Hàm select option */
function selectOption(opt) {
  emit('update:modelValue', opt.value)
  close()
}
</script>
<style scoped>
/* small scrollbar polish */
.max-h-60::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.max-h-60::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.12);
}
</style>
