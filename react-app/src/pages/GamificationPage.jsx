// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// PAGE GAMIFICATION AVEC OBJECTIFS RÉELS FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Trophy, 
  Target, 
  Activity,
  CheckCircle,
  Clock,
  Flame,
  Crown,
  Gift,
  TrendingUp,
  Users,
  Award,
  Zap
} from 'lucide-react';

// Imports locaux
import LayoutComponent from '../layouts/LayoutComponent.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { useObjectives } from '../shared/hooks/useObjectives.js';

/**
 * 🎮 PAGE GAMIFICATION AVEC SYSTÈME D'OBJECTIFS RÉELS
 */
const GamificationPage = () => {
  const { user } = useAuth();
  const { gamification, isLoading: dataLoading } = useUnifiedFirebaseData();
  const { 
    objectives, 
    loading: objectivesLoading,
    error: objectivesError,
    claimObjective,
    stats: objectiveStats,
    isClaimingObjective,
    hasClaimableObjectives
  } = useObjectives();

  // États locaux
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Données utilisateur avec fallbacks sécurisés
  const userStats = {
    totalXp: gamification?.totalXp || 0,
    level: gamification?.level || 1,
    weeklyXp: gamification?.weeklyXp || 0,
    monthlyXp: gamification?.monthlyXp || 0,
    tasksCompleted: gamification?.tasksCompleted || 0,
    currentStreak: gamification?.currentStreak || 0,
    badges: gamification?.badges || [],
    loginStreak: gamification?.loginStreak || 1
  };

  // Calculs dérivés
  const xpForNextLevel = 100 * userStats.level; // Formule simple
  const currentLevelXp = userStats.totalXp % (100 * userStats.level);
  const progressPercentage = Math.min(100, (currentLevelXp / xpForNextLevel) * 100);

  /**
   * 🎁 GESTIONNAIRE DE RÉCLAMATION D'OBJECTIF CORRIGÉ
   */
  const handleClaimReward = async (objective) => {
    try {
      console.log('🎯 Tentative de réclamation:', objective.title);

      const result = await claimObjective(objective);

      if (result.success) {
        // Afficher notification de succès
        setNotificationMessage(result.message);
        setShowNotification(true);

        // Masquer la notification après 4 secondes
        setTimeout(() => {
          setShowNotification(false);
          setNotificationMessage('');
        }, 4000);

        console.log('✅ Objectif réclamé avec succès');
      } else {
        // Afficher erreur
        setNotificationMessage(`❌ Erreur: ${result.error}`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }

    } catch (error) {
      console.error('❌ Erreur réclamation:', error);
      setNotificationMessage('❌ Une erreur est survenue');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  /**
   * 🎨 OBTENIR LA COULEUR DE PROGRESSION SELON LE POURCENTAGE
   */
  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  /**
   * 🏆 OBTENIR L'ICÔNE DU TYPE D'OBJECTIF
   */
  const getObjectiveIcon = (type, defaultIcon) => {
    const icons = {
      daily: '📅',
      weekly: '📊',
      monthly: '📈',
      streak: '🔥',
      milestone: '🏆',
      special: '⭐'
    };
    return icons[type] || defaultIcon || '🎯';
  };

  // Activités récentes (à connecter au vrai système plus tard)
  const recentActivities = [
    {
      id: 1,
      type: 'objective',
      action: 'Objectif complété',
      detail: 'Complétez 3 tâches aujourd\'hui',
      xp: '+60 XP',
      time: 'Il y a 1h',
      icon: '🎯'
    },
    {
      id: 2,
      type: 'task',
      action: 'Tâche complétée',
      detail: 'Révision du code frontend',
      xp: '+25 XP',
      time: 'Il y a 3h',
      icon: '✅'
    },
    {
      id: 3,
      type: 'badge',
      action: 'Badge débloqué',
      detail: 'Premier contributeur',
      xp: '+50 XP',
      time: 'Hier',
      icon: '🏆'
    }
  ];

  if (dataLoading || objectivesLoading) {
    return (
      <LayoutComponent>
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
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* 🎉 NOTIFICATION DE RÉCLAMATION */}
          {showNotification && (
            <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
              {notificationMessage}
            </div>
          )}

          {/* 📊 EN-TÊTE AVEC STATISTIQUES */}
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
                  <p className="text-gray-400 text-sm">XP Total</p>
                </div>
              </div>
            </div>

            {/* Niveau */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white text-2xl font-bold">{userStats.level}</p>
                  <p className="text-gray-400 text-sm">Niveau</p>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white text-2xl font-bold">{userStats.badges.length}</p>
                  <p className="text-gray-400 text-sm">Badges</p>
                </div>
              </div>
            </div>

            {/* Série */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 p-3 rounded-lg">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white text-2xl font-bold">{userStats.currentStreak}</p>
                  <p className="text-gray-400 text-sm">Série actuelle</p>
                </div>
              </div>
            </div>
          </div>

          {/* 📱 NAVIGATION TABS */}
          <div className="flex gap-4 mb-8 bg-white/10 backdrop-blur-md rounded-xl p-2">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
              { id: 'objectives', label: 'Objectifs', icon: Target },
              { id: 'activities', label: 'Activités', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-900 font-semibold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* 📊 CONTENU DES TABS */}
          
          {/* VUE D'ENSEMBLE */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Progression du niveau */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Progression
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-white">
                    <span>Niveau {userStats.level}</span>
                    <span>{currentLevelXp} / {xpForNextLevel} XP</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-gray-400 text-sm">
                    Plus que {xpForNextLevel - currentLevelXp} XP pour le niveau {userStats.level + 1}
                  </p>
                </div>
              </div>

              {/* Statistiques de la semaine */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Cette semaine
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">XP gagnés</span>
                    <span className="text-white font-semibold">{userStats.weeklyXp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tâches complétées</span>
                    <span className="text-white font-semibold">{userStats.tasksCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Série de connexion</span>
                    <span className="text-white font-semibold">{userStats.loginStreak} jours</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OBJECTIFS RÉELS */}
          {activeTab === 'objectives' && (
            <div>
              {/* En-tête objectifs */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white text-2xl font-semibold">Objectifs disponibles</h3>
                {hasClaimableObjectives && (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Gift className="w-4 h-4" />
                    {objectiveStats.available} à réclamer !
                  </div>
                )}
              </div>

              {/* Affichage des erreurs */}
              {objectivesError && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
                  ❌ Erreur: {objectivesError}
                </div>
              )}

              {/* Liste des objectifs */}
              <div className="grid gap-6">
                {objectives.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Aucun objectif disponible pour le moment</p>
                  </div>
                ) : (
                  objectives.map((objective) => (
                    <div 
                      key={objective.id}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                    >
                      <div className="flex items-start justify-between">
                        
                        {/* Info objectif */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {getObjectiveIcon(objective.type, objective.icon)}
                            </span>
                            <h4 className="text-white text-lg font-semibold">
                              {objective.title}
                            </h4>
                            {objective.isClaimed && (
                              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                                ✓ Réclamé
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-400 mb-4">{objective.description}</p>
                          
                          {/* Progression */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">Progression</span>
                              <span className="text-white">{objective.current} / {objective.target}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(objective.progress)}`}
                                style={{ width: `${Math.min(100, objective.progress)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Récompense */}
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-green-400 font-semibold">
                              +{objective.xpReward} XP
                            </span>
                            {objective.badgeReward && (
                              <span className="text-yellow-400">
                                🏆 {objective.badgeReward}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bouton de réclamation */}
                        <div className="ml-4">
                          {objective.isClaimed ? (
                            <div className="bg-gray-600 text-gray-300 px-4 py-2 rounded-lg">
                              ✓ Réclamé
                            </div>
                          ) : objective.canClaim ? (
                            <button
                              onClick={() => handleClaimReward(objective)}
                              disabled={isClaimingObjective(objective.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {isClaimingObjective(objective.id) ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Réclamation...
                                </>
                              ) : (
                                <>
                                  <Gift className="w-4 h-4" />
                                  Réclamer
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="bg-gray-600 text-gray-300 px-4 py-2 rounded-lg">
                              {Math.round(objective.progress)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ACTIVITÉS */}
          {activeTab === 'activities' && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Activités récentes
              </h3>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl">{activity.icon}</div>
                    
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
          )}

        </div>
      </div>
    </LayoutComponent>
  );
};

export default GamificationPage;
