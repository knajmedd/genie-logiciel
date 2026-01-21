(function() {
  const SIZE = 4;
  const boardEl = document.getElementById('board');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const bannerEl = document.getElementById('banner');
  const newGameBtn = document.getElementById('newGame');

  let board = emptyBoard();
  let score = 0;
  let over = false;
  let won = false;
  let best = Number(localStorage.getItem('best2048') || 0);

  bestEl.textContent = String(best);

  function emptyBoard() {
    return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
  }

  function getEmptyCells(b) {
    const cells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c] === 0) cells.push({ r, c });
      }
    }
    return cells;
  }

  function spawnRandom(b) {
    const empties = getEmptyCells(b);
    if (empties.length === 0) return false;
    const idx = Math.floor(Math.random() * empties.length);
    const { r, c } = empties[idx];
    b[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  function compress(row) {
    return row.filter(v => v !== 0);
  }

  function pad(row) {
    const res = row.slice();
    while (res.length < SIZE) res.push(0);
    return res;
  }

  function mergeRow(row) {
    const r = row.slice();
    let gained = 0;
    for (let i = 0; i < r.length - 1; i++) {
      if (r[i] !== 0 && r[i] === r[i + 1]) {
        r[i] *= 2;
        gained += r[i];
        r[i + 1] = 0;
        i++;
      }
    }
    return { row: r, gained };
  }

  function reverse(row) {
    return row.slice().reverse();
  }

  function transpose(b) {
    const res = emptyBoard();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        res[c][r] = b[r][c];
      }
    }
    return res;
  }

  function boardsEqual(a, b) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (a[r][c] !== b[r][c]) return false;
      }
    }
    return true;
  }

  function canMove(b) {
    if (getEmptyCells(b).length > 0) return true;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const v = b[r][c];
        if (r + 1 < SIZE && b[r + 1][c] === v) return true;
        if (c + 1 < SIZE && b[r][c + 1] === v) return true;
      }
    }
    return false;
  }

  function move(direction) {
    if (over || won) return;

    let working = board.map(row => row.slice());
    let gainedTotal = 0;

    const apply = (rows, reverseBefore) => {
      const out = [];
      for (const row of rows) {
        const pre = reverseBefore ? reverse(row) : row;
        const compressed = compress(pre);
        const mergedObj = mergeRow(compressed);
        const merged = mergedObj.row;
        const gained = mergedObj.gained;
        const compressedAfter = compress(merged);
        const padded = pad(compressedAfter);
        const finalRow = reverseBefore ? reverse(padded) : padded;
        out.push(finalRow);
        gainedTotal += gained;
      }
      return out;
    };

    if (direction === 'left') {
      working = apply(working, false);
    } else if (direction === 'right') {
      working = apply(working, true);
    } else if (direction === 'up') {
      working = transpose(working);
      working = apply(working, false);
      working = transpose(working);
    } else if (direction === 'down') {
      working = transpose(working);
      working = apply(working, true);
      working = transpose(working);
    }

    if (!boardsEqual(working, board)) {
      board = working;
      score += gainedTotal;
      updateScore();
      if (!spawnRandom(board)) {
        over = true;
      }
      won = board.some(row => row.some(v => v >= 2048));
      if (!canMove(board)) over = true;
      renderBoard();
      updateBanner();
      updateBest();
    }
  }

  function updateScore() {
    scoreEl.textContent = String(score);
  }

  function updateBest() {
    if (score > best) {
      best = score;
      localStorage.setItem('best2048', String(best));
      bestEl.textContent = String(best);
    }
  }

  function updateBanner() {
    if (won) {
      bannerEl.textContent = 'Bravo ! 2048 atteint 🎉';
      bannerEl.classList.add('success');
      bannerEl.hidden = false;
    } else if (over) {
      bannerEl.textContent = 'Partie terminée 😿';
      bannerEl.classList.remove('success');
      bannerEl.hidden = false;
    } else {
      bannerEl.hidden = true;
    }
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const val = board[r][c];
        const tile = document.createElement('div');
        tile.className = 'tile ' + (val === 0 ? 'empty' : ('t' + val));
        if (val !== 0) tile.textContent = String(val);
        boardEl.appendChild(tile);
      }
    }
  }

  function reset() {
    board = emptyBoard();
    score = 0;
    won = false;
    over = false;
    updateScore();
    spawnRandom(board);
    spawnRandom(board);
    renderBoard();
    updateBanner();
  }

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    const map = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
    };
    const dir = map[e.key];
    if (dir) {
      e.preventDefault();
      move(dir);
    }
  });

  // Touch controls
  let touchStartX = 0;
  let touchStartY = 0;
  boardEl.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  boardEl.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) < 24) return;
    let dir;
    if (absX > absY) dir = dx > 0 ? 'right' : 'left';
    else dir = dy > 0 ? 'down' : 'up';
    move(dir);
  }, { passive: true });

  // Reset button
  newGameBtn.addEventListener('click', reset);

  // Init
  reset();
})();
