// ==========================================
// 📁 react-app/src/shared/components/ui/LoadingScreen.jsx
// Écran de chargement premium avec animations
// ==========================================

import React from 'react';

/**
 * 🌟 ÉCRAN DE CHARGEMENT PREMIUM
 */
const LoadingScreen = ({ message = "Chargement...", subtitle = null }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-blue-900/90 to-purple-900/90"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      
      {/* Contenu du loading */}
      <div className="relative z-10 text-center">
        {/* Logo/Icône */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-2xl animate-pulse">
            ⚡
          </div>
        </div>
        
        {/* Titre */}
        <h1 className="text-4xl font-bold text-white mb-2">
          Synergia
          <span className="ml-3 px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            v4.1.0
          </span>
        </h1>
        
        {/* Sous-titre */}
        <p className="text-xl text-blue-200 mb-8">
          {subtitle || "Collaboration & Gamification"}
        </p>
        
        {/* Animation de chargement */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Message de chargement */}
        <p className="text-blue-300 text-sm animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
