
import React, { useRef, useState, useEffect } from 'react';
import { playChime } from '../utils/sounds';

interface ColoringCanvasProps {
  imageUrl: string;
}

const COLORS = [
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', 
  '#4B0082', '#9400D3', '#FF69B4', '#000000', '#FFFFFF'
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
    context.lineWidth = 15;
    setCtx(context);

    // Initial canvas setup
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientWidth; // Square
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
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
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    
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
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Color Palette */}
      <div className="no-print flex flex-wrap justify-center gap-3 p-4 bg-white rounded-3xl shadow-lg border-2 border-slate-100">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); playChime(); }}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 transition-transform active:scale-90 ${
              color === c ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
        >
          🗑️ Reset
        </button>
      </div>

      {/* Canvas Container */}
      <div className="relative w-full aspect-square bg-white rounded-[2rem] shadow-2xl border-[8px] sm:border-[16px] border-white overflow-hidden touch-none group">
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
      
      <p className="no-print text-slate-400 font-medium italic animate-pulse">
        Pick a color and rub your finger on the picture! ✨
      </p>
    </div>
  );
};

export default ColoringCanvas;
