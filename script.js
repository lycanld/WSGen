let GRID_SIZE = 15;

function createEmptyGrid(size) {
  const grid = [];
  for (let i = 0; i < size; i++) {
    grid.push(new Array(size).fill(''));
  }
  return grid;
}

function canPlaceWord(grid, word, x, y, dirX, dirY) {
  for (let i = 0; i < word.length; i++) {
    const nx = x + i * dirX;
    const ny = y + i * dirY;
    if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) return false;
    if (grid[ny][nx] !== '' && grid[ny][nx] !== word[i]) return false;
  }
  return true;
}

function placeWord(grid, word) {
  const directions = [
    [1, 0], // horizontal
    [0, 1], // vertical
    [-1, 0], // horizontal backward
    [0, -1], // vertical upward
  ];
  for (let attempt = 0; attempt < 100; attempt++) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const maxX = GRID_SIZE - (dir[0] === 1 ? word.length : 0);
    const maxY = GRID_SIZE - (dir[1] === 1 ? word.length : 0);
    const minX = dir[0] === -1 ? word.length - 1 : 0;
    const minY = dir[1] === -1 ? word.length - 1 : 0;
    const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
    if (canPlaceWord(grid, word, x, y, dir[0], dir[1])) {
      for (let i = 0; i < word.length; i++) {
        grid[y + i * dir[1]][x + i * dir[0]] = word[i];
      }
      return true;
    }
  }
  return false;
}

function fillEmptyCells(grid) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === '') {
        grid[y][x] = letters.charAt(Math.floor(Math.random() * letters.length));
      }
    }
  }
}

function generateWordSearch(words, size) {
  GRID_SIZE = size;
  const grid = createEmptyGrid(GRID_SIZE);
  const placedWords = [];
  const placedPositions = []; // store positions of placed letters for highlighting
  for (const word of words) {
    const positions = placeWordWithPositions(grid, word.toUpperCase());
    if (positions.length > 0) {
      placedWords.push(word.toUpperCase());
      placedPositions.push(...positions);
    }
  }
  fillEmptyCells(grid);
  return { grid, placedWords, placedPositions };
}

function placeWordWithPositions(grid, word) {
  const directions = [
    [1, 0], // horizontal
    [0, 1], // vertical
    [-1, 0], // horizontal backward
    [0, -1], // vertical upward
    [1, 1], // diagonal down-right
    [-1, -1], // diagonal up-left
    [1, -1], // diagonal up-right
    [-1, 1], // diagonal down-left
  ];
  for (let attempt = 0; attempt < 100; attempt++) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const maxX = GRID_SIZE - (dir[0] === 1 ? word.length : 0);
    const maxY = GRID_SIZE - (dir[1] === 1 ? word.length : 0);
    const minX = dir[0] === -1 ? word.length - 1 : 0;
    const minY = dir[1] === -1 ? word.length - 1 : 0;
    const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
    if (canPlaceWord(grid, word, x, y, dir[0], dir[1])) {
      const positions = [];
      for (let i = 0; i < word.length; i++) {
        const nx = x + i * dir[0];
        const ny = y + i * dir[1];
        grid[ny][nx] = word[i];
        positions.push({ x: nx, y: ny });
      }
      return positions;
    }
  }
  return [];
}

