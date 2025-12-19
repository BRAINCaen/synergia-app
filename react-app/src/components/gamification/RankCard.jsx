// ==========================================
// react-app/src/components/gamification/RankCard.jsx
// CARTE DE RANG - Affichage du rang utilisateur
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { RANKS, getRankForLevel, getNextRank, getXPForLevel } from '../../core/services/levelService.js';

/**
 * RankCard - Affiche le rang actuel avec progression vers le suivant
 */
const RankCard = ({
  level = 1,
  totalXP = 0,
  showNextRank = true,
  compact = false,
  className = ''
}) => {
  const currentRank = getRankForLevel(level);
  const nextRank = getNextRank(currentRank);

  // Calculer la progression vers le prochain rang
  let rankProgress = 100;
  let xpToNextRank = 0;
  let levelsToNextRank = 0;

  if (nextRank) {
    const xpForNextRank = getXPForLevel(nextRank.minLevel);
    xpToNextRank = Math.max(0, xpForNextRank - totalXP);
    levelsToNextRank = nextRank.minLevel - level;

    const xpForCurrentRankStart = getXPForLevel(currentRank.minLevel);
    const totalXpForRank = xpForNextRank - xpForCurrentRankStart;
    const xpInRank = totalXP - xpForCurrentRankStart;

    rankProgress = Math.min((xpInRank / totalXpForRank) * 100, 100);
  }

  // Version compacte
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-2xl">{currentRank.icon}</span>
        <div>
          <span className={`font-bold ${currentRank.textColor}`}>
            {currentRank.name}
          </span>
          <span className="text-gray-400 text-sm ml-1">Niv. {level}</span>
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
      {/* En-tete avec rang actuel */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${currentRank.color} flex items-center justify-center shadow-lg`}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-3xl">{currentRank.icon}</span>
          </motion.div>
          <div>
            <h3 className={`text-xl font-bold ${currentRank.textColor}`}>
              {currentRank.name}
            </h3>
            <p className="text-gray-400 text-sm">
              Niveau {level} • {totalXP.toLocaleString()} XP
            </p>
          </div>
        </div>

        {/* Badge de rang */}
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${currentRank.color} text-white text-sm font-medium`}>
          Rang {Object.keys(RANKS).indexOf(currentRank.id) + 1}/8
        </div>
      </div>

      {/* Description du rang */}
      <p className="text-gray-300 text-sm mb-4 italic">
        "{currentRank.description}"
      </p>

      {/* Avantages du rang */}
      <div className="mb-4">
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Avantages du rang
        </h4>
        <div className="flex flex-wrap gap-2">
          {currentRank.perks.map((perk, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700/50 rounded-md text-xs text-gray-300"
            >
              {perk}
            </span>
          ))}
        </div>
      </div>

      {/* Progression vers le prochain rang */}
      {showNextRank && nextRank && (
        <div className="pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Prochain rang:</span>
              <span className={`font-medium ${nextRank.textColor}`}>
                {nextRank.icon} {nextRank.name}
              </span>
            </div>
            <span className="text-gray-500 text-xs">
              Dans {levelsToNextRank} niveau{levelsToNextRank > 1 ? 'x' : ''}
            </span>
          </div>

          {/* Barre de progression */}
          <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${nextRank.color} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${rankProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white drop-shadow-md">
                {Math.round(rankProgress)}%
              </span>
            </div>
          </div>

          <p className="text-gray-500 text-xs mt-2 text-center">
            {xpToNextRank.toLocaleString()} XP restants pour atteindre {nextRank.name}
          </p>
        </div>
      )}

      {/* Rang maximum atteint */}
      {showNextRank && !nextRank && (
        <div className="pt-4 border-t border-gray-700/50 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
          >
            <span className="text-4xl">👑</span>
          </motion.div>
          <p className="text-amber-400 font-bold mt-2">
            Rang Maximum Atteint !
          </p>
          <p className="text-gray-400 text-sm">
            Vous avez transcende tous les defis
          </p>
        </div>
      )}
    </motion.div>
  );
};

/**
 * RankBadge - Version badge simple du rang
 */
export const RankBadge = ({ level = 1, size = 'md', showLevel = true }) => {
  const rank = getRankForLevel(level);

  const sizes = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-14 h-14 text-3xl'
  };

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={`${sizes[size]} rounded-lg bg-gradient-to-br ${rank.color} flex items-center justify-center shadow-md`}
        whileHover={{ scale: 1.1 }}
        title={`${rank.name} - Niveau ${level}`}
      >
        <span>{rank.icon}</span>
      </motion.div>
      {showLevel && (
        <div className="flex flex-col">
          <span className={`text-sm font-bold ${rank.textColor}`}>
            {rank.name}
          </span>
          <span className="text-xs text-gray-500">Niv. {level}</span>
        </div>
      )}
    </div>
  );
};

/**
 * AllRanksDisplay - Affiche tous les rangs disponibles
 */
export const AllRanksDisplay = ({ currentLevel = 1 }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white mb-4">
        Rangs de la Guilde
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.values(RANKS).map((rank) => {
          const isUnlocked = currentLevel >= rank.minLevel;
          const isCurrent = currentLevel >= rank.minLevel && currentLevel <= rank.maxLevel;

          return (
            <motion.div
              key={rank.id}
              className={`
                relative p-4 rounded-xl border transition-all
                ${isCurrent
                  ? `bg-gradient-to-br ${rank.color} border-transparent`
                  : isUnlocked
                    ? 'bg-gray-800/50 border-gray-700/50'
                    : 'bg-gray-900/50 border-gray-800/50 opacity-50'
                }
              `}
              whileHover={isUnlocked ? { scale: 1.02 } : {}}
            >
              {isCurrent && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                  ACTUEL
                </div>
              )}

              <div className="text-center">
                <span className={`text-3xl ${!isUnlocked ? 'grayscale' : ''}`}>
                  {rank.icon}
                </span>
                <h4 className={`font-bold mt-2 ${isCurrent ? 'text-white' : rank.textColor}`}>
                  {rank.name}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Niv. {rank.minLevel}{rank.maxLevel < 999 ? `-${rank.maxLevel}` : '+'}
                </p>
                {!isUnlocked && (
                  <p className="text-xs text-gray-500 mt-2">
                    {rank.minLevel - currentLevel} niveaux restants
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RankCard;
