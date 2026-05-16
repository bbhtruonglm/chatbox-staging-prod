<template>
  <Teleport
    :to="teleport_to"
    v-if="is_open"
  >
    <div
      @mouseover="hoverPopover"
      @mouseleave="leavePopover"
      ref="popover_ref"
      :style="{
        width: _width,
        maxWidth: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
        height: _height,
        maxHeight: `calc(100vh - ${VIEWPORT_PADDING * 2}px)`,
        paddingLeft: actual_position === 'RIGHT' ? `${distance}px` : 0,
        paddingRight: actual_position === 'LEFT' ? `${distance}px` : 0,
        paddingTop: actual_position === 'BOTTOM' ? `${distance}px` : 0,
        paddingBottom: actual_position === 'TOP' ? `${distance}px` : 0,
      }"
      class="fixed z-[1200]"
    >
      <div
        ref="triangle_ref"
        class="absolute rotate-45 w-4 h-4 shadow-[inset-x-sm] theme-card-secondary z-[1201]"
      />
      <div
        :class="class_content"
        class="shadow-[0px_0px_20px_rgba(0,0,0,0.3)] rounded-md p-2 theme-card-secondary w-full h-full z-10 relative"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

/**vị trí của popover */
type PopoverPosition = 'TOP' | 'LEFT' | 'RIGHT' | 'BOTTOM'

/**khoảng cách từ popover đến viewport */
const VIEWPORT_PADDING = 8
/**kích thước của triangle */
const TRIANGLE_SIZE = 8

const $props = withDefaults(
  defineProps<{
    /**dịch chuyển component này đến vị trí nào */
    teleport_to?: string
    /**độ rộng của component */
    width?: string
    /**độ dài của component */
    height?: string
    /**hướng của dropdown */
    position?: PopoverPosition
    /**width hoặc height sẽ bằng với phần tử cha */
    is_fit?: boolean
    /**khoảng cách so với mục tiêu */
    distance?: number
    /**đảo chiều */
    reverse?: boolean
    /**lùi lại */
    back?: number
    /**class thêm cho nội dung */
    class_content?: string
  }>(),
  {
    teleport_to: 'body',
    width: '200px',
    height: '200px',
    position: 'BOTTOM',
    is_fit: true,
    distance: 5,
    reverse: false,
    back: 0,
  }
)

/**chiều rộng thực tế */
const _width = ref($props.width)
/**chiều cao thực tế */
const _height = ref($props.height)
/**ẩn hiện modal */
const is_open = ref(false)
/**gắn cờ đang hover vào tooltip, để chặn hành động ẩn khi level div target */
const is_hover = ref(false)
/**vị trí thực tế của popover */
const actual_position = ref<PopoverPosition>($props.position ?? 'BOTTOM')
/**ref của popover */
const popover_ref = ref<HTMLElement>()
/**ref của triangle */
const triangle_ref = ref<HTMLElement>()

/**xử lý sự kiện khi hover vào popover */
function hoverPopover() {
  // gắn cờ là đang di chuyển trên popover, chặn không cho popover bị ẩn đi
  is_hover.value = true
}

/**xử lý sự kiện khi rời khỏi popover */
function leavePopover() {
  // bỏ gắn cờ là đang di chuyển trên popover, cho phép popover bị ẩn đi
  is_hover.value = false
  is_open.value = false
}

/** giới hạn giá trị của một biến trong một khoảng nhất định */
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/**giới hạn giá trị của một biến trong viewport */
function clampInViewport(value: number, size: number, viewportSize: number) {
  return clamp(
    value,
    VIEWPORT_PADDING,
    Math.max(VIEWPORT_PADDING, viewportSize - size - VIEWPORT_PADDING)
  )
}

/** giới hạn giá trị của một biến trong một khoảng nhất định, không cho phép vượt quá giá trị min và max */
function clampAnchor(value: number, min: number, max: number, fallback: number) {
  /**Nếu max nhỏ hơn min thì trả về fallback */
  if (max < min) return fallback
  /**Giới hạn giá trị của một biến trong một khoảng nhất định */
  return clamp(value, min, max)
}

