<template>
  <div
    class="relative !w-full !h-full flex flex-grow min-w-0 overflow-hidden"
  >
    <splitpanes
      @resized="onResized"
      ref="container_ref"
      class="!w-full !h-full flex custom flex-grow min-w-0"
    >
      <pane
        id="left"
        :min-size="min"
        :max-size="max"
        :size="size"
        class="h-full !text-sm flex-shrink-0"
        :style="
          !ready && {
            width: `${size}%`,
            minWidth: `${size}%`,
            maxWidth: `${size}%`,
          }
        "
      >
        <slot name="left" />
      </pane>
      <pane
        id="center"
        class="h-full !bg-transparent !text-sm min-w-0"
        :size="100 - size - (show_right_split_pane ? right_size : 0)"
        :class="{
          'mr-2': show_right_split_pane,
        }"
      >
        <slot name="center" />
      </pane>
      <pane
        v-if="show_right_split_pane"
        :min-size="min"
        :max-size="max"
        :size="right_size"
        class="h-full flex-shrink-0"
        :style="
          !ready && {
            width: `${right_size}%`,
            minWidth: `${right_size}%`,
            maxWidth: `${right_size}%`,
          }
        "
      >
        <slot name="right" />
      </pane>
    </splitpanes>

    <transition name="right-drawer">
      <div
        v-if="!show_right_split_pane"
        v-show="commonStore.show_right_pane"
        class="right-drawer-overlay absolute inset-0 z-[10000] flex justify-end bg-black/30 lg+:hidden"
        @click.self="closeRightDrawer"
      >
        <div
          class="right-drawer-panel h-full theme-page shadow-2xl p-2 overflow-hidden"
          @click.stop
        >
          <slot name="right" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useCommonStore } from '@/stores'
import { LocalStorage } from '@/utils/helper/LocalStorage'
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { container } from 'tsyringe'
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'

/** độ rộng tối thiểu của cột bên trái */
const MIN = 250
/** độ rộng tối đa của cột bên trái */
const MAX = 460

/** giá trị mặc định của 2 cột trái phải */
const DEFAULT_1800 = 460
const DEFAULT_1500_1800 = 420
const DEFAULT_BELOW_1500_LEFT = 380
const DEFAULT_1200_1500_RIGHT = 360

const commonStore = useCommonStore()

const { width: WINDOW_WIDTH } = useWindowSize()
/** có hiện cột bên phải không */
const show_right_split_pane = computed(() => WINDOW_WIDTH.value >= 1200)

/** ref tới thẻ splitpanes bọc bên ngoài */
const container_ref = ref<InstanceType<typeof Splitpanes>>()
/** cờ check để render các thành phần bên trong tránh bị giật khi chiều rộng đang được tính toán */
const ready = ref(false)
/** chiều rộng của thẻ bọc ngoài cùng */
const width = ref(0)
/** chiều rộng của cột bên trái theo %*/
const size = ref(0)
/** chiều rộng cót bên phải theo % */
const right_size = ref(0)

/** chiều rộng tối thểu cột bên trái theo % */
const min = computed(() => round((MIN / width.value) * 100))
/** chiều rộng tối đa cót bên trái theo % */
const max = computed(() => round((MAX / width.value) * 100))

const $local_storage = container.resolve(LocalStorage)

onBeforeMount(() => {
  /** chiều rộng cột bên trái lưu ở local */
  const LOCAL_WIDTH = $local_storage.getItem('conversation_width')
  /** chiều rộng cột bên phải lưu ở local */
  const LOCAL_RIGHT_WIDTH = $local_storage.getItem('widget_width')

  // set chiều rộng tối thiểu cót bên trái
  size.value = LOCAL_WIDTH
  // set chiều rộng tối thiểu cột bên phải
  right_size.value = LOCAL_RIGHT_WIDTH
})

watch(() => commonStore.analytic_url,  () => {
  init()
})

onMounted(() => {
  init()
})

