<template>
  <Popover
    ref="popover_ref"
    :is_fit="false"
    width="319px"
    height="auto"
    position="RIGHT"
    class_content="!p-0 !bg-white !border-0 !rounded-lg overflow-hidden !h-fit"
    @close="handleClose"
  >
    <div
      class="relative flex h-full flex-col bg-white py-6 px-8 gap-4 text-zinc-950"
    >
      <button
        type="button"
        class="absolute right-3 top-3"
        @click.stop="popover_ref?.close()"
      >
        <XMarkIcon class="h-7 w-7" />
      </button>

      <div>
        <h2 class="text-xl font-semibold">
          {{ $t('v1.view.download_app.retion_mobile_title') }}
        </h2>
        <p class="mt-1 text-sm">
          {{ $t('v1.view.download_app.retion_mobile_description') }}
        </p>
      </div>

      <div class="relative m-auto h-[250px] w-[250px] flex-shrink-0">
        <img
          src="@/assets/imgs/download_retion.png"
          alt="Retion"
          class="h-full w-full"
        />
      </div>

      <div
        class="mt-auto flex w-full items-center justify-center rounded-lg text-lg font-semibold bg-black text-white py-2 leading-[30px]"
      >
        {{ $t('v1.view.download_app.scan_qr_to_install') }}
      </div>
    </div>
  </Popover>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';

import Popover from '@/components/Popover.vue';

/**ref của popover */
const popover_ref = ref<InstanceType<typeof Popover>>();
const $emit = defineEmits<{
  (event: 'auto-dismiss'): void
}>()
const is_auto_open = ref(false)

function mouseover($event: MouseEvent) {
  is_auto_open.value = false
  popover_ref.value?.mouseover($event)
}

function mouseleave() {
  if (is_auto_open.value) return

  popover_ref.value?.mouseleave()
}

function showAuto(target: HTMLElement) {
  is_auto_open.value = true
  popover_ref.value?.mouseover({ currentTarget: target })
}

function handleClose() {
  if (!is_auto_open.value) return

  is_auto_open.value = false
  $emit('auto-dismiss')
}

defineExpose({
  popover_ref,
  mouseover,
  mouseleave,
  showAuto,
})
</script>
