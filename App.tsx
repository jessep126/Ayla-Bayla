
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
      <circle cx="50" cy="50" r="44" fill="white" opacity="0.1" />

      <g opacity="0.8">
        <circle cx="50" cy="95" r="40" fill="none" stroke="#F87171" strokeWidth="6" />
        <circle cx="50" cy="95" r="34" fill="none" stroke="#FBBF24" strokeWidth="6" />
        <circle cx="50" cy="95" r="28" fill="none" stroke="#34D399" strokeWidth="6" />
      </g>

      <circle cx="30" cy="45" r="15" fill="#FDE047" />
      <circle cx="70" cy="45" r="15" fill="#FDE047" />
      
      <path d="M30 40 Q30 20 50 20 Q70 20 70 40 L70 65 Q50 80 30 65 Z" fill="#FFEDD5" />
      
      <path d="M30 30 Q50 15 70 30 L70 40 Q50 35 30 40 Z" fill="#FACC15" />
      <path d="M30 30 L35 45 L40 32 L50 45 L60 32 L65 45 L70 30" fill="#FACC15">
        {animated && <animateTransform attributeName="transform" type="translate" values="0,0; 0,1; 0,0" dur="3s" repeatCount="indefinite" />}
      </path>

      <g>
        <ellipse cx="42" cy="48" rx="3" ry="3" fill="#1F2937">
          {animated && <animate attributeName="ry" values="3;0.1;3" dur="4s" repeatCount="indefinite" />}
        </ellipse>
        <circle cx="43" cy="47" r="1" fill="white">
          {animated && <animate attributeName="opacity" values="1;0;1" dur="4s" repeatCount="indefinite" />}
        </circle>
        
        <ellipse cx="58" cy="48" rx="3" ry="3" fill="#1F2937">
          {animated && <animate attributeName="ry" values="3;0.1;3" dur="4s" repeatCount="indefinite" />}
        </ellipse>
        <circle cx="59" cy="47" r="1" fill="white">
          {animated && <animate attributeName="opacity" values="1;0;1" dur="4s" repeatCount="indefinite" />}
        </circle>
      </g>
      
      <g stroke="#EC4899" strokeWidth="3" fill="none">
        <rect x="34" y="42" width="14" height="12" rx="4">
          {animated && <animate attributeName="stroke-width" values="3;3.5;3" dur="2s" repeatCount="indefinite" />}
        </rect>
        <rect x="52" y="42" width="14" height="12" rx="4">
          {animated && <animate attributeName="stroke-width" values="3;3.5;3" dur="2s" repeatCount="indefinite" />}
        </rect>
        <path d="M48 48 L52 48" />
        <path d="M34 48 L28 45" />
        <path d="M66 48 L72 45" />
      </g>
      
      <path d="M45 62 Q50 67 55 62" stroke="#F43F5E" strokeWidth="2" fill="none" strokeLinecap="round">
        {animated && <animate attributeName="d" values="M45 62 Q50 67 55 62; M44 62 Q50 69 56 62; M45 62 Q50 67 55 62" dur="3s" repeatCount="indefinite" />}
      </path>
      
      <circle cx="36" cy="60" r="3.5" fill="#FECDD3" opacity="0.7" />
      <circle cx="64" cy="60" r="3.5" fill="#FECDD3" opacity="0.7" />

      <path d="M85 20 L87 25 L92 27 L87 29 L85 34 L83 29 L78 27 L83 25 Z" fill="white">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="scale" values="0.8;1.2;0.8" dur="1.5s" repeatCount="indefinite" additive="sum" />
      </path>
    </svg>
  </div>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
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
    if (step === 'results') {
      playSparkle();
    }
  }, [step]);

  useEffect(() => {
    if (isMusicOn) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
    return () => stopBackgroundMusic();
  }, [isMusicOn]);

  const startMagic = async () => {
    if (!process.env.API_KEY || process.env.API_KEY === "") {
      setErrorMessage("The Magic Wand is missing its power! (Missing API Key). Please add it to your environment variables.");
      setStep('error');
      return;
    }

    playChime();
    setStep('loading');
    try {
      const content = await generateKidMagic(userData);
      setMagicContent(content);
      
      const [imageUrl, wsData] = await Promise.all([
        generateColoringImage(content.coloringPrompt),
        Promise.resolve(createWordSearch(content.wordSearchWords))
      ]);
      
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
      if (magicContent) {
        setMagicContent({ ...magicContent, poem: newPoem });
      }
    } catch (e: any) {
      console.error(e);
      alert("Rhyme error: " + e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshWordSearchHandler = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    playSparkle();
    try {
      const newWords = await regenerateWordSearchWords(userData);
      const wsData = createWordSearch(newWords);
      setWordSearchData(wsData);
    } catch (e: any) {
      console.error(e);
      alert("Puzzle error: " + e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    playChime();
    const shareTitle = `Magic Book for ${userData.name} ✨`;
    const shareText = `Look at the magic book Ayla Bayla made for ${userData.name}! 🪄\n\nPoem:\n${magicContent?.poem}\n\nMake your own magic at Ayla Bayla!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      const mailtoLink = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`;
      window.location.href = mailtoLink;
    }
  };

  const toggleMusic = () => {
    playChime();
    setIsMusicOn(!isMusicOn);
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
            onClick={toggleMusic}
            className={`p-3 sm:p-5 rounded-3xl transition-all shadow-sm active:scale-90 ${isMusicOn ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}
            title={isMusicOn ? "Music On" : "Music Off"}
          >
            {isMusicOn ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
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
                <GirlLogo className="w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 transition-all duration-700 group-hover:scale-110" animated={true} />
                <div className="absolute -top-6 -right-6 sm:-top-12 -right-12 animate-bounce text-6xl sm:text-9xl drop-shadow-2xl">🎨</div>
                <div className="absolute -bottom-6 -left-6 sm:-bottom-12 -left-12 animate-pulse text-6xl sm:text-9xl drop-shadow-2xl" style={{ animationDelay: '0.5s' }}>🪄</div>
              </div>
            </div>
            <div className="space-y-8 relative z-10 px-4">
              <h2 className="text-6xl sm:text-8xl md:text-9xl font-kids font-bold text-slate-800 leading-[1.1]">
                Ready to make some <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x drop-shadow-sm">MAGIC?</span>
              </h2>
              <p className="text-xl sm:text-4xl text-slate-600 max-w-3xl mx-auto font-medium animate-fade-in-up leading-relaxed">
                Create a special book filled with poems, puzzles, and pictures for YOU!
              </p>
            </div>
            <div className="relative z-10">
              {!isMusicOn && (
                <p className="mb-8 text-indigo-600 font-bold animate-pulse text-xl sm:text-4xl drop-shadow-sm">Turn on the music for extra magic! 🎶</p>
              )}
              <button
                onClick={() => { playChime(); setStep('form'); }}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-amber-950 font-kids text-3xl sm:text-6xl px-16 sm:px-32 py-8 sm:py-14 rounded-[3rem] sm:rounded-[4rem] shadow-[0_25px_60px_rgba(245,158,11,0.5)] transform transition hover:scale-110 active:scale-95 ring-[12px] sm:ring-[20px] ring-white group"
              >
                Let's Go! <span className="inline-block group-hover:translate-x-4 transition-transform">🚀</span>
              </button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 p-8 sm:p-20 rounded-[3rem] sm:rounded-[5rem] shadow-[0_40px_100px_rgba(0,0,0,0.25)] border-[8px] sm:border-[16px] border-white max-w-5xl mx-auto animate-scale-in relative overflow-hidden">
             <div className="absolute top-10 right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
             <div className="absolute bottom-20 left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
             
            <div className="flex flex-col items-center mb-12 sm:mb-20 text-center relative z-10">
              <div className="bg-white/20 p-5 sm:p-8 rounded-full backdrop-blur-md mb-8 shadow-xl border border-white/30">
                <GirlLogo className="w-20 h-20 sm:w-32 sm:h-32" animated={true} />
              </div>
              <h3 className="text-4xl sm:text-7xl font-kids font-bold text-white drop-shadow-lg tracking-wide">Tell us about you!</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-14 relative z-10">
              {[
                { label: "What is your name?", key: 'name', placeholder: "Your name..." },
                { label: "How old are you?", key: 'age', placeholder: "7", type: 'number' },
                { label: "Favorite animal?", key: 'favoriteAnimal', placeholder: "Dinosaur, Cat, Unicorn..." },
                { label: "Favorite color?", key: 'favoriteColor', placeholder: "Blue, Sparkly Pink..." },
                { label: "Favorite food?", key: 'favoriteFood', placeholder: "Pizza, Ice Cream..." },
                { label: "Something you love to do?", key: 'hobby', placeholder: "Dancing, LEGO, Reading..." },
              ].map((field) => (
                <div key={field.key} className="space-y-4 sm:space-y-6 group">
                  <label className="block text-white font-bold ml-3 text-lg sm:text-3xl drop-shadow-md transition-all group-focus-within:translate-x-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    className="w-full p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border-4 border-white/30 bg-white/10 text-white placeholder:text-white/40 focus:bg-white focus:text-slate-800 focus:border-yellow-400 focus:ring-[15px] sm:ring-[25px] focus:ring-yellow-400/30 outline-none text-xl sm:text-4xl transition-all shadow-inner"
                    value={(userData as any)[field.key]}
                    onChange={e => setUserData({...userData, [field.key]: e.target.value})}
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-16 sm:mt-28 flex justify-center relative z-10">
              <button
                disabled={!userData.name || !userData.favoriteAnimal}
                onClick={startMagic}
                className="w-full sm:w-auto bg-white hover:bg-yellow-400 disabled:bg-white/20 disabled:text-white/30 text-indigo-700 disabled:shadow-none hover:text-white font-kids text-3xl sm:text-6xl px-16 sm:px-32 py-8 sm:py-14 rounded-full shadow-[0_20px_60px_rgba(255,255,255,0.3)] transition-all transform hover:scale-110 hover:-rotate-1 active:scale-95 border-b-[10px] sm:border-b-[16px] border-indigo-200 hover:border-yellow-600"
              >
                Create My Magic! ✨
              </button>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="text-center py-20 sm:py-48 space-y-16 sm:space-y-24 relative">
             <MagicSparkles />
            <div className="relative inline-block scale-150 sm:scale-[3]">
              <div className="w-24 h-24 border-[10px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-2xl"></div>
              <div className="absolute inset-0 flex items-center justify-center text-5xl drop-shadow-lg">🪄</div>
            </div>
            <div className="space-y-10">
              <h2 className="text-5xl sm:text-8xl font-kids font-bold text-slate-800 animate-pulse leading-tight">
                Mixing the magic paint... <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Writing your story...</span>
              </h2>
              <p className="text-2xl sm:text-4xl text-slate-500 italic font-medium animate-bounce">Almost ready to show you the magic!</p>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-10 sm:py-24 space-y-10 sm:space-y-16 animate-scale-in">
            <div className="text-8xl sm:text-[12rem] animate-bounce">🤕</div>
            <h2 className="text-4xl sm:text-7xl font-kids font-bold text-rose-600">Oops! The magic wand slipped.</h2>
            <div className="bg-rose-50 p-8 sm:p-14 rounded-[3rem] border-[6px] border-rose-100 max-w-4xl mx-auto">
              <p className="text-xl sm:text-4xl text-rose-900 font-kids leading-relaxed">
                {errorMessage}
              </p>
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
            <nav className="no-print flex justify-center bg-white/70 backdrop-blur-3xl p-4 sm:p-6 rounded-[3rem] sm:rounded-[4rem] shadow-2xl gap-3 sm:gap-10 overflow-x-auto scrollbar-hide border-4 border-white ring-8 ring-indigo-50/50 sticky top-24 sm:top-32 z-40 mx-2">
              {[
                { id: 'poem', label: '📜 Your Poem', color: 'indigo', icon: '✨' },
                { id: 'wordsearch', label: '🔍 WordSearch', color: 'emerald', icon: '🧩' },
                { id: 'coloring', label: '🎨 Coloring', color: 'pink', icon: '🖍️' },
                { id: 'game', label: '🎮 Magic Game', color: 'yellow', icon: '🕹️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { playChime(); setActiveTab(tab.id as any); }}
                  className={`flex-1 min-w-[170px] sm:min-w-[220px] px-8 sm:px-14 py-6 sm:py-10 rounded-[2rem] sm:rounded-[3rem] font-kids font-bold transition-all text-xl sm:text-4xl flex items-center justify-center gap-4
                    ${activeTab === tab.id 
                      ? `bg-${tab.color === 'yellow' ? 'yellow-500' : tab.color + '-600'} text-white shadow-[0_15px_40px_rgba(79,70,229,0.4)] scale-110 -rotate-1` 
                      : `text-${tab.color === 'yellow' ? 'amber-600' : tab.color + '-600'} hover:bg-${tab.color}-50 hover:scale-105`
                    }`}
                >
                  <span className="hidden sm:inline">{tab.icon}</span> {tab.label.split(' ').slice(1).join(' ')}
                </button>
              ))}
            </nav>

            <article className="bg-white rounded-[4rem] sm:rounded-[6rem] shadow-[0_50px_100px_rgba(0,0,0,0.12)] p-8 sm:p-24 relative overflow-hidden border-[8px] sm:border-[20px] border-white ring-[16px] sm:ring-[30px] ring-indigo-50/30">
              <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-indigo-100/50 rounded-full blur-[140px] animate-pulse"></div>
              <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-pink-100/50 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }}></div>

              <div className="relative z-10">
                {activeTab === 'poem' && (
                  <div className="text-center space-y-16 sm:space-y-28 animate-scale-in px-4">
                    <div className="space-y-8">
                      <div className="flex flex-col items-center gap-8">
                        <div className="text-8xl sm:text-[10rem] mb-6 animate-bounce">📜</div>
                        <div className="flex items-center justify-center gap-8">
                          <h2 className="text-5xl sm:text-9xl font-kids font-bold text-slate-800 drop-shadow-md leading-[1.2]">A Poem for <span className="text-indigo-600">{userData.name}</span></h2>
                          <button 
                            onClick={refreshPoemHandler}
                            disabled={isRefreshing}
                            className={`no-print p-5 sm:p-8 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-xl transition-all ${isRefreshing ? 'animate-spin opacity-50' : 'hover:scale-125 hover:rotate-180'}`}
                            title="Generate a new poem!"
                          >
                            <RefreshIcon />
                          </button>
                        </div>
                      </div>
                      <div className="w-40 h-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mx-auto rounded-full shadow-sm"></div>
                    </div>
                    {isRefreshing && activeTab === 'poem' ? (
                      <div className="flex flex-col items-center gap-14 py-16">
                        <div className="w-32 h-32 border-[12px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                        <p className="text-4xl font-kids font-bold text-slate-400">Brewing a new rhyme...</p>
                      </div>
                    ) : (
                      <div className="text-3xl sm:text-7xl md:text-8xl leading-[1.6] font-kids font-medium text-slate-700 whitespace-pre-wrap italic px-2 sm:px-24 animate-fade-in drop-shadow-sm tracking-tight">
                        {magicContent.poem}
                      </div>
                    )}
                    <div className="flex justify-center gap-16 text-8xl sm:text-[12rem]">
                      <span className="animate-bounce" style={{animationDelay: '0s'}}>🌈</span>
                      <span className="animate-bounce" style={{animationDelay: '0.2s'}}>⭐</span>
                      <span className="animate-bounce" style={{animationDelay: '0.4s'}}>✨</span>
                    </div>
                  </div>
                )}

                {activeTab === 'wordsearch' && wordSearchData && (
                  <div className="space-y-16 sm:space-y-32 animate-scale-in">
                    <div className="flex flex-col items-center gap-10">
                       <div className="text-8xl sm:text-[10rem] animate-spin-slow">🧩</div>
                      <div className="flex items-center justify-center gap-8">
                        <h2 className="text-5xl sm:text-9xl font-kids font-bold text-emerald-600 text-center drop-shadow-md">Hidden Magic</h2>
                        <button 
                          onClick={refreshWordSearchHandler}
                          disabled={isRefreshing}
                          className={`no-print p-5 sm:p-8 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-xl transition-all ${isRefreshing ? 'animate-spin opacity-50' : 'hover:scale-125 hover:rotate-180'}`}
                          title="Generate a new wordsearch!"
                        >
                          <RefreshIcon />
                        </button>
                      </div>
                      <div className="w-40 h-4 bg-emerald-400 mx-auto rounded-full shadow-sm"></div>
                    </div>
                    
                    {isRefreshing && activeTab === 'wordsearch' ? (
                      <div className="flex flex-col items-center gap-14 py-16">
                        <div className="w-32 h-32 border-[12px] border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="text-4xl font-kids font-bold text-slate-400">Shuffling magic letters...</p>
                      </div>
                    ) : (
                      <div className="flex justify-center animate-fade-in px-2">
                        <WordSearch data={wordSearchData} />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'coloring' && coloringUrl && (
                  <div className="space-y-16 sm:space-y-28 text-center animate-scale-in">
                    <div className="space-y-10 px-4">
                      <div className="text-8xl sm:text-[10rem] animate-pulse">🖍️</div>
                      <h2 className="text-5xl sm:text-9xl font-kids font-bold text-pink-600 drop-shadow-md leading-tight">Coloring Fun!</h2>
                      <p className="text-3xl sm:text-5xl text-slate-500 font-kids italic leading-relaxed">Your very own magic paper!</p>
                      <div className="w-40 h-4 bg-pink-400 mx-auto rounded-full shadow-sm"></div>
                    </div>
                    
                    <div className="bg-slate-50 p-6 sm:p-16 rounded-[4rem] sm:rounded-[6rem] border-[6px] sm:border-[12px] border-pink-100 shadow-inner">
                      <ColoringCanvas imageUrl={coloringUrl} />
                    </div>

                    <div className="no-print flex flex-col items-center gap-10">
                      <button
                        onClick={handlePrint}
                        className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-kids font-bold py-8 sm:py-16 px-16 sm:px-32 rounded-[3rem] sm:rounded-[4rem] shadow-[0_25px_60px_rgba(244,63,94,0.4)] flex items-center justify-center gap-8 mx-auto text-3xl sm:text-6xl transition transform hover:scale-110 active:scale-95 border-b-[10px] sm:border-b-[20px] border-rose-800"
                      >
                        🖨️ Print My Page
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'game' && (
                  <div className="space-y-16 sm:space-y-28 text-center animate-scale-in">
                    <div className="space-y-10 px-4">
                      <div className="text-8xl sm:text-[10rem] animate-bounce">🕹️</div>
                      <h2 className="text-5xl sm:text-9xl font-kids font-bold text-amber-600 drop-shadow-md leading-tight">Magic Sparkle Pop</h2>
                      <p className="text-3xl sm:text-5xl text-slate-500 font-kids italic">Catch the falling magic!</p>
                      <div className="w-40 h-4 bg-yellow-400 mx-auto rounded-full shadow-sm"></div>
                    </div>
                    
                    <MagicGame name={userData.name} favoriteColor={userData.favoriteColor} />
                  </div>
                )}
              </div>
            </article>

            <div className="no-print flex flex-col sm:flex-row justify-center gap-8 sm:gap-14 px-6 pt-16">
              <button
                onClick={handlePrint}
                className="flex-1 max-w-2xl bg-slate-900 text-white px-10 sm:px-20 py-10 sm:py-16 rounded-[3rem] sm:rounded-[4.5rem] font-kids font-bold shadow-[0_30px_70px_rgba(0,0,0,0.2)] hover:bg-black transition-all flex items-center justify-center gap-8 text-3xl sm:text-5xl transform hover:scale-110 active:scale-95 border-b-[12px] sm:border-b-[24px] border-slate-700"
              >
                🖨️ Print My Book!
              </button>
              <button
                onClick={handleShare}
                className="flex-1 max-w-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 sm:px-20 py-10 sm:py-16 rounded-[3rem] sm:rounded-[4.5rem] font-kids font-bold shadow-[0_30px_70px_rgba(79,70,229,0.3)] hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-8 text-3xl sm:text-5xl transform hover:scale-110 active:scale-95 border-b-[12px] sm:border-b-[24px] border-indigo-800"
              >
                <ShareIcon /> Share Magic!
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="no-print fixed bottom-0 w-full bg-gradient-to-t from-sky-200/50 to-transparent pt-40 pb-20 pointer-events-none z-0">
        <div className="max-w-7xl mx-auto px-10 flex justify-between text-7xl sm:text-[14rem] opacity-30 select-none">
          <span className="animate-float-slow">🎈</span>
          <span className="hidden sm:inline animate-float">🪁</span>
          <span className="animate-float-fast">🎨</span>
          <span className="hidden sm:inline animate-float-slow">🚀</span>
          <span className="animate-float">🍦</span>
          <span className="animate-float-fast">🦖</span>
        </div>
      </footer>

      <div className="print-only hidden p-10 space-y-24 bg-white">
        <div className="text-center border-b-[16px] border-indigo-100 pb-20 flex flex-col items-center gap-10">
          <div className="bg-indigo-50 p-6 rounded-full border-4 border-indigo-200">
            <GirlLogo className="w-56 h-56" animated={false} />
          </div>
          <h1 className="text-8xl font-kids font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Ayla Bayla: {userData.name}'s Magic Book
          </h1>
          <p className="text-5xl italic text-slate-500 font-kids">Handcrafted magic just for you ✨</p>
        </div>
        
        {magicContent && (
          <div className="text-center py-24 page-break">
            <h2 className="text-7xl font-kids font-bold mb-20 text-indigo-600 underline decoration-indigo-100 underline-offset-8">My Special Poem</h2>
            <div className="text-6xl font-kids italic leading-loose whitespace-pre-wrap max-w-5xl mx-auto text-slate-800">
              {magicContent.poem}
            </div>
            <div className="mt-20 text-9xl">✨🌈✨</div>
          </div>
        )}

        {wordSearchData && (
          <div className="page-break py-24">
            <h2 className="text-7xl font-kids font-bold mb-20 text-center text-emerald-600 underline decoration-emerald-100 underline-offset-8">Word Search Challenge</h2>
            <div className="grid border-[12px] border-slate-900 mb-20 mx-auto bg-white p-4" style={{ gridTemplateColumns: `repeat(${wordSearchData.grid.length}, 1fr)`, width: '900px' }}>
              {wordSearchData.grid.map((row, r) => 
                row.map((char, c) => (
                  <div key={`${r}-${c}`} className="w-16 h-16 border border-slate-200 flex items-center justify-center font-bold text-5xl text-slate-800 font-mono">
                    {char}
                  </div>
                ))
              )}
            </div>
            <div className="bg-emerald-50 p-12 rounded-[3rem] border-4 border-emerald-100">
              <h3 className="text-5xl font-kids font-bold text-emerald-700 mb-10 text-center">Words to Find:</h3>
              <div className="flex flex-wrap gap-x-20 gap-y-12 justify-center max-w-6xl mx-auto">
                {wordSearchData.words.map(w => (
                  <span key={w} className="text-5xl border-b-[8px] border-emerald-200 px-6 uppercase font-bold text-slate-800 tracking-[0.2em]">{w}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {coloringUrl && (
          <div className="page-break py-24 text-center">
            <h2 className="text-7xl font-kids font-bold mb-20 text-pink-600 underline decoration-pink-100 underline-offset-8">My Magic Coloring Page</h2>
            <div className="border-[12px] border-slate-900 p-12 rounded-[4rem] bg-white shadow-xl">
               <img src={coloringUrl} alt="Coloring Page" className="w-full max-w-6xl mx-auto" />
            </div>
            <p className="mt-12 text-5xl font-kids text-slate-400 italic">Hand-drawn with magic by Ayla Bayla ✨</p>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-40px); }
        }
        @keyframes magic-float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
          25% { opacity: 0.8; }
          50% { transform: translateY(-70px) rotate(180deg); opacity: 1; }
          75% { opacity: 0.8; }
          100% { transform: translateY(-140px) rotate(360deg); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-magic-float { animation: magic-float 6s ease-in-out infinite; }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-float-slow { animation: float 8s ease-in-out infinite; }
        .animate-float-fast { animation: float 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        
        @keyframes scale-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        
        @keyframes fade-in-up {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-fade-in { animation: fade-in-up 0.7s ease-out forwards; }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .page-break { page-break-before: always; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};

export default App;
