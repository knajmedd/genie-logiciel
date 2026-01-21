<template>
  <div class="max-w-md mx-auto my-10 px-3 outline-none" tabindex="0" @keydown="onKey">
    <h1 class="text-3xl font-bold mb-3 text-center">Jeu 2048</h1>

    <div class="grid grid-cols-[1fr_1fr_auto] items-center gap-2 mb-3">
      <div class="bg-[#bbada0] text-[#f9f6f2] py-1.5 px-3 rounded-md font-bold">Score: {{ state.score }}</div>
      <button class="bg-[#8f7a66] text-[#f9f6f2] py-1.5 px-3 rounded-md" @click="reset">Nouveau</button>
      <div class="text-sm text-gray-500 text-right">Utilisez les flèches</div>
    </div>

    <div class="mb-2" @touchstart="onTouchStart" @touchend="onTouchEnd">
      <GameGrid :board="state.board" />
    </div>

    <div v-if="state.won" class="mt-2 py-2 px-3 rounded-md bg-[#edc22e] text-[#f9f6f2] text-center">Bravo ! 2048 atteint 🎉</div>
    <div v-else-if="state.over" class="mt-2 py-2 px-3 rounded-md bg-[#eee4da] text-center">Partie terminée 😿</div>
  </div>
</template>

<script setup lang="ts">
import GameGrid from '~/components/GameGrid.vue'
import { useGame, type Direction } from '~/composables/useGame'

const { state, reset, move } = useGame()

function onKey(e: KeyboardEvent) {
  const map: Record<string, Direction> = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
  }
  const dir = map[e.key]
  if (dir) {
    e.preventDefault()
    move(dir)
  }
}

let touchStartX = 0
let touchStartY = 0

function onTouchStart(e: TouchEvent) {
  const t = e.changedTouches[0]
  touchStartX = t.clientX
  touchStartY = t.clientY
}

function onTouchEnd(e: TouchEvent) {
  const t = e.changedTouches[0]
  const dx = t.clientX - touchStartX
  const dy = t.clientY - touchStartY
  const absX = Math.abs(dx)
  const absY = Math.abs(dy)
  if (Math.max(absX, absY) < 24) return
  let dir: Direction
  if (absX > absY) dir = dx > 0 ? 'right' : 'left'
  else dir = dy > 0 ? 'down' : 'up'
  move(dir)
}
</script>
