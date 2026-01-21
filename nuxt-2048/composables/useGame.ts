import { ref, computed } from 'vue'

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface GameState {
  board: number[][]
  score: number
  won: boolean
  over: boolean
}

const SIZE = 4

function emptyBoard(): number[][] {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0))
}

function getEmptyCells(board: number[][]): Array<{ r: number; c: number }> {
  const cells: Array<{ r: number; c: number }> = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) cells.push({ r, c })
    }
  }
  return cells
}

function spawnRandom(board: number[][]): boolean {
  const empties = getEmptyCells(board)
  if (empties.length === 0) return false
  const idx = Math.floor(Math.random() * empties.length)
  const { r, c } = empties[idx]
  board[r][c] = Math.random() < 0.9 ? 2 : 4
  return true
}

function compress(row: number[]): number[] {
  return row.filter(v => v !== 0)
}

function pad(row: number[]): number[] {
  const res = row.slice()
  while (res.length < SIZE) res.push(0)
  return res
}

function mergeRow(row: number[]): { row: number[]; gained: number } {
  const r = row.slice()
  let gained = 0
  for (let i = 0; i < r.length - 1; i++) {
    if (r[i] !== 0 && r[i] === r[i + 1]) {
      r[i] *= 2
      gained += r[i]
      r[i + 1] = 0
      i++
    }
  }
  return { row: r, gained }
}

function reverse(row: number[]): number[] {
  return row.slice().reverse()
}

function transpose(board: number[][]): number[][] {
  const res = emptyBoard()
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      res[c][r] = board[r][c]
    }
  }
  return res
}

function boardsEqual(a: number[][], b: number[][]): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false
    }
  }
  return true
}

function canMove(board: number[][]): boolean {
  if (getEmptyCells(board).length > 0) return true
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c]
      if (r + 1 < SIZE && board[r + 1][c] === v) return true
      if (c + 1 < SIZE && board[r][c + 1] === v) return true
    }
  }
  return false
}

export function useGame() {
  const board = ref<number[][]>(emptyBoard())
  const score = ref(0)
  const won = ref(false)
  const over = ref(false)

  function reset() {
    board.value = emptyBoard()
    score.value = 0
    won.value = false
    over.value = false
    spawnRandom(board.value)
    spawnRandom(board.value)
  }

  function move(direction: Direction) {
    if (over.value || won.value) return

    let working: number[][] = board.value.map(row => row.slice())
    let gainedTotal = 0

    const apply = (rows: number[][], reverseBefore = false) => {
      const out: number[][] = []
      for (const row of rows) {
        const pre = reverseBefore ? reverse(row) : row
        const compressed = compress(pre)
        const { row: merged, gained } = mergeRow(compressed)
        const compressedAfter = compress(merged)
        const padded = pad(compressedAfter)
        const finalRow = reverseBefore ? reverse(padded) : padded
        out.push(finalRow)
        gainedTotal += gained
      }
      return out
    }

    if (direction === 'left') {
      working = apply(working, false)
    } else if (direction === 'right') {
      working = apply(working, true)
    } else if (direction === 'up') {
      working = transpose(working)
      working = apply(working, false)
      working = transpose(working)
    } else if (direction === 'down') {
      working = transpose(working)
      working = apply(working, true)
      working = transpose(working)
    }

    if (!boardsEqual(working, board.value)) {
      board.value = working
      score.value += gainedTotal
      if (!spawnRandom(board.value)) {
        over.value = true
      }
      won.value = board.value.some(row => row.some(v => v >= 2048))
      if (!canMove(board.value)) {
        over.value = true
      }
    }
  }

  const state = computed<GameState>(() => ({
    board: board.value,
    score: score.value,
    won: won.value,
    over: over.value,
  }))

  reset()

  return { state, reset, move }
}
