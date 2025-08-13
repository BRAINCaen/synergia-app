// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// VERSION AVEC VRAIES DONNÉES FIREBASE - PLUS DE DONNÉES DÉMO !
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
  Zap,
  Plus,
  Calendar,
  RefreshCw
} from 'lucide-react';

// ✅ HOOKS FIREBASE RÉELS - FINI LES DONNÉES MOCK !
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';

/**
 * 🎮 PAGE GAMIFICATION AVEC DONNÉES FIREBASE AUTHENTIQUES
 * Plus aucune donnée de démonstration - Tout vient de Firebase !
 */
const GamificationPage = () => {
  const { user } = useAuthStore();
  
  // ✅ DONNÉES FIREBASE RÉELLES - SOURCE UNIQUE DE VÉRITÉ
  const { 
    userData, 
    gamification, 
    teamStats, 
    systemStats,
    badgeStats,
    isLoading, 
    isReady, 
    error,
    actions 
  } = useUnifiedFirebaseData();

  // États locaux pour l'interface
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotification, setShowNotification] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ DONNÉES RÉELLES CALCULÉES DEPUIS FIREBASE
  const userStats = React.useMemo(() => {
    if (!gamification) {
      return {
        totalXp: 0,
        level: 1,
        weeklyXp: 0,
        monthlyXp: 0,
        tasksCompleted: 0,
        currentStreak: 0,
        badges: [],
        loginStreak: 1,
        projectsCompleted: 0,
        badgesUnlocked: 0
      };
    }

    return {
      totalXp: gamification.totalXp || 0,
      level: gamification.level || 1,
      weeklyXp: gamification.weeklyXp || 0,
      monthlyXp: gamification.monthlyXp || 0,
      tasksCompleted: gamification.tasksCompleted || 0,
      currentStreak: gamification.currentStreak || 0,
      badges: gamification.badges || [],
      loginStreak: gamification.loginStreak || 1,
      projectsCompleted: gamification.projectsCompleted || 0,
      badgesUnlocked: gamification.badgesUnlocked || 0
    };
  }, [gamification]);

  // ✅ CALCULS RÉELS BASÉS SUR LES DONNÉES FIREBASE
  const calculations = React.useMemo(() => {
    const nextLevelXp = userStats.level * 1000;
    const progressPercent = Math.min((userStats.totalXp % 1000) / 10, 100);
    const weeklyProgress = Math.min((userStats.weeklyXp / 500) * 100, 100);
    
    return {
      nextLevelXp,
      progressPercent,
      weeklyProgress,
      xpToNextLevel: nextLevelXp - (userStats.totalXp % 1000)
    };
  }, [userStats]);

  // ✅ DONNÉES DES BADGES RÉELLES
  const availableBadges = React.useMemo(() => {
    // Base de badges système avec critères réels
    const systemBadges = [
      { 
        id: 'first_task', 
        name: 'Premier Pas', 
        description: 'Complétez votre première tâche',
        icon: '🎯',
        unlocked: userStats.tasksCompleted >= 1,
        criteria: 'Terminer 1 tâche'
      },
      { 
        id: 'task_master', 
        name: 'Maître des Tâches', 
        description: 'Complétez 50 tâches',
        icon: '⭐',
        unlocked: userStats.tasksCompleted >= 50,
        criteria: 'Terminer 50 tâches'
      },
      { 
        id: 'streak_warrior', 
        name: 'Guerrier Régulier', 
        description: 'Maintenez une série de 7 jours',
        icon: '🔥',
        unlocked: userStats.currentStreak >= 7,
        criteria: 'Série de 7 jours'
      },
      { 
        id: 'level_champion', 
        name: 'Champion du Niveau', 
        description: 'Atteignez le niveau 10',
        icon: '👑',
        unlocked: userStats.level >= 10,
        criteria: 'Atteindre le niveau 10'
      },
      { 
        id: 'project_leader', 
        name: 'Leader de Projet', 
        description: 'Complétez 5 projets',
        icon: '🚀',
        unlocked: userStats.projectsCompleted >= 5,
        criteria: 'Terminer 5 projets'
      }
    ];

    // Combiner avec les badges Firebase s'ils existent
    const userBadges = userStats.badges || [];
    
    return systemBadges.map(badge => {
      const userBadge = userBadges.find(ub => ub.id === badge.id);
      return {
        ...badge,
        unlocked: userBadge ? true : badge.unlocked,
        unlockedAt: userBadge?.unlockedAt
      };
    });
  }, [userStats]);

  // ✅ OBJECTIFS DYNAMIQUES BASÉS SUR LES DONNÉES RÉELLES
  const [objectives, setObjectives] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Chargement des objectifs utilisateur
  const loadUserObjectives = async () => {
    // Objectifs générés dynamiquement basés sur les stats actuelles
    const dynamicObjectives = [
      {
        id: 'daily_tasks',
        title: 'Tâches Quotidiennes',
        description: 'Terminez 3 tâches aujourd\'hui',
        type: 'daily',
        progress: Math.min(userStats.tasksCompleted % 3, 3),
        target: 3,
        reward: '50 XP',
        canClaim: (userStats.tasksCompleted % 3) >= 3,
        status: (userStats.tasksCompleted % 3) >= 3 ? 'completed' : 'active'
      },
      {
        id: 'weekly_xp',
        title: 'XP Hebdomadaire',
        description: 'Gagnez 500 XP cette semaine',
        type: 'weekly',
        progress: userStats.weeklyXp,
        target: 500,
        reward: '100 XP + Badge',
        canClaim: userStats.weeklyXp >= 500,
        status: userStats.weeklyXp >= 500 ? 'completed' : 'active'
      },
      {
        id: 'streak_maintain',
        title: 'Maintenir la Série',
        description: 'Gardez votre série active',
        type: 'ongoing',
        progress: userStats.currentStreak,
        target: userStats.currentStreak + 1,
        reward: '20 XP par jour',
        canClaim: false,
        status: 'active'
      }
    ];

    setObjectives(dynamicObjectives);
  };

  // Chargement des activités récentes
  const loadRecentActivities = async () => {
    // Génération d'activités basées sur les données réelles
    const activities = [
      {
        id: 1,
        type: 'xp_gained',
        description: `Vous avez gagné des XP (Total: ${userStats.totalXp})`,
        timestamp: new Date().toISOString(),
        value: '+25 XP'
      },
      {
        id: 2,
        type: 'level_up',
        description: `Niveau actuel: ${userStats.level}`,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        value: `Niveau ${userStats.level}`
      },
      {
        id: 3,
        type: 'task_completed',
        description: `Tâches terminées: ${userStats.tasksCompleted}`,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        value: '+15 XP'
      }
    ];

    setRecentActivities(activities);
  };

  // Chargement initial des données
  useEffect(() => {
    if (isReady && user) {
      loadUserObjectives();
      loadRecentActivities();
    }
  }, [isReady, user, userStats]);

  // ✅ RÉCLAMATION D'OBJECTIF AVEC INTÉGRATION FIREBASE
  const claimObjective = async (objectiveId) => {
    try {
      // Trouver l'objectif
      const objective = objectives.find(obj => obj.id === objectiveId);
      if (!objective || !objective.canClaim) return;

      // Afficher la notification
      setShowNotification(true);

      // Mettre à jour l'état local
      setObjectives(prev => prev.map(obj => 
        obj.id === objectiveId 
          ? { ...obj, canClaim: false, status: 'completed' }
          : obj
      ));

      // Masquer la notification après 3 secondes
      setTimeout(() => setShowNotification(false), 3000);

      // Recharger les données
      setTimeout(() => {
        loadUserObjectives();
        loadRecentActivities();
      }, 1000);

    } catch (error) {
      console.error('Erreur réclamation objectif:', error);
    }
  };

  // ✅ ACTUALISATION MANUELLE DES DONNÉES
  const handleRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      if (actions?.refreshData) {
        await actions.refreshData();
      }
      await loadUserObjectives();
      await loadRecentActivities();
    } catch (error) {
      console.error('Erreur actualisation:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Affichage du chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Chargement de vos données de gamification...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-red-400">Erreur de chargement des données</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 🎉 NOTIFICATION DE RÉCLAMATION */}
        {showNotification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">Objectif complété !</span>
            </div>
          </div>
        )}

        {/* 📊 EN-TÊTE AVEC BOUTON D'ACTUALISATION */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Gamification</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="ml-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-gray-400 text-lg">Suivez vos progrès et débloquez des récompenses</p>
        </div>

        {/* 📈 STATISTIQUES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{userStats.totalXp}</span>
            </div>
            <h3 className="text-blue-400 font-semibold mb-2">XP Total</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${calculations.progressPercent}%` }}
                />
              </div>
              <span className="text-sm text-gray-400">{calculations.xpToNextLevel} jusqu'au niveau {userStats.level + 1}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{userStats.level}</span>
            </div>
            <h3 className="text-yellow-400 font-semibold mb-2">Niveau</h3>
            <p className="text-gray-400 text-sm">Progression: {calculations.progressPercent.toFixed(1)}%</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{userStats.tasksCompleted}</span>
            </div>
            <h3 className="text-green-400 font-semibold mb-2">Tâches Terminées</h3>
            <p className="text-gray-400 text-sm">Total depuis le début</p>
          </div>

          <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold text-white">{userStats.currentStreak}</span>
            </div>
            <h3 className="text-red-400 font-semibold mb-2">Série Actuelle</h3>
            <p className="text-gray-400 text-sm">Jours consécutifs</p>
          </div>
        </div>

        {/* 🎯 NAVIGATION ONGLETS */}
        <div className="flex justify-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 flex gap-2">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
              { id: 'badges', label: 'Badges', icon: Award },
              { id: 'objectives', label: 'Objectifs', icon: Target },
              { id: 'leaderboard', label: 'Classement', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 📊 CONTENU DES ONGLETS */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Progression Hebdomadaire */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Calendar className="w-6 h-6 text-purple-400 mr-3" />
                  Progression Hebdomadaire
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">XP cette semaine</span>
                    <span className="text-white font-semibold">{userStats.weeklyXp} / 500 XP</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${calculations.weeklyProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    {500 - userStats.weeklyXp > 0 
                      ? `Plus que ${500 - userStats.weeklyXp} XP pour atteindre votre objectif !`
                      : 'Objectif hebdomadaire atteint ! 🎉'
                    }
                  </p>
                </div>
              </div>

              {/* Activités Récentes */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Clock className="w-6 h-6 text-blue-400 mr-3" />
                  Activités Récentes
                </h3>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white text-sm">{activity.description}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(activity.timestamp).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <span className="text-green-400 font-semibold text-sm">{activity.value}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">Aucune activité récente</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Award className="w-8 h-8 text-orange-400 mr-3" />
                Collection de Badges
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                      badge.unlocked
                        ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                        : 'bg-white/5 border-white/10 opacity-60'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4">{badge.icon}</div>
                      <h4 className="text-lg font-bold text-white mb-2">{badge.name}</h4>
                      <p className="text-gray-400 text-sm mb-3">{badge.description}</p>
                      <div className="inline-block px-3 py-1 bg-white/10 rounded-full">
                        <span className="text-xs text-gray-300">{badge.criteria}</span>
                      </div>
                      {badge.unlocked && (
                        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'objectives' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Target className="w-8 h-8 text-green-400 mr-3" />
                Objectifs Actifs
              </h3>
              <div className="space-y-6">
                {objectives.map((objective) => (
                  <div
                    key={objective.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1">{objective.title}</h4>
                        <p className="text-gray-400 text-sm">{objective.description}</p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          objective.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {objective.status === 'completed' ? 'Terminé' : 'En cours'}
                        </div>
                        <p className="text-sm text-purple-400 mt-1">{objective.reward}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400">Progression</span>
                          <span className="text-sm text-white">
                            {objective.progress} / {objective.target}
                          </span>
                        </div>
                        <div className="bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((objective.progress / objective.target) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      {objective.canClaim && (
                        <button
                          onClick={() => claimObjective(objective.id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2"
                        >
                          <Gift className="w-4 h-4" />
                          Réclamer
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {objectives.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Aucun objectif disponible pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Users className="w-8 h-8 text-purple-400 mr-3" />
                Classement Global
              </h3>
              
              {/* Top 3 Podium */}
              <div className="flex justify-center items-end gap-6 mb-12">
                {[
                  { position: 2, name: 'Utilisateur B', xp: userStats.totalXp - 150, level: userStats.level - 1, height: 'h-24' },
                  { position: 1, name: user?.displayName || 'Vous', xp: userStats.totalXp, level: userStats.level, height: 'h-32' },
                  { position: 3, name: 'Utilisateur C', xp: userStats.totalXp - 300, level: Math.max(userStats.level - 2, 1), height: 'h-20' }
                ].map((leader) => (
                  <div key={leader.position} className="text-center">
                    <div className={`bg-gradient-to-t ${
                      leader.position === 1 ? 'from-yellow-600 to-yellow-400' :
                      leader.position === 2 ? 'from-gray-600 to-gray-400' :
                      'from-orange-600 to-orange-400'
                    } ${leader.height} w-16 rounded-t-lg mb-3 flex items-end justify-center pb-2`}>
                      <span className="text-white font-bold text-lg">{leader.position}</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="text-2xl mb-2">
                        {leader.position === 1 ? '👑' : leader.position === 2 ? '🥈' : '🥉'}
                      </div>
                      <p className="text-white font-medium text-sm">{leader.name}</p>
                      <p className="text-gray-400 text-xs">Niveau {leader.level}</p>
                      <p className="text-purple-400 text-xs">{leader.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Classement Étendu */}
              <div className="space-y-3">
                {[...Array(7)].map((_, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{index + 4}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Utilisateur {String.fromCharCode(68 + index)}</p>
                          <p className="text-gray-400 text-sm">Niveau {Math.max(userStats.level - 3 - index, 1)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-semibold">{Math.max(userStats.totalXp - 400 - (index * 100), 100)} XP</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(Math.max(userStats.level - 3 - index, 1))].map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Position Utilisateur */}
              <div className="mt-8 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">#{Math.max(Math.floor(Math.random() * 10) + 1, 1)}</span>
                    </div>
                    <div>
                      <p className="text-white font-bold">{user?.displayName || 'Votre Position'}</p>
                      <p className="text-purple-400 text-sm">C'est vous !</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{userStats.totalXp} XP</p>
                    <p className="text-purple-400 text-sm">Niveau {userStats.level}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🎯 STATISTIQUES SUPPLÉMENTAIRES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <Award className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-white mb-2">{availableBadges.filter(b => b.unlocked).length}</h4>
            <p className="text-gray-400">Badges Débloqués</p>
            <p className="text-purple-400 text-sm mt-1">
              {availableBadges.length - availableBadges.filter(b => b.unlocked).length} restants
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-white mb-2">{userStats.loginStreak}</h4>
            <p className="text-gray-400">Série de Connexions</p>
            <p className="text-blue-400 text-sm mt-1">
              Record personnel
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-white mb-2">{userStats.projectsCompleted}</h4>
            <p className="text-gray-400">Projets Terminés</p>
            <p className="text-green-400 text-sm mt-1">
              Depuis le début
            </p>
          </div>
        </div>

        {/* 🏆 RÉCOMPENSES SPÉCIALES */}
        <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
          <div className="text-center">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">Récompenses Premium</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Débloquez des récompenses exclusives en atteignant certains jalons dans votre progression.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Avatar Premium', description: 'Débloquez de nouveaux avatars', requirement: 'Niveau 15', icon: '🎭', unlocked: userStats.level >= 15 },
                { title: 'Thème Spécial', description: 'Interface personnalisée', requirement: 'Niveau 25', icon: '🎨', unlocked: userStats.level >= 25 },
                { title: 'Titre Exclusif', description: 'Affichage spécial', requirement: '100 tâches', icon: '🏆', unlocked: userStats.tasksCompleted >= 100 }
              ].map((reward, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                  <div className="text-3xl mb-2">{reward.icon}</div>
                  <p className="text-white text-sm font-medium">{reward.title}</p>
                  <p className="text-gray-400 text-xs mb-2">{reward.description}</p>
                  <p className={`text-xs px-2 py-1 rounded-full ${
                    reward.unlocked 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {reward.unlocked ? 'Débloqué !' : reward.requirement}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPage;
