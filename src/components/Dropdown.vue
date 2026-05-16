<template>
  <Teleport
    :to="teleport_to"
    v-if="is_open"
  >
    <div
      class="fixed inset-0 z-20"
      :class="class_container"
    >
      <div
        @click="toggleDropdown()"
        class="w-full h-full"
        :class="class_background"
      ></div>

      <div
        ref="triangle_ref"
        class="absolute z-[21] rotate-45 w-4 h-4 theme-card-secondary"
      />

      <div
        ref="dropdown_ref"
        :style="{
          width: _width,
          maxWidth: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
          maxHeight: max_height || _max_height,
          height: _height,
        }"
        :class="class_content + ' overflow-y-auto'"
        class="absolute shadow-[0px_0px_20px_rgba(0,0,0,0.3)] rounded-md p-2 theme-card-secondary z-20"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

type DropdownPosition = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT'

const VIEWPORT_PADDING = 8
const TRIANGLE_SIZE = 8

const $emit = defineEmits(['close_dropdown', 'open_dropdown'])

const $props = withDefaults(
  defineProps<{
    teleport_to?: string
    width?: string
    height?: string
    max_height?: string
    position?: DropdownPosition
    is_fit?: boolean
    distance?: number
    back?: number
    class_content?: string
    class_background?: string
    class_container?: string
  }>(),
  {
    teleport_to: 'body',
    width: '200px',
    height: '200px',
    position: 'BOTTOM',
    is_fit: true,
    distance: 5,
    back: 0,
  }
)

/** Biến thay đổi kích thước của dropdown */
const _width = ref($props.width)
/** Biến thay đổi kích thước của dropdown */
const _height = ref($props.height)
/** Biến thay đổi kích thước tối đa của dropdown */
const _max_height = ref('300px')
/** Biến trạng thái mở/đóng */
const is_open = ref(false)
/** Biến ref của dropdown */
const dropdown_ref = ref<HTMLElement>()
/** Biến ref của triangle */
const triangle_ref = ref<HTMLElement>()

/** Đóng dropdown khi nhấn Escape */
function closeOnEsc($event: KeyboardEvent) {
  if ($event.key === 'Escape') immediatelyHide()
}

/** giá trị nhỏ nhất có thể của giá trị muốn clamp */
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/** giá trị tối đa có thể của giá trị muốn clamp */
function clampInViewport(value: number, size: number, viewport_size: number) {
  return clamp(
    value,
    VIEWPORT_PADDING,
    Math.max(VIEWPORT_PADDING, viewport_size - size - VIEWPORT_PADDING)
  )
}

/** giá trị fallback */
function clampAnchor(value: number, min: number, max: number, fallback: number) {
  // nếu giá trị max nhỏ hơn min thì trả về fallback
  if (max < min) return fallback
  // còn không thì trả về clamp
  return clamp(value, min, max)
}

/** vị trí thực tế */
function getActualPosition(
  preferred_position: DropdownPosition,
  target_rect: DOMRect,
  dropdown_width: number,
  dropdown_height: number
): DropdownPosition {
  /** khoảng cách từ dropdown đến target */
  const DISTANCE = $props.distance ?? 0
  /** khoảng cách cần thiết để hiển thị dropdown theo chiều dọc */
  const NEED_VERTICAL_SPACE = dropdown_height + DISTANCE + TRIANGLE_SIZE
  /** khoảng cách cần thiết để hiển thị dropdown theo chiều ngang */
  const NEED_HORIZONTAL_SPACE = dropdown_width + DISTANCE + TRIANGLE_SIZE

  /** khoảng cách từ viewport đến target theo chiều dọc */
  const SPACE_TOP = target_rect.y - VIEWPORT_PADDING
  /** khoảng cách từ target đến viewport theo chiều dọc */
  const SPACE_BOTTOM =
    window.innerHeight - target_rect.y - target_rect.height - VIEWPORT_PADDING
  /** khoảng cách từ viewport đến target theo chiều ngang */
  const SPACE_LEFT = target_rect.x - VIEWPORT_PADDING
  /** khoảng cách từ target đến viewport theo chiều ngang */
  const SPACE_RIGHT =
    window.innerWidth - target_rect.x - target_rect.width - VIEWPORT_PADDING

  // nếu vị trí ưu tiên là dưới nhưng không đủ không gian thì chuyển sang trên
  if (preferred_position === 'BOTTOM' && SPACE_BOTTOM < NEED_VERTICAL_SPACE)
    return 'TOP'
  // nếu vị trí ưu tiên là trên nhưng không đủ không gian thì chuyển sang dưới
  if (preferred_position === 'TOP' && SPACE_TOP < NEED_VERTICAL_SPACE)
    return 'BOTTOM'
  // nếu vị trí ưu tiên là phải nhưng không đủ không gian thì chuyển sang trái
  if (preferred_position === 'RIGHT' && SPACE_RIGHT < NEED_HORIZONTAL_SPACE)
    return 'LEFT'
  // nếu vị trí ưu tiên là trái nhưng không đủ không gian thì chuyển sang phải
  if (preferred_position === 'LEFT' && SPACE_LEFT < NEED_HORIZONTAL_SPACE)
    return 'RIGHT'

  // trả về vị trí ưu tiên
  return preferred_position
}

