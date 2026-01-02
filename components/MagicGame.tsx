
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { playPop, playSuccess, playSparkle } from '../utils/sounds';

interface MagicGameProps {
  name: string;
  favoriteColor: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'star' | 'bubble' | 'heart';
  speed: number;
  color: string;
}

const MagicGame: React.FC<MagicGameProps> = ({ name, favoriteColor }) => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('ayla_bayla_highscore') || '0'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const gameRef = useRef<HTMLDivElement>(null);
  const sparkleIdRef = useRef(0);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setSparkles([]);
    playSparkle();
  };

  const spawnSparkle = useCallback(() => {
    if (!gameRef.current) return;
    const width = gameRef.current.clientWidth;
    const types: ('star' | 'bubble' | 'heart')[] = ['star', 'bubble', 'heart'];
    const colors = ['#FFD700', '#FF69B4', '#00BFFF', '#7CFC00', '#FF4500', favoriteColor];
    
    const newSparkle: Sparkle = {
      id: sparkleIdRef.current++,
      x: Math.random() * (width - 80),
      y: -80,
      size: 60 + Math.random() * 60,
      type: types[Math.floor(Math.random() * types.length)],
      speed: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    
    setSparkles(prev => [...prev, newSparkle]);
  }, [favoriteColor]);

  useEffect(() => {
    let spawnTimer: number;
    let moveTimer: number;
    let clockTimer: number;

    if (isPlaying && timeLeft > 0) {
      spawnTimer = window.setInterval(spawnSparkle, 700);
      
      moveTimer = window.setInterval(() => {
        setSparkles(prev => prev.map(s => ({ ...s, y: s.y + s.speed })).filter(s => s.y < 800));
      }, 16);

      clockTimer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isPlaying) {
      setIsPlaying(false);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('ayla_bayla_highscore', score.toString());
        playSuccess();
      }
    }

    return () => {
      clearInterval(spawnTimer);
      clearInterval(moveTimer);
      clearInterval(clockTimer);
    };
  }, [isPlaying, timeLeft, spawnSparkle, score, highScore]);

  const popSparkle = (id: number) => {
    playPop();
    setScore(prev => prev + 10);
    setSparkles(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto font-kids">
      <div className="flex justify-between w-full px-6 sm:px-12 py-6 sm:py-10 bg-white/90 backdrop-blur-md rounded-[3rem] border-[6px] border-yellow-200 shadow-2xl ring-8 ring-yellow-50/50">
        <div className="text-center">
          <p className="text-xl sm:text-3xl text-slate-500 uppercase font-bold tracking-widest mb-1">Score</p>
          <p className="text-5xl sm:text-8xl text-indigo-600 font-bold drop-shadow-sm">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-xl sm:text-3xl text-slate-500 uppercase font-bold tracking-widest mb-1">Best</p>
          <p className="text-5xl sm:text-8xl text-emerald-600 font-bold drop-shadow-sm">{highScore}</p>
        </div>
        <div className="text-center">
          <p className="text-xl sm:text-3xl text-slate-500 uppercase font-bold tracking-widest mb-1">Time</p>
          <p className={`text-5xl sm:text-8xl font-bold drop-shadow-sm ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>{timeLeft}s</p>
        </div>
      </div>

      <div 
        ref={gameRef}
        className="relative w-full h-[600px] sm:h-[800px] bg-gradient-to-b from-sky-100 to-indigo-100 rounded-[3rem] sm:rounded-[5rem] border-[8px] sm:border-[20px] border-white shadow-inner overflow-hidden cursor-pointer touch-none ring-[16px] ring-indigo-50/30"
      >
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-xl z-20 gap-10 px-8">
            <h2 className="text-6xl sm:text-[8rem] font-bold text-slate-800 text-center drop-shadow-xl leading-tight">
              {timeLeft <= 0 ? "Magic Done!" : `Pop for ${name}!`}
            </h2>
            {timeLeft <= 0 && (
              <p className="text-4xl sm:text-7xl font-bold text-indigo-600 animate-bounce">You got {score} points! ✨</p>
            )}
            <button
              onClick={startGame}
              className="bg-yellow-400 hover:bg-yellow-500 text-amber-950 text-4xl sm:text-7xl px-20 sm:px-32 py-10 sm:py-16 rounded-full shadow-[0_30px_70px_rgba(245,158,11,0.5)] transition transform hover:scale-110 active:scale-95 border-b-[12px] border-yellow-600 font-bold"
            >
              {timeLeft <= 0 ? "Try Again! 🔄" : "Start Game! 🪄"}
            </button>
          </div>
        ) : (
          sparkles.map(s => (
            <div
              key={s.id}
              onClick={() => popSparkle(s.id)}
              onTouchStart={(e) => {
                  e.preventDefault();
                  popSparkle(s.id);
              }}
              className="absolute select-none transition-transform hover:scale-110 active:scale-50 cursor-pointer"
              style={{
                left: s.x,
                top: s.y,
                width: s.size,
                height: s.size,
              }}
            >
              <svg viewBox="0 0 24 24" fill={s.color} className="w-full h-full drop-shadow-2xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]">
                {s.type === 'star' && <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />}
                {s.type === 'bubble' && <circle cx="12" cy="12" r="10" opacity="0.8" />}
                {s.type === 'heart' && <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />}
              </svg>
            </div>
          ))
        )}
      </div>

      <p className="text-2xl sm:text-5xl text-slate-400 font-bold italic animate-pulse tracking-wide mt-4">
        Pop the falling magic as fast as you can! 🚀
      </p>
    </div>
  );
};

export default MagicGame;
