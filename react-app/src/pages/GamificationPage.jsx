// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// VERSION FIREBASE AUTHENTIQUE - ZÉRO DONNÉES DÉMO !
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

// ✅ HOOKS FIREBASE RÉELS UNIQUEMENT
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';

/**
 * 🎮 PAGE GAMIFICATION - 100% FIREBASE AUTHENTIQUE
 * AUCUNE DONNÉE FICTIVE OU DE DÉMONSTRATION
 */
const GamificationPage = () => {
  const { user } = useAuthStore();
  
  // ✅ DONNÉES FIREBASE EXCLUSIVEMENT
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

  // États locaux pour l'interface uniquement
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotification, setShowNotification] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ DONNÉES RÉELLES FIREBASE UNIQUEMENT
  const userStats = React.useMemo(() => {
    if (!gamification || !isReady) {
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
  }, [gamification, isReady]);

  // ✅ CALCULS BASÉS SUR DONNÉES FIREBASE RÉELLES
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

  // ✅ BADGES FIREBASE AUTHENTIQUES SEULEMENT
  const availableBadges = React.useMemo(() => {
    if (!badgeStats || !isReady) return [];
    
    // Retourner uniquement les badges Firebase authentiques
    return badgeStats.filter(badge => 
      badge.source === 'firebase' && 
      badge.userId === user?.uid
    ).map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      unlocked: badge.unlocked,
      unlockedAt: badge.unlockedAt,
      criteria: badge.criteria
    }));
  }, [badgeStats, isReady, user?.uid]);

  // ✅ OBJECTIFS FIREBASE AUTHENTIQUES
  const [objectives, setObjectives] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Chargement des objectifs Firebase RÉELS
  const loadFirebaseObjectives = async () => {
    if (!user?.uid || !actions?.getObjectives) return;
    
    try {
      const firebaseObjectives = await actions.getObjectives(user.uid);
      setObjectives(firebaseObjectives || []);
    } catch (error) {
      console.error('Erreur chargement objectifs Firebase:', error);
      setObjectives([]);
    }
  };

  // Chargement des activités Firebase RÉELLES
  const loadFirebaseActivities = async () => {
    if (!user?.uid || !actions?.getRecentActivities) return;
    
    try {
      const firebaseActivities = await actions.getRecentActivities(user.uid);
      setRecentActivities(firebaseActivities || []);
    } catch (error) {
      console.error('Erreur chargement activités Firebase:', error);
      setRecentActivities([]);
    }
  };

  // ✅ LEADERBOARD FIREBASE AUTHENTIQUE
  const [leaderboardData, setLeaderboardData] = useState([]);
  
  const loadFirebaseLeaderboard = async () => {
    if (!actions?.getLeaderboard) return;
    
    try {
      const firebaseLeaderboard = await actions.getLeaderboard();
      setLeaderboardData(firebaseLeaderboard || []);
    } catch (error) {
      console.error('Erreur chargement leaderboard Firebase:', error);
      setLeaderboardData([]);
    }
  };

  // Chargement initial des données Firebase EXCLUSIVEMENT
  useEffect(() => {
    if (isReady && user?.uid) {
      loadFirebaseObjectives();
      loadFirebaseActivities();
      loadFirebaseLeaderboard();
    }
  }, [isReady, user?.uid, actions]);

  // ✅ RÉCLAMATION D'OBJECTIF FIREBASE AUTHENTIQUE
  const claimObjective = async (objectiveId) => {
    if (!user?.uid || !actions?.claimObjective) return;
    
    try {
      await actions.claimObjective(user.uid, objectiveId);
      setShowNotification(true);
      
      // Recharger les données Firebase
      setTimeout(() => {
        loadFirebaseObjectives();
        loadFirebaseActivities();
        setShowNotification(false);
      }, 3000);

    } catch (error) {
      console.error('Erreur réclamation objectif Firebase:', error);
    }
  };

  // ✅ ACTUALISATION FIREBASE EXCLUSIVEMENT
  const handleRefresh = async () => {
    if (refreshing || !actions?.refreshData) return;
    
    setRefreshing(true);
    try {
      await actions.refreshData();
      await loadFirebaseObjectives();
      await loadFirebaseActivities();
      await loadFirebaseLeaderboard();
    } catch (error) {
      console.error('Erreur actualisation Firebase:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Affichage du chargement
  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Chargement de vos données Firebase...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur Firebase
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-red-400">Erreur de connexion Firebase</p>
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
        
        {/* 🎉 NOTIFICATION FIREBASE */}
        {showNotification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">Objectif Firebase complété !</span>
            </div>
          </div>
        )}

        {/* 📊 EN-TÊTE AVEC DONNÉES FIREBASE */}
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
          <p className="text-gray-400 text-lg">Données authentiques Firebase uniquement</p>
        </div>

        {/* 📈 STATISTIQUES FIREBASE AUTHENTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{userStats.totalXp}</span>
            </div>
            <h3 className="text-blue-400 font-semibold mb-2">XP Firebase</h3>
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
            <h3 className="text-yellow-400 font-semibold mb-2">Niveau Firebase</h3>
            <p className="text-gray-400 text-sm">Progression: {calculations.progressPercent.toFixed(1)}%</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{userStats.tasksCompleted}</span>
            </div>
            <h3 className="text-green-400 font-semibold mb-2">Tâches Firebase</h3>
            <p className="text-gray-400 text-sm">Depuis Firebase</p>
          </div>

          <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold text-white">{userStats.currentStreak}</span>
            </div>
            <h3 className="text-red-400 font-semibold mb-2">Série Firebase</h3>
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

        {/* 📊 CONTENU DES ONGLETS FIREBASE */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Progression Hebdomadaire Firebase */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Calendar className="w-6 h-6 text-purple-400 mr-3" />
                  Progression Firebase
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">XP Firebase cette semaine</span>
                    <span className="text-white font-semibold">{userStats.weeklyXp} XP</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${calculations.weeklyProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Données synchronisées avec Firebase
                  </p>
                </div>
              </div>

              {/* Activités Firebase RÉELLES */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Clock className="w-6 h-6 text-blue-400 mr-3" />
                  Activités Firebase
                </h3>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white text-sm">{activity.description}</p>
                          <p className="text-gray-400 text-xs">
                            {activity.timestamp ? new Date(activity.timestamp.toDate()).toLocaleString('fr-FR') : 'Firebase'}
                          </p>
                        </div>
                        <span className="text-green-400 font-semibold text-sm">{activity.value}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Aucune activité Firebase</p>
                      <p className="text-gray-500 text-sm">Commencez à utiliser l'application pour voir vos activités</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Award className="w-8 h-8 text-orange-400 mr-3" />
                Badges Firebase Authentiques
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableBadges.length > 0 ? (
                  availableBadges.map((badge) => (
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
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Aucun badge Firebase disponible</p>
                    <p className="text-gray-500 text-sm">Terminez des tâches pour débloquer vos premiers badges</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'objectives' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Target className="w-8 h-8 text-green-400 mr-3" />
                Objectifs Firebase
              </h3>
              <div className="space-y-6">
                {objectives.length > 0 ? (
                  objectives.map((objective) => (
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
                            <span className="text-sm text-gray-400">Progression Firebase</span>
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
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Aucun objectif Firebase disponible</p>
                    <p className="text-gray-500 text-sm">Les objectifs apparaîtront automatiquement selon votre progression</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Users className="w-8 h-8 text-purple-400 mr-3" />
                Classement Firebase
              </h3>
              
              {leaderboardData.length > 0 ? (
                <div className="space-y-6">
                  {/* Top 3 Podium Firebase */}
                  {leaderboardData.length >= 3 && (
                    <div className="flex justify-center items-end gap-6 mb-12">
                      {[1, 0, 2].map((index, displayOrder) => {
                        const leader = leaderboardData[index];
                        if (!leader) return null;
                        
                        const position = index + 1;
                        const heights = ['h-32', 'h-24', 'h-20'];
                        const colors = [
                          'from-yellow-600 to-yellow-400',
                          'from-gray-600 to-gray-400', 
                          'from-orange-600 to-orange-400'
                        ];
                        
                        return (
                          <div key={leader.id} className="text-center">
                            <div className={`bg-gradient-to-t ${colors[index]} ${heights[displayOrder]} w-16 rounded-t-lg mb-3 flex items-end justify-center pb-2`}>
                              <span className="text-white font-bold text-lg">{position}</span>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <div className="text-2xl mb-2">
                                {position === 1 ? '👑' : position === 2 ? '🥈' : '🥉'}
                              </div>
                              <p className="text-white font-medium text-sm">{leader.name}</p>
                              <p className="text-gray-400 text-xs">Niveau {leader.level}</p>
                              <p className="text-purple-400 text-xs">{leader.totalXp} XP</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Classement Étendu Firebase */}
                  <div className="space-y-3">
                    {leaderboardData.slice(3).map((leader, index) => (
                      <div key={leader.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{index + 4}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{leader.name}</p>
                              <p className="text-gray-400 text-sm">Niveau {leader.level}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-purple-400 font-semibold">{leader.totalXp} XP</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Aucune donnée de classement Firebase</p>
                  <p className="text-gray-500 text-sm">Le classement apparaîtra quand d'autres utilisateurs rejoindront</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 🎯 STATISTIQUES FIREBASE SUPPLÉMENTAIRES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <Award className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-white mb-2">{availableBadges.filter(b => b.unlocked).length}</h4>
            <p className="text-gray-400">Badges Firebase</p>
            <p className="text-purple-400 text-sm mt-1">
              Authentiques uniquement
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-white mb-2">{userStats.loginStreak}</h4>
            <p className="text-gray-400">Série Firebase</p>
            <p className="text-blue-400 text-sm mt-1">
              Données réelles
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-white mb-2">{userStats.projectsCompleted}</h4>
            <p className="text-gray-400">Projets Firebase</p>
            <p className="text-green-400 text-sm mt-1">
              Synchronisés
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPage;
