// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// PAGE GAMIFICATION STABLE - VERSION RESTAURÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Award,
  Flame,
  TrendingUp,
  Target,
  Activity,
  CheckCircle,
  Gift,
  Crown,
  Zap,
  Calendar,
  BarChart3
} from 'lucide-react';
import PremiumLayout from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';

const GamificationPage = () => {
  const { user } = useAuthStore();
  const { userStats, addXP, initializeGameStore } = useGameStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [claimedGoals, setClaimedGoals] = useState(new Set());

  useEffect(() => {
    if (user?.uid) {
      initializeGameStore(user.uid);
    }
  }, [user, initializeGameStore]);

  // Données statistiques par défaut si pas encore chargées
  const defaultStats = {
    totalXp: 0,
    level: 1,
    badges: [],
    tasksCompleted: 0,
    loginStreak: 0,
    nextLevelXP: 100
  };

  const finalStats = userStats ? {
    totalXP: userStats.totalXp || 0,
    level: userStats.level || 1,
    badgesEarned: userStats.badges?.length || 0,
    tasksCompleted: userStats.tasksCompleted || 0,
    streakDays: userStats.loginStreak || 0,
    nextLevelXP: 100
  } : defaultStats;

  // Cartes de statistiques
  const statCards = [
    {
      label: "XP Total",
      value: finalStats.totalXP,
      icon: Star,
      color: "text-yellow-400",
      iconColor: "text-yellow-400"
    },
    {
      label: "Niveau",
      value: finalStats.level,
      icon: Crown,
      color: "text-blue-400",
      iconColor: "text-blue-400"
    },
    {
      label: "Badges",
      value: finalStats.badgesEarned,
      icon: Award,
      color: "text-purple-400",
      iconColor: "text-purple-400"
    },
    {
      label: "Série actuelle",
      value: `${finalStats.streakDays}j`,
      icon: Flame,
      color: "text-red-400",
      iconColor: "text-red-400"
    }
  ];

  // Onglets simplifiés
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Trophy },
    { id: 'progress', label: 'Progression', icon: TrendingUp },
    { id: 'goals', label: 'Objectifs', icon: Target },
    { id: 'activities', label: 'Activités', icon: Activity }
  ];

  // Activités récentes simulées
  const recentActivities = [
    {
      id: 1,
      type: 'task',
      action: 'Tâche complétée',
      detail: 'Révision du code frontend',
      xp: '+20 XP',
      time: 'Il y a 2h'
    },
    {
      id: 2,
      type: 'badge',
      action: 'Badge débloqué',
      detail: 'Premier contributeur',
      xp: '+50 XP',
      time: 'Il y a 4h'
    },
    {
      id: 3,
      type: 'level',
      action: 'Niveau atteint',
      detail: 'Niveau 3 débloqué',
      xp: '+100 XP',
      time: 'Hier'
    }
  ];

  // Objectifs disponibles
  const availableGoals = [
    {
      id: 1,
      title: 'Complétez 3 tâches aujourd\'hui',
      description: 'Terminez au moins 3 tâches avant la fin de la journée',
      progress: 67,
      reward: '60 XP + Badge Productif',
      xpReward: 60,
      status: 'active',
      icon: CheckCircle
    },
    {
      id: 2,
      title: 'Gagnez 100 XP cette semaine',
      description: 'Accumulez au moins 100 points d\'expérience',
      progress: 85,
      reward: '200 XP + Badge Hebdomadaire',
      xpReward: 200,
      status: 'active',
      icon: Star
    },
    {
      id: 3,
      title: 'Maintenez une série de 7 jours',
      description: 'Complétez au moins une tâche chaque jour pendant 7 jours',
      progress: 100,
      reward: '300 XP + Badge Consistance',
      xpReward: 300,
      status: 'completed',
      icon: Flame
    }
  ];

  /**
   * 🎁 GESTIONNAIRE DE RÉCLAMATION DE RÉCOMPENSE - VERSION CORRIGÉE
   */
  const handleClaimReward = async (goal) => {
    if (goal.status !== 'completed' || claimedGoals.has(goal.id) || isClaimingReward) {
      return;
    }

    setIsClaimingReward(true);

    try {
      console.log('🎁 Réclamation récompense pour objectif:', goal.title);

      // ✅ CORRECTION: Utiliser addXP correctement importé
      const result = await addXP(goal.xpReward, `Objectif complété: ${goal.title}`);
      
      if (result.success) {
        // Marquer comme réclamé
        setClaimedGoals(prev => new Set(prev).add(goal.id));

        // Notification de succès
        console.log(`✅ Récompense réclamée: +${goal.xpReward} XP`);
        
        // Notification visuelle simple
        alert(`🎉 Félicitations!\n+${goal.xpReward} XP réclamés pour "${goal.title}"`);
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }

    } catch (error) {
      console.error('❌ Erreur réclamation récompense:', error);
      alert('❌ Erreur lors de la réclamation. Veuillez réessayer.');
    } finally {
      setIsClaimingReward(false);
    }
  };

  // Fallback si PremiumLayout n'existe pas
  const LayoutComponent = PremiumLayout || (({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  ));

  return (
    <LayoutComponent
      title="Gamification"
      subtitle="Suivez votre progression et débloquez des récompenses"
      icon={Trophy}
      showStats={true}
      stats={statCards}
    >
      {/* Navigation des onglets */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-8">
        
        {/* ONGLET VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Progression du niveau */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Progression du niveau</h3>
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Niveau actuel</span>
                  <span className="text-2xl font-bold text-white">{finalStats.level}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progression</span>
                    <span className="text-white">{finalStats.totalXP} / {finalStats.nextLevelXP} XP</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(finalStats.totalXP / finalStats.nextLevelXP) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-sm text-gray-400">
                  Il vous faut {finalStats.nextLevelXP - finalStats.totalXP} XP pour le niveau suivant
                </div>
              </div>
            </div>

            {/* Objectifs quotidiens */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Objectifs quotidiens</h3>
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              
              <div className="space-y-4">
                {/* Tâches complétées */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Tâches complétées</span>
                    <span className="text-white">3/5</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '60%' }}
                    />
                  </div>
                </div>
                
                {/* XP gagnée */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">XP gagnée</span>
                    <span className="text-white">85/100</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '85%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET OBJECTIFS */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Objectifs disponibles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableGoals.map((goal) => {
                const Icon = goal.icon;
                const isClaimed = claimedGoals.has(goal.id);
                const canClaim = goal.status === 'completed' && !isClaimed;
                
                return (
                  <motion.div
                    key={goal.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Icon className={`w-8 h-8 ${
                        goal.status === 'completed' ? 'text-green-400' : 'text-blue-400'
                      }`} />
                      {goal.status === 'completed' && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Terminé
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-lg font-semibold text-white mb-2">{goal.title}</h4>
                    <p className="text-gray-400 text-sm mb-4">{goal.description}</p>
                    
                    {/* Barre de progression */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progression</span>
                        <span className="text-white">{goal.progress}%</span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            goal.status === 'completed' 
                              ? 'bg-gradient-to-r from-green-400 to-green-600' 
                              : 'bg-gradient-to-r from-blue-400 to-blue-600'
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Récompense */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Récompense</p>
                        <p className="text-sm text-white">{goal.reward}</p>
                      </div>
                      
                      {canClaim && (
                        <button
                          onClick={() => handleClaimReward(goal)}
                          disabled={isClaimingReward}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          {isClaimingReward ? 'Réclamation...' : 'Réclamer'}
                        </button>
                      )}
                      
                      {isClaimed && (
                        <span className="text-green-400 text-sm">✅ Réclamé</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ONGLET ACTIVITÉS */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Activités récentes</h3>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'task' ? 'bg-blue-500' :
                      activity.type === 'badge' ? 'bg-purple-500' : 'bg-green-500'
                    }`}>
                      {activity.type === 'task' ? '✅' :
                       activity.type === 'badge' ? '🏆' : '👑'}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.action}</p>
                      <p className="text-gray-400 text-sm">{activity.detail}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">{activity.xp}</p>
                      <p className="text-gray-400 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutComponent>
  );
};

export default GamificationPage;

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ [GAMIFICATION] Page gamification stable restaurée');
console.log('🎯 [GAMIFICATION] Fonctionnalités: Vue d\'ensemble, Objectifs, Activités');
console.log('🎁 [GAMIFICATION] Système de récompenses: handleClaimReward corrigé');
console.log('🛡️ [GAMIFICATION] Protection: Fallback pour PremiumLayout');
console.log('📊 [GAMIFICATION] Stats: XP, Niveau, Badges, Série');
