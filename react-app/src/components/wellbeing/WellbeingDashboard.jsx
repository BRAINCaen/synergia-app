// ==========================================
// 📁 react-app/src/components/wellbeing/WellbeingDashboard.jsx
// DASHBOARD BIEN-ÊTRE POUR MANAGERS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Calendar,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  Info
} from 'lucide-react';

import wellbeingService from '../../core/services/wellbeingService.js';

/**
 * Labels et couleurs pour les niveaux de mood
 */
const MOOD_INFO = {
  1: { label: 'Difficile', emoji: '😫', color: 'from-red-500 to-red-600', textColor: 'text-red-400', bgColor: 'bg-red-500/20' },
  2: { label: 'Compliqué', emoji: '😕', color: 'from-orange-500 to-orange-600', textColor: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  3: { label: 'Normal', emoji: '😐', color: 'from-yellow-500 to-yellow-600', textColor: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  4: { label: 'Bien', emoji: '🙂', color: 'from-green-500 to-green-600', textColor: 'text-green-400', bgColor: 'bg-green-500/20' },
  5: { label: 'Excellent', emoji: '😄', color: 'from-emerald-500 to-emerald-600', textColor: 'text-emerald-400', bgColor: 'bg-emerald-500/20' }
};

/**
 * 📊 Carte de statistique principale
 */
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-xs mb-1">{title}</p>
        <p className={`text-2xl font-bold ${color || 'text-white'}`}>{value}</p>
        {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2 rounded-lg ${color ? color.replace('text-', 'bg-').replace('400', '500/20') : 'bg-white/10'}`}>
        <Icon className={`w-5 h-5 ${color || 'text-white'}`} />
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-1 mt-2">
        {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
        {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
        {trend === 'stable' && <Minus className="w-3 h-3 text-gray-400" />}
        <span className={`text-xs ${
          trend === 'up' ? 'text-green-400' :
          trend === 'down' ? 'text-red-400' :
          'text-gray-400'
        }`}>
          {trend === 'up' ? 'En hausse' : trend === 'down' ? 'En baisse' : 'Stable'}
        </span>
      </div>
    )}
  </motion.div>
);

/**
 * 📊 Distribution des moods
 */
const MoodDistribution = ({ distribution, total }) => {
  if (!distribution || total === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Meh className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Pas encore de données</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Object.entries(distribution).sort((a, b) => parseInt(b[0]) - parseInt(a[0])).map(([mood, count]) => {
        const moodInfo = MOOD_INFO[mood];
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <div key={mood} className="flex items-center gap-3">
            <span className="text-2xl w-8">{moodInfo?.emoji || '😐'}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">{moodInfo?.label || 'Inconnu'}</span>
                <span className="text-sm text-gray-400">{count} ({percentage}%)</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${moodInfo?.color || 'from-gray-500 to-gray-600'}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * 📈 Graphique des moyennes quotidiennes
 */
const DailyAveragesChart = ({ dailyAverages }) => {
  if (!dailyAverages || Object.keys(dailyAverages).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Pas assez de données</p>
      </div>
    );
  }

  const dates = Object.keys(dailyAverages).sort().slice(-7);
  const values = dates.map(d => dailyAverages[d]);
  const maxValue = 5;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 h-32">
        {dates.map((date, index) => {
          const value = values[index];
          const height = (value / maxValue) * 100;
          const moodInfo = MOOD_INFO[Math.round(value)];
          const day = new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' });

          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{value}</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`w-full rounded-t-lg bg-gradient-to-t ${moodInfo?.color || 'from-gray-500 to-gray-600'}`}
                style={{ minHeight: '8px' }}
              />
              <span className="text-xs text-gray-500 capitalize">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 🏠 DASHBOARD PRINCIPAL BIEN-ÊTRE
 */
const WellbeingDashboard = ({ compact = false }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  // Charger les statistiques
  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const moodStats = await wellbeingService.getTeamMoodStats(selectedPeriod);
      setStats(moodStats);
    } catch (err) {
      console.error('❌ Erreur chargement stats bien-être:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  // Déterminer la couleur en fonction de la moyenne
  const getMoodColor = (value) => {
    if (!value || value === 0) return 'text-gray-400';
    if (value >= 4) return 'text-green-400';
    if (value >= 3) return 'text-yellow-400';
    if (value >= 2) return 'text-orange-400';
    return 'text-red-400';
  };

  // État de chargement
  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
        <p className="text-red-300">{error}</p>
        <button
          onClick={loadStats}
          className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Mode compact pour intégration dans d'autres pages
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            Bien-être équipe
          </h3>
          <span className="text-xs text-gray-400">{selectedPeriod}j</span>
        </div>

        {stats?.totalResponses > 0 ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="text-center">
                <p className={`text-2xl font-bold ${getMoodColor(stats.averageMood)}`}>
                  {stats.averageMood}
                </p>
                <p className="text-xs text-gray-400">Moyenne</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{stats.totalResponses}</p>
                <p className="text-xs text-gray-400">Réponses</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {stats.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
              {stats.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
              {stats.trend === 'stable' && <Minus className="w-3 h-3 text-gray-400" />}
              <span className={
                stats.trend === 'up' ? 'text-green-400' :
                stats.trend === 'down' ? 'text-red-400' :
                'text-gray-400'
              }>
                {stats.trend === 'up' ? 'Tendance positive' :
                 stats.trend === 'down' ? 'Tendance négative' :
                 'Tendance stable'}
              </span>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm text-center py-2">Aucune donnée</p>
        )}
      </motion.div>
    );
  }

  // Mode complet
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Bien-être de l'équipe</h2>
            <p className="text-gray-400 text-sm">Données anonymisées des derniers {selectedPeriod} jours</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sélecteur de période */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={7}>7 jours</option>
            <option value={14}>14 jours</option>
            <option value={30}>30 jours</option>
          </select>

          <button
            onClick={loadStats}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Avertissement anonymisation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-blue-300 font-medium">Données anonymisées</p>
          <p className="text-blue-200/70">Les réponses individuelles ne sont jamais associées aux noms. Seules les statistiques agrégées sont affichées.</p>
        </div>
      </motion.div>

      {/* Pas de données */}
      {(!stats || stats.totalResponses === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
        >
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Pas encore de données</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Les employés pourront indiquer leur humeur lors du dépointage.
            Les premières statistiques apparaîtront dès les premières réponses.
          </p>
        </motion.div>
      )}

      {/* Statistiques principales */}
      {stats && stats.totalResponses > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Humeur moyenne"
              value={stats.averageMood}
              subtitle="Sur 5"
              icon={stats.averageMood >= 3.5 ? Smile : stats.averageMood >= 2.5 ? Meh : Frown}
              color={getMoodColor(stats.averageMood)}
              trend={stats.trend}
            />
            <StatCard
              title="Réponses collectées"
              value={stats.totalResponses}
              subtitle={`Sur ${selectedPeriod} jours`}
              icon={Users}
              color="text-purple-400"
            />
            <StatCard
              title="Jours avec données"
              value={Object.keys(stats.dailyAverages || {}).length}
              subtitle="Jours actifs"
              icon={Calendar}
              color="text-blue-400"
            />
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution des moods */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5"
            >
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Distribution des ressentis
              </h3>
              <MoodDistribution
                distribution={stats.moodDistribution}
                total={stats.totalResponses}
              />
            </motion.div>

            {/* Évolution quotidienne */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5"
            >
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Évolution (7 derniers jours)
              </h3>
              <DailyAveragesChart dailyAverages={stats.dailyAverages} />
            </motion.div>
          </div>

          {/* Alerte si tendance négative */}
          {stats.trend === 'down' && stats.averageMood < 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0" />
                <div>
                  <h4 className="text-orange-300 font-semibold">Attention : tendance à surveiller</h4>
                  <p className="text-orange-200/70 text-sm mt-1">
                    La moyenne de bien-être de l'équipe est en baisse. Envisagez d'organiser un point d'équipe
                    ou de proposer des actions de soutien.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default WellbeingDashboard;