/** Di chuyển dropdown đến vị trí target */
function teleportToTarget($event?: MouseEvent) {
  /** target của dropdown */
  const TARGET = $event?.currentTarget as HTMLElement
  /** nếu không có target thì return */
  if (!TARGET) return

  /** vị trí của target */
  const TARGET_RECT = TARGET.getBoundingClientRect()
  const { x, y, width, height } = TARGET_RECT
  /** vị trí ưu tiên */
  const PREFERRED_POSITION = $props.position ?? 'BOTTOM'

  /** thiết lập kích thước */
  _width.value = $props.width ?? '200px'
  _height.value = $props.height ?? '200px'

  // nếu fit width hoặc fit height
  if ($props.is_fit) {
    // nếu fit theo chiều dọc
    if (PREFERRED_POSITION === 'TOP' || PREFERRED_POSITION === 'BOTTOM') {
      _width.value = `${width}px`
    }

    // nếu fit theo chiều ngang
    if (PREFERRED_POSITION === 'LEFT' || PREFERRED_POSITION === 'RIGHT') {
      _height.value = `${height}px`
    }
  }

  nextTick(() => {
    /** ref của dropdown */
    const DROPDOWN = dropdown_ref.value
    /** ref của triangle */
    const TRIANGLE = triangle_ref.value

    /** nếu không có dropdown hoặc triangle thì return */
    if (!DROPDOWN || !TRIANGLE) return

    /** chiều rộng của dropdown */
    const DROPDOWN_WIDTH = DROPDOWN.offsetWidth
    /** chiều cao của dropdown */
    const DROPDOWN_HEIGHT = DROPDOWN.offsetHeight
    /** tọa độ tâm của target theo chiều ngang */
    const TARGET_CENTER_X = x + width / 2
    /** tọa độ tâm của target theo chiều dọc */
    const TARGET_CENTER_Y = y + height / 2
    /** khoảng cách từ dropdown đến target */
    const DISTANCE = $props.distance ?? 0
    /** khoảng cách lùi lại */
    const BACK = $props.back ?? 0
    /** vị trí thực tế */
    const ACTUAL_POSITION = getActualPosition(
      PREFERRED_POSITION,
      TARGET_RECT,
      DROPDOWN_WIDTH,
      DROPDOWN_HEIGHT
    )

    /** vị trí dropdown theo chiều ngang */
    let dropdown_left = TARGET_CENTER_X - DROPDOWN_WIDTH / 2 - BACK
    /** vị trí dropdown theo chiều dọc */
    let dropdown_top = TARGET_CENTER_Y - DROPDOWN_HEIGHT / 2 - BACK

    // nếu vị trí ưu tiên là dưới thì set dropdown ở dưới
    if (ACTUAL_POSITION === 'BOTTOM') {
      dropdown_top = y + height + DISTANCE + TRIANGLE_SIZE
    }
    // nếu vị trí ưu tiên là trên thì set dropdown ở trên
    if (ACTUAL_POSITION === 'TOP') {
      dropdown_top = y - DROPDOWN_HEIGHT - DISTANCE - TRIANGLE_SIZE
    }
    // nếu vị trí ưu tiên là phải thì set dropdown ở phải
    if (ACTUAL_POSITION === 'RIGHT') {
      dropdown_left = x + width + DISTANCE + TRIANGLE_SIZE
    }
    // nếu vị trí ưu tiên là trái thì set dropdown ở trái
    if (ACTUAL_POSITION === 'LEFT') {
      dropdown_left = x - DROPDOWN_WIDTH - DISTANCE - TRIANGLE_SIZE
    }

    // nếu vị trí dropdown vượt ra ngoài viewport thì set lại vị trí
    dropdown_left = clampInViewport(
      dropdown_left,
      DROPDOWN_WIDTH,
      window.innerWidth
    )
    // nếu vị trí dropdown vượt ra ngoài viewport thì set lại vị trí
    dropdown_top = clampInViewport(
      dropdown_top,
      DROPDOWN_HEIGHT,
      window.innerHeight
    )

    // set lại vị trí dropdown
    DROPDOWN.style.left = `${dropdown_left}px`
    DROPDOWN.style.top = `${dropdown_top}px`

    // nếu vị trí ưu tiên là dưới hoặc trên thì set lại vị trí triangle
    if (ACTUAL_POSITION === 'BOTTOM' || ACTUAL_POSITION === 'TOP') {
      /** tâm của triangle theo chiều ngang */
      const TRIANGLE_CENTER_X = clampAnchor(
        TARGET_CENTER_X,
        dropdown_left + TRIANGLE_SIZE,
        dropdown_left + DROPDOWN_WIDTH - TRIANGLE_SIZE,
        dropdown_left + DROPDOWN_WIDTH / 2
      )

      /** set lại vị trí triangle theo chiều ngang */
      TRIANGLE.style.left = `${TRIANGLE_CENTER_X - TRIANGLE_SIZE}px`
      /** set lại vị trí triangle theo chiều dọc */
      TRIANGLE.style.top =
        ACTUAL_POSITION === 'BOTTOM'
          ? `${dropdown_top - TRIANGLE_SIZE}px`
          : `${dropdown_top + DROPDOWN_HEIGHT - TRIANGLE_SIZE}px`
    }

    // nếu vị trí ưu tiên là phải hoặc trái thì set lại vị trí triangle
    if (ACTUAL_POSITION === 'RIGHT' || ACTUAL_POSITION === 'LEFT') {
      /** tâm của triangle theo chiều dọc */
      const TRIANGLE_CENTER_Y = clampAnchor(
        TARGET_CENTER_Y,
        dropdown_top + TRIANGLE_SIZE,
        dropdown_top + DROPDOWN_HEIGHT - TRIANGLE_SIZE,
        dropdown_top + DROPDOWN_HEIGHT / 2
      )

      /** set lại vị trí triangle theo chiều ngang */
      TRIANGLE.style.left =
        ACTUAL_POSITION === 'RIGHT'
          ? `${dropdown_left - TRIANGLE_SIZE}px`
          : `${dropdown_left + DROPDOWN_WIDTH - TRIANGLE_SIZE}px`
      /** set lại vị trí triangle theo chiều dọc */
      TRIANGLE.style.top = `${TRIANGLE_CENTER_Y - TRIANGLE_SIZE}px`
    }
  })
}

