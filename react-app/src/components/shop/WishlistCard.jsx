// ==========================================
// 📁 react-app/src/components/shop/WishlistCard.jsx
// CARTE OBJECTIF D'ÉCONOMIE - SYNERGIA v4.0 - MODULE 5
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, TrendingUp, Zap, X, Star, ChevronRight, Clock, Trophy
} from 'lucide-react';

/**
 * 🎯 CARTE OBJECTIF D'ÉCONOMIE (WISHLIST)
 * Permet de définir un objectif de récompense à atteindre
 */
const WishlistCard = ({
  targetReward,
  currentXP,
  onRemoveTarget,
  onViewReward,
  xpPerMonth = 1000 // Estimation XP moyen par mois
}) => {
  const [timeEstimate, setTimeEstimate] = useState('');

  useEffect(() => {
    if (targetReward) {
      const missing = targetReward.xpCost - currentXP;
      if (missing <= 0) {
        setTimeEstimate('Disponible !');
      } else {
        const months = Math.ceil(missing / xpPerMonth);
        if (months < 1) {
          const weeks = Math.ceil((missing / xpPerMonth) * 4);
          setTimeEstimate(`~${weeks} semaine${weeks > 1 ? 's' : ''}`);
        } else if (months === 1) {
          setTimeEstimate('~1 mois');
        } else {
          setTimeEstimate(`~${months} mois`);
        }
      }
    }
  }, [targetReward, currentXP, xpPerMonth]);

  if (!targetReward) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-dashed border-white/20 rounded-xl p-6 text-center"
      >
        <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-400 mb-2">
          Définir un objectif
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Cliquez sur une récompense et choisissez "Je veux ça !" pour suivre votre progression.
        </p>
      </motion.div>
    );
  }

  const progressPercent = Math.min((currentXP / targetReward.xpCost) * 100, 100);
  const missingXP = Math.max(0, targetReward.xpCost - currentXP);
  const isAchievable = currentXP >= targetReward.xpCost;

  // Couleur selon progression
  const getProgressColor = () => {
    if (isAchievable) return 'from-green-500 to-emerald-400';
    if (progressPercent >= 75) return 'from-yellow-500 to-orange-400';
    if (progressPercent >= 50) return 'from-blue-500 to-cyan-400';
    return 'from-purple-500 to-pink-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-br from-slate-800 to-slate-900 border rounded-xl overflow-hidden ${
        isAchievable ? 'border-green-500/50 shadow-lg shadow-green-500/10' : 'border-white/20'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">Mon objectif</span>
          </div>
          <button
            onClick={onRemoveTarget}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
            title="Retirer l'objectif"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Récompense ciblée */}
        <div
          className="flex items-center gap-4 mb-4 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
          onClick={() => onViewReward?.(targetReward)}
        >
          <motion.span
            className="text-4xl"
            animate={isAchievable ? {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ duration: 1, repeat: isAchievable ? Infinity : 0, repeatDelay: 2 }}
          >
            {targetReward.icon}
          </motion.span>
          <div className="flex-1">
            <h4 className="font-semibold text-white">{targetReward.name}</h4>
            <p className="text-sm text-gray-400">{targetReward.category}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400 flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              Progression
            </span>
            <span className={isAchievable ? 'text-green-400 font-semibold' : 'text-gray-300'}>
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="h-4 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 text-gray-500">
            <span>{currentXP.toLocaleString()} XP</span>
            <span>{targetReward.xpCost.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              Manque
            </div>
            <span className={`font-bold ${isAchievable ? 'text-green-400' : 'text-white'}`}>
              {isAchievable ? '0' : missingXP.toLocaleString()} XP
            </span>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Clock className="w-3 h-3" />
              Estimation
            </div>
            <span className={`font-bold ${isAchievable ? 'text-green-400' : 'text-white'}`}>
              {timeEstimate}
            </span>
          </div>
        </div>

        {/* Message si objectif atteint */}
        <AnimatePresence>
          {isAchievable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <motion.button
                onClick={() => onViewReward?.(targetReward)}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(34, 197, 94, 0.4)',
                    '0 0 0 10px rgba(34, 197, 94, 0)',
                    '0 0 0 0 rgba(34, 197, 94, 0)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="w-5 h-5" />
                Objectif atteint ! Demander
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Effet brillant si atteint */}
      {isAchievable && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(34, 197, 94, 0.3) 50%, transparent 70%)'
          }}
        />
      )}
    </motion.div>
  );
};

export default WishlistCard;
