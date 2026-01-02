
import React, { useRef, useState, useEffect } from 'react';
import { playChime } from '../utils/sounds';

interface ColoringCanvasProps {
  imageUrl: string;
}

const COLORS = [
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', 
  '#4B0082', '#9400D3', '#FF69B4', '#000000', '#FFFFFF',
  '#7CFC00', '#00CED1', '#FFA500', '#8B4513'
];

const ColoringCanvas: React.FC<ColoringCanvasProps> = ({ imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#FF69B4');
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 20;
    setCtx(context);

    // Initial canvas setup
    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const size = parent.clientWidth;
        canvas.width = size;
        canvas.height = size;
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = size / 30;
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctx) ctx.beginPath();
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    if ('touches' in e) {
        // Prevent scrolling while drawing on mobile
        if (e.cancelable) e.preventDefault();
    }
    
    const { x, y } = getPos(e);
    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    playChime();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto font-kids">
      {/* Color Palette */}
      <div className="no-print grid grid-cols-5 sm:flex sm:flex-wrap justify-center gap-4 sm:gap-6 p-6 sm:p-10 bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border-4 border-slate-100">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); playChime(); }}
            className={`w-12 h-12 sm:w-20 sm:h-20 rounded-full border-[6px] sm:border-[8px] transition-all transform active:scale-90 ${
              color === c ? 'border-slate-800 scale-125 shadow-xl rotate-6' : 'border-white'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
        <button
          onClick={clearCanvas}
          className="col-span-5 sm:col-span-1 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-[1.5rem] sm:rounded-3xl transition-all text-xl sm:text-3xl shadow-sm active:bg-slate-300"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Canvas Container */}
      <div className="relative w-full aspect-square bg-white rounded-[3rem] sm:rounded-[5rem] shadow-[0_40px_80px_rgba(0,0,0,0.1)] border-[10px] sm:border-[24px] border-white overflow-hidden touch-none group ring-8 ring-pink-50/50">
        {/* Drawing Layer */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 z-10 w-full h-full cursor-crosshair"
        />
        
        {/* Line Art Overlay - Multiplied to keep lines on top */}
        <img 
          src={imageUrl} 
          alt="Coloring Lines" 
          className="absolute inset-0 z-20 w-full h-full pointer-events-none select-none"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>
      
      <p className="no-print text-2xl sm:text-4xl text-slate-400 font-bold italic animate-pulse tracking-wide">
        Pick a color and rub your finger on the picture! ✨
      </p>
    </div>
  );
};

export default ColoringCanvas;
