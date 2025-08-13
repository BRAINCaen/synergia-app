// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// VRAIES DONNÉES FIREBASE - PLUS DE MOCK !
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RefreshCw,
  Activity,
  Gauge,
  BarChart3,
  Medal,
  Shield
} from 'lucide-react';

// ✅ IMPORTS POUR VRAIES DONNÉES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedXP } from '../shared/hooks/useUnifiedXP.js';
import { 
  collection, 
  query, 
  orderBy, 
  limit,
  onSnapshot,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🎮 PAGE GAMIFICATION AVEC VRAIES DONNÉES FIREBASE UNIQUEMENT
 */
const GamificationPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // ✅ VRAIES DONNÉES XP DEPUIS FIREBASE
  const {
    gamificationData,
    level,
    totalXp,
    weeklyXp,
    monthlyXp,
    badges,
    loginStreak,
    stats,
    loading,
    isReady,
    syncStatus,
    lastUpdate,
    addXP,
    forceSync
  } = useUnifiedXP();
  
  // États locaux
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  // ✅ VRAIES DONNÉES LEADERBOARD DEPUIS FIREBASE
  const [realLeaderboard, setRealLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // ✅ RÉCUPÉRATION DU VRAI LEADERBOARD FIREBASE
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('🏆 Récupération du vrai leaderboard depuis Firebase...');
    setLeaderboardLoading(true);

    const usersQuery = query(
      collection(db, 'users'),
      orderBy('gamification.totalXp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const leaderboardData = [];
      snapshot.forEach((doc, index) => {
        const userData = doc.data();
        const gamification = userData.gamification || {};
        
        leaderboardData.push({
          rank: index + 1,
          id: doc.id,
          name: userData.displayName || userData.email || 'Utilisateur',
          xp: gamification.totalXp || 0,
          level: gamification.level || 1,
          isMe: doc.id === user?.uid
        });
      });
      
      console.log('🏆 Leaderboard réel récupéré:', leaderboardData);
      setRealLeaderboard(leaderboardData);
      setLeaderboardLoading(false);
    }, (error) => {
      console.error('❌ Erreur leaderboard:', error);
      setLeaderboardLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  // ✅ CALCULS BASÉS SUR LES VRAIES DONNÉES XP UNIQUEMENT
  const calculations = gamificationData ? {
    currentLevelXp: (level - 1) * 100,
    nextLevelXp: level * 100,
    xpToNextLevel: Math.max(0, (level * 100) - totalXp),
    progressPercent: Math.min(100, ((totalXp % 100) / 100) * 100),
    weeklyProgress: Math.min(100, (weeklyXp / 500) * 100),
    monthlyProgress: Math.min(100, (monthlyXp / 2000) * 100)
  } : {
    currentLevelXp: 0,
    nextLevelXp: 100,
    xpToNextLevel: 100,
    progressPercent: 0,
    weeklyProgress: 0,
    monthlyProgress: 0
  };

  // ✅ OBJECTIFS BASÉS SUR LES VRAIES DONNÉES UTILISATEUR
  const objectives = gamificationData ? [
    {
      id: 'weekly_xp',
      title: 'XP Hebdomadaire',
      description: 'Gagnez 500 XP cette semaine',
      target: 500,
      current: weeklyXp,
      progress: Math.min(100, (weeklyXp / 500) * 100),
      xpReward: 100,
      type: 'weekly',
      icon: '📅',
      completed: weeklyXp >= 500
    },
    {
      id: 'monthly_tasks',
      title: 'Tâches Mensuelles', 
      description: 'Terminez 20 tâches ce mois',
      target: 20,
      current: gamificationData.tasksCompleted || 0,
      progress: Math.min(100, ((gamificationData.tasksCompleted || 0) / 20) * 100),
      xpReward: 250,
      type: 'monthly',
      icon: '✅',
      completed: (gamificationData.tasksCompleted || 0) >= 20
    },
    {
      id: 'streak_goal',
      title: 'Série de Connexion',
      description: 'Connectez-vous 7 jours consécutifs',
      target: 7,
      current: loginStreak,
      progress: Math.min(100, (loginStreak / 7) * 100),
      xpReward: 150,
      type: 'streak',
      icon: '🔥',
      completed: loginStreak >= 7
    }
  ] : [];

  // ✅ ACTIVITÉS RÉCENTES DEPUIS LES VRAIES DONNÉES XP HISTORY
  const recentActivities = gamificationData?.xpHistory?.slice(-5).reverse().map((entry, index) => ({
    id: index,
    type: entry.source || 'unknown',
    description: `+${entry.amount} XP - ${
      entry.source === 'task_completion' ? 'Tâche terminée' :
      entry.source === 'level_up' ? 'Montée de niveau' :
      entry.source === 'badge_unlock' ? 'Badge débloqué' :
      entry.source === 'objective_completion' ? 'Objectif atteint' :
      entry.source
    }`,
    timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
    xp: entry.amount,
    icon: entry.source === 'task_completion' ? '✅' : 
          entry.source === 'level_up' ? '🎉' : 
          entry.source === 'badge_unlock' ? '🏆' : 
          entry.source === 'objective_completion' ? '🎯' : '⭐'
  })) || [];

  // ✅ GESTION DU RAFRAÎCHISSEMENT
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await forceSync();
      console.log('✅ Synchronisation XP forcée réussie');
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ✅ CLAIM D'OBJECTIF AVEC VRAIES DONNÉES
  const claimObjective = async (objectiveId) => {
    const objective = objectives.find(obj => obj.id === objectiveId);
    if (!objective || !objective.completed) return;

    try {
      const result = await addXP(objective.xpReward, 'objective_completion', {
        objectiveId,
        objectiveTitle: objective.title
      });

      if (result.success) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (error) {
      console.error('❌ Erreur claim objectif:', error);
    }
  };

  // Vérification d'authentification
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connexion requise</h2>
          <p className="text-gray-400">Veuillez vous connecter pour accéder à la gamification</p>
        </div>
      </div>
    );
  }

  // Chargement des données
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <RefreshCw className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Chargement de vos données...</h2>
          <p className="text-gray-400">Synchronisation avec Firebase en cours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 🎉 NOTIFICATION DE SUCCÈS */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                <span className="font-semibold">Objectif complété ! 🎉</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📊 EN-TÊTE AVEC STATUS DE SYNC */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Gamification</h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="ml-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-white ${(isRefreshing || loading) ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-gray-400 text-lg">Vos progrès réels synchronisés avec Firebase</p>
          
          {/* Status de synchronisation */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${
              syncStatus === 'synchronized' ? 'bg-green-400' :
              syncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' :
              syncStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-400">
              {syncStatus === 'synchronized' ? 'Données Firebase synchronisées' :
               syncStatus === 'syncing' ? 'Synchronisation Firebase...' :
               syncStatus === 'error' ? 'Erreur Firebase' : 'Connexion Firebase'}
            </span>
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                • MAJ: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* 📈 STATISTIQUES PRINCIPALES - VRAIES DONNÉES FIREBASE UNIQUEMENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{totalXp.toLocaleString()}</span>
            </div>
            <h3 className="text-blue-400 font-semibold mb-2">XP Total (Firebase)</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${calculations.progressPercent}%` }}
                />
              </div>
              <span className="text-sm text-gray-400">{calculations.xpToNextLevel}</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Niveau {level} • {calculations.xpToNextLevel} XP jusqu'au niveau {level + 1}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{level}</span>
            </div>
            <h3 className="text-green-400 font-semibold mb-2">Niveau (Firebase)</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${calculations.progressPercent}%` }}
                />
              </div>
              <span className="text-sm text-gray-400">{Math.round(calculations.progressPercent)}%</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Progression vers niveau {level + 1}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-600/20 to-yellow-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold text-white">{weeklyXp}</span>
            </div>
            <h3 className="text-orange-400 font-semibold mb-2">XP Semaine (Firebase)</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${calculations.weeklyProgress}%` }}
                />
              </div>
              <span className="text-sm text-gray-400">{Math.round(calculations.weeklyProgress)}%</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Objectif: 500 XP/semaine
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">{loginStreak}</span>
            </div>
            <h3 className="text-purple-400 font-semibold mb-2">Série (Firebase)</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (loginStreak / 7) * 100)}%` }}
                />
              </div>
              <span className="text-sm text-gray-400">{Math.min(7, loginStreak)}/7</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Objectif: 7 jours consécutifs
            </p>
          </motion.div>
        </div>

        {/* 📑 ONGLETS DE NAVIGATION */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'objectives', label: 'Objectifs', icon: Target },
              { id: 'badges', label: 'Badges', icon: Medal },
              { id: 'leaderboard', label: 'Classement', icon: Trophy },
              { id: 'activity', label: 'Activité', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 📊 CONTENU SELON L'ONGLET ACTIF */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Progression de niveau - VRAIES DONNÉES */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  Progression Réelle Firebase
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Niveau actuel</span>
                    <span className="text-white font-bold">{level}</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${calculations.progressPercent}%` }}
                    >
                      <span className="text-white text-xs font-bold">
                        {Math.round(calculations.progressPercent)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{calculations.currentLevelXp} XP</span>
                    <span className="text-gray-400">{calculations.nextLevelXp} XP</span>
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-400 text-sm">
                      🎯 <strong>{calculations.xpToNextLevel} XP</strong> restants pour atteindre le niveau <strong>{level + 1}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistiques détaillées - VRAIES DONNÉES FIREBASE */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Gauge className="w-6 h-6 text-purple-400" />
                  Vraies Statistiques Firebase
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-400">Tâches complétées</span>
                    <span className="text-white font-bold">{gamificationData?.tasksCompleted || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-400">Projets créés</span>
                    <span className="text-white font-bold">{gamificationData?.projectsCreated || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-400">Badges débloqués</span>
                    <span className="text-white font-bold">{badges?.length || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-400">XP mensuel</span>
                    <span className="text-white font-bold">{monthlyXp}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-white">Classement Réel Firebase</h3>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h4 className="text-lg font-semibold text-white">
                    Top Utilisateurs - Données Firebase Réelles
                  </h4>
                </div>
                
                {leaderboardLoading ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Chargement du classement Firebase...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {realLeaderboard.map((player) => (
                      <div
                        key={player.id}
                        className={`p-4 flex items-center gap-4 ${
                          player.isMe ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          player.rank === 1 ? 'bg-yellow-500 text-black' :
                          player.rank === 2 ? 'bg-gray-400 text-black' :
                          player.rank === 3 ? 'bg-orange-500 text-black' :
                          'bg-white/10 text-white'
                        }`}>
                          {player.rank}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${player.isMe ? 'text-blue-400' : 'text-white'}`}>
                              {player.name}
                            </span>
                            {player.isMe && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                Vous (Firebase)
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            Niveau {player.level}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-bold">
                            {player.xp.toLocaleString()} XP
                          </div>
                          <div className="text-xs text-gray-400">
                            Firebase
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-white">Activité Réelle Firebase</h3>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                {recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
                      >
                        <div className="text-2xl">{activity.icon}</div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{activity.description}</p>
                          <p className="text-gray-400 text-sm">
                            {activity.timestamp.toLocaleString()} • Firebase
                          </p>
                        </div>
                        <div className="text-green-400 font-bold">
                          +{activity.xp} XP
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Aucune activité Firebase</h4>
                    <p className="text-gray-400">
                      Votre historique d'activité XP Firebase apparaîtra ici
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Vrais Badges Firebase</h3>
                <span className="text-gray-400">
                  {badges?.length || 0} badge{(badges?.length || 0) !== 1 ? 's' : ''} débloqué{(badges?.length || 0) !== 1 ? 's' : ''} (Firebase)
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {badges && badges.length > 0 ? (
                  badges.map((badge, index) => (
                    <motion.div
                      key={badge.id || index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-colors"
                    >
                      <div className="text-4xl mb-2">{badge.icon || '🏆'}</div>
                      <h4 className="text-white font-medium text-sm mb-1">
                        {badge.name || badge.title || 'Badge'}
                      </h4>
                      <p className="text-gray-400 text-xs">
                        {badge.description || 'Badge débloqué'}
                      </p>
                      {badge.unlockedAt && (
                        <p className="text-green-400 text-xs mt-1">
                          {new Date(badge.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-blue-400 text-xs mt-1">Firebase</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Shield className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Aucun badge Firebase débloqué</h4>
                    <p className="text-gray-400">
                      Complétez des tâches pour débloquer vos premiers badges dans Firebase !
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'objectives' && (
            <motion.div
              key="objectives"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-white">Objectifs Basés sur Données Firebase</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {objectives.map((objective) => (
                  <motion.div
                    key={objective.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-6 ${
                      objective.completed 
                        ? 'border-green-500/50 bg-green-500/10' 
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{objective.icon}</div>
                      {objective.completed && (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      )}
                    </div>
                    
                    <h4 className="text-lg font-bold text-white mb-2">
                      {objective.title}
                    </h4>
                    <p className="text-gray-400 text-sm mb-4">
                      {objective.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progression Firebase</span>
                        <span className="text-white font-bold">
                          {objective.current}/{objective.target}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            objective.completed 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500'
                          }`}
                          style={{ width: `${objective.progress}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400 text-sm font-medium">
                          +{objective.xpReward} XP
                        </span>
                        {objective.completed && (
                          <button
                            onClick={() => claimObjective(objective.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Réclamer
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GamificationPage;
