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

  // 🔧 FONCTION POUR NETTOYER LES NOMS (CORRECTION NaN)
  const cleanDisplayName = (userData) => {
    let cleanName = 'Utilisateur';
    
    // Essayer d'abord le displayName du profil
    if (userData.profile?.displayName && 
        userData.profile.displayName !== 'undefined' && 
        userData.profile.displayName !== 'null' &&
        userData.profile.displayName !== 'NaN') {
      cleanName = userData.profile.displayName;
    }
    // Ensuite le displayName principal
    else if (userData.displayName && 
             userData.displayName !== 'undefined' && 
             userData.displayName !== 'null' &&
             userData.displayName !== 'NaN') {
      cleanName = userData.displayName;
    }
    // Sinon l'email sans le domaine
    else if (userData.email && userData.email.includes('@')) {
      cleanName = userData.email.split('@')[0];
    }
    
    // Vérifier qu'on n'a pas de valeurs bizarres
    if (!cleanName || 
        cleanName === 'undefined' || 
        cleanName === 'null' || 
        cleanName === 'NaN' ||
        cleanName.includes('http') ||
        cleanName.includes('googleusercontent') ||
        cleanName.length > 50) {
      cleanName = 'Utilisateur';
    }
    
    return cleanName;
  };

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
        
        // 🔧 UTILISER LA FONCTION DE NETTOYAGE DES NOMS
        const cleanedName = cleanDisplayName(userData);
        
        leaderboardData.push({
          rank: index + 1,
          id: doc.id,
          name: cleanedName, // 🔧 NOM NETTOYÉ
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
    currentLevelXp: totalXp % 100,
    nextLevelXp: 100,
    xpToNextLevel: 100 - (totalXp % 100),
    progressPercent: ((totalXp % 100) / 100) * 100
  } : {
    currentLevelXp: 0,
    nextLevelXp: 100,
    xpToNextLevel: 100,
    progressPercent: 0
  };

  // ✅ VRAIES ACTIVITÉS RÉCENTES DEPUIS FIREBASE
  const recentActivities = gamificationData?.xpHistory ? 
    gamificationData.xpHistory.slice(-5).reverse().map((activity, index) => ({
      id: index,
      type: activity.source || 'unknown',
      description: `+${activity.amount} XP - ${activity.source}`,
      timestamp: activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Récemment',
      xp: `+${activity.amount} XP`
    })) : [];

  // ✅ BADGES RÉELS DEPUIS FIREBASE
  const availableBadges = [
    { id: 'first_task', name: 'Première tâche', icon: '🎯', description: 'Première tâche complétée', earned: badges.includes('first_task') },
    { id: 'week_streak', name: 'Série de 7 jours', icon: '🔥', description: '7 jours consécutifs', earned: badges.includes('week_streak') },
    { id: 'level_5', name: 'Niveau 5', icon: '⭐', description: 'Atteindre le niveau 5', earned: level >= 5 },
    { id: 'xp_1000', name: '1000 XP', icon: '💎', description: '1000 XP accumulés', earned: totalXp >= 1000 }
  ];

  // ✅ FONCTION DE SYNCHRONISATION
  const handleForceSync = async () => {
    if (!forceSync) return;
    
    setIsRefreshing(true);
    try {
      await forceSync();
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('❌ Erreur sync:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Si pas connecté
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Connexion requise</h1>
          <p className="text-gray-400">Veuillez vous connecter pour accéder à la gamification</p>
        </div>
      </div>
    );
  }

  // Si données en chargement
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-white mb-2">Chargement des données Firebase...</h1>
          <p className="text-gray-400">Synchronisation en cours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header avec vraies données */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-white">
                  🎮 Gamification Synergia v3.5
                </h1>
                <p className="text-purple-200">
                  {/* 🔧 AFFICHAGE NETTOYÉ DU NOM */}
                  Bonjour, <strong>{cleanDisplayName({ 
                    displayName: user?.displayName, 
                    email: user?.email,
                    profile: { displayName: user?.displayName }
                  })}</strong> • 
                  Niveau <strong>{level}</strong> • 
                  <strong>{totalXp.toLocaleString()}</strong> XP total • 
                  Statut: <span className="text-green-400">{syncStatus}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleForceSync}
                disabled={isRefreshing}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isRefreshing 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Sync...' : 'Sync Firebase'}</span>
              </button>
              
              <div className="text-right">
                <div className="text-sm text-gray-400">Dernière sync</div>
                <div className="text-white font-medium">
                  {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Jamais'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification de sync */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            ✅ Données synchronisées avec Firebase
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation des onglets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-xl p-1">
          {[
            { id: 'overview', name: 'Vue d\'ensemble', icon: Gauge },
            { id: 'leaderboard', name: 'Classement Firebase', icon: Trophy },
            { id: 'badges', name: 'Badges', icon: Award },
            { id: 'activity', name: 'Activité', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Statistiques principales - VRAIES DONNÉES FIREBASE */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">XP Total (Firebase)</p>
                      <p className="text-3xl font-bold">{totalXp.toLocaleString()}</p>
                    </div>
                    <Zap className="w-12 h-12 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Niveau Actuel</p>
                      <p className="text-3xl font-bold">{level}</p>
                    </div>
                    <Crown className="w-12 h-12 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Série de connexion</p>
                      <p className="text-3xl font-bold">{loginStreak}</p>
                    </div>
                    <Flame className="w-12 h-12 text-orange-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Badges obtenus</p>
                      <p className="text-3xl font-bold">{badges.length}</p>
                    </div>
                    <Medal className="w-12 h-12 text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Progression du niveau - VRAIES DONNÉES FIREBASE */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-400" />
                  Progression Niveau {level} → {level + 1} (Firebase)
                </h3>
                
                <div className="space-y-4">
                  <div className="relative">
                    <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                        initial={{ width: 0 }}
                        animate={{ width: `${calculations.progressPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      >
                        <span className="text-white text-xs font-bold">
                          {Math.round(calculations.progressPercent)}%
                        </span>
                      </motion.div>
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
                    <span className="text-gray-400">XP cette semaine</span>
                    <span className="text-white font-bold">{weeklyXp}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-400">XP ce mois</span>
                    <span className="text-white font-bold">{monthlyXp}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-400">Statut synchronisation</span>
                    <span className={`font-bold ${
                      syncStatus === 'synced' ? 'text-green-400' :
                      syncStatus === 'syncing' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {syncStatus === 'synced' ? '🟢 Synchronisé' :
                       syncStatus === 'syncing' ? '🟡 En cours' :
                       '🔴 Erreur'}
                    </span>
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
              <h3 className="text-2xl font-bold text-white">🏆 Classement Firebase Réel</h3>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Top 10 des utilisateurs</h4>
                
                {leaderboardLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-400">Chargement du classement Firebase...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {realLeaderboard.map((player) => (
                      <div
                        key={player.id}
                        className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
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
                    <h4 className="text-lg font-semibold text-white">Activités récentes</h4>
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <Activity className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{activity.description}</p>
                            <p className="text-gray-400 text-sm">{activity.timestamp}</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-bold">{activity.xp}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Aucune activité récente</p>
                    <p className="text-gray-500 text-sm">Complétez des tâches pour voir votre activité ici</p>
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
              <h3 className="text-2xl font-bold text-white">🏅 Collection de badges</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-6 rounded-2xl border transition-all ${
                      badge.earned
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-4xl mb-3 ${badge.earned ? '' : 'filter grayscale opacity-50'}`}>
                        {badge.icon}
                      </div>
                      <h4 className={`font-bold mb-2 ${badge.earned ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {badge.name}
                      </h4>
                      <p className={`text-sm ${badge.earned ? 'text-yellow-200' : 'text-gray-500'}`}>
                        {badge.description}
                      </p>
                      {badge.earned && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                            ✅ Obtenu
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tests XP en bas de page */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">🧪 Tests XP Firebase</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => addXP && addXP(10, 'test_button')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              +10 XP Test
            </button>
            
            <button
              onClick={() => addXP && addXP(25, 'task_completed')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              +25 XP Tâche
            </button>
            
            <button
              onClick={() => addXP && addXP(50, 'project_completed')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              +50 XP Projet
            </button>
            
            <button
              onClick={handleForceSync}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              🔄 Force Sync
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            Dernière sync: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Jamais'} • 
            Statut: {syncStatus} • 
            Données prêtes: {isReady ? '✅' : '❌'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPage;
