// ==========================================
// 📁 react-app/src/components/ui/Loading.jsx
// Composant de chargement réutilisable
// ==========================================

import React from 'react';

const Loading = ({ message = "Chargement...", fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            {/* Spinner principal */}
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto"></div>
            
            {/* Logo Synergia au centre */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
            </div>
          </div>
          
          {/* Message de chargement */}
          <p className="text-white mt-6 text-lg">{message}</p>
          
          {/* Barre de progression animée */}
          <div className="mt-4 w-64 mx-auto">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
          
          {/* Points de chargement */}
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-400 mt-4">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
