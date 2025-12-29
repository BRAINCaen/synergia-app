// ==========================================
// 📁 react-app/src/components/wellbeing/DailyChallenge.jsx
// MINI-DÉFI BIEN-ÊTRE QUOTIDIEN
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Check,
  RefreshCw,
  Clock,
  Award
} from 'lucide-react';

import wellbeingService, { WELLBEING_CHALLENGES } from '../../core/services/wellbeingService.js';

/**
 * 🎯 Carte de défi bien-être quotidien
 * Affiche un défi différent chaque jour, basé sur l'utilisateur
 */
const DailyChallenge = ({ userId, compact = false }) => {
  const [challenge, setChallenge] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [todayCompleted, setTodayCompleted] = useState([]);

  // Charger le défi du jour
  useEffect(() => {
    if (!userId) return;

    const loadChallenge = async () => {
      // Obtenir le défi du jour pour cet utilisateur
      const dailyChallenge = wellbeingService.getDailyChallenge(userId);
      setChallenge(dailyChallenge);

      // Vérifier si déjà complété aujourd'hui
      const completedToday = await wellbeingService.getTodayChallenges(userId);
      setTodayCompleted(completedToday);
      setIsCompleted(completedToday.includes(dailyChallenge.id));
    };

    loadChallenge();
  }, [userId]);

  // Compléter le défi
  const handleComplete = async () => {
    if (!challenge || isCompleted || isCompleting) return;

    setIsCompleting(true);

    try {
      const result = await wellbeingService.completeChallenge(userId, challenge.id);

      if (result.success) {
        setIsCompleted(true);
        setShowSuccess(true);

        // Masquer le message de succès après 3 secondes
        setTimeout(() => setShowSuccess(false), 3000);
      } else if (result.reason === 'already_completed') {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Erreur complétion défi:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  if (!challenge) {
    return null;
  }

  // Mode compact pour les petits espaces
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3 rounded-xl border transition-all ${
          isCompleted
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{challenge.icon}</span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isCompleted ? 'text-green-300' : 'text-white'}`}>
              {challenge.title}
            </p>
            <p className="text-xs text-gray-400 truncate">{challenge.description}</p>
          </div>
          {isCompleted ? (
            <div className="p-1.5 bg-green-500/20 rounded-lg">
              <Check className="w-4 h-4 text-green-400" />
            </div>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium rounded-lg transition-colors"
            >
              {isCompleting ? '...' : 'Fait !'}
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Mode normal
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30'
          : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30'
      }`}
    >
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${isCompleted ? 'text-green-400' : 'text-amber-400'}`} />
            <span className="text-xs font-medium text-gray-400">Défi bien-être du jour</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg">
            <Award className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">+{challenge.xpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 pt-2">
        <div className="flex items-start gap-4">
          <motion.div
            animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
            className={`text-4xl p-3 rounded-xl ${
              isCompleted ? 'bg-green-500/20' : 'bg-white/5'
            }`}
          >
            {challenge.icon}
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3 className={`font-bold mb-1 ${isCompleted ? 'text-green-300' : 'text-white'}`}>
              {challenge.title}
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              {challenge.description}
            </p>

            {/* Bouton action */}
            {!isCompleted ? (
              <motion.button
                onClick={handleComplete}
                disabled={isCompleting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isCompleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>C'est fait !</span>
                  </>
                )}
              </motion.button>
            ) : (
              <div className="flex items-center gap-2 py-2.5 px-4 bg-green-500/20 rounded-xl">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">Défi accompli !</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message de succès */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-5xl mb-2"
              >
                🎉
              </motion.div>
              <p className="text-green-300 font-bold">Bravo !</p>
              <p className="text-green-400/70 text-sm">+{challenge.xpReward} XP gagnés</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge catégorie */}
      <div className="absolute top-4 right-4">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
          isCompleted ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-gray-400'
        }`}>
          {challenge.category}
        </span>
      </div>
    </motion.div>
  );
};

/**
 * 📋 Liste de tous les défis disponibles (pour affichage optionnel)
 */
export const ChallengesList = ({ userId }) => {
  const [completedToday, setCompletedToday] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadCompleted = async () => {
      const completed = await wellbeingService.getTodayChallenges(userId);
      setCompletedToday(completed);
      setLoading(false);
    };

    loadCompleted();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Défis bien-être
        </h3>
        <span className="text-sm text-gray-400">
          {completedToday.length} / {WELLBEING_CHALLENGES.length} complétés
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {WELLBEING_CHALLENGES.map((challenge) => {
          const isCompleted = completedToday.includes(challenge.id);

          return (
            <motion.div
              key={challenge.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{challenge.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${isCompleted ? 'text-green-300' : 'text-white'}`}>
                      {challenge.title}
                    </h4>
                    {isCompleted && <Check className="w-4 h-4 text-green-400" />}
                  </div>
                  <p className="text-xs text-gray-400">{challenge.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400">
                      {challenge.category}
                    </span>
                    <span className="text-xs text-amber-400">+{challenge.xpReward} XP</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyChallenge;