function renderGrid(grid, showAnswers, highlightPositions = []) {
  const container = document.getElementById('word-search');
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 30px)`;
  container.style.gridTemplateRows = `repeat(${GRID_SIZE}, 30px)`;
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (grid[y][x] === '') {
        cell.classList.add('empty');
      }
      cell.textContent = grid[y][x];
      if (showAnswers) {
        // Highlight letters that are part of placed words
        const isHighlighted = highlightPositions.some(pos => pos.x === x && pos.y === y);
        if (isHighlighted) {
          cell.style.backgroundColor = '#ffff00'; // yellow highlight
        }
      }
      container.appendChild(cell);
    }
  }
}

document.getElementById('generate').addEventListener('click', () => {
  const sizeInput = document.getElementById('grid-size');
  const wordListInput = document.getElementById('word-list');
  const size = parseInt(sizeInput.value);
  const words = wordListInput.value.split(',').map(w => w.trim()).filter(w => w.length > 0);
  if (isNaN(size) || size < 5 || size > 30) {
    alert('Grid size must be a number between 5 and 30.');
    return;
  }
  if (words.length === 0) {
    alert('Please enter at least one word.');
    return;
  }
  crossword = generateWordSearch(words, size);
  renderGrid(crossword.grid, false);
  const showSolutionBtn = document.getElementById('show-solution');
  const downloadImageBtn = document.getElementById('download-image');
  const downloadSolutionBtn = document.getElementById('download-solution-image');
  showSolutionBtn.disabled = false;
  downloadImageBtn.disabled = false;
  downloadSolutionBtn.disabled = false;
  console.log('Generate button clicked: buttons enabled');
});

document.getElementById('show-solution').addEventListener('click', () => {
  renderGrid(crossword.grid, true, crossword.placedPositions);
});

document.getElementById('download-image').addEventListener('click', () => {
  downloadPuzzleImage(false);
});

document.getElementById('download-solution-image').addEventListener('click', () => {
  downloadPuzzleImage(true);
});

let crossword = generateWordSearch(["PYTHON", "CODE", "CHAT", "PUZZLE", "IMAGE", "BOT", "LOGIC", "GRID"], 15);
renderGrid(crossword.grid, false);

function downloadPuzzleImage(isSolution = false) {
  const canvas = document.createElement('canvas');
  const cellSize = 30;
  const lineHeight = 20;
  const padding = 10;
  const maxWidth = GRID_SIZE * cellSize;
  const wordsText = 'Words: ' + crossword.placedWords.join(', ');
  
  // Calculate word list height with wrapping
  const ctx = canvas.getContext('2d');
  ctx.font = '16px Arial';
  const wordsLines = [];
  let currentLine = '';
  const maxTextWidth = maxWidth - 2 * padding;

  wordsText.split(' ').forEach(word => {
    const testLine = currentLine + word + ' ';
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxTextWidth && currentLine !== '') {
      wordsLines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) {
    wordsLines.push(currentLine.trim());
  }

  const wordListHeight = wordsLines.length * lineHeight + 2 * padding;

  canvas.width = maxWidth;
  canvas.height = GRID_SIZE * cellSize + wordListHeight;

  // Re-get context after resizing canvas
  const ctx2 = canvas.getContext('2d');

  // Background
  ctx2.fillStyle = 'white';
  ctx2.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid lines
  ctx2.strokeStyle = 'black';
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx2.beginPath();
    ctx2.moveTo(i * cellSize, 0);
    ctx2.lineTo(i * cellSize, GRID_SIZE * cellSize);
    ctx2.stroke();

    ctx2.beginPath();
    ctx2.moveTo(0, i * cellSize);
    ctx2.lineTo(canvas.width, i * cellSize);
    ctx2.stroke();
  }

  // Draw letters
  ctx2.fillStyle = 'black';
  ctx2.font = 'bold 20px Arial';
  ctx2.textBaseline = 'middle';
  ctx2.textAlign = 'center';

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const letter = crossword.grid[y][x];
      if (letter) {
        if (isSolution) {
          // Highlight letters part of placed words with yellow background
          const isHighlighted = crossword.placedPositions.some(pos => pos.x === x && pos.y === y);
          if (isHighlighted) {
            ctx2.fillStyle = 'yellow';
            ctx2.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx2.fillStyle = 'black';
          }
        }
        ctx2.fillText(letter, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      }
    }
  }

  // Draw word list below grid with wrapping
  ctx2.fillStyle = 'black';
  ctx2.font = '16px Arial';
  ctx2.textBaseline = 'top';
  ctx2.textAlign = 'left';
  wordsLines.forEach((line, index) => {
    ctx2.fillText(line, padding, GRID_SIZE * cellSize + padding + index * lineHeight);
  });

  // Create image and trigger download
  const link = document.createElement('a');
  link.download = isSolution ? 'word_search_solution.png' : 'word_search_puzzle.png';
  link.href = canvas.toDataURL();
  link.click();
}
