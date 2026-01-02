
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
      setSelectedCells(prev => [...prev, [r, c]]);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    checkWord();
  };

  // Support for touch devices
  const handleTouchStart = (e: React.TouchEvent, r: number, c: number) => {
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
    <div className="flex flex-col items-center gap-6 sm:gap-10 w-full max-w-2xl mx-auto p-4 sm:p-8 bg-white rounded-[2rem] shadow-xl border-4 border-yellow-300">
      <div 
        className="grid gap-1 select-none cursor-pointer touch-none"
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
                w-7 h-7 xs:w-8 xs:h-8 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg font-bold text-base sm:text-2xl transition-all duration-200
                ${isCellFound(r, c) ? 'bg-green-400 text-white shadow-sm scale-95' : ''}
                ${isCellSelected(r, c) ? 'bg-blue-500 text-white scale-110 z-10 shadow-md' : ''}
                ${!isCellFound(r, c) && !isCellSelected(r, c) ? 'bg-gray-50 text-gray-700 hover:bg-gray-100' : ''}
              `}
            >
              {char}
            </div>
          ))
        )}
      </div>

      <div className="w-full space-y-4">
        <h3 className="text-xl sm:text-3xl font-bold text-blue-600 font-kids text-center">Words to Find:</h3>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {data.words.map(word => (
            <span
              key={word}
              className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-lg font-bold transition-all duration-500 shadow-sm
                ${foundWords.includes(word) 
                  ? 'bg-green-500 text-white line-through opacity-40 scale-90' 
                  : 'bg-blue-50 text-blue-600 border-2 border-blue-100'
                }
              `}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
      
      {foundWords.length === data.words.length && (
        <div className="w-full bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-100 p-6 rounded-2xl border-4 border-yellow-400 animate-bounce shadow-xl">
          <p className="text-yellow-900 text-xl sm:text-3xl font-bold font-kids text-center tracking-wide">
            🌟 YOU ARE A MAGIC WORD WIZARD! 🌟
          </p>
        </div>
      )}
    </div>
  );
};

export default WordSearch;