/** Ẩn/hiện dropdown */
function toggleDropdown($event?: MouseEvent) {
  // Nếu dropdown đang đóng thì mở
  if (!is_open.value) {
    // Thêm sự kiện đóng dropdown khi nhấn Escape
    document.addEventListener('keyup', closeOnEsc)
    // Set trạng thái mở dropdown
    is_open.value = true
    // Emit sự kiện mở dropdown
    $emit('open_dropdown')
    // Tính toán và set lại vị trí dropdown
    teleportToTarget($event)
  } else immediatelyHide()
}

/** Đóng dropdown ngay lập tức */
function immediatelyHide() {
  // Nếu dropdown đang đóng thì return
  if (!is_open.value) return
  // Xóa sự kiện đóng dropdown khi nhấn Escape
  document.removeEventListener('keyup', closeOnEsc)
  // Set trạng thái đóng dropdown
  is_open.value = false
  // Emit sự kiện đóng dropdown
  $emit('close_dropdown')
}

/** Cập nhật chiều cao tối đa */
function updateMaxHeight() {
  // Lấy chiều cao của viewport
  const VIEWPORT_HEIGHT = window.innerHeight
  // Set chiều cao tối đa của dropdown bằng 60% chiều cao của viewport
  _max_height.value = Math.floor(VIEWPORT_HEIGHT * 0.6) + 'px'
}

onMounted(() => {
  // Cập nhật chiều cao tối đa khi mount
  updateMaxHeight()
  // Thêm sự kiện resize để cập nhật chiều cao tối đa khi resize
  window.addEventListener('resize', updateMaxHeight)
})

onUnmounted(() => {
  // Xóa sự kiện resize khi unmount
  window.removeEventListener('resize', updateMaxHeight)
})

defineExpose({ toggleDropdown, immediatelyHide, is_open })
</script>

<style scoped>
</style>
