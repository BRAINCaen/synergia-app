// ==========================================
// react-app/src/components/gamification/LevelProgressCard.jsx
// CARTE DE PROGRESSION DE NIVEAU - Visualisation XP/Niveau
// ==========================================

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  calculateLevel,
  getLevelProgress,
  getRankForLevel,
  getXPForLevel,
  generateLevelGrid
} from '../../core/services/levelService.js';

/**
 * LevelProgressCard - Affiche la progression de niveau detaillee
 */
const LevelProgressCard = ({
  totalXP = 0,
  showHistory = false,
  xpHistory = [],
  compact = false,
  className = ''
}) => {
  const progress = useMemo(() => getLevelProgress(totalXP), [totalXP]);
  const rank = useMemo(() => getRankForLevel(progress.currentLevel), [progress.currentLevel]);

  // Version compacte
  if (compact) {
    return (
      <div className={`bg-gray-800/50 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{rank.icon}</span>
            <span className="text-white font-bold">Niveau {progress.currentLevel}</span>
          </div>
          <span className="text-gray-400 text-sm">
            {totalXP.toLocaleString()} XP
          </span>
        </div>

        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${rank.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress.progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            {progress.xpInCurrentLevel.toLocaleString()} / {progress.xpRequiredForNext.toLocaleString()} XP
          </span>
          <span className="text-xs text-gray-400">
            {Math.round(progress.progress)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 ${className}`}
    >
      {/* En-tete */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📈</span> Progression
        </h3>
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${rank.color} text-white text-sm font-bold`}>
          {rank.icon} Niveau {progress.currentLevel}
        </div>
      </div>

      {/* Cercle de progression principal */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-28 h-28">
          {/* Cercle de fond */}
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="50"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-700"
            />
            <motion.circle
              cx="56"
              cy="56"
              r="50"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 314" }}
              animate={{ strokeDasharray: `${progress.progress * 3.14} 314` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Contenu central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {Math.round(progress.progress)}%
            </span>
            <span className="text-xs text-gray-400">complet</span>
          </div>
        </div>

        {/* Stats detaillees */}
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">XP Total</span>
            <span className="text-white font-bold text-lg">
              {totalXP.toLocaleString()} <span className="text-purple-400">XP</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Ce niveau</span>
            <span className="text-gray-300">
              {progress.xpInCurrentLevel.toLocaleString()} / {progress.xpRequiredForNext.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Pour niveau {progress.currentLevel + 1}</span>
            <span className="text-blue-400 font-medium">
              {progress.xpNeeded.toLocaleString()} XP
            </span>
          </div>
        </div>
      </div>

      {/* Barre de progression lineaire */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Niv. {progress.currentLevel}</span>
          <span>Niv. {progress.currentLevel + 1}</span>
        </div>
        <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-shimmer" />
        </div>
      </div>

      {/* Prochains niveaux */}
      <div className="pt-4 border-t border-gray-700/50">
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          Prochaines etapes
        </h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((offset) => {
            const nextLevel = progress.currentLevel + offset;
            const nextRank = getRankForLevel(nextLevel);
            const xpRequired = getXPForLevel(nextLevel);
            const xpNeeded = xpRequired - totalXP;
            const isNewRank = nextLevel === nextRank.minLevel;

            return (
              <motion.div
                key={nextLevel}
                className={`
                  flex-shrink-0 px-3 py-2 rounded-lg text-center min-w-[80px]
                  ${isNewRank
                    ? `bg-gradient-to-br ${nextRank.color}`
                    : 'bg-gray-700/50'
                  }
                `}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-lg font-bold text-white">
                  {isNewRank ? nextRank.icon : `${nextLevel}`}
                </div>
                <div className="text-xs text-gray-300">
                  {isNewRank ? nextRank.name : `Niv. ${nextLevel}`}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  +{xpNeeded.toLocaleString()} XP
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Historique XP recent */}
      {showHistory && xpHistory && xpHistory.length > 0 && (
        <div className="pt-4 border-t border-gray-700/50 mt-4">
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            XP Recent
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <AnimatePresence>
              {xpHistory.slice(0, 5).map((entry, index) => (
                <motion.div
                  key={entry.timestamp || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <span className="text-gray-400">{entry.source}</span>
                  <span className="text-green-400 font-medium">+{entry.amount} XP</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
};

/**
 * LevelBadge - Badge de niveau simple
 */
export const LevelBadge = ({ level = 1, size = 'md', showXP = false, totalXP = 0 }) => {
  const rank = getRankForLevel(level);

  const sizes = {
    sm: 'text-sm px-2 py-0.5',
    md: 'text-base px-3 py-1',
    lg: 'text-lg px-4 py-2'
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${rank.color} text-white font-medium ${sizes[size]}`}>
      <span>{rank.icon}</span>
      <span>Niv. {level}</span>
      {showXP && (
        <span className="text-white/70">({totalXP.toLocaleString()} XP)</span>
      )}
    </div>
  );
};

/**
 * LevelGrid - Grille des niveaux pour reference
 */
export const LevelGrid = ({ currentLevel = 1, maxDisplay = 20 }) => {
  const grid = useMemo(() => generateLevelGrid(maxDisplay), [maxDisplay]);

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-4">
        Grille des Niveaux
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-left">
              <th className="pb-2">Niveau</th>
              <th className="pb-2">XP Requis</th>
              <th className="pb-2">XP Suivant</th>
              <th className="pb-2">Rang</th>
            </tr>
          </thead>
          <tbody>
            {grid.map((row) => (
              <tr
                key={row.level}
                className={`
                  border-t border-gray-700/30
                  ${row.level === currentLevel ? 'bg-blue-900/30' : ''}
                  ${row.level < currentLevel ? 'text-gray-500' : 'text-gray-300'}
                `}
              >
                <td className="py-2 font-medium">
                  {row.level === currentLevel && '→ '}
                  {row.level}
                </td>
                <td className="py-2">{row.xpRequired.toLocaleString()}</td>
                <td className="py-2">+{row.xpToNext.toLocaleString()}</td>
                <td className="py-2">
                  <span className="mr-1">{row.rankIcon}</span>
                  {row.rank}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * XPGainAnimation - Animation de gain d'XP
 */
export const XPGainAnimation = ({ amount, visible, onComplete }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -50, scale: 1 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.8 }}
          onAnimationComplete={onComplete}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="text-4xl font-bold text-green-400 drop-shadow-lg flex items-center gap-2">
            <span>+{amount}</span>
            <span className="text-yellow-400">XP</span>
            <span className="text-2xl">✨</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelProgressCard;
