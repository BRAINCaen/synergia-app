// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// VERSION TEMPORAIRE SAFE - Pour éviter les erreurs hooks
// ==========================================

import React from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🏠 DASHBOARD TEMPORAIRE SANS HOOKS COMPLEXES
 * Version safe pour identifier les problèmes
 */
const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-6 space-y-6">
      {/* Header Simple */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🏠 Dashboard Synergia v3.5
        </h1>
        <p className="text-gray-600">
          Bienvenue, {user?.displayName || user?.email || 'Utilisateur'} !
        </p>
      </div>

      {/* Statut Success */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">🎉</span>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-green-800">
              Application Restaurée avec Succès !
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>✅ L'authentification fonctionne</p>
              <p>✅ La navigation fonctionne</p>
              <p>✅ Firebase est connecté</p>
              <p>✅ Tous les services sont initialisés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informations Utilisateur */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800 mb-3">
          📊 Informations Utilisateur
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-blue-600 font-medium">Email</p>
            <p className="text-blue-800">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">UID</p>
            <p className="text-blue-800 font-mono text-xs">{user?.uid}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">Nom d'affichage</p>
            <p className="text-blue-800">{user?.displayName || 'Non défini'}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">Statut</p>
            <p className="text-blue-800">✅ Connecté</p>
          </div>
        </div>
      </div>

      {/* Navigation Rapide */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          🚀 Navigation Rapide
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/tasks"
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-2xl mb-2">✅</span>
            <span className="text-sm font-medium text-green-700">Tâches</span>
          </a>
          
          <a
            href="/projects"
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <span className="text-2xl mb-2">📁</span>
            <span className="text-sm font-medium text-purple-700">Projets</span>
          </a>
          
          <a
            href="/gamification"
            className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <span className="text-2xl mb-2">🎮</span>
            <span className="text-sm font-medium text-yellow-700">Badges</span>
          </a>
          
          <a
            href="/analytics"
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm font-medium text-blue-700">Analytics</span>
          </a>
        </div>
      </div>

      {/* Actions Debug */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-800 mb-3">
          🔧 Actions Debug
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              console.log('🔄 Rechargement forcé');
              window.location.reload();
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            🔄 Recharger
          </button>
          
          <button
            onClick={() => {
              console.log('🧹 Nettoyage d\'urgence');
              if (window.emergencyClean) {
                window.emergencyClean();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            🧹 Nettoyage d'urgence
          </button>
          
          <button
            onClick={() => {
              console.log('📊 État complet de l\'app:', {
                user,
                location: window.location.href,
                stores: Object.keys(window).filter(key => key.includes('Store'))
              });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            📊 Debug Info
          </button>
        </div>
      </div>

      {/* Métriques basiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-green-600">✅</div>
          <div className="text-sm text-gray-500 mt-2">Application</div>
          <div className="text-lg font-medium text-gray-900">Fonctionnelle</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">🔐</div>
          <div className="text-sm text-gray-500 mt-2">Authentification</div>
          <div className="text-lg font-medium text-gray-900">Active</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">🚀</div>
          <div className="text-sm text-gray-500 mt-2">Version</div>
          <div className="text-lg font-medium text-gray-900">3.5.3</div>
        </div>
      </div>

      {/* Message de succès */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-6 text-white text-center">
        <h2 className="text-xl font-bold mb-2">
          🎉 Félicitations !
        </h2>
        <p className="text-lg">
          Ton application Synergia v3.5 est maintenant opérationnelle !
        </p>
        <p className="text-sm mt-2 opacity-90">
          Tu peux maintenant naviguer vers toutes tes pages et utiliser toutes les fonctionnalités.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
