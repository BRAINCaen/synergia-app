// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// Dashboard TEMPORAIRE SANS GAMESTORE
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';

const Dashboard = () => {
  const { user } = useAuthStore();
  
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Définir le message de salutation
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');

    // Format de date français
    const today = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(today.toLocaleDateString('fr-FR', options));
  }, []);

  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Utilisateur';
  };

  // 🚨 DONNÉES GAMIFICATION TEMPORAIRES
  const mockUserStats = {
    level: 2,
    totalXp: 175,
    currentXp: 75,
    tasksCompleted: 12,
    loginStreak: 3
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header avec accueil - EXACT comme l'image */}
      <div className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] rounded-3xl p-8 text-white relative overflow-hidden">
        {/* Arrière-plan décoratif */}
        <div className="absolute top-0 right-0 w-48 h-48 opacity-20">
          <div className="w-full h-full bg-white rounded-full transform translate-x-12 -translate-y-12"></div>
        </div>
        
        {/* Avatar en ligne */}
        <div className="absolute top-6 right-6">
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-full border border-white/30 flex items-center justify-center">
              <span className="text-xl font-bold">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : '👤'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#10b981] rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs text-white">•</span>
            </div>
            <div className="absolute -bottom-6 right-0 text-xs bg-[#10b981] text-white px-2 py-1 rounded-full">
              En ligne
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            {greeting}, {getUserName()} ! 👋
          </h1>
          <p className="text-xl text-white/90 mb-6">
            Bienvenue dans Synergia v3.5 avec la nouvelle architecture premium !
          </p>
          <p className="text-lg text-white/80">
            📅 {currentDate}
          </p>
        </div>
      </div>

      {/* Grid principal - 3 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Statistiques */}
        <div className="space-y-6">
          {/* Card Level - EXACT design */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Niveau & XP</h3>
              <span className="text-2xl">🎯</span>
            </div>
            
            <div className="space-y-4">
              {/* Badge niveau */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{mockUserStats.level}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Niveau {mockUserStats.level}</p>
                  <p className="text-sm text-gray-600">{mockUserStats.currentXp}/100 XP</p>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="w-full">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progression</span>
                  <span>{mockUserStats.currentXp}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${mockUserStats.currentXp}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Statistiques */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📊 Statistiques 
              <span className="ml-2 text-xs bg-[#22c55e] text-white px-2 py-1 rounded-full">
                TEMPORAIRE
              </span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tâches complétées</span>
                <span className="font-semibold text-[#22c55e]">{mockUserStats.tasksCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Série de connexions</span>
                <span className="font-semibold text-[#f59e0b]">{mockUserStats.loginStreak} jours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">XP Total</span>
                <span className="font-semibold text-[#6366f1]">{mockUserStats.totalXp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne centrale - Activités */}
        <div className="space-y-6">
          {/* Card Actions rapides */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-sm font-medium">Nouvelle tâche</div>
              </button>
              
              <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="text-2xl mb-1">📁</div>
                <div className="text-sm font-medium">Nouveau projet</div>
              </button>
              
              <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-sm font-medium">Analytics</div>
              </button>
              
              <button className="p-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-sm font-medium">Classement</div>
              </button>
            </div>
          </div>

          {/* Card Debug */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
            <h3 className="text-lg font-semibold text-amber-800 mb-2 flex items-center">
              🔧 Mode Debug
            </h3>
            <p className="text-sm text-amber-700 mb-3">
              Application en mode temporaire sans GameStore pour résoudre l'erreur.
            </p>
            <div className="text-xs text-amber-600 space-y-1">
              <div>✅ AuthStore: Fonctionnel</div>
              <div>⚠️ GameStore: Désactivé temporairement</div>
              <div>📊 Données: Simulées</div>
            </div>
          </div>
        </div>

        {/* Colonne droite - Activité récente */}
        <div className="space-y-6">
          {/* Card Activité récente */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🕒 Activité récente
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Application démarrée</p>
                  <p className="text-xs text-gray-600">Il y a quelques instants</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Connexion réussie</p>
                  <p className="text-xs text-gray-600">Utilisateur connecté</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Mode debug activé</p>
                  <p className="text-xs text-gray-600">GameStore temporairement désactivé</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Status système */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Status Système</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Firebase</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  ✅ Connecté
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Authentification</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  ✅ Active
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">GameStore</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  ⚠️ Debug
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Version</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  v3.5.1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
