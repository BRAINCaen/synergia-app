// ==========================================
// 📁 react-app/src/components/stats/StatsCards.jsx
// CARTES DE STATISTIQUES - SYNERGIA v4.0 - MODULE 7
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap, TrendingUp, TrendingDown, Calendar, Flame, Trophy,
  Target, Star, Clock, Award, Crown, Sparkles
} from 'lucide-react';

/**
 * 📊 CARTE STAT SIMPLE
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon = Zap,
  color = 'blue',
  trend,
  trendValue,
  delay = 0
}) => {
  const gradients = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-violet-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-rose-500',
    pink: 'from-pink-500 to-rose-500'
  };

  const bgGradients = {
    blue: 'from-blue-500/10 to-cyan-500/10',
    purple: 'from-purple-500/10 to-violet-500/10',
    green: 'from-green-500/10 to-emerald-500/10',
    yellow: 'from-yellow-500/10 to-orange-500/10',
    red: 'from-red-500/10 to-rose-500/10',
    pink: 'from-pink-500/10 to-rose-500/10'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`
        relative overflow-hidden rounded-2xl p-5
        bg-gradient-to-br ${bgGradients[color]}
        border border-white/10
        backdrop-blur-sm
      `}
    >
      {/* Effet brillant */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative">
        {/* En-tête avec icône */}
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradients[color]} shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Tendance */}
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {trendValue && <span>{trendValue}</span>}
            </div>
          )}
        </div>

        {/* Valeur */}
        <div className="text-3xl font-bold text-white mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {/* Titre */}
        <div className="text-sm text-gray-400 font-medium">{title}</div>

        {/* Sous-titre */}
        {subtitle && (
          <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * 🏆 CARTE RECORD
 */
export const RecordCard = ({
  title,
  value,
  date,
  icon: Icon = Trophy,
  color = 'yellow',
  delay = 0
}) => {
  const colors = {
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: 'text-yellow-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'text-green-400' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-400' }
  };

  const c = colors[color] || colors.yellow;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03 }}
      className={`
        p-4 rounded-xl ${c.bg} border ${c.border}
        flex items-center gap-4
      `}
    >
      <div className={`p-3 rounded-xl bg-white/10 ${c.icon}`}>
        <Icon className="w-6 h-6" />
      </div>

      <div className="flex-1">
        <div className="text-xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-sm text-gray-400">{title}</div>
        {date && (
          <div className="text-xs text-gray-500 mt-0.5">{date}</div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * 🔥 CARTE SÉRIE (STREAK)
 */
export const StreakCard = ({ currentStreak = 0, longestStreak = 0, delay = 0 }) => {
  const isOnFire = currentStreak >= 7;
  const isNew = currentStreak === longestStreak && currentStreak > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`
        relative overflow-hidden rounded-2xl p-6
        ${isOnFire
          ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30'
          : 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/10'
        }
        border
      `}
    >
      {/* Animation flamme si série >= 7 */}
      {isOnFire && (
        <motion.div
          className="absolute top-4 right-4"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Flame className="w-8 h-8 text-orange-400" />
        </motion.div>
      )}

      <div className="flex items-center gap-4">
        {/* Icône principale */}
        <div className={`
          p-4 rounded-2xl
          ${isOnFire
            ? 'bg-gradient-to-br from-orange-500 to-red-500'
            : 'bg-gradient-to-br from-blue-500 to-purple-500'
          }
        `}>
          <Flame className="w-8 h-8 text-white" />
        </div>

        {/* Compteur */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{currentStreak}</span>
            <span className="text-lg text-gray-400">jour{currentStreak > 1 ? 's' : ''}</span>
          </div>
          <div className="text-sm text-gray-400">Série actuelle</div>

          {/* Badge nouveau record */}
          {isNew && currentStreak > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full"
            >
              <Crown className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-medium">Nouveau record!</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Record */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-sm text-gray-500">Meilleure série</span>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-lg font-bold text-yellow-400">{longestStreak} jours</span>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * ⚡ CARTE XP AUJOURD'HUI
 */
export const TodayXPCard = ({ todayXP = 0, dailyGoal = 50, eventsToday = 0, delay = 0 }) => {
  const progress = Math.min((todayXP / dailyGoal) * 100, 100);
  const isGoalReached = todayXP >= dailyGoal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`
        relative overflow-hidden rounded-2xl p-6
        ${isGoalReached
          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30'
          : 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20'
        }
        border
      `}
    >
      {/* Effet confetti si objectif atteint */}
      {isGoalReached && (
        <motion.div
          className="absolute top-3 right-3"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Sparkles className="w-6 h-6 text-green-400" />
        </motion.div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">XP Aujourd'hui</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{todayXP}</span>
            <span className="text-lg text-gray-500">/ {dailyGoal}</span>
          </div>
        </div>

        <div className={`
          p-3 rounded-xl
          ${isGoalReached
            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
            : 'bg-gradient-to-br from-yellow-500 to-orange-500'
          }
        `}>
          <Zap className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-3">
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isGoalReached
                ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                : 'bg-gradient-to-r from-yellow-500 to-orange-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: delay + 0.3 }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {eventsToday} action{eventsToday > 1 ? 's' : ''} aujourd'hui
        </span>
        {isGoalReached ? (
          <span className="text-green-400 font-medium flex items-center gap-1">
            <Award className="w-4 h-4" />
            Objectif atteint!
          </span>
        ) : (
          <span className="text-gray-400">
            Encore {dailyGoal - todayXP} XP
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
