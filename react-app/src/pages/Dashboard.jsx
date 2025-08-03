// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD SIMPLIFIÉ POUR DÉBOGAGE
// ==========================================

import React from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🎯 DASHBOARD ULTRA-SIMPLIFIÉ POUR TESTER L'AFFICHAGE
 */
const Dashboard = () => {
  const { user } = useAuthStore();

  console.log('🎯 Dashboard rendu, utilisateur:', user?.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header simple */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏠 Dashboard Synergia
          </h1>
          <p className="text-gray-400 text-lg">
            Bienvenue {user?.displayName || user?.email || 'Utilisateur'}
          </p>
        </div>

        {/* Contenu de test */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Carte de test 1 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tâches</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          {/* Carte de test 2 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Projets</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
              <div className="text-3xl">📁</div>
            </div>
          </div>

          {/* Carte de test 3 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">XP Total</p>
                <p className="text-2xl font-bold text-white">1,250</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>

          {/* Carte de test 4 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Niveau</p>
                <p className="text-2xl font-bold text-white">7</p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </div>
        </div>

        {/* Section principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Activités récentes */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">📈 Activités Récentes</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                <span className="text-green-400">✅</span>
                <span className="text-gray-300">Tâche "Setup environnement" complétée</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                <span className="text-blue-400">📁</span>
                <span className="text-gray-300">Nouveau projet "Site Web" créé</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                <span className="text-yellow-400">🏆</span>
                <span className="text-gray-300">Badge "Productif" obtenu</span>
              </div>
            </div>
          </div>

          {/* Progression */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">🎯 Progression</h3>
            
            {/* Barre de progression */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Niveau 7</span>
                <span>1,250 / 2,000 XP</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300" 
                     style={{ width: '62.5%' }}>
                </div>
              </div>
            </div>

            {/* Objectifs */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <span className="text-gray-300 text-sm">Compléter 10 tâches</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">🔄</span>
                <span className="text-gray-300 text-sm">Participer à 3 projets</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">⏳</span>
                <span className="text-gray-300 text-sm">Obtenir 5 badges</span>
              </div>
            </div>
          </div>
        </div>

        {/* Raccourcis d'actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-transform">
            ➕ Nouvelle Tâche
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:scale-105 transition-transform">
            📁 Nouveau Projet
          </button>
          <button className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors">
            📊 Voir Analytics
          </button>
        </div>

        {/* Debug info */}
        <div className="mt-8 bg-gray-800/30 border border-gray-600 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">🔧 Debug Info</h4>
          <div className="text-sm text-gray-400 space-y-1">
            <p>✅ Dashboard rendu avec succès</p>
            <p>👤 Utilisateur: {user?.email}</p>
            <p>🕒 Temps: {new Date().toLocaleTimeString()}</p>
            <p>🌐 URL: {window.location.pathname}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// ==========================================
// 📋 LOGS DE DEBUG
// ==========================================
console.log('✅ Dashboard simplifié chargé');
console.log('🎯 Version de test pour débogage d\'affichage');
console.log('🔧 Sans dépendances PremiumLayout');
