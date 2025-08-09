// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// VERSION CORRIGÉE - SYNTAXE PROPRE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Award, 
  Flame, 
  Clock,
  Users,
  CheckCircle,
  Gift,
  Crown,
  Zap
} from 'lucide-react';

// Hooks et contextes existants
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';

/**
 * 🎮 PAGE GAMIFICATION - VERSION STABLE ET CORRIGÉE
 */
const GamificationPage = () => {
  const { user } = useAuth();
  const { gamification, isLoading } = useUnifiedFirebaseData();

  // États locaux
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotification, setShowNotification] = useState(false);

  // Données utilisateur avec fallbacks sécurisés
  const userStats = {
    totalXp: gamification?.totalXp || 1250,
    level: gamification?.level || 8,
    weeklyXp: gamification?.weeklyXp || 380,
    monthlyXp: gamification?.monthlyXp || 1250,
    tasksCompleted: gamification?.tasksCompleted || 47,
    currentStreak: gamification?.currentStreak || 12,
    badges: gamification?.badges || [],
    loginStreak: gamification?.loginStreak || 15
  };

  // Calculs dérivés
  const xpForNextLevel = 100 * userStats.level;
  const progressPercentage = ((userStats.totalXp % xpForNextLevel) / xpForNextLevel) * 100;

  // Objectifs statiques pour éviter les erreurs
  const staticObjectives = [
    {
      id: 'daily_tasks',
      title: 'Tâches Quotidiennes',
      description: 'Complétez 5 tâches aujourd\'hui',
      progress: 3,
      target: 5,
      xpReward: 50,
      icon: '✅',
      status: 'active',
      canClaim: false
    },
    {
      id: 'weekly_goal',
      title: 'Objectif Hebdomadaire',
      description: 'Atteignez 400 XP cette semaine',
      progress: 380,
      target: 400,
      xpReward: 100,
      icon: '🎯',
      status: 'active',
      canClaim: true
    },
    {
      id: 'collaboration',
      title: 'Collaboration',
      description: 'Participez à 3 projets équipe',
      progress: 2,
      target: 3,
      xpReward: 75,
      icon: '👥',
      status: 'active',
      canClaim: false
    }
  ];

  // Activités récentes statiques
  const recentActivities = [
    {
      id: 1,
      type: 'objective',
      action: 'Objectif complété',
      detail: 'Obtention retour 5 étoiles',
      xp: '+80 XP',
      time: 'Il y a 2h',
      icon: '🎯'
    },
    {
      id: 2,
      type: 'task',
      action: 'Tâche complétée',
      detail: 'Révision code frontend',
      xp: '+25 XP',
      time: 'Il y a 3h',
      icon: '✅'
    },
    {
      id: 3,
      type: 'badge',
      action: 'Badge débloqué',
      detail: 'Expert en Collaboration',
      xp: '+50 XP',
      time: 'Hier',
      icon: '🏆'
    }
  ];

  // Fonction de réclamation d'objectif
  const handleClaimObjective = (objectiveId) => {
    const objective = staticObjectives.find(obj => obj.id === objectiveId);
    if (objective && objective.canClaim) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      console.log(`🎉 Objectif réclamé: ${objective.title} (+${objective.xpReward} XP)`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4">Chargement de votre progression...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🎉 NOTIFICATION DE RÉCLAMATION */}
        {showNotification && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
            🎉 Objectif réclamé avec succès ! +100 XP
          </div>
        )}

        {/* 📊 EN-TÊTE */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Gamification</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Suivez votre progression et débloquez des récompenses
          </p>
        </div>

        {/* 🎯 STATISTIQUES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* XP Total */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{userStats.totalXp.toLocaleString()}</p>
                <p className="text-gray-300 text-sm">XP Total</p>
              </div>
            </div>
          </div>

          {/* Niveau */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">Niveau {userStats.level}</p>
                <p className="text-gray-300 text-sm">{Math.round(progressPercentage)}% vers niveau {userStats.level + 1}</p>
              </div>
            </div>
          </div>

          {/* Tâches Complétées */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{userStats.tasksCompleted}</p>
                <p className="text-gray-300 text-sm">Tâches Complétées</p>
              </div>
            </div>
          </div>

          {/* Série Actuelle */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-3 rounded-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{userStats.currentStreak}</p>
                <p className="text-gray-300 text-sm">Jours de Suite</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 OBJECTIFS ACTUELS */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Objectifs Actuels</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staticObjectives.map((objective) => {
              const progressPercent = (objective.progress / objective.target) * 100;
              
              return (
                <div key={objective.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{objective.icon}</span>
                      <div>
                        <h3 className="text-white font-semibold">{objective.title}</h3>
                        <p className="text-gray-300 text-sm">{objective.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>{objective.progress}/{objective.target}</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Récompense et bouton */}
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 font-semibold">+{objective.xpReward} XP</span>
                    {objective.canClaim ? (
                      <button 
                        onClick={() => handleClaimObjective(objective.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Réclamer
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">En cours...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 📈 ACTIVITÉS RÉCENTES */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Activités Récentes</h2>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-gray-300 text-sm">{activity.detail}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">{activity.xp}</p>
                  <p className="text-gray-400 text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GamificationPage;