/** hàm tính toán các kích thước */
function init() {
  // nếu không có thẻ splitpanes bọc bên ngoài thì bỏ qua
  if (!container_ref.value || !container_ref.value?.$el?.clientWidth) return
  
  // lưu lại chiều rộng của thẻ bọc
  width.value = container_ref.value?.$el?.clientWidth

  // chiều rộng cột bên trái lưu ở local
  const LOCAL_CONVERSATION_WIDTH =
    $local_storage.getItem('conversation_width') || 0

  /** chiều rộng của cột widget */
  const LOCAL_WIDTH_WIDGET = $local_storage.getItem('widget_width') || 0  

  // set chiều rộng tối thiểu cột bên trái
  // nếu độ rộng vượt quá giới hạn thì cài về tối thiểu
  if (
    LOCAL_CONVERSATION_WIDTH < min.value ||
    LOCAL_CONVERSATION_WIDTH > max.value
  ) {
    size.value = round((getDefaultWidth('left') / width.value) * 100)
  }
  // nếu không vượt quá giới hạn thì dùng từ local
  else {
    size.value = LOCAL_CONVERSATION_WIDTH
  }

  // set chiều rộng tối đa cót bên phải
  // nếu độ rộng vượt quá giới hạn thì cài về tối thiểu
  if (LOCAL_WIDTH_WIDGET > max.value || LOCAL_WIDTH_WIDGET < min.value) {
    right_size.value = round((getDefaultWidth('right') / width.value) * 100)
  }
  // nếu không vượt quá giới hạn thì dùng từ local
  else {
    right_size.value = LOCAL_WIDTH_WIDGET
  }

  // lưu local giá trị của chiều rộng cột bên trái
  $local_storage.setItem('conversation_width', round(size.value))

  // lưu local giá trị của chiều rộng cót bên phải
  $local_storage.setItem('widget_width', round(right_size.value))

  // đợi 300ms để thư viện cập nhật
  setTimeout(() => {
    ready.value = true
  }, 300)
}


/** cập nhật chiều rộng cột bên trái */
function onResized({
  prevPane,
}: {
  prevPane?: { size: number; el: HTMLElement }
}) {
  // nếu không có dữ liệu mới của thẻ được chỉnh sửa
  if (!prevPane?.size) return

  if (prevPane.el.id === 'left') {
    // lưu lại chiều rộng cột bên trái
    size.value = prevPane.size
    // lưu local giá trị của chiều rộng cột bên trái
    $local_storage.setItem('conversation_width', round(size.value))
  }

  if (prevPane.el.id === 'center') {
    // lưu lại chiều rộng cót bên phải
    right_size.value = 100 - size.value - prevPane.size
    // lưu local giá trị của chiều rộng cót bên phải
    $local_storage.setItem('widget_width', round(right_size.value))
  }
}

/** làm tròn số thập thứ 2 */
function round(num: number) {
  return Math.round(num * 100) / 100
}

/** đóng drawer */
function closeRightDrawer() {
  commonStore.show_right_pane = false
}

/** giá trị mặc định theo màn hình */
function getDefaultWidth(type: 'left' | 'right') {
  // nếu là cột bên trái
  if (type === 'left') {
    // nếu màn hình có kích thước lớn hơn 1800px
    if (WINDOW_WIDTH.value >= 1800) {
      return DEFAULT_1800
    }
    // nếu màn hình có kích thước từ 1500px đến dưới 1800px
    else if (WINDOW_WIDTH.value >= 1500 && WINDOW_WIDTH.value < 1800) {
      return DEFAULT_1500_1800
    }
    // nếu màn hình có kích thước nhỏ hơn 1500px
    else {
      return DEFAULT_BELOW_1500_LEFT
    }
  }
  // nếu là cột bên phải
  else {
    // nếu màn hình có kích thước lớn hơn 1800px
    if (WINDOW_WIDTH.value >= 1800) {
      return DEFAULT_1800
    }
    // nếu màn hình có kích thước từ 1500px đến dưới 1800px
    else if (WINDOW_WIDTH.value >= 1500 && WINDOW_WIDTH.value < 1800) {
      return DEFAULT_1500_1800
    }
    // nếu màn hình có kích thước nhỏ hơn 1500px
    else {
      return DEFAULT_1200_1500_RIGHT
    }
  }
}
</script>

<style scoped>
.right-drawer-panel {
  width: min(420px, calc(100vw - 24px));
}
.right-drawer-enter-active,
.right-drawer-leave-active {
  transition: opacity 180ms ease;
}
.right-drawer-enter-active .right-drawer-panel,
.right-drawer-leave-active .right-drawer-panel {
  transition: transform 220ms ease;
}
.right-drawer-enter-from,
.right-drawer-leave-to {
  opacity: 0;
}
.right-drawer-enter-from .right-drawer-panel,
.right-drawer-leave-to .right-drawer-panel {
  transform: translateX(100%);
}
.custom.splitpanes--vertical :deep(> .splitpanes__splitter) {
  display: block;
  width: 0px;
  height: 100%;
  border-left: none;
  background: transparent;
  position: relative;
}
.custom.splitpanes.splitpanes :deep(> .splitpanes__splitter:hover::before),
.custom.splitpanes.splitpanes--dragging :deep(> .splitpanes__splitter::before) {
  background-color: #3b82f6;
}
.custom.splitpanes .splitpanes__pane {
  background: transparent;
  justify-content: center;
  align-items: center;
  display: flex;
}
.custom.splitpanes :deep(> .splitpanes__splitter::after) {
  display: none;
}
.custom.splitpanes :deep(> .splitpanes__splitter::before) {
  content: '';
  position: absolute;
  width: auto;
  left: -1px;
  right: 0px;
  height: 100%;
  content: '';
  background: transparent;
  z-index: 40;
}
</style>
