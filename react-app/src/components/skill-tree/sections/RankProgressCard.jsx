// ==========================================
// components/skill-tree/sections/RankProgressCard.jsx
// COMPOSANT CARTE DE RANG
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Lock } from 'lucide-react';
import { getFullProgressInfo, getRanks } from '../../../core/services/levelService.js';

const RankProgressCard = ({ totalXP }) => {
  const [showRankDetails, setShowRankDetails] = useState(false);
  const progressInfo = useMemo(() => getFullProgressInfo(totalXP), [totalXP]);
  const ranks = useMemo(() => getRanks(), []);
  const ranksArray = useMemo(() =>
    Object.values(ranks).sort((a, b) => a.minLevel - b.minLevel),
    [ranks]
  );

  const { currentRank, nextRank, currentLevel, xpNeeded, rankProgress, xpBoost } = progressInfo;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-5"
    >
      {/* Header du rang actuel */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${currentRank?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center shadow-lg`}
        >
          <span className="text-3xl sm:text-4xl">{currentRank?.icon || '🌱'}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-xl sm:text-2xl font-bold ${currentRank?.textColor || 'text-gray-300'}`}>
              {currentRank?.name || 'Apprenti'}
            </h3>
            {xpBoost > 1 && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg">
                +{Math.round((xpBoost - 1) * 100)}% XP
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">{currentRank?.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-lg font-bold text-white">Niveau {currentLevel}</span>
            <span className="text-gray-500">-</span>
            <span className="text-purple-400 font-medium">{totalXP.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Barre de progression vers le prochain rang */}
      {nextRank && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              <span>{currentRank?.icon}</span>
              <span>{currentRank?.name}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>{nextRank?.icon}</span>
              <span>{nextRank?.name}</span>
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${rankProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${currentRank?.color || 'from-purple-500 to-pink-500'} rounded-full`}
            />
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-gray-500">{Math.round(rankProgress)}% vers {nextRank?.name}</span>
            <span className="text-purple-400">{xpNeeded.toLocaleString()} XP restants</span>
          </div>
        </div>
      )}

      {/* Avantages du rang */}
      {currentRank?.perks && currentRank.perks.length > 0 && (
        <div className="border-t border-white/10 pt-3">
          <div className="text-xs text-gray-500 uppercase mb-2 font-medium">Avantages du rang</div>
          <div className="flex flex-wrap gap-2">
            {currentRank.perks.map((perk, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300"
              >
                {perk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mini timeline des rangs avec dropdown */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <button
          onClick={() => setShowRankDetails(!showRankDetails)}
          className="w-full flex items-center justify-between text-xs text-gray-500 uppercase mb-3 font-medium hover:text-gray-300 transition-colors"
        >
          <span>Progression des Rangs</span>
          <motion.div
            animate={{ rotate: showRankDetails ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4 rotate-90" />
          </motion.div>
        </button>

        {/* Timeline des rangs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {ranksArray.map((rank, idx) => {
            const isPast = currentLevel >= rank.maxLevel;
            const isCurrent = currentLevel >= rank.minLevel && currentLevel <= rank.maxLevel;
            const isFuture = currentLevel < rank.minLevel;

            return (
              <div
                key={rank.id}
                className="flex items-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer
                    ${isCurrent
                      ? `bg-gradient-to-br ${rank.color} ring-2 ring-white/50 shadow-lg`
                      : isPast
                        ? 'bg-white/20'
                        : 'bg-white/5 opacity-50'
                    }
                  `}
                  title={`${rank.name} (Niv. ${rank.minLevel}-${rank.maxLevel})`}
                  onClick={() => setShowRankDetails(!showRankDetails)}
                >
                  <span className={isFuture ? 'grayscale' : ''}>{rank.icon}</span>
                </motion.div>
                {idx < ranksArray.length - 1 && (
                  <div
                    className={`w-2 h-0.5 ${isPast ? 'bg-white/40' : 'bg-white/10'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Details des rangs (deroulant) */}
        <AnimatePresence>
          {showRankDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {ranksArray.map((rank, idx) => {
                  const isPast = currentLevel >= rank.maxLevel;
                  const isCurrent = currentLevel >= rank.minLevel && currentLevel <= rank.maxLevel;
                  const isFuture = currentLevel < rank.minLevel;
                  const xpRequired = (rank.minLevel - 1) * 500;

                  return (
                    <motion.div
                      key={rank.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`
                        p-3 rounded-xl border transition-all
                        ${isCurrent
                          ? `bg-gradient-to-r ${rank.color.replace('from-', 'from-').replace('to-', 'to-')}/20 border-white/30`
                          : isPast
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/[0.02] border-white/5 opacity-60'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`
                            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                            ${isCurrent
                              ? `bg-gradient-to-br ${rank.color}`
                              : isPast
                                ? 'bg-white/20'
                                : 'bg-white/5'
                            }
                          `}
                        >
                          <span className={`text-xl ${isFuture ? 'grayscale' : ''}`}>{rank.icon}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-bold ${rank.textColor || 'text-gray-300'}`}>
                              {rank.name}
                            </h4>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 bg-white/20 text-white text-[10px] rounded font-medium">
                                ACTUEL
                              </span>
                            )}
                            {isPast && !isCurrent && (
                              <Check className="w-4 h-4 text-emerald-400" />
                            )}
                            {isFuture && (
                              <Lock className="w-3 h-3 text-gray-500" />
                            )}
                          </div>

                          <p className="text-xs text-gray-400 mt-0.5">{rank.description}</p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px]">
                            <span className="text-gray-500">
                              Niv. {rank.minLevel}-{rank.maxLevel}
                            </span>
                            <span className="text-gray-500">
                              {xpRequired.toLocaleString()} XP requis
                            </span>
                            {rank.boost > 1 && (
                              <span className="text-emerald-400 font-medium">
                                +{Math.round((rank.boost - 1) * 100)}% XP
                              </span>
                            )}
                          </div>

                          {rank.perks && rank.perks.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {rank.perks.map((perk, perkIdx) => (
                                <span
                                  key={perkIdx}
                                  className={`
                                    px-1.5 py-0.5 rounded text-[10px]
                                    ${isFuture
                                      ? 'bg-white/5 text-gray-500'
                                      : 'bg-white/10 text-gray-300'
                                    }
                                  `}
                                >
                                  {perk}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RankProgressCard;
