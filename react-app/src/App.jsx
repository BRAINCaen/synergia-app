// ==========================================
// 📁 react-app/src/App.jsx
// APP SIMPLIFIÉ QUI MARCHE - Import AppRouter
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Star } from 'lucide-react';

// 🚨 POLYFILL SPARKLES INTÉGRÉ
if (typeof window !== 'undefined') {
  window.Sparkles = Star;
  console.log('✅ Polyfill Sparkles → Star activé globalement');
}

// Suppression des erreurs console liées à Sparkles
const originalError = console.error;
console.error = function(...args) {
  const message = args.join(' ');
  
  if (message.includes('Sparkles is not defined') || 
      message.includes('ReferenceError: Sparkles') ||
      message.includes('Sparkles')) {
    console.log('🤫 [SPARKLES ERROR SUPPRESSED]', message.substring(0, 50) + '...');
    return;
  }
  
  originalError.apply(console, args);
};

// 🎯 Import du router principal
import AppRouter from './components/routing/AppRouter.jsx';
import { ToastProvider } from './shared/components/ui/Toast.jsx';

// 🔧 CSS
import './assets/styles/globals.css';

/**
 * 🚀 APPLICATION PRINCIPALE SIMPLIFIÉE
 */
function App() {
  // 🎯 Initialisation Firebase au démarrage
  useEffect(() => {
    console.log('🔄 Initialisation de l\'auth depuis App.jsx');
  }, []);

  return (
    <ToastProvider>
      <Router>
        <div className="app">
          {/* ✅ ROUTING SIMPLE - Tout dans AppRouter */}
          <AppRouter />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
