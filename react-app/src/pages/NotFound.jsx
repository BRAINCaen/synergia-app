// ==========================================
// 📁 react-app/src/pages/NotFound.jsx
// PAGE 404 - VERSION PROPRE ET CORRIGÉE
// ==========================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Mail } from 'lucide-react';

/**
 * 🚫 PAGE 404 - NOT FOUND
 */
const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto p-8">
        
        {/* Animation 404 */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-8xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text animate-pulse">
              404
            </h1>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-ping"></div>
          </div>
        </div>

        {/* Message principal */}
        <h2 className="text-3xl font-bold text-white mb-4">
          Page non trouvée
        </h2>
        
        <p className="text-gray-400 text-lg mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Suggestions d'actions */}
        <div className="space-y-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Que faire maintenant ?</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Vérifiez l'URL dans la barre d'adresse</li>
              <li>• Retournez à la page précédente</li>
              <li>• Visitez notre tableau de bord</li>
            </ul>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            <Home className="w-4 h-4" />
            Tableau de Bord
          </button>
          
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Page Précédente
          </button>
        </div>

        {/* Liens rapides */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <h4 className="text-white font-medium mb-4">Liens Rapides</h4>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/tasks')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Tâches
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Projets
            </button>
            <button
              onClick={() => navigate('/team')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Équipe
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-medium">Besoin d'aide ?</span>
          </div>
          <p className="text-blue-200 text-sm">
            Si vous pensez qu'il s'agit d'une erreur, contactez le support technique.
          </p>
        </div>

        {/* Info technique (mode dev) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-gray-800 rounded-lg text-left">
            <h5 className="text-yellow-400 font-medium text-sm mb-2">🔧 Info Développeur</h5>
            <div className="text-gray-400 text-xs space-y-1">
              <p>URL: {window.location.pathname}</p>
              <p>Timestamp: {new Date().toISOString()}</p>
              <p>User Agent: {navigator.userAgent.slice(0, 50)}...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;
