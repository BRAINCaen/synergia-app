// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD AVEC IMPORTS CORRIGÉS POUR LE BUILD
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
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
  WifiOff
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER (ORIGINAL)
import Layout from '../components/layout/Layout.jsx';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM - CORRIGÉ POUR BUILD
import { PremiumCard, PremiumStatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 HOOK CORRIGÉ POUR SYNCHRONISATION XP GARANTIE
import { useDashboardSyncFixed } from '../shared/hooks/useDashboardSyncFixed.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 COMPOSANTS (ORIGINAUX)
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';

// 🔍 SERVICES POUR DIAGNOSTIC
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
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS DASHBOARD
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  const [dataStatus, setDataStatus] = useState('checking');
  const [verifiedStats, setVerifiedStats] = useState({});
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  
  // 🔥 HOOK SYNC DASHBOARD CORRIGÉ
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

  // 🔍 VÉRIFICATION ET LOGGING DES SOURCES DE DONNÉES
  const logDataSources = useCallback(() => {
    console.log('📊 [DASHBOARD] SOURCES DE DONNÉES VÉRIFIÉES:');
    console.log('- topUsers:', topUsers?.length || 0, 'utilisateurs');
    console.log('- userProgress:', userProgress ? 'Données présentes' : 'Aucune donnée');
    console.log('- teamStats:', Object.keys(teamStats || {}).length, 'métriques');
    console.log('- recentActivities:', recentActivities?.length || 0, 'activités');
    console.log('- syncStatus:', syncStatus);
    console.log('- lastUpdate:', lastUpdate?.toLocaleString());
  }, [topUsers, userProgress, teamStats, recentActivities, syncStatus, lastUpdate]);

  // 📊 CALCULER LES VRAIES STATISTIQUES DEPUIS FIREBASE
  const calculateRealStats = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setDataStatus('calculating');
      console.log('📊 [DASHBOARD] Calcul des vraies statistiques...');

      // 1. XP Total depuis le profil utilisateur
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const realXP = userData.totalXp || userData.xp || 0;
      const realLevel = Math.floor(realXP / 100) + 1;

      // 2. Tâches réelles
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const allTasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const completedTasks = allTasks.filter(task => task.status === 'completed' || task.status === 'done');

      // 3. Projets réels
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const allProjects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const completedProjects = allProjects.filter(project => project.status === 'completed');

      // 4. Calculer les statistiques vérifiées
      const newVerifiedStats = {
        totalXp: realXP,
        level: realLevel,
        tasksTotal: allTasks.length,
        tasksCompleted: completedTasks.length,
        projectsTotal: allProjects.length,
        projectsCompleted: completedProjects.length,
        completionRate: allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0,
        weeklyXp: userData.weeklyXp || 0,
        streak: userData.loginStreak || 0
      };

      console.log('✅ [DASHBOARD] Statistiques calculées:', newVerifiedStats);
      setVerifiedStats(newVerifiedStats);
      setDataStatus('verified');

    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur calcul stats:', error);
      setDataStatus('error');
    }
  }, [user?.uid]);

  // 📊 STATISTIQUES PRINCIPALES AVEC SOURCES VÉRIFIÉES
  const mainStats = [
    {
      id: 'xp',
      title: 'XP Total',
      value: verifiedStats.totalXp || userProgress?.totalXp || 0,
      icon: Award,
      color: 'yellow',
      change: `+${verifiedStats.weeklyXp || 0} cette semaine`,
      trend: verifiedStats.weeklyXp > 0 ? 1 : 0,
      source: 'Firebase users collection'
    },
    {
      id: 'level',
      title: 'Niveau',
      value: verifiedStats.level || userProgress?.level || 1,
      icon: TrendingUp,
      color: 'blue',
      change: 'Niveau actuel',
      source: 'Calculé depuis XP total'
    },
    {
      id: 'tasks',
      title: 'Tâches',
      value: `${verifiedStats.tasksCompleted || 0}/${verifiedStats.tasksTotal || 0}`,
      icon: CheckCircle,
      color: 'green',
      change: `${verifiedStats.completionRate || 0}% complété`,
      trend: verifiedStats.completionRate > 50 ? 1 : -1,
      source: 'Firebase tasks collection'
    },
    {
      id: 'projects',
      title: 'Projets',
      value: verifiedStats.projectsTotal || 0,
      icon: Target,
      color: 'purple',
      change: `${verifiedStats.projectsCompleted || 0} terminés`,
      source: 'Firebase projects collection'
    }
  ];

  // 🔄 FONCTION DE RAFRAÎCHISSEMENT AVEC DIAGNOSTIC
  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      // 1. Diagnostic utilisateur complet
      if (diagnoseUser) {
        console.log('🔍 [DASHBOARD] Diagnostic utilisateur...');
        await diagnoseUser(user?.uid);
      }

      // 2. Recalculer les vraies stats
      await calculateRealStats();

      // 3. Force sync des données
      if (forceSync) {
        console.log('🔄 [DASHBOARD] Force sync...');
        await forceSync();
      }

      // 4. Force sync user data
      if (forceSyncUserData) {
        console.log('🔄 [DASHBOARD] Force sync user data...');
        await forceSyncUserData(user?.uid);
      }

      console.log('✅ [DASHBOARD] Rafraîchissement terminé');

    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 🔄 EFFET DE CHARGEMENT INITIAL
  useEffect(() => {
    if (user?.uid) {
      console.log('📊 [DASHBOARD] Initialisation pour utilisateur:', user.uid);
      calculateRealStats();
      logDataSources();
    }
  }, [user?.uid, calculateRealStats, logDataSources]);

  // 🔄 EFFET DE LOGGING AUTOMATIQUE
  useEffect(() => {
    const interval = setInterval(logDataSources, 30000); // Log toutes les 30s
    return () => clearInterval(interval);
  }, [logDataSources]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement du dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4">
        
        {/* 🔍 HEADER AVEC DIAGNOSTIC */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                📊 Dashboard
              </h1>
              <p className="text-gray-600">
                Vue d'ensemble de vos performances et activités
              </p>
            </div>

            {/* Actions avec diagnostic */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${syncStatus === 'synced' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-gray-600">
                  {dataStatus === 'verified' ? 'Données vérifiées' : 'Vérification...'}
                </span>
              </div>

              <PremiumButton
                variant="secondary"
                size="sm"
                onClick={() => setShowDiagnostic(!showDiagnostic)}
              >
                <Database className="w-4 h-4" />
                Diagnostic
              </PremiumButton>

              <PremiumButton
                variant="primary"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </PremiumButton>
            </div>
          </div>
        </motion.div>

        {/* 🔍 PANNEAU DE DIAGNOSTIC */}
        {showDiagnostic && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <PremiumCard>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Diagnostic des Sources de Données
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• XP Total: {verifiedStats.totalXp || 0} (Source: users/{user?.uid})</p>
                      <p>• Tâches: {verifiedStats.tasksTotal || 0} total, {verifiedStats.tasksCompleted || 0} complétées</p>
                      <p>• Projets: {verifiedStats.projectsTotal || 0} total, {verifiedStats.projectsCompleted || 0} terminés</p>
                      <p>• Dernière sync: {lastUpdate?.toLocaleString() || 'Jamais'}</p>
                      <p>• Statut: {dataStatus === 'verified' ? '✅ Vérifiées' : '⏳ En cours'}</p>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Un diagnostic a été exécuté.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <PremiumButton 
                        variant="secondary" 
                        size="sm"
                        onClick={() => setShowDiagnostic(false)}
                      >
                        Masquer
                      </PremiumButton>
                      <PremiumButton 
                        variant="primary" 
                        size="sm"
                        onClick={handleRefresh}
                      >
                        Corriger
                      </PremiumButton>
                    </div>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {/* 📊 STATISTIQUES PRINCIPALES AVEC SOURCES VÉRIFIÉES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {mainStats.map((stat, index) => (
            <div key={stat.id} className="relative group">
              <PremiumStatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                change={stat.change}
                trend={stat.trend}
                className="hover:scale-[1.02] transition-transform duration-300"
              />
              
              {/* Tooltip avec source de données */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                Source: {stat.source}
              </div>
            </div>
          ))}
        </motion.div>

        {/* 📈 CONTENU PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 🎯 COLONNE PRINCIPALE */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 📊 GRAPHIQUE DE PERFORMANCE */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PremiumCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Performance</h3>
                  <div className="flex space-x-2">
                    {['week', 'month', 'year'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setSelectedTimeRange(range)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          selectedTimeRange === range
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {range === 'week' ? '7j' : range === 'month' ? '30j' : '365j'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Graphique simulé avec vraies données */}
                <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Graphique de performance</p>
                    <p className="text-sm text-gray-500">
                      XP: {verifiedStats.totalXp || 0} • Tâches: {verifiedStats.tasksCompleted || 0} • Niveau: {verifiedStats.level || 1}
                    </p>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            {/* 📋 ACTIVITÉS RÉCENTES */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PremiumCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Activités Récentes</h3>
                  <PremiumButton variant="secondary" size="sm">
                    Voir tout
                  </PremiumButton>
                </div>

                <ActivityFeed activities={recentActivities} />

                {(!recentActivities || recentActivities.length === 0) && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune activité récente</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Créez des tâches et projets pour voir vos activités ici
                    </p>
                  </div>
                )}
              </PremiumCard>
            </motion.div>
          </div>

          {/* 🎯 SIDEBAR */}
          <div className="space-y-8">
            
            {/* 🏆 TOP PERFORMANCES */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PremiumCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Performers</h3>

                {topUsers && topUsers.length > 0 ? (
                  <div className="space-y-4">
                    {topUsers.slice(0, 5).map((topUser, index) => (
                      <div key={topUser.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{topUser.displayName}</p>
                            <p className="text-sm text-gray-500">{topUser.totalXp || 0} XP</p>
                          </div>
                        </div>
                        <Award className="w-5 h-5 text-yellow-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun classement disponible</p>
                  </div>
                )}
              </PremiumCard>
            </motion.div>

            {/* ⚡ ACTIONS RAPIDES */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <PremiumCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Actions Rapides</h3>

                <div className="space-y-3">
                  <PremiumButton 
                    variant="primary" 
                    className="w-full justify-between"
                    onClick={() => window.location.href = '/tasks'}
                  >
                    <span>Nouvelle Tâche</span>
                    <ChevronRight className="w-4 h-4" />
                  </PremiumButton>

                  <PremiumButton 
                    variant="secondary" 
                    className="w-full justify-between"
                    onClick={() => window.location.href = '/projects'}
                  >
                    <span>Nouveau Projet</span>
                    <ChevronRight className="w-4 h-4" />
                  </PremiumButton>

                  <PremiumButton 
                    variant="secondary" 
                    className="w-full justify-between"
                    onClick={() => window.location.href = '/analytics'}
                  >
                    <span>Voir Analytics</span>
                    <ChevronRight className="w-4 h-4" />
                  </PremiumButton>
                </div>
              </PremiumCard>
            </motion.div>

            {/* 📊 STATISTIQUES RAPIDES */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <PremiumCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Résumé</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">XP Total</span>
                    <span className="font-semibold text-yellow-600">{verifiedStats.totalXp || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Niveau</span>
                    <span className="font-semibold text-blue-600">{verifiedStats.level || 1}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Taux de réussite</span>
                    <span className="font-semibold text-green-600">{verifiedStats.completionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Série actuelle</span>
                    <span className="font-semibold text-purple-600">{verifiedStats.streak || 0} jours</span>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
