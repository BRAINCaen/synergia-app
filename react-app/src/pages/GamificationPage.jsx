// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// VRAIES DONNÉES FIREBASE - PLUS DE MOCK !
// TESTS FIREBASE SUPPRIMÉS - ERREUR SYNC DIAGNOSTIQUÉE
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
  Shield,
  AlertTriangle
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

  // ✅ RÉCUPÉRER LE LEADERBOARD RÉEL DEPUIS FIREBASE
  useEffect(() => {
    const fetchRealLeaderboard = async () => {
      try {
        setLeaderboardLoading(true);
        
        const usersRef = collection(db, 'users');
        const leaderboardQuery = query(
          usersRef,
          orderBy('gamification.totalXp', 'desc'),
          limit(10)
        );
        
        const snapshot = await getDocs(leaderboardQuery);
        const leaderboardData = [];
        
        snapshot.forEach((doc) => {
          const userData = doc.data();
          const gamificationData = userData.gamification || {};
          
          leaderboardData.push({
            id: doc.id,
            name: cleanDisplayName(userData),
            totalXp: gamificationData.totalXp || 0,
            level: gamificationData.level || 1,
            badges: gamificationData.badges || [],
            tasksCompleted: gamificationData.tasksCompleted || 0
          });
        });
        
        setRealLeaderboard(leaderboardData);
        console.log('✅ Leaderboard Firebase récupéré:', leaderboardData.length, 'utilisateurs');
        
      } catch (error) {
        console.error('❌ Erreur récupération leaderboard:', error);
        setRealLeaderboard([]);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    if (isAuthenticated && isReady) {
      fetchRealLeaderboard();
    }
  }, [isAuthenticated, isReady]);

  // ✅ CALCULER LES MÉTRIQUES XP RÉELLES
  const xpToNextLevel = ((level + 1) * 100) - (totalXp % 100);
  const progressToNextLevel = ((totalXp % 100) / 100) * 100;

  // ✅ ACTIVITÉS RÉCENTES RÉELLES DEPUIS FIREBASE
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

  // 🔍 DIAGNOSTIC DE L'ERREUR DE SYNCHRONISATION
  const getSyncErrorDiagnosis = () => {
    if (syncStatus === 'error' || syncStatus === 'failed') {
      return {
        level: 'error',
        title: 'Erreur de synchronisation Firebase',
        message: 'La synchronisation avec Firebase a échoué. Données possiblement obsolètes.',
        causes: [
          'Problème de connexion réseau',
          'Permissions Firebase manquantes',
          'Service de synchronisation non initialisé',
          'Structure de données incorrecte'
        ],
        solutions: [
          'Vérifier la connexion internet',
          'Actualiser la page',
          'Forcer la synchronisation',
          'Contacter l\'administrateur si le problème persiste'
        ]
      };
    }
    
    if (syncStatus === 'syncing') {
      return {
        level: 'warning',
        title: 'Synchronisation en cours',
        message: 'Les données sont en cours de synchronisation avec Firebase.',
        causes: ['Synchronisation normale en cours'],
        solutions: ['Attendre la fin de la synchronisation']
      };
    }
    
    if (!isReady) {
      return {
        level: 'info',
        title: 'Chargement des données',
        message: 'Connexion à Firebase et récupération des données utilisateur.',
        causes: ['Première connexion', 'Initialisation du service'],
        solutions: ['Patienter le temps du chargement initial']
      };
    }
    
    return null;
  };

  const syncDiagnosis = getSyncErrorDiagnosis();

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
          
          {/* Diagnostic en temps réel */}
          {syncDiagnosis && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-medium text-white">{syncDiagnosis.title}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{syncDiagnosis.message}</p>
                <div className="text-xs text-gray-400">
                  Status: {syncStatus} • Prêt: {isReady ? 'Oui' : 'Non'}
                </div>
              </div>
            </div>
          )}
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
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Gamification Firebase</h1>
                <p className="text-purple-200">Vraies données synchronisées</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Diagnostic d'erreur de synchronisation */}
              {syncDiagnosis && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  syncDiagnosis.level === 'error' ? 'bg-red-500/20 border border-red-500/40' :
                  syncDiagnosis.level === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/40' :
                  'bg-blue-500/20 border border-blue-500/40'
                }`}>
                  <AlertTriangle className={`w-4 h-4 ${
                    syncDiagnosis.level === 'error' ? 'text-red-400' :
                    syncDiagnosis.level === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`} />
                  <span className="text-sm text-white">{syncDiagnosis.title}</span>
                </div>
              )}
              
              <button
                onClick={handleForceSync}
                disabled={isRefreshing || !forceSync}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isRefreshing || !forceSync 
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
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Contenu des onglets */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Profil utilisateur avec vraies données */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{level}</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                      </h2>
                      <p className="text-purple-200 mb-4">Niveau {level} • {totalXp} XP total</p>
                      
                      {/* Barre de progression niveau */}
                      <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${progressToNextLevel}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-400">
                        {xpToNextLevel} XP jusqu'au niveau {level + 1}
                      </p>
                    </div>
                  </div>

                  {/* Stats principales */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4 text-center">
                      <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{gamificationData?.tasksCompleted || 0}</div>
                      <div className="text-sm text-green-300">Tâches terminées</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-4 text-center">
                      <Flame className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{loginStreak}</div>
                      <div className="text-sm text-blue-300">Jours consécutifs</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/30 rounded-xl p-4 text-center">
                      <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{badges.length}</div>
                      <div className="text-sm text-purple-300">Badges obtenus</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                      <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{weeklyXp}</div>
                      <div className="text-sm text-yellow-300">XP cette semaine</div>
                    </div>
                  </div>
                </div>

                {/* Activité récente - VRAIES DONNÉES */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-purple-400" />
                    Activité récente Firebase
                  </h3>
                  
                  {recentActivities.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <Plus className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <div className="text-white font-medium">{activity.description}</div>
                              <div className="text-sm text-gray-400">{activity.timestamp}</div>
                            </div>
                          </div>
                          <span className="text-green-400 font-bold">{activity.xp}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucune activité récente</p>
                    </div>
                  )}
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

                {/* Diagnostic détaillé en cas d'erreur */}
                {syncDiagnosis && syncDiagnosis.level === 'error' && (
                  <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <h4 className="text-red-400 font-semibold mb-2">Diagnostic d'erreur</h4>
                    <p className="text-sm text-gray-300 mb-3">{syncDiagnosis.message}</p>
                    
                    <div className="mb-3">
                      <h5 className="text-xs font-semibold text-red-400 mb-1">Causes possibles:</h5>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {syncDiagnosis.causes.map((cause, index) => (
                          <li key={index}>• {cause}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-semibold text-red-400 mb-1">Solutions:</h5>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {syncDiagnosis.solutions.map((solution, index) => (
                          <li key={index}>• {solution}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-8 space-y-6"
            >
              <h3 className="text-2xl font-bold text-white">🏆 Classement Firebase Réel</h3>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Top 10 des utilisateurs</h4>
                
                {leaderboardLoading ? (
                  <div className="space-y-3">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                        <div className="w-8 h-8 bg-gray-600 rounded"></div>
                        <div className="flex-1 h-4 bg-gray-600 rounded"></div>
                        <div className="w-16 h-4 bg-gray-600 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : realLeaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {realLeaderboard.map((player, index) => (
                      <div key={player.id} className={`flex items-center justify-between p-4 rounded-lg ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' : 'bg-gray-700/50'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-yellow-900' :
                            index === 1 ? 'bg-gray-300 text-gray-800' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-white font-medium">{player.name}</div>
                            <div className="text-sm text-gray-400">Niveau {player.level} • {player.tasksCompleted} tâches</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{player.totalXp} XP</div>
                          <div className="text-sm text-gray-400">{player.badges.length} badges</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun utilisateur dans le classement</p>
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
              className="mt-8 space-y-6"
            >
              <h3 className="text-2xl font-bold text-white">🏅 Collection de badges Firebase</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableBadges.map((badge) => (
                  <div key={badge.id} className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-6 text-center transition-all ${
                    badge.earned 
                      ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10' 
                      : 'border-white/10 hover:border-white/20'
                  }`}>
                    <div className={`text-6xl mb-4 transition-all ${badge.earned ? '' : 'filter grayscale opacity-50'}`}>
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
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-8 space-y-6"
            >
              <h3 className="text-2xl font-bold text-white">📊 Historique d'activité Firebase</h3>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                {recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Zap className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{activity.description}</div>
                            <div className="text-sm text-gray-400">{activity.timestamp}</div>
                          </div>
                        </div>
                        <span className="text-purple-400 font-bold">{activity.xp}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h4 className="text-lg font-medium mb-2">Aucune activité enregistrée</h4>
                    <p className="text-sm">Vos actions et gains d'XP apparaîtront ici</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GamificationPage;
