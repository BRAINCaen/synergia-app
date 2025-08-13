// ==========================================
// 📁 react-app/src/pages/NotFoundPage.jsx
// PAGE 404 SIMPLE POUR ÉVITER LES ERREURS DE BUILD
// ==========================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

/**
 * 🚫 PAGE 404 - VERSION SIMPLE SANS ERREURS
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        {/* Grande icône 404 */}
        <div className="text-9xl font-bold text-white/20 mb-4">
          404
        </div>
        
        {/* Titre et description */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Page introuvable
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-md">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Retour au Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Page précédente
          </button>
        </div>
        
        {/* Informations utiles */}
        <div className="mt-12 text-sm text-gray-400">
          <p>Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