/** lấy vị trí thực tế của popover */
function getActualPosition(
  /**vị trí ưu tiên của popover */
  preferred_position: PopoverPosition,
  /**thông tin của target */
  target_rect: DOMRect,
  /**chiều rộng của popover */
  popover_width: number,
  /**chiều cao của popover */
  popover_height: number
): PopoverPosition {
  /** không gian cần thiết cho popover theo chiều dọc */
  const NEED_VERTICAL_SPACE = popover_height + TRIANGLE_SIZE
  /** không gian cần thiết cho popover theo chiều ngang */
  const NEED_HORIZONTAL_SPACE = popover_width + TRIANGLE_SIZE
  /** không gian từ top của target đến top của viewport */
  const SPACE_TOP = target_rect.y - VIEWPORT_PADDING
  /** không gian từ bottom của target đến bottom của viewport */
  const SPACE_BOTTOM =
    window.innerHeight - target_rect.y - target_rect.height - VIEWPORT_PADDING
  /** không gian từ left của target đến left của viewport */
  const SPACE_LEFT = target_rect.x - VIEWPORT_PADDING
  /** không gian từ right của target đến right của viewport */
  const SPACE_RIGHT =
    window.innerWidth - target_rect.x - target_rect.width - VIEWPORT_PADDING

  /** Nếu vị trí ưu tiên là bottom mà space bottom nhỏ hơn need vertical space thì trả về top */
  if (preferred_position === 'BOTTOM' && SPACE_BOTTOM < NEED_VERTICAL_SPACE)
    return 'TOP'
  /** Nếu vị trí ưu tiên là top mà space top nhỏ hơn need vertical space thì trả về bottom */
  if (preferred_position === 'TOP' && SPACE_TOP < NEED_VERTICAL_SPACE)
    return 'BOTTOM'
  /** Nếu vị trí ưu tiên là right mà space right nhỏ hơn need horizontal space thì trả về left */
  if (preferred_position === 'RIGHT' && SPACE_RIGHT < NEED_HORIZONTAL_SPACE)
    return 'LEFT'
  /** Nếu vị trí ưu tiên là left mà space left nhỏ hơn need horizontal space thì trả về right */
  if (preferred_position === 'LEFT' && SPACE_LEFT < NEED_HORIZONTAL_SPACE)
    return 'RIGHT'
  /** Trả về vị trí ưu tiên */
  return preferred_position
}

