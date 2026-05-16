<template>
  <div
    id="component__badge"
    class="flex justify-center items-center rounded-full border border-white min-w-5 h-5 px-1 bg-red-600 text-white text-xs"
  >
    {{ $format.formatAbbreviationNumber(value) }}
  </div>
</template>
<script setup lang="ts">
import { container } from 'tsyringe';
import { Format } from '@/utils/helper/Format';

const $props = withDefaults(
  defineProps<{
    /** Số lượng */
    value: number
  }>(),
  {}
)

const $format = container.resolve(Format)

</script>
