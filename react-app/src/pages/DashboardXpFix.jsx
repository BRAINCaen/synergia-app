// ==========================================
// 📁 react-app/src/pages/DashboardXpFix.jsx
// CORRECTION DASHBOARD - AFFICHAGE XP APRÈS INTÉGRATION
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useDashboardSyncFixed } from '../shared/hooks/useDashboardSyncFixed.js';
import { 
  BarChart3, 
  CheckSquare, 
  FolderOpen, 
  Users, 
  TrendingUp,
  Target,
  Clock,
  Award,
  Zap,
  Star,
  Trophy,
  Flame,
  RefreshCw,
  Activity,
  Calendar,
  Bell,
  ChevronRight,
  Plus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

/**
 * 🏠 DASHBOARD AVEC CORRECTION SYNCHRONISATION XP
 * Garantit que les XP d'intégration s'affichent correctement
 */
const DashboardXpFix = () => {
  const { user } = useAuthStore();
  
  // ✅ HOOK CORRIGÉ POUR SYNCHRONISATION XP
  const {
    topUsers,
    userProgress,
    teamStats,
    recentActivities,
    userRank,
    loading,
    error,
    lastUpdate,
    syncStatus,
    forceSync,
    forceSyncUserData,
    diagnoseUser
  } = useDashboardSyncFixed();

  const [viewMode, setViewMode] = useState('overview');
  const [showSyncStatus, setShowSyncStatus] = useState(false);
  const [diagnostic, setDiagnostic] = useState(null);

  // Afficher le statut de sync quand il change
  useEffect(() => {
    if (syncStatus === 'syncing' || syncStatus === 'synced' || syncStatus === 'error') {
      setShowSyncStatus(true);
      const timer = setTimeout(() => setShowSyncStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  // Diagnostic automatique si pas d'XP après 5 secondes
  useEffect(() => {
    if (!loading && userProgress && userProgress.totalXp === 0) {
      const timer = setTimeout(async () => {
        console.log('🔍 [DASHBOARD] Diagnostic automatique - XP à 0');
        const result = await diagnoseUser();
        setDiagnostic(result);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, userProgress, diagnoseUser]);

  /**
   * 📊 CALCUL DE LA PROGRESSION XP
   */
  const getXpProgress = () => {
    if (!userProgress) {
      return { current: 0, needed: 100, percentage: 0, xpToNext: 100 };
    }
    
    const level = userProgress.level;
    const totalXp = userProgress.totalXp;
    const currentLevelXp = (level - 1) * 100;
    const nextLevelXp = level * 100;
    const progressXp = totalXp - currentLevelXp;
    const xpToNext = nextLevelXp - totalXp;
    
    return {
      current: Math.max(0, progressXp),
      needed: 100,
      percentage: Math.min(100, Math.max(0, (progressXp / 100) * 100)),
      xpToNext: Math.max(0, xpToNext)
    };
  };

  /**
   * 🔧 BOUTON DE CORRECTION XP
   */
  const handleFixXp = async () => {
    try {
      console.log('🔧 [DASHBOARD] Tentative de correction XP...');
      await forceSyncUserData();
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur correction XP:', error);
    }
  };

  /**
   * 🎨 INDICATEUR DE STATUT DE SYNCHRONISATION
   */
  const SyncStatusIndicator = () => {
    if (!showSyncStatus) return null;

    const statusConfig = {
      syncing: { color: 'blue', icon: RefreshCw, text: 'Synchronisation...' },
      synced: { color: 'green', icon: CheckCircle, text: 'Données à jour' },
      error: { color: 'red', icon: AlertCircle, text: 'Erreur de sync' },
      ready: { color: 'green', icon: CheckCircle, text: 'Prêt' }
    };

    const config = statusConfig[syncStatus] || statusConfig.ready;
    const Icon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 right-4 z-50 bg-${config.color}-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`}
      >
        <Icon className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium">{config.text}</span>
      </motion.div>
    );
  };

  /**
   * 🎨 CARTE DE STATISTIQUE AVEC CORRECTION
   */
  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, onFix, showFix }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${color} p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 relative`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 opacity-80" />
        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+{trend}%</span>
          </div>
        )}
        {showFix && (
          <button
            onClick={onFix}
            className="bg-white/20 hover:bg-white/30 p-1 rounded transition-colors"
            title="Corriger les données"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm">{title}</div>
        {subtitle && <div className="text-xs opacity-75">{subtitle}</div>}
      </div>
    </motion.div>
  );

  /**
   * 🎨 CARTE DE PROGRESSION XP AVEC DIAGNOSTIC
   */
  const XpProgressCard = () => {
    const progress = getXpProgress();
    const hasIssue = userProgress && userProgress.totalXp === 0 && diagnostic;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-xl text-white shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-300" />
            <div>
              <h3 className="text-lg font-semibold">Ma Progression</h3>
              <p className="text-sm opacity-75">Niveau {userProgress?.level || 1}</p>
            </div>
          </div>
          
          {hasIssue && (
            <button
              onClick={handleFixXp}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Corriger
            </button>
          )}
        </div>

        {/* Barre de progression */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>{userProgress?.totalXp || 0} XP</span>
            <span>{progress.xpToNext} XP jusqu'au niveau suivant</span>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full"
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-xl font-bold">{userProgress?.tasksCompleted || 0}</div>
              <div className="text-xs opacity-75">Tâches</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{userProgress?.badges || 0}</div>
              <div className="text-xs opacity-75">Badges</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">#{userRank || '?'}</div>
              <div className="text-xs opacity-75">Rang</div>
            </div>
          </div>
        </div>

        {/* Diagnostic si problème */}
        {hasIssue && diagnostic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-400/30"
          >
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-red-300" />
              <span className="text-red-200">
                Problème détecté: {diagnostic.error || 'Données incohérentes'}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-gray-400">Chargement du dashboard...</div>
          {syncStatus && (
            <div className="text-sm text-gray-500">Statut: {syncStatus}</div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={forceSync}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Indicateur de synchronisation */}
        <AnimatePresence>
          <SyncStatusIndicator />
        </AnimatePresence>
        
        {/* En-tête Dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                👋 Bonjour, {user?.displayName || 'Brain'}
              </h1>
              <p className="text-gray-400">
                Voici votre tableau de bord Synergia
                {lastUpdate && (
                  <span className="ml-2 text-xs">
                    (Màj: {lastUpdate.toLocaleTimeString()})
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={forceSync}
                disabled={syncStatus === 'syncing'}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Progression XP */}
          <div className="lg:col-span-2">
            <XpProgressCard />
          </div>

          {/* Statistiques rapides */}
          <StatCard
            title="Mon Niveau"
            value={`Level ${userProgress?.level || 1}`}
            subtitle={`${userProgress?.totalXp || 0} XP Total`}
            icon={Star}
            color="from-orange-500 to-red-500"
            showFix={userProgress?.totalXp === 0}
            onFix={handleFixXp}
          />

          <StatCard
            title="Ma Position"
            value={userRank ? `#${userRank}` : '#?'}
            subtitle="Dans le classement"
            icon={Trophy}
            color="from-purple-500 to-pink-500"
          />
        </div>

        {/* Statistiques d'équipe */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Équipe"
            value={teamStats.totalUsers || 0}
            subtitle={`${teamStats.activeUsers || 0} actifs`}
            icon={Users}
            color="from-blue-500 to-cyan-500"
          />

          <StatCard
            title="XP Moyens"
            value={teamStats.averageXp || 0}
            subtitle="Par utilisateur"
            icon={Zap}
            color="from-green-500 to-emerald-500"
          />

          <StatCard
            title="Tâches Totales"
            value={teamStats.totalTasks || 0}
            subtitle={`${teamStats.averageTasks || 0} en moyenne`}
            icon={CheckSquare}
            color="from-indigo-500 to-purple-500"
          />

          <StatCard
            title="Badges"
            value={teamStats.activeBadges || 0}
            subtitle="Débloqués au total"
            icon={Award}
            color="from-yellow-500 to-orange-500"
          />
        </div>

        {/* Section inférieure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top Performers
              </h3>
              <span className="text-xs text-gray-400">{topUsers.length} utilisateurs</span>
            </div>

            <div className="space-y-3">
              {topUsers.slice(0, 5).map((user, index) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {user.rank}
                    </div>
                    <div>
                      <div className="font-medium text-white">{user.displayName}</div>
                      <div className="text-xs text-gray-400">Level {user.level}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-400">{user.totalXp} XP</div>
                    <div className="text-xs text-gray-400">{user.tasksCompleted} tâches</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activités récentes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Activités Récentes
              </h3>
              <span className="text-xs text-gray-400">{recentActivities.length} activités</span>
            </div>

            <div className="space-y-3">
              {recentActivities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-white">{activity.displayName}</div>
                      <div className="text-xs text-gray-400">{activity.message}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardXpFix;
