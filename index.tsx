
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Ayla Bayla magic is starting...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("CRITICAL: Root element not found in index.html");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Ayla Bayla magic initialized successfully!");
  } catch (error) {
    console.error("Magic failed to load:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: 'Fredoka', sans-serif; text-align: center; background: #fff1f2; color: #9f1239; border: 4px solid #fda4af; border-radius: 20px; margin: 20px;">
        <h2 style="font-size: 2rem;">Oops! The Magic Wand Slipped.</h2>
        <p style="font-size: 1.2rem;">We couldn't start the app. Please refresh or check the console for clues!</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; border-radius: 10px; background: #e11d48; color: white; border: none; cursor: pointer;">Try Again 🪄</button>
      </div>
    `;
  }
}
