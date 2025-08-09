// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// PAGE GAMIFICATION AVEC SYNCHRONISATION XP UNIFÉE - CODE COMPLET
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Crown, 
  Zap, 
  Target, 
  Flame,
  Award,
  TrendingUp,
  Calendar,
  RefreshCw,
  CheckCircle,
  Clock,
  BarChart3,
  Gift,
  Users,
  ArrowUp,
  Plus
} from 'lucide-react';
import { useUnifiedXP } from '../shared/hooks/useUnifiedXP.js';

/**
 * 🏆 PAGE GAMIFICATION AVEC SYNCHRONISATION XP GARANTIE - VERSION COMPLÈTE
 * Utilise le système de synchronisation unifié pour des données toujours à jour
 */
const GamificationPage = () => {
  // ✅ HOOK UNIFIÉ POUR TOUTES LES DONNÉES XP
  const {
    gamificationData,
    level,
    totalXp,
    weeklyXp,
    monthlyXp,
    badges,
    badgeCount,
    loginStreak,
    levelProgress,
    xpToNextLevel,
    stats,
    loading,
    error,
    isReady,
    syncStatus,
    lastUpdate,
    addXP,
    forceSync,
    quickActions
  } = useUnifiedXP();

  // États locaux pour l'interface
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showSyncIndicator, setShowSyncIndicator] = useState(false);

  // Montrer l'indicateur de sync quand les données se mettent à jour
  useEffect(() => {
    if (syncStatus === 'synchronized' || syncStatus === 'updating') {
      setShowSyncIndicator(true);
      const timer = setTimeout(() => setShowSyncIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus, lastUpdate]);

  // Animation XP quand totalXp change
  useEffect(() => {
    if (totalXp > 0) {
      setShowXpAnimation(true);
      const timer = setTimeout(() => setShowXpAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [totalXp]);

  /**
   * 🎯 TEST D'AJOUT XP
   */
  const handleTestXP = async () => {
    try {
      const result = await addXP(25, 'manual_test', { 
        source: 'gamification_page',
        timestamp: new Date().toISOString()
      });
      
      if (result.success) {
        console.log('✅ Test XP réussi:', result);
      }
    } catch (error) {
      console.error('❌ Erreur test XP:', error);
    }
  };

  /**
   * 🔄 FORCER SYNCHRONISATION
   */
  const handleForceSync = async () => {
    try {
      await forceSync();
      console.log('✅ Synchronisation forcée réussie');
    } catch (error) {
      console.error('❌ Erreur synchronisation forcée:', error);
    }
  };

  // ⏳ CHARGEMENT
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg">Chargement de votre progression...</p>
          <p className="text-gray-400 text-sm mt-2">Synchronisation: {syncStatus}</p>
        </div>
      </div>
    );
  }

  // ❌ ERREUR
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Erreur de synchronisation</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleForceSync}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🔄 INDICATEUR DE SYNCHRONISATION */}
        <AnimatePresence>
          {showSyncIndicator && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Données synchronisées</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🎯 ANIMATION XP */}
        <AnimatePresence>
          {showXpAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl shadow-2xl text-2xl font-bold">
                +XP
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📊 EN-TÊTE AVEC STATISTIQUES PRINCIPALES */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Gamification</h1>
            <button
              onClick={handleForceSync}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Synchroniser"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-gray-300 text-lg">
            Suivez votre progression et débloquez des récompenses
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Dernière mise à jour: {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : 'En cours...'}
          </p>
        </motion.div>

        {/* 🎯 STATISTIQUES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* XP Total */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{totalXp.toLocaleString()}</p>
                <p className="text-gray-300 text-sm">XP Total</p>
                {weeklyXp > 0 && (
                  <p className="text-green-400 text-xs">+{weeklyXp} cette semaine</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Niveau */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">Niveau {level}</p>
                <p className="text-gray-300 text-sm">{Math.round(levelProgress)}% vers niveau {level + 1}</p>
                <div className="w-24 h-2 bg-gray-700 rounded-full mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tâches Complétées */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{gamificationData?.tasksCompleted || 0}</p>
                <p className="text-gray-300 text-sm">Tâches Complétées</p>
                {stats?.completionRate && (
                  <p className="text-green-400 text-xs">{stats.completionRate}% de réussite</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Série de Connexions */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-3 rounded-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{loginStreak}</p>
                <p className="text-gray-300 text-sm">Jours de Suite</p>
                <p className="text-orange-400 text-xs">Série active</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 📈 PROGRESSION DÉTAILLÉE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progression Niveau */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Progression Niveau</h3>
              <div className="text-sm text-gray-400">
                {xpToNextLevel} XP restants
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Niveau {level}</span>
                <span>Niveau {level + 1}</span>
              </div>
              
              <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                ></motion.div>
              </div>
              
              <div className="text-center">
                <p className="text-white font-semibold">{Math.round(levelProgress)}% Complété</p>
                <p className="text-gray-400 text-sm">{totalXp % 100}/100 XP dans ce niveau</p>
              </div>
            </div>
          </motion.div>

          {/* Statistiques Avancées */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Statistiques</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">XP Hebdomadaire</span>
                <span className="text-white font-semibold">{weeklyXp}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">XP Mensuel</span>
                <span className="text-white font-semibold">{monthlyXp}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Moyenne Quotidienne</span>
                <span className="text-white font-semibold">
                  {stats?.weeklyAverage || 0} XP
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Score Productivité</span>
                <span className="text-white font-semibold">
                  {stats?.productivityScore || 0}/100
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Badges Débloqués</span>
                <span className="text-white font-semibold">{badgeCount}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 🏆 BADGES ET RÉCOMPENSES */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              Badges et Récompenses
            </h3>
            <span className="text-gray-400">{badgeCount} débloqués</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map((badge, index) => (
              <motion.div 
                key={badge.id || index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-xl text-center hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="text-2xl mb-2">{badge.icon || '🏆'}</div>
                <p className="text-white text-sm font-semibold">{badge.name || badge}</p>
              </motion.div>
            ))}
            
            {/* Badges à débloquer */}
            {Array.from({ length: Math.max(0, 6 - badgeCount) }).map((_, index) => (
              <div 
                key={`locked-${index}`}
                className="bg-gray-700 p-4 rounded-xl text-center opacity-50"
              >
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-gray-400 text-sm">À débloquer</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 🎯 ACTIONS RAPIDES */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8"
        >
          <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-400" />
            Actions Rapides
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleTestXP}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex flex-col items-center gap-2"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">+25 XP Test</span>
            </button>
            
            <button
              onClick={() => quickActions.completeTask('medium', 'Tâche test')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex flex-col items-center gap-2"
            >
              <CheckCircle className="w-6 h-6" />
              <span className="text-sm font-medium">Tâche Terminée</span>
            </button>
            
            <button
              onClick={() => quickActions.createProject('Projet test')}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all flex flex-col items-center gap-2"
            >
              <Award className="w-6 h-6" />
              <span className="text-sm font-medium">Nouveau Projet</span>
            </button>
            
            <button
              onClick={handleForceSync}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all flex flex-col items-center gap-2"
            >
              <RefreshCw className="w-6 h-6" />
              <span className="text-sm font-medium">Synchroniser</span>
            </button>
          </div>
        </motion.div>

        {/* 📊 HISTORIQUE XP (si disponible) */}
        {gamificationData?.xpHistory && gamificationData.xpHistory.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-400" />
              Historique Récent
            </h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {gamificationData.xpHistory.slice(-10).reverse().map((entry, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm font-medium">+{entry.amount} XP</p>
                      <p className="text-gray-400 text-xs">{entry.source}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-sm">{entry.totalAfter} XP total</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(entry.timestamp).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 🔧 DIAGNOSTIC (MODE DEV) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-8 bg-black/20 rounded-lg p-4 text-xs text-gray-400"
          >
            <h4 className="text-white font-medium mb-2">🔧 Diagnostic Développeur</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <strong>Sync Status:</strong> {syncStatus}
              </div>
              <div>
                <strong>Dernière MAJ:</strong> {lastUpdate?.toLocaleTimeString() || 'N/A'}
              </div>
              <div>
                <strong>Données prêtes:</strong> {isReady ? '✅' : '❌'}
              </div>
              <div>
                <strong>Total XP:</strong> {totalXp}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GamificationPage;
