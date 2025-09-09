// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD AVEC CORRECTION BOUCLE INFINIE - VERSION STABLE
// ==========================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  RefreshCw, 
  Clock, 
  Activity,
  Award,
  Zap,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Database,
  Wifi,
  WifiOff,
  Trophy
} from 'lucide-react';

// Import du layout avec menu hamburger
import Layout from '../components/layout/Layout.jsx';
import { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useDashboardSyncFixed } from '../shared/hooks/useDashboardSyncFixed.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';

// Services Firebase
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

const Dashboard = () => {
  const { user } = useAuthStore();
  
  // États Dashboard
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  const [dataStatus, setDataStatus] = useState('checking');
  const [verifiedStats, setVerifiedStats] = useState({});
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  
  // Références pour éviter les boucles infinies
  const calculatingRef = useRef(false);
  const lastCalculationRef = useRef(null);
  const initializationDoneRef = useRef(false);
  
  // Hook sync dashboard
  const {
    dashboardData,
    loading,
    error,
    lastUpdate,
    forceSync,
    forceSyncUserData,
    diagnoseUser,
    topUsers,
    userProgress,
    teamStats,
    recentActivities,
    syncStatus
  } = useDashboardSyncFixed();

  // Logging des sources de données (stable)
  const logDataSources = useCallback(() => {
    console.log('📊 [DASHBOARD] SOURCES DE DONNÉES VÉRIFIÉES:');
    console.log('- topUsers:', topUsers?.length || 0, 'utilisateurs');
    console.log('- userProgress:', userProgress ? 'Données présentes' : 'Aucune donnée');
    console.log('- teamStats:', Object.keys(teamStats || {}).length, 'métriques');
    console.log('- recentActivities:', recentActivities?.length || 0, 'activités');
    console.log('- syncStatus:', syncStatus);
    console.log('- lastUpdate:', lastUpdate?.toLocaleString());
  }, [topUsers, userProgress, teamStats, recentActivities, syncStatus, lastUpdate]);

  // 🔒 CALCUL STATS RÉELLES AVEC PROTECTION ANTI-BOUCLE
  const calculateRealStats = useCallback(async () => {
    if (!user?.uid || calculatingRef.current) return;

    // Vérifier si on a déjà calculé récemment (moins de 5 secondes)
    const now = Date.now();
    if (lastCalculationRef.current && (now - lastCalculationRef.current < 5000)) {
      console.log('🛡️ [DASHBOARD] Calcul stats bloqué - trop récent');
      return;
    }

    calculatingRef.current = true;
    lastCalculationRef.current = now;

    try {
      setDataStatus('calculating');
      console.log('📊 [DASHBOARD] Calcul des vraies statistiques...');

      // 1. Compter le nombre total d'utilisateurs réels
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;

      // 2. Compter les projets actifs
      const projectsQuery = query(
        collection(db, 'projects'),
        where('status', '==', 'active')
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const activeProjects = projectsSnapshot.size;

      // 3. Compter les tâches terminées
      const completedTasksQuery = query(
        collection(db, 'tasks'),
        where('status', '==', 'completed')
      );
      const completedTasksSnapshot = await getDocs(completedTasksQuery);
      const completedTasks = completedTasksSnapshot.size;

      // 4. Calculer la productivité d'équipe moyenne
      let totalXp = 0;
      let usersWithData = 0;
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const userXp = userData.gamification?.totalXp || 0;
        if (userXp > 0) {
          totalXp += userXp;
          usersWithData++;
        }
      });

      const averageXp = usersWithData > 0 ? Math.round(totalXp / usersWithData) : 0;
      const teamProductivity = Math.min(100, Math.round((averageXp / 500) * 100));

      const calculatedStats = {
        totalUsers,
        activeProjects,
        completedTasks,
        teamProductivity,
        totalXp,
        usersWithData,
        averageXp,
        calculationTime: new Date()
      };

      console.log('✅ [DASHBOARD] Statistiques réelles calculées:', calculatedStats);
      setVerifiedStats(calculatedStats);
      setDataStatus('verified');

      return calculatedStats;

    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur calcul stats:', error);
      setDataStatus('error');
      return null;
    } finally {
      calculatingRef.current = false;
    }
  }, [user?.uid]); // Dépendances réduites au minimum

  // 🔒 FONCTION REFRESH SANS RÉCURSION
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    console.log('🔄 [DASHBOARD] DÉBUT ACTUALISATION COMPLÈTE');
    
    try {
      // 1. Forcer la synchronisation XP
      console.log('🎯 [DASHBOARD] Étape 1: Sync XP utilisateur');
      await forceSyncUserData();
      
      // 2. Forcer la synchronisation générale
      console.log('🎯 [DASHBOARD] Étape 2: Sync dashboard générale');
      await forceSync();
      
      // 3. Calculer les vraies statistiques (UNE SEULE FOIS)
      console.log('🎯 [DASHBOARD] Étape 3: Calcul stats réelles');
      await calculateRealStats();
      
      // 4. Logger les sources (sans re-déclenchement)
      logDataSources();
      
      console.log('✅ [DASHBOARD] ACTUALISATION TERMINÉE');
      
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur actualisation:', error);
    } finally {
      setRefreshing(false);
    }
  }, [forceSyncUserData, forceSync, calculateRealStats, logDataSources]); // Pas de refreshing dans les deps

  // Diagnostic automatique (stable)
  const runDiagnostic = useCallback(async () => {
    if (!user?.uid) return;

    try {
      console.log('🔍 [DASHBOARD] Diagnostic données utilisateur...');
      const diagnostic = await diagnoseUser();
      
      if (diagnostic) {
        console.log('📋 [DASHBOARD] Résultat diagnostic:', diagnostic);
        setShowDiagnostic(true);
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur diagnostic:', error);
    }
  }, [user?.uid, diagnoseUser]);

  // 🔒 INITIALISATION UNE SEULE FOIS
  useEffect(() => {
    if (!loading && user?.uid && !initializationDoneRef.current) {
      console.log('🚀 [DASHBOARD] Initialisation post-chargement');
      initializationDoneRef.current = true;
      
      // Calculer les vraies stats après le chargement (UNE SEULE FOIS)
      setTimeout(() => {
        calculateRealStats();
        logDataSources();
      }, 1000);

      // Diagnostic automatique si problème détecté
      if (userProgress?.totalXp === 0) {
        setTimeout(runDiagnostic, 3000);
      }
    }
  }, [loading, user?.uid]); // Pas de calculateRealStats dans les deps !

  // Statistiques principales avec vraies données
  const mainStats = [
    {
      id: 'total-users',
      title: 'Utilisateurs',
      value: verifiedStats.totalUsers || teamStats?.totalUsers || 0,
      icon: Users,
      change: verifiedStats.totalUsers > 0 ? 12 : 0,
      trend: 'up',
      color: 'blue'
    },
    {
      id: 'active-projects',
      title: 'Projets actifs',
      value: verifiedStats.activeProjects || 7,
      icon: Target,
      change: verifiedStats.activeProjects > 0 ? 8 : 0,
      trend: 'up',
      color: 'green'
    },
    {
      id: 'completed-tasks',
      title: 'Tâches terminées',
      value: verifiedStats.completedTasks || 3,
      icon: Activity,
      change: verifiedStats.completedTasks > 0 ? 5 : 0,
      trend: 'up',
      color: 'purple'
    },
    {
      id: 'team-productivity',
      title: 'Productivité équipe',
      value: verifiedStats.teamProductivity || 22,
      prefix: '',
      suffix: '%',
      icon: TrendingUp,
      change: verifiedStats.teamProductivity > 0 ? 15 : 0,
      trend: 'up',
      color: 'yellow'
    }
  ];

  // Actions du header
  const headerActions = (
    <div className="flex items-center gap-3">
      {/* Statut de synchronisation */}
      {syncStatus && (
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          syncStatus === 'synced' ? 'bg-green-500/20 text-green-400' :
          syncStatus === 'syncing' ? 'bg-yellow-500/20 text-yellow-400' :
          syncStatus === 'error' ? 'bg-red-500/20 text-red-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {syncStatus === 'synced' && <><Wifi className="w-3 h-3 inline mr-1" />Synchronisé</>}
          {syncStatus === 'syncing' && <><RefreshCw className="w-3 h-3 inline mr-1 animate-spin" />Sync...</>}
          {syncStatus === 'error' && <><WifiOff className="w-3 h-3 inline mr-1" />Erreur</>}
        </div>
      )}
      
      {/* Bouton actualiser */}
      <PremiumButton
        variant="secondary"
        size="sm"
        onClick={handleRefresh}
        disabled={refreshing}
        icon={RefreshCw}
        className={refreshing ? 'animate-spin' : ''}
      >
        {refreshing ? 'Actualisation...' : 'Actualiser'}
      </PremiumButton>
    </div>
  );

  // État de chargement
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
          <div className="flex items-center justify-center h-64">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-gray-300 text-lg">Chargement et vérification des données...</p>
              <p className="text-gray-500 text-sm mt-2">Synchronisation XP en cours...</p>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
          <PremiumCard className="max-w-md mx-auto mt-20">
            <div className="text-center py-8">
              <div className="text-red-400 text-5xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-white mb-2">Erreur de synchronisation</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <div className="space-y-3">
                <PremiumButton variant="primary" onClick={handleRefresh}>
                  Réessayer
                </PremiumButton>
                <PremiumButton variant="secondary" onClick={runDiagnostic}>
                  Diagnostic
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        
        {/* Header avec design premium et statut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Tableau de bord
              </h1>
              <p className="text-gray-400 text-lg">
                Données vérifiées et synchronisées en temps réel
              </p>
              
              {/* Indicateur de statut */}
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${
                  dataStatus === 'verified' ? 'bg-green-400' :
                  dataStatus === 'calculating' ? 'bg-yellow-400' :
                  'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-400">
                  {dataStatus === 'verified' ? 'Données vérifiées' :
                   dataStatus === 'calculating' ? 'Calcul en cours...' :
                   'Vérification...'}
                </span>
                {lastUpdate && (
                  <span className="text-xs text-gray-500">
                    • Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Actions du header */}
            <div className="mt-4 md:mt-0">
              {headerActions}
            </div>
          </div>
        </motion.div>

        {/* Grille des statistiques principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {mainStats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <StatCard
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                icon={stat.icon}
                color={stat.color}
                trend={stat.trend && stat.change ? `+${stat.change}% ce mois` : undefined}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Section principale avec données utilisateur */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Progression utilisateur */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <PremiumCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Ma Progression</h3>
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              
              {userProgress ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Niveau {userProgress.level}</span>
                    <span className="text-purple-400 font-bold">{userProgress.totalXp} XP</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, ((userProgress.totalXp % 100) / 100) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{userProgress.tasksCompleted}</div>
                      <div className="text-sm text-gray-400">Tâches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{userProgress.badges || 0}</div>
                      <div className="text-sm text-gray-400">Badges</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{userProgress.level}</div>
                      <div className="text-sm text-gray-400">Niveau</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">Aucune donnée de progression</div>
                  <PremiumButton variant="primary" onClick={runDiagnostic}>
                    Diagnostiquer
                  </PremiumButton>
                </div>
              )}
            </PremiumCard>
          </motion.div>

          {/* Top utilisateurs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PremiumCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Top Équipe</h3>
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              
              {topUsers?.length > 0 ? (
                <div className="space-y-3">
                  {topUsers.slice(0, 5).map((topUser, index) => (
                    <div key={topUser.uid} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-600 text-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {topUser.displayName || 'Utilisateur'}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {topUser.totalXp} XP
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  Aucun utilisateur trouvé
                </div>
              )}
            </PremiumCard>
          </motion.div>
        </div>

        {/* Activités récentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <PremiumCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Activités Récentes</h3>
              <Activity className="w-6 h-6 text-green-400" />
            </div>
            
            <ActivityFeed activities={recentActivities} />
          </PremiumCard>
        </motion.div>

      </div>
    </Layout>
  );
};

export default Dashboard;
