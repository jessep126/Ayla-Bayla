
import React, { useState, useEffect } from 'react';
import { WordSearchGrid } from '../types';
import { playSuccess } from '../utils/sounds';

interface WordSearchProps {
  data: WordSearchGrid;
}

const WordSearch: React.FC<WordSearchProps> = ({ data }) => {
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleMouseDown = (r: number, c: number) => {
    setIsSelecting(true);
    setSelectedCells([[r, c]]);
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (isSelecting) {
      setSelectedCells(prev => {
          const last = prev[prev.length - 1];
          if (last && last[0] === r && last[1] === c) return prev;
          return [...prev, [r, c]];
      });
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    checkWord();
  };

  // Support for touch devices
  const handleTouchStart = (e: React.TouchEvent, r: number, c: number) => {
    // Prevent scrolling
    if (e.cancelable) e.preventDefault();
    setIsSelecting(true);
    setSelectedCells([[r, c]]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const pos = element?.getAttribute('data-pos');
    if (pos) {
      const [r, c] = pos.split('-').map(Number);
      setSelectedCells(prev => {
        const last = prev[prev.length - 1];
        if (last && last[0] === r && last[1] === c) return prev;
        return [...prev, [r, c]];
      });
    }
  };

  const checkWord = () => {
    const selectedWord = selectedCells.map(([r, c]) => data.grid[r][c]).join('');
    const reversedWord = [...selectedWord].reverse().join('');

    const match = data.words.find(w => w === selectedWord || w === reversedWord);
    
    if (match && !foundWords.includes(match)) {
      playSuccess();
      setFoundWords(prev => [...prev, match]);
    }
    setSelectedCells([]);
  };

  const isCellSelected = (r: number, c: number) => 
    selectedCells.some(([sr, sc]) => sr === r && sc === c);

  const isCellFound = (r: number, c: number) => 
    data.placedWords.some(pw => foundWords.includes(pw.word) && pw.positions.some(([pr, pc]) => pr === r && pc === c));

  return (
    <div className="flex flex-col items-center gap-8 sm:gap-16 w-full max-w-4xl mx-auto p-4 sm:p-14 bg-white rounded-[3rem] sm:rounded-[5rem] shadow-2xl border-[6px] sm:border-[16px] border-yellow-300 ring-[12px] sm:ring-[24px] ring-yellow-50/50">
      <div 
        className="grid gap-1 sm:gap-2 select-none cursor-pointer touch-none bg-slate-50 p-2 sm:p-4 rounded-[1.5rem] sm:rounded-[3rem] border-4 border-slate-100"
        style={{ gridTemplateColumns: `repeat(${data.grid.length}, minmax(0, 1fr))` }}
        onMouseLeave={() => { setIsSelecting(false); setSelectedCells([]); }}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleTouchMove}
      >
        {data.grid.map((row, r) => 
          row.map((char, c) => (
            <div
              key={`${r}-${c}`}
              data-pos={`${r}-${c}`}
              onMouseDown={() => handleMouseDown(r, c)}
              onMouseEnter={() => handleMouseEnter(r, c)}
              onTouchStart={(e) => handleTouchStart(e, r, c)}
              className={`
                aspect-square flex items-center justify-center rounded-lg sm:rounded-2xl font-bold text-base sm:text-4xl transition-all duration-200
                ${isCellFound(r, c) ? 'bg-green-400 text-white shadow-md scale-90' : ''}
                ${isCellSelected(r, c) ? 'bg-blue-500 text-white scale-110 z-10 shadow-lg' : ''}
                ${!isCellFound(r, c) && !isCellSelected(r, c) ? 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-100' : ''}
              `}
              style={{ width: '100%', maxWidth: '60px' }}
            >
              {char}
            </div>
          ))
        )}
      </div>

      <div className="w-full space-y-8">
        <h3 className="text-3xl sm:text-6xl font-bold text-blue-600 font-kids text-center drop-shadow-sm">Find the Magic Words:</h3>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
          {data.words.map(word => (
            <span
              key={word}
              className={`px-4 sm:px-8 py-2 sm:py-4 rounded-full text-sm sm:text-3xl font-kids font-bold transition-all duration-500 shadow-md transform
                ${foundWords.includes(word) 
                  ? 'bg-green-500 text-white line-through opacity-40 scale-90 -rotate-2' 
                  : 'bg-blue-50 text-blue-600 border-4 border-blue-100 hover:scale-105'
                }
              `}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
      
      {foundWords.length === data.words.length && (
        <div className="w-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 p-8 sm:p-14 rounded-[3rem] border-[8px] border-yellow-500 animate-bounce shadow-2xl mt-8">
          <p className="text-yellow-950 text-3xl sm:text-7xl font-bold font-kids text-center tracking-wide drop-shadow-md">
            🌟 YOU ARE A WORD WIZARD! 🌟
          </p>
        </div>
      )}
    </div>
  );
};

export default WordSearch;
