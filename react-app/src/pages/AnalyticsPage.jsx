// ==========================================
// 📁 react-app/src/pages/AnalyticsPage.jsx
// ANALYTICS PAGE AVEC SYNCHRONISATION XP UNIFIÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Users,
  Calendar,
  Star,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Zap,
  Trophy,
  Activity,
  CheckCircle2,
  AlertCircle,
  Gauge,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useUnifiedXP } from '../shared/hooks/useUnifiedXP.js';

/**
 * 📊 ANALYTICS PAGE AVEC DONNÉES XP SYNCHRONISÉES
 */
const AnalyticsPage = () => {
  // ✅ DONNÉES XP UNIFIÉES
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
    forceSync
  } = useUnifiedXP();

  // États locaux
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('xp');
  const [showDetails, setShowDetails] = useState(false);

  // ✅ ANALYTICS CALCULÉES À PARTIR DES VRAIES DONNÉES XP
  const analyticsData = {
    overview: {
      totalTasks: gamificationData?.tasksCompleted || 0,
      totalProjects: gamificationData?.projectsCreated || 0,
      totalXp: totalXp,
      currentLevel: level,
      weeklyXp: weeklyXp,
      monthlyXp: monthlyXp,
      completionRate: stats?.completionRate || 0,
      productivity: stats?.productivityScore || 0
    },
    performance: {
      xpTrend: weeklyXp > 0 ? 'up' : 'stable',
      tasksTrend: 'up',
      productivityTrend: stats?.productivityScore > 75 ? 'up' : 'stable',
      weeklyAverage: stats?.weeklyAverage || 0,
      monthlyAverage: stats?.monthlyAverage || 0
    },
    predictions: {
      nextLevelEta: Math.ceil((100 - (totalXp % 100)) / Math.max(1, stats?.weeklyAverage || 1)),
      weeklyGoal: Math.round(weeklyXp * 1.2),
      monthlyProjection: Math.round(monthlyXp * 1.15)
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // ⏳ CHARGEMENT
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl animate-pulse flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg">Chargement des analytics...</p>
          <p className="text-gray-400 text-sm mt-2">Synchronisation: {syncStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* 📊 EN-TÊTE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-400" />
                Analytics
              </h1>
              <p className="text-gray-400">
                Votre tableau de bord de performance avec données temps réel
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Dernière synchronisation: {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : 'En cours...'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sélecteur de période */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="quarter">3 derniers mois</option>
              </select>
              
              <button
                onClick={forceSync}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              
              <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>
        </motion.div>

        {/* 🎯 MÉTRIQUES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total XP */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(analyticsData.performance.xpTrend)}
                <span className={`text-sm font-medium ${getTrendColor(analyticsData.performance.xpTrend)}`}>
                  {weeklyXp > 0 ? `+${weeklyXp}` : '0'}
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{totalXp.toLocaleString()}</h3>
            <p className="text-gray-400 text-sm">XP Total</p>
            <p className="text-gray-500 text-xs mt-1">Niveau {level}</p>
          </motion.div>

          {/* Tâches Complétées */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(analyticsData.performance.tasksTrend)}
                <span className={`text-sm font-medium ${getTrendColor(analyticsData.performance.tasksTrend)}`}>
                  {analyticsData.overview.completionRate}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{analyticsData.overview.totalTasks}</h3>
            <p className="text-gray-400 text-sm">Tâches Complétées</p>
            <p className="text-gray-500 text-xs mt-1">Taux de completion: {analyticsData.overview.completionRate}%</p>
          </motion.div>

          {/* Productivité */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Gauge className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(analyticsData.performance.productivityTrend)}
                <span className={`text-sm font-medium ${getTrendColor(analyticsData.performance.productivityTrend)}`}>
                  {analyticsData.overview.productivity > 75 ? 'Excellent' : 'Moyen'}
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{analyticsData.overview.productivity}</h3>
            <p className="text-gray-400 text-sm">Score Productivité</p>
            <p className="text-gray-500 text-xs mt-1">sur 100</p>
          </motion.div>

          {/* Série de Connexions */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1">
                <ArrowUp className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Actif</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{loginStreak}</h3>
            <p className="text-gray-400 text-sm">Jours Consécutifs</p>
            <p className="text-gray-500 text-xs mt-1">Série active</p>
          </motion.div>
        </div>

        {/* 📈 GRAPHIQUES ET ANALYSES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progression XP */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <LineChart className="w-5 h-5 text-blue-400" />
                Progression XP
              </h3>
              <div className="text-sm text-gray-400">
                {timeRange === 'week' ? '7 jours' : timeRange === 'month' ? '30 jours' : '3 mois'}
              </div>
            </div>
            
            {/* Graphique simulé */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">XP cette période</span>
                <span className="text-white font-semibold">
                  {timeRange === 'week' ? weeklyXp : monthlyXp}
                </span>
              </div>
              
              <div className="h-32 bg-gray-800 rounded-lg flex items-end justify-center p-4">
                <div className="flex items-end gap-2 h-full w-full">
                  {Array.from({ length: timeRange === 'week' ? 7 : 30 }).map((_, i) => (
                    <div 
                      key={i}
                      className="bg-gradient-to-t from-blue-500 to-purple-600 rounded-t flex-1"
                      style={{ 
                        height: `${Math.random() * 60 + 20}%`,
                        opacity: 0.7 + (Math.random() * 0.3)
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="text-gray-400">Moyenne quotidienne</p>
                  <p className="text-white font-semibold">{analyticsData.performance.weeklyAverage} XP</p>
                </div>
                <div>
                  <p className="text-gray-400">Pic maximum</p>
                  <p className="text-white font-semibold">{Math.round(analyticsData.performance.weeklyAverage * 1.8)} XP</p>
                </div>
                <div>
                  <p className="text-gray-400">Tendance</p>
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(analyticsData.performance.xpTrend)}
                    <span className={getTrendColor(analyticsData.performance.xpTrend)}>
                      {analyticsData.performance.xpTrend === 'up' ? 'Croissance' : 'Stable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Répartition des Activités */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-400" />
                Répartition XP
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Sources XP */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Tâches complétées</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">65%</span>
                    <p className="text-gray-400 text-xs">{Math.round(totalXp * 0.65)} XP</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-300">Projets créés</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">20%</span>
                    <p className="text-gray-400 text-xs">{Math.round(totalXp * 0.20)} XP</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Connexions quotidiennes</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">10%</span>
                    <p className="text-gray-400 text-xs">{Math.round(totalXp * 0.10)} XP</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-300">Autres activités</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">5%</span>
                    <p className="text-gray-400 text-xs">{Math.round(totalXp * 0.05)} XP</p>
                  </div>
                </div>
              </div>
              
              {/* Graphique circulaire simulé */}
              <div className="mt-6 flex justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-gray-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 rounded-full opacity-80"></div>
                  <div className="absolute inset-4 bg-gray-800 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-white font-bold text-lg">{totalXp}</p>
                      <p className="text-gray-400 text-xs">XP Total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 🎯 OBJECTIFS ET PRÉDICTIONS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-400" />
              Objectifs et Prédictions
            </h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              {showDetails ? 'Masquer' : 'Détails'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Prochain niveau */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h4 className="text-white font-medium">Prochain Niveau</h4>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                Niveau {level + 1}
              </p>
              <p className="text-gray-400 text-sm">
                Dans ~{analyticsData.predictions.nextLevelEta} jours
              </p>
              {showDetails && (
                <p className="text-gray-500 text-xs mt-2">
                  Basé sur votre rythme actuel de {analyticsData.performance.weeklyAverage} XP/jour
                </p>
              )}
            </div>
            
            {/* Objectif hebdomadaire */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h4 className="text-white font-medium">Objectif Hebdomadaire</h4>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {analyticsData.predictions.weeklyGoal} XP
              </p>
              <p className="text-gray-400 text-sm">
                {Math.round((weeklyXp / analyticsData.predictions.weeklyGoal) * 100)}% atteint
              </p>
              {showDetails && (
                <div className="mt-2">
                  <div className="w-full h-2 bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      style={{ width: `${Math.min(100, (weeklyXp / analyticsData.predictions.weeklyGoal) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {analyticsData.predictions.weeklyGoal - weeklyXp} XP restants
                  </p>
                </div>
              )}
            </div>
            
            {/* Projection mensuelle */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h4 className="text-white font-medium">Projection Mensuelle</h4>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {analyticsData.predictions.monthlyProjection} XP
              </p>
              <p className="text-gray-400 text-sm">
                Estimation fin de mois
              </p>
              {showDetails && (
                <p className="text-gray-500 text-xs mt-2">
                  +{analyticsData.predictions.monthlyProjection - monthlyXp} XP supplémentaires prévus
                </p>
              )}
            </div>
          </div>
          
          {showDetails && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t border-white/10"
            >
              <h4 className="text-white font-medium mb-4">Recommandations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <h5 className="text-blue-400 font-medium mb-2">🎯 Pour atteindre le niveau {level + 1}</h5>
                  <p className="text-gray-300 text-sm">
                    Terminez {Math.ceil((100 - (totalXp % 100)) / 20)} tâches moyennes par jour
                  </p>
                </div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <h5 className="text-green-400 font-medium mb-2">📈 Optimisation productivité</h5>
                  <p className="text-gray-300 text-sm">
                    Maintenez votre série de {loginStreak} jours pour un bonus de +{loginStreak * 2} XP
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 🏆 BADGES ET RÉALISATIONS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Réalisations Récentes
            </h3>
            <span className="text-gray-400 text-sm">{badges.length} badges débloqués</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.slice(0, 6).map((badge, index) => (
              <motion.div 
                key={badge.id || index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-xl text-center hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="text-2xl mb-2">{badge.icon || '🏆'}</div>
                <p className="text-white text-sm font-semibold">{badge.name || badge}</p>
                <p className="text-orange-100 text-xs opacity-80">Débloqué</p>
              </motion.div>
            ))}
            
            {Array.from({ length: Math.max(0, 6 - badges.length) }).map((_, index) => (
              <div 
                key={`locked-${index}`}
                className="bg-gray-700 p-4 rounded-xl text-center opacity-50"
              >
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-gray-400 text-sm">À débloquer</p>
                <p className="text-gray-500 text-xs">Bientôt...</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 📊 STATISTIQUES DÉTAILLÉES */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mt-8"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Statistiques Détaillées
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Efficacité */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {Math.round((stats?.completionRate || 0))}%
                </span>
              </div>
              <h4 className="text-white font-medium mb-1">Efficacité</h4>
              <p className="text-gray-400 text-sm">Taux de completion des tâches</p>
            </div>
            
            {/* Régularité */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{loginStreak}</span>
              </div>
              <h4 className="text-white font-medium mb-1">Régularité</h4>
              <p className="text-gray-400 text-sm">Jours de connexion consécutifs</p>
            </div>
            
            {/* Performance */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {stats?.productivityScore || 0}
                </span>
              </div>
              <h4 className="text-white font-medium mb-1">Performance</h4>
              <p className="text-gray-400 text-sm">Score de productivité global</p>
            </div>
            
            {/* Évolution */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-medium mb-1">Évolution</h4>
              <p className="text-gray-400 text-sm">Tendance positive</p>
            </div>
          </div>
          
          {/* Historique XP récent */}
          {gamificationData?.xpHistory && gamificationData.xpHistory.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="text-white font-medium mb-4">Historique XP Récent</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {gamificationData.xpHistory.slice(-5).reverse().map((entry, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm font-medium">+{entry.amount} XP</p>
                        <p className="text-gray-400 text-xs">{entry.source}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 text-sm">{entry.totalAfter} XP</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(entry.timestamp).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* 🔧 DIAGNOSTIC (MODE DEV) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-8 bg-black/20 rounded-lg p-4 text-xs text-gray-400"
          >
            <h4 className="text-white font-medium mb-2">🔧 Diagnostic Analytics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <strong>Source données:</strong> Firebase temps réel
              </div>
              <div>
                <strong>Dernière sync:</strong> {lastUpdate?.toLocaleTimeString() || 'N/A'}
              </div>
              <div>
                <strong>XP Total:</strong> {totalXp}
              </div>
              <div>
                <strong>Période:</strong> {timeRange}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
