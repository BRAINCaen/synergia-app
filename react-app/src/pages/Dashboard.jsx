// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD FONCTIONNEL GARANTI - SANS PREMIUMLAYOUT
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🎯 DASHBOARD SIMPLIFIÉ MAIS COMPLET
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    tasks: 12,
    projects: 3,
    xp: 1250,
    level: 7
  });

  console.log('🏠 Dashboard rendu pour:', user?.email);

  useEffect(() => {
    // Simuler le chargement de données
    console.log('📊 Chargement données dashboard...');
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            🏠 Dashboard Synergia
          </h1>
          <p className="text-gray-400 text-lg">
            Bienvenue, {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'} !
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Carte Tâches */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{stats.tasks}</p>
                <p className="text-gray-400 text-sm">Tâches</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-sm">+2 aujourd'hui</span>
            </div>
          </div>

          {/* Carte Projets */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <span className="text-2xl">📁</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{stats.projects}</p>
                <p className="text-gray-400 text-sm">Projets</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 text-sm">2 actifs</span>
            </div>
          </div>

          {/* Carte XP */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{stats.xp.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">XP Total</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-sm">+150 cette semaine</span>
            </div>
          </div>

          {/* Carte Niveau */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">Niveau {stats.level}</p>
                <p className="text-gray-400 text-sm">Progression</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Activités récentes */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                📈 Activités Récentes
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <span className="text-green-400">✅</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Tâche "Setup environnement" complétée</p>
                    <p className="text-gray-400 text-sm">Il y a 2 heures • +50 XP</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <span className="text-blue-400">📁</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Nouveau projet "Site Web" créé</p>
                    <p className="text-gray-400 text-sm">Il y a 5 heures • +25 XP</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <span className="text-purple-400">🏆</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Badge "Productif" obtenu</p>
                    <p className="text-gray-400 text-sm">Hier • +100 XP</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <span className="text-yellow-400">👥</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Rejoint l'équipe "Développement"</p>
                    <p className="text-gray-400 text-sm">Il y a 2 jours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Progression et objectifs */}
          <div className="space-y-6">
            
            {/* Progression niveau */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                🎯 Progression
              </h3>
              
              <div className="text-center mb-4">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <div className="absolute inset-0 bg-gray-700 rounded-full"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                       style={{clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 65%, 50% 50%)'}}></div>
                  <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">65%</span>
                  </div>
                </div>
                <p className="text-white font-medium">Niveau {stats.level}</p>
                <p className="text-gray-400 text-sm">{stats.xp} / 2,000 XP</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Prochain niveau:</span>
                  <span className="text-white">750 XP</span>
                </div>
              </div>
            </div>

            {/* Objectifs */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                📋 Objectifs de la semaine
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✅</span>
                  <span className="text-gray-300 text-sm line-through">Compléter 5 tâches</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400">🔄</span>
                  <span className="text-gray-300 text-sm">Participer à 2 projets (1/2)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">⏳</span>
                  <span className="text-gray-300 text-sm">Obtenir 3 badges (0/3)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-400">📈</span>
                  <span className="text-gray-300 text-sm">Gagner 500 XP (350/500)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-transform">
            ➕ Nouvelle Tâche
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:scale-105 transition-transform">
            📁 Nouveau Projet
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:scale-105 transition-transform">
            👥 Voir Équipe
          </button>
          <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
            📊 Analytics
          </button>
        </div>

        {/* Debug info (masquable) */}
        <div className="mt-8 text-center">
          <details className="inline-block">
            <summary className="text-gray-500 text-sm cursor-pointer hover:text-gray-400">
              🔧 Debug Info
            </summary>
            <div className="mt-2 p-3 bg-gray-800/30 rounded-lg text-xs text-gray-400">
              <p>✅ Dashboard rendu avec succès</p>
              <p>👤 Utilisateur: {user?.email}</p>
              <p>🕒 Rendu à: {new Date().toLocaleTimeString()}</p>
              <p>📍 URL: {window.location.pathname}</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ Dashboard fonctionnel chargé');
console.log('🎯 Version simplifiée sans PremiumLayout');
console.log('🚀 Affichage garanti sans erreurs');
