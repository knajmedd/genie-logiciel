<template>
  <div class="grid grid-cols-4 grid-rows-4 gap-3 bg-[#bbada0] p-3 rounded-lg select-none">
    <div
      v-for="(cell, idx) in flat"
      :key="idx"
      class="flex items-center justify-center h-24 rounded-md font-bold text-2xl"
      :class="tileClass(cell)"
    >
      <span v-if="cell !== 0">{{ cell }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ board: number[][] }>()

const flat = computed(() => props.board.flat())

function tileClass(val: number) {
  if (val === 0) return 'bg-[#cdc1b4] text-[#776e65]'
  const common = 'text-[#776e65]'
  switch (val) {
    case 2: return 'bg-[#eee4da] ' + common
    case 4: return 'bg[#ede0c8] ' + common
    case 8: return 'bg-[#f2b179] text-[#f9f6f2]'
    case 16: return 'bg-[#f59563] text-[#f9f6f2]'
    case 32: return 'bg-[#f67c5f] text-[#f9f6f2]'
    case 64: return 'bg-[#f65e3b] text-[#f9f6f2]'
    case 128: return 'bg-[#edcf72] text-[#f9f6f2] text-[22px]'
    case 256: return 'bg-[#edcc61] text-[#f9f6f2] text-[22px]'
    case 512: return 'bg-[#edc850] text-[#f9f6f2] text-[22px]'
    case 1024: return 'bg-[#edc53f] text-[#f9f6f2] text-[20px]'
    case 2048: return 'bg-[#edc22e] text-[#f9f6f2] text-[20px]'
    default: return 'bg-[#3c3a32] text-[#f9f6f2]'
  }
}
</script>
