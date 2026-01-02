
import { WordSearchGrid } from "../types";

export const createWordSearch = (wordsInput: string[], size: number = 14): WordSearchGrid => {
  const words = wordsInput.map(w => w.toUpperCase().replace(/[^A-Z]/g, '')).filter(w => w.length >= 3 && w.length <= size);
  const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
  const placedWords: { word: string; positions: [number, number][] }[] = [];

  const directions: [number, number][] = [
    [0, 1],   // Horizontal
    [1, 0],   // Vertical
    [1, 1],   // Diagonal Down-Right
    [0, -1],  // Horizontal Reverse
    [-1, 0],  // Vertical Reverse
    [-1, -1], // Diagonal Up-Left
    [1, -1],  // Diagonal Down-Left
    [-1, 1],  // Diagonal Up-Right
  ];

  for (const word of words) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 200) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const startX = Math.floor(Math.random() * size);
      const startY = Math.floor(Math.random() * size);

      if (canPlace(grid, word, startX, startY, dir, size)) {
        const positions = place(grid, word, startX, startY, dir);
        placedWords.push({ word, positions });
        placed = true;
      }
      attempts++;
    }
  }

  // Fill empty spaces
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return { grid, words: placedWords.map(pw => pw.word), placedWords };
};

const canPlace = (grid: string[][], word: string, x: number, y: number, dir: [number, number], size: number): boolean => {
  const [dx, dy] = dir;
  
  // Check bounds
  const endX = x + dx * (word.length - 1);
  const endY = y + dy * (word.length - 1);
  
  if (endX >= size || endX < 0 || endY >= size || endY < 0) return false;

  for (let i = 0; i < word.length; i++) {
    const nx = x + dx * i;
    const ny = y + dy * i;
    const curr = grid[nx][ny];
    if (curr !== '' && curr !== word[i]) return false;
  }
  return true;
};

const place = (grid: string[][], word: string, x: number, y: number, dir: [number, number]): [number, number][] => {
  const [dx, dy] = dir;
  const positions: [number, number][] = [];
  for (let i = 0; i < word.length; i++) {
    const nx = x + dx * i;
    const ny = y + dy * i;
    grid[nx][ny] = word[i];
    positions.push([nx, ny]);
  }
  return positions;
};
