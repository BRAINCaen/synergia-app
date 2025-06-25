// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// Dashboard EXACT design Synergia v3.5
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { userStats } = useGameStore();
  
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
            Bienvenue dans Synergia v3.5 avec la nouvelle architecture premium ! 🚀
          </p>
          
          {/* Stats en ligne */}
          <div className="flex items-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <span>📅</span>
              <span className="text-white/90">{currentDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🎯</span>
              <span className="text-white/90">Niveau {userStats?.level || 2}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>⭐</span>
              <span className="text-white/90">{userStats?.totalXp || 175} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards - EXACT comme l'image */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* STATUT */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[#a5b4fc] text-sm uppercase tracking-wide mb-2">STATUT</p>
              <p className="text-2xl font-bold text-[#10b981]">Actif</p>
            </div>
            <div className="w-12 h-12 bg-[#10b981]/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        {/* NIVEAU */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[#a5b4fc] text-sm uppercase tracking-wide mb-2">NIVEAU</p>
              <p className="text-2xl font-bold text-[#6366f1]">{userStats?.level || 2}</p>
            </div>
            <div className="w-12 h-12 bg-[#6366f1]/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        {/* EXPÉRIENCE */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[#a5b4fc] text-sm uppercase tracking-wide mb-2">EXPÉRIENCE</p>
              <p className="text-2xl font-bold text-[#8b5cf6]">{userStats?.totalXp || 175} XP</p>
            </div>
            <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections principales - EXACT comme l'image */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Architecture Modulaire */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center">
              <span className="text-xl">🏗</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Architecture Premium</h3>
              <p className="text-[#a5b4fc] text-sm">Fondations solides pour l'évolution</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-[#10b981] text-lg">✓</span>
              <span className="text-[#a5b4fc]">Services d'authentification optimisés</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[#10b981] text-lg">✓</span>
              <span className="text-[#a5b4fc]">Interface utilisateur moderne</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[#f59e0b] text-lg">⏳</span>
              <span className="text-[#a5b4fc]">Modules avancés en développement</span>
            </div>
          </div>
        </div>

        {/* Roadmap 2025 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ec4899] to-[#be185d] rounded-xl flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Roadmap 2025</h3>
              <p className="text-[#a5b4fc] text-sm">Prochaines fonctionnalités</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#a5b4fc]">Phase 1 - Architecture</span>
              <span className="px-3 py-1 bg-[#10b981] text-white text-xs rounded-full font-medium">
                Terminé
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a5b4fc]">Phase 2 - Gamification</span>
              <span className="px-3 py-1 bg-[#6366f1] text-white text-xs rounded-full font-medium">
                En cours
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a5b4fc]">Phase 3 - Collaboration</span>
              <span className="px-3 py-1 bg-[#6b7280] text-white text-xs rounded-full font-medium">
                Planifiée
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules en Développement - EXACT comme l'image */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-2xl">🚀</span>
          <h2 className="text-2xl font-bold text-white">Modules en Développement</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gamification */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#8b5cf6] to-[#a855f7] rounded-2xl flex items-center justify-center mb-3">
                <span className="text-2xl">🎮</span>
              </div>
              <h4 className="font-bold text-white mb-1">Gamification</h4>
              <p className="text-[#a5b4fc] text-xs mb-3">Points, badges, niveaux</p>
              
              {/* Barre de progression */}
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-[#a5b4fc] mb-3">75%</p>
              
              <span className="px-3 py-1 bg-[#6366f1] text-white text-xs rounded-full font-medium">
                En développement
              </span>
            </div>
          </div>

          {/* Pointage */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-2xl flex items-center justify-center mb-3">
                <span className="text-2xl">⏰</span>
              </div>
              <h4 className="font-bold text-white mb-1">Pointage</h4>
              <p className="text-[#a5b4fc] text-xs mb-3">Gestion du temps</p>
              
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-xs text-[#a5b4fc] mb-3">0%</p>
              
              <span className="px-3 py-1 bg-[#6b7280] text-white text-xs rounded-full font-medium">
                Planifié
              </span>
            </div>
          </div>

          {/* Messagerie */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl flex items-center justify-center mb-3">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="font-bold text-white mb-1">Messagerie</h4>
              <p className="text-[#a5b4fc] text-xs mb-3">Chat d'équipe</p>
              
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-xs text-[#a5b4fc] mb-3">0%</p>
              
              <span className="px-3 py-1 bg-[#6b7280] text-white text-xs rounded-full font-medium">
                Planifié
              </span>
            </div>
          </div>

          {/* Boutique */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl flex items-center justify-center mb-3">
                <span className="text-2xl">🛒</span>
              </div>
              <h4 className="font-bold text-white mb-1">Boutique</h4>
              <p className="text-[#a5b4fc] text-xs mb-3">Récompenses</p>
              
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-[#10b981] to-[#059669] h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-xs text-[#a5b4fc] mb-3">0%</p>
              
              <span className="px-3 py-1 bg-[#6b7280] text-white text-xs rounded-full font-medium">
                Planifié
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Annonce finale - EXACT comme l'image */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-2xl">🎉</span>
          <h2 className="text-2xl font-bold text-white">Synergia v3.5 est maintenant en ligne !</h2>
        </div>
        
        <p className="text-[#a5b4fc] text-lg mb-6">
          Architecture premium déployée avec succès. Les prochaines fonctionnalités arriveront progressivement.
        </p>
        
        <div className="flex items-center justify-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <span>✨</span>
            <span className="text-[#a5b4fc]">Interface moderne</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🔧</span>
            <span className="text-[#a5b4fc]">Architecture évolutive</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🚀</span>
            <span className="text-[#a5b4fc]">Prêt pour la gamification</span>
          </div>
        </div>

        {/* Bouton d'installation PWA */}
        <div className="mt-6">
          <button className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold rounded-xl hover:from-[#5856eb] hover:to-[#7c3aed] transition-all duration-200 shadow-lg flex items-center space-x-2 mx-auto">
            <span>📱</span>
            <span>Installer l'app</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