/** di chuyển popover đến vị trí của target */
function teleportToTarget($event?: MouseEvent) {
  /** Lấy thẻ html của sự kiện */
  const TARGET = $event?.currentTarget as HTMLElement
  /** Nếu không có thẻ html thì return */
  if (!TARGET) return

  /** Lấy thông tin của target */
  const TARGET_RECT = TARGET.getBoundingClientRect()
  /** Lấy tọa độ x, y, width, height của target */
  const { x, y, width, height } = TARGET_RECT
  /** Lấy vị trí ưu tiên của popover */
  const PREFERRED_POSITION = $props.position ?? 'BOTTOM'

  actual_position.value = PREFERRED_POSITION
  _width.value = $props.width ?? '200px'
  _height.value = $props.height ?? '200px'

  /** Nếu fit thì set width hoặc height của popover */
  if ($props.is_fit) {
    /** Nếu vị trí ưu tiên là top hoặc bottom thì set width của popover bằng width của target */
    if (PREFERRED_POSITION === 'TOP' || PREFERRED_POSITION === 'BOTTOM') {
      _width.value = `${width}px`
    }
    /** Nếu vị trí ưu tiên là left hoặc right thì set height của popover bằng height của target */
    if (PREFERRED_POSITION === 'LEFT' || PREFERRED_POSITION === 'RIGHT') {
      _height.value = `${height}px`
    }
  }

  nextTick(() => {
    /** Lấy popover */
    const POPOVER = popover_ref.value
    /** Lấy triangle */
    const TRIANGLE = triangle_ref.value
    /** Nếu không có popover hoặc triangle thì return */
    if (!POPOVER || !TRIANGLE) return
    /** Lấy chiều rộng của popover */
    const POPOVER_WIDTH = POPOVER.offsetWidth
    /** Lấy chiều cao của popover */
    const POPOVER_HEIGHT = POPOVER.offsetHeight
    /** Lấy tọa độ x, y của tâm của target */
    const TARGET_CENTER_X = x + width / 2
    /** Lấy tọa độ y của tâm của target */
    const TARGET_CENTER_Y = y + height / 2
    /** Lấy giá trị back */
    const BACK = $props.back ?? 0
    /** Lấy vị trí thực tế của popover */
    const ACTUAL_POSITION = getActualPosition(
      PREFERRED_POSITION,
      TARGET_RECT,
      POPOVER_WIDTH,
      POPOVER_HEIGHT
    )
    actual_position.value = ACTUAL_POSITION

    /** Tính toán vị trí của popover theo chiều ngang */
    let popover_left = TARGET_CENTER_X - POPOVER_WIDTH / 2 - BACK
    /** Tính toán vị trí của popover theo chiều dọc */
    let popover_top = TARGET_CENTER_Y - POPOVER_HEIGHT / 2 - BACK

    // nếu vị trí thực tế là bottom thì popover sẽ được đặt dưới target
    if (ACTUAL_POSITION === 'BOTTOM') {
      popover_top = y + height + TRIANGLE_SIZE
    }
    // nếu vị trí thực tế là top thì popover sẽ được đặt trên target
    if (ACTUAL_POSITION === 'TOP') {
      popover_top = y - POPOVER_HEIGHT - TRIANGLE_SIZE
    }
    // nếu vị trí thực tế là right thì popover sẽ được đặt bên phải target
    if (ACTUAL_POSITION === 'RIGHT') {
      popover_left = x + width + TRIANGLE_SIZE
    }
    // nếu vị trí thực tế là left thì popover sẽ được đặt bên trái target 
    if (ACTUAL_POSITION === 'LEFT') {
      popover_left = x - POPOVER_WIDTH - TRIANGLE_SIZE
    }

    // giới hạn vị trí của popover trong viewport
    popover_left = clampInViewport(popover_left, POPOVER_WIDTH, window.innerWidth)
    // giới hạn vị trí của popover trong viewport
    popover_top = clampInViewport(popover_top, POPOVER_HEIGHT, window.innerHeight)

    // set vị trí của popover
    POPOVER.style.left = `${popover_left}px`
    POPOVER.style.top = `${popover_top}px`

    // tính toán vị trí của triangle theo chiều ngang
    if (ACTUAL_POSITION === 'BOTTOM' || ACTUAL_POSITION === 'TOP') {
      /** Tính toán vị trí của triangle theo chiều ngang */
      const TRIANGLE_CENTER_X = clampAnchor(
        TARGET_CENTER_X - popover_left,
        TRIANGLE_SIZE,
        POPOVER_WIDTH - TRIANGLE_SIZE,
        POPOVER_WIDTH / 2
      )
      /** set vị trí của triangle */
      TRIANGLE.style.left = `${TRIANGLE_CENTER_X - TRIANGLE_SIZE}px`
      /** set vị trí của triangle */
      TRIANGLE.style.top =
        ACTUAL_POSITION === 'BOTTOM'
          ? `${-(TRIANGLE_SIZE / 2)}px`
          : `${POPOVER_HEIGHT - TRIANGLE_SIZE * 1.5}px`
    }

    // tính toán vị trí của triangle theo chiều dọc
    if (ACTUAL_POSITION === 'RIGHT' || ACTUAL_POSITION === 'LEFT') {
      /** Tính toán vị trí của triangle theo chiều dọc */
      const TRIANGLE_CENTER_Y = clampAnchor(
        TARGET_CENTER_Y - popover_top,
        TRIANGLE_SIZE,
        POPOVER_HEIGHT - TRIANGLE_SIZE,
        POPOVER_HEIGHT / 2
      )
      /** set vị trí của triangle */
      TRIANGLE.style.left =
        ACTUAL_POSITION === 'RIGHT'
          ? `${($props.distance ?? 0) - TRIANGLE_SIZE}px`
          : `${POPOVER_WIDTH - ($props.distance ?? 0) - TRIANGLE_SIZE}px`
      /** set vị trí của triangle */
      TRIANGLE.style.top = `${TRIANGLE_CENTER_Y - TRIANGLE_SIZE}px`
    }
  })
}

/** Hàm này dùng để mở popover khi hover */
function mouseover($event: any) {
  // nếu popover đã hiện rồi thì thôi
  if (is_open.value) return

  // mở modal
  is_open.value = true

  // dịch chuyển popover đến vị chí cần thiết
  teleportToTarget($event)
}

/** hàm này dùng để đóng popover khi hover */
function mouseleave() {
  /**
   * chờ một khoảng thời gian cho trường hợp di chuột từ mục tiêu vào popover
   * mới hiện
   */
  setTimeout(() => {
    // check nếu con chuột đang ở popover thì thôi không tắt nữa
    if (is_hover.value) return

    // tắt bỏ popover
    is_open.value = false
  }, 50)
}

/** hàm đóng po */
function close() {
  is_open.value = false
}

// public hành động ra bên ngoài
defineExpose({ mouseover, mouseleave, close })
</script>
