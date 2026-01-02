
import React, { useState, useEffect } from 'react';
import { UserData, GeneratedContent, WordSearchGrid } from './types';
import { generateKidMagic, generateColoringImage, regeneratePoem, regenerateWordSearchWords } from './services/geminiService';
import { createWordSearch } from './utils/wordSearchGenerator';
import { playChime, playSparkle, startBackgroundMusic, stopBackgroundMusic } from './utils/sounds';
import WordSearch from './components/WordSearch';
import ColoringCanvas from './components/ColoringCanvas';
import MagicGame from './components/MagicGame';

const MagicSparkles: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-magic-float"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.5,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" fill={['#FDE047', '#F472B6', '#818CF8', '#10B981', '#fbbf24'][i % 5]} />
          </svg>
        </div>
      ))}
    </div>
  );
};

const GirlLogo: React.FC<{ className?: string; animated?: boolean }> = ({ className = "w-12 h-12", animated = false }) => (
  <div className={`${className} relative flex items-center justify-center select-none group`}>
    <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl transition-transform duration-700 ${animated ? 'hover:scale-110' : ''}`}>
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#bgGrad)" />
      <g opacity="0.8">
        <circle cx="50" cy="95" r="40" fill="none" stroke="#F87171" strokeWidth="6" />
        <circle cx="50" cy="95" r="34" fill="none" stroke="#FBBF24" strokeWidth="6" />
        <circle cx="50" cy="95" r="28" fill="none" stroke="#34D399" strokeWidth="6" />
      </g>
      <circle cx="30" cy="45" r="15" fill="#FDE047" />
      <circle cx="70" cy="45" r="15" fill="#FDE047" />
      <path d="M30 40 Q30 20 50 20 Q70 20 70 40 L70 65 Q50 80 30 65 Z" fill="#FFEDD5" />
      <path d="M30 30 Q50 15 70 30 L70 40 Q50 35 30 40 Z" fill="#FACC15" />
      <g>
        <ellipse cx="42" cy="48" rx="3" ry="3" fill="#1F2937">
          {animated && <animate attributeName="ry" values="3;0.1;3" dur="4s" repeatCount="indefinite" />}
        </ellipse>
        <ellipse cx="58" cy="48" rx="3" ry="3" fill="#1F2937">
          {animated && <animate attributeName="ry" values="3;0.1;3" dur="4s" repeatCount="indefinite" />}
        </ellipse>
      </g>
      <path d="M45 62 Q50 67 55 62" stroke="#F43F5E" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  </div>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const App: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'form' | 'loading' | 'results' | 'error'>('intro');
  const [userData, setUserData] = useState<UserData>({
    name: '',
    age: '',
    favoriteAnimal: '',
    favoriteColor: '',
    favoriteFood: '',
    hobby: ''
  });
  const [magicContent, setMagicContent] = useState<GeneratedContent | null>(null);
  const [coloringUrl, setColoringUrl] = useState<string | null>(null);
  const [wordSearchData, setWordSearchData] = useState<WordSearchGrid | null>(null);
  const [activeTab, setActiveTab] = useState<'poem' | 'wordsearch' | 'coloring' | 'game'>('poem');
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (step === 'results') playSparkle();
  }, [step]);

  useEffect(() => {
    if (isMusicOn) startBackgroundMusic();
    else stopBackgroundMusic();
    return () => stopBackgroundMusic();
  }, [isMusicOn]);

  const startMagic = async () => {
    if (!process.env.API_KEY) {
      setErrorMessage("The Magic Wand is missing its battery! (API Key not found in environment). Please check your Vercel settings.");
      setStep('error');
      return;
    }

    playChime();
    setStep('loading');
    setErrorMessage('');
    
    try {
      const content = await generateKidMagic(userData);
      setMagicContent(content);
      
      const imageUrl = await generateColoringImage(content.coloringPrompt);
      const wsData = createWordSearch(content.wordSearchWords);
      
      setColoringUrl(imageUrl);
      setWordSearchData(wsData);
      setStep('results');
    } catch (error: any) {
      console.error("Magic failure", error);
      setErrorMessage(error.message || "Something went wrong while brewing the magic!");
      setStep('error');
    }
  };

  const refreshPoemHandler = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    playSparkle();
    try {
      const newPoem = await regeneratePoem(userData);
      if (magicContent) setMagicContent({ ...magicContent, poem: newPoem });
    } catch (e: any) {
      alert("Magic Rhyme Error: " + e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 sm:pb-24 overflow-x-hidden text-slate-800">
      <header className="no-print bg-white/80 backdrop-blur-2xl border-b border-gray-100 py-3 sm:py-6 px-4 sm:px-12 flex justify-between items-center sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3 sm:gap-6">
          <GirlLogo className="w-12 h-12 sm:w-24 sm:h-24" animated={step !== 'results'} />
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-kids font-bold text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-1">Ayla Bayla</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          <button
            onClick={() => { playChime(); setIsMusicOn(!isMusicOn); }}
            className={`p-3 sm:p-5 rounded-3xl transition-all shadow-sm active:scale-90 ${isMusicOn ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}
          >
            {isMusicOn ? '🔊' : '🔇'}
          </button>
          {(step === 'results' || step === 'error') && (
            <button 
              onClick={() => { playChime(); setStep('intro'); }}
              className="text-sm sm:text-xl font-kids font-bold text-indigo-600 bg-indigo-50 px-5 py-3 sm:px-8 sm:py-4 rounded-[1.5rem] hover:bg-indigo-100 transition-all transform active:scale-95 shadow-sm"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-12 mt-6 sm:mt-16">
        {step === 'intro' && (
          <div className="text-center space-y-10 sm:space-y-20 py-10 sm:py-24 relative">
            <MagicSparkles />
            <div className="flex justify-center relative z-10">
              <div className="relative group perspective-1000">
                <div className="absolute inset-0 bg-indigo-400/20 blur-[100px] rounded-full scale-150 animate-pulse"></div>
                <GirlLogo className="w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96" animated={true} />
              </div>
            </div>
            <div className="space-y-8 relative z-10">
              <h2 className="text-6xl sm:text-8xl md:text-9xl font-kids font-bold text-slate-800 leading-[1.1]">
                Magic Time! ✨
              </h2>
              <p className="text-xl sm:text-4xl text-slate-600 max-w-3xl mx-auto font-medium">
                Create your own magic book with stories and puzzles!
              </p>
              <button
                onClick={() => { playChime(); setStep('form'); }}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 font-kids text-3xl sm:text-6xl px-16 sm:px-32 py-8 sm:py-14 rounded-[3rem] shadow-2xl hover:scale-110 active:scale-95 transition-all ring-[12px] ring-white"
              >
                Let's Play! 🚀
              </button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 p-8 sm:p-20 rounded-[3rem] shadow-2xl border-[8px] border-white max-w-5xl mx-auto animate-scale-in">
            <h3 className="text-4xl sm:text-7xl font-kids font-bold text-white text-center mb-12">Tell us about you!</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: "Your Name?", key: 'name', placeholder: "Ayla..." },
                { label: "Age?", key: 'age', placeholder: "7", type: 'number' },
                { label: "Favorite Animal?", key: 'favoriteAnimal', placeholder: "Unicorn..." },
                { label: "Favorite Color?", key: 'favoriteColor', placeholder: "Rainbow..." },
                { label: "Favorite Food?", key: 'favoriteFood', placeholder: "Pizza..." },
                { label: "Fun Hobby?", key: 'hobby', placeholder: "Dancing..." },
              ].map((field) => (
                <div key={field.key} className="space-y-4">
                  <label className="block text-white font-bold text-lg sm:text-3xl">{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    className="w-full p-6 sm:p-10 rounded-[2rem] border-4 border-white/30 bg-white/10 text-white placeholder:text-white/40 focus:bg-white focus:text-slate-800 outline-none text-xl sm:text-4xl transition-all"
                    value={(userData as any)[field.key]}
                    onChange={e => setUserData({...userData, [field.key]: e.target.value})}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
            <div className="mt-16 flex justify-center">
              <button
                disabled={!userData.name || !userData.favoriteAnimal}
                onClick={startMagic}
                className="bg-white hover:bg-yellow-400 text-indigo-700 hover:text-white font-kids text-3xl sm:text-6xl px-16 sm:px-32 py-8 sm:py-14 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                Sparkle! ✨
              </button>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="text-center py-20 space-y-16">
            <div className="relative inline-block scale-150 sm:scale-[3]">
              <div className="w-24 h-24 border-[10px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-5xl">🪄</div>
            </div>
            <h2 className="text-5xl sm:text-8xl font-kids font-bold text-slate-800 animate-pulse">Brewing your magic...</h2>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-10 space-y-10 animate-scale-in">
            <div className="text-[10rem] animate-bounce">🤕</div>
            <h2 className="text-4xl sm:text-7xl font-kids font-bold text-rose-600">The Wand Slipped!</h2>
            <div className="bg-rose-50 p-8 rounded-[3rem] border-[6px] border-rose-100 max-w-4xl mx-auto shadow-inner">
              <p className="text-xl sm:text-4xl text-rose-900 font-kids leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => setStep('form')}
              className="bg-indigo-600 text-white font-kids text-2xl sm:text-5xl px-12 sm:px-24 py-6 sm:py-12 rounded-full shadow-xl hover:bg-indigo-700 transition transform hover:scale-105"
            >
              Try Again 🪄
            </button>
          </div>
        )}

        {step === 'results' && magicContent && (
          <div className="space-y-10 sm:space-y-20 pb-24 animate-fade-in relative">
            <nav className="no-print flex justify-center bg-white/70 backdrop-blur-3xl p-4 rounded-[3rem] shadow-2xl gap-3 sm:gap-10 sticky top-24 z-40 mx-2 overflow-x-auto">
              {['poem', 'wordsearch', 'coloring', 'game'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { playChime(); setActiveTab(tab as any); }}
                  className={`px-8 sm:px-14 py-6 rounded-[2rem] font-kids font-bold transition-all text-xl sm:text-4xl whitespace-nowrap
                    ${activeTab === tab ? 'bg-indigo-600 text-white scale-110' : 'text-indigo-600 hover:bg-indigo-50'}`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </nav>

            <article className="bg-white rounded-[4rem] shadow-2xl p-8 sm:p-24 border-[8px] border-white ring-[16px] ring-indigo-50/30">
              {activeTab === 'poem' && (
                <div className="text-center space-y-16 animate-scale-in">
                  <div className="flex items-center justify-center gap-8">
                    <h2 className="text-5xl sm:text-9xl font-kids font-bold text-slate-800">For {userData.name}</h2>
                    <button onClick={refreshPoemHandler} disabled={isRefreshing} className={`no-print p-5 rounded-full bg-indigo-100 text-indigo-600 ${isRefreshing ? 'animate-spin' : 'hover:scale-125'}`}>
                      <RefreshIcon />
                    </button>
                  </div>
                  <div className="text-3xl sm:text-7xl font-kids leading-relaxed text-slate-700 whitespace-pre-wrap italic animate-fade-in">
                    {magicContent.poem}
                  </div>
                </div>
              )}

              {activeTab === 'wordsearch' && wordSearchData && (
                <div className="animate-scale-in">
                  <WordSearch data={wordSearchData} />
                </div>
              )}

              {activeTab === 'coloring' && coloringUrl && (
                <div className="animate-scale-in">
                  <ColoringCanvas imageUrl={coloringUrl} />
                </div>
              )}

              {activeTab === 'game' && (
                <div className="animate-scale-in">
                  <MagicGame name={userData.name} favoriteColor={userData.favoriteColor} />
                </div>
              )}
            </article>
          </div>
        )}
      </main>
      
      <style>{`
        @keyframes magic-float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
          25% { opacity: 0.8; }
          50% { transform: translateY(-70px) rotate(180deg); opacity: 1; }
          100% { transform: translateY(-140px) rotate(360deg); opacity: 0; }
        }
        .animate-magic-float { animation: magic-float 6s ease-in-out infinite; }
        @keyframes scale-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
